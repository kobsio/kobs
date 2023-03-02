import { Edit } from '@mui/icons-material';
import { Box, Button } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { FunctionComponent, useContext } from 'react';
import { Link, useParams } from 'react-router-dom';

import ApplicationLabels from './ApplicationLabels';

import { APIContext, APIError, IAPIContext } from '../../context/APIContext';
import { IApplication } from '../../crds/application';
import Dashboards from '../dashboards/Dashboards';
import { Page } from '../utils/Page';
import { UseQueryWrapper } from '../utils/UseQueryWrapper';

interface IApplicationParams extends Record<string, string | undefined> {
  cluster?: string;
  name?: string;
  namespace?: string;
}

/**
 * The `ApplicationPage` component is responsible for rendering the page for an application within a React Router route.
 * It loads the application with the provided `cluster`, `namespace` and `name`. If we are able to get the application
 * we show the application including it's dashboards. When we are not able to get the application we show an error.
 */
const ApplicationPage: FunctionComponent = () => {
  const params = useParams<IApplicationParams>();
  const apiContext = useContext<IAPIContext>(APIContext);

  const { isError, isLoading, error, data, refetch } = useQuery<IApplication, APIError>(
    ['core/applications/application', params.cluster, params.namespace, params.name],
    async () => {
      return apiContext.client.get<IApplication>(
        `/api/applications/application?id=${encodeURIComponent(
          `/cluster/${params.cluster}/namespace/${params.namespace}/name/${params.name}`,
        )}`,
      );
    },
  );

  return (
    <UseQueryWrapper
      error={error}
      errorTitle="Failed to load application"
      isError={isError}
      isLoading={isLoading}
      isNoData={!data}
      noDataTitle="Application not found"
      noDataMessage="The requested application was not found"
      refetch={refetch}
    >
      <Page
        title={data?.name ?? ''}
        subtitle={data?.topology && data?.topology.external === true ? '' : `(${data?.cluster} / ${data?.namespace})`}
        description={data?.description}
        toolbar={data ? <ApplicationLabels application={data} /> : undefined}
        hasTabs={true}
        actions={
          <Button variant="contained" color="primary" size="small" startIcon={<Edit />} component={Link} to="/todo">
            Edit Application
          </Button>
        }
      >
        {data?.dashboards && data.dashboards.length > 0 ? (
          <Dashboards manifest={data} references={data?.dashboards} />
        ) : null}
        <Box>TODO: Show Dashboards</Box>
      </Page>
    </UseQueryWrapper>
  );
};

export default ApplicationPage;
