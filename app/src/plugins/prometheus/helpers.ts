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
