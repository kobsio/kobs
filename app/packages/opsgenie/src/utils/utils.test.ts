import { vi } from 'vitest';

import { priorityColor, queryWithTime } from './utils';

describe('queryWithTime', () => {
  vi.useFakeTimers().setSystemTime(new Date('2023-01-01'));

  it('should handle no interval with query', () => {
    expect(
      queryWithTime('status: open', {
        time: 'last15Minutes',
        timeEnd: Math.floor(Date.now() / 1000),
        timeStart: Math.floor(Date.now() / 1000) - 900,
      }),
    ).toEqual('status: open AND createdAt >= 1672530300 AND createdAt <= 1672531200');
  });

  it('should handle no interval without query', () => {
    expect(
      queryWithTime('', {
        time: 'last15Minutes',
        timeEnd: Math.floor(Date.now() / 1000),
        timeStart: Math.floor(Date.now() / 1000) - 900,
      }),
    ).toEqual('createdAt >= 1672530300 AND createdAt <= 1672531200');
  });

  it('should handle interval with query', () => {
    expect(
      queryWithTime(
        'status: open',
        {
          time: 'last15Minutes',
          timeEnd: Math.floor(Date.now() / 1000),
          timeStart: Math.floor(Date.now() / 1000) - 900,
        },
        900,
      ),
    ).toEqual('status: open AND createdAt >= 1672530300 AND createdAt <= 1672531200');
  });

  it('should handle interval without query', () => {
    expect(
      queryWithTime(
        '',
        {
          time: 'last15Minutes',
          timeEnd: Math.floor(Date.now() / 1000),
          timeStart: Math.floor(Date.now() / 1000) - 900,
        },
        900,
      ),
    ).toEqual('createdAt >= 1672530300 AND createdAt <= 1672531200');
  });
});

describe('priorityColor', () => {
  it('should return error for P1', () => {
    expect(priorityColor('P1')).toEqual('error');
  });

  it('should return error for P2', () => {
    expect(priorityColor('P2')).toEqual('error');
  });

  it('should return warning for P3', () => {
    expect(priorityColor('P3')).toEqual('warning');
  });

  it('should return success for P4', () => {
    expect(priorityColor('P4')).toEqual('success');
  });

  it('should return info for P5', () => {
    expect(priorityColor('P5')).toEqual('info');
  });

  it('should return default for undefined', () => {
    expect(priorityColor(undefined)).toEqual('default');
  });
});
