import { Ace } from 'ace-builds';

export const mongoOperatorCompletions: Ace.Completion[] = [
  {
    description: 'Matches values that are equal to a specified value',
    value: `$eq`,
  },
  {
    description: 'Matches values that are greater than a specified value',
    value: `$gt`,
  },
  {
    description: 'Matches values that are greater than or equal to a specified value',
    value: `$gte`,
  },
  {
    description: 'Matches any of the values specified in an array',
    value: `$in`,
  },
  {
    description: 'Matches values that are less than a specified value',
    value: `$lt`,
  },
  {
    description: 'Matches values that are less than or equal to a specified value',
    value: `$lte`,
  },
  {
    description: 'Matches all values that are not equal to a specified value',
    value: `$ne`,
  },
  {
    description: 'Matches none of the values specified in an array',
    value: `$nin`,
  },
  {
    description:
      'Joins query clauses with a logical AND returns all documents that match the conditions of both clauses',
    value: `$and`,
  },
  {
    description:
      'Inverts the effect of a query expression and returns documents that do not match the query expression',
    value: `$not`,
  },
  {
    description: 'Joins query clauses with a logical NOR returns all documents that fail to match both clauses',
    value: `$nor`,
  },
  {
    description:
      'Joins query clauses with a logical OR returns all documents that match the conditions of either clause',
    value: `$or`,
  },
  {
    description: 'Matches documents that have the specified field',
    value: `$exists`,
  },
  {
    description: 'Selects documents if a field is of the specified type',
    value: `$type`,
  },
  {
    description: 'Allows use of aggregation expressions within the query language',
    value: `$expr`,
  },
  {
    description: 'Validate documents against the given JSON Schema',
    value: `$jsonSchema`,
  },
  {
    description: 'Performs a modulo operation on the value of a field and selects documents with a specified result',
    value: `$mod`,
  },
  {
    description: 'Selects documents where values match a specified regular expression',
    value: `$regex`,
  },
  {
    description: 'Performs text search',
    value: `$text`,
  },
  {
    description: 'Matches documents that satisfy a JavaScript expression',
    value: `$where`,
  },
  {
    description: 'Selects geometries that intersect with a GeoJSON geometry',
    value: `$geoIntersects`,
  },
  {
    description: 'Selects geometries within a bounding GeoJSON geometry',
    value: `$geoWithin`,
  },
  {
    description: 'Returns geospatial objects in proximity to a point. Requires a geospatial index',
    value: `$near`,
  },
  {
    description: 'Returns geospatial objects in proximity to a point on a sphere. Requires a geospatial index',
    value: `$nearSphere`,
  },
  {
    description: 'Matches arrays that contain all elements specified in the query',
    value: `$all`,
  },
  {
    description: 'Selects documents if element in the array field matches all the specified $elemMatch conditions',
    value: `$elemMatch`,
  },
  {
    description: 'Selects documents if the array field is a specified size',
    value: `$size`,
  },
  {
    description: 'Matches numeric or binary values in which a set of bit positions all have a value of 0',
    value: `$bitsAllClear`,
  },
  {
    description: 'Matches numeric or binary values in which a set of bit positions all have a value of 1',
    value: `$bitsAllSet`,
  },
  {
    description: 'Matches numeric or binary values in which any bit from a set of bit positions has a value of 0',
    value: `$bitsAnyClear`,
  },
  {
    description: 'Matches numeric or binary values in which any bit from a set of bit positions has a value of 1',
    value: `$bitsAnySet`,
  },
].map(({ value, description }, idx) => {
  return { caption: value, meta: description, score: 100 - idx, value: value };
});

export const mongoTypesCompletions: Ace.Completion[] = [
  {
    description: 'Binary',
    value: `Binary`,
  },
  {
    description: 'Code',
    value: `Code`,
  },
  {
    description: 'DBRef',
    value: `DBRef`,
  },
  {
    description: 'Decimal128',
    value: `Decimal128`,
  },
  {
    description: 'Double',
    value: `Double`,
  },
  {
    description: 'Int32',
    value: `Int32`,
  },
  {
    description: 'Long',
    value: `Long`,
  },
  {
    description: 'UUID',
    value: `UUID`,
  },
  {
    description: 'Map',
    value: `Map`,
  },
  {
    description: 'MaxKey',
    value: `MaxKey`,
  },
  {
    description: 'MinKey',
    value: `MinKey`,
  },
  {
    description: 'ObjectId',
    value: `ObjectId`,
  },
  {
    description: 'ObjectID',
    value: `ObjectID`,
  },
  {
    description: 'BSONRegExp',
    value: `BSONRegExp`,
  },
  {
    description: 'BSONSymbol',
    value: `BSONSymbol`,
  },
  {
    description: 'Timestamp',
    value: `Timestamp`,
  },
].map(({ value, description }, idx) => {
  return { caption: value, meta: description, score: 100 - idx, value: value };
});
