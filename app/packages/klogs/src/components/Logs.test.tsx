import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

import { Documents, LogsDownload } from './Logs';

describe('Logs', () => {
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

  describe('Documents', () => {
    const documents = [
      {
        log: '{"namespace": "foo"}',
        namespace: 'foo',
        timestamp: new Date(2000, 2, 2).toISOString(),
      },
    ];

    const iconName = 'TableChartIcon';

    const setup = (
      documents: Record<string, string>[],
      selectedFields: string[],
      selectField?: (field: string) => void,
    ) => {
      return (
        <Documents
          documents={documents}
          fields={[
            { name: 'log', type: 'string' },
            { name: 'namespace', type: 'string' },
            { name: 'timestamp', type: 'string' },
          ]}
          order={'descending'}
          orderBy={'timestamp'}
          selectField={selectField}
          selectedFields={selectedFields}
        />
      );
    };

    it('show documents with column remove button', async () => {
      const removeFieldMock = vi.fn();
      const selectedFields = ['log', 'namespace', 'timestamp'];
      render(setup(documents, selectedFields, removeFieldMock));

      const removeColumnIcons = screen.getAllByTestId(iconName);
      expect(removeColumnIcons.length).toBe(selectedFields.length);
      expect(screen.getByText('Time')).toBeInTheDocument();
      expect(screen.getByText('log')).toBeInTheDocument();
      expect(screen.getByText('namespace')).toBeInTheDocument();
      expect(screen.getByText('timestamp')).toBeInTheDocument();

      const element = document.querySelector(`button > svg[data-testid="${iconName}"]`);
      expect(element).not.toBeNull();
      /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
      await userEvent.click(element!);

      // check to be called -> first button -> first column, which is 'log'
      expect(removeFieldMock).toBeCalledWith('log');
    });
  });
});
