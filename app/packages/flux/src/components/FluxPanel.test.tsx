import { QueryClientProvider, APIClient, APIContext } from '@kobsio/core';
import { render as _render, RenderResult, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

import FluxPanel from './FluxPanel';

describe('FluxPanel', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const render = (options: any, resolve: any): RenderResult => {
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
      <MemoryRouter>
        <QueryClientProvider>
          <APIContext.Provider value={{ client: client, getUser: () => undefined }}>
            <FluxPanel
              title="Flux Kustomizations"
              instance={{ cluster: 'hub', id: '/cluster/hub/type/flux/name/flux', name: 'flux', type: 'flux' }}
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
    render(undefined, []);
    expect(await waitFor(() => screen.getByText('Invalid options for Flux plugin'))).toBeInTheDocument();
  });

  it('should render resource error', async () => {
    render(
      {
        clusters: ['test'],
        type: 'kustomizations',
      },
      [
        {
          error: 'Resource not found',
        },
      ],
    );

    expect(await waitFor(() => screen.getByText('Resource not found'))).toBeInTheDocument();
  });

  it('should render cluster error', async () => {
    render(
      {
        clusters: ['test'],
        type: 'kustomizations',
      },
      [
        {
          clusters: [
            {
              cluster: 'test',
              error: 'Cluster error',
              namespaces: [
                {
                  error: 'Namespace error',
                  namespace: '',
                },
              ],
            },
          ],
        },
      ],
    );

    expect(await waitFor(() => screen.getByText('Cluster error'))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText('Namespace error'))).toBeInTheDocument();
  });

  it('should render list of kustomizations', async () => {
    render(
      {
        clusters: ['test'],
        type: 'kustomizations',
      },
      [
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
      ],
    );

    expect(await waitFor(() => screen.getByText('myservice'))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText('flux-system'))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText('test'))).toBeInTheDocument();
  });

  it('should render list of git repositories', async () => {
    render(
      {
        clusters: ['test'],
        type: 'gitrepositories',
      },
      [
        {
          clusters: [
            {
              cluster: 'test',
              error: '',
              namespaces: [
                {
                  error: '',
                  manifest: {
                    apiVersion: 'source.toolkit.fluxcd.io/v1beta2',
                    items: [
                      {
                        apiVersion: 'source.toolkit.fluxcd.io/v1beta2',
                        kind: 'GitRepository',
                        metadata: {
                          annotations: {
                            'reconcile.fluxcd.io/requestedAt': '2023-03-15T10:00:50.403841243+01:00',
                          },
                          creationTimestamp: '2021-11-08T10:20:17Z',
                          finalizers: ['finalizers.fluxcd.io'],
                          generation: 3,
                          labels: {
                            'kustomize.toolkit.fluxcd.io/name': 'cluster',
                            'kustomize.toolkit.fluxcd.io/namespace': 'flux-system',
                          },
                          name: 'cluster',
                          namespace: 'flux-system',
                          resourceVersion: '1436158429',
                          uid: 'a588b60b-b7db-4c92-8486-4a29a9757e13',
                        },
                        spec: {
                          gitImplementation: 'go-git',
                          interval: '1m0s',
                          ref: {
                            branch: 'dev',
                          },
                          secretRef: {
                            name: 'flux-system',
                          },
                          timeout: '1m0s',
                          url: 'ssh://git@github.com/myorg/myrepo',
                        },
                        status: {
                          artifact: {
                            checksum: '5f5ec4d6958bbe0ba3e540871fdf6c0f18696b30273b33d6da7d2ef46b35d6f1',
                            lastUpdateTime: '2023-03-15T09:07:17Z',
                            path: 'gitrepository/flux-system/cluster/d8b5b2c8f820577ecf14a90e8b40a425f3dc4029.tar.gz',
                            revision: 'dev/d8b5b2c8f820577ecf14a90e8b40a425f3dc4029',
                            size: 2640294,
                            url: 'http://source-controller.flux-system.svc.cluster.local./gitrepository/flux-system/cluster/d8b5b2c8f820577ecf14a90e8b40a425f3dc4029.tar.gz',
                          },
                          conditions: [
                            {
                              lastTransitionTime: '2023-03-15T09:07:18Z',
                              message: "stored artifact for revision 'dev/d8b5b2c8f820577ecf14a90e8b40a425f3dc4029'",
                              observedGeneration: 3,
                              reason: 'Succeeded',
                              status: 'True',
                              type: 'Ready',
                            },
                            {
                              lastTransitionTime: '2023-03-15T09:07:18Z',
                              message: "stored artifact for revision 'dev/d8b5b2c8f820577ecf14a90e8b40a425f3dc4029'",
                              observedGeneration: 3,
                              reason: 'Succeeded',
                              status: 'True',
                              type: 'ArtifactInStorage',
                            },
                          ],
                          lastHandledReconcileAt: '2023-03-15T10:00:50.403841243+01:00',
                          observedGeneration: 3,
                          url: 'http://source-controller.flux-system.svc.cluster.local./gitrepository/flux-system/cluster/latest.tar.gz',
                        },
                      },
                    ],
                    kind: 'GitRepositoryList',
                    metadata: {
                      continue: '',
                      resourceVersion: '1436160807',
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
                jsonPath: '.spec.url',
                name: 'URL',
                type: 'string',
              },
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
            description: 'GitRepository is the Schema for the gitrepositories API.',
            id: 'gitrepositories.source.toolkit.fluxcd.io',
            isCRD: true,
            path: '/apis/source.toolkit.fluxcd.io/v1beta2',
            resource: 'gitrepositories',
            scope: 'Namespaced',
            title: 'GitRepository',
          },
        },
      ],
    );

    expect(await waitFor(() => screen.getByText('cluster'))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText('flux-system'))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText('test'))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText('ssh://git@github.com/myorg/myrepo'))).toBeInTheDocument();
  });

  it('should render list of helm releases', async () => {
    render(
      {
        clusters: ['test'],
        type: 'helmreleases',
      },
      [
        {
          clusters: [
            {
              cluster: 'test',
              error: '',
              namespaces: [
                {
                  error: '',
                  manifest: {
                    apiVersion: 'helm.toolkit.fluxcd.io/v2beta1',
                    items: [
                      {
                        apiVersion: 'helm.toolkit.fluxcd.io/v2beta1',
                        kind: 'HelmRelease',
                        metadata: {
                          annotations: { 'reconcile.fluxcd.io/requestedAt': '2022-03-10T09:59:37.819414429+01:00' },
                          creationTimestamp: '2021-12-09T13:02:34Z',
                          finalizers: ['finalizers.fluxcd.io'],
                          generation: 32,
                          labels: {
                            'kustomize.toolkit.fluxcd.io/name': 'testnamespace',
                            'kustomize.toolkit.fluxcd.io/namespace': 'flux-system',
                          },
                          name: 'mongodb-rs',
                          namespace: 'testnamespace',
                          resourceVersion: '1117640714',
                          uid: 'cac57945-6d9d-4563-bf03-23b27ea41aa2',
                        },
                        spec: {
                          chart: {
                            spec: {
                              chart: 'mongodb',
                              reconcileStrategy: 'ChartVersion',
                              sourceRef: { kind: 'HelmRepository', name: 'bitnami', namespace: 'flux-system' },
                              version: '12.1.31',
                            },
                          },
                          install: { crds: 'Skip' },
                          interval: '5m',
                          releaseName: 'mongodb-rs',
                          upgrade: { crds: 'Skip' },
                          values: {
                            arbiter: { enabled: false },
                            architecture: 'replicaset',
                            auth: { enabled: true, existingSecret: 'mongodb-replicaset', rootUser: 'admin' },
                            commonLabels: { app: 'mongodb-rs' },
                            containerSecurityContext: {
                              allowPrivilegeEscalation: false,
                              capabilities: { drop: ['ALL'] },
                              privileged: false,
                              readOnlyRootFilesystem: false,
                              runAsNonRoot: true,
                            },
                            customLivenessProbe: {
                              exec: {
                                command: ['mongo', '--disableImplicitSessions', '--eval', "db.adminCommand('ping')"],
                              },
                              failureThreshold: 6,
                              initialDelaySeconds: 30,
                              periodSeconds: 20,
                              successThreshold: 1,
                              timeoutSeconds: 10,
                            },
                            customReadinessProbe: {
                              exec: {
                                command: [
                                  'bash',
                                  '-ec',
                                  "mongo --disableImplicitSessions $TLS_OPTIONS --eval 'db.hello().isWritablePrimary || db.hello().secondary' | grep -q 'true'\n",
                                ],
                              },
                              failureThreshold: 6,
                              initialDelaySeconds: 5,
                              periodSeconds: 10,
                              successThreshold: 1,
                              timeoutSeconds: 5,
                            },
                            fullnameOverride: 'mongodb-rs',
                            global: { imagePullSecrets: ['staffbase-artifactory'] },
                            image: {
                              registry: 'docker.io',
                              repository: 'bitnami/mongodb',
                              tag: '5.0.13-debian-11-r14',
                            },
                            livenessProbe: { enabled: false },
                            metrics: {
                              args: [
                                '/bin/mongodb_exporter --collect.database --collect.collection --collect.topmetrics --collect.indexusage --collect.connpoolstats --suppress.collectshardingstatus --web.listen-address ":{{ .Values.metrics.containerPort }}" --mongodb.uri "{{ include "mongodb.mongodb_exporter.uri" . }}"\n',
                              ],
                              command: ['/bin/sh', '-ec'],
                              customLivenessProbe: {
                                failureThreshold: 3,
                                httpGet: { path: '/', port: 'metrics', scheme: 'HTTP' },
                                initialDelaySeconds: 15,
                                periodSeconds: 10,
                                successThreshold: 1,
                                timeoutSeconds: 5,
                              },
                              customReadinessProbe: {
                                failureThreshold: 3,
                                httpGet: { path: '/', port: 'metrics', scheme: 'HTTP' },
                                initialDelaySeconds: 5,
                                periodSeconds: 10,
                                successThreshold: 1,
                                timeoutSeconds: 3,
                              },
                              enabled: true,
                              image: { repository: 'staffbase/mongodb-exporter', tag: 'v0.12.0' },
                              livenessProbe: { enabled: false },
                              readinessProbe: { enabled: false },
                              resources: { limits: { memory: '64Mi' }, requests: { cpu: '50m', memory: '64Mi' } },
                              serviceMonitor: {
                                enabled: true,
                                interval: '10s',
                                labels: { release: 'prometheus-operator' },
                                namespace: 'testnamespace',
                                relabelings: [
                                  {
                                    action: 'replace',
                                    sourceLabels: ['__meta_kubernetes_pod_name'],
                                    targetLabel: 'instance',
                                  },
                                  {
                                    action: 'replace',
                                    sourceLabels: ['__meta_kubernetes_pod_node_name'],
                                    targetLabel: 'node',
                                  },
                                ],
                                scrapeTimeout: '10s',
                              },
                            },
                            nameOverride: 'mongodb-rs',
                            pdb: { create: true, minAvailable: 2 },
                            persistence: {
                              accessModes: ['ReadWriteOnce'],
                              enabled: true,
                              size: '10Gi',
                              storageClass: 'managed-premium-xfs-noatime',
                            },
                            podAntiAffinityPreset: '',
                            podLabels: { app: 'mongodb-rs' },
                            readinessProbe: { enabled: false },
                            replicaCount: 3,
                            replicaSetName: 'rs0',
                            resources: { limits: { memory: '768Mi' }, requests: { cpu: '50m', memory: '768Mi' } },
                            service: { nameOverride: 'mongodb-rs' },
                            tls: { enabled: false },
                            topologySpreadConstraints: [
                              {
                                labelSelector: { matchLabels: { app: 'mongodb-rs' } },
                                maxSkew: 1,
                                topologyKey: 'kubernetes.io/hostname',
                                whenUnsatisfiable: 'ScheduleAnyway',
                              },
                              {
                                labelSelector: { matchLabels: { app: 'mongodb-rs' } },
                                maxSkew: 1,
                                topologyKey: 'topology.kubernetes.io/zone',
                                whenUnsatisfiable: 'ScheduleAnyway',
                              },
                            ],
                          },
                        },
                        status: {
                          conditions: [
                            {
                              lastTransitionTime: '2023-01-23T15:39:11Z',
                              message: 'Release reconciliation succeeded',
                              reason: 'ReconciliationSucceeded',
                              status: 'True',
                              type: 'Ready',
                            },
                            {
                              lastTransitionTime: '2023-01-23T15:39:11Z',
                              message: 'Helm upgrade succeeded',
                              reason: 'UpgradeSucceeded',
                              status: 'True',
                              type: 'Released',
                            },
                          ],
                          helmChart: 'flux-system/testnamespace-mongodb-rs',
                          lastAppliedRevision: '12.1.31',
                          lastAttemptedRevision: '12.1.31',
                          lastAttemptedValuesChecksum: '4b0c4fc11c09d557b4ecd6563267672abf7840e4',
                          lastHandledReconcileAt: '2022-03-10T09:59:37.819414429+01:00',
                          lastReleaseRevision: 29,
                          observedGeneration: 32,
                        },
                      },
                    ],
                    kind: 'HelmReleaseList',
                    metadata: { continue: '', resourceVersion: '1436184798' },
                  },
                  namespace: 'testnamespace',
                },
              ],
            },
          ],
          error: '',
          resource: {
            columns: [
              { description: '', jsonPath: '.metadata.creationTimestamp', name: 'Age', type: 'date' },
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
            description: 'HelmRelease is the Schema for the helmreleases API',
            id: 'helmreleases.helm.toolkit.fluxcd.io',
            isCRD: true,
            path: '/apis/helm.toolkit.fluxcd.io/v2beta1',
            resource: 'helmreleases',
            scope: 'Namespaced',
            title: 'HelmRelease',
          },
        },
      ],
    );

    expect(await waitFor(() => screen.getByText('mongodb-rs'))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText('testnamespace'))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText('test'))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText('Release reconciliation succeeded'))).toBeInTheDocument();
  });
});
