import {
  Alert,
  AlertActionLink,
  AlertVariant,
  Button,
  ButtonVariant,
  Card,
  CardBody,
  CardTitle,
  Grid,
  GridItem,
  Spinner,
} from '@patternfly/react-core';
import { InfiniteData, InfiniteQueryObserverResult, QueryObserverResult, useInfiniteQuery } from 'react-query';
import React from 'react';
import { useHistory } from 'react-router-dom';

import { ILogsData } from '../../utils/interfaces';
import { IPluginTimes } from '@kobsio/plugin-core';
import LogsChart from '../panel/LogsChart';
import LogsDocuments from '../panel/LogsDocuments';
import PageLogsFields from './PageLogsFields';
import { getFields } from '../../utils/helpers';

interface IPageLogsProps {
  name: string;
  fields?: string[];
  query: string;
  selectField: (field: string) => void;
  times: IPluginTimes;
  showDetails: (details: React.ReactNode) => void;
}

const PageLogs: React.FunctionComponent<IPageLogsProps> = ({
  name,
  fields,
  query,
  selectField,
  times,
  showDetails,
}: IPageLogsProps) => {
  const history = useHistory();

  const { isError, isFetching, isLoading, data, error, fetchNextPage, refetch } = useInfiniteQuery<ILogsData, Error>(
    ['elasticsearch/logs', query, times],
    async ({ pageParam }) => {
      try {
        const response = await fetch(
          `/api/plugins/elasticsearch/logs/${name}?query=${query}&timeStart=${times.timeStart}&timeEnd=${
            times.timeEnd
          }&scrollID=${pageParam || ''}`,
          {
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
      getNextPageParam: (lastPage, pages) => lastPage.scrollID,
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
            <AlertActionLink onClick={(): void => history.push('/')}>Home</AlertActionLink>
            <AlertActionLink onClick={(): Promise<QueryObserverResult<InfiniteData<ILogsData>, Error>> => refetch()}>
              Retry
            </AlertActionLink>
          </React.Fragment>
        }
      >
        <p>{error?.message}</p>
      </Alert>
    );
  }

  if (!data || data.pages.length === 0) {
    return null;
  }

  return (
    <Grid hasGutter={true}>
      <GridItem sm={12} md={12} lg={3} xl={2} xl2={2}>
        <Card>
          <PageLogsFields
            fields={getFields(data.pages[0].documents)}
            selectField={selectField}
            selectedFields={fields}
          />
        </Card>
      </GridItem>
      <GridItem sm={12} md={12} lg={9} xl={10} xl2={10}>
        <Card isCompact={true}>
          <CardTitle className="pf-u-text-align-center">
            {data.pages[0].hits} Documents in {data.pages[0].took} Milliseconds
          </CardTitle>
          <CardBody>
            <LogsChart buckets={data.pages[0].buckets} />
          </CardBody>
        </Card>
        <p>&nbsp;</p>
        {data.pages[0].documents.length > 0 ? (
          <Card isCompact={true} style={{ maxWidth: '100%', overflowX: 'scroll' }}>
            <CardBody>
              <LogsDocuments pages={data.pages} fields={fields} showDetails={showDetails} />
            </CardBody>
          </Card>
        ) : null}
        <p>&nbsp;</p>
        {data.pages[0].documents.length > 0 ? (
          <Card isCompact={true}>
            <CardBody>
              <Button
                variant={ButtonVariant.primary}
                isBlock={true}
                isDisabled={isFetching}
                isLoading={isFetching}
                onClick={(): Promise<InfiniteQueryObserverResult<ILogsData, Error>> => fetchNextPage()}
              >
                Load more
              </Button>
            </CardBody>
          </Card>
        ) : null}
      </GridItem>
      <p>&nbsp;</p>
    </Grid>
  );
};

export default PageLogs;
