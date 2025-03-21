---
title: How to drop columns from a Delta Lake table
description: This post shows you two ways to drop columns from Delta Lake tables.
thumbnail: "./thumbnail.png"
author: matthew-powers
publishedAt: 2022-08-29
---

This post teaches you how to drop columns from Delta Lake tables. You may want to drop columns to save on storage costs, for regulatory requirements, or just for convenience when a column contains data that’s not needed anymore.

There are two different ways to drop a column from a Delta Lake table. This post will show you both approaches and explain the tradeoffs, so you can use the best approach for your situation.

It will also give you intuition on how Delta Lake implements the drop column functionality. Learning about how simple operations like dropping a column are executed under the hood is a great way to level up your Delta Lake skills.

## Delta Lake drop column syntax

Let’s create a small Delta table and then drop a column. Suppose you have the following table.

```
+--------+------------+
|language|num_speakers|
+--------+------------+
|Mandarin|         1.1|
| English|         1.5|
|   Hindi|         0.6|
+--------+------------+
```

Here’s how to drop the `language` column from the table.

```
ALTER TABLE `my_cool_table` DROP COLUMN language
```

Let’s walk through the entire code snippet, so you can run this example on your local machine. You’ll also need to install PySpark and Delta Lake locally if you haven’t already done so, see in [the installation instructions here](https://docs.delta.io/latest/quick-start.html). These dependencies are already installed for you if you’re using a Spark Runtime like Databricks.

Here’s how to create the SparkSession with Delta (you don’t need to run this code if you’re using a Spark runtime environment like Databricks that automagically provides you with a SparkSession whenever you start a notebook).

```python
import pyspark
from delta import *

builder = (
    pyspark.sql.SparkSession.builder.appName("MyApp")
    .config("spark.sql.extensions", "io.delta.sql.DeltaSparkSessionExtension")
    .config(
        "spark.sql.catalog.spark_catalog",
        "org.apache.spark.sql.delta.catalog.DeltaCatalog",
    )
)

spark = configure_spark_with_delta_pip(builder).getOrCreate()
```

Once the SparkSession is instantiated, it’s easy to create a small table with two columns and three rows of data.

```python
columns = ["language", "num_speakers"]
data = [("English", "1.5"), ("Mandarin", "1.1"), ("Hindi", "0.6")]
rdd = spark.sparkContext.parallelize(data)
df = rdd.toDF(columns)

df.write.format("delta").saveAsTable("default.my_cool_table")

spark.sql("select * from `my_cool_table`").show()
```

```
+--------+------------+
|language|num_speakers|
+--------+------------+
|Mandarin|         1.1|
| English|         1.5|
|   Hindi|         0.6|
+--------+------------+
```

Let’s run the drop column statement and then output the table to make sure the data has actually been dropped. We need to enable column mapping mode to perform this operation.

```python
spark.sql(
    """ALTER TABLE `my_cool_table` SET TBLPROPERTIES (
   'delta.columnMapping.mode' = 'name',
   'delta.minReaderVersion' = '2',
   'delta.minWriterVersion' = '5')"""
)

spark.sql("ALTER TABLE `my_cool_table` DROP COLUMN language")

spark.sql("select * from `my_cool_table`").show()
```

```
+------------+
|num_speakers|
+------------+
|         1.1|
|         1.5|
|         0.6|
+------------+
```

Here’s [a link to the notebook](https://github.com/MrPowers/delta-examples/blob/master/notebooks/pyspark/drop-column.ipynb) if you’d like to run these computations on your local machine.

## Delta Lake drop column implementation

`DROP COLUMN` was added in Delta Lake 2.0, which allows for dropping a column via a metadata operation. When you drop a column, Delta simply creates an entry in the transaction log to indicate that queries should ignore the dropped column going forward.

Here’s the schema before you drop the column:

```
spark.sql("select * from `my_cool_table`").printSchema()

root
 |-- language: string (nullable = true)
 |-- num_speakers: string (nullable = true)
```

Here’s the entry that’s made to the transaction log when you drop a column:

```
{
   "commitInfo":{
      "timestamp":1659886555675,
      "operation":"DROP COLUMNS",
      "operationParameters":{
         "columns":"[\"language\"]"
      },
      "readVersion":1,
      "isolationLevel":"Serializable",
      "isBlindAppend":true,
      "operationMetrics":{

      },
      "engineInfo":"Apache-Spark/3.2.2 Delta-Lake/2.0.0",
      "txnId":"72294000-c6b4-4eba-8cc6-9d207cc01291"
   }
}
```

Here’s the schema after you drop the column:

```
spark.sql("select * from `my_cool_table`").printSchema()

root
 |-- num_speakers: string (nullable = true)
```

Prior to Delta Lake 2.0, `DROP COLUMN` was not available, so users needed to actually rewrite their entire dataset to perform this operation. Dropping a column in a large dataset was computationally expensive for large datasets.

Let’s take a look at the approach that was required before Delta Lake added drop column support.

## Drop column Delta Lake pre-version 2.0

Let’s create another example that illustrates how you needed to drop a column from a Delta Lake before column mapping was added.

Create another table called `another_cool_table` with the same `language` and `num_speakers` columns as before so we can exemplify how you can drop columns with a full data rewrite.

```python
columns = ["language", "num_speakers"]
data = [("Spanish", "0.5"), ("French", "0.3"), ("Arabic", "0.3")]
rdd = spark.sparkContext.parallelize(data)
df = rdd.toDF(columns)

df.write.format("delta").saveAsTable("default.another_cool_table")
```

Make sure the table was created correctly:

```
df = spark.sql("select * from another_cool_table")

df.show()

+--------+------------+
|language|num_speakers|
+--------+------------+
| Spanish|         0.5|
|  Arabic|         0.3|
|  French|         0.3|
+--------+------------+
```

Read in the table to a DataFrame, drop the column, and then write out the new DataFrame to the Delta Lake.

```python
df = df.drop("num_speakers")

df.write.format("delta").mode("OVERWRITE").option(
    "overwriteSchema", "true"
).saveAsTable("default.another_cool_table")
```

Confirm the `num_speakers` column was dropped from the Delta Lake.

```
spark.sql("select * from another_cool_table").show()

+--------+
|language|
+--------+
| Spanish|
|  French|
|  Arabic|
+--------+
```

This approach works, but it’s a lot slower than simply removing the column via a metadata operation. Suppose you have a Delta Lake with 10 terabytes of data in 100 columns and you’d like to drop one of the columns that contains 100 GB of data.

With column mapping enabled, you can drop this column by adding a metadata entry to the transaction log, which will execute in a fraction of a second.

If you read in all 10 TB of data to a DataFrame, drop a column with the DataFrame API, and then rewrite all the data, the operation will take a lot longer. Simply dropping a column can be a big data processing operation.

Let’s dig into the implementation detail tradeoffs in more detail because they matter in certain regulatory and cost situations.

## Delta Lake drop column additional considerations

Some users need to drop columns physically from disk for regulatory purposes. They can’t simply perform a metadata operation and ignore the column. The data needs to be physically deleted.

If you need to wipe the column from your systems completely, then you should overwrite the existing data and then perform a vacuum operation. That’s how to physically remove the column from disk.

Delta Lake stores data in Parquet files, which are columnar, so having an extra column on disk doesn’t adversely impact the performance of your queries. The dropped columns are simply ignored when queries are run. Parquet’s columnar nature allows for column pruning, which is one of the main reasons Parquet is faster than a row-based file format, like CSV.

You’ll need to pay extra to store columns that are “dropped” with a metadata operation because you don’t technically remove the column from the Parquet files. When the columns are physically deleted, you don’t have to pay to store them. As we discussed before, physically dropping columns requires compute, which costs money. Compute is generally more expensive than storage. The compute vs storage tradeoffs are outside the scope of this post, but will be covered in more detail in future posts. You don’t normally need to consider these costs because they’re so minimal, but worth keeping in mind when you’re brainstorming overall cost management at a high level.

## Next steps

This blog post has shown you how to drop columns from Delta Lake tables with `DROP COLUMN` syntax and by overwriting the existing data lake.

You’ve learned about the tradeoffs between the two approaches for dropping tables. `DROP COLUMN` is a lot quicker, but it doesn’t actually physically delete the data on disk, so it may not be sufficient for certain regulatory requirements. In general, `DROP COLUMN` is preferable, but use other methods if you need to physically remove the column for GDPR compliance.

Delta Lake is continuously improving and improved support for `DROP COLUMN` is just one example. The project is evolving rapidly to add more and more features for Delta Lake users. You can join our [active Slack community](http://go.delta.io/slack) or provide feedback by opening issues on [the GitHub repo](http://go.delta.io/github) any time. We have an open, active, and friendly community - we encourage you to join.
