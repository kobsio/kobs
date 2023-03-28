/* eslint-disable sort-keys */
import { QueryClientProvider, APIClient, APIContext, GridContext } from '@kobsio/core';
import { Box } from '@mui/material';
import { render as _render, RenderResult, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

import PrometheusPanel from './PrometheusPanel';

vi.mock('@kobsio/core', async () => {
  const originalModule = await vi.importActual('@kobsio/core');
  return {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...(originalModule as any),
    useDimensions: vi.fn(() => ({ height: 1, width: 1 })),
  };
});

describe('PrometheusPanel', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const render = (options: any, resolve: any): RenderResult => {
    const client = new APIClient();
    const postSpy = vi.spyOn(client, 'post');
    postSpy.mockResolvedValueOnce(resolve);

    return _render(
      <MemoryRouter>
        <QueryClientProvider>
          <APIContext.Provider value={{ client: client, getUser: () => undefined }}>
            <GridContext.Provider value={{ autoHeight: true }}>
              <Box sx={{ height: '500px', width: '500px' }}>
                <PrometheusPanel
                  title="My Panel Title"
                  instance={{
                    cluster: 'hub',
                    id: '/cluster/hub/type/prometheus/name/prometheus',
                    name: 'prometheus',
                    type: 'prometheus',
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
              </Box>
            </GridContext.Provider>
          </APIContext.Provider>
        </QueryClientProvider>
      </MemoryRouter>,
    );
  };

  it('should render error on missing options', async () => {
    render(undefined, null);
    expect(await waitFor(() => screen.getByText('Invalid options for Prometheus plugin'))).toBeInTheDocument();
  });

  it('should render chart and legend', async () => {
    render(
      {
        type: 'line',
        unit: 'Load',
        legend: 'table',
        queries: [
          {
            label: 'Avg. Load',
            query: 'avg(node_load1)',
          },
        ],
      },
      {
        endTime: 1679431310000,
        max: 1.6499999999999997,
        metrics: [
          {
            avg: 1.3331372549019613,
            current: 1.0613333333333335,
            data: [
              { x: 1679430402000, y: 1.4353333333333333 },
              { x: 1679430420000, y: 1.3126666666666666 },
              { x: 1679430438000, y: 1.2466666666666666 },
              { x: 1679430456000, y: 1.1146666666666667 },
              { x: 1679430474000, y: 1.2393333333333332 },
              { x: 1679430492000, y: 1.2106666666666668 },
              { x: 1679430510000, y: 1.2353333333333334 },
              { x: 1679430528000, y: 1.6373333333333333 },
              { x: 1679430546000, y: 1.5393333333333332 },
              { x: 1679430564000, y: 1.43 },
              { x: 1679430582000, y: 1.3293333333333335 },
              { x: 1679430600000, y: 1.2146666666666666 },
              { x: 1679430618000, y: 1.3346666666666664 },
              { x: 1679430636000, y: 1.348 },
              { x: 1679430654000, y: 1.368 },
              { x: 1679430672000, y: 1.359333333333333 },
              { x: 1679430690000, y: 1.342 },
              { x: 1679430708000, y: 1.4773333333333332 },
              { x: 1679430726000, y: 1.6066666666666667 },
              { x: 1679430744000, y: 1.482 },
              { x: 1679430762000, y: 1.4833333333333334 },
              { x: 1679430780000, y: 1.391333333333333 },
              { x: 1679430798000, y: 1.35 },
              { x: 1679430816000, y: 1.3693333333333333 },
              { x: 1679430834000, y: 1.3293333333333335 },
              { x: 1679430852000, y: 1.3053333333333335 },
              { x: 1679430870000, y: 1.218 },
              { x: 1679430888000, y: 1.3760000000000001 },
              { x: 1679430906000, y: 1.4613333333333332 },
              { x: 1679430924000, y: 1.392666666666667 },
              { x: 1679430942000, y: 1.6300000000000001 },
              { x: 1679430960000, y: 1.5126666666666666 },
              { x: 1679430978000, y: 1.446 },
              { x: 1679430996000, y: 1.6499999999999997 },
              { x: 1679431014000, y: 1.5046666666666668 },
              { x: 1679431032000, y: 1.4999999999999996 },
              { x: 1679431050000, y: 1.3953333333333333 },
              { x: 1679431068000, y: 1.3746666666666667 },
              { x: 1679431086000, y: 1.3806666666666665 },
              { x: 1679431104000, y: 1.372666666666667 },
              { x: 1679431122000, y: 1.342 },
              { x: 1679431140000, y: 1.194 },
              { x: 1679431158000, y: 1.2160000000000002 },
              { x: 1679431176000, y: 1.1540000000000001 },
              { x: 1679431194000, y: 1.07 },
              { x: 1679431212000, y: 1.0539999999999998 },
              { x: 1679431230000, y: 1.0266666666666666 },
              { x: 1679431248000, y: 1.0426666666666666 },
              { x: 1679431266000, y: 1.0613333333333335 },
              { x: 1679431284000, y: 1.0613333333333335 },
              { x: 1679431302000, y: 1.0613333333333335 },
            ],
            id: '0-0',
            name: 'Avg. Load',
            max: 1.6499999999999997,
            min: 1.0266666666666666,
          },
        ],
        min: 1.0266666666666666,
        startTime: 1679430402000,
      },
    );

    expect(await waitFor(() => screen.getByText('My Panel Title'))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText('Avg. Load'))).toBeInTheDocument();
  });

  it('should render sparkline', async () => {
    render(
      {
        type: 'sparkline',
        queries: [
          {
            label: 'Avg. Load',
            query: 'avg(node_load1)',
          },
        ],
      },
      {
        endTime: 1679431310000,
        max: 1.6499999999999997,
        metrics: [
          {
            avg: 1.3331372549019613,
            current: 1.0613333333333335,
            data: [
              { x: 1679430402000, y: 1.4353333333333333 },
              { x: 1679430420000, y: 1.3126666666666666 },
              { x: 1679430438000, y: 1.2466666666666666 },
              { x: 1679430456000, y: 1.1146666666666667 },
              { x: 1679430474000, y: 1.2393333333333332 },
              { x: 1679430492000, y: 1.2106666666666668 },
              { x: 1679430510000, y: 1.2353333333333334 },
              { x: 1679430528000, y: 1.6373333333333333 },
              { x: 1679430546000, y: 1.5393333333333332 },
              { x: 1679430564000, y: 1.43 },
              { x: 1679430582000, y: 1.3293333333333335 },
              { x: 1679430600000, y: 1.2146666666666666 },
              { x: 1679430618000, y: 1.3346666666666664 },
              { x: 1679430636000, y: 1.348 },
              { x: 1679430654000, y: 1.368 },
              { x: 1679430672000, y: 1.359333333333333 },
              { x: 1679430690000, y: 1.342 },
              { x: 1679430708000, y: 1.4773333333333332 },
              { x: 1679430726000, y: 1.6066666666666667 },
              { x: 1679430744000, y: 1.482 },
              { x: 1679430762000, y: 1.4833333333333334 },
              { x: 1679430780000, y: 1.391333333333333 },
              { x: 1679430798000, y: 1.35 },
              { x: 1679430816000, y: 1.3693333333333333 },
              { x: 1679430834000, y: 1.3293333333333335 },
              { x: 1679430852000, y: 1.3053333333333335 },
              { x: 1679430870000, y: 1.218 },
              { x: 1679430888000, y: 1.3760000000000001 },
              { x: 1679430906000, y: 1.4613333333333332 },
              { x: 1679430924000, y: 1.392666666666667 },
              { x: 1679430942000, y: 1.6300000000000001 },
              { x: 1679430960000, y: 1.5126666666666666 },
              { x: 1679430978000, y: 1.446 },
              { x: 1679430996000, y: 1.6499999999999997 },
              { x: 1679431014000, y: 1.5046666666666668 },
              { x: 1679431032000, y: 1.4999999999999996 },
              { x: 1679431050000, y: 1.3953333333333333 },
              { x: 1679431068000, y: 1.3746666666666667 },
              { x: 1679431086000, y: 1.3806666666666665 },
              { x: 1679431104000, y: 1.372666666666667 },
              { x: 1679431122000, y: 1.342 },
              { x: 1679431140000, y: 1.194 },
              { x: 1679431158000, y: 1.2160000000000002 },
              { x: 1679431176000, y: 1.1540000000000001 },
              { x: 1679431194000, y: 1.07 },
              { x: 1679431212000, y: 1.0539999999999998 },
              { x: 1679431230000, y: 1.0266666666666666 },
              { x: 1679431248000, y: 1.0426666666666666 },
              { x: 1679431266000, y: 1.0613333333333335 },
              { x: 1679431284000, y: 1.0613333333333335 },
              { x: 1679431302000, y: 1.0613333333333335 },
            ],
            id: '0-0',
            name: 'Avg. Load',
            max: 1.6499999999999997,
            min: 1.0266666666666666,
          },
        ],
        min: 1.0266666666666666,
        startTime: 1679430402000,
      },
    );

    expect(await waitFor(() => screen.getByText('My Panel Title'))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText('Avg. Load'))).toBeInTheDocument();
  });

  it('should render table', async () => {
    render(
      {
        type: 'table',
        queries: [
          {
            label: '{% .pod %}',
            query:
              'sum(rate(container_cpu_usage_seconds_total{namespace="backend", image!="", pod=~"backend.*", container!="POD", container!=""}[2m])) by (pod)',
          },
          {
            label: '{% .pod %}',
            query:
              'sum(kube_pod_container_resource_requests{namespace="backend", resource="cpu", pod=~"backend.*", container!="POD", container!=""}) by (pod)',
          },
          {
            label: '{% .pod %}',
            query:
              'sum(kube_pod_container_resource_limits{namespace="backend", resource="cpu", pod=~"backend.*", container!="POD", container!=""}) by (pod)',
          },
          {
            label: '{% .pod %}',
            query:
              'sum(container_memory_working_set_bytes{namespace="backend", pod=~"backend.*", container!="POD", container!=""}) by (pod) / 1024 / 1024',
          },
          {
            label: '{% .pod %}',
            query:
              'sum(kube_pod_container_resource_requests{namespace="backend", resource="memory", pod=~"backend.*", container!="POD", container!=""}) by (pod) / 1024 / 1024',
          },
          {
            label: '{% .pod %}',
            query:
              'sum(kube_pod_container_resource_limits{namespace="backend", resource="memory", pod=~"backend.*", container!="POD", container!=""}) by (pod) / 1024 / 1024',
          },
        ],
        columns: [
          {
            name: 'pod',
            title: 'Pod',
          },
          {
            name: 'value-1',
            title: 'CPU Usage',
            unit: 'Cores',
          },
          {
            name: 'value-2',
            title: 'CPU Requests',
            unit: 'Cores',
          },
          {
            name: 'value-3',
            title: 'CPU Limits',
            unit: 'Cores',
          },
          {
            name: 'value-4',
            title: 'Memory Usage',
            unit: 'MiB',
          },
          {
            name: 'value-5',
            title: 'Memory Requests',
            unit: 'MiB',
          },
          {
            name: 'value-6',
            title: 'Memory Limits',
            unit: 'MiB',
          },
        ],
      },
      {
        'backend-8656844f6f-b8mkk': {
          pod: 'backend-8656844f6f-b8mkk',
          'value-1': '0.041633340331173344',
          'value-2': '0.15000000000000002',
          'value-3': '2',
          'value-4': '1272.609375',
          'value-5': '3584',
          'value-6': '3584',
        },
        'backend-8656844f6f-bh688': {
          pod: 'backend-8656844f6f-bh688',
          'value-1': '0.03697097643909769',
          'value-2': '0.15000000000000002',
          'value-3': '2',
          'value-4': '1489.7890625',
          'value-5': '3584',
          'value-6': '3584',
        },
        'backend-8656844f6f-qhmnl': {
          pod: 'backend-8656844f6f-qhmnl',
          'value-1': '0.0248552390160649',
          'value-2': '0.15000000000000002',
          'value-3': '2',
          'value-4': '1289.875',
          'value-5': '3584',
          'value-6': '3584',
        },
      },
    );

    expect(await waitFor(() => screen.getByText('My Panel Title'))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText('backend-8656844f6f-b8mkk'))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText('backend-8656844f6f-bh688'))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText('backend-8656844f6f-qhmnl'))).toBeInTheDocument();
  });
});
