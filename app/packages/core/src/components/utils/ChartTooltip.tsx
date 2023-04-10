import { Square } from '@mui/icons-material';
import { Box, darken, useTheme } from '@mui/material';
import { FunctionComponent } from 'react';
import { FlyoutProps } from 'victory';

interface IChartTooltipProps<T extends FlyoutProps = FlyoutProps> extends FlyoutProps {
  height: number;
  legendData: (props: T) => IChartTooltipContentProps;
  width: number;
}

/**
 * The `ChartTooltip` component is used to render our tooltips. It uses `foreignObject` so that we can render HTML in
 * the SVG charts. The tooltip position is calculated based on the x and y position. The tooltip flips to the left side
 * of the mouse cursor, when the curser is closer to the right border of the chart, the same is true for the top and
 * bottom of the chart.
 *
 * The content of the `ChartTooltip` component is rendered by the `ChartTooltipContent` component. For this the props
 * must be generated via the `legendData` function.
 *
 * ```
 * <VictoryVoronoiContainer
 *   labelComponent={
 *     <ChartTooltip
 *       height={chartSize.height}
 *       width={chartSize.width}
 *       legendData={({ datum }: { datum: IDatum }) => ({
 *         color: datum.hasError ? theme.palette.error.main : theme.palette.primary.main,
 *         label: datum.name,
 *         title: formatTraceTime(datum.x.getTime() * 1000),
 *         unit: 'ms',
 *         value: datum.y,
 *       })}
 *     />
 *   }
 * />
 * ```
 */
export const ChartTooltip = <T extends FlyoutProps = FlyoutProps>(props: IChartTooltipProps<T>) => {
  const x = props.x ?? 0;
  const y = props.y ?? 0;

  const lg = props.legendData(props as unknown as T);

  return (
    <g style={{ pointerEvents: 'none' }}>
      <foreignObject
        x={x > props.width / 2 ? x - 300 : x}
        y={y > props.height / 2 ? y - 75 : y}
        width="300"
        height="100"
      >
        <ChartTooltipContent color={lg.color} title={lg.title} label={lg.label} value={lg.value} unit={lg.unit} />
      </foreignObject>
    </g>
  );
};

interface IChartTooltipContentProps {
  color?: string;
  label: string;
  title?: string;
  unit?: string;
  value: string | number;
}

const ChartTooltipContent: FunctionComponent<IChartTooltipContentProps> = ({ color, label, title, unit, value }) => {
  const theme = useTheme();

  return (
    <Box sx={{ backgroundColor: darken(theme.palette.background.paper, 0.13), p: 4 }}>
      {title && <b>{title}</b>}
      <Box sx={{ alignItems: 'center', display: 'flex', flexDirection: 'row', gap: 2 }}>
        {color && <Square sx={{ color: color }} />}
        <Box component="span" sx={{ flexGrow: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {label}
        </Box>
        <Box component="span" sx={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
          {value}
          {unit ? ` ${unit}` : ''}
        </Box>
      </Box>
    </Box>
  );
};
