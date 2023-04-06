import { IPluginInstance } from '@kobsio/core';
import queryString from 'query-string';

/**
 * utility for creating the path to the sql plugin with the given query as query-parameter
 **/
export const uriFromQuery = (instance: IPluginInstance, query: string) => {
  const path = `/plugins/${instance.cluster}/sql/${instance.name}`;
  const search = queryString.stringify(
    {
      query: query,
    },
    { arrayFormat: 'bracket', skipEmptyString: false, skipNull: false },
  );

  return [path, search].join('?');
};
