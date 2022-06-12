import React from 'react';

import { IPluginPanelProps, PluginPanel, PluginPanelError } from '@kobsio/shared';
import Alerts from './Alerts';
import AlertsActions from './AlertsActions';
import AlertsWrapper from './AlertsWrapper';
import { IPanelOptions } from '../../utils/interfaces';
import Incidents from './Incidents';
import IncidentsActions from './IncidentsActions';
import IncidentsWrapper from './IncidentsWrapper';

interface IOpsgeniePluginPanelProps extends IPluginPanelProps {
  options?: IPanelOptions;
}

const Panel: React.FunctionComponent<IOpsgeniePluginPanelProps> = ({
  title,
  description,
  options,
  instance,
  times,
  setDetails,
}: IOpsgeniePluginPanelProps) => {
  if (options && times) {
    if (options.type === 'incidents') {
      return (
        <PluginPanel
          title={title}
          description={description}
          actions={
            <IncidentsActions
              instance={instance}
              queries={options.query ? [options.query] : []}
              times={times}
              type="incidents"
              interval={options.interval}
            />
          }
        >
          <Incidents
            instance={instance}
            query={options.query || ''}
            interval={options.interval}
            times={times}
            setDetails={setDetails}
          />
        </PluginPanel>
      );
    }

    if (
      options.type === 'incidents' &&
      options.queries &&
      Array.isArray(options.queries) &&
      options.queries.length > 0
    ) {
      return (
        <PluginPanel
          title={title}
          description={description}
          actions={
            <AlertsActions
              instance={instance}
              queries={options.queries}
              times={times}
              type="alerts"
              interval={options.interval}
            />
          }
        >
          <IncidentsWrapper
            instance={instance}
            queries={options.queries}
            interval={options.interval}
            times={times}
            setDetails={setDetails}
          />
        </PluginPanel>
      );
    }

    if (options.type === 'alerts' && options.query) {
      return (
        <PluginPanel
          title={title}
          description={description}
          actions={
            <AlertsActions
              instance={instance}
              queries={options.query ? [options.query] : []}
              times={times}
              type="alerts"
              interval={options.interval}
            />
          }
        >
          <Alerts
            instance={instance}
            query={options.query || ''}
            interval={options.interval}
            times={times}
            setDetails={setDetails}
          />
        </PluginPanel>
      );
    }

    if (options.type === 'alerts' && options.queries && Array.isArray(options.queries) && options.queries.length > 0) {
      return (
        <PluginPanel
          title={title}
          description={description}
          actions={
            <AlertsActions
              instance={instance}
              queries={options.queries}
              times={times}
              type="alerts"
              interval={options.interval}
            />
          }
        >
          <AlertsWrapper
            instance={instance}
            queries={options.queries}
            interval={options.interval}
            times={times}
            setDetails={setDetails}
          />
        </PluginPanel>
      );
    }
  }

  return (
    <PluginPanelError
      title={title}
      description={description}
      message="Options for Opsgenie panel are missing or invalid"
      details="The panel doesn't contain the required options to get alerts / incidents from the Opsgenie API."
      documentation="https://kobs.io/main/plugins/opsgenie"
    />
  );
};

export default Panel;
