import { EJSON } from 'bson';
import parse from 'ejson-shell-parser';

export const description = 'MongoDB powers faster, more flexible application development.';

export const example = `plugin:
  name: mongodb
  type: mongodb
  options:
    # The operation must be
    #   - "db" to show the database statistics
    #   - "collections" to show the database collections and collection statistics
    #   - "count" to show the number of documents in a collection for provided filter
    #   - "find" to show the documents in a collection for provided filter, sort and limit
    #   - "findOne" to show a single document in a collection for the provided filter
    operation: find
    collectionName: applications
    filter: '{"namespace": "default"}'
    sort: '{"name": -1}'
    limit: 10`;

export const humanReadableSize = (size: number): string => {
  if (size === 0) return '0 B';
  const i = Math.floor(Math.log(size) / Math.log(1024));
  return (size / Math.pow(1024, i)).toFixed(2) + ' ' + ['B', 'KB', 'MB', 'GB', 'TB'][i];
};

export const toExtendedJson = (document: string): string => {
  const eJsonDoc = parse(document, { allowComments: true, allowMethods: true });
  const convertedDocument = JSON.parse(EJSON.stringify(eJsonDoc, { relaxed: true }));
  return JSON.stringify(convertedDocument, undefined, '\t');
};
