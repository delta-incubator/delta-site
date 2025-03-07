---
title: Delta Lake 0.6.1 Released
description: We are excited to announce the release of Delta Lake 0.6.1, which fixes a few critical bugs in merge operation and operation metrics. If you are using version 0.6.0, it is strongly recommended that you upgrade to version 0.6.1.
thumbnail: "./thumbnail.png"
author: dennyglee
publishedAt: 2020-05-26
---

## Key features

We are excited to announce the release of Delta Lake 0.6.1, which fixes a few critical bugs in merge operation and operation metrics. If you are using version 0.6.0, it is strongly recommended that you upgrade to version 0.6.1. The details of the fixed bugs are as follows:

- **Invalid MERGE INTO AnalysisExceptions ([#419](https://github.com/delta-io/delta/issues/419))** - A couple of bugs related to merge operation were causing analysis errors in 0.6.0 on previously supported merge queries.
  - Fixing one of these bugs required reverting a minor change to the DeltaTable 0.6.0 API. In 0.6.1 (similar to 0.5.0), if the table's schema has changed since the creation of the DeltaTable instance DeltaTable.toDF() does not return a DataFrame with the latest schema. In such scenarios, you must recreate the DeltaTable instance for it to recognize the latest schema.
  - Incorrect operations metrics in history - 0.6.0 reported an incorrect number of rows processed during Update and Delete. This is fixed in 0.6.1.

## Credits

Alan Jin, Jose Torres, Rahul Mahadev, Tathagata Das

Thank you for your contributions.

Visit the [release notes](https://github.com/delta-io/delta/releases/tag/v0.6.1) to learn more about the release.
