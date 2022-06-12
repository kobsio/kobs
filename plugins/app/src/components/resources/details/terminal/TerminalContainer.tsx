import React, { useEffect, useRef, useState } from 'react';
import { Terminal as xTerm } from 'xterm';
import { FitAddon as xTermFitAddon } from 'xterm-addon-fit';

interface ITerminalContainerProps {
  terminal: xTerm;
}

const TerminalContainer: React.FunctionComponent<ITerminalContainerProps> = ({ terminal }: ITerminalContainerProps) => {
  const termRef = useRef<HTMLDivElement>(null);
  const [term, setTerm] = useState<xTerm>();

  const fitAddon = new xTermFitAddon();

  useEffect(() => {
    setTerm(terminal);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return (): void => {
      window.removeEventListener('resize', updateTerminalSize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleTerminalInit = async (): Promise<void> => {
      setTimeout(() => {
        if (termRef.current && term) {
          term.loadAddon(fitAddon);
          term.open(termRef.current);
          updateTerminalSize();
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

  return <div ref={termRef} style={{ height: '500px' }}></div>;
};

export default TerminalContainer;
