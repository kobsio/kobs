import {
  Button,
  ButtonVariant,
  Form,
  FormGroup,
  FormSelect,
  FormSelectOption,
  Modal,
  ModalVariant,
} from '@patternfly/react-core';
import React, { useContext, useState } from 'react';
import { IRow } from '@patternfly/react-table';
import { V1Pod } from '@kubernetes/client-node';
import { Terminal as xTerm } from 'xterm';

import {
  IPluginsContext,
  IResource,
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

interface ITerminalProps {
  request: IResource;
  resource: IRow;
  show: boolean;
  setShow: (value: boolean) => void;
}

const Terminal: React.FunctionComponent<ITerminalProps> = ({ request, resource, show, setShow }: ITerminalProps) => {
  const containers = getContainers(resource.props);
  const shells = ['bash', 'sh', 'powershell', 'cmd'];

  const pluginsContext = useContext<IPluginsContext>(PluginsContext);
  const terminalsContext = useContext<ITerminalContext>(TerminalsContext);
  const [container, setContainer] = useState<string>(containers[0]);
  const [shell, setShell] = useState<string>(shells[1]);

  const createTerminal = async (): Promise<void> => {
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
        `${host}/api/plugins/resources/terminal?cluster=${resource.cluster.title}${
          resource.namespace ? `&namespace=${resource.namespace.title}` : ''
        }&name=${resource.name.title}&container=${container}&shell=${shell}`,
      );

      term.reset();

      term.onData((str) => {
        ws.send(
          JSON.stringify({
            Cols: term.cols,
            Data: str,
            Op: 'stdin',
            Rows: term.rows,
          }),
        );
      });

      term.onResize(() => {
        ws.send(
          JSON.stringify({
            Cols: term.cols,
            Op: 'resize',
            Rows: term.rows,
          }),
        );
      });

      ws.onmessage = (event): void => {
        const msg = JSON.parse(event.data);
        if (msg.Op === 'stdout') {
          term.write(msg.Data);
        }
      };

      terminalsContext.addTerminal({
        name: `${resource.namespace.title}: ${container} (${shell})`,
        terminal: term,
        webSocket: ws,
      });
    } catch (err) {
      if (err.message) {
        term.write(`${err.message}\n\r`);
        terminalsContext.addTerminal({
          name: `${resource.namespace.title}: ${container} (${shell})`,
          terminal: term,
        });
      }
    }
  };

  return (
    <Modal
      variant={ModalVariant.small}
      title="Terminal"
      isOpen={show}
      onClose={(): void => setShow(false)}
      actions={[
        <Button key="createTerminal" variant={ButtonVariant.primary} onClick={createTerminal}>
          Create Terminal
        </Button>,
        <Button key="cancel" variant={ButtonVariant.link} onClick={(): void => setShow(false)}>
          Cancel
        </Button>,
      ]}
    >
      <Form isHorizontal={true}>
        <FormGroup label="Container" fieldId="terminal-form-container">
          <FormSelect
            value={container}
            onChange={(value): void => setContainer(value)}
            id="terminal-form-container"
            name="terminal-form-container"
            aria-label="Container"
          >
            {containers.map((container, index) => (
              <FormSelectOption key={index} value={container} label={container} />
            ))}
          </FormSelect>
        </FormGroup>

        <FormGroup label="Shell" fieldId="terminal-form-shell">
          <FormSelect
            value={shell}
            onChange={(value): void => setShell(value)}
            id="terminal-form-shell"
            name="terminal-form-shell"
            aria-label="Shell"
          >
            {shells.map((shell, index) => (
              <FormSelectOption key={index} value={shell} label={shell} />
            ))}
          </FormSelect>
        </FormGroup>
      </Form>
    </Modal>
  );
};

export default Terminal;
