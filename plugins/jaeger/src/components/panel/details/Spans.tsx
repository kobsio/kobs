import { Accordion, Card, CardBody } from '@patternfly/react-core';
import React from 'react';

import { ISpan, ITrace } from '../../../utils/interfaces';
import { createSpansTree, getDuration, getRootSpan } from '../../../utils/helpers';
import Span from './Span';
import SpansChart from './SpansChart';

export interface ISpansProps {
  name: string;
  trace: ITrace;
}

const Spans: React.FunctionComponent<ISpansProps> = ({ name, trace }: ISpansProps) => {
  const rootSpan = trace.spans.length > 0 ? getRootSpan(trace.spans) : undefined;
  if (!rootSpan) {
    return null;
  }

  const duration = getDuration(trace.spans);
  const spans: ISpan[] = createSpansTree(trace.spans, rootSpan.startTime, duration);

  return (
    <React.Fragment>
      <Card>
        <CardBody>
          <div style={{ height: `${trace.spans.length > 20 ? 100 : trace.spans.length * 5}px`, position: 'relative' }}>
            {spans.map((span, index) => (
              <SpansChart
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
            <Span key={index} name={name} span={span} processes={trace.processes} level={1} />
          ))}
        </Accordion>
      </Card>
    </React.Fragment>
  );
};

export default Spans;
