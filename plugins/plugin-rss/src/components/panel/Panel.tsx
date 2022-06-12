import React from 'react';

import { IPluginPanelProps, PluginPanel, PluginPanelError } from '@kobsio/shared';
import Feed from './Feed';
import { IPanelOptions } from '../../utils/interfaces';

interface IRSSPluginPanelProps extends IPluginPanelProps {
  options?: IPanelOptions;
}

const Panel: React.FunctionComponent<IRSSPluginPanelProps> = ({
  title,
  description,
  options,
  instance,
  setDetails,
}: IRSSPluginPanelProps) => {
  if (options && options.urls && Array.isArray(options.urls) && options.urls.length > 0) {
    return (
      <PluginPanel title={title} description={description}>
        <Feed instance={instance} urls={options.urls} sortBy={options.sortBy || 'published'} setDetails={setDetails} />
      </PluginPanel>
    );
  }

  return (
    <PluginPanelError
      title={title}
      description={description}
      message="Options for RSS panel are missing or invalid"
      details="The panel doesn't contain the required options to get the items from an RSS feed."
      documentation="https://kobs.io/main/plugins/rss"
    />
  );
};

export default Panel;
