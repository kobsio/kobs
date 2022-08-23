import { FlexItem, Tooltip, TooltipPosition } from '@patternfly/react-core';
import CheckCircleIcon from '@patternfly/react-icons/dist/esm/icons/check-circle-icon';
import ExclamationCircleIcon from '@patternfly/react-icons/dist/esm/icons/exclamation-circle-icon';
import ExclamationTriangleIcon from '@patternfly/react-icons/dist/esm/icons/exclamation-triangle-icon';
import InfoCircleIcon from '@patternfly/react-icons/dist/esm/icons/info-circle-icon';
import React from 'react';

import { IMeasure, IMetric } from '../../utils/interfaces';

interface IFormattedValue {
  status: string;
  value: string;
}

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
    <FlexItem className="pf-u-m-lg" style={{ textAlign: 'center' }}>
      <Tooltip position={TooltipPosition.right} content={<div>{metric.description}</div>}>
        <span>
          <p>
            <b>{formattedValue.value}</b>
            <span className="pf-u-pl-sm">
              {formattedValue.status === 'success' ? (
                <CheckCircleIcon color="var(--pf-global--success-color--100)" />
              ) : formattedValue.status === 'warning' ? (
                <ExclamationTriangleIcon color="var(--pf-global--warning-color--100)" />
              ) : formattedValue.status === 'danger' ? (
                <ExclamationCircleIcon color="var(--pf-global--danger-color--100)" />
              ) : (
                <InfoCircleIcon color="var(--pf-global--primary-color--100)" />
              )}
            </span>
          </p>
          <p>
            <span>{metric.name}</span>
          </p>
        </span>
      </Tooltip>
    </FlexItem>
  );
};

export default Measure;