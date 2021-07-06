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
    <React.Fragment>
      {traces.map((trace) => (
        <React.Fragment key={trace.traceID}>
          <TracesListItem name={name} trace={trace} showDetails={showDetails} />
          <p>&nbsp;</p>
        </React.Fragment>
      ))}
    </React.Fragment>
  );
};

export default TracesList;
