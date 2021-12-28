import { gridSpans } from '@patternfly/react-core';

import { IDashboard, IDashboardReference, IPlaceholders, IPluginDefaults } from '@kobsio/plugin-core';
import { IDashboardsOptions } from './interfaces';

// toGridSpans is used to convert the provided col and row span value to the corresponding gridSpans value, so that it
// can be used within the Patternfly Grid component. The function requires a default value which is 12 for columns and
// 1 for rows. The default value is used, when the user didn't set a value for the span or when the screen is to small
// so that only one panel can be displayed per row.
export const toGridSpans = (defaultSpan: gridSpans, force: boolean, span: number | undefined): gridSpans => {
  if (!span || span < 1 || span > 12 || force) {
    return defaultSpan;
  }

  return span as gridSpans;
};

// rowHeight is used to calculate the height of a row in the Grid. For that the user defined row height and rowSpan
// value is required. By default each row has a height of 300px (rowSpan == 2). The default value of 150px is always
// multiplied with 150px. When the rowSpan is larger then 1, we also have to add some space for the padding between
// rows.
export const rowHeight = (rowSize: number | undefined, rowSpan: number | undefined): string => {
  if (!rowSize || rowSize < 1 || rowSize > 12) {
    rowSize = 2;
  }

  if (rowSpan && rowSpan > 1 && rowSpan <= 12) {
    return `${rowSize * 150 * rowSpan + (rowSpan - 1) * 16}px`;
  }

  return `${rowSize * 150}px`;
};

// getOptionsFromSearch is used to parse the given search location and return is as options for Prometheus. This is
// needed, so that a user can explore his Prometheus data from a chart. When the user selects the explore action, we
// pass him to this page and pass the data via the URL parameters.
export const getInitialOptions = (
  search: string,
  references: IDashboardReference[],
  useDrawer: boolean,
): IDashboardsOptions => {
  const params = new URLSearchParams(search);
  const dashboard = params.get('dashboard');

  let isReferenced = false;
  if (useDrawer) {
    for (const reference of references) {
      if (reference.title === dashboard) {
        isReferenced = true;
      }
    }
  }

  return {
    dashboard: dashboard && isReferenced ? dashboard : references.length > 0 ? references[0].title : '',
  };
};

// filterDashboards returns all given dashboards where the name contains the given search term.
export const filterDashboards = (dashboards: IDashboard[], searchTerm: string): IDashboard[] => {
  if (searchTerm === '') {
    return dashboards;
  }

  return dashboards.filter((dashboard) => dashboard.name.includes(searchTerm));
};

// getPlaceholdersObject returns the placeholders from the given dashboard as object.
export const getPlaceholdersObject = (dashboard?: IDashboard): IPlaceholders | undefined => {
  if (!dashboard || !dashboard.placeholders) {
    return undefined;
  }

  const placeholders: IPlaceholders = {};

  for (const placeholder of dashboard.placeholders) {
    placeholders[placeholder.name] = '';
  }

  return placeholders;
};

// getPlaceholdersFromSearch parses the given search string and returns all the placeholders from it.
export const getPlaceholdersFromSearch = (search: string): IPlaceholders | undefined => {
  const placeholders = (/^[?#]/.test(search) ? search.slice(1) : search)
    .split('&')
    .reduce((params: IPlaceholders, param) => {
      const item = param.split('=');
      const key = decodeURIComponent(item[0] || '');
      const value = decodeURIComponent(item[1] || '');
      if (key) {
        params[key] = value;
      }
      return params;
    }, {});

  delete placeholders['defaultCluster'];
  delete placeholders['defaultNamespace'];

  return placeholders;
};

// getInitialDefaults returns the plugins defaults from a given search string.
export const getInitialDefaults = (search: string): IPluginDefaults => {
  const params = new URLSearchParams(search);
  const cluster = params.get('defaultCluster');
  const namespace = params.get('defaultNamespace');
  const name = params.get('defaultName');

  return {
    cluster: cluster || '',
    name: name || '',
    namespace: namespace || '',
  };
};
