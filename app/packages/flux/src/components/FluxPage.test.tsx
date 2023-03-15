import { QueryClientProvider, APIClient, APIContext } from '@kobsio/core';
import { render as _render, RenderResult, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

import FluxPage from './FluxPage';

import { description } from '../utils/utils';

describe('FluxPage', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const render = (path: string, resolve: any): RenderResult => {
    const client = new APIClient();
    const getSpy = vi.spyOn(client, 'get');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getSpy.mockImplementation(async (path: string, _): Promise<any> => {
      if (path.startsWith('/api/resources')) {
        return resolve;
      }

      return [];
    });

    return _render(
      <MemoryRouter initialEntries={[path]}>
        <QueryClientProvider>
          <APIContext.Provider value={{ client: client, getUser: () => undefined }}>
            <FluxPage
              instance={{ cluster: 'hub', id: '/cluster/hub/type/flux/name/flux', name: 'flux', type: 'flux' }}
            />
          </APIContext.Provider>
        </QueryClientProvider>
      </MemoryRouter>,
    );
  };

  it('should render info that clusters are required', async () => {
    render('/', []);

    expect(screen.getByText('flux')).toBeInTheDocument();
    expect(screen.getByText('(hub / flux)')).toBeInTheDocument();
    expect(screen.getByText(description)).toBeInTheDocument();

    expect(await waitFor(() => screen.getByText('Select a cluster'))).toBeInTheDocument();
  });

  it('should render list of resources', async () => {
    render('/?clusters[]=test&type=kustomizations', [
      {
        clusters: [
          {
            cluster: 'test',
            error: '',
            namespaces: [
              {
                error: '',
                manifest: {
                  apiVersion: 'kustomize.toolkit.fluxcd.io/v1beta2',
                  items: [
                    {
                      apiVersion: 'kustomize.toolkit.fluxcd.io/v1beta2',
                      kind: 'Kustomization',
                      metadata: {
                        annotations: {
                          'reconcile.fluxcd.io/requestedAt': '2023-03-14T22:41:51.123577+01:00',
                        },
                        creationTimestamp: '2022-07-26T11:33:30Z',
                        finalizers: ['finalizers.fluxcd.io'],
                        generation: 7,
                        labels: {
                          'kustomize.toolkit.fluxcd.io/name': 'cluster',
                          'kustomize.toolkit.fluxcd.io/namespace': 'flux-system',
                        },
                        name: 'myservice',
                        namespace: 'flux-system',
                        resourceVersion: '1435930347',
                        uid: '5dfc56a5-5482-4c5e-a5ae-7ef0e0e1afca',
                      },
                      spec: {
                        force: false,
                        interval: '5m0s',
                        path: './kubernetes/namespaces/myservice/dev/de1',
                        prune: true,
                        sourceRef: {
                          kind: 'GitRepository',
                          name: 'cluster',
                        },
                      },
                      status: {
                        conditions: [
                          {
                            lastTransitionTime: '2023-03-15T07:37:39Z',
                            message: 'Applied revision: dev/9a049173a8d8619eb33e9a0a06dea2082729ac46',
                            observedGeneration: 7,
                            reason: 'ReconciliationSucceeded',
                            status: 'True',
                            type: 'Ready',
                          },
                        ],
                        inventory: {
                          entries: [
                            {
                              id: '_myservice__Namespace',
                              v: 'v1',
                            },
                            {
                              id: 'myservice_myservice-configmap__ConfigMap',
                              v: 'v1',
                            },
                            {
                              id: 'myservice_myservice_application.staffbase.com_Application',
                              v: 'v1alpha1',
                            },
                            {
                              id: 'myservice_myservice_kobs.io_Application',
                              v: 'v1',
                            },
                            {
                              id: 'myservice_myservice_networking.istio.io_DestinationRule',
                              v: 'v1beta1',
                            },
                            {
                              id: 'myservice_myservice_networking.istio.io_VirtualService',
                              v: 'v1beta1',
                            },
                          ],
                        },
                        lastAppliedRevision: 'dev/9a049173a8d8619eb33e9a0a06dea2082729ac46',
                        lastAttemptedRevision: 'dev/9a049173a8d8619eb33e9a0a06dea2082729ac46',
                        lastHandledReconcileAt: '2023-03-14T22:41:51.123577+01:00',
                        observedGeneration: 7,
                      },
                    },
                  ],
                  kind: 'KustomizationList',
                  metadata: {
                    continue: '',
                    resourceVersion: '1435933801',
                  },
                },
                namespace: '',
              },
            ],
          },
        ],
        error: '',
        resource: {
          columns: [
            {
              description: '',
              jsonPath: '.metadata.creationTimestamp',
              name: 'Age',
              type: 'date',
            },
            {
              description: '',
              jsonPath: '.status.conditions[?(@.type=="Ready")].status',
              name: 'Ready',
              type: 'string',
            },
            {
              description: '',
              jsonPath: '.status.conditions[?(@.type=="Ready")].message',
              name: 'Status',
              type: 'string',
            },
          ],
          description: 'Kustomization is the Schema for the kustomizations API.',
          id: 'kustomizations.kustomize.toolkit.fluxcd.io',
          isCRD: true,
          path: '/apis/kustomize.toolkit.fluxcd.io/v1beta2',
          resource: 'kustomizations',
          scope: 'Namespaced',
          title: 'Kustomization',
        },
      },
    ]);

    expect(screen.getByText('flux')).toBeInTheDocument();
    expect(screen.getByText('(hub / flux)')).toBeInTheDocument();
    expect(screen.getByText(description)).toBeInTheDocument();

    expect(await waitFor(() => screen.getByText('myservice'))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText('flux-system'))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText('test'))).toBeInTheDocument();
  });
});
