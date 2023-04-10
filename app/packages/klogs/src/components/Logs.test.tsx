import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

import { LogsDownload } from './Logs';

describe('LogsDownload', () => {
  const documents = [
    {
      log: '{"namespace": "foo"}',
      namespace: 'foo',
      timestamp: new Date(2000, 2, 2).toISOString(),
    },
  ];

  it('can download logs', async () => {
    const download = vi.fn();
    render(<LogsDownload documents={documents} download={download} fields={[]} />);

    const openMenu = screen.getByLabelText('open menu');
    await userEvent.click(openMenu);
    const downloadJSON = screen.getByLabelText('Download Logs');
    await userEvent.click(downloadJSON);
    expect(download).toHaveBeenCalledWith('{"namespace": "foo"}', 'kobs-export-logs.log');
  });

  it('can download csv', async () => {
    const download = vi.fn();
    render(<LogsDownload documents={documents} download={download} fields={['namespace']} />);

    const openMenu = screen.getByLabelText('open menu');
    await userEvent.click(openMenu);
    const downloadCSV = screen.getByLabelText('Download CSV');
    await userEvent.click(downloadCSV);
    expect(download).toHaveBeenCalledWith('2000-03-02 00:00:00;foo\r\n', 'kobs-export-logs.csv');
  });
});
