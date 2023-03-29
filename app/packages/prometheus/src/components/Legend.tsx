import { roundNumber } from '@kobsio/core';
import { Square } from '@mui/icons-material';
import {
  Box,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
} from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import { FunctionComponent } from 'react';

import { TOrderBy, IMetric, IOrder } from '../utils/utils';

/**
 * The `Legend` component is used to render a legend for a `Chart` component, with all the metrics returned by the
 * provided user queries. The legend contains the metric names (labels) as well as the minimum, maximum, average and
 * current value of a metric. The legend is also used to allow a user to sort the metrics, by clicking on the
 * corresponding header value.
 */
const Legend: FunctionComponent<{
  handleOrder: (orderBy: TOrderBy) => void;
  metrics: IMetric[];
  order: IOrder;
  padding: 'none' | 'normal';
  selectedMetric: string;
  setSelectedMetric: (index: string) => void;
}> = ({ metrics, selectedMetric, setSelectedMetric, order, handleOrder, padding }) => {
  return (
    <TableContainer>
      <Table size="small" padding={padding}>
        <TableHead>
          <TableRow>
            <TableCell sortDirection={order.orderBy === 'name' ? order.order : false}>
              <TableSortLabel
                active={order.orderBy === 'name'}
                direction={order.orderBy === 'name' ? order.order : 'asc'}
                onClick={() => handleOrder('name')}
              >
                Name
                {order.orderBy === 'name' ? (
                  <Box component="span" sx={visuallyHidden}>
                    {order.order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                  </Box>
                ) : null}
              </TableSortLabel>
            </TableCell>

            <TableCell sortDirection={order.orderBy === 'min' ? order.order : false}>
              <TableSortLabel
                active={order.orderBy === 'min'}
                direction={order.orderBy === 'min' ? order.order : 'asc'}
                onClick={() => handleOrder('min')}
              >
                Min
                {order.orderBy === 'min' ? (
                  <Box component="span" sx={visuallyHidden}>
                    {order.order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                  </Box>
                ) : null}
              </TableSortLabel>
            </TableCell>

            <TableCell sortDirection={order.orderBy === 'max' ? order.order : false}>
              <TableSortLabel
                active={order.orderBy === 'max'}
                direction={order.orderBy === 'max' ? order.order : 'asc'}
                onClick={() => handleOrder('max')}
              >
                Max
                {order.orderBy === 'max' ? (
                  <Box component="span" sx={visuallyHidden}>
                    {order.order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                  </Box>
                ) : null}
              </TableSortLabel>
            </TableCell>

            <TableCell sortDirection={order.orderBy === 'avg' ? order.order : false}>
              <TableSortLabel
                active={order.orderBy === 'avg'}
                direction={order.orderBy === 'avg' ? order.order : 'asc'}
                onClick={() => handleOrder('avg')}
              >
                Avg
                {order.orderBy === 'avg' ? (
                  <Box component="span" sx={visuallyHidden}>
                    {order.order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                  </Box>
                ) : null}
              </TableSortLabel>
            </TableCell>

            <TableCell sortDirection={order.orderBy === 'current' ? order.order : false}>
              <TableSortLabel
                active={order.orderBy === 'current'}
                direction={order.orderBy === 'current' ? order.order : 'asc'}
                onClick={() => handleOrder('current')}
              >
                Current
                {order.orderBy === 'current' ? (
                  <Box component="span" sx={visuallyHidden}>
                    {order.order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                  </Box>
                ) : null}
              </TableSortLabel>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {metrics?.map((metric) => (
            <TableRow
              key={metric.id}
              sx={{ '&:last-child td, &:last-child th': { border: 0 }, cursor: 'pointer' }}
              hover={true}
              selected={metric.id === selectedMetric}
              onClick={() => (metric.id === selectedMetric ? setSelectedMetric('') : setSelectedMetric(metric.id))}
            >
              <TableCell>
                <Stack direction="row" spacing={4} alignItems="center">
                  <Square sx={{ color: metric.color }} />
                  <Box>{metric.name}</Box>
                </Stack>
              </TableCell>
              <TableCell>{roundNumber(metric.min, 4)}</TableCell>
              <TableCell>{roundNumber(metric.max, 4)}</TableCell>
              <TableCell>{roundNumber(metric.avg, 4)}</TableCell>
              <TableCell>{roundNumber(metric.current, 4)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default Legend;
