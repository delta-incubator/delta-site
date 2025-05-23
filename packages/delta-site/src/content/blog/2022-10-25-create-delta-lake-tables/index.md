---
title: How to Create Delta Lake Tables
description: This post shows you how to create Delta Lake tables with Python, SQL, and PySpark.
thumbnail: "./thumbnail.png"
author: matthew-powers
publishedAt: 2022-10-25
---

There are a variety of easy ways to create Delta Lake tables. This post explains how to do so with SQL, PySpark, and other technologies. It’ll also show you how to create Delta Lake tables from data stored in CSV and Parquet files.

[Delta Lake](https://delta.io) is open source and stores data in the open [Apache Parquet](https://parquet.apache.org) file format. Its open nature makes it a flexible file protocol for a variety of use cases. Delta Lake interoperates smoothly with a wide range of other technologies (such as Apache Flink, Apache Hive, Apache Kafka, PrestoDB, Apache Spark, and Trino, to name a few) and provides language APIs for Rust, Python, Scala, Java, and more, making it easy for organizations to integrate the framework into their existing ETL pipelines.

The best way to create Delta Lake tables depends on your setup and technology preferences. This post will show you several different options, so you can choose the best one for your scenario.

Let’s dive into some code snippets and see how to create Delta Lake tables. See [this Jupyter notebook](https://github.com/MrPowers/delta-examples/blob/master/notebooks/pyspark/create-table-delta-lake.ipynb) for all the code in this post.

## Create a Delta Lake Table from a DataFrame

You can write out a PySpark DataFrame to Delta Lake, thereby creating a Delta Lake table.

To demonstrate, let’s start by creating a PySpark DataFrame with a few rows of data:

```python
columns = ["character", "franchise"]
data = [("link", "zelda"), ("king k rool", "donkey kong"), ("samus", "metroid")]
rdd = spark.sparkContext.parallelize(data)
df = rdd.toDF(columns)
```

```
df.show()

+-----------+-----------+
|  character|  franchise|
+-----------+-----------+
|       link|      zelda|
|king k rool|donkey kong|
|      samus|    metroid|
+-----------+-----------+
```

Here’s how to write this DataFrame out as Parquet files and create a table (an operation you’re likely familiar with):

```python
df.write.format("parquet").saveAsTable("table1_as_parquet")
```

Creating a Delta Lake table uses almost identical syntax – it’s as easy as switching your format from "parquet" to "delta":

```python
df.write.format("delta").saveAsTable("table1")
```

We can run a command to confirm that the table is in fact a Delta Lake table:

```python
DeltaTable.isDeltaTable(spark, "spark-warehouse/table1") # True
```

And we can fetch the contents of this table via the PySpark API:

```
spark.table("table1").show()

+-----------+-----------+
|  character|  franchise|
+-----------+-----------+
|king k rool|donkey kong|
|      samus|    metroid|
|       link|      zelda|
+-----------+-----------+
```

Delta Lake has a number of advantages over other tabular file formats like CSV and Parquet: it supports ACID transactions, time travel, versioned data, and much more. You’ll generally want to use Delta Lake unless you have a good reason to use another file format.

It’s easy to create a Delta Lake table from a PySpark DataFrame. Creating a Delta Lake table with the programmatic DeltaTable API is also straightforward.

## Create a Delta Lake table with the PySpark API

Here’s how to create a Delta Lake table with the PySpark API:

```python
from pyspark.sql.types import *

dt1 = (
    DeltaTable.create(spark)
    .tableName("testTable1")
    .addColumn("c1", dataType="INT", nullable=False)
    .addColumn("c2", dataType=IntegerType(), generatedAlwaysAs="c1 + 1")
    .partitionedBy("c1")
    .execute()
)
```

This will create an empty Delta Lake table with `c1` and `c2` columns.

If the table already exists, the create method will error. To avoid this, you can use the `createIfNotExists` method instead.

Delta Lake’s fluent API provides an elegant way to create tables with PySpark code. The API also allows you to specify [generated columns](https://docs.delta.io/latest/delta-batch.html#-deltausegeneratedcolumns) and [properties](https://docs.delta.io/latest/table-properties.html).

## Create a Delta Lake table with SQL

You can create a Delta Lake table with a pure SQL command, similar to creating a table in a relational database:

```python
spark.sql("""
  CREATE TABLE table2 (country STRING, continent STRING) USING delta
""")
```

Let’s add some data to the newly created Delta Lake table:

```python
spark.sql("""
  INSERT INTO table2 VALUES
      ('china', 'asia'),
      ('argentina', 'south america')
""")
```

Then print it out to verify that the data was properly added:

```
spark.sql("SELECT * FROM table2").show()

+---------+-------------+
|  country|    continent|
+---------+-------------+
|argentina|south america|
|    china|         asia|
+---------+-------------+
```

We can confirm that this table is a Delta Lake table with the following command:

```
spark.sql("DESCRIBE DETAIL table2").select("format").show()

+------+
|format|
+------+
| delta|
+------+
```

Manually creating a Delta Lake table via SQL is easy, and once you’ve created the table you can perform other data operations on it as usual.

## Create a Delta Lake table from CSV

Suppose you have the following `students1.csv` file:

```
student_name,graduation_year,major
someXXperson,2023,math
liXXyao,2025,physics
```

You can read this CSV file into a Spark DataFrame and write it out as a Delta Lake table using these commands:

```python
df = spark.read.option("header", True).csv("students1.csv")
df.write.format("delta").saveAsTable("students")
```

For a single CSV file, you don’t even need to use Spark: you can simply use [delta-rs](https://github.com/delta-io/delta-rs/), which doesn’t have a Spark dependency, and [create the Delta Lake from a Pandas DataFrame](https://delta-io.github.io/delta-rs/python/usage.html#writing-delta-tables). If you have multiple CSV files, using PySpark is usually better because it can read multiple files in parallel.

Here’s how to create a Delta Lake table with multiple CSV files:

```python
df = spark.read.option("header", True).csv("path/with/csvs/")
df.write.format("delta").save("some/other/path")
```

## Create a Delta Lake table from Parquet

You could follow a similar design pattern to convert Parquet files to a Delta Lake, reading them into a Spark DataFrame and then writing them out to a Delta Lake – but there’s an even easier approach.

Delta Lakes store data in Parquet files and metadata in a transaction log. When creating a Delta Lake from Parquet files, you don’t need to rewrite the data: you can perform an in-place operation and simply add the transaction log to the existing folder with the Parquet files. Here’s how to perform this operation:

```python
DeltaTable.convertToDelta(spark, "parquet.`tmp/lake1`")
```

Suppose you have the following Parquet files stored in tmp/lake1:

```
tmp/lake1
├── _SUCCESS
├── part-00000-1f1cc136-76ea-4185-84d6-54f7e758bfb7-c000.snappy.parquet
├── part-00003-1f1cc136-76ea-4185-84d6-54f7e758bfb7-c000.snappy.parquet
├── part-00006-1f1cc136-76ea-4185-84d6-54f7e758bfb7-c000.snappy.parquet
└── part-00009-1f1cc136-76ea-4185-84d6-54f7e758bfb7-c000.snappy.parquet
```

Here’s what the files will look like after they’ve been converted to a Delta Lake:

```
tmp/lake1
├── _SUCCESS
├── _delta_log
│   ├── 00000000000000000000.checkpoint.parquet
│   ├── 00000000000000000000.json
│   └── _last_checkpoint
├── part-00000-1f1cc136-76ea-4185-84d6-54f7e758bfb7-c000.snappy.parquet
├── part-00003-1f1cc136-76ea-4185-84d6-54f7e758bfb7-c000.snappy.parquet
├── part-00006-1f1cc136-76ea-4185-84d6-54f7e758bfb7-c000.snappy.parquet
└── part-00009-1f1cc136-76ea-4185-84d6-54f7e758bfb7-c000.snappy.parquet
```

See the blog post "[Converting from Parquet to Delta Lake](https://delta.io/blog/2022-09-23-convert-parquet-to-delta/)" for more information.

## Create a Delta Lake table from other technologies

The open nature of Delta Lake allows for a robust connector ecosystem. This means you can create a Delta Lake with a variety of other technologies. Here are some examples:

- The [delta-rs](https://github.com/delta-io/delta-rs) Python bindings let you create a Delta Lake from a pandas DataFrame.
- [kafka-delta-ingest](https://github.com/delta-io/kafka-delta-ingest) is a highly efficient way to stream data from Kafka into a Delta Lake.
- The [connectors](https://github.com/delta-io/delta/tree/master/connectors) repo contains Delta Standalone, a Java library that doesn’t depend on Spark, which allows for Java-based connectors like Hive and Flink.

The Delta Lake community continues to grow the connector ecosystem, with many developers building connectors for their internal projects and graciously donating them. The Delta ecosystem is a friendly and productive place to contribute. Here’s some feedback from a new Delta Lake contributor after their first pull request was merged:

![](image1.png)

## Conclusion

This post has shown you a variety of ways to create Delta Lake tables: from a DataFrame, from CSV or Parquet files, with SQL, or via a variety of other connectors in the Delta Lake ecosystem.

Because the framework is open source, creating a Delta Lake with any technology is possible; it only needs to follow the Delta Lake [protocol](https://github.com/delta-io/delta/blob/master/PROTOCOL.md).

Open formats don’t suffer from vendor lock-in, and that’s part of the reason why data professionals are increasingly switching to open protocols like Delta Lake. The data community loves Delta Lake’s great features, open nature, and vast ecosystem.

The Delta Lake community welcomes new members. Feel free to join our [Slack channel](http://go.delta.io/slack) – the community will be happy to help you get on board! You can also follow us on [Twitter](https://twitter.com/DeltaLakeOSS) or [LinkedIn](https://www.linkedin.com/company/deltalake).
