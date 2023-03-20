import { Box, darken, Stack, Typography } from '@mui/material';
import { FlyoutProps } from 'victory';

interface IActivePoint {
  childName: string;
  y: number;
}

interface IChartTooltipProps extends FlyoutProps {
  activePoints?: IActivePoint[];
  colorMap: Map<string, string>;
}

/**
 * ChartTooltips renders a tooltip that shows the user the value of the datapoint
 */
const ChartTooltip = (props: IChartTooltipProps) => {
  // VictoryCharts injects this property, therefore this should never happen
  if (!props.activePoints) {
    return null;
  }
  return (
    <g style={{ pointerEvents: 'none' }}>
      <foreignObject width="400" height="300">
        <Box sx={{ backgroundColor: darken('#233044', 0.13), p: 1 }}>
          {props.activePoints.map((p, i) => (
            <Stack key={p.childName} direction="row" spacing={2} alignItems="center">
              <Box height={10} width={10} sx={{ backgroundColor: props.colorMap.get(p.childName), borderRadius: 10 }} />
              <Typography fontSize="small">
                {p.childName}: {p.y}
              </Typography>
            </Stack>
          ))}
        </Box>
      </foreignObject>
    </g>
  );
};

export default ChartTooltip;
