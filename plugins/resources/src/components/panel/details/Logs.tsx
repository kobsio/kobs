import { Card, CardBody } from '@patternfly/react-core';
import React, { useEffect, useRef, useState } from 'react';
import { LogViewer } from '@patternfly/react-log-viewer';
import { V1Pod } from '@kubernetes/client-node';
import { useQuery } from 'react-query';

import LogsToolbar, { IOptions } from './LogsToolbar';

// getContainers returns a list with all container names for the given Pod. It contains all specified init containers
// and the "normal" containers.
const getContainers = (pod: V1Pod): string[] => {
  const containers: string[] = [];

  if (pod.spec?.initContainers) {
    for (const container of pod.spec?.initContainers) {
      containers.push(container.name);
    }
  }

  if (pod.spec?.containers) {
    for (const container of pod.spec?.containers) {
      containers.push(container.name);
    }
  }

  return containers;
};

interface ILogsProps {
  cluster: string;
  namespace: string;
  name: string;
  pod: V1Pod;
}

// Logs is the component, which is used in the logs tab of an Pod. It allows a user to retrieve the logs for an
// Pod from the Kubernetes API.
const Logs: React.FunctionComponent<ILogsProps> = ({ cluster, namespace, name, pod }: ILogsProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);

  const containers = getContainers(pod);

  // Initialize the states for the component. We do not set an inital container, to avoid the first request against the
  // Kubernetes API to retrieve the logs. The user should select is options first and then trigger the API call via the
  // search button.
  const [options, setOptions] = useState<IOptions>({
    container: '',
    containers: containers,
    previous: false,
    since: 3600,
  });

  const { isError, isLoading, error, data } = useQuery<string, Error>(
    ['resources/logs', cluster, namespace, name, options.container, options.since, options.previous],
    async () => {
      try {
        if (options.container !== '') {
          const response = await fetch(
            `/api/plugins/resources/logs?cluster=${cluster}&namespace=${namespace}&name=${name}&container=${options.container}&since=${options.since}&previous=${options.previous}`,
            { method: 'get' },
          );
          const json = await response.json();

          if (response.status >= 200 && response.status < 300) {
            return json.logs;
          }

          if (json.error) {
            throw new Error(json.error);
          } else {
            throw new Error('An unknown error occured');
          }
        }
      } catch (err) {
        throw err;
      }
    },
  );

  useEffect(() => {
    if (ref && ref.current) {
      setWidth(ref.current.getBoundingClientRect().width);
      setHeight(ref.current.getBoundingClientRect().height);
    }
  }, []);

  return (
    <Card isCompact={true}>
      <CardBody>
        <div style={{ height: '600px', maxHeight: 'calc(100vh - 100px)', maxWidth: '100%' }} ref={ref}>
          <LogViewer
            data={isError ? error?.message : data}
            hasLineNumbers={false}
            toolbar={<LogsToolbar isLoading={isLoading} options={options} setOptions={setOptions} />}
            height={height}
            width={width}
          />
        </div>
      </CardBody>
    </Card>
  );
};

export default Logs;
