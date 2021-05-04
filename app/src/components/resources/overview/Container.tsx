import { DescriptionListDescription, DescriptionListGroup, DescriptionListTerm, Title } from '@patternfly/react-core';
import { V1Container, V1ContainerState, V1ContainerStatus, V1EnvVarSource, V1Probe } from '@kubernetes/client-node';
import React from 'react';

const getContainerStatus = (state: V1ContainerState): string => {
  if (state.running) {
    return `Started at ${state.running.startedAt}`;
  } else if (state.waiting) {
    return `Waiting: ${state.waiting.message}`;
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

const getPrope = (title: string, probe: V1Probe): JSX.Element => {
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
}

const Container: React.FunctionComponent<IContainerProps> = ({ container, containerStatus }: IContainerProps) => {
  return (
    <React.Fragment>
      <Title headingLevel="h4" size="lg">
        {container.name}
      </Title>
      <DescriptionListGroup>
        <DescriptionListTerm>Status</DescriptionListTerm>
        <DescriptionListDescription>
          {containerStatus && containerStatus.state ? getContainerStatus(containerStatus.state) : '-'}
        </DescriptionListDescription>
      </DescriptionListGroup>
      <DescriptionListGroup>
        <DescriptionListTerm>Ready</DescriptionListTerm>
        <DescriptionListDescription>
          {containerStatus && containerStatus.ready ? 'True' : 'False'}
        </DescriptionListDescription>
      </DescriptionListGroup>
      <DescriptionListGroup>
        <DescriptionListTerm>Image</DescriptionListTerm>
        <DescriptionListDescription>{container.image}</DescriptionListDescription>
      </DescriptionListGroup>
      {container.command && (
        <DescriptionListGroup>
          <DescriptionListTerm>Command</DescriptionListTerm>
          <DescriptionListDescription>{container.command}</DescriptionListDescription>
        </DescriptionListGroup>
      )}
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
                {mount.name}:<span className="pf-u-pl-sm pf-u-font-size-sm pf-u-color-400">{mount.mountPath}</span>
              </div>
            ))}
          </DescriptionListDescription>
        </DescriptionListGroup>
      )}
      {container.livenessProbe && getPrope('Liveness Probe', container.livenessProbe)}
      {container.readinessProbe && getPrope('Readiness Probe', container.readinessProbe)}
      {container.startupProbe && getPrope('Startup Probe', container.startupProbe)}
    </React.Fragment>
  );
};

export default Container;
