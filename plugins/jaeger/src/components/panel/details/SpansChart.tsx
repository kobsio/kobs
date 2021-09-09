import React from 'react';

import { IProcess, ISpan } from '../../../utils/interfaces';

export interface ISpansChartProps {
  span: ISpan;
  duration: number;
  startTime: number;
  processes: Record<string, IProcess>;
  height: number;
}

// SpansChart is a single line in the chart to visualize the spans over time. The component requires a span, all
// processes to set the correct color for the line and a height for the line. The height is calculated by the container
// height divided by the number of spans.
const SpansChart: React.FunctionComponent<ISpansChartProps> = ({
  span,
  duration,
  startTime,
  processes,
  height,
}: ISpansChartProps) => {
  const offset = ((span.startTime - startTime) / 1000 / (duration / 1000)) * 100;
  const fill = (span.duration / 1000 / (duration / 1000)) * 100;

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
              left: `${offset}%`,
              position: 'absolute',
              width: `${fill}%`,
            }}
          ></span>
        </span>
      </div>
    </React.Fragment>
  );
};

export default SpansChart;
