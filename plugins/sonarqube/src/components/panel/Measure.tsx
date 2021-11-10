import { Td, Tr } from '@patternfly/react-table';
import { Tooltip, TooltipPosition } from '@patternfly/react-core';
import React from 'react';

import { IMeasure, IMetric } from '../../utils/interfaces';

interface IFormattedValue {
  color: string;
  value: string;
}

const COLOR_OK = 'var(--pf-global--success-color--100)';
const COLOR_WARNING = 'var(--pf-global--warning-color--100)';
const COLOR_DANGER = 'var(--pf-global--danger-color--100)';

// getMetric returns the correct metric for a measure.
const getMetric = (metricName: string, metrics: IMetric[]): IMetric | undefined => {
  const metric = metrics.filter((metric) => metric.key === metricName);
  return metric.length === 1 ? metric[0] : undefined;
};

// getFormattedValue returns the formatted value for a measure. The value is formatted based on metric definitions.
// See: https://docs.sonarqube.org/latest/user-guide/metric-definitions/
const getFormattedValue = (measure: IMeasure, metric: IMetric): IFormattedValue => {
  if (measure.metric === 'alert_status') {
    if (measure.value === 'OK') {
      return { color: COLOR_OK, value: 'Passed' };
    } else if (measure.value === 'WARNING') {
      return { color: COLOR_WARNING, value: 'Warning' };
    } else {
      return { color: COLOR_DANGER, value: 'Failed' };
    }
  }

  if (metric.type === 'RATING') {
    if (parseFloat(measure.value) <= 1.0) {
      return { color: COLOR_OK, value: 'A' };
    } else if (parseFloat(measure.value) <= 2.0) {
      return { color: COLOR_WARNING, value: 'B' };
    } else if (parseFloat(measure.value) <= 3.0) {
      return { color: COLOR_WARNING, value: 'C' };
    } else if (parseFloat(measure.value) <= 4.0) {
      return { color: COLOR_DANGER, value: 'D' };
    } else {
      return { color: COLOR_DANGER, value: 'E' };
    }
  }

  if (metric.type === 'PERCENT') {
    return { color: '', value: `${measure.value}%` };
  }

  return { color: '', value: measure.value };
};

interface IMeasureProps {
  measure: IMeasure;
  metrics: IMetric[];
}

const Measure: React.FunctionComponent<IMeasureProps> = ({ measure, metrics }: IMeasureProps) => {
  // Get the metric for the give measure. If the metric can not be found in the array of metrics we do not render the
  // measure row.
  const metric = getMetric(measure.metric, metrics);

  if (!metric) {
    return null;
  }

  // Get the formatted value of the measure, so that a user can directly see a problem based on the color.
  const formattedValue = getFormattedValue(measure, metric);

  return (
    <Tr>
      <Td>
        <Tooltip position={TooltipPosition.right} content={<div>{metric.description}</div>}>
          <span>{metric.name}</span>
        </Tooltip>
      </Td>
      <Td style={{ color: formattedValue.color || undefined }}>{formattedValue.value}</Td>
    </Tr>
  );
};

export default Measure;
