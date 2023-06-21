import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

import { LogsDownload } from './Logs';

describe('LogsDownload', () => {
  it('can download json for dataview without timestampField', async () => {
    const download = vi.fn();
    render(
      <LogsDownload
        documents={[
          {
            _id: 'C7LB3IgBMr83G61l2FSv',
            _index: 'filebeat-7.13.3-2023.06.21-000001',
            _score: null,
            _source: {
              agent: {
                ephemeral_id: 'f4fb04b9-dbb3-4d7b-87ba-98f327ca6c93',
                hostname: 'kind-control-plane',
                id: '9706b84f-8fff-49bb-9f4c-b60d332c5563',
                name: 'kind-control-plane',
                type: 'filebeat',
                version: '7.13.3',
              },
            },
          },
        ]}
        download={download}
        fields={[]}
        dataView={{
          name: 'dataview',
        }}
      />,
    );

    const openMenu = screen.getByLabelText('open menu');
    await userEvent.click(openMenu);
    const downloadJSON = screen.getByLabelText('Download JSON');
    await userEvent.click(downloadJSON);
    expect(download).toHaveBeenCalledWith(
      '[{"_id":"C7LB3IgBMr83G61l2FSv","_index":"filebeat-7.13.3-2023.06.21-000001","_score":null,"_source":{"agent":{"ephemeral_id":"f4fb04b9-dbb3-4d7b-87ba-98f327ca6c93","hostname":"kind-control-plane","id":"9706b84f-8fff-49bb-9f4c-b60d332c5563","name":"kind-control-plane","type":"filebeat","version":"7.13.3"}}}]',
      'kobs-elasticsearch-export.json',
    );
  });

  it('can download csv for dataview without timestampField', async () => {
    const download = vi.fn();
    render(
      <LogsDownload
        documents={[
          {
            _id: 'C7LB3IgBMr83G61l2FSv',
            _index: 'filebeat-7.13.3-2023.06.21-000001',
            _score: null,
            _source: {
              agent: {
                ephemeral_id: 'f4fb04b9-dbb3-4d7b-87ba-98f327ca6c93',
                hostname: 'kind-control-plane',
                id: '9706b84f-8fff-49bb-9f4c-b60d332c5563',
                name: 'kind-control-plane',
                type: 'filebeat',
                version: '7.13.3',
              },
            },
          },
        ]}
        download={download}
        fields={['agent.hostname', 'agent.name']}
        dataView={{
          name: 'dataview',
        }}
      />,
    );

    const openMenu = screen.getByLabelText('open menu');
    await userEvent.click(openMenu);
    const downloadCSV = screen.getByLabelText('Download CSV');
    await userEvent.click(downloadCSV);
    expect(download).toHaveBeenCalledWith(
      ';kind-control-plane;kind-control-plane\r\n',
      'kobs-elasticsearch-export.csv',
    );
  });

  it('can download csv for dataview with timestampField', async () => {
    const download = vi.fn();
    render(
      <LogsDownload
        documents={[
          {
            _id: 'C7LB3IgBMr83G61l2FSv',
            _index: 'filebeat-7.13.3-2023.06.21-000001',
            _score: null,
            _source: {
              '@timestamp': new Date(2000, 2, 2).toISOString(),
              agent: {
                ephemeral_id: 'f4fb04b9-dbb3-4d7b-87ba-98f327ca6c93',
                hostname: 'kind-control-plane',
                id: '9706b84f-8fff-49bb-9f4c-b60d332c5563',
                name: 'kind-control-plane',
                type: 'filebeat',
                version: '7.13.3',
              },
            },
          },
        ]}
        download={download}
        fields={['agent.hostname', 'agent.name']}
        dataView={{
          name: 'dataview',
          timestampField: '@timestamp',
        }}
      />,
    );

    const openMenu = screen.getByLabelText('open menu');
    await userEvent.click(openMenu);
    const downloadCSV = screen.getByLabelText('Download CSV');
    await userEvent.click(downloadCSV);
    expect(download).toHaveBeenCalledWith(
      '2000-03-02 00:00:00;kind-control-plane;kind-control-plane\r\n',
      'kobs-elasticsearch-export.csv',
    );
  });
});
