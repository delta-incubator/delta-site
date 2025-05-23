---
title: Delta Lake 1.0.0 Released
description: We are excited to announce the release of Delta Lake 1.0.0 on Apache Spark 3.1.
thumbnail: "./thumbnail.png"
author: tathagatadas
publishedAt: 2021-05-24
---

#### Key features

We are excited to announce the release of [Delta Lake 1.0.0](https://github.com/delta-io/delta/releases/tag/v1.0.0) on Apache Spark 3.1. The key features in this release are as follows:

- **Unlimited `MATCHED` and `NOT MATCHED` clauses for merge operations in SQL** - with the upgrade to Apache Spark 3.1, the `MERGE` SQL command now supports any number of `WHEN MATCHED` and `WHEN NOT MATCHED` clauses (Scala, Java and Python APIs already support unlimited clauses since 0.8.0 on Spark 3.0). See the [documentation on `MERGE`](https://docs.delta.io/1.0.0/delta-update.html#operation-semantics) for more details.
- **New programmatic APIs to create tables** - Delta Lake now allows you to directly create new Delta Tables programmatically (Scala, Java, and Python) without using DataFrame APIs. We have introduced new DeltaTableBuilder and DeltaColumnBuilder APIs to specify all the table details that you can specify through SQL `CREATE TABLE`. See the [documentation for details and examples](https://docs.delta.io/1.0.0/delta-batch.html#create-a-table).
- **Experimental support for Generated Columns** - Delta Lake now supports Generated Columns which are a special type of column whose values are automatically generated based on a user-specified function over other columns in the Delta table. You can use most built-in SQL functions in Apache Spark to generate the values of these generated columns. For example, you can automatically generate a date column (for partitioning the table by date) from the timestamp column; any writes into the table need only specify the data for the timestamp column. You can create Delta tables with Generated Columns using the new programmatic APIs to create tables. See the [documentation](https://docs.delta.io/1.0.0/delta-batch.html#use-generated-columns) for details.
- **Simplified storage configuration** - Delta Lake can now automatically load the correct LogStore needed for common storage systems hosting the Delta table being read or written to. Users no longer need to explicitly configure the LogStore implementation if they are running Delta Lake on AWS S3, Azure blob stores, and HDFS. This also allows the same application to simultaneously read and write to Delta tables on different cloud storage systems. The scheme of the Delta table path is used to dynamically load the necessary LogStore implementation. Using storage systems other than the ones listed above still needs explicit configuration. See the documentation on [storage configuration](https://docs.delta.io/1.0.0/delta-storage.html) for details.
- **Experimental support for additional cloud storage systems** - Delta Lake now has experimental support for [Google Cloud Storage](https://cloud.google.com/storage), [Oracle Cloud Storage](https://www.oracle.com/cloud/storage/), [IBM Cloud Object Storage](https://www.ibm.com/cloud/object-storage). You will have to add an additional maven artifact `delta-contribs` to access the LogStores corresponding to them, and explicitly configure the LogStore names corresponding to the relevant path schemes. See the documentation on [storage configuration](/blog/2021-05-24-delta-lake-1-0-0-released/) for details. In addition, we have also defined a more stable LogStore API for building custom implementations.
- **Public APIs for catching exceptions due to conflicts** - The exceptions thrown on conflict between concurrent operations have now been converted to public APIs. This allows you to catch those exceptions and rety your write operations. See the [API documentation](/blog/2021-05-24-delta-lake-1-0-0-released/) for details.
- **PyPI release** - Delta Lake can now be installed from [PyPI](https://pypi.org/project/delta-spark/1.0.0/) with `pip install delta-spark`. However, along with pip installation, you also have to configure the SparkSession. See the [documentation](https://docs.delta.io/1.0.0/quick-start.html#set-up-project) for details.
- Other notable changes:
  - New Maven artifact `delta-contribs` which contain contributions from the community that are still experimental and need more testing before being packaged in the main artifact `delta-core`.
  - Execution time metrics for UPDATE, DELETE, and MERGE operations are available in [table history](https://docs.delta.io/1.0.0/delta-utility.html#operation-metrics-keys).
  - Fixed multiple bugs in schema evolution of nested columns in MERGE operation.
  - Fixed bug in handling dots in column names.

#### Credits

Alex Ott, Ali Afroozeh, Antonio, Bruno Palos, Burak Yavuz, Christopher Grant, Denny Lee, Gengliang Wang, Guy Khazma, Howard Xiao, Jacek Laskowski, Joe Widen, Jose Torres, Lars Kroll, Linhong Liu, Meng Tong, Prakhar Jain, Pranav Anand, R. Tyler Croy, Rahul Mahadev, Ranu Vikram, Sabir Akhadov, Shixiong Zhu, Stefan Zeiger, Tathagata Das, Tom van Bussel, Vijayan Prabhakaran, Vivek Bhaskar, Wenchen Fan, Yijia Cui, Yingyi Bu, Yuchen Huo, Brenner Heintz, fvaleye, Herman van Hovell, Liwen Sun, Mahmoud Mahdi, Sabir Akhadov, Yaohua Zhao

Visit the [release notes](https://github.com/delta-io/delta/releases/tag/v1.0.0) to learn more about the release.
