import {
  Button,
  Card,
  CardBody,
  Flex,
  FlexItem,
  Select,
  SelectOption,
  SelectOptionObject,
  SelectVariant,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from '@patternfly/react-core';
import { ITerminalOptions, Terminal as xTerm } from 'xterm';
import React, { useEffect, useRef, useState } from 'react';
import { V1Pod } from '@kubernetes/client-node';

import { IResource } from '../../../resources/clusters';
import { IResourceRow } from '../utils/tabledata';
import TerminalContainer from './terminal/TerminalContainer';

// TERMINAL_OPTIONS are the options for a xterm.js terminal, which should be used by all packages which are using the
// terminal context.
export const TERMINAL_OPTIONS: ITerminalOptions = {
  bellStyle: 'sound',
  cursorBlink: true,
  fontSize: 12,
  scrollback: 10000,
  theme: {
    background: '#2e3440',
    black: '#3b4251',
    blue: '#81a1c1',
    brightBlack: '#4c556a',
    brightBlue: '#81a1c1',
    brightCyan: '#8fbcbb',
    brightGreen: '#a3be8b',
    brightMagenta: '#b48dac',
    brightRed: '#bf6069',
    brightWhite: '#eceef4',
    brightYellow: '#eacb8a',
    cursor: '#d8dee9',
    cyan: '#88c0d0',
    foreground: '#d8dee9',
    green: '#a3be8b',
    magenta: '#b48dac',
    red: '#bf6069',
    selection: '#434c5ecc',
    white: '#e5e9f0',
    yellow: '#eacb8a',
  },
};

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

interface ITerminalProps {
  resource: IResource;
  resourceData: IResourceRow;
}

const Terminal: React.FunctionComponent<ITerminalProps> = ({ resourceData }: ITerminalProps) => {
  const ws = useRef<WebSocket | null>(null);
  const term = useRef<xTerm>(new xTerm(TERMINAL_OPTIONS));
  const containers = getContainers(resourceData.props);
  const shells = ['bash', 'sh', 'powershell', 'cmd'];

  const [options, setOptions] = useState<{
    container: string;
    shell: string;
    showContainers: boolean;
    showShells: boolean;
  }>({
    container: containers[0],
    shell: 'bash',
    showContainers: false,
    showShells: false,
  });

  const getTerminal = async (): Promise<void> => {
    ws.current?.close();

    try {
      const host = window.location.host.startsWith('localhost:')
        ? 'ws://localhost:15220'
        : `wss://${window.location.host}`;

      ws.current = new WebSocket(
        `${host}/api/resources/terminal?satellite=${resourceData.satellite}&cluster=${resourceData.cluster}${
          resourceData.namespace ? `&namespace=${resourceData.namespace}` : ''
        }&name=${resourceData.name}&container=${options.container}&shell=${options.shell}`,
      );

      term.current.reset();

      term.current.onData((str) => {
        ws.current?.send(
          JSON.stringify({
            Cols: term.current.cols,
            Data: str,
            Op: 'stdin',
            Rows: term.current.rows,
          }),
        );
      });

      term.current.onResize(() => {
        ws.current?.send(
          JSON.stringify({
            Cols: term.current.cols,
            Op: 'resize',
            Rows: term.current.rows,
          }),
        );
      });

      ws.current.onmessage = (event): void => {
        const msg = JSON.parse(event.data);
        if (msg.Op === 'stdout') {
          term.current.write(msg.Data);
        }
      };
    } catch (err) {
      term.current.write(`${err.message}\n\r`);
    }
  };

  useEffect(() => () => ws.current?.close(), []);

  return (
    <Card isCompact={true}>
      <CardBody>
        <Flex direction={{ default: 'column' }}>
          <FlexItem>
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
                  <Select
                    variant={SelectVariant.single}
                    aria-label="Select shell input"
                    placeholderText="Shell"
                    onToggle={(): void => setOptions({ ...options, showShells: !options.showShells })}
                    onSelect={(
                      event: React.MouseEvent<Element, MouseEvent> | React.ChangeEvent<Element>,
                      value: string | SelectOptionObject,
                    ): void => setOptions({ ...options, shell: value.toString() })}
                    selections={options.shell}
                    isOpen={options.showShells}
                    maxHeight="50vh"
                  >
                    {shells.map((shell) => (
                      <SelectOption key={shell} value={shell} />
                    ))}
                  </Select>
                </ToolbarItem>
                <ToolbarItem>
                  <Button onClick={(): Promise<void> => getTerminal()} variant="primary">
                    Connect
                  </Button>
                </ToolbarItem>
              </ToolbarContent>
            </Toolbar>
          </FlexItem>
          <FlexItem>
            <TerminalContainer term={term.current} />
          </FlexItem>
        </Flex>
      </CardBody>
    </Card>
  );
};

export default Terminal;
