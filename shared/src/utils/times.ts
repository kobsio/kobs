// TTime is the type with all possible values of the "time" property in the "ITimes" interface. A value of "custom"
// identifies a custom start and end time, while all other properties can be used to specify a time range where the
// "endTime" is set to now and the start time is calculated using the values in the "timeOptions" object.
export type TTime =
  | 'custom'
  | 'last12Hours'
  | 'last15Minutes'
  | 'last1Day'
  | 'last1Hour'
  | 'last1Year'
  | 'last2Days'
  | 'last30Days'
  | 'last30Minutes'
  | 'last3Hours'
  | 'last5Minutes'
  | 'last6Hours'
  | 'last6Months'
  | 'last7Days'
  | 'last90Days';

// ITimes is the interface for handling times in kobs. Each time object must have a "time" of type "TTime" and a start
// and end time. The start and end time is a unix timestamp in seconds.
export interface ITimes {
  time: TTime;
  timeEnd: number;
  timeStart: number;
}

// times is an array with all valid options for the "TTime" type. It can be used to validate user provided input, so
// that we are save that the input matchs the TTime type.
export const times = [
  'custom',
  'last12Hours',
  'last15Minutes',
  'last1Day',
  'last1Hour',
  'last1Year',
  'last2Days',
  'last30Days',
  'last30Minutes',
  'last3Hours',
  'last5Minutes',
  'last6Hours',
  'last6Months',
  'last7Days',
  'last90Days',
];

// timeOptions is an object with all "TTime" options as key and an object with a "label" and "seconds" key as value. The
// "label" key can be used to show a prettified text for the selected time option, while the "seconds" key is used to
// calculate the start time based on the selected time (the end time always defaults to now).
export const timeOptions: {
  [key: string]: {
    label: string;
    seconds: number;
  };
} = {
  last12Hours: { label: 'Last 12 Hours', seconds: 43200 },
  last15Minutes: { label: 'Last 15 Minutes', seconds: 900 },
  last1Day: { label: 'Last 1 Day', seconds: 86400 },
  last1Hour: { label: 'Last 1 Hour', seconds: 3600 },
  last1Year: { label: 'Last 1 Year', seconds: 31536000 },
  last2Days: { label: 'Last 2 Days', seconds: 172800 },
  last30Days: { label: 'Last 30 Days', seconds: 2592000 },
  last30Minutes: { label: 'Last 30 Minutes', seconds: 1800 },
  last3Hours: { label: 'Last 3 Hours', seconds: 10800 },
  last5Minutes: { label: 'Last 5 Minutes', seconds: 300 },
  last6Hours: { label: 'Last 6 Hours', seconds: 21600 },
  last6Months: { label: 'Last 6 Months', seconds: 15552000 },
  last7Days: { label: 'Last 7 Days', seconds: 604800 },
  last90Days: { label: 'Last 90 Days', seconds: 7776000 },
};
