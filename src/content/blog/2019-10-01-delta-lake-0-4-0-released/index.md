---
title: Delta Lake 0.4.0 Released
description: We are excited to announce the release of Delta Lake 0.4.0 which introduces Python APIs for manipulating and managing data in Delta tables.
thumbnail: "./thumbnail.png"
author: dennyglee
publishedAt: 2019-10-01
---

## Key features

We are excited to announce the release of Delta Lake 0.4.0 which introduces Python APIs for manipulating and managing data in Delta tables. The key features in this release are:

- **Python APIs for DML and utility operations ([#89](https://github.com/delta-io/delta/issues/89))** - You can now use Python APIs to update/delete/merge data in Delta Lake tables and to run utility operations (i.e., vacuum, history) on them. These are great for building complex workloads in Python, e.g., [Slowly Changing Dimension (SCD)](https://docs.delta.io/0.4.0/delta-update.html#slowly-changing-data-scd-type-2-operation-into-delta-tables) operations, merging [change data](https://docs.delta.io/0.4.0/delta-update.html#write-change-data-into-a-delta-table) for replication, and [upserts from streaming queries](https://docs.delta.io/0.4.0/delta-update.html#upsert-from-streaming-queries-using-foreachbatch). See the [documentation](https://docs.delta.io/0.4.0/delta-update.html) for more details.
- **Convert-to-Delta ([#78](https://github.com/delta-io/delta/issues/78))** - You can now convert a Parquet table in place to a Delta Lake table without rewriting any of the data. This is great for converting very large Parquet tables which would be costly to rewrite as a Delta table. Furthermore, this process is reversible - you can convert a Parquet table to Delta Lake table, operate on it (e.g., delete or merge), and easily convert it back to a Parquet table. See the [documentation](https://docs.delta.io/0.4.0/delta-utility.html#convert-to-delta) for more details.
- **SQL for utility operations** - You can now use SQL to run utility operations vacuum and history. See the [documentation](https://docs.delta.io/0.4.0/delta-utility.html#enable-sql-commands-within-apache-spark) for more details on how to configure Spark to execute these Delta-specific SQL commands.

To try out Delta Lake 0.4.0, please follow the [Getting Started guide](/learn/getting-started).

Visit the [release notes](https://github.com/delta-io/delta/releases/tag/v0.4.0) to learn more about the release.
