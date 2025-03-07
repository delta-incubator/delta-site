---
title: "Delta Lake Newsletter: 2020-03-20 Edition"
description: For this edition of the Delta Lake Newsletter, find out more about the latest and upcoming tech talks and videos.
thumbnail: "./thumbnail.png"
author: dennyglee
publishedAt: 2020-03-20
---

## Upcoming Events

### Diving into Delta Lake: Unpacking the Transaction Log

_March 26th, 2020_

![](./unpacking-the-transaction-log.png)

The transaction log is key to understanding Delta Lake because it is the common thread that runs through many of its most important features, including ACID transactions, scalable metadata handling, time travel, and more. In this session, we'll explore what the Delta Lake transaction log is, how it works at the file level, and how it offers an elegant solution to the problem of multiple concurrent reads and writes.\

[Watch the video](https://www.youtube.com/watch?v=F91G4RoA8is)

### Diving into Delta Lake: Enforcing and Evolving the Schema

_April 2nd, 2020_

![](./schema-enforcement-and-evolution.png)

As business problems and requirements evolve over time, so to does the structure of your data. With Delta Lake, as the data changes, incorporating new dimensions is easy. Users have access to simple semantics to control the schema of their tables. These tools include schema enforcement, which prevents users from accidentally polluting their tables with mistakes or garbage data, as well as schema evolution, which enables them to automatically add new columns of rich data when those columns belong. In this webinar, we'll dive into the use of these tools.\

[Register for the webinar](https://databricks.zoom.us/webinar/register/WN_jO0td2nDTDmgTx8d353OFg)

### Diving into Delta Lake: DML Internals

_April 16th, 2020_

![](./dml-internals.png)

In the earlier Delta Lake Internals webinar series sessions, we described how the Delta Lake transaction log works. In this session, we will dive deeper into how commits, snapshot isolation, and partition and files change when performing deletes, updates, merges, and structured streaming.

[Register for the webinar](https://databricks.zoom.us/webinar/register/WN_loullvocQXSYfQye9mQNoA)

## Previous Events

### Machine Learning Lessons Learned from the Field: Interview with Brooke Wenig

_March 18th, 2020_

![](./machine-learning-lessons-learned-from-the-field.png)

We had a great interview with Brooke Wenig, Machine Learning Practice Lead, on the best practices and patterns when developing, training, and deploying Machine Learning algorithms in production.\
We also had updates to previous tech talks with new live demos and Q&A sessions all available on-demand now.

- **February 27, 2020** - [Getting Data Ready for Data Science with Delta Lake and MLflow](https://www.youtube.com/watch?v=hQaENo78za0)
- **March 5, 2020** - [Beyond Lambda: Introducing Delta Architecture](https://www.youtube.com/watch?v=FePv0lro0z8)
- **March 12, 2020** - [Simplify and Scale Data Engineering Pipelines with Delta Lake](https://www.youtube.com/watch?v=qtCxNSmTejk)\

[Watch the video](https://www.youtube.com/watch?v=4xILaBEHvnY)

### The Genesis of Delta Lake - An Interview with Burak Yavuz

_February 19th, 2020_

![](./genesis-of-delta-lake.jpeg)

We interviewed Burak Yavuz to learn about the Delta Lake team's decision making process and why they designed, architected, and implemented the architecture that it is today. Understand technical challenges that the team faced, how those challenges were solved, and learn about the plans for the future.

[Watch the video](https://www.youtube.com/watch?v=F-5t3QCI96g)

## Tech Talk Session

In light of the times, instead of our usual Delta Lake Thursday Tech Talk sessions, we decided to do a session around the analysis of COVID-19 datasets with Vini Jaiswal, Chengyin Eng, Dhruv Kumar, and Denny Lee. For more information on the session, please refer to the [background](https://www.meetup.com/spark-online/events/269511002/) and the link below to watch the session on-demand.

### Analyzing COVID-19: Can the Data Community Help?

_March 19th, 2020_

![](./covid-19.png)

[Watch the video](https://www.youtube.com/watch?v=A0uBdY4Crlg)

## Thank you

If you have any questions or feedback, please do not hesitate to provide feedback on the [#deltalake-oss](https://app.slack.com/client/TGABZH3N0/CJ70UCSHM) Slack channel. Join the Delta Lake Channel ([Register](https://join.slack.com/t/delta-users/shared_invite/enQtNTY1NDg0ODcxOTI1LWJkZGU3ZmQ3MjkzNmY2ZDM0NjNlYjE4MWIzYjg2OWM1OTBmMWIxZTllMjg3ZmJkNjIwZmE1ZTZkMmQ0OTk5ZjA) | [Login](https://delta-users.slack.com/)) and join the [Delta Users Email Distribution List](https://groups.google.com/forum/#!forum/delta-user) today!

Thanks!
Denny Lee, Developer Advocate
