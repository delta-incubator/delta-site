---
title: Delta Lake Merge
description: This post shows how to use MERGE with Delta tables.
thumbnail: "./thumbnail.png"
author:
  - nick-karpov
publishedAt: 2023-02-14
---

`MERGE` is the most powerful operation you can do with Delta Lake.
With merge, you can apply all three standard data manipulation language operations (`INSERT`, `UPDATE`, and `DELETE`) in a single transaction.
You can also add multiple conditions to each of these operations for more complex scenarios and datasets.

In this post we’ll explore the full range of the merge command one example at a time, and by the end of this post you’ll be able to construct a broad range of merge queries to satisfy your use cases.

`MERGE` has a well known SQL syntax so we’ll use the PySpark API (`merge`) in this post to highlight that the Delta Lake Spark connector supports both Python and Scala, too.

All code snippets are in [this notebook](https://github.com/MrPowers/delta-examples/blob/master/notebooks/pyspark/delta-merge.ipynb) if you’d like to follow along.

## When to use Delta Lake merge

Merge is the workhorse of many ETL use cases. Here are a few motivating examples:

1. When you want to maintain a [Slowly Changing Dimension](https://en.wikipedia.org/wiki/Slowly_changing_dimension)
2. Change data capture: apply change sets from other data sources
3. `INSERT`, `UPDATE`, or `DELETE` data with dynamic matching conditions
4. [View Maintenance](https://link.springer.com/referenceworkentry/10.1007/978-0-387-39940-9_852) (where the view is a Delta table)
5. GDPR compliance

In general, Delta Lake merge is ideal for when you want to apply selective changes to a Delta table without rewriting the entire table.

## Delta Lake merge with whenNotMatchedInsert

It’s common to receive a dataset that contains both some existing data, and new data.
This means we can’t just append the new dataset without doing additional logic.
With a legacy Hive-style Parquet table it’s likely that we’d also have to rewrite the entire table.

With Delta Lake `merge` we can easily express how to handle this case and avoid rewriting the entire table.

Let’s begin with a simple example.

Start by creating an initial Delta Lake table that contains 3 rows of `name`, `age`, and a unique `id`:

```python
data = [(0, "Bob", 23), (1, "Sue", 25), (2, "Jim", 27)]

df = spark.createDataFrame(data).toDF("id", "name", "age")
df.repartition(1).write.format("delta").save("/tmp/people")
```

Note: `repartition(1)` is used to output a single file to make the demonstration clearer.

Now let’s simulate the new dataset we’ll receive.
Note, we have both new rows, and rows that already exist in the initial people Delta Lake table we bootstrapped above:

```python
new_data = [
    (0, "Bob", 23),    # exists in our original dataset above
    (3, "Sally", 30),  # new data
    (4, "Henry", 33),  # new data
]

new_df = spark.createDataFrame(new_data).toDF("id", "name", "age").repartition(1)
```

Let’s initialize a reference to our existing Delta Lake table:

```python
from delta.tables import DeltaTable
people_table = DeltaTable.forPath(spark, "/tmp/people")
```

Now we can use merge with the whenNotMatchedInsert clause to only add the new rows that don’t match the existing rows:

```python
people_table.alias("target").merge(
    new_df.alias("source"), "target.id = source.id"
).whenNotMatchedInsert(
    values={"id": "source.id", "name": "source.name", "age": "source.age"}
).execute()
```

It takes a few steps to set up the merge command, so let’s break it down.

First, we alias our Delta Lake table so that we can reference it in subsequent expressions.
It’s common practice to refer to the existing table as the 'target'.
We’ll use this terminology moving forward.

```python
people_table.alias("target")
```

Second, we call merge which takes two arguments: a new dataset and the joining condition:

```python
.merge(
    new_df.alias("source"), "target.id = source.id"
)
```

Like our `target` above, it’s common practice to refer to the new dataset as the source, so we also alias new_df as `source`.

The joining condition for our two datasets uses the `id` field, where `target.id = source.id`, but it’s possible to expand this to a more arbitrary expression for more complex scenarios, too.
We’ll explore that in later examples.

Third, we call the `whenNotMatchedInsert` clause with a dictionary that has the key-value pairs that represent which fields and values we’d like to insert.
The joining condition we defined above determines which rows `whenNotMatchedInsert` will apply to.
In this case the `whenNotMatchedInsert` clause will apply to rows that did not match the join condition, aka. don’t exist in the target table.
Note that we continue to use the `source` alias to refer to the new dataset.

```python
.whenNotMatchedInsert(
    values={"id": "source.id", "name": "source.name", "age": "source.age"}
).execute()
```

We pass a dictionary in the example above to demonstrate that you can customize how you insert new values.
The keys are the fields we’d like to insert, and the values for each key are the expressions we’d like to insert for each respective field.
This explicit dictionary is especially useful when the `source` and `target` datasets don’t have the same schema or when you want to do more than simply copy over data like in this example.
We’ll expand on this later.

In this simple case we could have also used a helpful shorthand method instead of passing a dictionary.

```python
.whenNotMatchedInsertAll().execute()
```

`whenNotMatchedInsertAll` defaults to inserting all the source fields.

Let’s confirm our result is as we expect: our `people` table started with 3 rows, and should now have two additional rows that came from the new dataset.

```python
people_table.toDF().show()

+---+-----+---+
| id| name|age|
+---+-----+---+
|  0|  Bob| 23|
|  1|  Sue| 25|
|  2|  Jim| 27|
|  3|Sally| 30|
|  4|Henry| 33|
+---+-----+---+
```

We said at the beginning that Delta Lake merge is ideal for when you want to apply changes without overwriting the entire table.
Let’s list the data files and take a closer look at commit files in the `_delta_log` to confirm that we only added files, and didn’t overwrite any old data.

```sh
> ls /tmp/people
_delta_log
part-00000-15d1e82e-2f94-4a91-a143-f970a973fccc-c000.snappy.parquet
part-00000-98425a3b-ca1c-4efd-be4a-3c843b765299-c000.snappy.parquet

> cat /tmp/people/_delta_log/00000000000000000000.json
…
{"add":{"path":"part-00000-15d1e82e-2f94-4a91-a143-f970a973fccc-c000.snappy.parquet", ... }

> cat /tmp/people/_delta_log/00000000000000000001.json
…
{"add":{"path":"part-00000-98425a3b-ca1c-4efd-be4a-3c843b765299-c000.snappy.parquet", ... }
```

We can see above that the Delta table consists of two parquet files that were added in two separate commits respectively.
The first commit was the original write we did to set up the data, and the second commit was the merge operation.
Delta Lake `merge` was smart enough to not overwrite any of the old data, and only insert the new rows.

Now let’s make things more interesting with a more complex batch of data to `merge` into our people dataset.

## Delta Lake merge with whenMatchedUpdate

In the previous example, we knew that the first row of our `source` data was exactly the same as the target data, and so we simply ignored it.
This time we’ll create a more realistic dataset which has the same `id`’s, but different values for `age`, and add a new clause to our `merge` query to handle this new data.

```python
new_data = [
    (4, "Henry", 34),
    (5, "Allie", 22),
]

new_df = spark.createDataFrame(new_data).toDF("id", "name", "age").repartition(1)
```

Above is our new source data.
The first row, representing Henry, is already in our target data, but this fresh batch of data has an update to his `age`, now that his birthday has passed.
We also have one new row of data for Allie, similar to our first example.

Here’s the merge query to handle this data:

```python
people_table.alias("target").merge(
    new_df.alias("source"), "target.id = source.id"
).whenMatchedUpdate(set={"age": "source.age"}).whenNotMatchedInsertAll().execute()
```

We’ve made two changes to the merge query from our first example.

The first change is that we switched `whenMatchedInsert` for `whenMatchedInsertAll`.
As we noted previously, this shorthand is useful when we know the source and target schemas are the same, so we can safely insert all the new values that don’t yet exist in the target data.

The second change is that we introduced the `whenMatchedUpdate` clause to handle Henry’s age update.

```python
.whenMatchedUpdate(set={"age": "source.age"})
```

The `whenMatchedUpdate` clause expects a dictionary, just like `whenNotMatchedInsert`, to tell it which values to update in the `target` data when a match has been found (i.e., the joining condition is satisfied).
In this case we explicitly tell `whenMatchedUpdate` to update only `age`, although we could add one or more of the remaining fields, too.
In this case we happen to know that nobody’s `id` nor `name` has changed.

Note that like `whenNotMatchedInsert` in the first example, `whenMatchedUpdate` also has a helpful shorthand for when we know we can safely update all the target fields using our source data without explicitly passing them in a dictionary: `whenMatchedUpdateAll`.

Let’s confirm that our people dataset has updated Henry’s age and inserted Allie into the people dataset.

```python
people_table.toDF().show()

+---+-----+---+
| id| name|age|
+---+-----+---+
|  3|Sally| 30|
|  4|Henry| 34|
|  5|Allie| 22|
|  0|  Bob| 23|
|  1|  Sue| 25|
|  2|  Jim| 27|
+---+-----+---+
```

With these two examples we can already handle merging a broad range of source data into our target Delta Lake tables.

Before we continue with more advanced examples, let’s revisit our first example with a legacy approach.
This will give us more insight to how merge works under the hood, and reveal how Delta Lake provides a safer, more flexible, and faster method for applying changes to your dataset.

## Delta Lake merge vs Parquet table merge

Let’s set up the same example we started with, but this time use a legacy Hive style Parquet table:

```python
data = [(0, "Bob", 23), (1, "Sue", 25), (2, "Jim", 27)]

df = spark.createDataFrame(data).toDF("id", "name", "age")
df.repartition(1).write.format("parquet").save("/tmp/parquet/people")

target = spark.read.format("parquet").load("/tmp/parquet/people")

new_data = [
    (0, "Bob", 23),
    (3, "Sally", 30),
    (4, "Henry", 33),
]

source = spark.createDataFrame(new_data).toDF("id", "name", "age").repartition(1)
```

Notice that we explicitly reread the dataset we just wrote above as the `DataFrame` `target` for clarity.

To merge these two datasets we’ll need to join them and manually write the expressions that conditionally select between the source and target data.

```python
source_prefix = source.select([F.col(c).alias("source_" + c) for c in source.columns])
target_prefix = target.select([F.col(c).alias("target_" + c) for c in target.columns])

joined_df = source_prefix.join(
    target_prefix, target_prefix.target_id == source_prefix.source_id, "full_outer"
)

final_df = joined_df.select(
    F.expr("CASE WHEN target_id IS NULL THEN source_id ELSE target_id END").alias("id"),
    F.expr("CASE WHEN target_name IS NULL THEN source_name ELSE target_name END").alias(
        "name"
    ),
    F.expr("CASE WHEN target_age IS NULL THEN source_age ELSE target_age END").alias(
        "age"
    ),
)
```

There's a lot to unpack here so let's explain what we did:

1. Add a prefix to all of our columns in the `source` and `target` data, respectively.
   We need to do this so that we can differentiate between and reference our `source` and `target` columns later in our merging logic.
2. Join our `source` and `target` on the matching condition, when the `id`'s are the same.
   We use a `full_outer` join because we need rows from both the source and target in our final table.
3. We process each row of our `joined_df`, and for each column conditionally select either the `source` or `target` value based on whether the data exists in the `target`.
   This approximately emulates what the `whenNotMatchedInsert` clause of merge does for us.
4. We write an entirely new people dataset with `final_df`.

That's a lot of manual and messy work!
Just compare it with the few lines for the merge command in the first example.
This should make clear that writing `merge` logic manually with Parquet based tables is very hard.
It's easy to make a mistake, and very hard to spot it.

In this example, we didn't even consider the full range of possibilities and edge cases.
We'd have to expand our conditional expressions much further to make this approach work for our second example, which added updates to specific fields in addition to inserting new rows.
For simplicity, we took advantage of the fact that we already knew what all the data was.

At the end of it all we had to rewrite the entire existing table.
Note that we wrote `final_df` to a new location because we [can’t overwrite the existing table while we’re reading it](https://stackoverflow.com/a/52162469/2580503).
So not only is this approach error prone and difficult to reason about, but it's also extremely slow.
Imagine doing this for a terabyte-sized table!

The good news is that much of what we just did is done by Delta Lake `merge` for us under the hood, and in a very similar way.
The general idea that we have to join our two datasets and process the result of that join row by row remains exactly the same.
In a future post we'll take a closer look at the [actual Delta Lake merge implementation](https://github.com/delta-io/delta/blob/master/core/src/main/scala/org/apache/spark/sql/delta/commands/MergeIntoCommand.scala) to explore some of the ways it improves on this general approach to achieve orders of magnitude better performance.

For now, let's return to the safety and speed of the Delta Lake merge command, and show some more advanced examples.

## Apply change data with merge

In our first two examples we received new data that looked a lot like our existing data.
The new dataset had the same schema, and no missing values.
Most real world scenarios are not so convenient.

It’s much more likely that we’ll receive a dataset with a different schema, and unexpected or even missing values.
Let’s take a look at two common scenarios that occur within the change data capture pattern that demonstrate this.

### Delta Lake merge for full Change Data

Let’s review the state of our `people` dataset and create a new changeset that we’ll apply

```python
people_table.toDF().show()

+---+-----+---+
| id| name|age|
+---+-----+---+
|  0|  Bob| 23|
|  1|  Sue| 25|
|  2|  Jim| 27|
|  3|Sally| 30|
|  4|Henry| 33|
+---+-----+---+

new_data = [
    (9, "Richard", 75, "INSERT"),
    (3, "Sally", 31, "UPDATE"),
    (0, "Bob", 23, "DELETE"),
]


new_df = spark.createDataFrame(new_data).toDF("id", "name", "age", "_op").repartition(1)
```

When working with change data coming from an upstream source, we’ll usually get the type of operation that was performed to generate it.
In our `new_df` above we now have a new `_op` column that tells us whether the operation was an `INSERT`, `UPDATE`, or `DELETE`.

Our `new_df` has one example of each type of operation: an `INSERT` of a new row for Richard, an `UPDATE` to Sally, and a `DELETE` for Bob.

Here’s what our new merge query should look like to handle this:

```python
people_table.alias("target").merge(
    new_df.alias("source"), "target.id = source.id"
).whenNotMatchedInsert(
    condition='source._op = "INSERT"',
    values={"id": "source.id", "name": "source.name", "age": "source.age"},
).whenMatchedUpdate(
    condition='source._op = "UPDATE"',
    set={"id": "source.id", "name": "source.name", "age": "source.age"},
).whenMatchedDelete(
    condition='source._op = "DELETE"'
).execute()
```

The `merge` statement is now a little longer than our previous two examples, but still follows the same principles.
There are only two differences to highlight:

The first difference is that we added a `whenMatchedDelete` clause.
As the name suggests, this clause will delete any row that matches both our merge condition, `target.id = source.id`, and the additional condition we passed into the `whenMatchedDelete` clause.
This is where we use the `_op` column to check that the operation is `DELETE`.
We have to do this because we have to differentiate between a match that does an `UPDATE` and a match that does `DELETE`.
Note that we’ve also added the condition parameter to the other clauses to account for all three possibilities.

The second difference is that we no longer use `whenMatchedInsertAll` or `whenMatchedUpdateAll` shorthands.
This is because our new data doesn’t have the same schema as our `target` people table, so Delta Lake’s [schema enforcement feature](https://delta.io/blog/2022-11-16-delta-lake-schema-enforcement/) would throw an error.
This would only work if we had schema evolution enabled, which you can read about [here](https://delta.io/blog/2023-02-08-delta-lake-schema-evolution/).
In general, you want to be as explicit as possible to avoid unexpected behavior.

In this example we were still lucky enough to get values for each field in our change data.
How do we use `merge` if we only have partial data?
Let’s take a look at one more example.

### Delta Lake merge for partial Change Data

It’s common for large systems to optimize change data by providing only partial updates.
It’s wasteful to both transport and reprocess entire rows for a wide dataset or even just large data types like arbitrary strings or JSON blobs.
It’s more efficient to send only the data that changed and leave the rest out.

Let’s review our people table and create our final changeset to show what this looks like:

```python
people_table.toDF().show()

+---+-------+---+
| id|   name|age|
+---+-------+---+
|  1|    Sue| 25|
|  2|    Jim| 27|
|  3|  Sally| 31|
|  4|  Henry| 34|
|  5|  Allie| 22|
|  9|Richard| 75|
+---+-------+---+

new_data = [
    (1, "SueNew", None, "UPDATE"),
    (3, None, 32, "UPDATE"),
]

new_df = spark.createDataFrame(new_data).toDF("id", "name", "age", "_op").repartition(1)
```

This time our new data has missing values for both `name` and `age` columns: Sue changed her name to SueNew, and Sally has added another year to her age.

Since we know that we only have updates, we’ll write only the update clause for brevity.
Here’s what our new merge query looks like.

```python
people_table.alias("target").merge(
    new_df.alias("source"), "target.id = source.id"
).whenMatchedUpdate(
    condition='source._op = "UPDATE"',
    set={
        "id": "source.id",
        "name": "CASE WHEN source.name IS NOT NULL THEN source.name ELSE target.name END",
        "age": "CASE WHEN source.age IS NOT NULL THEN source.age ELSE target.age END",
    },
).execute()
```

As we noted in our first example, this is where the explicit dictionary we pass into our clause shows its flexibility.
We have the power to pass arbitrary expressions as values, not just field names.
In this case we explicitly check whether the `source` value is available, and if it’s not, we just tell `merge` to keep the `target` value.

These expressions may look similar to our legacy example but there is an important difference.
In our legacy Hive-style Parquet table example, we used these expressions to emulate our clauses, while in this example we use them to augment our clauses with more conditions.
If we had to write the legacy equivalent of this example we’d need to write out every possible permutation for each field!

Let’s confirm one last time that this merge correctly updated Sue’s name and Sally’s age

```python
people_table.toDF().show()

+---+-------+---+
| id|   name|age|
+---+-------+---+
|  9|Richard| 75|
|  5|  Allie| 22|
|  1| SueNew| 25|
|  3|  Sally| 32|
|  2|    Jim| 27|
|  4|  Henry| 34|
+---+-------+---+
```

## Conclusion

In this post we built up and explored the full range of the Delta Lake `merge` command.

We demonstrated how Delta Lake `merge` is the most powerful and flexible command available for when you want to apply selective changes to a Delta Lake table efficiently.

We learned how to use the available `merge` clauses to perform all three data manipulation operations, `INSERT`, `UPDATE`, and `DELETE`, and how to extend these operations with additional conditions to support more complex logic.

We also learned how to handle merging of missing values and differing schemas, which is common for change data capture use cases.

Delta Lake merge command supports much more than we were able to cover in this one post.
For example, we can also support multiple of the same clauses when each of the clauses have different additional conditions.
This is useful when you want to perform different types of `INSERT` or `UPDATE` operations depending on the contents of a particular row.
We’ll continue to cover more advanced use cases in future posts.

Below are some additional resources to help solidify your understanding of the Delta Lake merge command.
This list includes official documentation, videos, and even some helper libraries you can use to help simplify complicated merge statements that emerge from use cases like maintaining slowly changing dimensions.

[Delta Lake PySpark documentation page](https://docs.delta.io/latest/api/python/index.html)
[Merge — Delta Lake Documentation](https://docs.delta.io/latest/delta-update.html)
[Tech Talk | Diving into Delta Lake Part 3: How do DELETE, UPDATE, and MERGE work](https://www.youtube.com/watch?v=7ewmcdrylsA)
[mack - Delta Lake helper methods in Python](https://github.com/MrPowers/mack)
