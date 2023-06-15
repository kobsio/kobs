export const description = 'Modern monitoring & security. See inside any stack, any app, at any scale, anywhere.';

export const example = `plugin:
  name: datadog
  type: datadog
  options:
    type: logs
    queries:
      - name: CloudWatch Logs
        query: "@service:cloudwatch"`;

export interface ILogData {
  buckets: IBuckets[];
  documents: IDocument[];
  fields: string[];
}

export interface IBuckets {
  computes?: {
    c0?: {
      time: string;
      value: number;
    }[];
  };
}

export interface IDocument {
  attributes?: IDocumentAttributes;
  id?: string;
  type?: string;
}

export interface IDocumentAttributes {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  attributes?: Record<string, any>;
  host?: string;
  message?: string;
  service?: string;
  status?: string;
  tags?: string[];
  timestamp?: string;
}

// getFieldsRecursively returns the fields for a single document as a list of string.
export const getFieldsRecursively = (prefix: string, document: IDocument): string[] => {
  const fields: string[] = [];
  for (const field in document) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (typeof (document as Record<string, any>)[field] === 'object') {
      fields.push(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...getFieldsRecursively(prefix ? `${prefix}.${field}` : field, (document as Record<string, any>)[field]),
      );
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
    fields.push(...getFieldsRecursively('', document));
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
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getProperty = (document: any, key: string): string | number => {
  return key.split('.').reduce((o, x) => {
    return typeof o == 'undefined' || o === null ? o : o[x];
  }, document);
};

// getKeyValues creates an array with all keys and values of the document.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getKeyValues = (obj: any, prefix = ''): { key: string; value: string }[] => {
  return Object.keys(obj).reduce((res: { key: string; value: string }[], el) => {
    if (Array.isArray(obj[el])) {
      return res;
    } else if (typeof obj[el] === 'object' && obj[el] !== null) {
      return [...res, ...getKeyValues(obj[el], prefix + el + '.')];
    }
    return [...res, { key: prefix + el, value: obj[el] }];
  }, []);
};
