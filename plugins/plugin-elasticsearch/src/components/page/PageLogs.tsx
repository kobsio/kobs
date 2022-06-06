import {
  Alert,
  AlertActionLink,
  AlertVariant,
  Card,
  CardActions,
  CardBody,
  CardHeader,
  CardHeaderMain,
  CardTitle,
  Grid,
  GridItem,
  Spinner,
} from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from 'react-query';
import React from 'react';
import { useNavigate } from 'react-router-dom';

import { IPluginInstance, ITimes } from '@kobsio/shared';
import { ILogsData } from '../../utils/interfaces';
import LogsChart from '../panel/LogsChart';
import LogsDocuments from '../panel/LogsDocuments';
import PageLogsFields from './PageLogsFields';
import { getFields } from '../../utils/helpers';

interface IPageLogsProps {
  instance: IPluginInstance;
  fields?: string[];
  query: string;
  addFilter: (filter: string) => void;
  changeTime: (times: ITimes) => void;
  selectField: (field: string) => void;
  times: ITimes;
}

const PageLogs: React.FunctionComponent<IPageLogsProps> = ({
  instance,
  fields,
  query,
  addFilter,
  changeTime,
  selectField,
  times,
}: IPageLogsProps) => {
  const navigate = useNavigate();

  const { isError, isFetching, isLoading, data, error, refetch } = useQuery<ILogsData, Error>(
    ['elasticsearch/logs', instance, query, times],
    async () => {
      try {
        const response = await fetch(
          `/api/plugins/elasticsearch/logs?query=${query}&timeStart=${times.timeStart}&timeEnd=${times.timeEnd}`,
          {
            headers: {
              // eslint-disable-next-line @typescript-eslint/naming-convention
              'x-kobs-plugin': instance.name,
              // eslint-disable-next-line @typescript-eslint/naming-convention
              'x-kobs-satellite': instance.satellite,
            },
            method: 'get',
          },
        );
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
        title="Could not get logs"
        actionLinks={
          <React.Fragment>
            <AlertActionLink onClick={(): void => navigate('/')}>Home</AlertActionLink>
            <AlertActionLink onClick={(): Promise<QueryObserverResult<ILogsData, Error>> => refetch()}>
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
      <GridItem sm={12} md={12} lg={3} xl={2} xl2={2}>
        <Card>
          <PageLogsFields fields={getFields(data.documents)} selectField={selectField} selectedFields={fields} />
        </Card>
      </GridItem>
      <GridItem sm={12} md={12} lg={9} xl={10} xl2={10}>
        <Card isCompact={true}>
          <CardHeader>
            <CardHeaderMain>
              <CardTitle>
                {data.hits} Documents in {data.took} Milliseconds
              </CardTitle>
            </CardHeaderMain>
            <CardActions>{isFetching && <Spinner size="md" />}</CardActions>
          </CardHeader>

          <CardBody>
            <LogsChart buckets={data.buckets} changeTime={changeTime} />
          </CardBody>
        </Card>

        <p>&nbsp;</p>

        {data.documents.length > 0 ? (
          <Card isCompact={true} style={{ maxWidth: '100%', overflowX: 'scroll' }}>
            <CardBody>
              <LogsDocuments
                documents={data.documents}
                fields={fields}
                addFilter={addFilter}
                selectField={selectField}
              />
            </CardBody>
          </Card>
        ) : null}
      </GridItem>
    </Grid>
  );
};

export default PageLogs;
