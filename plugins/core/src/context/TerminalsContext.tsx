import { Drawer, DrawerContent, DrawerContentBody } from '@patternfly/react-core';
import { ITerminalOptions, Terminal as xTerm } from 'xterm';
import React, { useState } from 'react';

import Terminals from '../components/terminal/Terminals';

export interface ITerminal {
  name: string;
  terminal?: xTerm;
  webSocket?: WebSocket;
}

// ITerminalContext is the terminal context, it contains all terminals.
export interface ITerminalContext {
  terminals: ITerminal[];
  addTerminal: (terminal: ITerminal) => Promise<void>;
}

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

// TerminalsContext is the cluster context object.
export const TerminalsContext = React.createContext<ITerminalContext>({
  addTerminal: (terminal: ITerminal): Promise<void> => {
    return new Promise(() => {
      return;
    });
  },
  terminals: [],
});

// TerminalsContextConsumer is a React component that subscribes to context changes. This lets you subscribe to a
// context within a function component.
export const TerminalsContextConsumer = TerminalsContext.Consumer;

// ITerminalsContextProviderProps is the interface for the TerminalsContextProvider component. The only valid properties
// are child components of the type ReactElement.
interface ITerminalsContextProviderProps {
  children: React.ReactElement;
}

// TerminalsContextProvider is a Provider React component that allows consuming components to subscribe to context
// changes.
export const TerminalsContextProvider: React.FunctionComponent<ITerminalsContextProviderProps> = ({
  children,
}: ITerminalsContextProviderProps) => {
  const [terminals, setTerminals] = useState<ITerminal[]>([]);
  const [activeTerminal, setActiveTerminal] = useState<number>(0);

  const addTerminal = async (terminal: ITerminal): Promise<void> => {
    const tmpTerminals = [...terminals];
    tmpTerminals.push(terminal);
    setTerminals(tmpTerminals);
    setActiveTerminal(tmpTerminals.length - 1);
  };

  const removeTerminal = (index: number): void => {
    if (terminals[index].webSocket) {
      terminals[index].webSocket?.close();
    }

    const tmpTerminals = [...terminals];
    tmpTerminals.splice(index, 1);
    setTerminals(tmpTerminals);
    setActiveTerminal(0);
  };

  return (
    <TerminalsContext.Provider
      value={{
        addTerminal: addTerminal,
        terminals: terminals,
      }}
    >
      <Drawer isExpanded={terminals.length > 0} position="bottom">
        <DrawerContent
          panelContent={
            <Terminals
              terminals={terminals}
              activeTerminal={activeTerminal}
              setActiveTerminal={setActiveTerminal}
              removeTerminal={removeTerminal}
            />
          }
        >
          <DrawerContentBody>{children}</DrawerContentBody>
        </DrawerContent>
      </Drawer>
    </TerminalsContext.Provider>
  );
};
