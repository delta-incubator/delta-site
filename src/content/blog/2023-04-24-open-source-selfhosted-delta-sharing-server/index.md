---
title: Open source self-hosted Delta Sharing server
description: This post explains Kotosiro Delta Sharing server basic instructions
thumbnail: "./thumbnail.png"
author: shingo-okawa
publishedAt: 2023-04-24
---

My name is Shingo, creator of [Kotosiro Sharing](https://github.com/kotosiro/sharing). I am excited to announce the release of [Kotosiro Sharing](https://github.com/kotosiro/sharing), a minimalistic Rust implementation of the Delta Sharing server aimed at helping engineers easily host their own Delta Sharing service.
In this article, I will provide instructions on how to share your data with your colleagues who may have varying technical backgrounds, ranging from data engineers to business intelligence analysts, using self-hosted [Kotosiro Sharing](https://github.com/kotosiro/sharing) server. The instructions are fairly easy and straightforward, and you can easily share your data with colleagues who have different levels of technical expertise. The implementation is currently in the beta phase, and hence, it does not provide a GUI yet. However, this feature will be added in the near future.
The following image depicts the system workflow. Let's walk through how [Kotosiro Sharing](https://github.com/kotosiro/sharing) works when you want to share precious data with your colleagues.

![](image1.png)

## Delta Table Structure

You have [historical data on avocado prices and sales volume in multiple US markets](https://www.kaggle.com/datasets/neuromusic/avocado-prices) stored in your Delta table on AWS S3. Your colleague has come to your desk and asked if they could use the data for further data analytics. The structure of the table is as follows:

```
avocado-table
├── _delta_log
│   ├── 00000000000000000000.json
│   ├── 00000000000000000001.json
│   ├── 00000000000000000002.json
│   └── 00000000000000000003.json
├── part-00000-04d10a18-acde-4d66-bb3b-39f5d0feb689-c000.snappy.parquet
├── part-00000-c5135c42-2c15-4da5-8cd6-f0fc527dff9c-c000.snappy.parquet
├── part-00000-c6c1e092-bef3-41a0-8a05-826a33ecff6f-c000.snappy.parquet
└── part-00000-d7afaec2-4373-4865-ab48-e9f60495b41e-c000.snappy.parquet
```

Each parquet file is appended sequentially. Therefore, the table has [four different versions](https://docs.databricks.com/delta/history.html).

## Share Your Delta Tables via Kotosiro Sharing APIs

### Log in to Kotosiro Sharing Server and Get the Admin Access Token

Now let's get started with the interesting part. As the owner of the data and administrator of your [Kotosiro Sharing](https://github.com/kotosiro/sharing) server, you need to log in to the system and obtain the admin access token. This token will enable you to create a [share](https://github.com/delta-io/delta-sharing/blob/main/PROTOCOL.md#concepts). Here's how you can obtain the token:

```bash
 $ curl -s -X POST http://localhost:8080/admin/login \
        -H "Content-Type: application/json" \
        -d '{"account": "kotosiro", "password": "password"}' \
        | jq '.'
```

```
{
  "profile": {
    "shareCredentialsVersion": 1,
    "endpoint": "http://127.0.0.1:8080",
    "bearerToken": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJuYW1lIjoia290b3Npcm8iLCJlbWFpbCI6ImtvdG9zaXJvQGVtYWlsLmNvbSIsIm5hbWVzcGFjZSI6ImFkbWluIiwicm9sZSI6ImFkbWluIiwiZXhwIjoxNjgxOTM3NzMyfQ.rVjA6S7EWq7CakpB0IHik0mvxl58ynZNxNM3a3RJibY",
    "expirationTime": "2023-04-19 20:55:32 UTC"
  }
}
```

### Register a New Share

Next, you need to register a new [share](https://github.com/delta-io/delta-sharing/blob/main/PROTOCOL.md#concepts), which is simply a logical grouping used to share with [recipients](https://github.com/delta-io/delta-sharing/blob/main/PROTOCOL.md#concepts). For example, you can name your share `share1`. Note that this [share](https://github.com/delta-io/delta-sharing/blob/main/PROTOCOL.md#concepts) is currently empty, meaning that you haven't added any data to it yet. Here's how you can create the [share](https://github.com/delta-io/delta-sharing/blob/main/PROTOCOL.md#concepts):

```bash
 $ curl -s -X POST "http://localhost:8080/admin/shares" \
        -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJuYW1lIjoia290b3Npcm8iLCJlbWFpbCI6ImtvdG9zaXJvQGVtYWlsLmNvbSIsIm5hbWVzcGFjZSI6ImFkbWluIiwicm9sZSI6ImFkbWluIiwiZXhwIjoxNjgxOTM3NzMyfQ.rVjA6S7EWq7CakpB0IHik0mvxl58ynZNxNM3a3RJibY" \
        -H "Content-Type: application/json" \
        -d '{ "name": "share1" }' \
        | jq '.'
```

```
{
  "share": {
    "id": "78f84b5e-29e7-4adf-8df5-c40487a8da43",
    "name": "share1"
  }
}
```

### Register a New Table

So far, so good. Now it's time to register the Delta table on AWS S3 to your [Kotosiro Sharing](https://github.com/kotosiro/sharing) service via the API. It's fairly simple like other operations. Just post a JSON data that specifies the S3 bucket object path to the Delta table, along with the table name. For example, you can name your table `table1`. Here's how you can register the [table](https://github.com/delta-io/delta-sharing/blob/main/PROTOCOL.md#concepts):

```bash
 $ curl -s -X POST "http://localhost:8080/admin/tables" \
        -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJuYW1lIjoia290b3Npcm8iLCJlbWFpbCI6ImtvdG9zaXJvQGVtYWlsLmNvbSIsIm5hbWVzcGFjZSI6ImFkbWluIiwicm9sZSI6ImFkbWluIiwiZXhwIjoxNjgxOTM3NzMyfQ.rVjA6S7EWq7CakpB0IHik0mvxl58ynZNxNM3a3RJibY" \
        -H "Content-Type: application/json" \
        -d '{ "name": "table1", "location": "s3://kotosiro-sharing-example/avocado" }' \
        | jq '.'
```

```
{
  "table": {
    "id": "8a040c74-4505-44e5-aeda-9db662f338eb",
    "name": "table1",
    "location": "s3://kotosiro-sharing-example/avocado"
  }
}
```

### Register a New Table as a Part of schema1 in the share1

You have created a new [share](https://github.com/delta-io/delta-sharing/blob/main/PROTOCOL.md#concepts) and registered a new [table](https://github.com/delta-io/delta-sharing/blob/main/PROTOCOL.md#concepts). Now, you need to associate the [table](https://github.com/delta-io/delta-sharing/blob/main/PROTOCOL.md#concepts) with the [share](https://github.com/delta-io/delta-sharing/blob/main/PROTOCOL.md#concepts) by creating a [schema](https://github.com/delta-io/delta-sharing/blob/main/PROTOCOL.md#concepts). To do this, you can register the [table](https://github.com/delta-io/delta-sharing/blob/main/PROTOCOL.md#concepts) as part of, for example, the `schema1` in `share1`. The API operation to register the table to the share is fairly straightforward. Here's an example of how to do it:

```bash
 $ curl -s -X POST "http://localhost:8080/admin/shares/share1/schemas/schema1/tables" \
        -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJuYW1lIjoia290b3Npcm8iLCJlbWFpbCI6ImtvdG9zaXJvQGVtYWlsLmNvbSIsIm5hbWVzcGFjZSI6ImFkbWluIiwicm9sZSI6ImFkbWluIiwiZXhwIjoxNjgxOTM3NzMyfQ.rVjA6S7EWq7CakpB0IHik0mvxl58ynZNxNM3a3RJibY" \
        -H "Content-Type: application/json" \
        -d '{ "table": "table1" }' \
        | jq '.'
```

```
{
  "schema": {
    "id": "62bf785c-1764-4953-9986-a6708996e72c",
    "name": "schema1"
  }
}
```

### Issue a New Recipient Profile

This is the final and most important step in sharing your Delta table with your colleagues. You need to issue a new recipient [profile](https://github.com/delta-io/delta-sharing/blob/main/PROTOCOL.md#profile-file-format), which contains the necessary credentials for your colleagues to access the shared data. The resulting [profile](https://github.com/delta-io/delta-sharing/blob/main/PROTOCOL.md#profile-file-format) JSON is a credential, so you must share it securely with your colleagues. As an administrator, you are responsible for ensuring that the [profile](https://github.com/delta-io/delta-sharing/blob/main/PROTOCOL.md#profile-file-format) is shared only with authorized recipients. Here's how you can issue the [profile](https://github.com/delta-io/delta-sharing/blob/main/PROTOCOL.md#profile-file-format):

```bash
 $ curl -s -X GET "http://localhost:8080/admin/profile" \
        -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJuYW1lIjoia290b3Npcm8iLCJlbWFpbCI6ImtvdG9zaXJvQGVtYWlsLmNvbSIsIm5hbWVzcGFjZSI6ImFkbWluIiwicm9sZSI6ImFkbWluIiwiZXhwIjoxNjgxOTM3NzMyfQ.rVjA6S7EWq7CakpB0IHik0mvxl58ynZNxNM3a3RJibY" \
        -H "Content-Type: application/json" \
        | jq '.'
```

```
{
  "profile": {
    "shareCredentialsVersion": 1,
    "endpoint": "http://127.0.0.1:8080",
    "bearerToken": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJuYW1lIjoia290b3Npcm8iLCJlbWFpbCI6ImtvdG9zaXJvQGVtYWlsLmNvbSIsIm5hbWVzcGFjZSI6ImFkbWluIiwicm9sZSI6Imd1ZXN0IiwiZXhwIjoxNjgxOTM3ODA1fQ.Pwqa5ylTDnjyivNsyNTi0QNR1oKuHJhCPPxWiznomRE",
    "expirationTime": "2023-04-19 20:56:45 UTC"
  }
}
```

### Create Sharing Client

From now on, you are the [recipient](https://github.com/delta-io/delta-sharing/blob/main/PROTOCOL.md#concepts) of the shared Delta table. To open the shared Delta table as a [pandas](https://pandas.pydata.org/) dataframe, you, as the [recipient](https://github.com/delta-io/delta-sharing/blob/main/PROTOCOL.md#concepts) of the shared Delta table, need to first install the [delta-sharing](https://pypi.org/project/delta-sharing/) package. After installing the package, you can create a `delta_sharing.SharingClient` object using the shared [profile](https://github.com/delta-io/delta-sharing/blob/main/PROTOCOL.md#profile-file-format). This will allow you to access the shared Delta table.

```python
import delta_sharing

profile = "../../creds/profile.json"
client = delta_sharing.SharingClient(profile)
```

### List Tables

Let us verify that we can access the shared [table](https://github.com/delta-io/delta-sharing/blob/main/PROTOCOL.md#concepts) properly. The following script retrieves a list of all tables shared by the [share](https://github.com/delta-io/delta-sharing/blob/main/PROTOCOL.md#concepts) provided by your colleague:

```python
client.list_all_tables()
```

    [Table(name='table1', share='share1', schema='schema1')]

### Load Tables

Now it's time to access the shared data. The operation is incredibly simple: there's no need to prepare troublesome cloud service credentials, and you don't have to worry about what platform your colleague is using. All you have to do is specify the path to the [table](https://github.com/delta-io/delta-sharing/blob/main/PROTOCOL.md#concepts). A [table](https://github.com/delta-io/delta-sharing/blob/main/PROTOCOL.md#concepts) path consists of the [profile](https://github.com/delta-io/delta-sharing/blob/main/PROTOCOL.md#profile-file-format) file path followed by `#` and the fully qualified name of a [table](https://github.com/delta-io/delta-sharing/blob/main/PROTOCOL.md#concepts): `<share-name>.<schema-name>.<table-name>`.

```python
url = profile + "#share1.schema1.table1"
delta_sharing.load_as_pandas(url)
```

<div style={{ overflow: "auto" }}>
  <table>
    <thead>
      <tr>
        <th></th>
        <th>row</th>
        <th>date</th>
        <th>average_price</th>
        <th>total_volume</th>
        <th>4046</th>
        <th>4225</th>
        <th>4770</th>
        <th>total_bags</th>
        <th>small_bags</th>
        <th>large_bags</th>
        <th>xlarge_bags</th>
        <th>type</th>
        <th>year</th>
        <th>region</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <th>0</th>
        <td>0</td>
        <td>2015-12-26 15:00:00</td>
        <td>1.33</td>
        <td>64236.62</td>
        <td>1036.74</td>
        <td>54454.85</td>
        <td>48.16</td>
        <td>8696.87</td>
        <td>8603.62</td>
        <td>93.25</td>
        <td>0.0</td>
        <td>conventional</td>
        <td>2015</td>
        <td>Albany</td>
      </tr>
      <tr>
        <th>1</th>
        <td>1</td>
        <td>2015-12-19 15:00:00</td>
        <td>1.35</td>
        <td>54876.98</td>
        <td>674.28</td>
        <td>44638.81</td>
        <td>58.33</td>
        <td>9505.56</td>
        <td>9408.07</td>
        <td>97.49</td>
        <td>0.0</td>
        <td>conventional</td>
        <td>2015</td>
        <td>Albany</td>
      </tr>
      <tr>
        <th>...</th>
        <td>...</td>
        <td>...</td>
        <td>...</td>
        <td>...</td>
        <td>...</td>
        <td>...</td>
        <td>...</td>
        <td>...</td>
        <td>...</td>
        <td>...</td>
        <td>...</td>
        <td>...</td>
        <td>...</td>
        <td>...</td>
      </tr>
      <tr>
        <th>18247</th>
        <td>10</td>
        <td>2018-01-13 15:00:00</td>
        <td>1.93</td>
        <td>16205.22</td>
        <td>1527.63</td>
        <td>2981.04</td>
        <td>727.01</td>
        <td>10969.54</td>
        <td>10919.54</td>
        <td>50.00</td>
        <td>0.0</td>
        <td>organic</td>
        <td>2018</td>
        <td>WestTexNewMexico</td>
      </tr>
      <tr>
        <th>18248</th>
        <td>11</td>
        <td>2018-01-06 15:00:00</td>
        <td>1.62</td>
        <td>17489.58</td>
        <td>2894.77</td>
        <td>2356.13</td>
        <td>224.53</td>
        <td>12014.15</td>
        <td>11988.14</td>
        <td>26.01</td>
        <td>0.0</td>
        <td>organic</td>
        <td>2018</td>
        <td>WestTexNewMexico</td>
      </tr>
    </tbody>
  </table>
  <p>18249 rows × 14 columns</p>
</div>

### SQL Expressions for Filtering

Great! Now you can access the desired data from the data lake. Suppose you are only interested in the data within the date range of `2016-01-01` and `2017-12-31`. In this case, you can send [SQL snippets](https://github.com/delta-io/delta-sharing/blob/main/PROTOCOL.md#sql-expressions-for-filtering) as hints to the sharing server so that it filters out redundant [Parquet](https://parquet.apache.org/) files. Here's how you can request the desired [Parquet](https://parquet.apache.org/) files (As of April 24, 2023, this filter API is not public in the Python client library, so this code snippet are based on my local patch. I plan to create a pull request in the near future to add this filter API to the public release):

```python
url = profile + "#share1.schema1.table1"
delta_sharing.load_as_pandas(
    url,
    predicateHints=['year >= 2016', 'year <= 2017']
)
```

<div style={{ overflow: "auto" }}>
  <table>
    <thead>
      <tr>
        <th></th>
        <th>row</th>
        <th>date</th>
        <th>average_price</th>
        <th>total_volume</th>
        <th>4046</th>
        <th>4225</th>
        <th>4770</th>
        <th>total_bags</th>
        <th>small_bags</th>
        <th>large_bags</th>
        <th>xlarge_bags</th>
        <th>type</th>
        <th>year</th>
        <th>region</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <th>0</th>
        <td>0</td>
        <td>2016-12-24 15:00:00</td>
        <td>1.52</td>
        <td>73341.73</td>
        <td>3202.39</td>
        <td>58280.33</td>
        <td>426.92</td>
        <td>11432.09</td>
        <td>11017.32</td>
        <td>411.83</td>
        <td>2.94</td>
        <td>conventional</td>
        <td>2016</td>
        <td>Albany</td>
      </tr>
      <tr>
        <th>1</th>
        <td>1</td>
        <td>2016-12-17 15:00:00</td>
        <td>1.53</td>
        <td>68938.53</td>
        <td>3345.36</td>
        <td>55949.79</td>
        <td>138.72</td>
        <td>9504.66</td>
        <td>8876.65</td>
        <td>587.73</td>
        <td>40.28</td>
        <td>conventional</td>
        <td>2016</td>
        <td>Albany</td>
      </tr>
      <tr>
        <th>...</th>
        <td>...</td>
        <td>...</td>
        <td>...</td>
        <td>...</td>
        <td>...</td>
        <td>...</td>
        <td>...</td>
        <td>...</td>
        <td>...</td>
        <td>...</td>
        <td>...</td>
        <td>...</td>
        <td>...</td>
        <td>...</td>
      </tr>
      <tr>
        <th>11336</th>
        <td>49</td>
        <td>2017-01-07 15:00:00</td>
        <td>1.18</td>
        <td>14375.39</td>
        <td>1327.98</td>
        <td>2617.20</td>
        <td>5.75</td>
        <td>10424.46</td>
        <td>10283.85</td>
        <td>140.61</td>
        <td>0.00</td>
        <td>organic</td>
        <td>2017</td>
        <td>WestTexNewMexico</td>
      </tr>
      <tr>
        <th>11337</th>
        <td>50</td>
        <td>2016-12-31 15:00:00</td>
        <td>1.28</td>
        <td>15307.87</td>
        <td>867.66</td>
        <td>3434.02</td>
        <td>37.30</td>
        <td>10968.89</td>
        <td>10815.88</td>
        <td>153.01</td>
        <td>0.00</td>
        <td>organic</td>
        <td>2017</td>
        <td>WestTexNewMexico</td>
      </tr>
    </tbody>
  </table>
  <p>11338 rows × 14 columns</p>
</div>

### JSON predicates for Filtering

While the previous `predicateHints` using [SQL filtering](https://github.com/delta-io/delta-sharing/blob/main/PROTOCOL.md#request-body) is handy, its logical expressiveness is a bit limited and it is recommended to use [JSON filtering](https://github.com/delta-io/delta-sharing/blob/main/PROTOCOL.md#request-body) instead as per the official protocol specification. It should be noted that **the SQL filtering method will be deprecated**. Here's how you can request the desired [Parquet](https://parquet.apache.org/) files using [JSON filtering](https://github.com/delta-io/delta-sharing/blob/main/PROTOCOL.md#request-body)(As of April 24, 2023, this filter API is not public in the Python client library, so this code snippet are based on my local patch. I plan to create a pull request in the near future to add this filter API to the public release):

```python
url = profile + "#share1.schema1.table1"
delta_sharing.load_as_pandas(
    url,
    jsonPredicateHints={
        "op": "and",
        "children": [
            {
                "op": "greaterThanOrEqual",
                "children": [
                    {"op": "column", "name": "year", "valueType": "int"},
                    {"op": "literal", "value": "2016", "valueType": "int"}
                ]
            },
            {
                "op": "lessThanOrEqual",
                "children": [
                    {"op": "column", "name": "year", "valueType":"int"},
                    {"op": "literal", "value": "2017", "valueType": "int"}
                ]
            }
        ]
    }
)
```

<div style={{ overflow: "auto" }}>
  <table>
    <thead>
      <tr>
        <th></th>
        <th>row</th>
        <th>date</th>
        <th>average_price</th>
        <th>total_volume</th>
        <th>4046</th>
        <th>4225</th>
        <th>4770</th>
        <th>total_bags</th>
        <th>small_bags</th>
        <th>large_bags</th>
        <th>xlarge_bags</th>
        <th>type</th>
        <th>year</th>
        <th>region</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <th>0</th>
        <td>0</td>
        <td>2016-12-24 15:00:00</td>
        <td>1.52</td>
        <td>73341.73</td>
        <td>3202.39</td>
        <td>58280.33</td>
        <td>426.92</td>
        <td>11432.09</td>
        <td>11017.32</td>
        <td>411.83</td>
        <td>2.94</td>
        <td>conventional</td>
        <td>2016</td>
        <td>Albany</td>
      </tr>
      <tr>
        <th>1</th>
        <td>1</td>
        <td>2016-12-17 15:00:00</td>
        <td>1.53</td>
        <td>68938.53</td>
        <td>3345.36</td>
        <td>55949.79</td>
        <td>138.72</td>
        <td>9504.66</td>
        <td>8876.65</td>
        <td>587.73</td>
        <td>40.28</td>
        <td>conventional</td>
        <td>2016</td>
        <td>Albany</td>
      </tr>
      <tr>
        <th>...</th>
        <td>...</td>
        <td>...</td>
        <td>...</td>
        <td>...</td>
        <td>...</td>
        <td>...</td>
        <td>...</td>
        <td>...</td>
        <td>...</td>
        <td>...</td>
        <td>...</td>
        <td>...</td>
        <td>...</td>
        <td>...</td>
      </tr>
      <tr>
        <th>11336</th>
        <td>49</td>
        <td>2017-01-07 15:00:00</td>
        <td>1.18</td>
        <td>14375.39</td>
        <td>1327.98</td>
        <td>2617.20</td>
        <td>5.75</td>
        <td>10424.46</td>
        <td>10283.85</td>
        <td>140.61</td>
        <td>0.00</td>
        <td>organic</td>
        <td>2017</td>
        <td>WestTexNewMexico</td>
      </tr>
      <tr>
        <th>11337</th>
        <td>50</td>
        <td>2016-12-31 15:00:00</td>
        <td>1.28</td>
        <td>15307.87</td>
        <td>867.66</td>
        <td>3434.02</td>
        <td>37.30</td>
        <td>10968.89</td>
        <td>10815.88</td>
        <td>153.01</td>
        <td>0.00</td>
        <td>organic</td>
        <td>2017</td>
        <td>WestTexNewMexico</td>
      </tr>
    </tbody>
  </table>
  <p>11338 rows × 14 columns</p>
</div>

## Conclusion

I am really happy to announce the release of the [Kotosiro Sharing](https://github.com/kotosiro/sharing) project, and I want to thank you for reading so far. I hope you have enjoyed this short journey and have seen how [Delta Sharing](https://delta.io/sharing/) could change the game. What I really like about this idea is:

1.  The open and cloud-agnostic protocol.
2.  The ease of managing privacy, security, and compliance.
3.  Eliminating lagging and inconsistent data, as well as the need to email stale data around.
4.  The fact that it doesn't require technical expertise from recipients, as they only need to write a few lines of Python code.

The official open protocol specification is available [here](https://github.com/delta-io/delta-sharing). I also welcome contributions to my [Kotosiro Sharing](https://github.com/kotosiro/sharing) project. Thanks for reading!
