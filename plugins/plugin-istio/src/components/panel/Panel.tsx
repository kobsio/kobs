import React, { memo } from 'react';
import { useNavigate } from 'react-router-dom';

import { IPluginPanelProps, PluginPanel, PluginPanelError } from '@kobsio/shared';
import { IPanelOptions } from '../../utils/interfaces';
import { IRowValues } from '../../utils/prometheus/interfaces';
import MetricsTable from './MetricsTable';
import PanelActions from './PanelActions';
import Tap from './Tap';
import Top from './Top';
import Topology from './Topology';

interface IIstioPluginPanelProps extends IPluginPanelProps {
  options?: IPanelOptions;
}

export const Panel: React.FunctionComponent<IIstioPluginPanelProps> = ({
  title,
  description,
  times,
  options,
  instance,
  setDetails,
}: IIstioPluginPanelProps) => {
  const navigate = useNavigate();

  if (
    options &&
    options.type &&
    options.type === 'list' &&
    options.namespaces &&
    options.namespaces.length > 0 &&
    times
  ) {
    const namespaceParams = options.namespaces.map((namespace) => `&namespace=${namespace}`).join('');

    return (
      <PluginPanel
        title={title}
        description={description}
        actions={
          <PanelActions
            link={`/plugins/${instance.satellite}/${instance.type}/${instance.name}?time=${times.time}&timeEnd=${times.timeEnd}&timeStart=${times.timeStart}${namespaceParams}`}
          />
        }
      >
        <MetricsTable
          instance={instance}
          namespaces={options.namespaces}
          groupBy="destination_workload_namespace, destination_app"
          label="destination_workload"
          reporter="destination"
          times={times}
          goTo={(row: IRowValues): void =>
            navigate({
              pathname: `/plugins/${instance.satellite}/${instance.type}/${instance.name}/${row['destination_workload_namespace']}/${row['destination_app']}`,
            })
          }
        />
      </PluginPanel>
    );
  }

  if (
    options &&
    options.type &&
    options.type === 'metricsPods' &&
    options.namespaces &&
    options.namespaces.length === 1 &&
    options.application &&
    times
  ) {
    return (
      <PluginPanel
        title={title}
        description={description}
        actions={
          <PanelActions
            link={`/plugins/${instance.satellite}/${instance.type}/${instance.name}/${options.namespaces[0]}/${options.application}?timeEnd=${times.timeEnd}&timeStart=${times.timeStart}&view=metrics`}
          />
        }
      >
        <MetricsTable
          instance={instance}
          namespaces={options.namespaces}
          application={options.application}
          groupBy="destination_workload_namespace, destination_app, pod"
          label="pod"
          reporter="destination"
          additionalColumns={[{ label: 'pod', title: 'Pod' }]}
          times={times}
          setDetails={setDetails}
        />
      </PluginPanel>
    );
  }

  if (
    options &&
    options.type &&
    options.type === 'metricsVersions' &&
    options.namespaces &&
    options.namespaces.length === 1 &&
    options.application &&
    times
  ) {
    return (
      <PluginPanel
        title={title}
        description={description}
        actions={
          <PanelActions
            link={`/plugins/${instance.satellite}/${instance.type}/${instance.name}/${options.namespaces[0]}/${options.application}?timeEnd=${times.timeEnd}&timeStart=${times.timeStart}&view=metrics`}
          />
        }
      >
        <MetricsTable
          instance={instance}
          namespaces={options.namespaces}
          application={options.application}
          groupBy="destination_workload_namespace, destination_app, destination_version"
          label="destination_version"
          reporter="destination"
          times={times}
          additionalColumns={[{ label: 'destination_version', title: 'Version' }]}
          setDetails={setDetails}
        />
      </PluginPanel>
    );
  }

  if (
    options &&
    options.type &&
    options.type === 'metricsTopology' &&
    options.namespaces &&
    options.namespaces.length === 1 &&
    options.application &&
    times
  ) {
    return (
      <PluginPanel
        title={title}
        description={description}
        actions={
          <PanelActions
            link={`/plugins/${instance.satellite}/${instance.type}/${instance.name}/${options.namespaces[0]}/${options.application}?timeEnd=${times.timeEnd}&timeStart=${times.timeStart}&view=metrics`}
          />
        }
      >
        <Topology
          instance={instance}
          namespace={options.namespaces[0]}
          application={options.application}
          times={times}
          setDetails={setDetails}
        />
      </PluginPanel>
    );
  }

  if (
    options &&
    options.type &&
    options.type === 'top' &&
    options.namespaces &&
    options.namespaces.length === 1 &&
    options.application &&
    times
  ) {
    const filters = {
      method: options.filters && options.filters.method ? options.filters.method : '',
      path: options.filters && options.filters.path ? options.filters.path : '',
      upstreamCluster: options.filters && options.filters.upstreamCluster ? options.filters.upstreamCluster : '',
    };

    return (
      <PluginPanel
        title={title}
        description={description}
        actions={
          <PanelActions
            link={`/plugins/${instance.satellite}/${instance.type}/${instance.name}/${options.namespaces[0]}/${
              options.application
            }?timeEnd=${times.timeEnd}&timeStart=${times.timeStart}&view=top&filterUpstreamCluster=${encodeURIComponent(
              filters.upstreamCluster,
            )}&filterMethod=${encodeURIComponent(filters.method)}&filterPath=${encodeURIComponent(filters.path)}`}
          />
        }
      >
        <Top
          instance={instance}
          namespace={options.namespaces[0]}
          application={options.application}
          times={times}
          liveUpdate={false}
          filters={filters}
          setDetails={setDetails}
        />
      </PluginPanel>
    );
  }

  if (
    options &&
    options.type &&
    options.type === 'tap' &&
    options.namespaces &&
    options.namespaces.length === 1 &&
    options.application &&
    times
  ) {
    const filters = {
      method: options.filters && options.filters.method ? options.filters.method : '',
      path: options.filters && options.filters.path ? options.filters.path : '',
      upstreamCluster: options.filters && options.filters.upstreamCluster ? options.filters.upstreamCluster : '',
    };

    return (
      <PluginPanel
        title={title}
        description={description}
        actions={
          <PanelActions
            link={`/plugins/${instance.satellite}/${instance.type}/${instance.name}/${options.namespaces[0]}/${
              options.application
            }?timeEnd=${times.timeEnd}&timeStart=${times.timeStart}&view=tap&filterUpstreamCluster=${encodeURIComponent(
              filters.upstreamCluster,
            )}&filterMethod=${encodeURIComponent(filters.method)}&filterPath=${encodeURIComponent(filters.path)}`}
          />
        }
      >
        <Tap
          instance={instance}
          namespace={options.namespaces[0]}
          application={options.application}
          times={times}
          liveUpdate={false}
          filters={filters}
          setDetails={setDetails}
        />
      </PluginPanel>
    );
  }

  return (
    <PluginPanelError
      title={title}
      message="Options for Istio panel are missing or invalid"
      details="The panel doesn't contain the required options or the provided options are invalid to render the Istio plugin."
      documentation="https://kobs.io/plugins/istio"
    />
  );
};

export default memo(Panel, (prevProps, nextProps) => {
  if (JSON.stringify(prevProps) === JSON.stringify(nextProps)) {
    return true;
  }

  return false;
});
