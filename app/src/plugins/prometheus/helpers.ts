import { Chart, Query, Spec, Variable } from 'proto/prometheus_grpc_web_pb';
import { Plugin } from 'proto/plugins_grpc_web_pb';

// ITimes is the interface for a start and end time.
export interface ITimes {
  timeEnd: number;
  timeStart: number;
}

// IPrometheusOptions is the interface for all options, which can be set for a Prometheus query.
export interface IPrometheusOptions extends ITimes {
  queries: string[];
  resolution: string;
}

// getOptionsFromSearch is used to parse the given search location and return is as options for Prometheus. This is
// needed, so that a user can explore his Prometheus data from a chart. When the user selects the explore action, we
// pass him to this page and pass the data via the URL parameters.
export const getOptionsFromSearch = (search: string): IPrometheusOptions => {
  const params = new URLSearchParams(search);
  const queries = params.getAll('query');
  const resolution = params.get('resolution');
  const timeEnd = params.get('timeEnd');
  const timeStart = params.get('timeStart');

  return {
    queries: queries.length > 0 ? queries : [''],
    resolution: resolution ? resolution : '',
    timeEnd: timeEnd ? parseInt(timeEnd as string) : Math.floor(Date.now() / 1000),
    timeStart: timeStart ? parseInt(timeStart as string) : Math.floor(Date.now() / 1000) - 3600,
  };
};

// jsonToProto is used to convert a json object into the protobuf message format for the Prometheus plugin. This is
// needed, so that users can use the plugin within resources, where the plugin specs are specified as json object.
// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
export const jsonToProto = (json: any): Plugin.AsObject | undefined => {
  if (!json.prometheus) {
    return undefined;
  }

  const variables: Variable[] = [];
  if (json.prometheus.variables && Array.isArray(json.prometheus.variables)) {
    for (const variable of json.prometheus.variables) {
      if (variable.name && variable.label && variable.query) {
        const v = new Variable();
        v.setName(variable.name);
        v.setLabel(variable.label);
        v.setQuery(variable.query);
        v.setAllowall(variable.allowAll ? true : false);
        variables.push(v);
      }
    }
  }

  const charts: Chart[] = [];
  if (json.prometheus.charts && Array.isArray(json.prometheus.charts)) {
    for (const chart of json.prometheus.charts) {
      if (chart.title && chart.type) {
        if (chart.type === 'divider') {
          const c = new Chart();
          c.setTitle(chart.title);
          c.setType(chart.type);
          charts.push(c);
        } else {
          if (chart.queries && Array.isArray(chart.queries)) {
            const c = new Chart();
            c.setTitle(chart.title);
            c.setType(chart.type);
            c.setUnit(chart.unit ? chart.unit : '');
            c.setStacked(chart.stacked ? true : false);
            c.setSize(chart.size ? chart.size : 12);

            const queries: Query[] = [];
            for (const query of chart.queries) {
              if (query.query && query.label) {
                const q = new Query();
                q.setLabel(query.label);
                q.setQuery(query.query);
                queries.push(q);
              } else {
                return undefined;
              }
            }

            c.setQueriesList(queries);
            charts.push(c);
          } else {
            return undefined;
          }
        }
      } else {
        return undefined;
      }
    }
  }

  const prometheus = new Spec();
  prometheus.setVariablesList(variables);
  prometheus.setChartsList(charts);

  const plugin = new Plugin();
  plugin.setName(json.name);
  plugin.setPrometheus(prometheus);

  return plugin.toObject();
};
