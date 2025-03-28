---
title: Delta Lake 0.7.0 Released
description: We are excited to announce the release of Delta Lake 0.7.0 on Apache Spark 3.0. This is the first release on Spark 3.x and adds support for metastore-defined tables and SQL DDLs.
thumbnail: "./thumbnail.png"
author: dennyglee
publishedAt: 2020-06-18
---

## Key features

We are excited to announce the release of [Delta Lake 0.7.0](https://github.com/delta-io/delta/releases/tag/v0.7.0) on Apache Spark 3.0. This is the first release on Spark 3.x and adds support for metastore-defined tables and SQL DDLs. The key features in this release are as follows.

- **Support for defining tables in the Hive metastore ([#85](https://github.com/delta-io/delta/issues/85))** - You can now define Delta tables in the Hive metastore and use the table name in all SQL operations. Specifically, we have added support for:
  - SQL DDLs to [create tables](https://docs.delta.io/0.7.0/delta-batch.html#create-a-table), [insert into tables](https://docs.delta.io/0.7.0/delta-batch.html#write-to-a-table), [explicitly alter the schema of the tables](https://docs.delta.io/0.7.0/delta-batch.html#explicitly-update-schema), etc. See the [Scala](https://github.com/delta-io/delta/tree/master/examples/scala) and [Python](https://github.com/delta-io/delta/tree/master/examples/python) examples for details.
  - `DataFrame.saveAsTable(tableName)` and `DataFrameWriterV2 APIs` ([#307](https://github.com/delta-io/delta/issues/307)). DeltaTable.forName(tableName) API to create instances of io.delta.tables.DeltaTable ([#412](https://github.com/delta-io/delta/issues/412)).This integration uses Catalog APIs introduced in Spark 3.0. You must enable the Delta Catalog by setting additional configurations when starting your SparkSession. See the [documentation](https://docs.delta.io/0.7.0/delta-batch.html#configure-sparksession) for details.
- **Support for SQL Delete, Update and Merge** - With Spark 3.0, you can now use SQL DML operations `DELETE`, `UPDATE` and `MERGE`. See the [documentation](https://docs.delta.io/0.7.0/delta-update.html) for details.
- **Support for automatic and incremental Presto/Athena manifest generation ([#453](https://github.com/delta-io/delta/issues/453))** - You can now use `ALTER TABLE SET TBLPROPERTIES` to enable automatic regeneration of the Presto/Athena manifest files on every operation on a Delta table. This regeneration is incremental, that is, manifest files are updated for only the partitions that have been updated by the operation. See the [documentation](https://docs.delta.io/0.7.0/presto-integration.html#step-3-update-manifests) for details.
- **Support for controlling the retention of the table history** - You can now use `ALTER TABLE SET TBLPROPERTIES` to configure how long the table history and delete files are maintained in Delta tables. See the [documentation](https://docs.delta.io/0.7.0/delta-batch.html#data-retention) for details.
- **Support for adding user-defined metadata in Delta table commits** - You can now add user-defined metadata as strings in commits made to a Delta table by any operation. For `DataFrame.write` and `DataFrame.writeStream` operations, you can set the option `userMetadata`. For other operations, you can set the SparkSession configuration `spark.databricks.delta.commitInfo.userMetadata`. See the [documentation](https://docs.delta.io/0.7.0/delta-batch.html#set-user-defined-commit-metadata) for details.
- **Support Azure Data Lake Storage Gen2 ([#288](https://github.com/delta-io/delta/issues/288))** - Spark 3.0 has support for Hadoop 3.2 libraries which enables support for [Azure Data Lake Storage Gen2](https://docs.microsoft.com/en-us/azure/storage/blobs/data-lake-storage-introduction). See the [documentation](https://docs.delta.io/0.7.0/delta-storage.html#azure-data-lake-storage-gen2) for details on how to configure Delta Lake with the correct versions of Spark and Hadoop libraries for Azure storage systems.
- **Improved support for streaming one-time triggers** - With Spark 3.0, we now ensure that [one-time trigger](https://spark.apache.org/docs/latest/structured-streaming-programming-guide.html#triggers) (also known as `Trigger.Once`) processes all outstanding data in a Delta table in a single micro-batch even if rate limits are set with the `DataStreamReader` option `maxFilesPerTrigger`.

Due to the significant internal changes, workloads on previous versions of Delta using the `DeltaTable` programmatic APIs may require additional changes to migrate to 0.7.0. See the [Migration Guide](https://docs.delta.io/0.7.0/porting.html#migrate-delta-lake-workloads-to-newer-versions) for details.

## Credits

Alan Jin, Alex Ott, Burak Yavuz, Jose Torres, Pranav Anand, QP Hou, Rahul Mahadev, Rob Kelly, Shixiong Zhu, Subhash Burramsetty, Tathagata Das, Wesley Hoffman, Yin Huai, Youngbin Kim, Zach Schuermann, Eric Chang, Herman van Hovell, Mahmoud Mahdi

Thank you for your contributions.

Visit the [release notes](https://github.com/delta-io/delta/releases/tag/v0.7.0) to learn more about the release.
