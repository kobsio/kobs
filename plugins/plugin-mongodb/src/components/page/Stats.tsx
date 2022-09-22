import {
  Alert,
  AlertActionLink,
  AlertVariant,
  Card,
  CardBody,
  CardHeader,
  CardHeaderMain,
  CardTitle,
  Grid,
  GridItem,
  Spinner,
} from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from 'react-query';
import CollectionList from './CollectionList';
import { IPluginInstance } from '@kobsio/shared';
import { IStatsData } from '../../utils/interfaces';
import React from 'react';
import StatTable from './StatTable';
import { useNavigate } from 'react-router-dom';

interface IStatsProps {
  instance: IPluginInstance;
}

const Stats: React.FunctionComponent<IStatsProps> = ({ instance }: IStatsProps) => {
  const navigate = useNavigate();

  const { isError, isLoading, data, error, refetch } = useQuery<IStatsData, Error>(
    ['mongodb/stats', instance],
    async () => {
      try {
        const response = await fetch(`/api/plugins/mongodb/stats`, {
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
          // Go doesn't support HTTP status code 102 (processing) followed by another status code, so that the response
          // always returns 200 when it is running for more then 10 seconds. To be able to show errors we are checking
          // if the JSON response contains the error field and throwing the error also for 200 responses.
          // See: https://github.com/golang/go/issues/36734
          if (json.error) {
            throw new Error(json.error);
          }

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
    {
      keepPreviousData: true,
    },
  );

  if (isLoading) {
    return (
      <div className="pf-u-text-align-center">
        <Spinner />
      </div>
    );
  }

  if (isError) {
    return (
      <Alert
        variant={AlertVariant.danger}
        title="Could not get database statistics"
        actionLinks={
          <React.Fragment>
            <AlertActionLink onClick={(): void => navigate('/')}>Home</AlertActionLink>
            <AlertActionLink onClick={(): Promise<QueryObserverResult<IStatsData, Error>> => refetch()}>
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
    <Grid hasGutter={true}>
      <GridItem sm={12} md={12} lg={5} xl={3} xl2={3}>
        <Card>
          <CardHeader>
            <CardHeaderMain>
              <CardTitle>Database Collections</CardTitle>
            </CardHeaderMain>
          </CardHeader>
          <CardBody>
            <CollectionList instance={instance} />
          </CardBody>
        </Card>
      </GridItem>
      <GridItem sm={12} md={12} lg={5} xl={3} xl2={3}>
        <Card>
          <CardHeader>
            <CardHeaderMain>
              <CardTitle>Database Statistics</CardTitle>
            </CardHeaderMain>
          </CardHeader>
          <CardBody>
            <StatTable data={data} />
          </CardBody>
        </Card>
      </GridItem>
    </Grid>
  );
};

export default Stats;
