---
title: Delta Connectors 0.3.0 Released
description: We are excited to announce the release of Delta Connectors 0.3.0.
thumbnail: "./thumbnail.png"
author: allisonportis
publishedAt: 2022-01-06
---

We are excited to announce the release of Delta Connectors 0.3.0, which introduces support for writing Delta tables. The key features in this release are:

#### Delta Standalone

- **Write functionality** - This release introduces new APIs to support creating and writing Delta tables without Apache Spark™. External processing engines can write parquet data files themselves and then use the APIs to add the files to the Delta table atomically. Following the [Delta Transaction Log Protocol](https://github.com/delta-io/delta/blob/master/PROTOCOL.md), the implementation uses optimistic concurrency control to manage multiple writers, automatically generates checkpoint files, and manages log and checkpoint cleanup according to the protocol. The main Java class exposed is `OptimisticTransaction`, which is accessed via `DeltaLog.startTransaction()`.

  - `OptimisticTransaction.markFilesAsRead(readPredicates)` must be used to read all metadata during the transaction (and not the `DeltaLog`). It is used to detect concurrent updates and determine if logical conflicts between this transaction and previously-committed transactions can be resolved.
  - `OptimisticTransaction.commit(actions, operation, engineInfo)` is used to commit changes to the table. If a conflicting transaction has been committed first (see above) an exception is thrown, otherwise the table version that was committed is returned.
  - Idempotent writes can be implemented using `OptimisticTransaction.txnVersion(appId)` to check for version increases committed by the same application.
  - Each commit must specify the `Operation` being performed by the transaction.
  - Transactional guarantees for concurrent writes on Microsoft Azure and Amazon S3. This release includes custom extensions to support concurrent writes on Azure and S3 storage systems, which on their own do not have the necessary atomicity and durability guarantees. Please note that transactional guarantees are only provided for concurrent writes on S3 from a single cluster.

- **Memory-optimized iterator implementation for reading files in a snapshot** - `DeltaScan` introduces an iterator implementation for reading the `AddFiles` in a snapshot with support for partition pruning. It can be accessed via `Snapshot.scan()` or `Snapshot.scan(predicate)`, the latter of which filters files based on the `predicate` and any partition columns in the file metadata. This API significantly reduces the memory footprint when reading the files in a `Snapshot` and when instantiating a `DeltaLog` (due to internal utilization).

- **Partition filtering for metadata reads and conflict detection in writes** - This release introduces a simple expression framework for partition pruning in metadata queries. When reading files in a snapshot, filter the returned `AddFiles` on partition columns by passing a `predicate` into `Snapshot.scan(predicate)`. When updating a table during a transaction, specify which partitions were read by passing a `readPredicate` into `OptimisticTransaction.markFilesAsRead(readPredicate)` to detect logical conflicts and avoid transaction conflicts when possible.

- **Miscellaneous updates:**

  - `ParquetSchemaConverter` converts a `StructType` schema to a Parquet schema.
  - `Iterator<VersionLog> DeltaLog.getChanges()` exposes an incremental metadata changes API. VersionLog wraps the version number, and the list of actions in that version.
  - Fix [#197](https://github.com/delta-io/connectors/pull/197) for `RowRecord` so that values in partition columns can be read.
  - Miscellaneous bug fixes.

#### Delta Connectors

- **Hive 3 support for the [Hive Connector](https://mvnrepository.com/artifact/io.delta/delta-hive)**

- **[Microsoft PowerBI](https://powerbi.microsoft.com/en-us/) connector for reading Delta tables natively** - Read Delta tables directly from PowerBI from any storage system supported by PowerBI without running a Spark cluster. Features include online/scheduled refresh in the PowerBI service, support for Delta Lake time travel (e.g. `VERSION AS OF`), and partition elimination using the partition schema of the Delta table. For more details see the dedicated [README.md](https://github.com/delta-io/delta/blob/master/connectors/powerbi/README.md).

#### Credits

Alex, Allison Portis, Denny Lee, Gerhard Brueckl, Pawel Kubit, Scott Sandre, Shixiong Zhu, Wang Wei, Yann Byron, Yuhong Chen, gurunath

Visit the [release notes](https://github.com/delta-io/connectors/releases/tag/v0.3.0) to learn more about the release.
