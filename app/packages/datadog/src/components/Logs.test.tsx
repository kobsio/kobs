import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

import { LogsDownload } from './Logs';

describe('LogsDownload', () => {
  it('can download json', async () => {
    const download = vi.fn();
    render(
      <LogsDownload
        documents={[
          {
            attributes: {
              host: 'host',
              message: 'message',
              service: 'service',
              timestamp: 'timestamp',
            },
            id: '',
            type: '',
          },
        ]}
        download={download}
        fields={[]}
      />,
    );

    const openMenu = screen.getByLabelText('open menu');
    await userEvent.click(openMenu);
    const downloadJSON = screen.getByLabelText('Download JSON');
    await userEvent.click(downloadJSON);
    expect(download).toHaveBeenCalledWith(
      '[{"attributes":{"host":"host","message":"message","service":"service","timestamp":"timestamp"},"id":"","type":""}]',
      'kobs-export-logs.json',
    );
  });

  it('can download csv', async () => {
    const download = vi.fn();
    render(
      <LogsDownload
        documents={[
          {
            attributes: {
              host: 'host',
              message: 'message',
              service: 'service',
              timestamp: new Date(2000, 2, 2).toISOString(),
            },
            id: '',
            type: '',
          },
        ]}
        download={download}
        fields={[]}
      />,
    );

    const openMenu = screen.getByLabelText('open menu');
    await userEvent.click(openMenu);
    const downloadCSV = screen.getByLabelText('Download CSV');
    await userEvent.click(downloadCSV);
    expect(download).toHaveBeenCalledWith('2000-03-02 00:00:00;host;service;message\r\n', 'kobs-export-logs.csv');
  });
});
