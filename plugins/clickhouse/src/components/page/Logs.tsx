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
  addFilter: (filter: string) => void;
  changeTime: (times: IPluginTimes) => void;
  changeOrder: (order: string, orderBy: string) => void;
  selectField: (field: string) => void;
  times: IPluginTimes;
}

const PageLogs: React.FunctionComponent<IPageLogsProps> = ({
  name,
  fields,
  order,
  orderBy,
  query,
  addFilter,
  changeTime,
  changeOrder,
  selectField,
  times,
}: IPageLogsProps) => {
  const history = useHistory();

  const { isError, isFetching, isLoading, data, error, refetch } = useQuery<ILogsData, Error>(
    ['clickhouse/logs', query, order, orderBy, times],
    async () => {
      try {
        const response = await fetch(
          `/api/plugins/clickhouse/logs/${name}?query=${encodeURIComponent(
            query,
          )}&order=${order}&orderBy=${encodeURIComponent(orderBy)}&timeStart=${times.timeStart}&timeEnd=${
            times.timeEnd
          }`,
          {
            method: 'get',
          },
        );
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
        title="Could not get logs"
        actionLinks={
          <React.Fragment>
            <AlertActionLink onClick={(): void => history.push('/')}>Home</AlertActionLink>
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
          <LogsFields fields={data.fields} selectField={selectField} selectedFields={fields} />
        </Card>
      </GridItem>
      <GridItem sm={12} md={12} lg={9} xl={10} xl2={10}>
        <Card isCompact={true}>
          <CardHeader>
            <CardHeaderMain>
              <CardTitle>
                {data.count} Documents in {data.took} Milliseconds
              </CardTitle>
            </CardHeaderMain>
            <CardActions>{isFetching && <Spinner size="md" />}</CardActions>
          </CardHeader>
          <CardBody>
            <LogsChart buckets={data.buckets} changeTime={changeTime} />
          </CardBody>
        </Card>

        <p>&nbsp;</p>

        <Card isCompact={true} style={{ maxWidth: '100%', overflowX: 'scroll' }}>
          <CardBody>
            <LogsDocuments
              documents={data.documents}
              fields={fields}
              order={order}
              orderBy={orderBy}
              addFilter={addFilter}
              changeOrder={changeOrder}
              selectField={selectField}
            />
          </CardBody>
        </Card>
      </GridItem>
      <p>&nbsp;</p>
    </Grid>
  );
};

export default PageLogs;
