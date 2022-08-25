import React from 'react';

import { IPluginPanelProps, PluginPanelError } from '@kobsio/shared';
import AgentsPanel from './AgentsPanel';
import { IPanelOptions } from '../../utils/interfaces';
import OverviewPanel from './OverviewPanel';
import RequestsPanel from './RequestsPanel';

interface ISignalSciencesPluginPanelProps extends IPluginPanelProps {
  options?: IPanelOptions;
}

const Panel: React.FunctionComponent<ISignalSciencesPluginPanelProps> = ({
  title,
  description,
  options,
  instance,
  times,
  setDetails,
}: ISignalSciencesPluginPanelProps) => {
  if (options && options.type === 'requests' && options.siteName && options.query !== undefined && times) {
    return (
      <RequestsPanel
        title={title}
        description={description}
        instance={instance}
        siteName={options.siteName}
        query={options.query}
        times={times}
        setDetails={setDetails}
      />
    );
  }

  if (options && options.type === 'agents' && options.siteName && times) {
    return (
      <AgentsPanel
        title={title}
        description={description}
        instance={instance}
        siteName={options.siteName}
        times={times}
        setDetails={setDetails}
      />
    );
  }

  if (options && options.type === 'overview' && times) {
    return <OverviewPanel title={title} description={description} instance={instance} times={times} />;
  }

  return (
    <PluginPanelError
      title={title}
      description={description}
      message="Options for Signal Sciences panel are missing or invalid"
      details="The panel doesn't contain the required options to get data from Signal Sciences."
      documentation="https://kobs.io/main/plugins/signalsciences"
    />
  );
};

export default Panel;
