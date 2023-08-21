import { QueryClientProvider, APIClient, APIContext } from '@kobsio/core';
import { render as _render, RenderResult, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

import VeleroPage from './VeleroPage';

import { description } from '../utils/utils';

describe('VeleroPage', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const render = (path: string, resolve: any): RenderResult => {
    const client = new APIClient();
    const getSpy = vi.spyOn(client, 'get');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getSpy.mockImplementation(async (path: string, _): Promise<any> => {
      if (path.startsWith('/api/resources')) {
        return resolve;
      }

      if (path.startsWith('/api/plugins/velero/logs')) {
        return 'Test logs for the selected backup';
      }

      return [];
    });

    return _render(
      <MemoryRouter initialEntries={[path]}>
        <QueryClientProvider>
          <APIContext.Provider value={{ client: client, getUser: () => undefined }}>
            <VeleroPage
              instance={{ cluster: 'hub', id: '/cluster/hub/type/velero/name/velero', name: 'velero', type: 'velero' }}
            />
          </APIContext.Provider>
        </QueryClientProvider>
      </MemoryRouter>,
    );
  };

  it('should render info that clusters are required', async () => {
    render('/', []);

    expect(screen.getByText('velero')).toBeInTheDocument();
    expect(screen.getByText('(hub / velero)')).toBeInTheDocument();
    expect(screen.getByText(description)).toBeInTheDocument();

    expect(await waitFor(() => screen.getByText('Select a cluster'))).toBeInTheDocument();
  });

  it('should render list of resources', async () => {
    render('/?clusters[]=dev-de1&type=backups', [
      {
        clusters: [
          {
            cluster: 'dev-de1',
            error: '',
            namespaces: [
              {
                error: '',
                manifest: {
                  apiVersion: 'velero.io/v1',
                  items: [
                    {
                      apiVersion: 'velero.io/v1',
                      kind: 'Backup',
                      metadata: {
                        annotations: {
                          'velero.io/source-cluster-k8s-gitversion': 'v1.25.6',
                          'velero.io/source-cluster-k8s-major-version': '1',
                          'velero.io/source-cluster-k8s-minor-version': '25',
                        },
                        creationTimestamp: '2023-07-24T14:28:30Z',
                        generation: 4,
                        labels: {
                          'kustomize.toolkit.fluxcd.io/name': 'backstage',
                          'kustomize.toolkit.fluxcd.io/namespace': 'flux-system',
                          'velero.io/schedule-name': 'backstage',
                          'velero.io/storage-location': 'backup-dev-de1',
                        },
                        managedFields: [
                          {
                            apiVersion: 'velero.io/v1',
                            fieldsType: 'FieldsV1',
                            fieldsV1: {
                              'f:metadata': {
                                'f:annotations': {
                                  '.': {},
                                  'f:velero.io/source-cluster-k8s-gitversion': {},
                                  'f:velero.io/source-cluster-k8s-major-version': {},
                                  'f:velero.io/source-cluster-k8s-minor-version': {},
                                },
                                'f:labels': {
                                  '.': {},
                                  'f:kustomize.toolkit.fluxcd.io/name': {},
                                  'f:kustomize.toolkit.fluxcd.io/namespace': {},
                                  'f:velero.io/schedule-name': {},
                                  'f:velero.io/storage-location': {},
                                },
                                'f:ownerReferences': {
                                  '.': {},
                                  'k:{"uid":"9f979d79-c73f-468f-9076-c1e074b43067"}': {},
                                },
                              },
                              'f:spec': {
                                '.': {},
                                'f:csiSnapshotTimeout': {},
                                'f:defaultVolumesToFsBackup': {},
                                'f:hooks': {},
                                'f:includedNamespaces': {},
                                'f:includedResources': {},
                                'f:itemOperationTimeout': {},
                                'f:metadata': {},
                                'f:snapshotVolumes': {},
                                'f:storageLocation': {},
                                'f:ttl': {},
                                'f:volumeSnapshotLocations': {},
                              },
                              'f:status': {
                                '.': {},
                                'f:completionTimestamp': {},
                                'f:csiVolumeSnapshotsAttempted': {},
                                'f:csiVolumeSnapshotsCompleted': {},
                                'f:expiration': {},
                                'f:formatVersion': {},
                                'f:phase': {},
                                'f:startTimestamp': {},
                                'f:version': {},
                              },
                            },
                            manager: 'velero-server',
                            operation: 'Update',
                            time: '2023-07-24T14:28:49Z',
                          },
                        ],
                        name: 'backstage-20230724142830',
                        namespace: 'velero',
                        ownerReferences: [
                          {
                            apiVersion: 'velero.io/v1',
                            controller: true,
                            kind: 'Schedule',
                            name: 'backstage',
                            uid: '9f979d79-c73f-468f-9076-c1e074b43067',
                          },
                        ],
                        resourceVersion: '2465950637',
                        uid: '6f43d03d-a42c-4132-b596-ec70ff01fc85',
                      },
                      spec: {
                        csiSnapshotTimeout: '10m0s',
                        defaultVolumesToFsBackup: false,
                        hooks: {},
                        includedNamespaces: ['backstage'],
                        includedResources: ['persistentvolumeclaims'],
                        itemOperationTimeout: '1h0m0s',
                        metadata: {},
                        snapshotVolumes: true,
                        storageLocation: 'backup-dev-de1',
                        ttl: '720h0m0s',
                        volumeSnapshotLocations: ['volume-dev-de1'],
                      },
                      status: {
                        completionTimestamp: '2023-07-24T14:28:49Z',
                        csiVolumeSnapshotsAttempted: 3,
                        csiVolumeSnapshotsCompleted: 3,
                        expiration: '2023-08-23T14:28:30Z',
                        formatVersion: '1.1.0',
                        phase: 'Completed',
                        startTimestamp: '2023-07-24T14:28:30Z',
                        version: 1,
                      },
                    },
                  ],
                  kind: 'BackupList',
                  metadata: {
                    continue: '',
                    resourceVersion: '2667615355',
                  },
                },
                namespace: '',
              },
            ],
          },
        ],
        dashboards: null,
        error: '',
        resource: {
          columns: null,
          description:
            'Backup is a Velero resource that represents the capture of Kubernetes cluster state at a point in time (API objects and associated volume state).',
          id: 'backups.velero.io',
          isCRD: true,
          path: '/apis/velero.io/v1',
          resource: 'backups',
          scope: 'Namespaced',
          title: 'Backup',
        },
      },
    ]);

    expect(screen.getByText('velero')).toBeInTheDocument();
    expect(screen.getByText('(hub / velero)')).toBeInTheDocument();
    expect(screen.getByText(description)).toBeInTheDocument();

    expect(await waitFor(() => screen.getByText('backstage-20230724142830'))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText('Completed'))).toBeInTheDocument();

    const backup = screen.getByText('backstage-20230724142830');
    await userEvent.click(backup);

    const logs = screen.getByText('Logs');
    await userEvent.click(logs);
    expect(await waitFor(() => screen.getByText('Test logs for the selected backup'))).toBeInTheDocument();
  });
});
