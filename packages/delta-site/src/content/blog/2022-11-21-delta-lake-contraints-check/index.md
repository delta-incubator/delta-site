---
title: Delta Lake Constraints and Checks
description: This post shows how to add constraints to your Delta table to avoid certain types of values from getting appended.
thumbnail: "./thumbnail.png"
author: matthew-powers
publishedAt: 2022-11-21
---

This post shows you how to add constraints to your Delta Lake that prevent bad data from getting added to your Delta table.

Delta Lake allows you to append any data with matching data types to your Delta tables by default. For example, you can append any integer value to a column with an integer type. To limit the types of integers that can be appended to a certain column, you can add a constraint.

For example, suppose you have a Delta table with an `age` column. You may want to add a constraint to the Delta table that prevents negative values from being added to the `age` column because they don’t make much sense.

Let’s create a Delta table, add a constraint, and then see how it prevents us from appending bad data.

All the code covered in this post is in [this notebook](https://github.com/MrPowers/delta-examples/blob/master/notebooks/pyspark/constraints.ipynb) if you want to follow along.

## Delta Lake Check Constraint

[Create a Delta table](https://delta.io/blog/2022-10-25-create-delta-lake-tables/) with `age` and `word` columns and a couple of rows of data.

```
df = spark.createDataFrame(
    [
        (1, "foo"),
        (2, "bar"),
    ],
    ["age", "word"],
)

df.write.format("delta").saveAsTable("random1")
```

Add a constraint that prevents negative values from being added to the `age` column.

```
spark.sql("ALTER TABLE default.random1 ADD CONSTRAINT ageIsPositive CHECK (age >= 0)")
```

Run `SHOW TBLPROPERTIES` to confirm that the constraint was added.

```
spark.sql("SHOW TBLPROPERTIES random1").show(truncate=False)

+-------------------------------+--------+
|key                            |value   |
+-------------------------------+--------+
|delta.constraints.ageispositive|age >= 0|
|delta.minReaderVersion         |1       |
|delta.minWriterVersion         |3       |
+-------------------------------+--------+
```

Now create a DataFrame with one row that has a negative age and one row that has a positive age. Try to append this DataFrame to the Delta table.

```
df = spark.createDataFrame(
    [
        (-3, "red"),
        (4, "blue"),
    ],
    ["age", "word"],
)

df.write.format("delta").mode("append").saveAsTable("random1")
```

Delta Lake won’t let you append this data to the Delta table because of the constraint. Here’s the error message:

```
org.apache.spark.sql.delta.schema.DeltaInvariantViolationException:
CHECK constraint ageispositive (age >= 0) violated by row with values:
 - age : -3
```

Read in the contents of the `random1` table and verify that no additional data was appended.

```
spark.table("random1").show()

+---+----+
|age|word|
+---+----+
|  1| foo|
|  2| bar|
+---+----+
```

The Delta table rejected the append operation because the DataFrame contains a row with a negative age, which fails the constraint. Notice that none of the data was appended. If there are any values that don’t satisfy the constraint, then none of the values are appended. Delta Lake supports ACID guarantees which means either all the data will be appended or none of it will be appended. These guarantees are critical in production data workloads.

You’d have to filter out the values that don’t satisfy the constraint before appending if you’d like to add this data to the Delta table.

```
df.filter(F.col("age") >= 0).write.format("delta").mode("append").saveAsTable("random1")

spark.table("random1").show()

+---+----+
|age|word|
+---+----+
|  4|blue|
|  1| foo|
|  2| bar|
+---+----+
```

Let’s look at another type of constraint that’s often useful to add to your Delta tables.

## Delta Lake NOT NULL Constraint

You can add a `NOT NULL` constraint to Delta table columns to prevent null data from being appended. This constraint is often desirable as you’ll often have columns in your Delta table that you don’t want to contain any `NULL` data.

Create a Delta table called `letters` with `letter1` and `letter2` columns.

```
spark.sql("""
CREATE TABLE default.letters (
    letter1 STRING,
    letter2 STRING NOT NULL
  ) USING DELTA;
""")
```

Append some data that doesn’t contain any NULL values and verify that good data can be appended.

```
df = spark.createDataFrame(
    [
        ("a", "aa"),
        ("b", "bb"),
    ],
    ["letter1", "letter2"],
)

df.write.format("delta").mode("append").saveAsTable("letters")

spark.table("letters").show()

+-------+-------+
|letter1|letter2|
+-------+-------+
|      b|     bb|
|      a|     aa|
+-------+-------+
```

Try to append some data that contains `NULL` in the `letter2` column and observe the error message.

```
df = spark.createDataFrame(
    [
        ("c", None),
        ("d", "dd"),
    ],
    ["letter1", "letter2"],
)

df.write.format("delta").mode("append").saveAsTable("letters")
```

Here’s the error message that’s raised:

```
org.apache.spark.sql.delta.schema.DeltaInvariantViolationException: NOT NULL constraint violated for column: letter2.
```

Delta Lake makes it easy for you to prevent adding `NULL` values to columns.

## Delta Lake NOT NULL constraint vs DataFrame nullable property

PySpark DataFrames have schemas that specify each column's name, data type, and nullable property. The nullable property determines whether each column can take a null value.

The nullable DataFrame property doesn’t provide the same guarantees that the `NOT NULL` constraint provides. For example, PySpark will automatically set the `nullable` property to `True` when reading a CSV file that contains null values, even if you try to explicitly set it to `False`.

Suppose you have a CSV file with the following data:

```
col1,col2
hi,bye
hola,
```

Read this CSV file into a DataFrame and try to set the `col2` nullable property to `False`:

```
from pyspark.sql.types import StringType, StructType

schema = StructType().add("col1", StringType(), True).add("col2", StringType(), False)

df = (
    spark.read.format("csv")
        .option("header", True)
       .schema(schema)
       .load("../../data/small_file.csv")
)
```

View the contents of the DataFrame:

```
df.show()

+----+----+
|col1|col2|
+----+----+
|  hi| bye|
|hola|null|
+----+----+
```

Now view the schema of the DataFrame:

```
df.printSchema()

root
 |-- col1: string (nullable = true)
 |-- col2: string (nullable = true)
```

`col2` has a nullable property set to `True`, even though we tried to explicitly set it to `False` when reading the data.

This blog post does not cover all the nullable property edge cases. For purposes of this post, you just need to understand that the nullable property does not provide you with the guarantees that the `NOT NULL` constraint provides.

The `NOT NULL` constraint prevents data with null values from being appended to your Delta table.

## Adding constraints to existing Delta tables

Let’s see what happens when you add a check to a Delta table that already contains data.

Create a Delta table named `random2` with `age` and `word` columns.

```
df = spark.createDataFrame(
    [
        (-45, "hi"),
        (2, "bye"),
    ],
    ["age", "word"],
)

df.write.format("delta").saveAsTable("random2")
```

View the contents of the `random2` table.

```
spark.table("random2").show()

+---+----+
|age|word|
+---+----+
|  2| bye|
|-45|  hi|
+---+----+
```

One of the rows has a negative `age` value and the other has a positive `age` value. Let’s see what happens if you try to add a constraint that requires all rows of data in the Delta table to have positive `age` values.

```
spark.sql("ALTER TABLE default.random2 ADD CONSTRAINT ageIsPositive CHECK (age >= 0)")
```

This command will error out with the following message:

```
AnalysisException: 1 rows in default.random2 violate the new CHECK constraint (age >= 0)
```

Delta Lake doesn’t let you apply a constraint if the existing table doesn’t satisfy the boolean check.

## Conclusion

Constraints can be critical to make sure that bad data isn’t added to your Delta table. Sometimes you’ll want Delta tables that ingest all data (clean & junk), but other times you’ll want Delta tables to be strict and only accept clean data.

Delta Lake constraints make it easy for you to validate data before it’s appended to a Delta table. Make sure to use Delta Lake constraints whenever you want to prevent certain types of data from being added to a column.

Remember that Delta Lake constraints are for row-level values. The schema-level checks for the column names and data types are performed separately via [schema enforcement](https://delta.io/blog/2022-11-16-delta-lake-schema-enforcement/).
