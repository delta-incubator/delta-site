---
title: Massive Data Processing in Adobe Experience Platform Using Delta Lake
description: How Adobe used Delta Lake and Apache Spark to create a cost-effective and scalable data pipeline
author: yeshwanth-vijayakumar
publishedAt: 2025-03-05
thumbnail: "./thumbnail.png"
---

# Massive Data Processing in Adobe Experience Platform Using Delta Lake

In March 2023, Denny Lee and Yeshwanth Vijayakumar, Senior Engineering Manager at Adobe, discussed how Adobe Experience Platform (AEP) combines a data lakehouse architecture with its Real-Time Customer Profile architecture to increase the throughput of Apache Spark™ batch workloads and reduce costs while maintaining functionality with Delta Lake. Learn how Adobe's Unified Profile Team built a cost-effective and scalable data pipeline using Apache Spark and Delta Lake.

If you'd like to watch the full conversation, check out the recording on YouTube.

[YouTube Video: Massive Data Processing in Adobe Experience Platform Using Delta Lake](https://www.youtube.com/embed/TKcL_qy44Ik)

## What is Adobe Experience Platform (AEP)?

In the words of Yeshwanth, AEP is an organically built platform that is focused on ingesting user data, market data, first-party data, and second-party data from various customers. Adobe's customers (companies) bring in data about their customers from multiple sources, assimilate it into a single unified and centrally accessible profile, then use it to create experiences for different audiences. Data about these companies' daily customer interactions with their websites and marketing systems flows through Adobe systems, particularly AEP. The Unified Profile Team, where Yeshwanth is one of the leads, is responsible for ingesting all the data from this fire hose.

## Inherent Problems with the System

AEP takes in terabytes of data every day and manages petabytes of data for customers as part of the Unified Profile offering. At the heart of this is a bunch of complex ingestion of normalized and denormalized data with various linkage scenarios powered by a central identity graph. This helps with various marketing scenarios that are activated in multiple platforms and channels like email, advertisements, etc.

At the beginning, there were quite a few problems with the AEP setup. When you join an already mature team or start working on an established product, a lot of the groundwork has been done for you. In the case of AEP, everything needed to be built from the ground up. Best practices – even infrastructure best practices – had to be worked out. In fact, even trying to get a simple Spark cluster up was difficult.

AEP is primarily on Azure, and Data Lake Gen1 wasn't as scalable as Gen2. Every single click, application link, and other action is being fed into the AEP system in real time. The Unified Profile Team at Adobe was initially trying to model all of this data on HBase using HDInsights, which was not stable. Then they moved to HBase on top of Azure, which was basically running on top of their own VMs and Azure Storage. When that didn't work out either, they moved to their own managed NoSQL store. Initially this went well, but it was extremely expensive. Furthermore, because there was a need for real-time transactional operations, they ran into problems when trying to do analytics. They had to build on top of a data warehousing solution, which resulted in too much latency.

## Developing a Solution

The Adobe team had to treat two competing needs with the same priority: the ability to scan query access plans "à la Spark" and support NoSQL point-in-time queries. They were aiming for a first-in-class and first-to-market offering, so they couldn't simply give up on one of these, but at the same time there was a push for them to get to a solution quickly. They were willing to take on architectural debt to make this work, as long as they were spending less money than they were bringing in. They planned to evolve the architecture as they went on, but also wanted to make sure they had enough escape hatches built in so that they could switch to a different infrastructure or architecture if that became viable.

## Major Milestones

Before migrating, moving, or replicating anything, they chose to harden the existing system. Therefore, the AEP Unified Platform Team's first milestone was to simplify the entire replication process, so they'd never have to rebuild the whole system. To do this, they built a custom event sourcing system that was meant to feed into downstream systems and a change data capture (CDC) system to ensure that every time a mutation happened in the primary store it would emit a notification of the change to their centralized Kafka topic. This meant that even if they had thousands of customers or DBs, all of the notifications would be fed into a single fire hose. This would allow for a simpler migration path for downstream systems.

The second milestone was getting the actual workloads that were dependent on the hot store to be handled by this custom replication process. That was a big advantage because it narrowed the scope to a one-to-one match. In terms of migration, if you have ten different workloads that are dependent on the hot store, you don't need to rewrite all ten workloads; instead, one team can write a mapping function that ensures the rest of the jobs think they're talking to the hot store. Each job only cares about the schema it's getting out at the top of the pipeline; the rest of the flow remains unchanged. For this to work, when the team switched over a job with a specific schema to use Delta Lake as the source, they needed to ensure that the data coming from Delta Lake would look exactly the same as the data from the hot store, to reduce friction. In other words, the hot store and Delta Lake needed to match for downstream systems so that they could abstract away downstream ingestion and avoid unnecessary data rewrites.

## Major Problems

While an engineering solution was found by using the aforementioned custom replication system with a hot store, the system was cost-prohibitive. With any NoSQL store, as soon as you increase the ability to handle concurrency, the cost goes through the roof. The second problem they faced, due to the volume of data, was shuffles. They had to assimilate data at a profile level. For example, let's say "Gloria" is one profile and you have a bunch of events associated with this profile. For the personalization process to occur, data from multiple sources has to be combined before any decision can be made; otherwise the resulting personalization will be incomplete, which will result in the wrong logic being applied in downstream systems. Considering the millions of user profiles in AEP, the required shuffling of data would be enormously expensive.

## Benefits of Using Delta Lake

Initially, the hot store was replicated into a central Delta Lake. With just this raw Delta Lake mirroring, AEP was able to significantly increase read throughput. With the data stored in Delta Lake, they currently see anywhere between 10–15x compression from what was stored in the hot store. They were able to improve read performance by using cores more efficiently, by parallelizing queries across optimally sized partitions. The assimilation of the user profiles was simplified by using Delta Lake's [CDC feature](https://docs.delta.io/latest/delta-change-data-feed.html#change-data-feed) to provide notifications for downstream systems. Thanks to Delta Lake, AEP gets the performance, compression, and statistics it needs, and is able to do the replication much more efficiently. While the team still relies on the functionality of the NoSQL hot store, the cost of using it is significantly reduced.

It's important to note that in this scenario, replication of data from A to B is not just about appending new data. AEP replication is in the form of inserts, upserts, and deletes, which itself could be cost-prohibitive. Delta Lake [ZORDER](https://docs.delta.io/latest/optimizations-oss.html#z-ordering-multi-dimensional-clustering) has made a huge difference here, reducing the processing time from hours to minutes. [ZORDER](https://docs.delta.io/latest/optimizations-oss.html#z-ordering-multi-dimensional-clustering) was open sourced in Delta Lake 2.0, allaying any concerns that AEP's performance was dependent on a proprietary feature.

> **Info:** Adobe and the rest of the community pushed Delta Lake to open source features like [ZORDER](https://docs.delta.io/latest/optimizations-oss.html#z-ordering-multi-dimensional-clustering) faster so they could be accessible to everyone. This is a perfect example of the customer and the community being extremely aligned!

Adobe currently has over 5,000 active Delta tables, with more continually being added, that are being utilized by multiple downstream systems. Maintaining all of these tables with Delta Lake is actually pretty easy, because there's just one maintenance job that takes care of orchestrating the vacuums, optimizing, and more. Delta Lake has helped Adobe Experience Platform solve a lot of the problems it faced by simplifying the operations of its downstream systems.
