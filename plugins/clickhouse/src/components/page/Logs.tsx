import {
  Alert,
  AlertActionLink,
  AlertVariant,
  Button,
  ButtonVariant,
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
import { InfiniteData, InfiniteQueryObserverResult, QueryObserverResult, useInfiniteQuery } from 'react-query';
import React from 'react';
import { useHistory } from 'react-router-dom';

import { ILogsData } from '../../utils/interfaces';
import { IPluginTimes } from '@kobsio/plugin-core';
import LogsChart from '../panel/LogsChart';
import LogsDocuments from '../panel/LogsDocuments';
import LogsFields from './LogsFields';

interface IPageLogsProps {
  name: string;
  fields?: string[];
  order: string;
  orderBy: string;
  query: string;
  selectField: (field: string) => void;
  times: IPluginTimes;
}

const PageLogs: React.FunctionComponent<IPageLogsProps> = ({
  name,
  fields,
  order,
  orderBy,
  query,
  selectField,
  times,
}: IPageLogsProps) => {
  const history = useHistory();

  const { isError, isFetching, isLoading, data, error, fetchNextPage, refetch } = useInfiniteQuery<ILogsData, Error>(
    ['clickhouse/logs', query, order, orderBy, times],
    async ({ pageParam }) => {
      try {
        const response = await fetch(
          `/api/plugins/clickhouse/logs/${name}?query=${encodeURIComponent(
            query,
          )}&order=${order}&orderBy=${encodeURIComponent(orderBy)}&timeStart=${
            pageParam && pageParam.timeStart ? pageParam.timeStart : times.timeStart
          }&timeEnd=${times.timeEnd}&limit=100&offset=${pageParam && pageParam.offset ? pageParam.offset : ''}`,
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
      getNextPageParam: (lastPage, pages) => {
        return { offset: lastPage.offset, timeStart: lastPage.timeStart };
      },
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
          <LogsFields fields={data.pages[0].fields} selectField={selectField} selectedFields={fields} />
        </Card>
      </GridItem>
      <GridItem sm={12} md={12} lg={9} xl={10} xl2={10}>
        <Card isCompact={true}>
          <CardHeader>
            <CardHeaderMain>
              <CardTitle>
                {data.pages[0].count} Documents in {data.pages[0].took} Milliseconds
              </CardTitle>
            </CardHeaderMain>
            <CardActions>{isFetching && <Spinner size="md" />}</CardActions>
          </CardHeader>
          <CardBody>
            <LogsChart buckets={data.pages[0].buckets} />
          </CardBody>
        </Card>

        <p>&nbsp;</p>

        <Card isCompact={true} style={{ maxWidth: '100%', overflowX: 'scroll' }}>
          <CardBody>
            <LogsDocuments pages={data.pages} fields={fields} />
          </CardBody>
        </Card>

        <p>&nbsp;</p>

        {data.pages[0].documents && data.pages[0].documents.length > 0 ? (
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
