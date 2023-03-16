import { IPluginPanelProps, PluginPanel, PluginPanelError } from '@kobsio/core';
import { FunctionComponent } from 'react';

import Feed from './Feed';

interface IOptions {
  sortBy?: string;
  urls?: string[];
}

const RSSPanel: FunctionComponent<IPluginPanelProps<IOptions>> = ({ title, description, options, instance, times }) => {
  if (options && options.urls && Array.isArray(options.urls) && options.urls.length > 0) {
    return (
      <PluginPanel title={title} description={description}>
        <Feed instance={instance} urls={options.urls} sortBy={options.sortBy ?? ''} times={times} />
      </PluginPanel>
    );
  }

  return (
    <PluginPanelError
      title={title}
      description={description}
      message="Invalid options for RSS plugin"
      details="One of the required options is missing."
      example={`plugin:
  name: rss
  type: rss
  options:
    urls:
      - https://www.githubstatus.com/history.rss`}
      documentation="https://kobs.io/main/plugins/rss"
    />
  );
};

export default RSSPanel;
