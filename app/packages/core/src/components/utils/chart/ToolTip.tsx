import { ReactNode } from 'react';
import { FlyoutProps } from 'victory';

interface IChartToolTipProps<T extends FlyoutProps = FlyoutProps> extends FlyoutProps {
  component: (props: T) => ReactNode;
  width: number;
}

/**
 * The `ChartTooltip` component is used to render our tooltips. It uses `foreignObject` so that we can
 * render HTML in the SVG charts. The tooltip position is calculated based on the x and y position.
 * The tooltip flips to the left side of the mouse cursor, when the curser is closer to the right border of the chart.
 *
 * To render custom content inside the tooltip, you have to provide a function that accepts FlyoutProps and returns a ReactNode
 */
export const ChartTooltip = <T extends FlyoutProps = FlyoutProps>(props: IChartToolTipProps<T>) => {
  const x = props.x ?? 0;
  const y = props.y ?? 0;
  return (
    <g style={{ pointerEvents: 'none' }}>
      <foreignObject x={x > props.width / 2 ? x - 300 : x} y={y > 250 ? y - 75 : y} width="300" height="100">
        {props.component(props as unknown as T)}
      </foreignObject>
    </g>
  );
};
