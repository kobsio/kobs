import React from 'react';

import { ISpan, getSpansPerServices } from 'plugins/jaeger/helpers';
import { ITrace, formatTraceTime, getDuration } from 'plugins/jaeger/helpers';

export interface IJaegerTraceHeaderProps {
  trace: ITrace;
  rootSpan: ISpan;
}

const JaegerTraceHeader: React.FunctionComponent<IJaegerTraceHeaderProps> = ({
  trace,
  rootSpan,
}: IJaegerTraceHeaderProps) => {
  const services = getSpansPerServices(trace);

  return (
    <React.Fragment>
      <span>
        <span className="pf-u-color-400">Trace Start: </span>
        <b className="pf-u-pr-md">{formatTraceTime(rootSpan.startTime)}</b>
      </span>
      <span>
        <span className="pf-u-color-400">Duration: </span>
        <b className="pf-u-pr-md">{getDuration(trace.spans)}ms</b>
      </span>
      <span>
        <span className="pf-u-color-400">Services: </span>
        <b className="pf-u-pr-md">{Object.keys(services).length}</b>
      </span>
      <span>
        <span className="pf-u-color-400">Total Spans: </span>
        <b className="pf-u-pr-md">{trace.spans.length}</b>
      </span>
    </React.Fragment>
  );
};

export default JaegerTraceHeader;
