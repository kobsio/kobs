import { Accordion, Card, CardBody } from '@patternfly/react-core';
import React from 'react';
import { Virtuoso } from 'react-virtuoso';

import { ITrace } from '../../../utils/interfaces';
import Span from './Span';
import SpansChart from './SpansChart';

export interface ISpansProps {
  name: string;
  trace: ITrace;
}

const Spans: React.FunctionComponent<ISpansProps> = ({ name, trace }: ISpansProps) => {
  return (
    <React.Fragment>
      {trace.spans.length <= 100 && (
        <div>
          <Card>
            <CardBody>
              <div
                style={{ height: `${trace.spans.length > 20 ? 100 : trace.spans.length * 5}px`, position: 'relative' }}
              >
                {trace.spans.map((span, index) => (
                  <SpansChart
                    key={index}
                    span={span}
                    duration={trace.duration}
                    startTime={trace.startTime}
                    processes={trace.processes}
                    height={trace.spans.length > 20 ? 100 / trace.spans.length : 5}
                  />
                ))}
              </div>
            </CardBody>
          </Card>

          <p>&nbsp;</p>
        </div>
      )}

      <Card>
        <Accordion asDefinitionList={false}>
          <div style={{ height: 'calc(100vh - 76px - 154px - 84px - 72px)' }}>
            <Virtuoso
              useWindowScroll={false}
              data={trace.spans}
              itemContent={(index, span): React.ReactNode => (
                <Span
                  name={name}
                  span={span}
                  duration={trace.duration}
                  startTime={trace.startTime}
                  processes={trace.processes}
                />
              )}
            />
          </div>
        </Accordion>
      </Card>
    </React.Fragment>
  );
};

export default Spans;
