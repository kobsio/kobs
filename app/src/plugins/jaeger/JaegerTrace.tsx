import {
  Button,
  ButtonVariant,
  DrawerActions,
  DrawerCloseButton,
  DrawerHead,
  DrawerPanelBody,
  DrawerPanelContent,
} from '@patternfly/react-core';
import ExternalLinkIcon from '@patternfly/react-icons/dist/js/icons/external-link-alt-icon';
import React from 'react';

import { ITrace, formatTraceTime, getDuration } from 'plugins/jaeger/helpers';
import JaegerSpans from 'plugins/jaeger/JaegerSpans';
import Title from 'components/Title';

export interface IJaegerTraceProps {
  name: string;
  trace: ITrace;
  close: () => void;
}

const JaegerTrace: React.FunctionComponent<IJaegerTraceProps> = ({ name, trace, close }: IJaegerTraceProps) => {
  const rootSpan = trace.spans[0];
  const rootSpanProcess = trace.processes[rootSpan.processID];
  const rootSpanService = rootSpanProcess.serviceName;

  const openTrace = (): void => {
    window.open(`/plugins/${name}/trace/${trace.traceID}`, '_blank');
  };

  return (
    <DrawerPanelContent minSize="50%">
      <DrawerHead>
        <Title title={`${rootSpanService}: ${rootSpan.operationName}`} subtitle={trace.traceID} size="lg" />
        <DrawerActions style={{ padding: 0 }}>
          <div className="pf-c-drawer__close">
            <Button variant={ButtonVariant.plain} onClick={openTrace}>
              <ExternalLinkIcon />
            </Button>
          </div>
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
