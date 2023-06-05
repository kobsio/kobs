# Mongodb

The MongoDB plugin can be used to access data from a MongoDB instance via kobs.

![Overview](assets/mongodb-overview.png)

## Configuration

The MongoDB plugin can be used within the `hub` or `cluster`. To use the MongoDB plugin the following configuration is needed:

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| name | string | The name of the MongoDB plugin instance. | Yes |
| type | `mongodb` | The type for the MongoDB plugin. | Yes |
| options.connectionString | string | The connection string to the MongoDB instance. | Yes |
| options.databaseName | string | The name of the MongoDB database. | Yes |

```yaml
plugins:
  - name: MongoDB
    type: MongoDB
    options:
      connectionString: mongodb://username:password@localhost:27017/?directconnection=true
      databaseName: admin
```

## Insight Options

!!! note
    The MongoDB plugin can not be used within the insights section of an application.

## Variable Options

!!! note
    The MongoDB plugin can not be used to get a list of variable values.

## Panel Options

The following options can be used for a panel with the MongoDB plugin:

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| operation | string | The operation which should be run against MongoDB. Must be `db`, `collections`, `count`, `find`, `findOne` or `aggregate`. | Yes |
| collectionName | string | The name of the collection for a `count`, `find`, `findOne` or `aggregate` query. | Yes |
| filter | string | The filter which should be executed. The default value is `{}`. | No |
| limit | string | The maximum amount of documents which should be returned. The default is `50`. | No |
| sort | string | The sort order for the returned documents. The default is `{"_id" : -1}`. | No |
| pipeline | string | The pipeline which should be executed when the operation is `aggregate`. | No |

## Usage

### Tree View

![Tree](assets/mongodb-tree.png)

### BSON View

![BSON](assets/mongodb-bson.png)
