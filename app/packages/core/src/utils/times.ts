/**
 * `TTime` is the type with all possible values of the `time` property in the `ITimes` interface. A value of `custom`
 * identifies a custom start and end time, while all other properties can be used to specify a time range where the
 * end time is set to now and the start time is calculated using the values in the "timeOptions" object.
 */
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

export type TTimeQuick = Exclude<TTime, 'custom'>;

/**
 * `ITimes` is the interface for handling times in kobs. Each time object must have a `time` of type `TTime` and a
 * start and end time. The start and end time is a unix timestamp in seconds.
 */
export interface ITimes {
  time: TTime;
  timeEnd: number;
  timeStart: number;
}

/**
 * `times` is an array with all valid options for the `TTime` type. It can be used to validate user provided input, so
 * that we are save that the input matchs the `TTime` type.
 */
export const times: TTime[] = [
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

/**
 * `timeOptions` is an object with all `TTime` options as key and an object with a `label` and `seconds` key as value.
 * The `label` key can be used to show a prettified text for the selected time option, while the `seconds` key is used
 * to calculate the start time based on the selected time (the end time always defaults to now).
 */
export const timeOptions: Record<
  TTimeQuick,
  {
    label: string;
    seconds: number;
  }
> = {
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

/**
 * `timeDifference` calculates the difference of two given timestamps and returns a human readable string for the
 * difference. It is used to get the same style for the age of resources like it is displayed by kubectl.
 */
export const timeDifference = (current: number, previous: number, long?: boolean): string => {
  const msPerMinute = 60 * 1000;
  const msPerHour = msPerMinute * 60;
  const msPerDay = msPerHour * 24;
  const msPerYear = msPerDay * 365;

  const elapsed = current - previous;

  if (elapsed < msPerMinute) {
    return Math.round(elapsed / 1000) + (long ? ' seconds' : 's');
  } else if (elapsed < msPerHour) {
    return Math.round(elapsed / msPerMinute) + (long ? ' minutes' : 'm');
  } else if (elapsed < msPerDay) {
    return Math.round(elapsed / msPerHour) + (long ? ' hours' : 'h');
  } else if (elapsed < msPerYear) {
    return Math.round(elapsed / msPerDay) + (long ? ' days' : 'd');
  } else {
    return Math.round(elapsed / msPerYear) + (long ? ' years' : 'y');
  }
};

/**
 * `formatTime` formats an given timestamp in a uniform way accross the kobs UI.
 */
export const formatTime = (timestamp: number): string => {
  const d = new Date(timestamp * 1000);
  return `${d.getFullYear()}-${('0' + (d.getMonth() + 1)).slice(-2)}-${('0' + d.getDate()).slice(-2)} ${(
    '0' + d.getHours()
  ).slice(-2)}:${('0' + d.getMinutes()).slice(-2)}:${('0' + d.getSeconds()).slice(-2)}`;
};

/**
 * getTimeParams returns a times object for the parsed time parameters from a URL.
 */
export const getTimeParams = (
  params: URLSearchParams,
  isInitial: boolean,
  defaultTime: TTimeQuick = 'last15Minutes',
): ITimes => {
  const time = params.get('time') as TTime | undefined;
  const timeEnd = params.get('timeEnd');
  const timeStart = params.get('timeStart');

  if (time && times.includes(time) && time !== 'custom') {
    if (isInitial) {
      return {
        time: time as TTime,
        timeEnd: Math.floor(Date.now() / 1000),
        timeStart: Math.floor(Date.now() / 1000) - timeOptions[time].seconds,
      };
    }

    return {
      time: time as TTime,
      timeEnd: timeEnd ? parseInt(timeEnd) : Math.floor(Date.now() / 1000),
      timeStart: timeStart ? parseInt(timeStart) : Math.floor(Date.now() / 1000) - timeOptions[time].seconds,
    };
  }

  const defaultTimeEnd = Math.floor(Date.now() / 1000);
  const defaultTimeStart = Math.floor(Date.now() / 1000) - timeOptions[defaultTime].seconds;

  return {
    time: time && times.includes(time) ? (time as TTime) : defaultTime,
    timeEnd: timeEnd ? parseInt(timeEnd as string) : defaultTimeEnd,
    timeStart: timeStart ? parseInt(timeStart as string) : defaultTimeStart,
  };
};
