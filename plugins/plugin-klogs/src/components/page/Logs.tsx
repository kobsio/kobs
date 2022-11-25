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
import { IPluginInstance, ITimes } from '@kobsio/shared';
import { QueryObserverResult, useQuery } from '@tanstack/react-query';

import React from 'react';

import { useNavigate } from 'react-router-dom';

import { IField, ILogsData } from '../../utils/interfaces';
import { AutolinkReference } from '../../utils/ResolveReference';
import LogsActions from './LogsActions';
import LogsChart from '../panel/LogsChart';
import LogsDocuments from '../panel/LogsDocuments';
import LogsFields from './LogsFields';

interface ILogsProps {
  instance: IPluginInstance;
  fields?: IField[];
  order: string;
  orderBy: string;
  query: string;
  addFilter: (filter: string) => void;
  changeTime: (times: ITimes) => void;
  changeOrder: (order: string, orderBy: string) => void;
  selectField: (field: { name: string }) => void;
  changeFieldOrder: (oldIndex: number, newIndex: number) => void;
  times: ITimes;
}

const Logs: React.FunctionComponent<ILogsProps> = ({
  instance,
  fields,
  order,
  orderBy,
  query,
  addFilter,
  changeTime,
  changeOrder,
  selectField,
  changeFieldOrder,
  times,
}: ILogsProps) => {
  const navigate = useNavigate();

  const { isError, isFetching, isLoading, data, error, refetch } = useQuery<ILogsData, Error>(
    ['klogs/logs', instance, query, order, orderBy, times],
    async () => {
      try {
        const response = await fetch(
          `/api/plugins/klogs/logs?query=${encodeURIComponent(query)}&order=${order}&orderBy=${encodeURIComponent(
            orderBy,
          )}&timeStart=${times.timeStart}&timeEnd=${times.timeEnd}`,
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
          <LogsFields
            fields={data.fields}
            selectField={selectField}
            selectedFields={fields}
            changeFieldOrder={changeFieldOrder}
          />
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
            <LogsActions
              instance={instance}
              query={query}
              times={times}
              documents={data.documents}
              fields={fields}
              isFetching={isFetching}
            />
          </CardHeader>
          <CardBody>
            <LogsChart buckets={data.buckets} changeTime={changeTime} />
          </CardBody>
        </Card>

        <p>&nbsp;</p>

        <Card isCompact={true} style={{ maxWidth: '100%', overflowX: 'scroll' }}>
          <CardBody>
            <AutolinkReference.Context.Provider value={AutolinkReference.Factory([fakeAutolink], times)}>
              <LogsDocuments
                documents={data.documents}
                fields={fields}
                order={order}
                orderBy={orderBy}
                addFilter={addFilter}
                changeOrder={changeOrder}
                selectField={selectField}
              />
            </AutolinkReference.Context.Provider>
          </CardBody>
        </Card>
      </GridItem>
    </Grid>
  );
};

export default Logs;
const fakeAutolink = {
  fieldName: 'content_request_id',
  path: `?query=content_request_id='<<value>>'`,
};
