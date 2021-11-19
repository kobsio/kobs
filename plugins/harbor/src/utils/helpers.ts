import { formatTime as formatTimeCore } from '@kobsio/plugin-core';

export const COLOR_DANGER = 'var(--pf-global--danger-color--100)';
export const COLOR_INFO = 'var(--pf-global--info-color--100)';
export const COLOR_OK = 'var(--pf-global--success-color--100)';
export const COLOR_WARNING = 'var(--pf-global--warning-color--100)';

export const formatBytes = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export const formatTime = (time: string): string => {
  return formatTimeCore(Math.floor(new Date(time).getTime() / 1000));
};
