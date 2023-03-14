import { QueryClientProvider, APIClient, APIContext } from '@kobsio/core';
import { render as _render, RenderResult, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

import HarborPanel from './HarborPanel';

describe('HarborPanel', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const render = (title: string, options: any, resolve: any): RenderResult => {
    const client = new APIClient();
    const getSpy = vi.spyOn(client, 'get');
    getSpy.mockResolvedValueOnce(resolve);

    return _render(
      <MemoryRouter>
        <QueryClientProvider>
          <APIContext.Provider value={{ client: client, getUser: () => undefined }}>
            <HarborPanel
              title={title}
              instance={{ cluster: 'hub', id: '/cluster/hub/type/harbor/name/harbor', name: 'harbor', type: 'harbor' }}
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

  it('should render error for invalid options', async () => {
    render(
      'My Panel',
      {
        type: 'invalid',
      },
      {},
    );

    expect(screen.getByText('My Panel')).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText('Invalid options for Harbor plugin'))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText('One of the required options is missing.'))).toBeInTheDocument();
  });

  it('should render projects', async () => {
    render(
      'My Projects',
      {
        type: 'projects',
      },
      {
        projects: [
          {
            chart_count: 0,
            deleted: false,
            metadata: {
              auto_scan: 'true',
              enable_content_trust: 'false',
              prevent_vul: 'false',
              public: 'false',
              retention_id: '1',
              reuse_sys_cve_allowlist: 'true',
              severity: 'high',
            },
            name: 'private',
            project_id: 35,
            registry_id: 0,
            repo_count: 154,
          },
          {
            chart_count: 0,
            deleted: false,
            metadata: {
              auto_scan: 'true',
              enable_content_trust: 'false',
              prevent_vul: 'false',
              public: 'true',
              retention_id: '',
              reuse_sys_cve_allowlist: 'false',
              severity: 'low',
            },
            name: 'public',
            project_id: 34,
            registry_id: 0,
            repo_count: 5,
          },
        ],
        total: 2,
      },
    );

    expect(screen.getByText('My Projects')).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText('private'))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText('public'))).toBeInTheDocument();
  });

  it('should render repositories', async () => {
    render(
      'My Repositories',
      {
        repositories: {
          projectName: 'private',
        },
        type: 'repositories',
      },
      {
        repositories: [
          {
            artifact_count: 1333,
            creation_time: '2019-11-04T09:51:02.633Z',
            id: 147,
            name: 'private/backend',
            project_id: 35,
            pull_count: 1585957,
            update_time: '2023-03-13T20:27:06.423Z',
          },
        ],
        total: 1,
      },
    );

    expect(screen.getByText('My Repositories')).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText('private/backend'))).toBeInTheDocument();
  });

  it('should render artifacts', async () => {
    render(
      'My Artifacts',
      {
        artifacts: {
          projectName: 'private',
          repositoryName: 'backend',
        },
        type: 'artifacts',
      },
      {
        artifacts: [
          {
            digest: 'sha256:a995c09a449863ffee933226926ca3af43662bbebc5f5dc7cc895c3f3c9a2066',
            extra_attrs: {
              architecture: 'amd64',
              author: 'https://bitnami.com/contact',
              config: {
                Cmd: null,
                Entrypoint: ['/opt/backend/bin/backend'],
                Env: [
                  'PATH=/opt/bitnami/java/bin:/opt/bitnami/common/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin',
                  'OS_ARCH=amd64',
                  'OS_FLAVOUR=debian-11',
                  'OS_NAME=linux',
                  'APP_VERSION=17.0.6-10',
                  'BITNAMI_APP_NAME=java',
                  'JAVA_HOME=/opt/bitnami/java',
                  'LANG=en_US.UTF-8',
                  'LANGUAGE=en_US:en',
                  'JAVA_OPTS=-server -XX:+ShowCodeDetailsInExceptionMessages --add-opens java.base/java.lang=ALL-UNNAMED --add-opens java.base/java.util=ALL-UNNAMED',
                  'JAVA_TOOL_OPTIONS=-XX:+UseContainerSupport',
                  'LD_PRELOAD=/usr/lib/x86_64-linux-gnu/libtcmalloc_minimal.so.4',
                ],
                ExposedPorts: {
                  '8080/tcp': {},
                },
                Labels: {
                  'org.opencontainers.image.authors': 'https://bitnami.com/contact',
                  'org.opencontainers.image.description': 'Application packaged by Bitnami',
                  'org.opencontainers.image.licenses': 'Apache-2.0',
                  'org.opencontainers.image.ref.name': '17.0.6-10-debian-11-r3',
                  'org.opencontainers.image.source': 'https://github.com/bitnami/containers/tree/main/bitnami/java',
                  'org.opencontainers.image.title': 'java',
                  'org.opencontainers.image.vendor': 'VMware, Inc.',
                  'org.opencontainers.image.version': '17.0.6-10',
                },
                User: 'nobody',
                WorkingDir: '',
              },
              created: '2023-01-31T14:23:49.284023806Z',
              os: 'linux',
            },
            icon: 'sha256:0048162a053eef4d4ce3fe7518615bef084403614f8bca43b40ae2e762e11e06',
            id: 97458,
            manifest_media_type: 'application/vnd.docker.distribution.manifest.v2+json',
            media_type: 'application/vnd.docker.container.image.v1+json',
            project_id: 35,
            pull_time: '2023-03-13T20:26:56.572Z',
            push_time: '2023-01-31T14:24:02.48Z',
            references: null,
            repository_id: 147,
            scan_overview: {
              'application/vnd.security.vulnerability.report; version=1.1': {
                complete_percent: 100,
                duration: 18,
                end_time: '2023-03-13T20:27:12Z',
                report_id: '9dfcf9f9-f378-453e-8ce7-7a09766bedaf',
                scan_status: 'Success',
                severity: 'Critical',
                start_time: '2023-03-13T20:26:54Z',
              },
            },
            size: 582814970,
            tags: [
              {
                artifact_id: 97458,
                id: 1221,
                immutable: false,
                name: 'master',
                pull_time: '2022-08-16T22:18:09.201Z',
                push_time: '2023-01-31T14:24:04.159Z',
                repository_id: 147,
                signed: false,
              },
              {
                artifact_id: 97458,
                id: 82436,
                immutable: false,
                name: 'master-087323b2',
                pull_time: '0001-01-01T00:00:00Z',
                push_time: '2023-01-31T14:24:03.076Z',
                repository_id: 147,
                signed: false,
              },
            ],
            type: 'IMAGE',
          },
        ],
        total: 1333,
      },
    );

    expect(screen.getByText('My Artifacts')).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText('master, master-087323b2'))).toBeInTheDocument();
  });
});
