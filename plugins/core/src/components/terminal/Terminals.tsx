import { DrawerPanelBody, DrawerPanelContent, Tab, TabTitleIcon, TabTitleText, Tabs } from '@patternfly/react-core';
import React, { useState } from 'react';
import { CloseIcon } from '@patternfly/react-icons';

import { ITerminal } from '../../context/TerminalsContext';
import Terminal from './Terminal';

interface ITerminalsProps {
  terminals: ITerminal[];
  activeTerminal: number;
  setActiveTerminal: (index: number) => void;
  removeTerminal: (index: number) => void;
}

const Terminals: React.FunctionComponent<ITerminalsProps> = ({
  terminals,
  activeTerminal,
  setActiveTerminal,
  removeTerminal,
}: ITerminalsProps) => {
  const [size, setSize] = useState<number>(0);

  const resize = (width: number): void => {
    setSize(width);
  };

  const handleClose = (e: React.MouseEvent<HTMLSpanElement, MouseEvent>, index: number): void => {
    e.stopPropagation();
    e.preventDefault();
    removeTerminal(index);
  };

  return (
    <DrawerPanelContent isResizable={true} onResize={resize}>
      <DrawerPanelBody className="kobsio-filled-tabs">
        <Tabs
          activeKey={activeTerminal}
          onSelect={(event, tabIndex): void => setActiveTerminal(tabIndex as number)}
          isFilled={false}
          mountOnEnter={true}
        >
          {terminals.map((terminal, index) => (
            <Tab
              key={index}
              eventKey={index}
              title={
                <React.Fragment>
                  <TabTitleText>{terminal.name}</TabTitleText>
                  <TabTitleIcon onClick={(e): void => handleClose(e, index)}>
                    <CloseIcon />
                  </TabTitleIcon>
                </React.Fragment>
              }
            >
              <div style={{ height: '100%', paddingTop: '12px' }}>
                <Terminal terminal={terminal} size={size} />
              </div>
            </Tab>
          ))}
        </Tabs>
      </DrawerPanelBody>
    </DrawerPanelContent>
  );
};

export default Terminals;
