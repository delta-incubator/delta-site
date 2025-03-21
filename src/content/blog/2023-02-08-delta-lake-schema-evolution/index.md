---
title: Delta Lake Schema Evolution
description: This post shows how to enable schema evolution in Delta tables and when this is a good option.
thumbnail: "./thumbnail.png"
author:
  - matthew-powers
publishedAt: 2023-02-08
---

This post explains how you can configure your Delta Lake to allow for a schema that evolves over time. You’ll learn about the benefits of schema evolution, when to enable this feature, and when to avoid this functionality.

You’ll also learn about why the schema evolution offered by Delta Lake is better than what’s supported in data lakes.

[This notebook](https://github.com/MrPowers/delta-examples/blob/master/notebooks/pyspark/schema-evolution.ipynb) contains all the code snippets used in this blog post if you want to follow along.

## Delta Lake schema evolution example

Let’s start by creating a DataFrame and then appending data with a different schema to illustrate the schema evolution functionality.

Start by creating a Delta table with `first_name` and `age` columns:

```
df = spark.createDataFrame([("bob", 47), ("li", 23), ("leonard", 51)]).toDF(
    "first_name", "age"
)

df.write.format("delta").save("tmp/fun_people")
```

Now try to append a DataFrame with a different schema to the existing Delta table. This DataFrame will contain `first_name`, `age`, and `country` columns.

```
df = spark.createDataFrame([("frank", 68, "usa"), ("jordana", 26, "brasil")]).toDF(
    "first_name", "age", "country"
)

df.write.format("delta").mode("append").save("tmp/fun_people")
```

This code errors out with an `AnalysisException`. Delta Lake does not allow you to append data with mismatched schema by default. This feature is called schema enforcement. Read this blog post to learn more about [Delta Lake schema enforcement](https://delta.io/blog/2022-11-16-delta-lake-schema-enforcement/).

Let’s look at one way to bypass schema enforcement and leverage the flexibility of schema evolution.

## Delta Lake schema evolution with mergeSchema set to true

You can set the `mergeSchema` option to true to write to a Delta table and enable data with a mismatched schema to be appended; see the following example:

```
df.write.option("mergeSchema", "true").mode("append").format("delta").save(
    "tmp/fun_people"
)
```

Here are the contents of the Delta table after the data has been added.

```
spark.read.format("delta").load("tmp/fun_people").show()

+----------+---+-------+
|first_name|age|country|
+----------+---+-------+
|   jordana| 26| brasil| # new
|     frank| 68|    usa| # new
|   leonard| 51|   null|
|       bob| 47|   null|
|        li| 23|   null|
+----------+---+-------+
```

The Delta table now has three columns. It previously only had two columns.

The “missing” data in the `country` column for the existing data is simply marked as `null` when new columns are added.

Setting `mergeSchema` to `true` every time you’d like to write with a mismatched schema can be tedious. Let’s look at how to enable schema evolution by default.

## Delta Lake schema evolution with autoMerge

You can enable schema evolution by default by setting `autoMerge` to `true`:

```
spark.conf.set("spark.databricks.delta.schema.autoMerge.enabled", "true")
```

With `autoMerge` set to `true`, you can append DataFrames with different schemas without setting `mergeSchema`. Let’s append a single column DataFrame to the Delta table to illustrate.

```
df = spark.createDataFrame([("dahiana",), ("sabrina",)]).toDF("first_name")

df.write.format("delta").mode("append").save("tmp/fun_people")
```

Print the contents of the DataFrame to ensure the data was appended.

```
spark.read.format("delta").load("tmp/fun_people").show()

+----------+----+-------+
|first_name| age|country|
+----------+----+-------+
|   jordana|  26| brasil|
|     frank|  68|    usa|
|   leonard|  51|   null|
|       bob|  47|   null|
|        li|  23|   null|
|   sabrina|null|   null| # new
|   dahiana|null|   null| # new
+----------+----+-------+
```

This append illustrates two concepts:

- `autoMerge` allows you to avoid explicitly setting `mergeSchema` every time you append data
- Schema evolution also lets you append DataFrames with fewer columns that the existing Delta table

Let’s create a DataFrame with an entirely different schema from the existing Delta table and see what happens when it’s appended.

Create a DataFrame with an `id` column and a few rows of data:

```
df = spark.range(0, 3)

df.show()

+---+
| id|
+---+
|  0|
|  1|
|  2|
+---+
```

Append this DataFrame to the Delta table:

```
df.write.format("delta").mode("append").save("tmp/fun_people")
```

View the contents of the Delta table:

```
spark.read.format("delta").load("tmp/fun_people").show()

+----------+----+-------+----+
|first_name| age|country|  id|
+----------+----+-------+----+
|   jordana|  26| brasil|null|
|     frank|  68|    usa|null|
|   leonard|  51|   null|null|
|       bob|  47|   null|null|
|        li|  23|   null|null|
|   sabrina|null|   null|null|
|   dahiana|null|   null|null|
|      null|null|   null|   1| # new
|      null|null|   null|   2| # new
|      null|null|   null|   0| # new
+----------+----+-------+----+
```

When schema evolution is enabled, Delta Lake will even append this DataFrame with a schema that doesn’t overlap at all. As you can see, schema evolution is very permissive.

If you don’t want to allow for appends with zero schema overlap, you may want to add some “pre-append checks”.

## Why use Delta Lake schema evolution

You should enable Delta Lake schema evolution to allow for the schema of your table to change without doing a full data rewrite.

As the preceding examples have shown, schema evolution is quite permissive and will allow you to append DataFrames with any schema to your existing Delta table. The DataFrames can contain extra columns, missing columns, or any combination thereof.

Schema evolution is typically best used when you want to add a couple of rows or write data without a couple of rows, not for wholesale schema changes. This feature offers a lot of flexibility, so you must use it carefully.

## When to avoid Delta Lake schema evolution

Schema enforcement is a powerful Delta Lake feature and is generally a smart default. When appending data to your Delta table, you generally want the schema of the new data to match the existing table.

You should not enable schema evolution if you want the schema enforcement guarantee checks. Schema enforcement checks are disabled when schema evolution is enabled. So only enable these checks when you want them.

Schema evolution can break downstream processes. You should ensure all downstream readers will still work before evolving the schema in your production pipelines.

## Delta Lake mergeSchema vs autoMerge

Delta Lake `mergeSchema` only applies for a single write to a single table. It’s a good option if you only want to enable schema evolution for a single table.

Delta Lake’s `autoMerge` option activates schema evolution for writes to any table. This can be quite convenient but also dangerous. Remember that schema evolution is rather permissive - it allows you to append data with any schema to any table without restrictions.

Only enable `autoMerge` if you truly need that amount of flexibility. If you only want to enable schema evolution for a single job or a single table, `mergeSchema` is safer.

## “Schema evolution” for Parquet tables

Parquet tables don’t support schema evolution. Let’s see how they behave by default.

Create a DataFrame with `city` and `country` columns and write it to a Parquet table.

```
df = spark.createDataFrame([("delhi", "india"), ("baltimore", "usa")]).toDF(
    "city", "country"
)

df.write.format("parquet").mode("append").save("tmp/some_cities")
```

Read the Parquet table and view the contents.

```
spark.read.format("parquet").load("tmp/some_cities").show()

+---------+-------+
|     city|country|
+---------+-------+
|baltimore|    usa|
|    delhi|  india|
+---------+-------+
```

Now create another DataFrame with just an `id` column and append it to the Parquet table.

```
df = spark.range(0, 3)
df.write.format("parquet").mode("append").save("tmp/some_cities")
```

Note that the Parquet table simply accepts the appended data with a mismatched schema. Parquet has no notion of schema enforcement. Any data can get appended to a Parquet table.

Now read in the Parquet table:

```
spark.read.format("parquet").load("tmp/some_cities").show()

+----+
|  id|
+----+
|null|
|null|
|   0|
|   1|
|   2|
+----+
```

That doesn’t look right!

It’s also not the result you’ll always get. You may run the code again and get this result:

```
spark.read.format("parquet").load("tmp/some_cities").show()

+---------+-----------+
|     city|    country|
+---------+-----------+
|  toronto|     canada|
|   manila|philippines|
|baltimore|        usa|
|    delhi|      india|
|     null|       null|
|     null|       null|
|     null|       null|
+---------+-----------+
```

Spark is just grabbing the schema from the first file it encounters and assumes that it’s the schema for all the other files. It grabs the schema from the file with the `id` column in this example. It’s simply ignoring the `city` and `country` columns from the other files because it thinks they don’t exist.

Spark intentionally grabs the schema from a single Parquet file when figuring out the schema. Reading the schema from all the files would be an expensive computation and slow down all reads.

You can force Spark to read the schemas of all the Parquet files by setting the `mergeSchema` option when performing the read.

```
spark.read.format("parquet").option("mergeSchema", "true").load(
    "tmp/some_cities"
).show()

+----+---------+-------+
|  id|     city|country|
+----+---------+-------+
|null|baltimore|    usa|
|null|    delhi|  india|
|   0|     null|   null|
|   1|     null|   null|
|   2|     null|   null|
+----+---------+-------+
```

Note: The `mergeSchema` option when reading Parquet files is completely different than the `mergeSchema` option when writing Delta tables!

When Spark reads the Parquet files with `mergeSchema` set to `true`, you get a similar result as when reading the Delta table, but it’s a lot more annoying.

Data professionals usually read multiple Parquet tables and they shouldn’t be expected to figure out when `mergeSchema` is necessary. You don’t want to enable it by default because that’ll slow down all reads, even when it’s not necessary. The individuals that write mismatched schemas to Parquet lakes might forget to inform all the readers. It’s a dangerous design pattern to implement.

**Reiterating an important note**: The the `mergeSchema` in `spark.read.format("parquet").option("mergeSchema", "true")` is completely different from the `mergeSchema` in `df.write.format("delta").option("mergeSchema", "true").` One is for enabling schema resolution when reading Parquet lakes with different schemas. Another is to allow for schema evolution when writing to Delta tables. Don’t get them confused.

## Delta Lake schema evolution vs. data lakes

Data lakes are schema on read, which means the schema is inferred when reading data. As we can see, schema on read is a disadvantage when supporting data with changing schema. You either need to manually track which data tables have changing schemas or always set `mergeSchema` to `true` when reading data lakes, which will slow down all reads.

Delta Lake tables are schema on write, which means that the schema is already defined when the data is read. Delta Lakes are aware when data with other schemas have been appended. Delta Lake works out the final schema for the table by querying the transaction log, not by opening all the individual Parquet files. This makes schema evolution with Delta tables fast and more convenient for the user.

Delta Lake tables have several advantages over data lakes, and schema evolution is just one of the many benefits.

## Conclusion

This post taught you how to enable schema evolution with Delta Lake and the benefits of managing Delta tables with flexible schemas.

You learned about two ways to allow for schema evolution and the tradeoffs. It’s generally best to use `mergeSchema` for schema evolution unless you want to enable it globally for all tables.

You also saw how Delta Lake offers real schema evolution. Parquet tables offer something similar to schema evolution, but it requires a read-time setting, which is inconvenient for the user. It’s also inefficient because it requires inspecting all the Parquet files before the read can even take place. This is one of the many examples where Delta Lake is more powerful than data lakes.
