import {
  Alert,
  AlertActionLink,
  AlertVariant,
  Drawer,
  DrawerContent,
  DrawerContentBody,
  PageSection,
  PageSectionVariants,
  Spinner,
} from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from 'react-query';
import React, { useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';

import { IIndex } from '../../utils/interfaces';
import ServicePageWrapper from './ServicePageWrapper';
import { Title } from '@kobsio/plugin-core';

interface IServicePagePropsParams {
  service: string;
  path?: string;
}

interface IServicePageProps {
  name: string;
}

const ServicePage: React.FunctionComponent<IServicePageProps> = ({ name }: IServicePageProps) => {
  const history = useHistory();
  const params = useParams<IServicePagePropsParams>();
  const [details, setDetails] = useState<React.ReactNode>(undefined);

  const { isError, isLoading, error, data, refetch } = useQuery<IIndex, Error>(
    ['techdocs/index', name, params.service],
    async () => {
      try {
        const response = await fetch(`/api/plugins/techdocs/${name}/index?service=${params.service}`, {
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
        title="Could not get application"
        actionLinks={
          <React.Fragment>
            <AlertActionLink onClick={(): void => history.push('/')}>Home</AlertActionLink>
            <AlertActionLink onClick={(): void => history.push(`/${name}`)}>TechDocs Overview</AlertActionLink>
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
      <PageSection variant={PageSectionVariants.light}>
        <Title title={data.name} subtitle={data.key} size="xl" />
        <div>
          <p>{data.description}</p>
        </div>
      </PageSection>

      <Drawer isExpanded={details !== undefined}>
        <DrawerContent panelContent={details}>
          <DrawerContentBody>
            <ServicePageWrapper
              name={name}
              index={data}
              path={params.path ? params.path : data.home}
              setDetails={setDetails}
            />
          </DrawerContentBody>
        </DrawerContent>
      </Drawer>
    </React.Fragment>
  );
};

export default ServicePage;
