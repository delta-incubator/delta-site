---
title: Delta Lake 0.8.0 Released
description: We are excited to announce the release of Delta Lake 0.8.0.
thumbnail: "./thumbnail.png"
author: dennyglee
publishedAt: 2021-02-04
---

## Key features

We are excited to announce the release of [Delta Lake 0.8.0](https://github.com/delta-io/delta/releases/tag/v0.8.0). The key features in this release are as follows.

- **Unlimited MATCHED and NOT MATCHED clauses for merge operations in Scala, Java, and Python** - merge operations now support any number of whenMatched and whenNotMatched clauses. In addition, merge queries that unconditionally delete matched rows no longer throw errors on multiple matches. See the [documentation](https://docs.delta.io/0.8.0/delta-update.html#operation-semantics) for details.
- **MERGE operation now supports schema evolution of nested columns** - Schema evolution of nested columns now has the same semantics as that of top-level columns. For example, new nested columns can be automatically added to a StructType column. See [Automatic schema evolution in Merge](https://docs.delta.io/0.8.0/delta-update.html#operation-semantics) for details.
- **MERGE INTO and UPDATE operations now resolve nested struct columns by name** - Update operations UPDATE and MERGE INTO commands now resolve nested struct columns by name. That is, when comparing or assigning columns of type StructType, the order of the nested columns does not matter (exactly in the same way as the order of top-level columns). To revert to resolving by position, set the Spark configuration `"spark.databricks.delta.resolveMergeUpdateStructsByName.enabled"` to `"false"`.
- **Check constraints on Delta tables** - Delta now supports `CHECK` constraints. When supplied, Delta automatically verifies that data added to a table satisfies the specified constraint expression. To add `CHECK` constraints, use the `ALTER TABLE ADD CONSTRAINTS` command. See the [documentation](https://docs.delta.io/0.8.0/delta-constraints.html) for details.
- **Start streaming a table from a specific version ([#474](https://github.com/delta-io/delta/issues/474))** - When using Delta as a streaming source, you can use the options `startingTimestamp` or `startingVersion` to start processing the table from a given version and onwards. You can also set `startingVersion` to `latest` to skip existing data in the table and stream from the new incoming data. See the [documentation](https://docs.delta.io/0.8.0/delta-streaming.html#specify-initial-position) for details.
- **Ability to perform parallel deletes with VACUUM ([#395](https://docs.delta.io/0.8.0/delta-streaming.html#specify-initial-position))** - When using `VACUUM`, you can set the session configuration "`spark.databricks.delta.vacuum.parallelDelete.enabled`" to "`true`" in order to use Spark to perform the deletion of files in parallel (based on the number of shuffle partitions). See the [documentation](https://docs.delta.io/0.8.0/delta-utility.html#remove-files-no-longer-referenced-by-a-delta-table) for details.
- **Use Scala implicits to simplify read and write APIs** - You can import `io.delta.implicits._` to use the `delta` method with Spark read and write APIs such as `spark.read.delta("/my/table/path")`. See the [documentation](https://docs.delta.io/0.8.0/delta-streaming.html#delta-table-as-a-stream-source) for details.

## Credits

Adam Binford, Alan Jin, Alex liu, Ali Afroozeh, Andrew Fogarty, Burak Yavuz, David Lewis, Gengliang Wang, HyukjinKwon, Jacek Laskowski, Jose Torres, Kian Ghodoussi, Linhong Liu, Liwen Sun, Mahmoud Mahdi, Maryann Xue, Michael Armbrust, Mike Dias, Pranav Anand, Rahul Mahadev, Scott Sandre, Shixiong Zhu, Stephanie Bodoff, Tathagata Das, Wenchen Fan, Wesley Hoffman, Xiao Li, Yijia Cui, Yuanjian Li, Zach Schuermann, contrun, ekoifman, Yi Wu

Thank you for your contributions.

Visit the [release notes](https://github.com/delta-io/delta/releases/tag/v0.8.0) to learn more about the release.
