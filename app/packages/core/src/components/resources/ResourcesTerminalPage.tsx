import { Alert, Box } from '@mui/material';
import { FunctionComponent, useEffect, useRef, useState } from 'react';
import { ITerminalOptions, Terminal as xTerm } from 'xterm';
import { FitAddon as xTermFitAddon } from 'xterm-addon-fit';

import { useQueryState } from '../../utils/hooks/useQueryState';
import { Page } from '../utils/Page';

import 'xterm/css/xterm.css';

interface IOptions {
  cluster: string;
  container: string;
  name: string;
  namespace: string;
  shell: string;
}

/**
 * `TERMINAL_OPTIONS` are the options for a xterm.js terminal, which should be used by all packages which are using the
 * terminal context.
 */
const TERMINAL_OPTIONS: ITerminalOptions = {
  cursorBlink: false,
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
    // selection: '#434c5ecc',
    white: '#e5e9f0',
    yellow: '#eacb8a',
  },
};

const Terminal: FunctionComponent<{ options: IOptions }> = ({ options }) => {
  const [error, setError] = useState<string>('');
  const termContainer = useRef<HTMLDivElement>(null);
  const ws = useRef<WebSocket | null>(null);
  const term = useRef<xTerm | null>(null);

  const fitAddon = new xTermFitAddon();

  useEffect(() => {
    setError('');

    term.current = new xTerm(TERMINAL_OPTIONS);

    if (termContainer && termContainer.current) {
      term.current.loadAddon(fitAddon);
      term.current.open(termContainer.current);
      updateTerminalSize();
      window.addEventListener('resize', updateTerminalSize);
    }

    const host = window.location.host.startsWith('localhost:')
      ? 'ws://localhost:15220'
      : `wss://${window.location.host}`;

    ws.current = new WebSocket(
      `${host}/api/resources/terminal?x-kobs-cluster=${options.cluster}${
        options.namespace ? `&namespace=${options.namespace}` : ''
      }&name=${options.name}&container=${options.container}&shell=${options.shell}`,
    );

    term.current.onData((str) => {
      ws.current?.send(
        JSON.stringify({
          Cols: term.current?.cols,
          Data: str,
          Op: 'stdin',
          Rows: term.current?.rows,
        }),
      );
    });

    term.current.onResize(() => {
      ws.current?.send(
        JSON.stringify({
          Cols: term.current?.cols,
          Op: 'resize',
          Rows: term.current?.rows,
        }),
      );
    });

    ws.current.onmessage = (e): void => {
      const msg = JSON.parse(e.data);
      if (msg.Op === 'stdout') {
        term.current?.write(msg.Data);
      }
    };

    ws.current.onerror = () => {
      setError('An error occured');
    };

    ws.current.onclose = () => {
      setError('Websocket connection was closed');
    };

    return () => {
      window.removeEventListener('resize', updateTerminalSize);
      ws.current?.close();
      term.current?.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateTerminalSize = (): void => {
    setTimeout(() => {
      fitAddon.fit();
    }, 100);
  };

  return (
    <>
      {error && (
        <Alert sx={{ mb: 4 }} severity="error">
          {error}
        </Alert>
      )}
      <Box minWidth="100%" sx={{ alignItems: 'stretch', display: 'flex', flexGrow: 1 }}>
        <div style={{ width: '100%' }} ref={termContainer}></div>
      </Box>
    </>
  );
};

const ResourcesTerminalPage: FunctionComponent = () => {
  const [options] = useQueryState<IOptions>({
    cluster: '',
    container: '',
    name: '',
    namespace: '',
    shell: '',
  });

  return (
    <Page
      title={`${options.name} / ${options.container}`}
      subtitle={`(${options.cluster} / ${options.namespace})`}
      description={`Get a terminal for the ${options.container} container from the ${options.name} pod.`}
    >
      <Terminal options={options} />
    </Page>
  );
};

export default ResourcesTerminalPage;
