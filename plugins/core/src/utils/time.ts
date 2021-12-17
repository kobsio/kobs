import { IPluginTimes, TTime } from '../context/PluginsContext';
import { TTimeOptions, timeOptions } from '../components/toolbar/Toolbar';

// timeDifference calculates the difference of two given timestamps and returns a human readable string for the
// difference. It is used to get the same style for the age of resources like it is displayed by kubectl.
export const timeDifference = (current: number, previous: number): string => {
  const msPerMinute = 60 * 1000;
  const msPerHour = msPerMinute * 60;
  const msPerDay = msPerHour * 24;
  const msPerYear = msPerDay * 365;

  const elapsed = current - previous;

  if (elapsed < msPerMinute) {
    return Math.round(elapsed / 1000) + 's';
  } else if (elapsed < msPerHour) {
    return Math.round(elapsed / msPerMinute) + 'm';
  } else if (elapsed < msPerDay) {
    return Math.round(elapsed / msPerHour) + 'h';
  } else if (elapsed < msPerYear) {
    return Math.round(elapsed / msPerDay) + 'd';
  } else {
    return Math.round(elapsed / msPerYear) + 'y';
  }
};

// formatTime formats an given timestamp in a uniform way accross the kobs UI.
export const formatTime = (timestamp: number): string => {
  const d = new Date(timestamp * 1000);
  return `${d.getFullYear()}-${('0' + (d.getMonth() + 1)).slice(-2)}-${('0' + d.getDate()).slice(-2)} ${(
    '0' + d.getHours()
  ).slice(-2)}:${('0' + d.getMinutes()).slice(-2)}:${('0' + d.getSeconds()).slice(-2)}`;
};

// getTimeParams returns a times object for the parsed time parameters from a URL.
export const getTimeParams = (params: URLSearchParams, isInitial: boolean): IPluginTimes => {
  const time = params.get('time');
  const timeEnd = params.get('timeEnd');
  const timeStart = params.get('timeStart');

  if (time && TTimeOptions.includes(time) && time !== 'custom') {
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

  return {
    time: time && TTimeOptions.includes(time) ? (time as TTime) : 'last15Minutes',
    timeEnd: timeEnd ? parseInt(timeEnd as string) : Math.floor(Date.now() / 1000),
    timeStart: timeStart ? parseInt(timeStart as string) : Math.floor(Date.now() / 1000) - 900,
  };
};
