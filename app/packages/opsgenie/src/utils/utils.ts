import { ITimes } from '@kobsio/core';

export const description = 'On-call and alert management to keep services always on.';

export const queryWithTime = (query: string, times: ITimes, interval?: number): string => {
  if (interval) {
    const timeEnd = Math.floor(Date.now() / 1000);
    const timeStart = Math.floor(Date.now() / 1000) - interval;

    return query
      ? `${query} AND createdAt >= ${timeStart} AND createdAt <= ${timeEnd}`
      : `createdAt >= ${timeStart} AND createdAt <= ${timeEnd}`;
  }

  return query
    ? `${query} AND createdAt >= ${times.timeStart} AND createdAt <= ${times.timeEnd}`
    : `createdAt >= ${times.timeStart} AND createdAt <= ${times.timeEnd}`;
};

export const priorityColor = (priority?: string): 'error' | 'warning' | 'success' | 'info' | 'default' => {
  if (priority === 'P1') {
    return 'error';
  }

  if (priority === 'P2') {
    return 'error';
  }

  if (priority === 'P3') {
    return 'warning';
  }

  if (priority === 'P4') {
    return 'success';
  }

  if (priority === 'P5') {
    return 'info';
  }

  return 'default';
};
