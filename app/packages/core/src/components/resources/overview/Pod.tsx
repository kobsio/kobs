import {
  V1Container,
  V1ContainerState,
  V1ContainerStatus,
  V1EnvVarSource,
  V1Pod,
  V1Probe,
} from '@kubernetes/client-node';
import { KeyboardArrowDown, KeyboardArrowRight } from '@mui/icons-material';
import {
  Box,
  Chip,
  Collapse,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import yaml from 'js-yaml';
import { FunctionComponent, ReactNode, useContext, useState } from 'react';

import Conditions from './Conditions';

import { APIContext, IAPIContext } from '../../../context/APIContext';
import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListItem,
  DescriptionListTerm,
} from '../../utils/DescriptionList';
import { formatResourceValue } from '../utils';

/**
 * `IMetric` is the interface of the Pods resource usage data as it is returned from our API.
 */
interface IMetric {
  apiVersion?: string;
  containers?: IMetricContainer[];
  kind?: string;
  timestamp?: Date;
  usage?: IMetricUsage;
  window?: string;
}

interface IMetricContainer {
  name?: string;
  usage?: IMetricUsage;
}

interface IMetricUsage {
  cpu?: string;
  memory?: string;
}

/**
 * `getContainerStatus` returns the container status for the container with the provided `name` form a list of `status`.
 */
const getContainerStatus = (name: string, status?: V1ContainerStatus[]): V1ContainerStatus | undefined => {
  if (!status) {
    return undefined;
  }

  for (const s of status) {
    if (s.name === name) {
      return s;
    }
  }

  return undefined;
};

/**
 * `getContainerMetric` returns the container metrics for the container with the provided `name` from a list of
 * `metrics`.
 */
const getContainerMetric = (name: string, metrics?: IMetricContainer[]): IMetricContainer | undefined => {
  if (!metrics) {
    return undefined;
  }

  for (const metric of metrics) {
    if (metric.name === name) {
      return metric;
    }
  }

  return undefined;
};

/**
 * `getContainerState` formates the provided container state.
 */
const getContainerState = (state: V1ContainerState): string => {
  if (state.running) {
    return `Started at ${state.running.startedAt}`;
  } else if (state.waiting) {
    return state.waiting.message ? `Waiting: ${state.waiting.message}` : 'Waiting';
  } else if (state.terminated) {
    return `Terminated with ${state.terminated.exitCode} at ${state.terminated.finishedAt}: ${state.terminated.reason}`;
  }

  return 'Indeterminate';
};

/**
 * `getValueFrom` formates the `valueFrom` property for our UI.
 */
const getValueFrom = (valueFrom: V1EnvVarSource): string => {
  if (valueFrom.configMapKeyRef) {
    return `configMapKeyRef(${valueFrom.configMapKeyRef.name}: ${valueFrom.configMapKeyRef.key})`;
  }

  if (valueFrom.fieldRef) {
    return `fieldRef(${valueFrom.fieldRef.apiVersion}: ${valueFrom.fieldRef.fieldPath})`;
  }

  if (valueFrom.secretKeyRef) {
    return `secretKeyRef(${valueFrom.secretKeyRef.name}: ${valueFrom.secretKeyRef.key})`;
  }

  return '-';
};

/**
 * `getProbe` returns the formatted `probe` for our UI.
 */
const getProbe = (title: string, probe: V1Probe): ReactNode => {
  return (
    <DescriptionListGroup>
      <DescriptionListTerm>{title}</DescriptionListTerm>
      <DescriptionListDescription>
        {probe.exec && <Chip size="small" label={probe.exec.command?.join(' ')} />}
        {probe.httpGet && (
          <Chip
            size="small"
            label={`${probe.httpGet.scheme?.toLowerCase()}://${probe.httpGet.host ? probe.httpGet.host : ''}:${
              probe.httpGet.port
            }${probe.httpGet.path}`}
          />
        )}
        {probe.initialDelaySeconds && <Chip size="small" label={`delay=${probe.initialDelaySeconds}s`} />}
        {probe.timeoutSeconds && <Chip size="small" label={`timeout=${probe.timeoutSeconds}s`} />}
        {probe.periodSeconds && <Chip size="small" label={`period=${probe.periodSeconds}s`} />}
        {probe.successThreshold && <Chip size="small" label={`#success=${probe.successThreshold}`} />}
        {probe.failureThreshold && <Chip size="small" label={`#failure=${probe.failureThreshold}`} />}
      </DescriptionListDescription>
    </DescriptionListGroup>
  );
};

/**
 * `IContainerProps` is the interface for the `Container` component.
 */
interface IContainerProps {
  container: V1Container;
  containerMetric?: IMetricContainer;
  containerStatus?: V1ContainerStatus;
}

/**
 * The `Container` renders the row for a single container and the collapsible row with the details for this container.
 * The component also maintains the state, if the details row should be shown or not.
 */
const Container: FunctionComponent<IContainerProps> = ({ container, containerStatus, containerMetric }) => {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <>
      <TableRow selected={open} sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell>
          <IconButton size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowDown /> : <KeyboardArrowRight />}
          </IconButton>
        </TableCell>
        <TableCell>{container.name}</TableCell>
        <TableCell>{containerStatus && containerStatus.ready ? 'True' : 'False'}</TableCell>
        <TableCell>{containerStatus ? containerStatus.restartCount : 0}</TableCell>
        <TableCell>
          {containerStatus && containerStatus.state ? getContainerState(containerStatus.state) : '-'}
        </TableCell>
      </TableRow>

      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={5}>
          <Collapse in={open} timeout="auto" unmountOnExit={true}>
            <DescriptionList>
              {containerStatus && containerStatus.state && (
                <DescriptionListGroup>
                  <DescriptionListTerm>State</DescriptionListTerm>
                  <DescriptionListDescription>{getContainerState(containerStatus.state)}</DescriptionListDescription>
                </DescriptionListGroup>
              )}
              {containerStatus && containerStatus.lastState && (
                <DescriptionListGroup>
                  <DescriptionListTerm>Last State</DescriptionListTerm>
                  <DescriptionListDescription>
                    {getContainerState(containerStatus.lastState)}
                  </DescriptionListDescription>
                </DescriptionListGroup>
              )}

              <DescriptionListGroup>
                <DescriptionListTerm>CPU</DescriptionListTerm>
                <DescriptionListDescription direction="column">
                  <Box>
                    Usage:
                    <Typography component="span" color="text.secondary" sx={{ pl: 2 }}>
                      {containerMetric && containerMetric.usage && containerMetric.usage.cpu
                        ? formatResourceValue('cpu', containerMetric.usage.cpu)
                        : '-'}
                    </Typography>
                  </Box>
                  <Box>
                    Requests:
                    <Typography component="span" color="text.secondary" sx={{ pl: 2 }}>
                      {container.resources && container.resources.requests
                        ? formatResourceValue('cpu', container.resources.requests['cpu'])
                        : '-'}
                    </Typography>
                  </Box>
                  <Box>
                    Limits:
                    <Typography component="span" color="text.secondary" sx={{ pl: 2 }}>
                      {container.resources && container.resources.limits
                        ? formatResourceValue('cpu', container.resources.limits['cpu'])
                        : '-'}
                    </Typography>
                  </Box>
                </DescriptionListDescription>
              </DescriptionListGroup>

              <DescriptionListGroup>
                <DescriptionListTerm>Memory</DescriptionListTerm>
                <DescriptionListDescription direction="column">
                  <Box>
                    Usage:
                    <Typography component="span" color="text.secondary" sx={{ pl: 2 }}>
                      {containerMetric && containerMetric.usage && containerMetric.usage.memory
                        ? formatResourceValue('memory', containerMetric.usage.memory)
                        : '-'}
                    </Typography>
                  </Box>
                  <Box>
                    Requests:
                    <Typography component="span" color="text.secondary" sx={{ pl: 2 }}>
                      {container.resources && container.resources.requests
                        ? formatResourceValue('memory', container.resources.requests['memory'])
                        : '-'}
                    </Typography>
                  </Box>
                  <Box>
                    Limits:
                    <Typography component="span" color="text.secondary" sx={{ pl: 2 }}>
                      {container.resources && container.resources.limits
                        ? formatResourceValue('memory', container.resources.limits['memory'])
                        : '-'}
                    </Typography>
                  </Box>
                </DescriptionListDescription>
              </DescriptionListGroup>

              <DescriptionListGroup>
                <DescriptionListTerm>Image</DescriptionListTerm>
                <DescriptionListDescription>{container.image}</DescriptionListDescription>
              </DescriptionListGroup>
              {container.command && (
                <DescriptionListGroup>
                  <DescriptionListTerm>Command</DescriptionListTerm>
                  <DescriptionListDescription>
                    {container.command.map((command) => (
                      <Chip key={command} size="small" label={command} />
                    ))}
                  </DescriptionListDescription>
                </DescriptionListGroup>
              )}
              {container.args && (
                <DescriptionListGroup>
                  <DescriptionListTerm>Command</DescriptionListTerm>
                  <DescriptionListDescription>
                    {container.args.map((arg) => (
                      <Chip key={arg} size="small" label={arg} />
                    ))}
                  </DescriptionListDescription>
                </DescriptionListGroup>
              )}
              {container.ports && (
                <DescriptionListGroup>
                  <DescriptionListTerm>Ports</DescriptionListTerm>
                  <DescriptionListDescription direction="column">
                    {container.ports.map((port, index) => (
                      <Box key={index}>
                        {port.containerPort}
                        {port.protocol ? `/${port.protocol}` : ''}
                        {port.name ? ` (${port.name})` : ''}
                      </Box>
                    ))}
                  </DescriptionListDescription>
                </DescriptionListGroup>
              )}
              {container.env && (
                <DescriptionListGroup>
                  <DescriptionListTerm>Environment</DescriptionListTerm>
                  <DescriptionListDescription direction="column">
                    {container.env.map((env, index) => (
                      <Box key={index}>
                        {env.name}:
                        <Typography component="span" color="text.secondary" sx={{ pl: 2 }}>
                          {env.value ? env.value : env.valueFrom ? getValueFrom(env.valueFrom) : '-'}
                        </Typography>
                      </Box>
                    ))}
                  </DescriptionListDescription>
                </DescriptionListGroup>
              )}
              {container.volumeMounts && (
                <DescriptionListGroup>
                  <DescriptionListTerm>Mounts</DescriptionListTerm>
                  <DescriptionListDescription direction="column">
                    {container.volumeMounts.map((mount, index) => (
                      <Box key={index}>
                        {mount.name}:
                        <Typography component="span" color="text.secondary" sx={{ pl: 2 }}>
                          {mount.mountPath}
                        </Typography>
                      </Box>
                    ))}
                  </DescriptionListDescription>
                </DescriptionListGroup>
              )}
              {container.livenessProbe && getProbe('Liveness Probe', container.livenessProbe)}
              {container.readinessProbe && getProbe('Readiness Probe', container.readinessProbe)}
              {container.startupProbe && getProbe('Startup Probe', container.startupProbe)}
            </DescriptionList>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

/**
 * `IContainersProps` is the interface for the `Containers` component.
 */
interface IContainersProps {
  containerMetrics?: IMetricContainer[];
  containerStatuses?: V1ContainerStatus[];
  containers: V1Container[];
  title: string;
}

/**
 * The `Containers` component is used to render a list of containers in a table. Each row represents one container of
 * the Pod. When a user clicks on the container we display an additional row, with more details about the selected
 * container.
 */
const Containers: FunctionComponent<IContainersProps> = ({
  title,
  containers,
  containerStatuses,
  containerMetrics,
}) => {
  return (
    <DescriptionListGroup>
      <DescriptionListItem>
        <Typography variant="h4" sx={{ pt: 4 }}>
          {title}
        </Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell />
                <TableCell>Name</TableCell>
                <TableCell>Ready</TableCell>
                <TableCell>Restarts</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {containers.map((container) => (
                <Container
                  key={container.name}
                  container={container}
                  containerStatus={getContainerStatus(container.name, containerStatuses)}
                  containerMetric={getContainerMetric(container.name, containerMetrics)}
                />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </DescriptionListItem>
    </DescriptionListGroup>
  );
};

/**
 * `IPodProps` is the interface for the `Pod` component.
 */
interface IPodProps {
  cluster: string;
  name: string;
  namespace: string;
  pod: V1Pod;
}

/**
 * The `Pod` component is used to show some additional details for Pods in the overview section of the resource details.
 * This also includes the containers of the Pod and the resource usage of these containers. For that we have to make an
 * API call against the Kubernetes API to get the actual resource usage of the containers.
 */
const Pod: FunctionComponent<IPodProps> = ({ cluster, namespace, name, pod }: IPodProps) => {
  const apiContext = useContext<IAPIContext>(APIContext);

  const phase = pod.status && pod.status.phase ? pod.status.phase : 'Unknown';
  let reason = pod.status && pod.status.reason ? pod.status.reason : '';
  let shouldReady = 0;
  let isReady = 0;
  let restarts = 0;

  if (pod.status && pod.status.containerStatuses) {
    for (const container of pod.status.containerStatuses) {
      shouldReady = shouldReady + 1;
      if (container.ready) {
        isReady = isReady + 1;
      }

      restarts = restarts + container.restartCount;

      if (container.state && container.state.waiting) {
        reason = container.state.waiting.reason ? container.state.waiting.reason : '';
        break;
      }

      if (container.state && container.state.terminated) {
        reason = container.state.terminated.reason ? container.state.terminated.reason : '';
        break;
      }
    }
  }

  const { isError, data } = useQuery<IMetricContainer[], Error>(
    ['core/resources/pod/metrics', cluster, namespace, name],
    async () => {
      const metric = await apiContext.client.get<IMetric>(
        `/api/resources?namespace=${namespace}&name=${name}&resource=pods&path=/apis/metrics.k8s.io/v1beta1`,
        {
          headers: {
            'x-kobs-cluster': cluster,
          },
        },
      );

      if (metric && metric.containers && metric.containers.length > 0) {
        return metric.containers;
      }

      throw new Error('Failed to get Pod metrics');
    },
  );

  return (
    <>
      <DescriptionListGroup>
        <DescriptionListTerm>Ready</DescriptionListTerm>
        <DescriptionListDescription>
          <Box>
            {isReady}/{shouldReady}
          </Box>
        </DescriptionListDescription>
      </DescriptionListGroup>
      <DescriptionListGroup>
        <DescriptionListTerm>Restarts</DescriptionListTerm>
        <DescriptionListDescription>{restarts}</DescriptionListDescription>
      </DescriptionListGroup>
      <DescriptionListGroup>
        <DescriptionListTerm>Status</DescriptionListTerm>
        <DescriptionListDescription>{reason ? reason : phase}</DescriptionListDescription>
      </DescriptionListGroup>
      <DescriptionListGroup>
        <DescriptionListTerm>Priority Class</DescriptionListTerm>
        <DescriptionListDescription>
          {pod.spec && pod.spec.priorityClassName ? pod.spec.priorityClassName : '-'}
        </DescriptionListDescription>
      </DescriptionListGroup>
      <DescriptionListGroup>
        <DescriptionListTerm>QoS Class</DescriptionListTerm>
        <DescriptionListDescription>
          {pod.status && pod.status.qosClass ? pod.status.qosClass : '-'}
        </DescriptionListDescription>
      </DescriptionListGroup>
      <DescriptionListGroup>
        <DescriptionListTerm>Node</DescriptionListTerm>
        <DescriptionListDescription>{pod.spec?.nodeName ? pod.spec.nodeName : '-'}</DescriptionListDescription>
      </DescriptionListGroup>
      <DescriptionListGroup>
        <DescriptionListTerm>Tolerations</DescriptionListTerm>
        <DescriptionListDescription>
          {pod.spec && pod.spec.tolerations ? (
            <Tooltip
              title={
                <div>
                  {pod.spec.tolerations.map((toleration, index) => (
                    <div key={index}>{yaml.dump(toleration)}</div>
                  ))}
                </div>
              }
            >
              <span>{pod.spec.tolerations.length}</span>
            </Tooltip>
          ) : (
            0
          )}
        </DescriptionListDescription>
      </DescriptionListGroup>
      <DescriptionListGroup>
        <DescriptionListTerm>Affinities</DescriptionListTerm>
        <DescriptionListDescription>
          {pod.spec && pod.spec.affinity ? (
            <Tooltip
              title={
                <div>
                  <div>{yaml.dump(pod.spec.affinity)}</div>
                </div>
              }
            >
              <span>Yes</span>
            </Tooltip>
          ) : (
            'No'
          )}
        </DescriptionListDescription>
      </DescriptionListGroup>

      {pod.status?.conditions && <Conditions conditions={pod.status.conditions} />}

      {pod.spec?.initContainers && (
        <Containers
          title="Init Containers"
          containers={pod.spec?.initContainers}
          containerStatuses={pod.status?.initContainerStatuses}
          containerMetrics={undefined}
        />
      )}
      {pod.spec?.containers && (
        <Containers
          title="Containers"
          containers={pod.spec?.containers}
          containerStatuses={pod.status?.containerStatuses}
          containerMetrics={isError ? undefined : data}
        />
      )}
      {pod.spec?.ephemeralContainers && (
        <Containers
          title="Ephemeral Containers"
          containers={pod.spec?.ephemeralContainers}
          containerStatuses={pod.status?.ephemeralContainerStatuses}
          containerMetrics={isError ? undefined : data}
        />
      )}
    </>
  );
};

export default Pod;
