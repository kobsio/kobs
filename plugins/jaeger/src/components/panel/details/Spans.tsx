import { Accordion, Card, CardBody } from '@patternfly/react-core';
import React, { useEffect, useRef, useState } from 'react';
import { Virtuoso } from 'react-virtuoso';

import { ITrace } from '../../../utils/interfaces';
import Span from './Span';
import SpansChart from './SpansChart';

export interface ISpansProps {
  name: string;
  trace: ITrace;
}

const Spans: React.FunctionComponent<ISpansProps> = ({ name, trace }: ISpansProps) => {
  const refContainer = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number>(0);

  useEffect(() => {
    if (refContainer.current?.offsetHeight) {
      setHeight(refContainer.current?.offsetHeight);
    }
  }, [refContainer.current?.offsetHeight]);

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

      <Card
        style={{
          height:
            trace.spans.length <= 100
              ? `calc(100% - ${trace.spans.length > 20 ? 100 : trace.spans.length * 5}px - 48px - 24px)`
              : '100%',
        }}
      >
        <div ref={refContainer} style={{ height: '100%' }}>
          <Accordion style={{ height: '100%' }} asDefinitionList={false}>
            <Virtuoso
              style={{ height: `${height}px` }}
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
          </Accordion>
        </div>
      </Card>
    </React.Fragment>
  );
};

export default Spans;
