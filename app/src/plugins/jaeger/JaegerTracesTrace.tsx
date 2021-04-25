import { Badge, Card, CardActions, CardBody, CardHeader, CardTitle } from '@patternfly/react-core';
import { ExclamationIcon } from '@patternfly/react-icons';
import React from 'react';

import LinkWrapper from 'components/LinkWrapper';

import {
  ITrace,
  doesTraceContainsError,
  formatTraceTime,
  getDuration,
  getRootSpan,
  getSpansPerServices,
} from 'plugins/jaeger/helpers';
import JaegerTrace from 'plugins/jaeger/JaegerTrace';

interface IJaegerTracesTraceProps {
  name: string;
  trace: ITrace;
  setTrace?: (trace: React.ReactNode) => void;
}

const JaegerTracesTrace: React.FunctionComponent<IJaegerTracesTraceProps> = ({
  name,
  trace,
  setTrace,
}: IJaegerTracesTraceProps) => {
  const rootSpan = getRootSpan(trace.spans);
  if (!rootSpan) {
    return null;
  }

  const rootSpanProcess = trace.processes[rootSpan.processID];
  const rootSpanService = rootSpanProcess.serviceName;

  const card = (
    <Card
      style={{ cursor: 'pointer' }}
      isCompact={true}
      isHoverable={true}
      onClick={
        setTrace
          ? (): void => setTrace(<JaegerTrace name={name} trace={trace} close={(): void => setTrace(undefined)} />)
          : undefined
      }
    >
      <CardHeader>
        <CardTitle>
          {rootSpanService}: {rootSpan.operationName}
          <span className="pf-u-pl-sm pf-u-font-size-sm pf-u-color-400">
            {trace.traceID}
            {doesTraceContainsError(trace) ? (
              <ExclamationIcon
                className="pf-u-ml-sm pf-u-font-size-sm"
                style={{ color: 'var(--pf-global--danger-color--100)' }}
              />
            ) : null}
          </span>
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
          <Badge key={index} className="pf-u-ml-sm" style={{ backgroundColor: service.color }}>
            {service.service} ({service.spans})
          </Badge>
        ))}

        <span style={{ float: 'right' }}>{formatTraceTime(rootSpan.startTime)}</span>
      </CardBody>
    </Card>
  );

  if (!setTrace) {
    return <LinkWrapper link={`/plugins/${name}/trace/${trace.traceID}`}>{card}</LinkWrapper>;
  }

  return card;
};

export default JaegerTracesTrace;
