import {
  DrawerActions,
  DrawerCloseButton,
  DrawerHead,
  DrawerPanelBody,
  DrawerPanelContent,
} from '@patternfly/react-core';
import React from 'react';

import { ITrace } from 'plugins/jaeger/helpers';
import JaegerSpans from 'plugins/jaeger/JaegerSpans';
import JaegerTraceActions from 'plugins/jaeger/JaegerTraceActions';
import JaegerTraceHeader from 'plugins/jaeger/JaegerTraceHeader';
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
          <JaegerTraceActions name={name} trace={trace} />
          <DrawerCloseButton onClose={close} />
        </DrawerActions>
      </DrawerHead>

      <DrawerPanelBody>
        <JaegerTraceHeader trace={trace} rootSpan={rootSpan} />
        <p>&nbsp;</p>
        <JaegerSpans name={name} trace={trace} />
        <p>&nbsp;</p>
      </DrawerPanelBody>
    </DrawerPanelContent>
  );
};

export default JaegerTrace;
