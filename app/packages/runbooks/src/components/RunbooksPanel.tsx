import { IPluginPanelProps, PluginPanel, PluginPanelError } from '@kobsio/core';
import { FunctionComponent, useState } from 'react';

import { Runbook } from './DetailsPage';
import { Runbooks } from './ListPage';

import { example } from '../utils/utils';

interface IOptions {
  alert: string;
  group: string;
  query: string;
  type: string;
}

const RunbooksPanel: FunctionComponent<IPluginPanelProps<IOptions>> = ({
  title,
  description,
  options,
  instance,
  times,
  setTimes,
}) => {
  const [page, setPage] = useState<{ page: number; perPage: number }>({
    page: 1,
    perPage: 10,
  });

  if (options && options.type === 'list' && (options.query || options.group || options.alert)) {
    return (
      <PluginPanel title={title} description={description}>
        <Runbooks
          instance={instance}
          options={{ ...options, ...page }}
          times={times}
          setPage={(page, perPage) => setPage({ page: page, perPage: perPage })}
        />
      </PluginPanel>
    );
  }

  if (options && options.type === 'details' && options.group && options.alert) {
    return (
      <PluginPanel title={title} description={description}>
        <Runbook
          instance={instance}
          alert={options.alert}
          group={options.group}
          times={times}
          setTimes={setTimes}
          showActions={true}
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
