import { IVariable } from '@kobsio/plugin-core';

// IVariableValues is an extension of the IVariable interface. It contains the additional fields for the selected
// variable value and all possible variable values.
export interface IVariableValues extends IVariable {
  value: string;
  values: string[];
}

// IDashboardsOptions are the options for the Dashboards component. Currently is only contains the active dashboard, but
// we can extend this later to also include the selected time and variables, so that we can pass this values with the
// current url as query parameters.
export interface IDashboardsOptions {
  dashboard: string;
}
