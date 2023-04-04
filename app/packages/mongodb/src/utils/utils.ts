import { autocompletion, completeFromList } from '@codemirror/autocomplete';
import { javascript } from '@codemirror/lang-javascript';
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

export const codemirrorExtension = () => {
  return [
    javascript(),
    autocompletion({
      override: [
        completeFromList([
          { label: '$eq', type: 'keyword' },
          { label: '$gt', type: 'keyword' },
          { label: '$gte', type: 'keyword' },
          { label: '$in', type: 'keyword' },
          { label: '$lt', type: 'keyword' },
          { label: '$lte', type: 'keyword' },
          { label: '$ne', type: 'keyword' },
          { label: '$nin', type: 'keyword' },
          { label: '$and', type: 'keyword' },
          { label: '$not', type: 'keyword' },
          { label: '$nor', type: 'keyword' },
          { label: '$or', type: 'keyword' },
          { label: '$exists', type: 'keyword' },
          { label: '$type', type: 'keyword' },
          { label: '$expr', type: 'keyword' },
          { label: '$jsonSchema', type: 'keyword' },
          { label: '$mod', type: 'keyword' },
          { label: '$regex', type: 'keyword' },
          { label: '$text', type: 'keyword' },
          { label: '$where', type: 'keyword' },
          { label: '$geoIntersects', type: 'keyword' },
          { label: '$geoWithin', type: 'keyword' },
          { label: '$near', type: 'keyword' },
          { label: '$nearSphere', type: 'keyword' },
          { label: '$all', type: 'keyword' },
          { label: '$elemMatch', type: 'keyword' },
          { label: '$size', type: 'keyword' },
          { label: '$bitsAllClear', type: 'keyword' },
          { label: '$bitsAllSet', type: 'keyword' },
          { label: '$bitsAnyClear', type: 'keyword' },
          { label: '$bitsAnySet', type: 'keyword' },

          { label: 'Binary', type: 'keyword' },
          { label: 'Code', type: 'keyword' },
          { label: 'DBRef', type: 'keyword' },
          { label: 'Decimal128', type: 'keyword' },
          { label: 'Double', type: 'keyword' },
          { label: 'Int32', type: 'keyword' },
          { label: 'Long', type: 'keyword' },
          { label: 'UUID', type: 'keyword' },
          { label: 'Map', type: 'keyword' },
          { label: 'MaxKey', type: 'keyword' },
          { label: 'MinKey', type: 'keyword' },
          { label: 'ObjectId', type: 'keyword' },
          { label: 'BSONRegExp', type: 'keyword' },
          { label: 'BSONSymbol', type: 'keyword' },
          { label: 'Timestamp', type: 'keyword' },
        ]),
      ],
    }),
  ];
};
