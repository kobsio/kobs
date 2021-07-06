import {
  DrawerActions,
  DrawerCloseButton,
  DrawerHead,
  DrawerPanelBody,
  DrawerPanelContent,
} from '@patternfly/react-core';
import React from 'react';

import { ITrace } from '../../../utils/interfaces';
import Spans from './Spans';
import { Title } from '@kobsio/plugin-core';
import TraceActions from './TraceActions';
import TraceHeader from './TraceHeader';
import { getRootSpan } from '../../../utils/helpers';

export interface ITraceProps {
  name: string;
  trace: ITrace;
  close: () => void;
}

const Trace: React.FunctionComponent<ITraceProps> = ({ name, trace, close }: ITraceProps) => {
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
          <TraceActions name={name} trace={trace} />
          <DrawerCloseButton onClose={close} />
        </DrawerActions>
      </DrawerHead>

      <DrawerPanelBody>
        <TraceHeader trace={trace} rootSpan={rootSpan} />
        <p>&nbsp;</p>
        <Spans name={name} trace={trace} />
        <p>&nbsp;</p>
      </DrawerPanelBody>
    </DrawerPanelContent>
  );
};

export default Trace;
