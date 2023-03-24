import { QueryClientProvider, APIClient, APIContext } from '@kobsio/core';
import { render as _render, RenderResult, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

import OpsgeniePage from './OpsgeniePage';

import { description } from '../utils/utils';

describe('OpsgeniePage', () => {
  const render = (path: string): RenderResult => {
    const client = new APIClient();
    const getSpy = vi.spyOn(client, 'get');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getSpy.mockImplementation(async (path: string, _): Promise<any> => {
      if (path.startsWith('/api/plugins/opsgenie/alerts')) {
        return [
          {
            alias: '9a37f93a3ef56ad18720df54886ced724e6ea5387bb79c3830e4b922bfbea308',
            count: 1,
            createdAt: '2023-03-24T10:43:50.234Z',
            id: 'e2763a59-cfbe-43c6-95b9-935f3542040e-1679654630234',
            integration: {
              id: '65288bd0-45da-4461-b457-1a72c5dba4e9',
              name: '[unit-app-intranet] Prometheus',
              type: 'Prometheus',
            },
            lastOccurredAt: '2023-03-24T10:43:50.234Z',
            message: '🔥 Alert | CoreDNSErrorsHigh',
            ownerTeamId: 'f41e1c7d-b69c-4da5-af59-c24c00e4e0bc',
            priority: 'P3',
            report: {},
            responders: [
              {
                id: 'f41e1c7d-b69c-4da5-af59-c24c00e4e0bc',
                type: 'team',
                username: '',
              },
            ],
            snoozedUntil: '0001-01-01T00:00:00Z',
            source: 'http://vmalertmanager-vmalertmanager-1:9093/#/alerts?receiver=opsgenie',
            status: 'open',
            tags: ['de1', 'stage', 'unit-app-intranet'],
            tinyId: '44739',
            updatedAt: '2023-03-24T10:43:50.816Z',
          },
        ];
      }

      if (path.startsWith('/api/plugins/opsgenie/alert/details')) {
        return {
          description:
            'CoreDNSErrorsHigh\nCoreDNS is returning SERVFAIL for 2.022% of requests.\nRunbook: https://backstage.staffbase.com/docs/default/Component/redbook/runbooks/coredns-alerts/#CoreDNSErrorsHigh\nDescription: \n\nLabels:\nalertname:CoreDNSErrorsHigh\nalertgroup:coredns-alerts\nseverity:warning\nstaffbase_cluster:de1\nstaffbase_env:stage\nstaffbase_region:de1',
          details: {
            alertgroup: 'coredns-alerts',
            alertname: 'CoreDNSErrorsHigh',
            runbook:
              'https://backstage.staffbase.com/docs/default/Component/redbook/runbooks/coredns-alerts/#CoreDNSErrorsHigh',
            severity: 'warning',
            staffbase_cluster: 'de1',
            staffbase_env: 'stage',
            staffbase_region: 'de1',
          },
        };
      }

      if (path.startsWith('/api/plugins/opsgenie/alert/logs')) {
        return [
          {
            createdAt: '2023-03-24T10:46:50.626Z',
            log: 'Sent [Close] action to SlackApp [SlackApp]',
            offset: '1679654810000_1679654810626550000',
            owner: 'System',
            type: 'system',
          },
        ];
      }

      if (path.startsWith('/api/plugins/opsgenie/alert/notes')) {
        return [
          {
            createdAt: '2023-03-24T10:55:23.608Z',
            note: 'Test',
            offset: '1679655323608000052',
            owner: 'kobsadmin',
          },
        ];
      }

      if (path.startsWith('/api/plugins/opsgenie/incidents')) {
        return [
          {
            createdAt: '2023-03-23T21:07:29.365Z',
            extraProperties: {
              product: 'Email',
              reportedBy: 'user@example.com',
              videoChat: 'https://g.co/meet/sth',
            },
            id: 'b1268b95-0cc9-4d4a-a509-b276db4c0e6b',
            message: 'Multiple accounts reporting many recipients are not receiving emails',
            ownerTeam: '',
            priority: 'P2',
            responders: [{ id: 'e13fcc8a-5e9f-4932-9e04-be1c5f6b0b30', type: 'team' }],
            serviceId: '',
            status: 'open',
            tags: ['tag1'],
            tinyId: '339',
            updatedAt: '2023-03-24T08:20:51.548Z',
          },
        ];
      }

      if (path.startsWith('/api/plugins/opsgenie/incident/timeline')) {
        return [
          {
            actor: { name: 'System', type: 'system' },
            description: { name: '', type: '' },
            eventTime: '2023-03-23T21:07:29.422Z',
            group: 'incident',
            hidden: false,
            id: 'IncidentResponderTeamAdded_9ed5bdd2-83e0-5f0e-b687-e1444231b8bf',
            lastEdit: { actor: { name: '', type: '' }, editTime: '0001-01-01T00:00:00Z' },
            type: 'IncidentResponderTeamAdded',
          },
          {
            actor: { name: 'System', type: 'system' },
            description: { name: '', type: '' },
            eventTime: '2023-03-23T21:07:29.422Z',
            group: 'incident',
            hidden: false,
            id: 'IncidentOpened_9ed5bdd2-83e0-5f0e-b687-e1444231b8bf',
            lastEdit: { actor: { name: '', type: '' }, editTime: '0001-01-01T00:00:00Z' },
            type: 'IncidentOpened',
          },
        ];
      }

      if (path.startsWith('/api/plugins/opsgenie/incident/logs')) {
        return [
          {
            createdAt: '2023-03-23T21:07:31.888Z',
            log: 'Incident details added: [{videoChat=https://g.co/meet/sth}] via API.',
            offset: '1679605651888',
            owner: 'system',
            type: 'ACTION',
          },
          {
            createdAt: '2023-03-23T21:07:29.715Z',
            log: 'Alert sent to team e13fcc8a-5e9f-4932-9e04-be1c5f6b0b30',
            offset: '1679605649715',
            owner: 'system',
            type: 'ACTION',
          },
          {
            createdAt: '2023-03-23T21:07:29.476Z',
            log: 'Incident with tinyId[339] has been created via API',
            offset: '1679605649476',
            owner: 'system',
            type: 'ACTION',
          },
        ];
      }

      if (path.startsWith('/api/plugins/opsgenie/incident/notes')) {
        return [
          {
            createdAt: '2023-03-24T10:55:23.608Z',
            note: 'Test',
            offset: '1679655323608000052',
            owner: 'kobsadmin',
          },
        ];
      }

      return [];
    });

    return _render(
      <MemoryRouter initialEntries={[path]}>
        <QueryClientProvider>
          <APIContext.Provider value={{ client: client, getUser: () => undefined }}>
            <OpsgeniePage
              instance={{
                cluster: 'hub',
                id: '/cluster/hub/type/opsgenie/name/opsgenie',
                name: 'opsgenie',
                type: 'opsgenie',
              }}
            />
          </APIContext.Provider>
        </QueryClientProvider>
      </MemoryRouter>,
    );
  };

  it('should render alerts', async () => {
    render('/?type=alerts');

    expect(screen.getByText('opsgenie')).toBeInTheDocument();
    expect(screen.getByText('(hub / opsgenie)')).toBeInTheDocument();
    expect(screen.getByText(description)).toBeInTheDocument();

    expect(await waitFor(() => screen.getByText('🔥 Alert | CoreDNSErrorsHigh'))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText('Priority:'))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText('Status:'))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText('Tags:'))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText('open'))).toBeInTheDocument();

    await userEvent.click(screen.getByText(/🔥 Alert | CoreDNSErrorsHigh/));
    expect(
      await waitFor(() => screen.getByText(/CoreDNS is returning SERVFAIL for 2.022% of requests./)),
    ).toBeInTheDocument();

    await userEvent.click(screen.getByText(/Logs/));
    expect(
      await waitFor(() => screen.getByText('System: Sent [Close] action to SlackApp [SlackApp]')),
    ).toBeInTheDocument();

    await userEvent.click(screen.getByText(/Notes/));
    expect(await waitFor(() => screen.getByText('kobsadmin: Test'))).toBeInTheDocument();
  });

  it('should render incidents', async () => {
    render('/?type=incidents');

    expect(screen.getByText('opsgenie')).toBeInTheDocument();
    expect(screen.getByText('(hub / opsgenie)')).toBeInTheDocument();
    expect(screen.getByText(description)).toBeInTheDocument();

    expect(
      await waitFor(() => screen.getByText('Multiple accounts reporting many recipients are not receiving emails')),
    ).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText('Priority:'))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText('Status:'))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText('Tags:'))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText('Extra Properties:'))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText('open'))).toBeInTheDocument();

    await userEvent.click(screen.getByText(/Multiple accounts reporting many recipients are not receiving emails/));
    expect(await waitFor(() => screen.getByText(/IncidentResponderTeamAdded by System/))).toBeInTheDocument();

    await userEvent.click(screen.getByText(/Logs/));
    expect(
      await waitFor(() => screen.getByText('system: Alert sent to team e13fcc8a-5e9f-4932-9e04-be1c5f6b0b30')),
    ).toBeInTheDocument();

    await userEvent.click(screen.getByText(/Notes/));
    expect(await waitFor(() => screen.getByText('kobsadmin: Test'))).toBeInTheDocument();
  });
});
