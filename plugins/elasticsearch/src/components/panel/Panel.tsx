import React, { memo } from 'react';

import { IPluginPanelProps, PluginOptionsMissing } from '@kobsio/plugin-core';
import { IPanelOptions } from '../../utils/interfaces';
import Logs from './Logs';

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
  if (!options || !options.query || !times) {
    return (
      <PluginOptionsMissing
        title={title}
        message="Options for Elasticsearch panel are missing or invalid"
        details="The panel doesn't contain the required options to render get the Elasticsearch data or the provided options are invalid."
        documentation="https://kobs.io/plugins/elasticsearch"
      />
    );
  }

  return (
    <Logs
      name={name}
      title={title}
      description={description}
      fields={options.fields}
      query={options.query}
      showChart={options.showChart || false}
      times={times}
      showDetails={showDetails}
    />
  );
};

export default memo(Panel, (prevProps, nextProps) => {
  if (JSON.stringify(prevProps) === JSON.stringify(nextProps)) {
    return true;
  }

  return false;
});
