---
title: "Salesforce Engineering: Delta Lake Tech Talk Series"
description: We are happy to announce the Salesforce Engineering Delta Lake Tech Talk Series for March and April 2021.
thumbnail: "./thumbnail.jpg"
author: dennyglee
publishedAt: 2021-03-02
---

We are happy to announce the Salesforce Engineering Delta Lake Tech Talk Series for March and April 2021.

## Part 1: Engagement Activity Delta Lake

**[Watch Now](https://youtu.be/a7_I1Qi1LoU) | March 18th, 2021 10am PDT**

In part one, we'll talk about how they built the engagement activity Delta Lake to support Einstein Analytics for creating powerful reports and dashboards and Sales Cloud Einstein for training machine learning models. At Salesforce, their customers are using [High Velocity Sales](https://www.salesforce.com/products/sales-cloud/tools/high-velocity-sales) to intelligently convert leads and create new opportunities. To support it, we built the engagement activity platform to automatically capture and store user engagement activities using Delta Lake, which is one of the key components supporting [Einstein Analytics](https://www.salesforce.com/products/einstein-analytics/features/) for creating powerful reports and dashboards and [Sales Cloud Einstein](https://www.salesforce.com/products/sales-cloud/features/sales-cloud-einstein/) for training machine learning models. We will include:

- Ingest the data
- Incremental Read
- Support exact once write across tables
- Handle mutation with cascading changes
- Normalize tables in data lake

For more background in preparation for this session, please refer to [Engagement Activity Delta Lake](https://engineering.salesforce.com/engagement-activity-delta-lake-2e9b074a94af).

## Part 2: Boost Delta Lake Performance with Data Skipping and Z-Order

**[Watch Now](https://youtu.be/CwJeKANlSLo) | April 1st, 2021 9am PDT**

When building a data lake, partitioning strategy is one of the most critical decisions to make. Less optimized data partitioning strategy can generate small files and undermine read and write performance. Besides traditional file based partitioning with partition pruning, Databricks provides another option of [Data Skipping and Z-Ordering](https://docs.databricks.com/delta/optimizations/file-mgmt.html) with I/O pruning and file Compaction. In this talk, we will share the evolving thinking of our partitioning strategy when building Engagement delta lake. Using this real world use case, We will elaborate why and how we leverage Data Skipping and Z-Ordering to Boost Delta Lake Performance.

For more background in preparation for this session, please refer to [Boost Delta Lake Performance with Data Skipping and Z-Order](https://engineering.salesforce.com/boost-delta-lake-performance-with-data-skipping-and-z-order-75c7e6c59133).

## Part 3: Global Synchronization and Ordering in Delta Lake

**[Watch Now](https://youtu.be/OtYXc6ud2bQ) | April 15th, 2021 9am PDT**

One of the great features provided by Delta Lake is [ACID Transactions](https://docs.databricks.com/delta/index.html). This feature is critical to maintain data integrity when multiple independent write streams are modifying the same delta table. Running this in the real world, we observe frequent [Conflicting Commits](https://docs.delta.io/latest/concurrency-control.html#id4) errors which fail our pipeline. We realize that, while [ACID Transactions](https://docs.databricks.com/delta/index.html) maintain data integrity, there is no mechanism to resolve writing conflicts. In this talk, we share a solution to ensure global synchronousness and ordering of multiple process streams that perform concurrent writes to the shared Delta Lake. With this mechanism, we greatly improved our pipeline stability by eliminating [Conflicting Commits](https://docs.delta.io/latest/concurrency-control.html#id4) errors and maintaining data integrity

For more background in preparation for this session, please refer to [Global Synchronousness and Ordering in Delta Lake](https://engineering.salesforce.com/global-synchronousness-and-ordering-in-delta-lake-9b912d980ebf).

## Part 4: Continuous Integration and Continuous Delivery with Delta Lake

**[Watch now](https://youtu.be/iOK22btRH9Y) | April 29th, 2021 9am PDT**

As we build our Engagement Delta Lake on [Databricks Workspace](https://docs.databricks.com/getting-started/index.html), one of the challenges is how to automate the integration testing of our Spark jobs in the CI/CD pipeline. We came up with two designs to tackle the challenge : Namespace Deployment and Scenario Based Testing. In this talk, we will discuss the rationale and implementations of the two designs.

## Speakers

**Zhidong Ke**
_Software Engineer PMTS, Salesforce_
Zhidong is passionate about designing distributed systems, real-time/batch data processing, and building applications.

**Heng Zhang**
_Software Engineering PMTS, Salesforce_
Heng is a software engineer who is interested and specialized in microservices, distributed systems, and big data.

## Panelists

**Aaron Zhang**
_Software Engineering PMTS, Salesforce_
Aaron is an experienced software engineering leader with interests and areas of focus in engineering secure, fault-tolerant, high volume systems built on microservices.

**Yifeng Liu**
_Software Engineer LMTS, Salesforce_
Yifeng is a software engineer who has extensive experience in big data processing and distributed systems, and interested in high volume, high complexity, low latency data pipeline, and framework building.

**Craig Ng**
_Solution Architect, Databricks_

**Chris Hoshino-Fish**
_Sr. Solution Architect, Databricks_

**Denny Lee**
_Staff Developer Advocate, Databricks_
