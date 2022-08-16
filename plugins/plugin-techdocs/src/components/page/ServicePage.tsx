import { Alert, AlertActionLink, AlertVariant, Spinner } from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from '@tanstack/react-query';
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import {
  IPluginInstance,
  PageContentSection,
  PageHeaderSection,
  PluginPageTitle,
  pluginBasePath,
} from '@kobsio/shared';
import { IIndex } from '../../utils/interfaces';
import ServicePageWrapper from './ServicePageWrapper';

interface IServicePagePropsParams extends Record<string, string | undefined> {
  service: string;
  path?: string;
}

interface IServicePageProps {
  instance: IPluginInstance;
}

const ServicePage: React.FunctionComponent<IServicePageProps> = ({ instance }: IServicePageProps) => {
  const navigate = useNavigate();
  const params = useParams<IServicePagePropsParams>();
  const [details, setDetails] = useState<React.ReactNode>(undefined);

  const { isError, isLoading, error, data, refetch } = useQuery<IIndex, Error>(
    ['techdocs/index', instance, params.service],
    async () => {
      try {
        const response = await fetch(`/api/plugins/techdocs/index?service=${params.service}`, {
          headers: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            'x-kobs-plugin': instance.name,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            'x-kobs-satellite': instance.satellite,
          },
          method: 'get',
        });
        const json = await response.json();

        if (response.status >= 200 && response.status < 300) {
          return json;
        } else {
          if (json.error) {
            throw new Error(json.error);
          } else {
            throw new Error('An unknown error occured');
          }
        }
      } catch (err) {
        throw err;
      }
    },
  );

  if (isLoading) {
    return <Spinner style={{ left: '50%', position: 'fixed', top: '50%', transform: 'translate(-50%, -50%)' }} />;
  }

  if (isError) {
    return (
      <Alert
        style={{ left: '50%', position: 'fixed', top: '50%', transform: 'translate(-50%, -50%)' }}
        variant={AlertVariant.danger}
        title="Could not get TechDocs"
        actionLinks={
          <React.Fragment>
            <AlertActionLink onClick={(): void => navigate('/')}>Home</AlertActionLink>
            <AlertActionLink onClick={(): void => navigate(`${pluginBasePath(instance)}`)}>
              TechDocs Overview
            </AlertActionLink>
            <AlertActionLink onClick={(): Promise<QueryObserverResult<IIndex, Error>> => refetch()}>
              Retry
            </AlertActionLink>
          </React.Fragment>
        }
      >
        <p>{error?.message}</p>
      </Alert>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <React.Fragment>
      <PageHeaderSection
        component={<PluginPageTitle satellite={data.key} name={data.name} description={data.description} />}
      />

      <PageContentSection hasPadding={true} hasDivider={true} toolbarContent={undefined} panelContent={details}>
        <ServicePageWrapper
          instance={instance}
          index={data}
          path={params.path ? params.path : data.home}
          setDetails={setDetails}
        />
      </PageContentSection>
    </React.Fragment>
  );
};

export default ServicePage;
