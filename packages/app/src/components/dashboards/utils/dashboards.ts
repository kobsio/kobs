import { gridSpans } from '@patternfly/react-core';

import { IOptions } from './interfaces';
import { IReference } from '../../../crds/dashboard';

// getInitialOptions is used to parse the given search location and return is as options for Prometheus. This is needed,
// so that a user can explore his Prometheus data from a chart. When the user selects the explore action, we pass him to
// this page and pass the data via the URL parameters.
export const getInitialOptions = (search: string, references: IReference[], useDrawer: boolean): IOptions => {
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
