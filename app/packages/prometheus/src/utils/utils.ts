export const description =
  'From metrics to insight: Power your metrics and alerting with the leading open-source monitoring solution.';

// `IMetrics` implements the interface for the corresponding Go struct, which is returned by our API. It contains a list
// of metrics, the start and end time and the minimum and maximum value accross all time series.
export interface IMetrics {
  endTime: number;
  max: number;
  metrics?: IMetric[];
  min: number;
  startTime: number;
}

// `IMetric` implements the interface for the corresponding Go struct, which is returned by our API. It contains one
// additional field named `color`, which is used to specify the color for a line, when the user selected a single line
// in the legend. The data points are implemented by the IDatum interface.
export interface IMetric {
  avg: number;
  color: string;
  current: number;
  data: IDatum[];
  id: string;
  max: number;
  min: number;
  name: string;
}

// The `IDatum` interface represents one datapoint in a metric. Since the API returns the `x` value is number, but we
// need it as `Date` we have to make sure to convert it after we received the data from our API. The `custom` fields are
// only available at the client side and mainly used to render the tooltip for a datapoint. This is required since we
// only have access to the `IDatum` in the tooltip.
export interface IDatum {
  color: string;
  name: string;
  x: number | Date;
  y: number;
}

/**
 * `TOrder` is our type, which represents the different orders we are supporting. These are ascending (`asc`) and
 * deascending `desc`.
 */
export type TOrder = 'asc' | 'desc';

/**
 * `TOrderBy` is our type, after which we can order the returned metrics. This must be a valid key in the `IMetric`
 * interface.
 */
export type TOrderBy = 'name' | 'min' | 'max' | 'avg' | 'current';

/**
 * `IOrder` is the interface which combins the `TOrder` and `TOrderBy` types into one type, so we only have one state
 * change, when we update the values.
 */
export interface IOrder {
  order: TOrder;
  orderBy: TOrderBy;
}
