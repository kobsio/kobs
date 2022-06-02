import {
  Button,
  Card,
  CardBody,
  Checkbox,
  Flex,
  FlexItem,
  Select,
  SelectOption,
  SelectOptionObject,
  SelectVariant,
  Spinner,
  TextInput,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from '@patternfly/react-core';
import React, { useEffect, useRef, useState } from 'react';
import { LogViewer } from '@patternfly/react-log-viewer';
import { V1Pod } from '@kubernetes/client-node';

import { IResource } from '../../../resources/clusters';
import { IResourceRow } from '../utils/tabledata';

// getContainers returns a list with all container names for the given Pod. It contains all specified init containers
// and the "normal" containers.
const getContainers = (pod: V1Pod): string[] => {
  const containers: string[] = [];

  if (pod.spec?.initContainers) {
    for (const container of pod.spec.initContainers) {
      containers.push(container.name);
    }
  }

  if (pod.spec?.containers) {
    for (const container of pod.spec.containers) {
      containers.push(container.name);
    }
  }

  if (pod.spec?.ephemeralContainers) {
    for (const container of pod.spec.ephemeralContainers) {
      containers.push(container.name);
    }
  }

  return containers;
};

interface ILogsProps {
  resource: IResource;
  resourceData: IResourceRow;
}

const Logs: React.FunctionComponent<ILogsProps> = ({ resourceData }: ILogsProps) => {
  const ws = useRef<WebSocket | null>(null);
  const containers = getContainers(resourceData.props);

  const [options, setOptions] = useState<{
    container: string;
    follow: boolean;
    isLoading: boolean;
    logs: string;
    previous: boolean;
    regex: string;
    showContainers: boolean;
    showSince: boolean;
    since: number;
  }>({
    container: containers[0],
    follow: false,
    isLoading: false,
    logs: '',
    previous: false,
    regex: '',
    showContainers: false,
    showSince: false,
    since: 900,
  });

  const getLogs = async (): Promise<void> => {
    ws.current?.close();
    setOptions({ ...options, isLoading: true });

    try {
      const response = await fetch(
        `/api/resources/logs?satellite=${resourceData.satellite}&cluster=${resourceData.cluster}${
          resourceData.namespace ? `&namespace=${resourceData.namespace}` : ''
        }&name=${resourceData.name}&container=${options.container}&regex=${encodeURIComponent(options.regex)}&since=${
          options.since
        }&tail=50000&previous=${options.previous}&follow=false`,
        {
          method: 'get',
        },
      );
      const json = await response.json();

      if (response.status >= 200 && response.status < 300) {
        setOptions({ ...options, isLoading: false, logs: json.logs });
      } else {
        if (json.error) {
          setOptions({ ...options, isLoading: false, logs: json.error });
        } else {
          setOptions({ ...options, isLoading: false, logs: 'An unknown error occured' });
        }
      }
    } catch (err) {
      setOptions({ ...options, isLoading: false, logs: err.message });
    }
  };

  const streamLogs = async (): Promise<void> => {
    ws.current?.close();

    try {
      const host = window.location.host === 'localhost:' ? 'ws://localhost:15220' : `wss://${window.location.host}`;

      ws.current = new WebSocket(
        `${host}/api/resources/logs?satellite=${resourceData.satellite}&cluster=${resourceData.cluster}${
          resourceData.namespace ? `&namespace=${resourceData.namespace}` : ''
        }&name=${resourceData.name}&container=${options.container}&since=${
          options.since
        }&tail=50000&previous=false&follow=true`,
      );

      ws.current.onmessage = (event): void => {
        setOptions((prevOptions) => ({ ...prevOptions, logs: prevOptions.logs + `${event.data}\n\r` }));
      };
    } catch (err) {
      setOptions({ ...options, logs: err.message });
    }
  };

  useEffect(() => () => ws.current?.close(), []);

  return (
    <Card isCompact={true}>
      <CardBody>
        <Flex direction={{ default: 'column' }}>
          <FlexItem>
            {options.isLoading ? (
              <div className="pf-u-text-align-center">
                <Spinner />
              </div>
            ) : (
              <LogViewer
                height={500}
                hasLineNumbers={false}
                data={options.logs}
                isTextWrapped={false}
                toolbar={
                  <Toolbar>
                    <ToolbarContent>
                      <ToolbarItem>
                        <Select
                          variant={SelectVariant.single}
                          aria-label="Select container input"
                          placeholderText="Container"
                          onToggle={(): void => setOptions({ ...options, showContainers: !options.showContainers })}
                          onSelect={(
                            event: React.MouseEvent<Element, MouseEvent> | React.ChangeEvent<Element>,
                            value: string | SelectOptionObject,
                          ): void => setOptions({ ...options, container: value.toString() })}
                          selections={options.container}
                          isOpen={options.showContainers}
                          maxHeight="50vh"
                        >
                          {containers.map((container) => (
                            <SelectOption key={container} value={container} />
                          ))}
                        </Select>
                      </ToolbarItem>
                      <ToolbarItem>
                        <TextInput
                          aria-label="Regex filter"
                          placeholder="Filter"
                          value={options.regex}
                          onChange={(value: string): void => setOptions({ ...options, regex: value })}
                        />
                      </ToolbarItem>
                      <ToolbarItem>
                        <Select
                          variant={SelectVariant.single}
                          aria-label="Select since input"
                          placeholderText="Since"
                          onToggle={(): void => setOptions({ ...options, showSince: !options.showSince })}
                          onSelect={(
                            event: React.MouseEvent<Element, MouseEvent> | React.ChangeEvent<Element>,
                            value: string | SelectOptionObject,
                          ): void => setOptions({ ...options, since: parseInt(value.toString()) })}
                          selections={options.since}
                          isOpen={options.showSince}
                          maxHeight="50vh"
                        >
                          <SelectOption key={300} value={300}>
                            5 Minutes
                          </SelectOption>
                          <SelectOption key={900} value={900}>
                            15 Minutes
                          </SelectOption>
                          <SelectOption key={1800} value={1800}>
                            30 Minutes
                          </SelectOption>
                          <SelectOption key={3600} value={3600}>
                            1 Hour
                          </SelectOption>
                          <SelectOption key={10800} value={10800}>
                            3 Hours
                          </SelectOption>
                          <SelectOption key={21600} value={21600}>
                            6 Hours
                          </SelectOption>
                          <SelectOption key={43200} value={43200}>
                            12 Hours
                          </SelectOption>
                          <SelectOption key={86400} value={86400}>
                            1 Day
                          </SelectOption>
                          <SelectOption key={172800} value={172800}>
                            2 Days
                          </SelectOption>
                          <SelectOption key={604800} value={604800}>
                            7 Days
                          </SelectOption>
                        </Select>
                      </ToolbarItem>
                      <ToolbarItem>
                        <Checkbox
                          aria-label="Previous logs"
                          id="previous"
                          label="Previous"
                          isChecked={options.previous}
                          onChange={(value: boolean): void => setOptions({ ...options, previous: value })}
                        />
                      </ToolbarItem>
                      <ToolbarItem>
                        <Checkbox
                          aria-label="Follow logs"
                          id="follow"
                          label="Follow"
                          isChecked={options.follow}
                          onChange={(value: boolean): void => setOptions({ ...options, follow: value })}
                        />
                      </ToolbarItem>
                      <ToolbarItem>
                        <Button
                          onClick={(): Promise<void> => (options.follow ? streamLogs() : getLogs())}
                          variant="primary"
                        >
                          Search
                        </Button>
                      </ToolbarItem>
                    </ToolbarContent>
                  </Toolbar>
                }
              />
            )}
          </FlexItem>
        </Flex>
      </CardBody>
    </Card>
  );
};

export default Logs;
