/* eslint-disable sort-keys */
import { QueryClientProvider, APIClient, APIContext } from '@kobsio/core';
import { render as _render, RenderResult, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

import SignalSciencesPanel from './SignalSciencesPanel';

describe('SignalSciencesPanel', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const render = (options: any): RenderResult => {
    const client = new APIClient();
    const getSpy = vi.spyOn(client, 'get');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getSpy.mockImplementation(async (path: string, _): Promise<any> => {
      if (path.startsWith('/api/plugins/signalsciences/overview')) {
        return [
          {
            AttackCount: 63298,
            BlockedCount: 56442,
            DisplayName: 'My Site Name',
            FlaggedCount: 0,
            FlaggedIPCount: 4,
            Name: 'mysitename',
            TopAttackSources: [
              {
                CountryCode: 'FR',
                CountryName: 'France',
                RequestCount: 57924,
                TotalCount: 63298,
              },
              {
                CountryCode: 'US',
                CountryName: 'United States',
                RequestCount: 3863,
                TotalCount: 63298,
              },
              {
                CountryCode: 'GB',
                CountryName: 'United Kingdom',
                RequestCount: 348,
                TotalCount: 63298,
              },
            ],
            TopAttackTypes: [
              {
                TagCount: 24190,
                TagName: 'Traversal',
                TotalCount: 63853,
              },
              {
                TagCount: 22009,
                TagName: 'XSS',
                TotalCount: 63853,
              },
              {
                TagCount: 7679,
                TagName: 'Log4J JNDI',
                TotalCount: 63853,
              },
            ],
            TotalCount: 2912016,
          },
        ];
      }

      if (path.startsWith('/api/plugins/signalsciences/agents')) {
        return [
          {
            'agent.active': true,
            'agent.addr': 'unix:/sigsci/tmp/sigsci.sock',
            'agent.args': '/sigsci/bin/sigsci-agent ',
            'agent.build_id': '29834080160d27609baef570cb805d73fc9ae997',
            'agent.cgroup':
              '1:name=systemd:/kubepods/burstable/poda868cd72-28f5-486e-976c-4bdf32f48526/2f62e8588711ec439860a67a9f4cdaff5de53d06030c64cb6a526b5b5005b485',
            'agent.connections_dropped': 0,
            'agent.connections_open': 0,
            'agent.connections_total': 0,
            'agent.current_requests': 31,
            'agent.decision_time_50th': 1.5884483333333332,
            'agent.decision_time_95th': 4.355107,
            'agent.decision_time_99th': 4.646757,
            'agent.enabled': true,
            'agent.last_rule_update': '2023-03-21T16:53:23Z',
            'agent.last_seen': '2023-03-21T18:00:55Z',
            'agent.latency_time_50th': 0.6462067499999999,
            'agent.latency_time_95th': 1.1423955000000001,
            'agent.latency_time_99th': 1.807832,
            'agent.max_procs': 8,
            'agent.name': 'sigsci-agent-5f8d8cd7c9-t4sqf',
            'agent.pid': 1,
            'agent.read_bytes': 0,
            'agent.rpc_postrequest': 2475610,
            'agent.rpc_prerequest': 6109342,
            'agent.rpc_updaterequest': 3393600,
            'agent.rule_updates': 379,
            'agent.status': 'online',
            'agent.timestamp': 1679421655,
            'agent.timezone': 'UTC',
            'agent.timezone_offset': 0,
            'agent.upload_metadata_failures': 0,
            'agent.upload_size': 3183,
            'agent.uptime': 3744099,
            'agent.version': '4.32.1',
            'agent.versions_behind': 8,
            'agent.write_bytes': 0,
            'host.agent_cpu': 0.6666626417055193,
            'host.architecture': 'amd64',
            'host.clock_skew': 0,
            'host.cpu': 7.180388954982019,
            'host.cpu_mhz': 2800,
            'host.instance_type': 'azure/Standard_D16s_v5',
            'host.num_cpu': 16,
            'host.os': 'linux/alpine/alpine/3.15.6',
            'host.remote_addr': '20.79.193.117, 140.248.74.68',
            mem_size: 0,
            'module.detected': true,
            'module.server': 'sigsci-agent-envoy 1.0.4',
            'module.type': 'sigsci-agent-envoy',
            'module.version': '1.0.4',
            'module.versions_behind': -1,
            num_gc: 0,
            num_goroutines: 0,
            'runtime.gc_pause_millis': 4286.250694,
          },
        ];
      }

      if (path.startsWith('/api/plugins/signalsciences/requests')) {
        return {
          requests: [
            {
              agentResponseCode: 200,
              headersIn: [
                ['host', 'irgendwas.dev'],
                ['user-agent', 'Irgendwas/1.0'],
                ['x-forwarded-for', '2001:20:2b67:4a8e:6cb1:3716:3695:20a7'],
              ],
              headersOut: [
                ['content-type', 'application/json;charset=utf-8'],
                ['date', 'Tue, 21 Mar 2023 18:04:18 GMT'],
                ['server', 'istio-envoy'],
              ],
              id: '6419f1a3519042e0c651e316',
              method: 'GET',
              path: '/api/channels/saiodjoiasjdoiajsdoijasoidj/posts',
              protocol: 'HTTP/1.1',
              remoteCountryCode: 'NL',
              remoteHostname: 'anonymized ip',
              remoteIP: '2001:20:2b67:4a8e:6cb1:3716:3695:20a7',
              responseCode: 404,
              responseMillis: 17,
              responseSize: 136,
              scheme: 'https',
              serverHostname: 'sigsci-agent-5f8d8cd7c9-t4sqf',
              serverName: 'irgendwas.dev',
              tags: [
                {
                  detector: 'HTTPERROR',
                  location: '',
                  type: 'HTTP404',
                  value: '404',
                },
              ],
              timestamp: '2023-03-21T18:04:18Z',
              tlsCipher: '',
              tlsProtocol: 'TLSV1.2',
              uri: '/api/channels/saiodjoiasjdoiajsdoijasoidj/posts',
              userAgent: 'Irgendwas/1.0',
            },
          ],
          total: 291,
        };
      }

      return [];
    });

    return _render(
      <MemoryRouter>
        <QueryClientProvider>
          <APIContext.Provider value={{ client: client, getUser: () => undefined }}>
            <SignalSciencesPanel
              title="My Panel Title"
              instance={{
                cluster: 'hub',
                id: '/cluster/hub/type/signalsciences/name/signalsciences',
                name: 'signalsciences',
                type: 'signalsciences',
              }}
              options={options}
              times={{
                time: 'last15Minutes',
                timeEnd: 0,
                timeStart: 0,
              }}
              setTimes={() => {
                // nothing
              }}
            />
          </APIContext.Provider>
        </QueryClientProvider>
      </MemoryRouter>,
    );
  };

  it('should render error on missing options', async () => {
    render(undefined);
    expect(await waitFor(() => screen.getByText('Invalid options for SignalSciences plugin'))).toBeInTheDocument();
  });

  it('should render overview', async () => {
    render({ type: 'overview' });

    expect(screen.getByText('My Panel Title')).toBeInTheDocument();

    expect(await waitFor(() => screen.getByText('My Site Name'))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText('2912016 requests'))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText('63298 attacked'))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText('56442 blocked'))).toBeInTheDocument();
  });

  it('should render agents', async () => {
    render({ type: 'agents', site: 'mysitename' });

    expect(screen.getByText('My Panel Title')).toBeInTheDocument();

    expect(await waitFor(() => screen.getByText('sigsci-agent-5f8d8cd7c9-t4sqf'))).toBeInTheDocument();

    await userEvent.click(screen.getByText('sigsci-agent-5f8d8cd7c9-t4sqf'));
    expect(await waitFor(() => screen.getByText('29834080160d27609baef570cb805d73fc9ae997'))).toBeInTheDocument();
  });

  it('should render requests', async () => {
    render({ type: 'requests', site: 'mysitename' });

    expect(screen.getByText('My Panel Title')).toBeInTheDocument();

    expect(await waitFor(() => screen.getByText('GET irgendwas.dev'))).toBeInTheDocument();
    expect(
      await waitFor(() => screen.getByText('/api/channels/saiodjoiasjdoiajsdoijasoidj/posts')),
    ).toBeInTheDocument();

    await userEvent.click(screen.getByText('GET irgendwas.dev'));
    expect(await waitFor(() => screen.getByText('sigsci-agent-5f8d8cd7c9-t4sqf'))).toBeInTheDocument();
  });
});
