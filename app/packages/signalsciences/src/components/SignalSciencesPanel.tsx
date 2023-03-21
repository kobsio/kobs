import {
  IPluginInstance,
  IPluginPanelProps,
  ITimes,
  pluginBasePath,
  PluginPanel,
  PluginPanelActionLinks,
  PluginPanelError,
} from '@kobsio/core';
import { FunctionComponent, useState } from 'react';

import Agents from './Agents';
import Overview from './Overview';
import Requests from './Requests';

interface IOptions {
  query?: string;
  site?: string;
  type?: string;
}

const RequestsPanel: FunctionComponent<{
  instance: IPluginInstance;
  query: string;
  site: string;
  times: ITimes;
}> = ({ instance, query, site, times }) => {
  const [page, setPage] = useState<{ page: number; perPage: number }>({ page: 1, perPage: 10 });

  return (
    <Requests
      instance={instance}
      site={site}
      query={query}
      times={times}
      page={page.page}
      perPage={page.perPage}
      setPage={(page, perPage) => setPage({ page: page, perPage: perPage })}
    />
  );
};

const SignalSciencesPanel: FunctionComponent<IPluginPanelProps<IOptions>> = ({
  title,
  description,
  options,
  instance,
  times,
}) => {
  if (options && options.type && options.type === 'overview') {
    return (
      <PluginPanel
        title={title}
        description={description}
        actions={
          <PluginPanelActionLinks
            links={[
              {
                link: `${pluginBasePath(instance)}`,
                title: 'Explore',
              },
            ]}
          />
        }
      >
        <Overview instance={instance} times={times} />;
      </PluginPanel>
    );
  }

  if (options && options.type && options.type === 'agents' && options.site) {
    return (
      <PluginPanel
        title={title}
        description={description}
        actions={
          <PluginPanelActionLinks
            links={[
              {
                link: `${pluginBasePath(instance)}/agents?site=${options.site}`,
                title: 'Explore',
              },
            ]}
          />
        }
      >
        <Agents instance={instance} site={options.site} times={times} />
      </PluginPanel>
    );
  }

  if (options && options.type && options.type === 'requests' && options.site) {
    return (
      <PluginPanel
        title={title}
        description={description}
        actions={
          <PluginPanelActionLinks
            links={[
              {
                link: `${pluginBasePath(instance)}/requests?site=${options.site}&query=${options.query ?? ''}`,
                title: 'Explore',
              },
            ]}
          />
        }
      >
        <RequestsPanel instance={instance} site={options.site} query={options.query ?? ''} times={times} />
      </PluginPanel>
    );
  }

  return (
    <PluginPanelError
      title={title}
      description={description}
      message="Invalid options for SignalSciences plugin"
      details="One of the required options is missing."
      example={`plugin:
  name: signalsciences
  type: signalsciences
  options:
    # The type must be "overview", "requests" or "agents".
    #   - If the "type" is "requests" you must provide a "site" and "query".
    #   - If the "type" is "agents" a "site" must be provided.
    type: requests
    site: mysite
    query: "agentcode:=406"`}
      documentation="https://kobs.io/main/plugins/signalsciences"
    />
  );
};

export default SignalSciencesPanel;
