import { QueryClientProvider, APIClient, APIContext } from '@kobsio/core';
import { render as _render, RenderResult, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

import Artifacts from './Artifacts';

describe('Artifacts', () => {
  const render = (): RenderResult => {
    const client = new APIClient();
    const getSpy = vi.spyOn(client, 'get');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getSpy.mockImplementation(async (path: string, _): Promise<any> => {
      if (path.startsWith('/api/plugins/harbor/artifacts')) {
        return {
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
        };
      }

      if (path.startsWith('/api/plugins/harbor/buildhistory')) {
        return [
          {
            created: '2023-01-31T14:23:49.284023806Z',
            created_by: 'USER nobody',
            empty_layer: true,
          },
          {
            created: '2023-01-31T14:23:49.284023806Z',
            created_by: 'ENTRYPOINT ["/opt/backend/bin/backend"]',
            empty_layer: true,
          },
        ];
      }

      if (path.startsWith('/api/plugins/harbor/vulnerabilities')) {
        return {
          'application/vnd.security.vulnerability.report; version=1.1': {
            generated_at: '2023-03-13T20:27:08.727203715Z',
            scanner: {
              name: 'Trivy',
              vendor: 'Aqua Security',
              version: 'v0.29.2',
            },
            severity: 'Critical',
            vulnerabilities: [
              {
                artifact_digests: ['sha256:a995c09a449863ffee933226926ca3af43662bbebc5f5dc7cc895c3f3c9a2066'],
                description:
                  'It was found that apt-key in apt, all versions, do not correctly validate gpg keys with the master keyring, leading to a potential man-in-the-middle attack.',
                fix_version: '',
                id: 'CVE-2011-3374',
                links: ['https://avd.aquasec.com/nvd/cve-2011-3374'],
                package: 'apt',
                severity: 'Low',
                version: '2.2.4',
              },
              {
                artifact_digests: ['sha256:a995c09a449863ffee933226926ca3af43662bbebc5f5dc7cc895c3f3c9a2066'],
                description:
                  'Connect2id Nimbus JOSE+JWT before v7.9 can throw various uncaught exceptions while parsing a JWT, which could result in an application crash (potential information disclosure) or a potential authentication bypass.',
                fix_version: '7.9',
                id: 'CVE-2019-17195',
                links: ['https://avd.aquasec.com/nvd/cve-2019-17195'],
                package: 'com.nimbusds:nimbus-jose-jwt',
                severity: 'Critical',
                version: '5.4',
              },
              {
                artifact_digests: ['sha256:a995c09a449863ffee933226926ca3af43662bbebc5f5dc7cc895c3f3c9a2066'],
                description:
                  'All versions of Apache Santuario - XML Security for Java prior to 2.2.3 and 2.1.7 are vulnerable to an issue where the "secureValidation" property is not passed correctly when creating a KeyInfo from a KeyInfoReference element. This allows an attacker to abuse an XPath Transform to extract any local .xml files in a RetrievalMethod element.',
                fix_version: '2.1.7, 2.2.3',
                id: 'CVE-2021-40690',
                links: ['https://avd.aquasec.com/nvd/cve-2021-40690'],
                package: 'org.apache.santuario:xmlsec',
                severity: 'High',
                version: '2.0.10',
              },
              {
                artifact_digests: ['sha256:a995c09a449863ffee933226926ca3af43662bbebc5f5dc7cc895c3f3c9a2066'],
                description:
                  'In version 2.0.3 Apache Santuario XML Security for Java, a caching mechanism was introduced to speed up creating new XML documents using a static pool of DocumentBuilders. However, if some untrusted code can register a malicious implementation with the thread context class loader first, then this implementation might be cached and re-used by Apache Santuario - XML Security for Java, leading to potential security flaws when validating signed documents, etc. The vulnerability affects Apache Santuario - XML Security for Java 2.0.x releases from 2.0.3 and all 2.1.x releases before 2.1.4.',
                fix_version: '2.1.4',
                id: 'CVE-2019-12400',
                links: ['https://avd.aquasec.com/nvd/cve-2019-12400'],
                package: 'org.apache.santuario:xmlsec',
                severity: 'Medium',
                version: '2.0.10',
              },
            ],
          },
        };
      }

      return [];
    });

    return _render(
      <MemoryRouter>
        <QueryClientProvider>
          <APIContext.Provider value={{ client: client, getUser: () => undefined }}>
            <Artifacts
              instance={{ cluster: 'hub', id: '/cluster/hub/type/harbor/name/harbor', name: 'harbor', type: 'harbor' }}
              projectName="private"
              repositoryName="backend"
              query=""
            />
          </APIContext.Provider>
        </QueryClientProvider>
      </MemoryRouter>,
    );
  };

  it('should render details', async () => {
    render();

    expect(await waitFor(() => screen.getByText('master, master-087323b2'))).toBeInTheDocument();

    await userEvent.click(screen.getByText('master, master-087323b2'));
    expect(await waitFor(() => screen.getByText('private/backend'))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText('Entrypoint'))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText('/opt/backend/bin/backend'))).toBeInTheDocument();

    await userEvent.click(screen.getByText('Build History'));
    expect(await waitFor(() => screen.getByText('USER nobody'))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText('ENTRYPOINT ["/opt/backend/bin/backend"]'))).toBeInTheDocument();

    await userEvent.click(screen.getByText('Vulnerabilities'));
    expect(await waitFor(() => screen.getByText('CVE-2011-3374'))).toBeInTheDocument();
  });
});
