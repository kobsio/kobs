import { Badge, Card, CardActions, CardBody, CardHeader, CardTitle } from '@patternfly/react-core';
import React from 'react';

import { ITrace, formatTraceTime, getDuration, getSpansPerServices } from 'plugins/jaeger/helpers';
import JaegerTrace from 'plugins/jaeger/JaegerTrace';

interface IJaegerTracesTraceProps {
  name: string;
  isInDrawer: boolean;
  trace: ITrace;
  setTrace: (trace: React.ReactNode) => void;
}

const JaegerTracesTrace: React.FunctionComponent<IJaegerTracesTraceProps> = ({
  name,
  isInDrawer,
  trace,
  setTrace,
}: IJaegerTracesTraceProps) => {
  const rootSpan = trace.spans[0];
  const rootSpanProcess = trace.processes[rootSpan.processID];
  const rootSpanService = rootSpanProcess.serviceName;

  const openTrace = (): void => {
    window.open(`/plugins/${name}/trace/${trace.traceID}`, '_blank');
  };

  return (
    <Card
      isFlat={true}
      isCompact={true}
      isHoverable={true}
      onClick={
        isInDrawer
          ? (): void => openTrace()
          : (): void => setTrace(<JaegerTrace name={name} trace={trace} close={(): void => setTrace(undefined)} />)
      }
    >
      <CardHeader>
        <CardTitle>
          {rootSpanService}: {rootSpan.operationName}{' '}
          <span className="pf-u-pl-sm pf-u-font-size-sm pf-u-color-400">{trace.traceID}</span>
        </CardTitle>
        <CardActions>
          <span className="pf-u-pl-sm pf-u-font-size-sm pf-u-color-400">{getDuration(trace.spans)}ms</span>
        </CardActions>
      </CardHeader>
      <CardBody>
        <Badge className="pf-u-mr-xl" isRead={true}>
          {trace.spans.length} Spans
        </Badge>

        {getSpansPerServices(trace).map((service, index) => (
          <Badge className="pf-u-ml-sm" key={index} isRead={false}>
            {service.service} ({service.spans})
          </Badge>
        ))}

        <span style={{ float: 'right' }}>{formatTraceTime(rootSpan.startTime)}</span>
      </CardBody>
    </Card>
  );
};

export default JaegerTracesTrace;
