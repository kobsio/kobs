import {} from '@patternfly/react-core';
import React from 'react';

import { ISpan } from 'plugins/jaeger/helpers';

export interface IJaegerSpansChartProps {
  span: ISpan;
  height: number;
}

const JaegerSpansChart: React.FunctionComponent<IJaegerSpansChartProps> = ({
  span,
  height,
}: IJaegerSpansChartProps) => {
  return (
    <React.Fragment>
      <div style={{ height: `${height}px`, position: 'relative' }}>
        <span
          style={{
            height: `${height}px`,
            left: '0',
            position: 'absolute',
            top: '0',
            width: '100%',
          }}
        >
          <span
            style={{
              backgroundColor: 'var(--pf-global--primary-color--100)',
              height: `${height}px`,
              left: `${span.offset}%`,
              position: 'absolute',
              width: `${span.fill}%`,
            }}
          ></span>
        </span>
      </div>

      {span.childs
        ? span.childs.map((span, index) => <JaegerSpansChart key={index} span={span} height={height} />)
        : null}
    </React.Fragment>
  );
};

export default JaegerSpansChart;
