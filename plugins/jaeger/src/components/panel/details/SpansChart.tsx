import React from 'react';

import { IProcesses, ISpan } from '../../../utils/interfaces';

export interface IJaegerSpansChartProps {
  span: ISpan;
  processes: IProcesses;
  height: number;
}

// JaegerSpansChart is a single line in the chart to visualize the spans over time. The component requires a span, all
// processes to set the correct color for the line and a height for the line. The height is calculated by the container
// height divided by the number of spans.
const JaegerSpansChart: React.FunctionComponent<IJaegerSpansChartProps> = ({
  span,
  processes,
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
              backgroundColor: processes[span.processID].color
                ? processes[span.processID].color
                : 'var(--pf-global--primary-color--100)',
              height: `${height}px`,
              left: `${span.offset}%`,
              position: 'absolute',
              width: `${span.fill}%`,
            }}
          ></span>
        </span>
      </div>

      {span.childs
        ? span.childs.map((span, index) => (
            <JaegerSpansChart key={index} span={span} processes={processes} height={height} />
          ))
        : null}
    </React.Fragment>
  );
};

export default JaegerSpansChart;
