import { IQueryOptions, QueryOperationType, QueryOperationTypes } from './interfaces';
import { EJSON } from 'bson';
import parse from 'ejson-shell-parser/dist/ejson-shell-parser.cjs';

export const getInitialQueryOptions = (search: string, isInitial: boolean): IQueryOptions => {
  const params = new URLSearchParams(search);

  return {
    operation: determineOperation(params.get('operation') ?? '') ?? (QueryOperationTypes.find as QueryOperationType),
    query: params.get('query') ?? '',
  };
};

export const determineOperation = (operation: string): QueryOperationType | undefined => {
  if (operation in QueryOperationTypes) {
    return operation as QueryOperationType;
  }

  return undefined;
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
