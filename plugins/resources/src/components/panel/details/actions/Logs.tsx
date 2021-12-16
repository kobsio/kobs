import {
  Button,
  ButtonVariant,
  Checkbox,
  Form,
  FormGroup,
  FormSelect,
  FormSelectOption,
  Modal,
  ModalVariant,
  TextInput,
} from '@patternfly/react-core';
import React, { useContext, useState } from 'react';
import { V1Pod } from '@kubernetes/client-node';
import { Terminal as xTerm } from 'xterm';

import {
  IPluginsContext,
  IResource,
  IResourceRow,
  ITerminalContext,
  PluginsContext,
  TERMINAL_OPTIONS,
  TerminalsContext,
} from '@kobsio/plugin-core';

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

  if (pod.spec?.ephemeralContainers) {
    for (const container of pod.spec?.ephemeralContainers) {
      containers.push(container.name);
    }
  }

  return containers;
};

interface ILogsProps {
  request: IResource;
  resource: IResourceRow;
  show: boolean;
  setShow: (value: boolean) => void;
}

const Logs: React.FunctionComponent<ILogsProps> = ({ request, resource, show, setShow }: ILogsProps) => {
  const containers = getContainers(resource.props);

  const pluginsContext = useContext<IPluginsContext>(PluginsContext);
  const terminalsContext = useContext<ITerminalContext>(TerminalsContext);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [container, setContainer] = useState<string>(containers[0]);
  const [since, setSince] = useState<number>(900);
  const [regex, setRegex] = useState<string>('');
  const [previous, setPrevious] = useState<boolean>(false);
  const [follow, setFollow] = useState<boolean>(false);

  const streamLogs = async (): Promise<void> => {
    setShow(false);

    const term = new xTerm(TERMINAL_OPTIONS);

    try {
      const pluginDetails = pluginsContext.getPluginDetails('resources');
      const configuredWebSocketAddress =
        pluginDetails && pluginDetails.options && pluginDetails.options && pluginDetails.options.webSocketAddress
          ? pluginDetails.options.webSocketAddress
          : undefined;
      const host = configuredWebSocketAddress || `wss://${window.location.host}`;

      const ws = new WebSocket(
        `${host}/api/plugins/resources/logs?cluster=${resource.cluster}${
          resource.namespace ? `&namespace=${resource.namespace}` : ''
        }&name=${resource.name}&container=${container}&since=${since}&tail=${
          TERMINAL_OPTIONS.scrollback
        }&previous=false&follow=true`,
      );

      term.reset();

      term.onData((str) => {
        if (str === '\r') {
          term.write('\n\r');
        } else {
          term.write(str);
        }
      });

      ws.onmessage = (event): void => {
        term.write(`${event.data}\n\r`);
      };

      terminalsContext.addTerminal({
        name: `${resource.name}: ${container}`,
        terminal: term,
        webSocket: ws,
      });
    } catch (err) {
      if (err.message) {
        term.write(`${err.message}\n\r`);
        terminalsContext.addTerminal({
          name: `${resource.name}: ${container}`,
          terminal: term,
        });
      }
    }
  };

  const getLogs = async (): Promise<void> => {
    setIsLoading(true);
    const term = new xTerm(TERMINAL_OPTIONS);

    try {
      const response = await fetch(
        `/api/plugins/resources/logs?cluster=${resource.cluster}${
          resource.namespace ? `&namespace=${resource.namespace}` : ''
        }&name=${resource.name}&container=${container}&regex=${encodeURIComponent(regex)}&since=${since}&tail=${
          TERMINAL_OPTIONS.scrollback
        }&previous=${previous}&follow=false`,
        { method: 'get' },
      );
      const json = await response.json();

      if (response.status >= 200 && response.status < 300) {
        term.write(`${json.logs}`);
        terminalsContext.addTerminal({
          name: `${resource.namespace}: ${container} (logs)`,
          terminal: term,
        });
        setIsLoading(false);
        setShow(false);
      } else {
        if (json.error) {
          throw new Error(json.error);
        } else {
          throw new Error('An unknown error occured');
        }
      }
    } catch (err) {
      if (err.message) {
        term.write(`${err.message}\n\r`);
        terminalsContext.addTerminal({
          name: `${resource.namespace}: ${container} (logs)`,
          terminal: term,
        });
      }
      setIsLoading(false);
      setShow(false);
    }
  };

  return (
    <Modal
      variant={ModalVariant.small}
      title="Logs"
      isOpen={show}
      onClose={(): void => setShow(false)}
      actions={[
        <Button
          key="getLogs"
          variant={ButtonVariant.primary}
          isLoading={isLoading}
          onClick={(): Promise<void> => (follow ? streamLogs() : getLogs())}
        >
          Show Logs
        </Button>,
        <Button key="cancel" variant={ButtonVariant.link} onClick={(): void => setShow(false)}>
          Cancel
        </Button>,
      ]}
    >
      <Form isHorizontal={true}>
        <FormGroup label="Container" fieldId="logs-form-container">
          <FormSelect
            value={container}
            onChange={(value): void => setContainer(value)}
            id="logs-form-container"
            name="logs-form-container"
            aria-label="Container"
          >
            {containers.map((container, index) => (
              <FormSelectOption key={index} value={container} label={container} />
            ))}
          </FormSelect>
        </FormGroup>

        <FormGroup label="Since" fieldId="logs-form-since">
          <FormSelect
            value={since}
            onChange={(value): void => setSince(parseInt(value))}
            id="logs-form-since"
            name="logs-form-since"
            aria-label="Since"
          >
            <FormSelectOption value={300} label="5 Minutes" />
            <FormSelectOption value={900} label="15 Minutes" />
            <FormSelectOption value={1800} label="30 Minutes" />
            <FormSelectOption value={3600} label="1 Hour" />
            <FormSelectOption value={10800} label="3 Hours" />
            <FormSelectOption value={21600} label="6 Hours" />
            <FormSelectOption value={43200} label="12 Hours" />
            <FormSelectOption value={86400} label="1 Day" />
            <FormSelectOption value={172800} label="2 Days" />
            <FormSelectOption value={604800} label="7 Days" />
          </FormSelect>
        </FormGroup>

        <FormGroup label="Filter" fieldId="logs-form-regex">
          <TextInput
            type="text"
            id="logs-form-regex"
            name="logs-form-regex"
            value={regex}
            onChange={(value): void => setRegex(value)}
          />
        </FormGroup>

        <FormGroup label="Previous" fieldId="logs-form-previous">
          <Checkbox
            label="Previous"
            isChecked={previous}
            onChange={setPrevious}
            aria-label="Previous"
            id="logs-form-previous"
            name="logs-form-previous"
          />
        </FormGroup>

        <FormGroup label="Follow" fieldId="logs-form-follow">
          <Checkbox
            label="Follow"
            isChecked={follow}
            onChange={setFollow}
            aria-label="Follow"
            id="logs-form-follow"
            name="logs-form-follow"
          />
        </FormGroup>
      </Form>
    </Modal>
  );
};

export default Logs;
