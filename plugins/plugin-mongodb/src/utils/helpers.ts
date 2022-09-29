import { EJSON } from 'bson';
import parse from 'ejson-shell-parser/dist/ejson-shell-parser.cjs';

import { IQueryOptions, TQueryOperation } from './interfaces';

export const queryOperations: string[] = ['find', 'count'];

export const getInitialQueryOptions = (search: string, isInitial: boolean): IQueryOptions => {
  const params = new URLSearchParams(search);
  const operation = params.get('operation') ?? 'find';
  const query = params.get('query');
  const sort = params.get('sort');
  const limit = params.get('limit');

  return {
    limit: limit ?? '50',
    operation: queryOperations.includes(operation) ? (operation as TQueryOperation) : 'find',
    query: query ?? '{}',
    sort: sort ?? '{"_id" : -1}',
  };
};

export const humanReadableSize = (size: number): string => {
  if (size === 0) return '0 B';
  const i = Math.floor(Math.log(size) / Math.log(1024));
  return (size / Math.pow(1024, i)).toFixed(2) + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i];
};

export const toExtendedJson = (document: string): string => {
  const eJsonDoc = parse(document, { allowComments: true, allowMethods: true });
  const convertedDocument = JSON.parse(EJSON.stringify(eJsonDoc, { relaxed: true }));
  return JSON.stringify(convertedDocument, undefined, '\t');
};
