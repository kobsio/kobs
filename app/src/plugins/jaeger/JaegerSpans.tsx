import { Accordion, Card, CardBody } from '@patternfly/react-core';
import React from 'react';

import { ISpan, ITrace, createSpansTree, getDuration } from 'plugins/jaeger/helpers';
import JaegerSpan from 'plugins/jaeger/JaegerSpan';
import JaegerSpansChart from 'plugins/jaeger/JaegerSpansChart';

import 'plugins/jaeger/jaeger.css';

export interface IJaegerSpansProps {
  trace: ITrace;
}

const JaegerSpans: React.FunctionComponent<IJaegerSpansProps> = ({ trace }: IJaegerSpansProps) => {
  const duration = getDuration(trace.spans);
  const spans: ISpan[] = createSpansTree(trace.spans, trace.spans[0].startTime, duration);

  return (
    <React.Fragment>
      <Card isFlat={true}>
        <CardBody>
          <div style={{ height: `100px`, position: 'relative' }}>
            {spans.map((span, index) => (
              <JaegerSpansChart key={index} span={span} height={100 / trace.spans.length} />
            ))}
          </div>
        </CardBody>
      </Card>

      <p>&nbsp;</p>

      <Accordion asDefinitionList={false}>
        {spans.map((span, index) => (
          <JaegerSpan key={index} span={span} processes={trace.processes} padding={16} />
        ))}
      </Accordion>
    </React.Fragment>
  );
};

export default JaegerSpans;
