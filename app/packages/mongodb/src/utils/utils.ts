import { EJSON } from 'bson';
import parse from 'ejson-shell-parser';

export const description = 'MongoDB powers faster, more flexible application development.';

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
