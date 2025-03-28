---
title: Delta Lake 3.3
description: Announcing Delta Lake 3.3 on Apache Spark 3.5, with features that improve the performance and interoperability of Delta Lake.
thumbnail: "./thumbnail.png"
author:
  - allisonportis
  - susan-pierce
publishedAt: 2025-01-15
---

We are pleased to announce the release of Delta Lake 3.3 ([release notes]) on Apache Spark 3.5.3,
with features that improve the performance and interoperability of Delta Lake. Whether you’re
building scalable pipelines, optimizing queries, or ensuring data governance, this release is
designed to help you achieve more with less effort.

[release notes]: https://github.com/delta-io/delta/releases/tag/v3.3.0

Let’s dive into the highlights:

- [Identity columns](#identity-columns) assign unique values for each record inserted into a table
- [VACUUM LITE](#vacuum-lite) uses the Delta transaction log to identify unreferenced files for faster table maintenance
- [Row Tracking Backfill](#row-tracking-backfill) track row-level lineage in Delta Spark on existing tables
- [Version Checksums](#version-checksums) provide stronger consistency guarantees, enhanced performance, and easier debugging
- [UniForm ALTER](#Enable-UniForm-on-ALTER) supports enabling UniForm on existing Delta Lake tables without rewriting data
- [Type Widening](#type-widening-for-delta-kernel) is now supported in Delta Kernel Java and Rust

## What’s new in Delta Lake 3.3?

Building on the features released in Delta Lake 3.0+, Delta Lake 3.3 introduces a host of
performance enhancements and optimizations.

### Identity Columns

Identity Columns are columns in a table that automatically generate a unique ID for each
new row. A long-time staple of data warehousing workloads, they commonly serve as primary
and foreign keys when modeling data. Delta Lake 3.3 supports creating identity columns with unique,
auto-incrementing ID numbers for each new row. This dramatically simplifies data modeling and
avoids the need to roll manual, brittle solutions. See the documentation for more information.

### VACUUM LITE

Table maintenance just got easier and faster. With VACUUM LITE, you can clean up unreferenced files
faster than ever before. This feature uses the Delta transaction log to identify and remove
outdated files, delivering 5-10x performance improvements for periodic cleanup tasks. Save time and
reduce costs with this optimized approach to table maintenance. See github for more information.

### Row Tracking Backfill

Row Tracking is a feature to track row-level lineage in Delta Spark, introduced in Delta 3.2
for new tables. With Backfill support, you can now enable Row Tracking on existing tables.
When enabled, users can identify rows across multiple versions of the table and can access this
tracking information using the two metadata fields Row Id and Row Commit Version. Refer to the
documentation on Row Tracking for more information and examples.

### Version Checksums

Delta Lake now includes version checksums for every table commit, bringing stronger consistency
guarantees and better debugging tools to your data ecosystem. Detailed metrics like file counts,
table size, and data distribution histograms enable automatic detection of potential state
inconsistencies. State validation is performed at every checkpoint, which helps maintain table
integrity in distributed environments. The Checksum is also used to bypass the initial Spark
query that retrieves the Protocol and Metadata actions, resulting in a decreased snapshot
initialization latency. See github for more information.

### Enable UniForm on ALTER

Delta Lake now supports enabling UniForm Iceberg on existing tables, without having to rewrite
data. This means you can seamlessly read and share tables across Iceberg clients, enhancing
compatibility and flexibility for diverse workflows. See the documentation for more details.

### Type widening for Delta Kernel

The Delta Kernel project is a set of Java and Rust libraries for building Delta connectors
that can read and write to Delta tables without needing to understand the Delta protocol
details. Type widening is a feature that allows you to change the type of certain columns
in a Delta table to a wider type, to accommodate data expansion, without rewriting any
existing data. When tables are enabled with type widening, you can manually enable type
changes using the ALTER TABLE ALTER COLUMN command. Automatic type migration with schema
evolution is also enabled for INSERT and MERGE INTO commands.

In this release, both Kernel implementations now support reading tables with type widening enabled,
ensuring better compatibility and smooth handling of schema changes. Any connectors developed using
either of the Kernel implementations can now read tables that include any data types eligible
for type widening.

## Additional features

These are just a few highlights. Additional features include:

- Liquid Clustering convenience and performance features:

  - [OPTIMIZE FULL](https://github.com/delta-io/delta/pull/3793): Recluster all records in a table for peak performance.
  - [Unpartitioned Tables](https://github.com/delta-io/delta/pull/3174): Enable clustering on an existing, unpartitioned table.
  - [External Locations](https://github.com/delta-io/delta/pull/3251): Create clustered tables from external storage.

- UniForm performance optimizations and functionality:

  - Support for [timestamp-type partition columns](https://github.com/delta-io/delta/commit/7a0db43df1ef8236e4db8a57837734b83ed15153) for UniForm Iceberg
  - Automatic manifest cleanups via [expireSnapshot](https://github.com/delta-io/delta/commit/7bb979205d7eb4cd8aaa04da8fd960f3862b53b7) whenever OPTIMIZE is run on the Delta table
  - [List and map](https://github.com/delta-io/delta/commit/dd39415912f6009fb9e5d2f4057288bb1e9fd117) data types for UniForm Hudi

- Expanded support in Delta Kernel:
  - [Expired log file cleanup](https://github.com/delta-io/delta/commit/d467f520d) as part of checkpointing
  - Support for [data skipping](https://github.com/delta-io/delta/commit/3cebe546a) on timestamp and timestamp_ntz type columns

All these and many more features and bug fixes are outlined in the Delta 3.3 [release notes].
Ready to get started? Explore the [Delta Lake Documentation](https://delta.io/) for all the details,
and upgrade to Delta Lake 3.3.0 today.

## Credits

Thank you to everyone involved with the release of Delta Lake 3.3:

Abhishek Radhakrishnan, Adam Binford, Alden Lau, Aleksei Shishkin, Alexey Shishkin, Allison Portis, Ami Oka, Amogh Jahagirdar, Andreas Chatzistergiou, Andrew Xue, Anish, Annie Wang, Avril Aysha, Bart Samwel, Burak Yavuz, Carmen Kwan, Charlene Lyu, ChengJi-db, Chirag Singh, Christos Stavrakakis, Cuong Nguyen, Dhruv Arya, Eduard Tudenhoefner, Felipe Pessoto, Fokko Driesprong, Fred Storage Liu, Hao Jiang, Hyukjin Kwon, Jacek Laskowski, Jackie Zhang, Jade Wang, James DeLoye, Jiaheng Tang, Jintao Shen, Johan Lasperas, Juliusz Sompolski, Jun, Jungtaek Lim, Kaiqi Jin, Kam Cheung Ting, Krishnan Paranji Ravi, Lars Kroll, Leon Windheuser, Lin Zhou, Liwen Sun, Lukas Rupprecht, Marko Ilić, Matt Braymer-Hayes, Maxim Gekk, Michael Zhang, Ming DAI, Mingkang Li, Nils Andre, Ole Sasse, Paddy Xu, Prakhar Jain, Qianru Lao, Qiyuan Dong, Rahul Shivu Mahadev, Rajesh Parangi, Rakesh Veeramacheneni, Richard Chen, Richard-code-gig, Robert Dillitz, Robin Moffatt, Ryan Johnson, Sabir Akhadov, Scott Sandre, Sergiu Pocol, Shawn Chang, Shixiong Zhu, Sumeet Varma, Tai Le Manh, Taiga Matsumoto, Tathagata Das, Thang Long Vu, Tom van Bussel, Tulio Cavalcanti, Venki Korukanti, Vishwas Modhera, Wenchen Fan, Yan Zhao, YotillaAntoni, Yumingxuan Guo, Yuya Ebihara, Zhipeng Mao, Zihao Xu, zzl-7

We’d also like to extend special thanks to Allison Portis for her contributions in making the release.

And, as always, a huge thank you to the contributions from our open source [community](delta.io/community).

## Join the community today!

We are always excited to work with our current contributor community and welcome new members.
If you’re interested in helping the Delta Lake project, please take a look at the project
[roadmap](https://delta.io/roadmap/) and join our community through any of our forums,
including [GitHub](https://go.delta.io/github), [Slack](https://go.delta.io/slack),
[X](https://twitter.com/DeltaLakeOSS), [LinkedIn](https://go.delta.io/linkedin),
[YouTube](https://go.delta.io/youtube), and [Google Groups](https://go.delta.io/groups).
