import { IDocument, IKeyValue, IOptions } from './interfaces';
import { getTimeParams } from '@kobsio/plugin-core';

// getOptionsFromSearch is used to get the Elasticsearch options from a given search location.
export const getOptionsFromSearch = (search: string): IOptions => {
  const params = new URLSearchParams(search);
  const fields = params.getAll('field');
  const query = params.get('query');

  return {
    fields: fields.length > 0 ? fields : undefined,
    query: query ? query : '',
    times: getTimeParams(params),
  };
};

// getFieldsRecursively returns the fields for a single document as a list of string.
export const getFieldsRecursively = (prefix: string, document: IDocument): string[] => {
  const fields: string[] = [];
  for (const field in document) {
    if (typeof document[field] === 'object') {
      fields.push(...getFieldsRecursively(prefix ? `${prefix}.${field}` : field, document[field]));
    } else {
      fields.push(prefix ? `${prefix}.${field}` : field);
    }
  }

  return fields;
};

// getFields is used to get all fields as strings for the given documents. To get the fields we are looping over the
// given documents and adding each field from this document. As a last step we have to remove all duplicated fields.
export const getFields = (documents: IDocument[]): string[] => {
  const fields: string[] = [];
  for (const document of documents) {
    fields.push(...getFieldsRecursively('', document['_source']));
  }

  const uniqueFields: string[] = [];
  for (const field of fields) {
    if (uniqueFields.indexOf(field) === -1) {
      uniqueFields.push(field);
    }
  }

  return uniqueFields;
};

// formatTime formate the given time string. We do not use the formatTime function from the core package, because we
// also want to include milliseconds in the logs timestamp, which we show.
export const formatTime = (time: string): string => {
  const d = new Date(time);
  return `${d.getFullYear()}-${('0' + (d.getMonth() + 1)).slice(-2)}-${('0' + d.getDate()).slice(-2)} ${(
    '0' + d.getHours()
  ).slice(-2)}:${('0' + d.getMinutes()).slice(-2)}:${('0' + d.getSeconds()).slice(-2)}.${(
    '00' + d.getMilliseconds()
  ).slice(-3)}`;
};

// getProperty returns the property of an object for a given key.
// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
export const getProperty = (obj: any, key: string): string | number => {
  return key.split('.').reduce((o, x) => {
    return typeof o == 'undefined' || o === null ? o : o[x];
  }, obj);
};

// getKeyValues creates an array with all keys and values of the document.
export const getKeyValues = (obj: IDocument, prefix = ''): IKeyValue[] => {
  return Object.keys(obj).reduce((res: IKeyValue[], el) => {
    if (Array.isArray(obj[el])) {
      return res;
    } else if (typeof obj[el] === 'object' && obj[el] !== null) {
      return [...res, ...getKeyValues(obj[el], prefix + el + '.')];
    }
    return [...res, { key: prefix + el, value: obj[el] }];
  }, []);
};
