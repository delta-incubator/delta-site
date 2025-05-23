---
title: Delta Lake 0.5.0 Released
description: We are excited to announce the release of Delta Lake 0.5.0, which introduces Presto/Athena support and improved concurrency.
thumbnail: "./thumbnail.png"
author: dennyglee
publishedAt: 2019-12-13
---

## Key features

We are excited to announce the release of Delta Lake 0.5.0, which introduces Presto/Athena support and improved concurrency. The key features in this release are:

- **Support for other processing engines using manifest files ([#76](https://github.com/delta-io/delta/issues/76))** - You can now query Delta tables from Presto and Amazon Athena using manifest files, which you can generate using Scala, Java, Python, and SQL APIs. See the [documentation](https://docs.delta.io/0.5.0/presto-integration.html) for details.
- **Improved concurrency for all Delta Lake operations ([#9](https://github.com/delta-io/delta/issues/9), [#72](https://github.com/delta-io/delta/issues/72), [#228](https://github.com/delta-io/delta/issues/228))** - You can now run more Delta Lake operations concurrently. Delta Lake's optimistic concurrency control has been improved by making conflict detection more fine-grained. This makes it easier to run complex workflows on Delta tables. For example:
  - Running deletes (e.g. for GDPR compliance) concurrently on older partitions while newer partitions are being appended.
  - Running updates and merges concurrently on disjoint sets of partitions.
  - Running file compactions concurrently with appends (see below).See the [documentation on concurrency control](https://docs.delta.io/0.5.0/concurrency-control.html) for more details.
- **Improved support for file compaction ([#146](https://github.com/delta-io/delta/issues/146))** - You can now compact files by rewriting them with the `DataFrameWriter` option `dataChange` set to `false`. This option allows a compaction operation to run concurrently with other batch and streaming operations. See [this example in the documentation](https://docs.delta.io/0.5.0/best-practices.html#compact-files) for details.
- **Improved performance for insert-only merge ([#246](https://github.com/delta-io/delta/issues/246))** - Delta Lake now provides more optimized performance for merge operations that have only insert clauses and no update clauses. Furthermore, Delta Lake ensures that writes from such insert-only merges only append new data to the table. Hence, you can now use Structured Streaming and insert-only merges to do continuous deduplication of data (e.g. logs). See [this example in the documentation](https://docs.delta.io/0.5.0/delta-update.html#-merge-in-dedup) for details.
- **SQL Support for Convert-to-Delta ([#175](https://github.com/delta-io/delta/issues/175))** - You can now use SQL to convert a Parquet table to Delta (Scala, Java, and Python were already supported in 0.4.0). See the [documentation](https://docs.delta.io/0.5.0/delta-utility.html#convert-to-delta) for details.
- **Experimental support for Snowflake and Redshift Spectrum** - You can now query Delta tables from Snowflake and Redshift Spectrum. This support is considered experimental in this release. See the [documentation](https://docs.delta.io/0.5.0/integrations.html) for details.

## Credits

Andreas Neumann, Andrew Fogarty, Burak Yavuz, Denny Lee, Fabio B. Silva, JassAbidi, Matthew Powers, Mukul Murthy, Nicolas Paris, Pranav Anand, Rahul Mahadev, Reynold Xin, Shixiong Zhu, Tathagata Das, Tomas Bartalos, Xiao Li

Thank you for your contributions.

Visit the [release notes](https://github.com/delta-io/delta/releases/tag/v0.5.0) to learn more about the release.
