import { APIContext, APIError, IAPIContext, IPluginInstance, UseQueryWrapper } from '@kobsio/core';
import { CheckCircle, Error, Info, Warning } from '@mui/icons-material';
import { Box, Stack, Tooltip, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { FunctionComponent, useContext } from 'react';

import { IResponseProjectMeasures, IMeasure, IMetric } from '../utils/utils';

interface IFormattedValue {
  status: string;
  value: string;
}

/**
 * `getMetric` returns the correct metric for a measure.
 */
const getMetric = (metricName: string, metrics: IMetric[]): IMetric | undefined => {
  const metric = metrics.filter((metric) => metric.key === metricName);
  return metric.length === 1 ? metric[0] : undefined;
};

/**
 * `getFormattedValue` returns the formatted value for a measure. The value is formatted based on metric definitions.
 * See: https://docs.sonarqube.org/latest/user-guide/metric-definitions/
 */
const getFormattedValue = (measure: IMeasure, metric: IMetric): IFormattedValue => {
  if (measure.metric === 'alert_status') {
    if (measure.value === 'OK') {
      return { status: 'success', value: 'Passed' };
    } else if (measure.value === 'WARNING') {
      return { status: 'warning', value: 'Warning' };
    } else {
      return { status: 'danger', value: 'Failed' };
    }
  }

  if (metric.type === 'RATING') {
    if (parseFloat(measure.value) <= 1.0) {
      return { status: 'success', value: 'A' };
    } else if (parseFloat(measure.value) <= 2.0) {
      return { status: 'warning', value: 'B' };
    } else if (parseFloat(measure.value) <= 3.0) {
      return { status: 'warning', value: 'C' };
    } else if (parseFloat(measure.value) <= 4.0) {
      return { status: 'danger', value: 'D' };
    } else {
      return { status: 'danger', value: 'E' };
    }
  }

  if (metric.type === 'PERCENT') {
    if (measure.bestValue === true) {
      return { status: 'success', value: `${measure.value}%` };
    }

    if (parseInt(metric.bestValue) === 100) {
      if (parseFloat(measure.value) > 90) {
        return { status: 'success', value: `${measure.value}%` };
      } else if (parseFloat(measure.value) > 75) {
        return { status: 'warning', value: `${measure.value}%` };
      } else {
        return { status: 'danger', value: `${measure.value}%` };
      }
    }

    return { status: 'info', value: `${measure.value}%` };
  }

  if (measure.bestValue === true) {
    return { status: 'success', value: measure.value };
  }

  return { status: 'warning', value: measure.value };
};

const Measure: FunctionComponent<{
  measure: IMeasure;
  metrics: IMetric[];
}> = ({ measure, metrics }) => {
  // Get the metric for the give measure. If the metric can not be found in the array of metrics we do not render the
  // measure row.
  const metric = getMetric(measure.metric, metrics);

  if (!metric) {
    return null;
  }

  // Get the formatted value of the measure, so that a user can directly see a problem based on the color.
  const formattedValue = getFormattedValue(measure, metric);

  return (
    <Box>
      <Tooltip title={metric.description}>
        <Stack direction="column" alignContent="center" alignItems="center">
          <Stack direction="row" alignContent="center" alignItems="center" spacing={2}>
            <Typography fontWeight="bold">{formattedValue.value}</Typography>
            <Box>
              {formattedValue.status === 'success' ? (
                <CheckCircle color="success" />
              ) : formattedValue.status === 'warning' ? (
                <Warning color="warning" />
              ) : formattedValue.status === 'danger' ? (
                <Error color="error" />
              ) : (
                <Info color="primary" />
              )}
            </Box>
          </Stack>
          <Box>{metric.name}</Box>
        </Stack>
      </Tooltip>
    </Box>
  );
};

const Measures: FunctionComponent<{
  instance: IPluginInstance;
  metricKeys?: string[];
  project: string;
}> = ({ instance, project, metricKeys }) => {
  const apiContext = useContext<IAPIContext>(APIContext);

  const { isError, isLoading, error, data, refetch } = useQuery<IResponseProjectMeasures, APIError>(
    ['sonarqube/projectmeasures', instance, project, metricKeys],
    async () => {
      const metricKeyParams = metricKeys ? metricKeys.map((key) => `metricKey=${key}`).join('&') : '';

      return apiContext.client.get<IResponseProjectMeasures>(
        `/api/plugins/sonarqube/projectmeasures?project=${encodeURIComponent(project)}&${metricKeyParams}`,
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
    <UseQueryWrapper
      error={error}
      errorTitle="Failed to get measures"
      isError={isError}
      isLoading={isLoading}
      isNoData={!data || !data.component || !data.component.measures || data.component.measures.length === 0}
      noDataTitle="No measures were found"
      refetch={refetch}
    >
      <Box sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        {data?.component?.measures?.map((measure) => (
          <Measure key={measure.metric} measure={measure} metrics={data.metrics} />
        ))}
      </Box>
    </UseQueryWrapper>
  );
};

export default Measures;
