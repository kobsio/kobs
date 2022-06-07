import React, { useState } from 'react';
import { DataList } from '@patternfly/react-core';

import { IPluginInstance } from '@kobsio/shared';
import { ITrace } from '../../utils/interfaces';
import Trace from './details/Trace';
import TracesListItem from './TracesListItem';

interface ITracesListProps {
  instance: IPluginInstance;
  traces: ITrace[];
  setDetails?: (details: React.ReactNode) => void;
}

const TracesList: React.FunctionComponent<ITracesListProps> = ({ instance, traces, setDetails }: ITracesListProps) => {
  const [selectedTraceID, setSelectedTraceID] = useState<string>();

  const selectTraceID = (id: string): void => {
    const selectedTraces = traces.filter((trace) => trace.traceID === id);
    if (setDetails && selectedTraces?.length === 1) {
      setSelectedTraceID(selectedTraces[0].traceID);
      setDetails(
        <Trace
          instance={instance}
          trace={selectedTraces[0]}
          close={(): void => {
            setSelectedTraceID(undefined);
            setDetails(undefined);
          }}
        />,
      );
    }
  };

  return (
    <DataList aria-label="traces list" selectedDataListItemId={selectedTraceID} onSelectDataListItem={selectTraceID}>
      {traces.map((trace) => (
        <TracesListItem key={trace.traceID} instance={instance} trace={trace} setDetails={setDetails} />
      ))}
    </DataList>
  );
};

export default TracesList;
