import { gridSpans } from '@patternfly/react-core';

import { IDashboardsOptions, IReference, IVariableValues } from './interfaces';

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

// IVariables is a map of variable names with the current value. This interface should only be used by the interpolate
// function, to convert a given array of variables to the format, which is required by the function.
interface IVariables {
  [key: string]: string;
}

// interpolate is used to replace the variables in a given string with the current value for this variable. Before we
// can replace the variables in a string we have to convert the array of variables to a map of variable names and there
// value.
// The default interpolator/delimiter is "{%" and "%}", so that it doesn't conflict with the delimiter used for the
// placeholder. We can not use the same, because the are replaced at different points in our app logic.
// See: https://stackoverflow.com/a/57598892/4104109
export const interpolate = (
  str: string,
  variables: IVariableValues[],
  interpolator: string[] = ['{%', '%}'],
): string => {
  const vars: IVariables = {};

  for (const variable of variables) {
    vars[variable.name] = variable.value;
  }

  return str
    .split(interpolator[0])
    .map((s1, i) => {
      if (i === 0) {
        return s1;
      }

      const s2 = s1.split(interpolator[1]);
      if (s1 === s2[0]) {
        return interpolator[0] + s2[0];
      }

      if (s2.length > 1) {
        s2[0] =
          s2[0] && vars.hasOwnProperty(s2[0].trim().substring(1))
            ? vars[s2[0].trim().substring(1)]
            : interpolator.join(` ${s2[0]} `);
      }

      return s2.join('');
    })
    .join('');
};

// getOptionsFromSearch is used to parse the given search location and return is as options for Prometheus. This is
// needed, so that a user can explore his Prometheus data from a chart. When the user selects the explore action, we
// pass him to this page and pass the data via the URL parameters.
export const getOptionsFromSearch = (
  search: string,
  references: IReference[],
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
