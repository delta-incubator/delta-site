---
title: Delta Lake Online Tech Talks
description: We’re excited to announce the next series of Delta Lake online tech talks over the next few weeks. This will be a fun set of tech talks with live demos and Q&A. Check them out!
thumbnail: "./thumbnail.png"
author: dennyglee
publishedAt: 2020-02-21
---

We're excited to announce the next series of Delta Lake online tech talks over the next few weeks. This will be a fun set of tech talks with live demos and Q&A. Check them out!

## Getting Data Ready for Data Science with Delta Lake and MLflow

February 27, 2020 | 9:00 am PT
[Watch Now!](https://www.youtube.com/watch?v=hQaENo78za0)

One must take a holistic view of the entire data analytics realm when it comes to planning for data science initiatives. Data engineering is a key enabler of data science helping furnish reliable, quality data in a timely fashion. Delta Lake, an open-source storage layer that brings reliability to data lakes can help take your data reliability to the next level. In this session you will learn about:

- The data science lifecycle
- The importance of data engineering to successful data science
- Key tenets of modern data engineering
- How Delta Lake can help make reliable data ready for analytics
- The ease of adopting Delta Lake for powering your data lake
- How to incorporate Delta Lake within your data infrastructure to enable Data Science

## Beyond Lambda: Introducing Delta Architecture

March 5, 2020 | 9:00 am PT
[Watch Now!](https://www.youtube.com/watch?v=FePv0lro0z8)

Lambda architecture is a popular technique where records are processed by a batch system and streaming system in parallel. The results are then combined during query time to provide a complete answer. Strict latency requirements to process old and recently generated events made this architecture popular. The key downside to this architecture is the development and operational overhead of managing two different systems. There have been attempts to unify batch and streaming into a single system in the past. Organizations have not been that successful though in those attempts. But, with the advent of Delta Lake, we are seeing a lot of our customers adopting a simple continuous data flow model to process data as it arrives. We call this architecture, The Delta Architecture. In this session, we cover the major bottlenecks for adopting a continuous data flow model and how the Delta architecture solves those problems.

## Simplify and Scale Data Engineering Pipelines with Delta Lake

March 12, 2020 | 10:00 am PT
[Watch Now!](https://youtu.be/qtCxNSmTejk?t=190)

A common data engineering pipeline architecture uses tables that correspond to different quality levels, progressively adding structure to the data: data ingestion ("Bronze" tables), transformation/feature engineering ("Silver" tables), and machine learning training or prediction ("Gold" tables). Combined, we refer to these tables as a "multi-hop" architecture. It allows data engineers to build a pipeline that begins with raw data as a "single source of truth" from which everything flows. In this session, we will show how to build a scalable data engineering data pipeline using Delta Lake. Delta Lake is an open-source storage layer that brings reliability to data lakes. Delta Lake offers ACID transactions, scalable metadata handling, and unifies streaming and batch data processing. It runs on top of your existing data lake and is fully compatible with Apache Spark APIs In this session you will learn about:

- The data engineering pipeline architecture
- Data engineering pipeline scenarios
- Data engineering pipeline best practices
- How Delta Lake enhances data engineering pipelines
- The ease of adopting Delta Lake for building your data engineering pipelines

---

Starting March 26th, join us for the [Delta Lake Internals Online Tech Talks Series](/blog/2020-03-13-diving-into-delta-lake-online-tech-talk-series/)
