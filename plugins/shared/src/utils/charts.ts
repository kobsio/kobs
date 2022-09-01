export const chartAxisStyle = {
  tickLabels: {
    fontSize: 10,
    padding: 5,
  },
};

export const chartFormatLabel = (label: string, minLength = 12): string => {
  if (label.length < minLength) {
    return `${' '.repeat(minLength - label.length)}${label}`;
  }

  return label;
};

export const chartTickFormatDate = (tick: Date): string => {
  return `${('0' + (tick.getMonth() + 1)).slice(-2)}-${('0' + tick.getDate()).slice(-2)} ${(
    '0' + tick.getHours()
  ).slice(-2)}:${('0' + tick.getMinutes()).slice(-2)}:${('0' + tick.getSeconds()).slice(-2)}`;
};
