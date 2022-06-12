import { Alert, AlertActionLink, AlertVariant, Spinner } from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from 'react-query';
import React from 'react';

import { IPluginInstance, ITimes } from '@kobsio/shared';
import AlertsList from './AlertsList';
import { IAlert } from '../../utils/interfaces';
import NoData from './NoData';
import { queryWithTime } from '../../utils/helpers';

interface IAlertsProps {
  instance: IPluginInstance;
  query: string;
  interval?: number;
  times: ITimes;
  setDetails?: (details: React.ReactNode) => void;
}

const Alerts: React.FunctionComponent<IAlertsProps> = ({
  instance,
  query,
  interval,
  times,
  setDetails,
}: IAlertsProps) => {
  const { isError, isLoading, error, data, refetch } = useQuery<IAlert[], Error>(
    ['opsgenie/alerts', instance, query, interval, times],
    async () => {
      try {
        const response = await fetch(`/api/plugins/opsgenie/alerts?query=${queryWithTime(query, times, interval)}`, {
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
        isInline={true}
        title="Could not get alerts"
        actionLinks={
          <React.Fragment>
            <AlertActionLink onClick={(): Promise<QueryObserverResult<IAlert[], Error>> => refetch()}>
              Retry
            </AlertActionLink>
          </React.Fragment>
        }
      >
        <p>{error?.message}</p>
      </Alert>
    );
  }

  if (!data || data.length === 0) {
    return (
      <NoData
        title="Alerts not found"
        description={`We could not find any alerts for the following query: "${query}" in the selected time range.`}
      />
    );
  }

  return <AlertsList instance={instance} alerts={data} refetch={refetch} setDetails={setDetails} />;
};

export default Alerts;
