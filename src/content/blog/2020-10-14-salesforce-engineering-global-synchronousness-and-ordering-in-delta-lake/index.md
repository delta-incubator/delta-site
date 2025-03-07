---
title: "Salesforce Engineering: Global Synchronousness and Ordering in Delta Lake"
description: At Salesforce, we maintain a platform to capture customer activity — various kinds of sales events such as emails, meetings, and videos. These events are either consumed by downstream products in real time or stored in our data lake, which we built using Delta Lake.
thumbnail: "./thumbnail.jpg"
author: dennyglee
publishedAt: 2020-10-14
---

At Salesforce, we maintain a platform to capture customer activity --- various kinds of sales events such as emails, meetings, and videos. These events are either consumed by downstream products in real time or stored in our [data lake](https://engineering.salesforce.com/engagement-activity-delta-lake-2e9b074a94af), which we built using [Delta Lake](https://delta.io/). This data lake supports the creation of up-to-date dashboards by downstream components like [Einstein Analytics](https://www.salesforce.com/products/einstein-analytics/features/) and the training of machine learning models for our customers who are using [Sales Cloud Einstein](https://www.salesforce.com/products/sales-cloud/features/sales-cloud-einstein/) to intelligently convert their leads and create new opportunities.

One of the great features provided by Delta Lake is [ACID Transactions](https://docs.databricks.com/delta/index.html). This feature is critical to maintain data integrity when multiple independent write streams are modifying the same delta table. Running this in the real world, we observe frequent [Conflicting Commits](https://docs.delta.io/latest/concurrency-control.html#id4) errors which fail our pipeline. We realize that, while [ACID Transactions](https://docs.databricks.com/delta/index.html) maintain data integrity, there is no mechanism to resolve writing conflicts. In this blog, we share a solution to ensure global synchronousness and ordering of multiple process streams that perform concurrent writes to the shared Delta Lake. With this mechanism, we greatly improved our pipeline stability by eliminating [Conflicting Commits](https://docs.delta.io/latest/concurrency-control.html#id4) errors and maintaining data integrity.

[Read the full article](https://engineering.salesforce.com/global-synchronousness-and-ordering-in-delta-lake-9b912d980ebf)
