---
title: Running ML Workflows with Delta Lake and Ray
description: This post explains how you can read Delta Lake with the Ray compute framework
thumbnail: "./thumbnail.png"
author:
  - jim-hibbard
publishedAt: 2023-03-23
---

## Part 1: Reading Delta Lake with Ray

Delta Lake and Ray are two open-source technologies that can be used to build scalable and reliable data processing and machine learning pipelines. This article will explain the role each of these tools play and show you how to use the new [`deltaray`](https://github.com/delta-incubator/deltaray) library to easily integrate the two technologies. Coming soon in part two of this blog, will be how to use this integration to run ML workflows with Ray and Delta Lake. [This notebook](https://github.com/delta-incubator/deltaray/blob/main/notebooks/deltaray-demo.ipynb) contains all the code used in this blog post if you want to follow along.

Delta Lake continues to be the most reliable, scalable, and performant table storage format for the lakehouse. It’s a perfect choice for ML applications as it enables the storage of large amounts of structured and unstructured data, supports data quality checks in the form of constraints, and manages metadata. Delta Lake also provides features for versioning data and for handling data consistency and transactional guarantees.

[Ray](https://docs.ray.io/en/latest/) is a popular distributed computing framework that enables you to build and run parallel and distributed applications across a cluster of machines. With Ray, you can easily distribute machine learning and Python workloads across multiple nodes, speeding up training times and enabling the processing of larger datasets. Ray also provides functionality for reinforcement learning, state of the art hyperparameter tuning, data processing, and more, making it a versatile platform for machine learning applications.

### Installing Libraries

You can install the libraries required for this article’s examples using pip:

```shell
pip install deltalake deltaray pandas
```

[deltalake](https://github.com/delta-io/delta-rs) is the Python interface for the delta-rs project, a Native Delta Lake implementation in Rust. While delta-rs is written in Rust, you’ll be able to use it just like any other Python library and will benefit from the continued innovation of Rust’s OSS community. We’ll use the deltalake library to create dummy Delta Tables for [`deltaray`](https://github.com/delta-incubator/deltaray) to read into Ray. Adding write functionality to [`deltaray`](https://github.com/delta-incubator/deltaray) is an active area of development where the community can help enhance Delta Lake and Ray's integration.

Delta Lake was originally built for Spark, but the deltalake implementation does not have a Spark dependency, making it a lighter-weight library. delta-spark depends on Spark while deltalake does not. Similarly, instead of depending on Spark as our data processing framework, we’ll be relying on Ray. This highlights the flexibility of Delta Lake as an open storage format, we’re able to access it from many different contexts and tools as needed.

### Create a Versioned Delta Lake

Creating a dummy Delta Table to read from Ray is easy. You’ll import the needed libraries and create variables for the current working directory and table uri of the dummy dataset.

```python
# Standard Libraries
import pathlib

# External Libraries
import deltalake as dl
import pandas as pd


cwd = pathlib.Path().resolve()
table_uri = f'{cwd}/tmp/delta-table'
```

Then you’ll create an initial Delta Table, append to it, and then overwrite the table with new data so that the Delta Table’s transaction log will contain some history about how the data has changed over time.

```python
# create initial Delta Table
df = pd.DataFrame({'id': [0, 1, 2, ], })
dl.write_deltalake(table_uri, df)

# update one
df = pd.DataFrame({'id': [3, 4, 5, ], })
dl.write_deltalake(table_uri, df, mode='append')

# update two
df = pd.DataFrame({'id': [6, 7, 8, 9, ], })
dl.write_deltalake(table_uri, df, mode='overwrite')
```

### Read a Versioned Delta Lake with Ray

The [`deltaray`](https://github.com/delta-incubator/deltaray) library makes it easy to read Delta Tables from Ray. By passing in a `table_uri` and `version` we’re able to access our Delta Table at a specific point in time as long as the underlying parquet files are available. The use of the vacuum command to save on storage costs would be one example of why a previous version of the Delta Table could become unavailable, you can read more about [vacuum here](https://delta.io/blog/2023-01-03-delta-lake-vacuum-command/).

```python
# External Libraries
import deltaray

# Read the initially created version of the Delta Lake table
ds = deltaray.read_delta(table_uri, version=0)
ds.show()

{'id': 0}
{'id': 1}
{'id': 2}
```

```python
# Read the second version of the Delta Lake table
ds = deltaray.read_delta(table_uri, version=1)
ds.show()

{'id': 0}
{'id': 1}
{'id': 2}
{'id': 3}
{'id': 4}
{'id': 5}
```

If you want the most recent version of the Delta Table, you don’t need to provide a `version` argument at all. You can see the result corresponds with the last update we made to our dummy dataset which overwrote all previous versions.

```python
# Read the current version of the Delta Lake table
ds = deltaray.read_delta(table_uri)
ds.show()

{'id': 6}
{'id': 7}
{'id': 8}
{'id': 9}
```

### Discussion

When used together, Delta Lake and Ray can help you build scalable and reliable machine learning pipelines. You can use Ray to distribute machine learning workloads across a cluster and use Delta Lake to store and manage large datasets in a scalable, versioned, and fault-tolerant manner. With [`deltaray`](https://github.com/delta-incubator/deltaray) there are now APIs for accessing Delta Lake from Ray, providing an easy integration between the two technologies in your machine learning pipelines. If you’re interested in contributing to [`deltaray`](https://github.com/delta-incubator/deltaray), next steps include the full implementation of Ray’s [Datasource API](https://docs.ray.io/en/latest/data/api/input_output.html#datasource-api) and improvements to testing and documentation.

### What's Next

In part two of this blog, we'll walk through a full ML example including hyperparameter tuning and model selection. We'll use Delta Lake as the source of our training data, [`deltaray`](https://github.com/delta-incubator/deltaray) for data ingestion, and Ray for model training and selection.
