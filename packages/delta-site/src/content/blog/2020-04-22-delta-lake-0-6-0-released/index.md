---
title: Delta Lake 0.6.0 Released
description: We are excited to announce the release of Delta Lake 0.6.0, which introduces schema evolution and performance improvements in merge, and operation metrics in table history.
thumbnail: "./thumbnail.png"
author: dennyglee
publishedAt: 2020-04-22
---

## Key features

We are excited to announce the release of Delta Lake 0.6.0, which introduces schema evolution and performance improvements in merge, and operation metrics in table history. The key features in this release are:

- **Support for schema evolution in merge operations ([#170](https://github.com/delta-io/delta/issues/170))** - You can now automatically evolve the schema of the table with the merge operation. This is useful in scenarios where you want to upsert change data into a table and the schema of the data changes over time. Instead of detecting and applying schema changes before upserting, merge can simultaneously evolve the schema and upsert the changes. See the [documentation](https://docs.delta.io/0.6.0/delta-update.html#automatic-schema-evolution) for details.
- **Improved merge performance with automatic repartitioning ([#349](https://github.com/delta-io/delta/issues/349))** - When merging into partitioned tables, you can choose to automatically repartition the data by the partition columns before writing to the table. In cases where the merge operation on a partitioned table is slow because it generates too many small files ([#345](https://github.com/delta-io/delta/issues/345)), enabling automatic repartition can improve performance. See the [documentation](https://docs.delta.io/0.6.0/delta-update.html#performance-tuning) for details.
- **Improved performance when there is no insert clause ([#342](https://github.com/delta-io/delta/issues/342))** - You can now get better performance in a merge operation if it does not have any insert clause.
- **Operation metrics in DESCRIBE HISTORY ([#312](https://github.com/delta-io/delta/issues/312))** - You can now see operation metrics (for example, number of files and rows changed) for all writes, updates, and deletes on a Delta table in the table history. See the [documentation](https://docs.delta.io/0.6.0/delta-utility.html#history) for details.
- **Support for reading Delta tables from any file system ([#347](https://github.com/delta-io/delta/issues/347))** - You can now read Delta tables on any storage system with a Hadoop FileSystem implementation. However, writing to Delta tables still requires configuring a LogStore implementation that gives the necessary guarantees on the storage system. See the [documentation](https://docs.delta.io/0.6.0/delta-storage.html) for details.

## Credits

Ali Afroozeh, Andrew Fogarty, Anurag870, Burak Yavuz, Erik LaBianca, Gengliang Wang, IonutBoicuAms, Jakub Orłowski, Jose Torres, KevinKarlBob, Michael Armbrust, Pranav Anand, Rahul Govind, Rahul Mahadev, Shixiong Zhu, Steve Suh, Tathagata Das, Timothy Zhang, Tom van Bussel, Wesley Hoffman, Xiao Li, chet, Eugene Koifman, Herman van Hovell, hongdd, lswyyy, lys0716, Mahmoud Mahdi, Maryann Xue

Thank you for your contributions.

Visit the [release notes](https://github.com/delta-io/delta/releases/tag/v0.6.0) to learn more about the release.
