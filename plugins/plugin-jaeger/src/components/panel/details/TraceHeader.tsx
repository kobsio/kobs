import React from 'react';

import { ITrace } from '../../../utils/interfaces';
import { formatTraceTime } from '../../../utils/helpers';

export interface ITraceHeaderProps {
  trace: ITrace;
}

const TraceHeader: React.FunctionComponent<ITraceHeaderProps> = ({ trace }: ITraceHeaderProps) => {
  return (
    <React.Fragment>
      <span>
        <span className="pf-u-color-400">Trace Start: </span>
        <b className="pf-u-pr-md">{formatTraceTime(trace.startTime)}</b>
      </span>
      <span>
        <span className="pf-u-color-400">Duration: </span>
        <b className="pf-u-pr-md">{trace.duration / 1000}ms</b>
      </span>
      <span>
        <span className="pf-u-color-400">Services: </span>
        <b className="pf-u-pr-md">{trace.services.length}</b>
      </span>
      <span>
        <span className="pf-u-color-400">Total Spans: </span>
        <b className="pf-u-pr-md">{trace.spans.length}</b>
      </span>
    </React.Fragment>
  );
};

export default TraceHeader;
