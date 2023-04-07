import {
  APIContext,
  APIError,
  IAPIContext,
  IPluginInstance,
  IPluginPanelProps,
  ITimes,
  PluginPanel,
  PluginPanelActionLinks,
  PluginPanelError,
  UseQueryWrapper,
  pluginBasePath,
} from '@kobsio/core';
import { Card, Grid } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { FunctionComponent, useContext, useState } from 'react';

import { Markdown } from './Markdown';
import { ServiceMarkdown } from './ServiceMarkdown';
import { Services } from './Services';
import { TableOfContents } from './TableOfContents';

import { IIndex } from '../utils/utils';

/**
 * `IOptions` is the interface which defines the options, which can be set by a user when the TechDocs plugin is used
 * within a dashboard.
 */
interface IOptions {
  markdown?: string;
  service?: string;
  type?: string;
}

/**
 * The `ServiceTableOfContentsPanel` component can be used to render the table of contents for a gievn service. The
 * component is responsible for fetching the data from the backend and to render the `TableOfContents` component.
 */
const ServiceTableOfContentsPanel: FunctionComponent<{ instance: IPluginInstance; service: string }> = ({
  instance,
  service,
}) => {
  const apiContext = useContext<IAPIContext>(APIContext);

  const { isError, isLoading, error, data, refetch } = useQuery<IIndex, APIError>(
    ['techdocs/index', instance, service],
    async () => {
      return apiContext.client.get<IIndex>(`/api/plugins/techdocs/index?service=${service}`, {
        headers: {
          'x-kobs-cluster': instance.cluster,
          'x-kobs-plugin': instance.name,
        },
      });
    },
  );

  return (
    <UseQueryWrapper
      error={error}
      errorTitle="Failed to load service"
      isError={isError}
      isLoading={isLoading}
      isNoData={!data}
      noDataTitle="No service was found"
      refetch={refetch}
    >
      {data && <TableOfContents instance={instance} service={data.key} toc={data.toc} />}
    </UseQueryWrapper>
  );
};

/**
 * The `ServiceMarkdownPanel` component can be used to render the markdown content for a given service. The component is
 * responsible for fetching the data from the backend and to render the `Markdown` component.
 */
const ServiceMarkdownPanel: FunctionComponent<{
  instance: IPluginInstance;
  service: string;
  setTimes: (times: ITimes) => void;
  times: ITimes;
}> = ({ instance, service, times, setTimes }) => {
  const apiContext = useContext<IAPIContext>(APIContext);
  const [path, setPath] = useState<string>('');

  const { isError, isLoading, error, data, refetch } = useQuery<IIndex, APIError>(
    ['techdocs/index', instance, service],
    async () => {
      return apiContext.client.get<IIndex>(`/api/plugins/techdocs/index?service=${service}`, {
        headers: {
          'x-kobs-cluster': instance.cluster,
          'x-kobs-plugin': instance.name,
        },
      });
    },
  );

  return (
    <UseQueryWrapper
      error={error}
      errorTitle="Failed to load service"
      isError={isError}
      isLoading={isLoading}
      isNoData={!data}
      noDataTitle="No service was found"
      refetch={refetch}
    >
      {data && (
        <Grid container={true} spacing={6}>
          <Grid item={true} xs={12} lg={3} xl={2}>
            <Card>
              <TableOfContents instance={instance} service={data.key} toc={data.toc} setPath={setPath} />
            </Card>
          </Grid>

          <Grid item={true} xs={12} lg={9} xl={10}>
            <ServiceMarkdown
              instance={instance}
              service={service}
              path={path || data.home}
              setPath={setPath}
              times={times}
              setTimes={setTimes}
            />
          </Grid>
        </Grid>
      )}
    </UseQueryWrapper>
  );
};

/**
 * The `TechDocsPanel` component renders the panel for the TechDocs plugin, when the plugin is used within a dashboard.
 * Based on the user provided options the component mounts different panels, if the options are invalid, the component
 * renders an error.
 */
const TechDocsPanel: FunctionComponent<IPluginPanelProps<IOptions>> = ({
  title,
  description,
  options,
  instance,
  times,
  setTimes,
}) => {
  if (options && options.type === 'services') {
    return (
      <PluginPanel
        title={title}
        description={description}
        actions={<PluginPanelActionLinks links={[{ link: pluginBasePath(instance), title: 'View TechDocs' }]} />}
      >
        <Services instance={instance} />
      </PluginPanel>
    );
  }

  if (options && options.type === 'service-toc' && options.service) {
    return (
      <PluginPanel
        title={title}
        description={description}
        actions={
          <PluginPanelActionLinks
            links={[{ link: `${pluginBasePath(instance)}/${options.service}`, title: 'View TechDocs' }]}
          />
        }
      >
        <ServiceTableOfContentsPanel instance={instance} service={options.service} />
      </PluginPanel>
    );
  }

  if (options && options.type === 'service-markdown' && options.service) {
    return <ServiceMarkdownPanel instance={instance} service={options.service} times={times} setTimes={setTimes} />;
  }

  if (options && options.type === 'markdown' && options.markdown) {
    return (
      <PluginPanel title={title} description={description}>
        <Markdown markdown={options.markdown} times={times} setTimes={setTimes} />
      </PluginPanel>
    );
  }

  return (
    <PluginPanelError
      title={title}
      description={description}
      message="Invalid options for TechDocs plugin"
      details="One of the required options is missing."
      example={`plugin:
  name: techdocs
  type: techdocs
  options:
    # The type must be
    #   - 'services' to show a list of all services for the TechDocs instance
    #   - 'services-toc' to show the table of contents for a given service
    #   - 'service-markdown': to show the TechDocs for the given service
    #   - 'markdown': to render the provided markdown
    type: service-markdown
    service: kobs`}
      documentation="https://kobs.io/main/plugins/techdocs"
    />
  );
};

export default TechDocsPanel;
