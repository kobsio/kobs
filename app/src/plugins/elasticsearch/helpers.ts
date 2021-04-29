import { Query, Spec } from 'proto/elasticsearch_grpc_web_pb';
import { Plugin } from 'proto/plugins_grpc_web_pb';
import { formatTime } from 'utils/helpers';

// ITimes is the interface for a start and end time.
export interface ITimes {
  timeEnd: number;
  timeStart: number;
}

// IElasticsearchOptions is the interface for all options, which can be set for an Elasticsearch query.
export interface IElasticsearchOptions extends ITimes {
  fields?: string[];
  query: string;
  queryName: string;
  scrollID?: string;
}

// IDocument is the interface for a single Elasticsearch document. It is just an general interface for the JSON
// representation of this document.
export interface IDocument {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

// IKeyValue is the interface for a single field in a document, with it's key and value.
export interface IKeyValue {
  key: string;
  value: string;
}

// getOptionsFromSearch is used to get the Elasticsearch options from a given search location.
export const getOptionsFromSearch = (search: string): IElasticsearchOptions => {
  const params = new URLSearchParams(search);
  const fields = params.getAll('field');
  const query = params.get('query');
  const timeEnd = params.get('timeEnd');
  const timeStart = params.get('timeStart');

  return {
    fields: fields.length > 0 ? fields : undefined,
    query: query ? query : '',
    queryName: '',
    scrollID: '',
    timeEnd: timeEnd ? parseInt(timeEnd as string) : Math.floor(Date.now() / 1000),
    timeStart: timeStart ? parseInt(timeStart as string) : Math.floor(Date.now() / 1000) - 3600,
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

// jsonToProto is used to convert a json object into the protobuf message format for the Prometheus plugin. This is
// needed, so that users can use the plugin within resources, where the plugin specs are specified as json object.
// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
export const jsonToProto = (json: any): Plugin.AsObject | undefined => {
  if (!json.elasticsearch || !json.elasticsearch.queries || !Array.isArray(json.elasticsearch.queries)) {
    return undefined;
  }

  const queries: Query[] = [];
  for (const query of json.elasticsearch.queries) {
    if (query.name && query.query) {
      const q = new Query();
      q.setName(query.name);
      q.setQuery(query.query);
      q.setFieldsList(query.fields && Array.isArray(query.fields) ? query.fields : []);
      queries.push(q);
    } else {
      return undefined;
    }
  }

  const elasticsearch = new Spec();
  elasticsearch.setQueriesList(queries);

  const plugin = new Plugin();
  plugin.setName(json.name);
  plugin.setDisplayname(json.displayName ? json.displayName : '');
  plugin.setElasticsearch(elasticsearch);

  return plugin.toObject();
};
