import {
  APIContext,
  APIError,
  IAPIContext,
  IPluginInstance,
  ITimes,
  UseQueryWrapper,
  useQueryState,
} from '@kobsio/core';
import { Page } from '@kobsio/core';
import { IPluginPageProps } from '@kobsio/core';
import { Card, Grid } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { FunctionComponent, useContext, useState } from 'react';
import { Route, Routes, useParams } from 'react-router-dom';

import { ServiceMarkdown } from './ServiceMarkdown';
import { Services } from './Services';
import { TableOfContents } from './TableOfContents';

import { IIndex, description } from '../utils/utils';

interface IServicePageParams extends Record<string, string | undefined> {
  service: string;
}

const ServicesPage: FunctionComponent<{ instance: IPluginInstance }> = ({ instance }) => {
  return (
    <Page
      title={instance.name}
      subtitle={`(${instance.cluster} / ${instance.type})`}
      description={instance.description || description}
    >
      <Services instance={instance} />
    </Page>
  );
};

const ServicePage: FunctionComponent<{ instance: IPluginInstance }> = ({ instance }) => {
  const apiContext = useContext<IAPIContext>(APIContext);
  const params = useParams<IServicePageParams>();
  const [options] = useQueryState<{ path: string }>({ path: '' });
  const [times, setTimes] = useState<ITimes>({
    time: 'last15Minutes',
    timeEnd: Math.floor(Date.now() / 1000),
    timeStart: Math.floor(Date.now() / 1000) - 900,
  });

  const { isError, isLoading, error, data, refetch } = useQuery<IIndex, APIError>(
    ['techdocs/index', instance, params.service],
    async () => {
      return apiContext.client.get<IIndex>(`/api/plugins/techdocs/index?service=${params.service}`, {
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
      {params.service && data && (
        <Page title={data.name} subtitle={`(${data.key})`} description={data.description}>
          <Grid container={true} spacing={6}>
            <Grid item={true} xs={12} lg={3} xl={2}>
              <Card>
                <TableOfContents instance={instance} service={data.key} toc={data.toc} />
              </Card>
            </Grid>

            <Grid item={true} xs={12} lg={9} xl={10}>
              <ServiceMarkdown
                instance={instance}
                service={data.key}
                path={options.path || data.home}
                times={times}
                setTimes={setTimes}
              />
            </Grid>
          </Grid>
        </Page>
      )}
    </UseQueryWrapper>
  );
};

const TechDocsPage: FunctionComponent<IPluginPageProps> = ({ instance }) => {
  return (
    <Routes>
      <Route path="/" element={<ServicesPage instance={instance} />} />
      <Route path="/:service" element={<ServicePage instance={instance} />} />
    </Routes>
  );
};

export default TechDocsPage;
