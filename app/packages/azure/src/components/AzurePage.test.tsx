import { QueryClientProvider, APIClient, APIContext } from '@kobsio/core';
import { render as _render, RenderResult, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

import AzurePage from './AzurePage';

import { description } from '../utils/utils';

describe('AzurePage', () => {
  const render = (path: string): RenderResult => {
    const client = new APIClient();
    const getSpy = vi.spyOn(client, 'get');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getSpy.mockImplementation(async (path: string, _): Promise<any> => {
      if (path.startsWith('/api/plugins/azure/costmanagement/actualcosts')) {
        return {
          id: '',
          name: '',
          properties: {
            columns: [
              {
                name: 'Cost',
                type: 'Number',
              },
              {
                name: 'ServiceName',
                type: 'String',
              },
              {
                name: 'Currency',
                type: 'String',
              },
            ],
            rows: [
              [7.217429270778517, 'Bandwidth', 'EUR'],
              [79.51093581715656, 'Load Balancer', 'EUR'],
              [1661.3535416959405, 'Storage', 'EUR'],
              [54.0545288189083, 'Virtual Machines', 'EUR'],
              [15.4219274962097, 'Virtual Network', 'EUR'],
            ],
          },
          type: 'Microsoft.CostManagement/query',
        };
      }

      if (path.startsWith('/api/plugins/azure/monitor/metrics') && !path.includes('virtualMachineScaleSets')) {
        return [
          {
            displayDescription:
              'Maximum number of currently used inflight requests on the apiserver per request kind in the last second',
            errorCode: 'Success',
            id: '',
            name: {
              localizedValue: 'Inflight Requests',
              value: 'apiserver_current_inflight_requests',
            },
            timeseries: [
              {
                data: [
                  {
                    average: 13.180555555555555,
                    timeStamp: '2023-05-09T08:14:00Z',
                  },
                  {
                    average: 12.4375,
                    timeStamp: '2023-05-09T20:14:00Z',
                  },
                  {
                    average: 13.109722222222222,
                    timeStamp: '2023-05-10T08:14:00Z',
                  },
                  {
                    average: 12.623611111111112,
                    timeStamp: '2023-05-10T20:14:00Z',
                  },
                  {
                    average: 13.605555555555556,
                    timeStamp: '2023-05-11T08:14:00Z',
                  },
                  {
                    average: 12.893055555555556,
                    timeStamp: '2023-05-11T20:14:00Z',
                  },
                  {
                    average: 16.445833333333333,
                    timeStamp: '2023-05-12T08:14:00Z',
                  },
                  {
                    average: 16.022222222222222,
                    timeStamp: '2023-05-12T20:14:00Z',
                  },
                  {
                    average: 16.2625,
                    timeStamp: '2023-05-13T08:14:00Z',
                  },
                  {
                    average: 17.476388888888888,
                    timeStamp: '2023-05-13T20:14:00Z',
                  },
                  {
                    average: 16.468055555555555,
                    timeStamp: '2023-05-14T08:14:00Z',
                  },
                  {
                    average: 16.05,
                    timeStamp: '2023-05-14T20:14:00Z',
                  },
                  {
                    average: 16.322222222222223,
                    timeStamp: '2023-05-15T08:14:00Z',
                  },
                  {
                    average: 16.069444444444443,
                    timeStamp: '2023-05-15T20:14:00Z',
                  },
                  {
                    average: 16.804166666666667,
                    timeStamp: '2023-05-16T08:14:00Z',
                  },
                  {
                    average: 15.572222222222223,
                    timeStamp: '2023-05-16T20:14:00Z',
                  },
                  {
                    average: 16.39027777777778,
                    timeStamp: '2023-05-17T08:14:00Z',
                  },
                  {
                    average: 16.719444444444445,
                    timeStamp: '2023-05-17T20:14:00Z',
                  },
                  {
                    average: 17.42361111111111,
                    timeStamp: '2023-05-18T08:14:00Z',
                  },
                  {
                    average: 16.586111111111112,
                    timeStamp: '2023-05-18T20:14:00Z',
                  },
                  {
                    average: 17.447222222222223,
                    timeStamp: '2023-05-19T08:14:00Z',
                  },
                  {
                    average: 16.094444444444445,
                    timeStamp: '2023-05-19T20:14:00Z',
                  },
                  {
                    average: 16.197222222222223,
                    timeStamp: '2023-05-20T08:14:00Z',
                  },
                  {
                    average: 16.819444444444443,
                    timeStamp: '2023-05-20T20:14:00Z',
                  },
                  {
                    average: 15.918055555555556,
                    timeStamp: '2023-05-21T08:14:00Z',
                  },
                  {
                    average: 16.704166666666666,
                    timeStamp: '2023-05-21T20:14:00Z',
                  },
                  {
                    average: 17.495833333333334,
                    timeStamp: '2023-05-22T08:14:00Z',
                  },
                  {
                    average: 16.170833333333334,
                    timeStamp: '2023-05-22T20:14:00Z',
                  },
                  {
                    average: 17.426388888888887,
                    timeStamp: '2023-05-23T08:14:00Z',
                  },
                  {
                    average: 17.119444444444444,
                    timeStamp: '2023-05-23T20:14:00Z',
                  },
                  {
                    average: 17.440277777777776,
                    timeStamp: '2023-05-24T08:14:00Z',
                  },
                  {
                    average: 16.691666666666666,
                    timeStamp: '2023-05-24T20:14:00Z',
                  },
                  {
                    average: 18.593055555555555,
                    timeStamp: '2023-05-25T08:14:00Z',
                  },
                  {
                    average: 17.418055555555554,
                    timeStamp: '2023-05-25T20:14:00Z',
                  },
                  {
                    average: 17.90138888888889,
                    timeStamp: '2023-05-26T08:14:00Z',
                  },
                  {
                    average: 16.458333333333332,
                    timeStamp: '2023-05-26T20:14:00Z',
                  },
                  {
                    average: 17.158333333333335,
                    timeStamp: '2023-05-27T08:14:00Z',
                  },
                  {
                    average: 17.306944444444444,
                    timeStamp: '2023-05-27T20:14:00Z',
                  },
                  {
                    average: 17.331944444444446,
                    timeStamp: '2023-05-28T08:14:00Z',
                  },
                  {
                    average: 18.351388888888888,
                    timeStamp: '2023-05-28T20:14:00Z',
                  },
                  {
                    average: 18.59722222222222,
                    timeStamp: '2023-05-29T08:14:00Z',
                  },
                  {
                    average: 17.90138888888889,
                    timeStamp: '2023-05-29T20:14:00Z',
                  },
                  {
                    average: 19.156944444444445,
                    timeStamp: '2023-05-30T08:14:00Z',
                  },
                  {
                    average: 18.252777777777776,
                    timeStamp: '2023-05-30T20:14:00Z',
                  },
                  {
                    average: 19.320833333333333,
                    timeStamp: '2023-05-31T08:14:00Z',
                  },
                  {
                    average: 20.4375,
                    timeStamp: '2023-05-31T20:14:00Z',
                  },
                  {
                    average: 19.59722222222222,
                    timeStamp: '2023-06-01T08:14:00Z',
                  },
                  {
                    average: 17.24861111111111,
                    timeStamp: '2023-06-01T20:14:00Z',
                  },
                  {
                    average: 19.955555555555556,
                    timeStamp: '2023-06-02T08:14:00Z',
                  },
                  {
                    average: 18.969444444444445,
                    timeStamp: '2023-06-02T20:14:00Z',
                  },
                  {
                    average: 19.155555555555555,
                    timeStamp: '2023-06-03T08:14:00Z',
                  },
                  {
                    average: 17.7375,
                    timeStamp: '2023-06-03T20:14:00Z',
                  },
                  {
                    average: 18.115277777777777,
                    timeStamp: '2023-06-04T08:14:00Z',
                  },
                  {
                    average: 16.18611111111111,
                    timeStamp: '2023-06-04T20:14:00Z',
                  },
                  {
                    average: 17.15138888888889,
                    timeStamp: '2023-06-05T08:14:00Z',
                  },
                  {
                    average: 11.188888888888888,
                    timeStamp: '2023-06-05T20:14:00Z',
                  },
                  {
                    average: 15.005555555555556,
                    timeStamp: '2023-06-06T08:14:00Z',
                  },
                  {
                    average: 17.426388888888887,
                    timeStamp: '2023-06-06T20:14:00Z',
                  },
                  {
                    average: 16.91111111111111,
                    timeStamp: '2023-06-07T08:14:00Z',
                  },
                  {
                    average: 15.23611111111111,
                    timeStamp: '2023-06-07T20:14:00Z',
                  },
                ],
                metadatavalues: [],
              },
            ],
            type: 'Microsoft.Insights/metrics',
            unit: 'Count',
          },
        ];
      }

      if (path.startsWith('/api/plugins/azure/monitor/metrics') && path.includes('virtualMachineScaleSets')) {
        return [
          {
            displayDescription:
              'The percentage of allocated compute units that are currently in use by the Virtual Machine(s)',
            errorCode: 'Success',
            id: '',
            name: {
              localizedValue: 'Percentage CPU',
              value: 'Percentage CPU',
            },
            timeseries: [
              {
                data: [
                  {
                    average: 9.367530381944444,
                    timeStamp: '2023-05-09T08:14:00Z',
                  },
                  {
                    average: 9.011100590687978,
                    timeStamp: '2023-05-09T20:14:00Z',
                  },
                  {
                    average: 8.91471484375,
                    timeStamp: '2023-05-10T08:14:00Z',
                  },
                  {
                    average: 9.189395399305557,
                    timeStamp: '2023-05-10T20:14:00Z',
                  },
                  {
                    average: 9.047534722222222,
                    timeStamp: '2023-05-11T08:14:00Z',
                  },
                  {
                    average: 8.160931202223766,
                    timeStamp: '2023-05-11T20:14:00Z',
                  },
                  {
                    average: 8.830005208333334,
                    timeStamp: '2023-05-12T08:14:00Z',
                  },
                  {
                    average: 8.864345052083333,
                    timeStamp: '2023-05-12T20:14:00Z',
                  },
                  {
                    average: 9.031464124391938,
                    timeStamp: '2023-05-13T08:14:00Z',
                  },
                  {
                    average: 9.587226996527777,
                    timeStamp: '2023-05-13T20:14:00Z',
                  },
                  {
                    average: 9.416819444444444,
                    timeStamp: '2023-05-14T08:14:00Z',
                  },
                  {
                    average: 9.538835069444445,
                    timeStamp: '2023-05-14T20:14:00Z',
                  },
                  {
                    average: 9.13890722724114,
                    timeStamp: '2023-05-15T08:14:00Z',
                  },
                  {
                    average: 9.70731814236111,
                    timeStamp: '2023-05-15T20:14:00Z',
                  },
                  {
                    average: 9.403296006944444,
                    timeStamp: '2023-05-16T08:14:00Z',
                  },
                  {
                    average: 8.537974722029187,
                    timeStamp: '2023-05-16T20:14:00Z',
                  },
                  {
                    average: 8.975570746527778,
                    timeStamp: '2023-05-17T08:14:00Z',
                  },
                  {
                    average: 8.961463107638888,
                    timeStamp: '2023-05-17T20:14:00Z',
                  },
                  {
                    average: 9.290648838418862,
                    timeStamp: '2023-05-18T08:14:00Z',
                  },
                  {
                    average: 9.82398106323836,
                    timeStamp: '2023-05-18T20:14:00Z',
                  },
                  {
                    average: 9.082721227399166,
                    timeStamp: '2023-05-19T08:14:00Z',
                  },
                  {
                    average: 8.835079427083334,
                    timeStamp: '2023-05-19T20:14:00Z',
                  },
                  {
                    average: 9.775522569444444,
                    timeStamp: '2023-05-20T08:14:00Z',
                  },
                  {
                    average: 9.786608072916668,
                    timeStamp: '2023-05-20T20:14:00Z',
                  },
                  {
                    average: 8.674356323835998,
                    timeStamp: '2023-05-21T08:14:00Z',
                  },
                  {
                    average: 8.929838975694445,
                    timeStamp: '2023-05-21T20:14:00Z',
                  },
                  {
                    average: 9.287489989554317,
                    timeStamp: '2023-05-22T08:14:00Z',
                  },
                  {
                    average: 8.596105802640722,
                    timeStamp: '2023-05-22T20:14:00Z',
                  },
                  {
                    average: 10.157946180555555,
                    timeStamp: '2023-05-23T08:14:00Z',
                  },
                  {
                    average: 11.241426649305556,
                    timeStamp: '2023-05-23T20:14:00Z',
                  },
                  {
                    average: 12.178801250868657,
                    timeStamp: '2023-05-24T08:14:00Z',
                  },
                  {
                    average: 12.37672732800556,
                    timeStamp: '2023-05-24T20:14:00Z',
                  },
                  {
                    average: 15.544523003472221,
                    timeStamp: '2023-05-25T08:14:00Z',
                  },
                  {
                    average: 12.349251736111112,
                    timeStamp: '2023-05-25T20:14:00Z',
                  },
                  {
                    average: 12.598786559888579,
                    timeStamp: '2023-05-26T08:14:00Z',
                  },
                  {
                    average: 11.170659722222222,
                    timeStamp: '2023-05-26T20:14:00Z',
                  },
                  {
                    average: 11.165710128561502,
                    timeStamp: '2023-05-27T08:14:00Z',
                  },
                  {
                    average: 11.263017361111112,
                    timeStamp: '2023-05-27T20:14:00Z',
                  },
                  {
                    average: 11.44323828125,
                    timeStamp: '2023-05-28T08:14:00Z',
                  },
                  {
                    average: 10.920749826629681,
                    timeStamp: '2023-05-28T20:14:00Z',
                  },
                  {
                    average: 11.565869093120222,
                    timeStamp: '2023-05-29T08:14:00Z',
                  },
                  {
                    average: 11.583358940972223,
                    timeStamp: '2023-05-29T20:14:00Z',
                  },
                  {
                    average: 12.589338107638888,
                    timeStamp: '2023-05-30T08:14:00Z',
                  },
                  {
                    average: 11.681748263888888,
                    timeStamp: '2023-05-30T20:14:00Z',
                  },
                  {
                    average: 13.04635597637248,
                    timeStamp: '2023-05-31T08:14:00Z',
                  },
                  {
                    average: 12.175697916666667,
                    timeStamp: '2023-05-31T20:14:00Z',
                  },
                  {
                    average: 12.24874001736111,
                    timeStamp: '2023-06-01T08:14:00Z',
                  },
                  {
                    average: 9.989215166782488,
                    timeStamp: '2023-06-01T20:14:00Z',
                  },
                  {
                    average: 11.121230902777778,
                    timeStamp: '2023-06-02T08:14:00Z',
                  },
                  {
                    average: 11.239390190972221,
                    timeStamp: '2023-06-02T20:14:00Z',
                  },
                  {
                    average: 10.695835503472221,
                    timeStamp: '2023-06-03T08:14:00Z',
                  },
                  {
                    average: 10.978681375955524,
                    timeStamp: '2023-06-03T20:14:00Z',
                  },
                  {
                    average: 9.882598958333332,
                    timeStamp: '2023-06-04T08:14:00Z',
                  },
                  {
                    average: 10.738606770833334,
                    timeStamp: '2023-06-04T20:14:00Z',
                  },
                  {
                    average: 12.290235406532314,
                    timeStamp: '2023-06-05T08:14:00Z',
                  },
                  {
                    average: 12.8951953125,
                    timeStamp: '2023-06-05T20:14:00Z',
                  },
                  {
                    average: 14.145555555555555,
                    timeStamp: '2023-06-06T08:14:00Z',
                  },
                  {
                    average: 14.069319010416667,
                    timeStamp: '2023-06-06T20:14:00Z',
                  },
                  {
                    average: 14.076482366226546,
                    timeStamp: '2023-06-07T08:14:00Z',
                  },
                  {
                    average: 11.480668402777777,
                    timeStamp: '2023-06-07T20:14:00Z',
                  },
                ],
                metadatavalues: [],
              },
            ],
            type: 'Microsoft.Insights/metrics',
            unit: 'Percent',
          },
        ];
      }

      return [];
    });

    return _render(
      <MemoryRouter initialEntries={[path]}>
        <QueryClientProvider>
          <APIContext.Provider value={{ client: client, getUser: () => undefined }}>
            <AzurePage
              instance={{
                cluster: 'hub',
                id: '/cluster/hub/type/azure/name/azure',
                name: 'azure',
                type: 'azure',
              }}
            />
          </APIContext.Provider>
        </QueryClientProvider>
      </MemoryRouter>,
    );
  };

  it('should render cost management chart', async () => {
    render(`/plugins/hub/azure/azure?service=${encodeURIComponent('Cost Management')}`);

    expect(screen.getByText('azure')).toBeInTheDocument();
    expect(screen.getByText('(hub / azure)')).toBeInTheDocument();
    expect(screen.getByText(description)).toBeInTheDocument();

    expect(await waitFor(() => screen.getByTestId('cost-management-pie-chart'))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText(/Bandwidth/))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText(/7.22 EUR/))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText(/Load Balancer/))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText(/79.51 EUR/))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText(/Storage/))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText(/1661.35 EUR/))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText(/Virtual Machines/))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText(/54.05 EUR/))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText(/Virtual Network/))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText(/15.42 EUR/))).toBeInTheDocument();
  });

  it('should render metrics chart for kubernetes services', async () => {
    render(
      `/plugins/hub/azure/azure?aggregationType=Average&interval=auto&managedCluster=dev-de1&metric=apiserver_current_inflight_requests&resourceGroup=dev-de1&service=${encodeURIComponent(
        'Kubernetes Services',
      )}`,
    );

    expect(screen.getByText('azure')).toBeInTheDocument();
    expect(screen.getByText('(hub / azure)')).toBeInTheDocument();
    expect(screen.getByText(description)).toBeInTheDocument();

    expect(await waitFor(() => screen.getByTestId('azure-metrics-chart'))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText(/Inflight Requests/))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText(/20.4375 Count/))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText(/11.1889 Count/))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText(/16.5146 Count/))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText(/15.2361 Count/))).toBeInTheDocument();
  });

  it('should render metrics chart for virtual machine scale set', async () => {
    render(
      `/plugins/hub/azure/azure?aggregationType=Average&interval=auto&managedCluster=dev-de1&metric=${encodeURIComponent(
        'Percentage CPU',
      )}&resourceGroup=dev-de1-nodepool&service=${encodeURIComponent(
        'Virtual Machine Scale Sets',
      )}&virtualMachineScaleSet=aks-system-14914330-vmss&virtualMachineScaleSetType=VM&virtualMachineScaleSetVirtualMachine=0`,
    );

    expect(screen.getByText('azure')).toBeInTheDocument();
    expect(screen.getByText('(hub / azure)')).toBeInTheDocument();
    expect(screen.getByText(description)).toBeInTheDocument();

    expect(await waitFor(() => screen.getByTestId('azure-metrics-chart'))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText(/Percentage CPU/))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText(/15.5445 Percent/))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText(/8.1609 Percent/))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText(/10.4551 Percent/))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText(/11.4807 Percent/))).toBeInTheDocument();
  });
});
