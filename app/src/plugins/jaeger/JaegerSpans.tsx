import { Accordion, Card, CardBody } from '@patternfly/react-core';
import React from 'react';

import { ISpan, ITrace, createSpansTree, getDuration } from 'plugins/jaeger/helpers';
import JaegerSpan from 'plugins/jaeger/JaegerSpan';
import JaegerSpansChart from 'plugins/jaeger/JaegerSpansChart';

import 'plugins/jaeger/jaeger.css';

export interface IJaegerSpansProps {
  name: string;
  trace: ITrace;
}

const JaegerSpans: React.FunctionComponent<IJaegerSpansProps> = ({ name, trace }: IJaegerSpansProps) => {
  const duration = getDuration(trace.spans);
  const spans: ISpan[] = createSpansTree(trace.spans, trace.spans[0].startTime, duration);

  return (
    <React.Fragment>
      <Card>
        <CardBody>
          <div style={{ height: `${trace.spans.length > 20 ? 100 : trace.spans.length * 5}px`, position: 'relative' }}>
            {spans.map((span, index) => (
              <JaegerSpansChart
                key={index}
                span={span}
                processes={trace.processes}
                height={trace.spans.length > 20 ? 100 / trace.spans.length : 5}
              />
            ))}
          </div>
        </CardBody>
      </Card>

      <p>&nbsp;</p>

      <Card>
        <Accordion asDefinitionList={false}>
          {spans.map((span, index) => (
            <JaegerSpan key={index} name={name} span={span} processes={trace.processes} padding={16} />
          ))}
        </Accordion>
      </Card>
    </React.Fragment>
  );
};

export default JaegerSpans;
