import React, { memo } from 'react';

import { IPluginPanelProps, PluginCard, PluginOptionsMissing } from '@kobsio/plugin-core';
import Alerts from './Alerts';
import AlertsActions from './AlertsActions';
import { IPanelOptions } from '../../utils/interfaces';
import Incidents from './Incidents';
import IncidentsActions from './IncidentsActions';

interface IPanelProps extends IPluginPanelProps {
  options?: IPanelOptions;
}

export const Panel: React.FunctionComponent<IPanelProps> = ({
  name,
  title,
  description,
  times,
  options,
  showDetails,
}: IPanelProps) => {
  if (!options || !times) {
    return (
      <PluginOptionsMissing
        title={title}
        message="Options for Opsgenie panel are missing or invalid"
        details="The panel doesn't contain the required options to render get the Opsgenie data or the provided options are invalid."
        documentation="https://kobs.io/plugins/opsgenie"
      />
    );
  }

  if (options.type === 'incidents') {
    return (
      <PluginCard
        title={title}
        description={description}
        transparent={true}
        actions={<IncidentsActions name={name} query={options.query || ''} times={times} type="incidents" />}
      >
        <Incidents
          name={name}
          query={options.query || ''}
          interval={options.interval}
          times={times}
          setDetails={showDetails}
        />
      </PluginCard>
    );
  }

  return (
    <PluginCard
      title={title}
      description={description}
      transparent={true}
      actions={<AlertsActions name={name} query={options.query || ''} times={times} type="alerts" />}
    >
      <Alerts
        name={name}
        query={options.query || ''}
        interval={options.interval}
        times={times}
        setDetails={showDetails}
      />
    </PluginCard>
  );
};

export default memo(Panel, (prevProps, nextProps) => {
  if (JSON.stringify(prevProps) === JSON.stringify(nextProps)) {
    return true;
  }

  return false;
});
