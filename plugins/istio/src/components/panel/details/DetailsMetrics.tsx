import {
  DrawerActions,
  DrawerCloseButton,
  DrawerHead,
  DrawerPanelBody,
  DrawerPanelContent,
} from '@patternfly/react-core';
import React from 'react';

import { IPluginTimes, Title } from '@kobsio/plugin-core';
import DetailsMetricsMetric from './DetailsMetricsMetric';
import DetailsMetricsPod from './DetailsMetricsPod';
import { IRowValues } from '@kobsio/plugin-prometheus';

const getTitle = (row: IRowValues): string => {
  if (row.hasOwnProperty('destination_version')) {
    return `Version: ${row['destination_version']}`;
  } else if (row.hasOwnProperty('pod')) {
    return `Pod: ${row['pod']}`;
  } else if (row.hasOwnProperty('destination_service')) {
    return `Destination: ${row['destination_service']}`;
  } else if (row.hasOwnProperty('source_workload') && row.hasOwnProperty('source_workload_namespace')) {
    return `Source: ${row['source_workload']} (${row['source_workload_namespace']})`;
  }

  return 'Details';
};

interface IDetailsMetricsProps {
  name: string;
  namespace: string;
  application: string;
  row: IRowValues;
  times: IPluginTimes;
  close: () => void;
}

const DetailsMetrics: React.FunctionComponent<IDetailsMetricsProps> = ({
  name,
  namespace,
  application,
  row,
  times,
  close,
}: IDetailsMetricsProps) => {
  return (
    <DrawerPanelContent minSize="50%">
      <DrawerHead>
        <Title title={getTitle(row)} subtitle={`${application} (${namespace})`} size="lg" />
        <DrawerActions style={{ padding: 0 }}>
          <DrawerCloseButton onClose={close} />
        </DrawerActions>
      </DrawerHead>

      <DrawerPanelBody>
        {row.hasOwnProperty('destination_version') ? (
          <div>
            <DetailsMetricsMetric
              name={name}
              title="Success Rate"
              metric="sr"
              unit="%"
              reporter="destination"
              destinationWorkload={application}
              destinationWorkloadNamespace={namespace}
              destinationVersion={row['destination_version']}
              destinationService=".*"
              sourceWorkload=".*"
              sourceWorkloadNamespace=".*"
              pod=".*"
              times={times}
            />
            <p>&nbsp;</p>
            <DetailsMetricsMetric
              name={name}
              title="Requests per Second"
              metric="rps"
              unit=""
              reporter="destination"
              destinationWorkload={application}
              destinationWorkloadNamespace={namespace}
              destinationVersion={row['destination_version']}
              destinationService=".*"
              sourceWorkload=".*"
              sourceWorkloadNamespace=".*"
              pod=".*"
              times={times}
            />
            <p>&nbsp;</p>
            <DetailsMetricsMetric
              name={name}
              title="Latency"
              metric="latency"
              unit="ms"
              reporter="destination"
              destinationWorkload={application}
              destinationWorkloadNamespace={namespace}
              destinationVersion={row['destination_version']}
              destinationService=".*"
              sourceWorkload=".*"
              sourceWorkloadNamespace=".*"
              pod=".*"
              times={times}
            />
            <p>&nbsp;</p>
          </div>
        ) : row.hasOwnProperty('pod') ? (
          <div>
            <DetailsMetricsMetric
              name={name}
              title="Success Rate"
              metric="sr"
              unit="%"
              reporter="destination"
              destinationWorkload={application}
              destinationWorkloadNamespace={namespace}
              destinationVersion=".*"
              destinationService=".*"
              sourceWorkload=".*"
              sourceWorkloadNamespace=".*"
              pod={row['pod']}
              times={times}
            />
            <p>&nbsp;</p>
            <DetailsMetricsMetric
              name={name}
              title="Requests per Second"
              metric="rps"
              unit=""
              reporter="destination"
              destinationWorkload={application}
              destinationWorkloadNamespace={namespace}
              destinationVersion=".*"
              destinationService=".*"
              sourceWorkload=".*"
              sourceWorkloadNamespace=".*"
              pod={row['pod']}
              times={times}
            />
            <p>&nbsp;</p>
            <DetailsMetricsMetric
              name={name}
              title="Latency"
              metric="latency"
              unit="ms"
              reporter="destination"
              destinationWorkload={application}
              destinationWorkloadNamespace={namespace}
              destinationVersion=".*"
              destinationService=".*"
              sourceWorkload=".*"
              sourceWorkloadNamespace=".*"
              pod={row['pod']}
              times={times}
            />
            <p>&nbsp;</p>

            <DetailsMetricsPod
              name={name}
              title="CPU Usage"
              metric="cpu"
              unit="Cores"
              namespace={namespace}
              pod={row['pod']}
              times={times}
            />
            <p>&nbsp;</p>
            <DetailsMetricsPod
              name={name}
              title="CPU Throttling"
              metric="throttling"
              unit="%"
              namespace={namespace}
              pod={row['pod']}
              times={times}
            />
            <p>&nbsp;</p>
            <DetailsMetricsPod
              name={name}
              title="Memory Usage"
              metric="memory"
              unit="MiB"
              namespace={namespace}
              pod={row['pod']}
              times={times}
            />
            <p>&nbsp;</p>
          </div>
        ) : row.hasOwnProperty('destination_service') ? (
          <div>
            <DetailsMetricsMetric
              name={name}
              title="Success Rate"
              metric="sr"
              unit="%"
              reporter="source"
              destinationWorkload=".*"
              destinationWorkloadNamespace=".*"
              destinationVersion=".*"
              destinationService={row['destination_service']}
              sourceWorkload={application}
              sourceWorkloadNamespace={namespace}
              pod=".*"
              times={times}
            />
            <p>&nbsp;</p>
            <DetailsMetricsMetric
              name={name}
              title="Requests per Second"
              metric="rps"
              unit=""
              reporter="source"
              destinationWorkload=".*"
              destinationWorkloadNamespace=".*"
              destinationVersion=".*"
              destinationService={row['destination_service']}
              sourceWorkload={application}
              sourceWorkloadNamespace={namespace}
              pod=".*"
              times={times}
            />
            <p>&nbsp;</p>
            <DetailsMetricsMetric
              name={name}
              title="Latency"
              metric="latency"
              unit="ms"
              reporter="source"
              destinationWorkload=".*"
              destinationWorkloadNamespace=".*"
              destinationVersion=".*"
              destinationService={row['destination_service']}
              sourceWorkload={application}
              sourceWorkloadNamespace={namespace}
              pod=".*"
              times={times}
            />
            <p>&nbsp;</p>
          </div>
        ) : row.hasOwnProperty('source_workload') && row.hasOwnProperty('source_workload_namespace') ? (
          <div>
            <DetailsMetricsMetric
              name={name}
              title="Success Rate"
              metric="sr"
              unit="%"
              reporter="destination"
              destinationWorkload={application}
              destinationWorkloadNamespace={namespace}
              destinationVersion=".*"
              destinationService=".*"
              sourceWorkload={row['source_workload']}
              sourceWorkloadNamespace={row['source_workload_namespace']}
              pod=".*"
              times={times}
            />
            <p>&nbsp;</p>
            <DetailsMetricsMetric
              name={name}
              title="Requests per Second"
              metric="rps"
              unit=""
              reporter="destination"
              destinationWorkload={application}
              destinationWorkloadNamespace={namespace}
              destinationVersion=".*"
              destinationService=".*"
              sourceWorkload={row['source_workload']}
              sourceWorkloadNamespace={row['source_workload_namespace']}
              pod=".*"
              times={times}
            />
            <p>&nbsp;</p>
            <DetailsMetricsMetric
              name={name}
              title="Latency"
              metric="latency"
              unit="ms"
              reporter="destination"
              destinationWorkload={application}
              destinationWorkloadNamespace={namespace}
              destinationVersion=".*"
              destinationService=".*"
              sourceWorkload={row['source_workload']}
              sourceWorkloadNamespace={row['source_workload_namespace']}
              pod=".*"
              times={times}
            />
            <p>&nbsp;</p>
          </div>
        ) : (
          <div>
            <DetailsMetricsMetric
              name={name}
              title="Success Rate"
              metric="sr"
              unit="%"
              reporter="destination"
              destinationWorkload={application}
              destinationWorkloadNamespace={namespace}
              destinationVersion=".*"
              destinationService=".*"
              sourceWorkload=".*"
              sourceWorkloadNamespace=".*"
              pod=".*"
              times={times}
            />
            <p>&nbsp;</p>
            <DetailsMetricsMetric
              name={name}
              title="Requests per Second"
              metric="rps"
              unit=""
              reporter="destination"
              destinationWorkload={application}
              destinationWorkloadNamespace={namespace}
              destinationVersion=".*"
              destinationService=".*"
              sourceWorkload=".*"
              sourceWorkloadNamespace=".*"
              pod=".*"
              times={times}
            />
            <p>&nbsp;</p>
            <DetailsMetricsMetric
              name={name}
              title="Latency"
              metric="latency"
              unit="ms"
              reporter="destination"
              destinationWorkload={application}
              destinationWorkloadNamespace={namespace}
              destinationVersion=".*"
              destinationService=".*"
              sourceWorkload=".*"
              sourceWorkloadNamespace=".*"
              pod=".*"
              times={times}
            />
            <p>&nbsp;</p>
          </div>
        )}
      </DrawerPanelBody>
    </DrawerPanelContent>
  );
};

export default DetailsMetrics;
