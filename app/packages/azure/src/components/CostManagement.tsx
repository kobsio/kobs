import {
  APIContext,
  APIError,
  ChartTooltip,
  GridContext,
  IAPIContext,
  IGridContext,
  IPluginInstance,
  ITimes,
  PluginPanel,
  UseQueryWrapper,
  chartColors,
  chartTheme,
  getChartColor,
  roundNumber,
  useDimensions,
} from '@kobsio/core';
import { Square } from '@mui/icons-material';
import { Box, useTheme, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Stack } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { FunctionComponent, useContext, useRef } from 'react';
import { VictoryPie, VictoryTooltip } from 'victory';

interface ICosts {
  properties: ICostProperties;
}

interface ICostProperties {
  columns: ICostColumn[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rows: any[][];
}

interface ICostColumn {
  name: string;
  type: string;
}

interface IPieDatum {
  color: string;
  unit: string;
  x: string;
  y: number;
}

const convertProperties = (properties: ICostProperties): IPieDatum[] => {
  const pieData: IPieDatum[] = [];

  for (let i = 0; i < properties.rows.length; i++) {
    pieData.push({
      color: getChartColor(i),
      unit: properties.rows[i][2],
      x: properties.rows[i][1],
      y: properties.rows[i][0],
    });
  }

  return pieData;
};

const CostManagementPieChart: FunctionComponent<{ properties: ICostProperties }> = ({ properties }) => {
  const theme = useTheme();
  const gridContext = useContext<IGridContext>(GridContext);
  const refChart = useRef<HTMLDivElement>(null);
  const chartSize = useDimensions(refChart);

  const data = convertProperties(properties);

  return (
    <Box height={gridContext.autoHeight ? '500px' : '100%'}>
      <Box
        sx={{ height: gridContext.autoHeight ? `${500 - 80}px` : 'calc(100% - 80px)', width: '100%' }}
        ref={refChart}
        data-testid="cost-management-pie-chart"
      >
        <VictoryPie
          theme={chartTheme(theme)}
          data={data}
          height={chartSize.height}
          width={chartSize.width}
          colorScale={chartColors}
          labelComponent={
            <VictoryTooltip
              labelComponent={
                <ChartTooltip
                  height={chartSize.height}
                  width={chartSize.width}
                  legendData={({ datum }: { datum: IPieDatum }) => {
                    return {
                      color: datum.color,
                      label: datum.x,
                      title: '',
                      unit: datum.unit,
                      value: datum.y ? roundNumber(datum.y, 2) : 'N/A',
                    };
                  }}
                />
              }
              cornerRadius={0}
              flyoutPadding={{ bottom: 8, left: 20, right: 20, top: 8 }}
            />
          }
        />
      </Box>
      <Box
        height={80}
        sx={{
          '&::-webkit-scrollbar': {
            display: 'none',
          },
          overflowY: 'auto',
        }}
      >
        <TableContainer>
          <Table size="small" padding="none">
            <TableHead>
              <TableRow>
                <TableCell>Resource</TableCell>
                <TableCell>Costs</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((datum) => (
                <TableRow key={datum.x} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell>
                    <Stack direction="row" spacing={4} alignItems="center">
                      <Square sx={{ color: datum.color }} />
                      <Box>{datum.x}</Box>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    {roundNumber(datum.y, 2)} {datum.unit}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
};

export const CostManagement: FunctionComponent<{
  description?: string;
  instance: IPluginInstance;
  resourceGroup: string;
  times: ITimes;
  title: string;
}> = ({ instance, title, description, resourceGroup, times }) => {
  const apiContext = useContext<IAPIContext>(APIContext);

  const { isError, isLoading, error, data, refetch } = useQuery<ICosts, APIError>(
    ['azure/costmanagement/actualcosts', instance, resourceGroup, times],
    async () => {
      return apiContext.client.get<ICosts>(
        `/api/plugins/azure/costmanagement/actualcosts?scope=${resourceGroup}&timeStart=${times.timeStart}&timeEnd=${times.timeEnd}`,
        {
          headers: {
            'x-kobs-cluster': instance.cluster,
            'x-kobs-plugin': instance.name,
          },
        },
      );
    },
  );

  return (
    <PluginPanel title={title} description={description}>
      <UseQueryWrapper
        error={error}
        errorTitle="Failed to load costs"
        isError={isError}
        isLoading={isLoading}
        isNoData={!data || !data.properties}
        noDataTitle="No costs were found"
        refetch={refetch}
      >
        {data && data.properties && <CostManagementPieChart properties={data.properties} />}
      </UseQueryWrapper>
    </PluginPanel>
  );
};
