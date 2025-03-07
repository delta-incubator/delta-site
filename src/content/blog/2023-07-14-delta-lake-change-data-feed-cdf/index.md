---
title: Delta Lake Change Data Feed (CDF)
description: This blog shows how to enable and use the Delta Lake Change Data Feed.
thumbnail: "./thumbnail.png"
author:
  - nick-karpov
  - matthew-powers
publishedAt: 2023-07-14
---

The Delta Lake Change Data Feed (CDF) allows you to automatically track Delta table row-level changes.

Delta Lake’s implementation of the Change Data Feed is fast, scalable, and reliable.

The Change Data Feed is useful for auditing, quality control, debugging, and intelligent downstream updates. This blog post shows you how to enable the Change Data Feed and demonstrates common workflows in production data settings.

Let’s start with a simple example that shows how to enable the Change Data Feed when creating a Delta table and how to query the CDF. See [this notebook](https://github.com/delta-io/delta-examples/blob/master/notebooks/pyspark/change-data-feed.ipynb) if you would like to follow along with these computations.

## Delta Lake Change Data Feed Example

This section demonstrates how to create a Delta table with the CDF enabled and read the row level change information that’s contained in the feed.

Let’s start by creating a table named `students` that has `first_name`, and `age` fields.

```
spark.sql(
    "CREATE TABLE people (first_name STRING, age LONG) USING delta TBLPROPERTIES (delta.enableChangeDataFeed = true)"
)
```

Let’s append some data to the Delta table:

```
df = spark.createDataFrame([("Bob", 23), ("Sue", 25), ("Jim", 27)]).toDF(
    "first_name", "age"
)

df.write.mode("append").format("delta").saveAsTable("people")
```

Now let’s delete a row of data from the Delta table:

```
delta_table = DeltaTable.forName(spark, "people")
delta_table.delete(F.col("first_name") == "Sue")
```

Let’s query the Change Data Feed to see what data it contains:

```
(
    spark.read.format("delta")
    .option("readChangeFeed", "true")
    .option("startingVersion", 0)
    .table("people")
    .show(truncate=False)
)

+----------+---+------------+---------------+-----------------------+
|first_name|age|_change_type|_commit_version|_commit_timestamp      |
+----------+---+------------+---------------+-----------------------+
|Sue       |25 |delete      |2              |2023-04-20 08:35:53.303|
|Bob       |23 |insert      |1              |2023-04-20 08:33:19.561|
|Sue       |25 |insert      |1              |2023-04-20 08:33:19.561|
|Jim       |27 |insert      |1              |2023-04-20 08:33:19.561|
+----------+---+------------+---------------+-----------------------+
```

The Change Data Feed maintains a record of all the row-level changes made to the Delta table.

Now let’s see how Delta Lake implements the CDF under the hood.

## Why the Delta Lake Change Data Feed is scalable

Delta tables are designed to store a lot of data and so the Delta Lake CDF is also designed to be scalable.

The Delta Lake CDF is implemented such that it’s suitable for big datasets, so you’ll never have to worry about a Change Data Feeds that grows too large. The CDF entries don’t normally add a lot of overhead to write operations.

Here are the files that are contained in the Delta table from the previous section:

```
spark-warehouse/people
├── _change_data
│   └── cdc-00000-1fedcc32-6734-48c2-ab4e-97c5ba65f2f4.c000.snappy.parquet
├── _delta_log
│   ├── 00000000000000000000.json
│   ├── 00000000000000000001.json
│   └── 00000000000000000002.json
├── part-00000-a90e51ff-c595-47d2-a2b3-c1c161102e8e-c000.snappy.parquet
└── part-00000-edd0d32f-3a48-416a-8f3b-bcce9eb5aa25.c000.snappy.parquet
```

Notice that the information specifically required for the Change Data Feed is stored in the `_change_data` folder.

The `_delta_log` has three entries corresponding to the following transactions:

- `00000000000000000000.json (`shorthand `00.json)`: Transaction for creating the Delta table with the Change Data Feed enabled
- `01.json` : Inserting data to the Delta table
- `02.json` : Deleting rows from the Delta table

The CDF is implemented intelligently, so the `01.json` transaction doesn’t add additional Parquet files to the Delta table. The insert transactions can be inferred from the main Delta table Parquet files and the data doesn’t need to be duplicated. There would be no reason to unnecessarily add files with duplicate data to the `_change_data` folder and blow up the overall size of the Delta table.

The `02.json` transaction requires a Parquet file to be added to the `_change_data` folder. This Parquet file will contain a single row of data:

```
+----------+---+------------+
|first_name|age|_change_type|
+----------+---+------------+
|       Sue| 25|      delete|
+----------+---+------------+
```

Here’s an abbreviated representation of the `02.json` transaction log entry:

```
{
  "commitInfo": {
    "timestamp": 1685274696904,
    "operation": "DELETE",
    …
  }
}
{
  "remove": {
    "path": "part-00000-a90e51ff-c595-47d2-a2b3-c1c161102e8e-c000.snappy.parquet",
    …
  }
}
{
  "add": {
    "path": "part-00000-edd0d32f-3a48-416a-8f3b-bcce9eb5aa25.c000.snappy.parquet",
    …
  }
}
{
  "cdc": {
    "path": "_change_data/cdc-00000-1fedcc32-6734-48c2-ab4e-97c5ba65f2f4.c000.snappy.parquet",
    "partitionValues": {},
    "size": 997,
    "dataChange": false
  }
}
```

The changes to the Change Data Feed are recorded in the transaction log, like other changes to the Delta table.

This section provided a good conceptual overview of how the Change Data Feed is implemented. Let’s take at how to use the CDF to perform better incremental updates.

## Delta Lake Change Data Feed for incremental updates

The Delta Lake CDF can be used to minimally update downstream aggregations rather than recomputing entire tables.

Suppose you have another table that tracks the cumulative purchases by customer. This aggregation is incrementally updated on a daily basis.

Create the `customer_purchases` table with the Change Data Feed enabled:

```
spark.sql(
    """
CREATE TABLE IF NOT EXISTS customer_purchases (customer_id LONG, transaction_date DATE, price DOUBLE)
USING delta
TBLPROPERTIES (delta.enableChangeDataFeed = true)
"""
)
```

Now append some data to the `customer_purchases` table:

```
df = spark.createDataFrame(
    [
        (1, datetime.date(2023, 1, 1), 2.1),
        (2, datetime.date(2023, 1, 5), 3.2),
        (3, datetime.date(2023, 1, 8), 4.4),
        (1, datetime.date(2023, 1, 8), 5.5),
    ]
).toDF("customer_id", "transaction_date", "price")

df.write.mode("append").format("delta").saveAsTable("customer_purchases")
```

Now create a `cumulative_purchases` table that tracks the cumulative purchases for each customer:

```
spark.sql(
    """
CREATE TABLE IF NOT EXISTS cumulative_purchases (customer_id LONG, last_transaction DATE, purchases DOUBLE)
USING delta
"""
)
```

Now populate the `cumulative_purchases` table:

```
def agg_customer_purchases(df):
    return df.groupBy("customer_id").agg(
        F.max("transaction_date").alias("last_transaction"),
        F.sum("price").alias("purchases"),
    )

spark.table("customer_purchases").transform(agg_customer_purchases).write.format(
    "delta"
).mode("append").saveAsTable("cumulative_purchases")
```

Inspect the contents of the `cumulative_purchases` table to make sure it’s been properly populated:

```
spark.sql("select * from cumulative_purchases").show()

+-----------+----------------+---------+
|customer_id|last_transaction|purchases|
+-----------+----------------+---------+
|          1|      2023-01-08|      7.6|
|          3|      2023-01-08|      4.4|
|          2|      2023-01-05|      3.2|
+-----------+----------------+---------+
```

Create a DataFrame with another set of customer purchases, one of which is a duplicate of a purchase that’s already been counted:

```
df = spark.createDataFrame(
    [
        (1, datetime.date(2023, 1, 1), 2.1),  # duplicate transaction from earlier
        (1, datetime.date(2023, 1, 12), 10.1),
        (1, datetime.date(2023, 1, 15), 12.2),
        (3, datetime.date(2023, 1, 22), 14.4),
    ]
).toDF("customer_id", "transaction_date", "price")
```

Minimally update the `cumulative_purchases` with the new data by leveraging the Change Data Feed:

```
cdf = (
    spark.read.format("delta")
    .option("readChangeFeed", "true")
    .option("startingVersion", 0)
    .table("customer_purchases")
)

new_transactions = df.join(
    cdf, ["customer_id", "transaction_date", "price"], "leftanti"
)

new_df = new_transactions.transform(agg_customer_purchases)

cumulative_purchases_table = DeltaTable.forName(spark, "cumulative_purchases")

cumulative_purchases_table.alias("target").merge(
    new_df.alias("source"), "target.customer_id = source.customer_id"
).whenMatchedUpdate(
    set={"purchases": "source.purchases + target.purchases"}
).whenNotMatchedInsertAll().execute()
```

Look at the contents of the `cumulative_purchases` table to make sure it’s been incrementally updated properly, without counting the duplicate record.

```
cumulative_purchases_table.toDF().show()

+-----------+----------------+---------+
|customer_id|last_transaction|purchases|
+-----------+----------------+---------+
|          1|      2023-01-08|     29.9|
|          2|      2023-01-05|      3.2|
|          3|      2023-01-08|     18.8|
+-----------+----------------+---------+
```

Without the Change Data Feed, you’d need to completely rebuild the aggregation table every time the deduplication job takes place. With CDF enabled, you can identify the rows that are removed in the `customer_purchases` table and minimally update the `cumulative_purchases` table for the customers with a row that was deduplicated.

Rebuilding entire aggregations can be quite expensive. Minimally updating aggregations can save time and money. See here to learn more about [how Databricks provides advanced materialized view functionality](https://www.databricks.com/glossary/materialized-views) like this.

## Conclusion

The Delta Lake Change Data Feed is useful in a variety of situations and is easily enabled for new or existing tables.

For some tables, you’ll want to enable the CDF for auditing purposes. In these instances, you can just enable the CDF and forget about it until you need to run ad hoc queries. The CDF is subject to retention like the rest of the table, so make sure to read the docs and implement the vacuum command appropriately, especially if you need to retain files for auditing purposes.

In other situations, you’ll deliberately enable the CDF to intelligently perform minimal downstream operations.

The CDF is another powerful Delta Lake feature and you should check out [the official documentation](https://docs.delta.io/latest/delta-change-data-feed.html) to learn more.
