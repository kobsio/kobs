import { formatTime } from 'utils/helpers';

// IDocument is the interface for a single Elasticsearch document. It is just an general interface for the JSON
// representation of this document.
export interface IDocument {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

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

// getProperty returns the property of an object for a given key.
// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
export const getProperty = (obj: any, key: string): string | number => {
  return key.split('.').reduce((o, x) => {
    return typeof o == 'undefined' || o === null ? o : o[x];
  }, obj);
};

// formatTimeWrapper is a wrapper for our shared formatTime function. It is needed to convert a given time string to the
// corresponding timestamp representation, which we need for the formatTime function.
export const formatTimeWrapper = (time: string): string => {
  return formatTime(Math.floor(new Date(time).getTime() / 1000));
};
