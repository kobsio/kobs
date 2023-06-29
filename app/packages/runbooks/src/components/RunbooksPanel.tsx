import { IPluginPanelProps, PluginPanel, PluginPanelError } from '@kobsio/core';
import { FunctionComponent, useState } from 'react';

import { Runbooks } from './RunbooksPage';

import { example } from '../utils/utils';

interface IOptions {
  alert: string;
  group: string;
  query: string;
}

const RunbooksPanel: FunctionComponent<IPluginPanelProps<IOptions>> = ({ title, description, options, instance }) => {
  const [page, setPage] = useState<{ page: number; perPage: number }>({
    page: 1,
    perPage: 10,
  });

  if (options && (options.query || options.group || options.alert)) {
    return (
      <PluginPanel title={title} description={description}>
        <Runbooks
          instance={instance}
          options={{ ...options, ...page }}
          setPage={(page, perPage) => setPage({ page: page, perPage: perPage })}
        />
      </PluginPanel>
    );
  }

  return (
    <PluginPanelError
      title={title}
      description={description}
      message="Invalid options for Runbooks plugin"
      details="One of the required options is missing."
      example={example}
      documentation="https://kobs.io/main/plugins/runbooks"
    />
  );
};

export default RunbooksPanel;
