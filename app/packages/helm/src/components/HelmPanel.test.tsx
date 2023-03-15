/* eslint-disable sort-keys */
import { QueryClientProvider, APIClient, APIContext } from '@kobsio/core';
import { render as _render, RenderResult, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

import HelmPanel from './HelmPanel';

import { IRelease } from '../utils/utils';

vi.mock('./Editor', () => {
  return {
    default: () => {
      return <>mock editor</>;
    },
  };
});

describe('HelmPanel', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const render = (options: any, releases: IRelease[], history: IRelease[]): RenderResult => {
    const client = new APIClient();
    const getSpy = vi.spyOn(client, 'get');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getSpy.mockImplementation(async (path: string, _): Promise<any> => {
      if (path.startsWith('/api/plugins/helm/releases')) {
        return releases;
      }

      if (path.startsWith('/api/plugins/helm/release/history')) {
        return history;
      }

      return [];
    });

    return _render(
      <MemoryRouter>
        <QueryClientProvider>
          <APIContext.Provider value={{ client: client, getUser: () => undefined }}>
            <HelmPanel
              title="Test"
              instance={{ cluster: 'hub', id: '/cluster/hub/type/helm/name/helm', name: 'helm', type: 'helm' }}
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
    render(undefined, [], []);
    expect(await waitFor(() => screen.getByText('Invalid options for Helm plugin'))).toBeInTheDocument();
  });

  it('should render list of helm releases', async () => {
    render(
      { clusters: ['cluster1'], type: 'releases' },
      [
        {
          cluster: 'cluster1',
          name: 'prometheus-elasticsearch-exporter-default',
          info: {
            first_deployed: '2021-12-15T11:55:58.975945875Z',
            last_deployed: '2023-03-06T13:50:34.44567739Z',
            description: 'Upgrade complete',
            status: 'deployed',
            notes:
              '1. Get the application URL by running these commands:\n  export POD_NAME=$(kubectl get pods --namespace default -l "app=prometheus-elasticsearch-exporter-default" -o jsonpath="{.items[0].metadata.name}")\n  echo "Visit http://127.0.0.1:9108/metrics to use your application"\n  kubectl port-forward $POD_NAME 9108:9108 --namespace default\n',
          },
          chart: {
            metadata: {
              name: 'prometheus-elasticsearch-exporter',
              home: 'https://github.com/prometheus-community/elasticsearch_exporter',
              sources: [
                'https://github.com/prometheus-community/helm-charts/tree/main/charts/prometheus-elasticsearch-exporter',
              ],
              version: '5.0.0',
              description: 'Elasticsearch stats exporter for Prometheus',
              keywords: ['metrics', 'elasticsearch', 'monitoring'],
              maintainers: [
                {
                  name: 'svenmueller',
                  email: 'sven.mueller@commercetools.com',
                },
                {
                  name: 'desaintmartin',
                  email: 'cedric@desaintmartin.fr',
                },
              ],
              apiVersion: 'v1',
              appVersion: '1.5.0',
              kubeVersion: '\u003e=1.10.0-0',
            },
            lock: null,
            templates: [
              {
                name: 'templates/NOTES.txt',
                data: '',
              },
              {
                name: 'templates/_helpers.tpl',
                data: '',
              },
              {
                name: 'templates/cert-secret.yaml',
                data: '',
              },
              {
                name: 'templates/deployment.yaml',
                data: '',
              },
              {
                name: 'templates/podsecuritypolicies.yaml',
                data: '=',
              },
              {
                name: 'templates/prometheusrule.yaml',
                data: '',
              },
              {
                name: 'templates/role.yaml',
                data: '',
              },
              {
                name: 'templates/rolebinding.yaml',
                data: '',
              },
              {
                name: 'templates/service.yaml',
                data: '',
              },
              {
                name: 'templates/serviceaccount.yaml',
                data: '',
              },
              {
                name: 'templates/servicemonitor.yaml',
                data: '',
              },
            ],
            values: {
              affinity: {},
              deployment: {
                annotations: {},
                labels: {},
              },
              dnsConfig: {},
              env: {},
              envFromSecret: '',
              es: {
                all: true,
                cluster_settings: false,
                indices: true,
                indices_mappings: true,
                indices_settings: true,
                shards: true,
                snapshots: true,
                ssl: {
                  ca: {
                    path: '/ssl/ca.pem',
                  },
                  client: {
                    enabled: true,
                    keyPath: '/ssl/client.key',
                    pemPath: '/ssl/client.pem',
                  },
                  enabled: false,
                  useExistingSecrets: false,
                },
                sslSkipVerify: false,
                timeout: '30s',
                uri: 'http://localhost:9200',
              },
              extraArgs: [],
              extraEnvSecrets: {},
              extraVolumeMounts: [],
              extraVolumes: [],
              global: {
                imagePullSecrets: [],
              },
              image: {
                pullPolicy: 'IfNotPresent',
                pullSecret: '',
                repository: 'quay.io/prometheuscommunity/elasticsearch-exporter',
                tag: 'v1.5.0',
              },
              log: {
                format: 'logfmt',
                level: 'info',
              },
              nodeSelector: {},
              podAnnotations: {},
              podLabels: {},
              podSecurityContext: {
                runAsNonRoot: true,
                runAsUser: 1000,
                seccompProfile: {
                  type: 'RuntimeDefault',
                },
              },
              podSecurityPolicies: {
                enabled: false,
              },
              priorityClassName: '',
              prometheusRule: {
                enabled: false,
                labels: {},
                rules: [],
              },
              replicaCount: 1,
              resources: {},
              restartPolicy: 'Always',
              secretMounts: [],
              securityContext: {
                allowPrivilegeEscalation: false,
                capabilities: {
                  drop: ['ALL'],
                },
                readOnlyRootFilesystem: true,
              },
              service: {
                annotations: {},
                httpPort: 9108,
                labels: {},
                metricsPort: {
                  name: 'http',
                },
                type: 'ClusterIP',
              },
              serviceAccount: {
                annotations: {},
                automountServiceAccountToken: true,
                create: false,
                name: 'default',
              },
              serviceMonitor: {
                enabled: false,
                interval: '10s',
                jobLabel: '',
                labels: {},
                metricRelabelings: [],
                relabelings: [],
                sampleLimit: 0,
                scheme: 'http',
                scrapeTimeout: '10s',
                targetLabels: [],
              },
              tolerations: [],
              web: {
                path: '/metrics',
              },
            },
            schema: null,
            files: [
              {
                name: '.helmignore',
                data: '',
              },
              {
                name: 'README.md',
                data: '',
              },
              {
                name: 'ci/default-values.yaml',
                data: '',
              },
              {
                name: 'ci/pod-security-policies.yaml',
                data: '',
              },
              {
                name: 'ci/security-context.yaml',
                data: '',
              },
            ],
          },
          config: {
            es: {
              uri: 'http://elasticsearch-es-http.default.svc.cluster.local:9200',
            },
            log: {
              format: 'json',
              level: 'warn',
            },
            podSecurityContext: {
              runAsNonRoot: true,
              runAsUser: 1000,
              seccompProfile: {
                type: 'RuntimeDefault',
              },
            },
            resources: {
              limits: {
                memory: '96Mi',
              },
              requests: {
                cpu: '100m',
                memory: '96Mi',
              },
            },
            secretMounts: [
              {
                name: 'elastic-certs',
                path: '/etc/ssl/certs',
                secretName: 'elasticsearch-es-http-certs-internal',
              },
            ],
            securityContext: {
              allowPrivilegeEscalation: false,
              capabilities: {
                drop: ['ALL'],
              },
              privileged: false,
              readOnlyRootFilesystem: true,
            },
            serviceMonitor: {
              enabled: false,
            },
          },
          manifest:
            'apiVersion: v1\nkind: Service\nmetadata:\n  labels:\n    app: prometheus-elasticsearch-exporter\n    chart: prometheus-elasticsearch-exporter-5.0.0\n    helm.toolkit.fluxcd.io/name: prometheus-elasticsearch-exporter\n    helm.toolkit.fluxcd.io/namespace: default\n    heritage: Helm\n    release: prometheus-elasticsearch-exporter-default\n  name: prometheus-elasticsearch-exporter-default\nspec:\n  ports:\n  - name: http\n    port: 9108\n    protocol: TCP\n  selector:\n    app: prometheus-elasticsearch-exporter\n    release: prometheus-elasticsearch-exporter-default\n  type: ClusterIP\n---\napiVersion: apps/v1\nkind: Deployment\nmetadata:\n  labels:\n    app: prometheus-elasticsearch-exporter\n    chart: prometheus-elasticsearch-exporter-5.0.0\n    helm.toolkit.fluxcd.io/name: prometheus-elasticsearch-exporter\n    helm.toolkit.fluxcd.io/namespace: default\n    heritage: Helm\n    release: prometheus-elasticsearch-exporter-default\n  name: prometheus-elasticsearch-exporter-default\nspec:\n  replicas: 1\n  selector:\n    matchLabels:\n      app: prometheus-elasticsearch-exporter\n      release: prometheus-elasticsearch-exporter-default\n  strategy:\n    rollingUpdate:\n      maxSurge: 1\n      maxUnavailable: 0\n    type: RollingUpdate\n  template:\n    metadata:\n      labels:\n        app: prometheus-elasticsearch-exporter\n        release: prometheus-elasticsearch-exporter-default\n    spec:\n      containers:\n      - command:\n        - elasticsearch_exporter\n        - --log.format=json\n        - --log.level=warn\n        - --es.uri=http://elasticsearch-es-http.default.svc.cluster.local:9200\n        - --es.all\n        - --es.indices\n        - --es.indices_settings\n        - --es.indices_mappings\n        - --es.shards\n        - --es.snapshots\n        - --es.timeout=30s\n        - --web.listen-address=:9108\n        - --web.telemetry-path=/metrics\n        env: null\n        image: quay.io/prometheuscommunity/elasticsearch-exporter:v1.5.0\n        imagePullPolicy: IfNotPresent\n        lifecycle:\n          preStop:\n            exec:\n              command:\n              - /bin/ash\n              - -c\n              - sleep 20\n        livenessProbe:\n          httpGet:\n            path: /healthz\n            port: http\n          initialDelaySeconds: 5\n          periodSeconds: 5\n          timeoutSeconds: 5\n        name: exporter\n        ports:\n        - containerPort: 9108\n          name: http\n        readinessProbe:\n          httpGet:\n            path: /healthz\n            port: http\n          initialDelaySeconds: 1\n          periodSeconds: 5\n          timeoutSeconds: 5\n        resources:\n          limits:\n            memory: 96Mi\n          requests:\n            cpu: 100m\n            memory: 96Mi\n        securityContext:\n          allowPrivilegeEscalation: false\n          capabilities:\n            drop:\n            - ALL\n          privileged: false\n          readOnlyRootFilesystem: true\n        volumeMounts:\n        - mountPath: /etc/ssl/certs\n          name: elastic-certs\n      restartPolicy: Always\n      securityContext:\n        runAsNonRoot: true\n        runAsUser: 1000\n        seccompProfile:\n          type: RuntimeDefault\n      serviceAccountName: default\n      volumes:\n      - name: elastic-certs\n        secret:\n          secretName: elasticsearch-es-http-certs-internal\n',
          version: 10,
          namespace: 'default',
        },
      ],
      [],
    );

    expect(await waitFor(() => screen.getByText('prometheus-elasticsearch-exporter-default'))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText('default'))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText('cluster1'))).toBeInTheDocument();

    await userEvent.click(screen.getByText(/prometheus-elasticsearch-exporter-default/));
    expect(await waitFor(() => screen.getByText('Details'))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText('Values'))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText('History'))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText('Templates'))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText('Upgrade complete'))).toBeInTheDocument();
  });

  it('should render history of helm release', async () => {
    render(
      {
        clusters: ['cluster1'],
        namespaces: ['default'],
        name: 'prometheus-elasticsearch-exporter-default',
        type: 'releasehistory',
      },
      [],
      [
        {
          cluster: 'cluster1',
          name: 'prometheus-elasticsearch-exporter-default',
          info: {
            first_deployed: '2021-12-15T11:55:58.975945875Z',
            last_deployed: '2021-12-15T11:55:58.975945875Z',
            description: 'Install complete',
            status: 'superseded',
            notes:
              '1. Get the application URL by running these commands:\n  export POD_NAME=$(kubectl get pods --namespace default -l "app=prometheus-elasticsearch-exporter-default" -o jsonpath="{.items[0].metadata.name}")\n  echo "Visit http://127.0.0.1:9108/metrics to use your application"\n  kubectl port-forward $POD_NAME 9108:9108 --namespace default\n',
          },
          chart: {
            metadata: {
              name: 'prometheus-elasticsearch-exporter',
              home: 'https://github.com/justwatchcom/elasticsearch_exporter',
              sources: [
                'https://github.com/prometheus-community/helm-charts/tree/main/charts/prometheus-elasticsearch-exporter',
              ],
              version: '4.4.0',
              description: 'Elasticsearch stats exporter for Prometheus',
              keywords: ['metrics', 'elasticsearch', 'monitoring'],
              maintainers: [
                {
                  name: 'svenmueller',
                  email: 'sven.mueller@commercetools.com',
                },
                {
                  name: 'caarlos0',
                  email: 'carlos@carlosbecker.com',
                },
                {
                  name: 'desaintmartin',
                  email: 'cedric@desaintmartin.fr',
                },
              ],
              apiVersion: 'v1',
              appVersion: '1.1.0',
              kubeVersion: '\u003e=1.10.0-0',
            },
            lock: null,
            templates: [
              {
                name: 'templates/NOTES.txt',
                data: '',
              },
              {
                name: 'templates/_helpers.tpl',
                data: '',
              },
              {
                name: 'templates/cert-secret.yaml',
                data: '',
              },
              {
                name: 'templates/deployment.yaml',
                data: '',
              },
              {
                name: 'templates/podsecuritypolicies.yaml',
                data: '',
              },
              {
                name: 'templates/prometheusrule.yaml',
                data: '',
              },
              {
                name: 'templates/role.yaml',
                data: '',
              },
              {
                name: 'templates/rolebinding.yaml',
                data: '',
              },
              {
                name: 'templates/service.yaml',
                data: '',
              },
              {
                name: 'templates/serviceaccount.yaml',
                data: '',
              },
              {
                name: 'templates/servicemonitor.yaml',
                data: '',
              },
            ],
            values: {
              affinity: {},
              dnsConfig: {},
              env: {},
              envFromSecret: '',
              es: {
                all: true,
                cluster_settings: false,
                indices: true,
                indices_settings: true,
                shards: true,
                snapshots: true,
                ssl: {
                  ca: {
                    path: '/ssl/ca.pem',
                  },
                  client: {
                    enabled: true,
                    keyPath: '/ssl/client.key',
                    pemPath: '/ssl/client.pem',
                  },
                  enabled: false,
                  useExistingSecrets: false,
                },
                sslSkipVerify: false,
                timeout: '30s',
                uri: 'http://localhost:9200',
              },
              extraEnvSecrets: {},
              extraVolumeMounts: [],
              extraVolumes: [],
              image: {
                pullPolicy: 'IfNotPresent',
                pullSecret: '',
                repository: 'justwatch/elasticsearch_exporter',
                tag: '1.1.0',
              },
              log: {
                format: 'logfmt',
                level: 'info',
              },
              nodeSelector: {},
              podAnnotations: {},
              podLabels: {},
              podSecurityPolicies: {
                enabled: false,
              },
              priorityClassName: '',
              prometheusRule: {
                enabled: false,
                labels: {},
                rules: [],
              },
              replicaCount: 1,
              resources: {},
              restartPolicy: 'Always',
              secretMounts: [],
              securityContext: {
                enabled: true,
                runAsUser: 1000,
              },
              service: {
                annotations: {},
                httpPort: 9108,
                labels: {},
                metricsPort: {
                  name: 'http',
                },
                type: 'ClusterIP',
              },
              serviceAccount: {
                automountServiceAccountToken: true,
                create: false,
                name: 'default',
              },
              serviceMonitor: {
                enabled: false,
                interval: '10s',
                labels: {},
                metricRelabelings: [],
                relabelings: [],
                sampleLimit: 0,
                scheme: 'http',
                scrapeTimeout: '10s',
                targetLabels: [],
              },
              tolerations: [],
              web: {
                path: '/metrics',
              },
            },
            schema: null,
            files: [
              {
                name: '.helmignore',
                data: '',
              },
              {
                name: 'README.md',
                data: '',
              },
              {
                name: 'ci/default-values.yaml',
                data: '',
              },
              {
                name: 'ci/security-context.yaml',
                data: '',
              },
            ],
          },
          config: {
            es: {
              uri: 'http://elasticsearch-es-http.default.svc.cluster.local:9200',
            },
            image: {
              pullPolicy: 'IfNotPresent',
              pullSecret: 'dockerhub-registry',
              repository: 'quay.io/prometheuscommunity/elasticsearch-exporter',
              tag: 'v1.2.1',
            },
            log: {
              format: 'json',
              level: 'warn',
            },
            resources: {
              limits: {
                cpu: '100m',
                memory: '128Mi',
              },
              requests: {
                cpu: '100m',
                memory: '128Mi',
              },
            },
            secretMounts: [
              {
                name: 'elastic-certs',
                path: '/etc/ssl/certs',
                secretName: 'elasticsearch-es-http-certs-internal',
              },
            ],
            serviceMonitor: {
              enabled: false,
            },
          },
          manifest:
            'apiVersion: v1\nkind: Service\nmetadata:\n  labels:\n    app: prometheus-elasticsearch-exporter\n    chart: prometheus-elasticsearch-exporter-4.4.0\n    helm.toolkit.fluxcd.io/name: prometheus-elasticsearch-exporter\n    helm.toolkit.fluxcd.io/namespace: default\n    heritage: Helm\n    release: prometheus-elasticsearch-exporter-default\n  name: prometheus-elasticsearch-exporter-default\nspec:\n  ports:\n  - name: http\n    port: 9108\n    protocol: TCP\n  selector:\n    app: prometheus-elasticsearch-exporter\n    release: prometheus-elasticsearch-exporter-default\n  type: ClusterIP\n---\napiVersion: apps/v1\nkind: Deployment\nmetadata:\n  labels:\n    app: prometheus-elasticsearch-exporter\n    chart: prometheus-elasticsearch-exporter-4.4.0\n    helm.toolkit.fluxcd.io/name: prometheus-elasticsearch-exporter\n    helm.toolkit.fluxcd.io/namespace: default\n    heritage: Helm\n    release: prometheus-elasticsearch-exporter-default\n  name: prometheus-elasticsearch-exporter-default\nspec:\n  replicas: 1\n  selector:\n    matchLabels:\n      app: prometheus-elasticsearch-exporter\n      release: prometheus-elasticsearch-exporter-default\n  strategy:\n    rollingUpdate:\n      maxSurge: 1\n      maxUnavailable: 0\n    type: RollingUpdate\n  template:\n    metadata:\n      labels:\n        app: prometheus-elasticsearch-exporter\n        release: prometheus-elasticsearch-exporter-default\n    spec:\n      containers:\n      - command:\n        - elasticsearch_exporter\n        - --log.format=json\n        - --log.level=warn\n        - --es.uri=http://elasticsearch-es-http.default.svc.cluster.local:9200\n        - --es.all\n        - --es.indices\n        - --es.indices_settings\n        - --es.shards\n        - --es.snapshots\n        - --es.timeout=30s\n        - --web.listen-address=:9108\n        - --web.telemetry-path=/metrics\n        env: null\n        image: quay.io/prometheuscommunity/elasticsearch-exporter:v1.2.1\n        imagePullPolicy: IfNotPresent\n        lifecycle:\n          preStop:\n            exec:\n              command:\n              - /bin/bash\n              - -c\n              - sleep 20\n        livenessProbe:\n          httpGet:\n            path: /healthz\n            port: http\n          initialDelaySeconds: 5\n          periodSeconds: 5\n          timeoutSeconds: 5\n        name: exporter\n        ports:\n        - containerPort: 9108\n          name: http\n        readinessProbe:\n          httpGet:\n            path: /healthz\n            port: http\n          initialDelaySeconds: 1\n          periodSeconds: 5\n          timeoutSeconds: 5\n        resources:\n          limits:\n            cpu: 100m\n            memory: 128Mi\n          requests:\n            cpu: 100m\n            memory: 128Mi\n        securityContext:\n          capabilities:\n            drop:\n            - SETPCAP\n            - MKNOD\n            - AUDIT_WRITE\n            - CHOWN\n            - NET_RAW\n            - DAC_OVERRIDE\n            - FOWNER\n            - FSETID\n            - KILL\n            - SETGID\n            - SETUID\n            - NET_BIND_SERVICE\n            - SYS_CHROOT\n            - SETFCAP\n          readOnlyRootFilesystem: true\n        volumeMounts:\n        - mountPath: /etc/ssl/certs\n          name: elastic-certs\n      imagePullSecrets:\n      - name: dockerhub-registry\n      restartPolicy: Always\n      securityContext:\n        runAsNonRoot: true\n        runAsUser: 1000\n      serviceAccountName: default\n      volumes:\n      - name: elastic-certs\n        secret:\n          secretName: elasticsearch-es-http-certs-internal\n',
          version: 1,
          namespace: 'default',
        },
      ],
    );

    expect(await waitFor(() => screen.getByText('superseded'))).toBeInTheDocument();
  });
});
