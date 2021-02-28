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
