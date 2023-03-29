import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

import LogsDownload from './LogsDownload';

describe('LogsDownload', () => {
  const rows = [
    {
      namespace: 'foo',
      timestamp: new Date(2000, 2, 2).toISOString(),
    },
  ];

  it('can download JSON', async () => {
    const fileDownload = vi.fn();
    render(<LogsDownload rows={rows} fileDownload={fileDownload} fields={[]} />);

    const openMenu = screen.getByLabelText('open menu');
    await userEvent.click(openMenu);
    const downloadJSON = screen.getByLabelText('Download Logs');
    await userEvent.click(downloadJSON);
    expect(fileDownload).toHaveBeenCalledWith(JSON.stringify(rows, null, 2), 'kobs-export-logs.json');
  });

  it('can download CSV', async () => {
    const fileDownload = vi.fn();
    render(<LogsDownload rows={rows} fileDownload={fileDownload} fields={['namespace']} />);

    const openMenu = screen.getByLabelText('open menu');
    await userEvent.click(openMenu);
    const downloadCSV = screen.getByLabelText('Download CSV');
    await userEvent.click(downloadCSV);
    expect(fileDownload).toHaveBeenCalledWith('2000-03-02 00:00:00;foo\r\n', 'kobs-export-logs.csv');
  });
});
