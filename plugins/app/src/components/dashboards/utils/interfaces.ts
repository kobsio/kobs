// IOptions are the options for the Dashboards component. Currently is only contains the active dashboard, but we can
// extend this later to also include the selected time and variables, so that we can pass this values with the current
// url as query parameters.
export interface IOptions {
  dashboard: string;
}
