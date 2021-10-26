import { Menu, MenuContent, MenuList } from '@patternfly/react-core';
import React from 'react';

import { ITrace } from '../../utils/interfaces';
import TracesListItem from './TracesListItem';

interface ITracesListProps {
  name: string;
  traces: ITrace[];
  showDetails?: (details: React.ReactNode) => void;
}

const TracesList: React.FunctionComponent<ITracesListProps> = ({ name, traces, showDetails }: ITracesListProps) => {
  return (
    <Menu>
      <MenuContent>
        <MenuList>
          {traces.map((trace, index) => (
            <TracesListItem key={trace.traceID} name={name} trace={trace} showDetails={showDetails} />
          ))}
        </MenuList>
      </MenuContent>
    </Menu>
  );
};

export default TracesList;
