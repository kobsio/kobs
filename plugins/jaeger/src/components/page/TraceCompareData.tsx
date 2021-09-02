import React from 'react';

import { ITrace } from '../../utils/interfaces';
import TraceCompare from './TraceCompare';
import { addColorForProcesses } from '../../utils/colors';
import { transformTraceData } from '../../utils/helpers';

interface ITraceCompareDataProps {
  name: string;
  traceData: ITrace;
}

const TraceCompareData: React.FunctionComponent<ITraceCompareDataProps> = ({
  name,
  traceData,
}: ITraceCompareDataProps) => {
  const trace = transformTraceData(addColorForProcesses([traceData])[0]);

  if (!trace) {
    return null;
  }

  return <TraceCompare name={name} trace={trace} />;
};

export default TraceCompareData;
