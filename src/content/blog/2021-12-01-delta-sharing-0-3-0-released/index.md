---
title: Delta Sharing 0.3.0 Released
description: We are excited to announce the release of Delta Sharing 0.3.0.
thumbnail: "./thumbnail.png"
author: linzhou
publishedAt: 2021-12-01
---

We are excited to announce the release of [Delta Sharing 0.3.0](https://github.com/delta-io/delta-sharing/releases/tag/v0.3.0), which introduces the following improvements and fixes issues:

#### Improvements:

- Support Azure Blob Storage and Azure Data Lake Gen2 in Delta Sharing Server ([#56](https://github.com/delta-io/delta-sharing/pull/56), [#59](https://github.com/delta-io/delta-sharing/pull/59))
- Apache Spark Connector now can send the `limitHint` parameter when a user query is using `limit` ([#55](https://github.com/delta-io/delta-sharing/pull/55))
- `load_as_pandas` in Python Connector now accepts a `limit` parameter to allow users fetching only a few rows to explore ([#76](https://github.com/delta-io/delta-sharing/pull/76))
- Apache Spark Connector will re-fetch pre-signed urls before they expire to support long running queries ([#69](https://github.com/delta-io/delta-sharing/pull/69))
- Add a new API to list all tables in a share to save network round trips ([#63](https://github.com/delta-io/delta-sharing/pull/63), [#66](https://github.com/delta-io/delta-sharing/pull/66), [#67](https://github.com/delta-io/delta-sharing/pull/67), [#88](https://github.com/delta-io/delta-sharing/pull/88))
- Add a User-Agent header to request sent from Apache Spark Connector and Python ([#75](https://github.com/delta-io/delta-sharing/pull/75))
- Add an optional `expirationTime` field to Delta Sharing Profile File Format to provide the token expiration time ([#77](https://github.com/delta-io/delta-sharing/pull/77))

#### Bug fixes:

- Fix a corner case that `list_all_tables` may not return correct results in the Python Connector ([#84](https://github.com/delta-io/delta-sharing/pull/84))

#### Credits:

Denny Lee, Felix Cheung, Lin Zhou, Matei Zaharia, Shixiong Zhu, Will Girten, Xiaotong Sun, Yuhong Chen, kohei-tosshy, William Chau

Visit the [release notes](https://github.com/delta-io/delta-sharing/releases/tag/v0.3.0) to learn more about the release.
