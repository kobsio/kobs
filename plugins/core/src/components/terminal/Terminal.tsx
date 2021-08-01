import React, { useEffect, useRef, useState } from 'react';
import { Terminal as xTerm } from 'xterm';
import { FitAddon as xTermFitAddon } from 'xterm-addon-fit';

import { ITerminal } from '../../context/TerminalsContext';

interface ITerminalProps {
  terminal: ITerminal;
  size: number;
}

const Terminal: React.FunctionComponent<ITerminalProps> = ({ terminal, size }: ITerminalProps) => {
  const termRef = useRef<HTMLDivElement>(null);
  const [term, setTerm] = useState<xTerm>();

  const fitAddon = new xTermFitAddon();

  useEffect(() => {
    setTerm(terminal.terminal);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return (): void => {
      window.removeEventListener('resize', updateTerminalSize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (termRef.current && term) {
      term.loadAddon(fitAddon);
      updateTerminalSize();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size]);

  useEffect(() => {
    const handleTerminalInit = async (): Promise<void> => {
      setTimeout(() => {
        if (termRef.current && term) {
          term.loadAddon(fitAddon);
          term.open(termRef.current);
          updateTerminalSize();

          if (terminal.webSocket) {
            term.focus();
          }

          window.addEventListener('resize', updateTerminalSize);
        }
      }, 1000);
    };

    handleTerminalInit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [termRef, term]);

  const updateTerminalSize = (): void => {
    setTimeout(() => {
      fitAddon.fit();
    }, 100);
  };

  return <div ref={termRef} style={{ height: '100%', minHeight: '100px' }}></div>;
};

export default Terminal;
