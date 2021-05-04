import { Query, Spec } from 'proto/opsgenie_grpc_web_pb';
import { Plugin } from 'proto/plugins_grpc_web_pb';

// getQueryFromSearch is used to get the query value from the corresponding search parameter. If the parameter isn't
// present we return the default value 'status: open'.
export const getQueryFromSearch = (search: string): string => {
  const params = new URLSearchParams(search);
  const query = params.get('query');

  return query ? query : 'status: open';
};

// jsonToProto is used to convert a json object into the protobuf message format for the Opsgenie plugin. This is
// needed, so that users can use the plugin within resources, where the plugin specs are specified as json object.
// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
export const jsonToProto = (json: any): Plugin.AsObject | undefined => {
  if (!json.opsgenie || !json.opsgenie.queries || !Array.isArray(json.opsgenie.queries)) {
    return undefined;
  }

  const queries: Query[] = [];
  for (const query of json.opsgenie.queries) {
    if (query.name && query.query) {
      const q = new Query();
      q.setName(query.name);
      q.setQuery(query.query);
      queries.push(q);
    } else {
      return undefined;
    }
  }

  const opsgenie = new Spec();
  opsgenie.setQueriesList(queries);

  const plugin = new Plugin();
  plugin.setName(json.name);
  plugin.setDisplayname(json.displayName ? json.displayName : '');
  plugin.setOpsgenie(opsgenie);

  return plugin.toObject();
};
