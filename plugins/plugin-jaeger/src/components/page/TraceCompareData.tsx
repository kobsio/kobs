import React from 'react';

import { IPluginInstance } from '@kobsio/shared';
import { ITrace } from '../../utils/interfaces';
import TraceCompare from './TraceCompare';
import { addColorForProcesses } from '../../utils/colors';
import { transformTraceData } from '../../utils/helpers';

interface ITraceCompareDataProps {
  instance: IPluginInstance;
  traceData: ITrace;
}

const TraceCompareData: React.FunctionComponent<ITraceCompareDataProps> = ({
  instance,
  traceData,
}: ITraceCompareDataProps) => {
  const trace = transformTraceData(addColorForProcesses([traceData])[0]);

  if (!trace) {
    return null;
  }

  return <TraceCompare instance={instance} trace={trace} />;
};

export default TraceCompareData;
