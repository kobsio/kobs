import {
  DrawerActions,
  DrawerCloseButton,
  DrawerHead,
  DrawerPanelBody,
  DrawerPanelContent,
} from '@patternfly/react-core';
import React from 'react';

import { ITrace, formatTraceTime, getDuration } from 'plugins/jaeger/helpers';
import JaegerSpans from 'plugins/jaeger/JaegerSpans';
import JaegerTraceDetailsLink from 'plugins/jaeger/JaegerTraceDetailsLink';
import Title from 'components/Title';
import { getRootSpan } from 'plugins/jaeger/helpers';

export interface IJaegerTraceProps {
  name: string;
  trace: ITrace;
  close: () => void;
}

const JaegerTrace: React.FunctionComponent<IJaegerTraceProps> = ({ name, trace, close }: IJaegerTraceProps) => {
  const rootSpan = getRootSpan(trace.spans);
  if (!rootSpan) {
    return null;
  }

  const rootSpanProcess = trace.processes[rootSpan.processID];
  const rootSpanService = rootSpanProcess.serviceName;

  return (
    <DrawerPanelContent minSize="50%">
      <DrawerHead>
        <Title title={`${rootSpanService}: ${rootSpan.operationName}`} subtitle={trace.traceID} size="lg" />
        <DrawerActions style={{ padding: 0 }}>
          <JaegerTraceDetailsLink name={name} traceID={trace.traceID} />
          <DrawerCloseButton onClose={close} />
        </DrawerActions>
      </DrawerHead>

      <DrawerPanelBody>
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
          <b className="pf-u-pr-md">{Object.keys(trace.processes).length}</b>
        </span>
        <span>
          <span className="pf-u-color-400">Total Spans: </span>
          <b className="pf-u-pr-md">{trace.spans.length}</b>
        </span>
        <p>&nbsp;</p>
        <JaegerSpans trace={trace} />
        <p>&nbsp;</p>
      </DrawerPanelBody>
    </DrawerPanelContent>
  );
};

export default JaegerTrace;
