---
title: New features in the Python deltalake 0.12.0 release
description: This post explains the new features in the Python deltalake 0.12.0 release
thumbnail: "./thumbnail.png"
author: ion-koutsouris
publishedAt: 2023-10-22
---

The Python deltalake 0.12.0 release is a game-changer, introducing a suite of powerful Delta operations such as MERGE (upserts), DELETE, and UPDATE. In addition, this release brings substantial performance enhancements, boosting read performance by up to 10 times. Furthermore, it significantly improves interoperability with large Arrow data types during writing.

## MERGE operation: Effortless Data Integration

Merging data is one of the most versatile operations that Delta Lake brings to the table. It can handle updates, deletions, and inserts simultaneously, making it a pivotal tool for data engineers and data scientists. Some of the use cases are handling Slowly Changing Dimensions (SCD), processing only the changed data (CDC), handling deduplication during writing, and various other cases. Let's explore the capabilities of MERGE with a real-world example.

### Upserts Made Easy

Imagine you have a source table or DataFrame, and you want to upsert its data into a target table using `.merge()`, `when_matched_update()`, and `when_not_matched_upsert()`. Let's consider a scenario where we have our initial load of the SalesOrder table.

```python
from deltalake import DeltaTable, write_deltalake
from datetime import datetime
import polars as pl

df = pl.DataFrame(
    {
        "sales_order_id": ["1000", "1001", "1002", "1003"],
        "product": ["bike", "scooter", "car", "motorcycle"],
        "order_date": [
            datetime(2023, 1, 1),
            datetime(2023, 1, 5),
            datetime(2023, 1, 10),
            datetime(2023, 2, 1),
        ],
        "sales_price": [120.25, 2400, 32000, 9000],
        "paid_by_customer": [True, False, False, True],
    }
)
print(df)

df.write_delta("sales_orders", mode="append")
```

```
    ┌────────────────┬────────────┬─────────────────────┬─────────────┬──────────────────┐
    │ sales_order_id ┆ product    ┆ order_date          ┆ sales_price ┆ paid_by_customer │
    │ ---            ┆ ---        ┆ ---                 ┆ ---         ┆ ---              │
    │ str            ┆ str        ┆ datetime[μs]        ┆ f64         ┆ bool             │
    ╞════════════════╪════════════╪═════════════════════╪═════════════╪══════════════════╡
    │ 1000           ┆ bike       ┆ 2023-01-01 00:00:00 ┆ 120.25      ┆ true             │
    │ 1001           ┆ scooter    ┆ 2023-01-05 00:00:00 ┆ 2400.0      ┆ false            │
    │ 1002           ┆ car        ┆ 2023-01-10 00:00:00 ┆ 32000.0     ┆ false            │
    │ 1003           ┆ motorcycle ┆ 2023-02-01 00:00:00 ┆ 9000.0      ┆ true             │
    └────────────────┴────────────┴─────────────────────┴─────────────┴──────────────────┘
```

The above code demonstrates how to write the initial data into a Delta table. Now, let's say we receive a new batch of changed data, including updates, as some customers have paid their orders, and we've adjusted prices for certain products. We've also made a new car sale.

```python
new_data = pl.DataFrame(
    {
        "sales_order_id": ["1002", "1004"],
        "product": ["car", "car"],
        "order_date": [datetime(2023, 1, 10), datetime(2023, 2, 5)],
        "sales_price": [30000.0, 40000.0],
        "paid_by_customer": [True, True],
    }
)
```

To perform the upsert, we load the sales order table as a DeltaTable object and use the `.merge()` operation to specify the source data and the predicate for matching records. The `when_matched_update_all()` and `when_not_matched_insert_al()` functions are then used to specify how updates and inserts should be handled for all columns. Finally, the operation is executed with `execute()`.

You can optionally provide `source_alias`, `target_alias` and `error_on_type_mismatch` parameters. By default, the merge operation will error out if there are type mismatches.

```python
from polars.io.delta import _convert_pa_schema_to_delta

dt = DeltaTable("sales_orders")
source = new_data.to_arrow()
delta_schema = _convert_pa_schema_to_delta(source.schema)
source = source.cast(delta_schema)

(
    dt.merge(
        source=source,
        predicate="s.sales_order_id = t.sales_order_id",
        source_alias="s",
        target_alias="t",
    )
    .when_matched_update_all()
    .when_not_matched_insert_all()
    .execute()
)
```

```
{'num_source_rows': 2,
    'num_target_rows_inserted': 1,
    'num_target_rows_updated': 1,
    'num_target_rows_deleted': 0,
    'num_target_rows_copied': 3,
    'num_output_rows': 5,
    'num_target_files_added': 1,
    'num_target_files_removed': 1,
    'execution_time_ms': 51,
    'scan_time_ms': 0,
    'rewrite_time_ms': 45}
```

We can see in the metrics, one target_row got inserted and one got updated. If we read the delta table with Polars we can see that order_id 1002 got an updated sales_price and paid_by_customer field, and we added a new sales with order_id 1004.

```python
print(pl.read_delta("sales_orders"))
```

```
┌────────────────┬────────────┬─────────────────────┬─────────────┬──────────────────┐
│ sales_order_id ┆ product    ┆ order_date          ┆ sales_price ┆ paid_by_customer │
│ ---            ┆ ---        ┆ ---                 ┆ ---         ┆ ---              │
│ str            ┆ str        ┆ datetime[μs]        ┆ f64         ┆ bool             │
╞════════════════╪════════════╪═════════════════════╪═════════════╪══════════════════╡
│ 1002           ┆ car        ┆ 2023-01-10 00:00:00 ┆ 30000.0     ┆ true             │
│ 1000           ┆ bike       ┆ 2023-01-01 00:00:00 ┆ 120.25      ┆ true             │
│ 1001           ┆ scooter    ┆ 2023-01-05 00:00:00 ┆ 2400.0      ┆ false            │
│ 1003           ┆ motorcycle ┆ 2023-02-01 00:00:00 ┆ 9000.0      ┆ true             │
│ 1004           ┆ car        ┆ 2023-02-05 00:00:00 ┆ 40000.0     ┆ true             │
└────────────────┴────────────┴─────────────────────┴─────────────┴──────────────────┘
```

This real-world example illustrates how the MERGE operation in Delta-RS simplifies data integration, enabling you to handle changes, updates, and inserts seamlessly. For more examples of what Merge allows you to do, take a look at the [Delta Lake Merge](https://delta.io/blog/2023-02-14-delta-lake-merge/) blog post.

## UPDATE operation: Fine-Tuning data

Sometimes, you just need to make specific updates in your data based on a predicate. In this case, the `.update()` operation comes to the rescue. Let's consider a simple example where we need to correct a typo in the "product" column.

```python
df = pl.DataFrame({"id": [1, 2, 3], "product": ["appl", "apple", "kiwi"]})
df.write_delta("update_test", mode="overwrite")
```

With the data in place, we load the Delta table and use the .update() operation to fix the typo in the "product" column where the predicate is met. Soon, you'll be able to [pass Python objects](https://github.com/delta-io/delta-rs/pull/1749) as input to the `.update()` operation, making it even more flexible.

```python
dt = DeltaTable("update_test")

dt.update(updates={"product": "'apple'"}, predicate="product = 'appl'")
print(pl.read_delta("update_test"))
```

```
┌─────┬─────────┐
│ id  ┆ product │
│ --- ┆ ---     │
│ i64 ┆ str     │
╞═════╪═════════╡
│ 1   ┆ apple   │
│ 2   ┆ apple   │
│ 3   ┆ kiwi    │
└─────┴─────────┘
```

The result is a corrected "product" column in our Delta table, showcasing how the UPDATE operation allows you to fine-tune your data effortlessly.

## DELETE operation: Managing Data Cleanup

The DELETE operation is a powerful tool for data cleanup and management. For instance, you can use it to remove soft-deleted records from your table. Here's an example of how it works.

```python
df = pl.DataFrame({"id": [1, 2, 3], "deleted": [False, True, True]})
df.write_delta("delete_test", mode="overwrite")
```

After loading the Delta table, we use the `.delete()` operation with the predicate "deleted = True" to remove the flagged records. If no predicate is provided, all records are deleted.

```python
dt = DeltaTable("delete_test")

dt.delete(predicate="deleted = True")
print(pl.read_delta("delete_test"))
```

```
┌─────┬─────────┐
│ id  ┆ deleted │
│ --- ┆ ---     │
│ i64 ┆ bool    │
╞═════╪═════════╡
│ 1   ┆ false   │
└─────┴─────────┘
```

The result is a cleaned-up Delta table with only the non-deleted records, illustrating how the DELETE operation is a valuable operation for data management.

## Enhanced Interoperability with Large Arrow Data

In this release, Delta-RS introduces enhanced interoperability with large Arrow data types. You can now do consecutive writes with Arrow tables that have large Arrow types directly using `write_deltalake` by just enabling `large_dtypes=True`.

```python
df = pl.DataFrame({"id": [1, 2, 3], "deleted": [False, True, False]})
```

```python
source = df.to_arrow()
print(f"schema: {source.schema}\n")
write_deltalake("sample_table", source, large_dtypes=True, mode="overwrite")

dt = DeltaTable("sample_table")
print(f"history: {dt.history()[0]}")
```

```
schema:
    id: int64
    deleted: bool

history: {'timestamp': 1697974132175, 'operation': 'WRITE', 'operationParameters': {'mode': 'Overwrite', 'partitionBy': '[]'}, 'clientVersion': 'delta-rs.0.17.0', 'version': 7}
```

The improved interoperability enables smoother integration with libraries like `Polars`, where you can work with large data types without conversion.

## Conclusion: Bridging the Gap in Data Workloads

The 0.12.0 Python release of Delta-RS brings many powerful operations, such as MERGE, DELETE, and UPDATE, directly to Python users. This empowers data scientists and data engineers working in non-JVM workloads to build and enhance lakehouse solutions. It bridges the gap between small-to-medium data workloads, commonly handled with tools like Polars, DuckDB, or Pandas, and big data workloads managed with Spark.

Big shout out to the amazing [contributors](https://github.com/delta-io/delta-rs/graphs/contributors) of Delta-RS, a lot of effort has gone into building the Rust API!

## What's on the Horizon for Delta-RS?

- Add support for table features (read support V3, writer support V7) and improving the overall protocol support
- Integration of Rust Delta Kernel in Delta-RS
- Use logical plans in MERGE for improved performance
- Multiple "when" clauses in Python MERGE
- Expose FSCK (repair) operation to Python
- Adding VACUUM to the transaction log
