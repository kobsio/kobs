import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
} from '@patternfly/react-core';
import { ExpandableRowContent, Tbody, Td, Tr } from '@patternfly/react-table';
import React, { useState } from 'react';
import { V1Container, V1ContainerState, V1ContainerStatus, V1EnvVarSource, V1Probe } from '@kubernetes/client-node';

import { IMetricContainer } from '../../utils/interfaces';
import { formatResourceValue } from '../../utils/helpers';

const getContainerStatus = (state: V1ContainerState): string => {
  if (state.running) {
    return `Started at ${state.running.startedAt}`;
  } else if (state.waiting) {
    return state.waiting.message ? `Waiting: ${state.waiting.message}` : 'Waiting';
  } else if (state.terminated) {
    return `Terminated with ${state.terminated.exitCode} at ${state.terminated.finishedAt}: ${state.terminated.reason}`;
  }

  return 'Indeterminate';
};

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

const getProbe = (title: string, probe: V1Probe): JSX.Element => {
  return (
    <DescriptionListGroup>
      <DescriptionListTerm>{title}</DescriptionListTerm>
      <DescriptionListDescription>
        {probe.exec && (
          <div className="pf-c-chip pf-u-mr-md pf-u-mb-sm" style={{ maxWidth: '100%' }}>
            <span className="pf-c-chip__text" style={{ maxWidth: '100%' }}>
              {probe.exec.command?.join(' ')}
            </span>
          </div>
        )}
        {probe.httpGet && (
          <div className="pf-c-chip pf-u-mr-md pf-u-mb-sm" style={{ maxWidth: '100%' }}>
            <span className="pf-c-chip__text" style={{ maxWidth: '100%' }}>
              {probe.httpGet.scheme?.toLowerCase()}://
              {probe.httpGet.host}:{probe.httpGet.port}
              {probe.httpGet.path}
            </span>
          </div>
        )}
        {probe.initialDelaySeconds && (
          <div className="pf-c-chip pf-u-mr-md pf-u-mb-sm" style={{ maxWidth: '100%' }}>
            <span className="pf-c-chip__text" style={{ maxWidth: '100%' }}>
              delay={probe.initialDelaySeconds}s
            </span>
          </div>
        )}
        {probe.timeoutSeconds && (
          <div className="pf-c-chip pf-u-mr-md pf-u-mb-sm" style={{ maxWidth: '100%' }}>
            <span className="pf-c-chip__text" style={{ maxWidth: '100%' }}>
              timeout={probe.timeoutSeconds}s
            </span>
          </div>
        )}
        {probe.periodSeconds && (
          <div className="pf-c-chip pf-u-mr-md pf-u-mb-sm" style={{ maxWidth: '100%' }}>
            <span className="pf-c-chip__text" style={{ maxWidth: '100%' }}>
              period={probe.periodSeconds}s
            </span>
          </div>
        )}
        {probe.successThreshold && (
          <div className="pf-c-chip pf-u-mr-md pf-u-mb-sm" style={{ maxWidth: '100%' }}>
            <span className="pf-c-chip__text" style={{ maxWidth: '100%' }}>
              #success={probe.successThreshold}
            </span>
          </div>
        )}
        {probe.failureThreshold && (
          <div className="pf-c-chip pf-u-mr-md pf-u-mb-sm" style={{ maxWidth: '100%' }}>
            <span className="pf-c-chip__text" style={{ maxWidth: '100%' }}>
              #failure={probe.failureThreshold}
            </span>
          </div>
        )}
      </DescriptionListDescription>
    </DescriptionListGroup>
  );
};

interface IContainerProps {
  container: V1Container;
  containerStatus?: V1ContainerStatus;
  containerMetric?: IMetricContainer;
}

const Container: React.FunctionComponent<IContainerProps> = ({
  container,
  containerStatus,
  containerMetric,
}: IContainerProps) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  return (
    <Tbody isExpanded={isExpanded}>
      <Tr>
        <Td
          noPadding={true}
          style={{ padding: 0 }}
          expand={{ isExpanded: isExpanded, onToggle: (): void => setIsExpanded(!isExpanded), rowIndex: 0 }}
        />
        <Td dataLabel="Name">{container.name}</Td>
        <Td dataLabel="Ready">{containerStatus && containerStatus.ready ? 'True' : 'False'}</Td>
        <Td dataLabel="Restarts">{containerStatus ? containerStatus.restartCount : 0}</Td>
        <Td dataLabel="Status">
          {containerStatus && containerStatus.state ? getContainerStatus(containerStatus.state) : '-'}
        </Td>
        <Td dataLabel="CPU Usage">
          {containerMetric && containerMetric.usage && containerMetric.usage.cpu
            ? formatResourceValue('cpu', containerMetric.usage.cpu)
            : '-'}
        </Td>
        <Td dataLabel="CPU Requests">
          {container.resources && container.resources.requests
            ? formatResourceValue('cpu', container.resources.requests['cpu'])
            : '-'}
        </Td>
        <Td dataLabel="CPU Limits">
          {container.resources && container.resources.limits
            ? formatResourceValue('cpu', container.resources.limits['cpu'])
            : '-'}
        </Td>
        <Td dataLabel="Memory Usage">
          {containerMetric && containerMetric.usage && containerMetric.usage.memory
            ? formatResourceValue('memory', containerMetric.usage.memory)
            : '-'}
        </Td>
        <Td dataLabel="Memory Requests">
          {container.resources && container.resources.requests
            ? formatResourceValue('memory', container.resources.requests['memory'])
            : '-'}
        </Td>
        <Td dataLabel="Memory Limits">
          {container.resources && container.resources.limits
            ? formatResourceValue('memory', container.resources.limits['memory'])
            : '-'}
        </Td>
      </Tr>
      <Tr isExpanded={isExpanded}>
        <Td colSpan={11}>
          <ExpandableRowContent>
            <DescriptionList className="pf-u-text-break-word" isHorizontal={true}>
              {containerStatus && containerStatus.state && (
                <DescriptionListGroup>
                  <DescriptionListTerm>State</DescriptionListTerm>
                  <DescriptionListDescription>{getContainerStatus(containerStatus.state)}</DescriptionListDescription>
                </DescriptionListGroup>
              )}
              {containerStatus && containerStatus.lastState && (
                <DescriptionListGroup>
                  <DescriptionListTerm>Last State</DescriptionListTerm>
                  <DescriptionListDescription>
                    {getContainerStatus(containerStatus.lastState)}
                  </DescriptionListDescription>
                </DescriptionListGroup>
              )}

              <DescriptionListGroup>
                <DescriptionListTerm>Image</DescriptionListTerm>
                <DescriptionListDescription>{container.image}</DescriptionListDescription>
              </DescriptionListGroup>
              {container.command && (
                <DescriptionListGroup>
                  <DescriptionListTerm>Command</DescriptionListTerm>
                  <DescriptionListDescription>{container.command.join(' ')}</DescriptionListDescription>
                </DescriptionListGroup>
              )}
              {container.args && (
                <DescriptionListGroup>
                  <DescriptionListTerm>Command</DescriptionListTerm>
                  <DescriptionListDescription>{container.args.join(' ')}</DescriptionListDescription>
                </DescriptionListGroup>
              )}
              {container.ports && (
                <DescriptionListGroup>
                  <DescriptionListTerm>Ports</DescriptionListTerm>
                  <DescriptionListDescription>
                    {container.ports.map((port, index) => (
                      <div key={index} className="pf-c-chip pf-u-mr-md pf-u-mb-sm" style={{ maxWidth: '100%' }}>
                        <span className="pf-c-chip__text" style={{ maxWidth: '100%' }}>
                          {port.containerPort}
                          {port.protocol ? `/${port.protocol}` : ''}
                          {port.name ? ` (${port.name})` : ''}
                        </span>
                      </div>
                    ))}
                  </DescriptionListDescription>
                </DescriptionListGroup>
              )}
              {container.env && (
                <DescriptionListGroup>
                  <DescriptionListTerm>Environment</DescriptionListTerm>
                  <DescriptionListDescription>
                    {container.env.map((env, index) => (
                      <div key={index}>
                        {env.name}:
                        <span className="pf-u-pl-sm pf-u-font-size-sm pf-u-color-400">
                          {env.value ? env.value : env.valueFrom ? getValueFrom(env.valueFrom) : '-'}
                        </span>
                      </div>
                    ))}
                  </DescriptionListDescription>
                </DescriptionListGroup>
              )}
              {container.volumeMounts && (
                <DescriptionListGroup>
                  <DescriptionListTerm>Mounts</DescriptionListTerm>
                  <DescriptionListDescription>
                    {container.volumeMounts.map((mount, index) => (
                      <div key={index}>
                        {mount.name}:
                        <span className="pf-u-pl-sm pf-u-font-size-sm pf-u-color-400">{mount.mountPath}</span>
                      </div>
                    ))}
                  </DescriptionListDescription>
                </DescriptionListGroup>
              )}
              {container.livenessProbe && getProbe('Liveness Probe', container.livenessProbe)}
              {container.readinessProbe && getProbe('Readiness Probe', container.readinessProbe)}
              {container.startupProbe && getProbe('Startup Probe', container.startupProbe)}
            </DescriptionList>
          </ExpandableRowContent>
        </Td>
      </Tr>
    </Tbody>
  );
};

export default Container;
