import { Menu, MenuContent, MenuList } from '@patternfly/react-core';
import React from 'react';

import { ITrace } from '../../utils/interfaces';
import TracesListItem from './TracesListItem';

interface ITracesListProps {
  name: string;
  traces: ITrace[];
  setDetails?: (details: React.ReactNode) => void;
}

const TracesList: React.FunctionComponent<ITracesListProps> = ({ name, traces, setDetails }: ITracesListProps) => {
  return (
    <Menu>
      <MenuContent>
        <MenuList>
          {traces.map((trace, index) => (
            <TracesListItem key={trace.traceID} name={name} trace={trace} setDetails={setDetails} />
          ))}
        </MenuList>
      </MenuContent>
    </Menu>
  );
};

export default TracesList;
