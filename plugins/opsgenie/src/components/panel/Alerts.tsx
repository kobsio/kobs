import { Alert, AlertActionLink, AlertVariant, Spinner } from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from 'react-query';
import React from 'react';

import AlertsItem from './AlertsItem';
import { IAlert } from '../../utils/interfaces';
import { IPluginTimes } from '@kobsio/plugin-core';
import { queryWithTime } from '../../utils/helpers';

interface IAlertsProps {
  name: string;
  query: string;
  times: IPluginTimes;
  setDetails?: (details: React.ReactNode) => void;
}

const Alerts: React.FunctionComponent<IAlertsProps> = ({ name, query, times, setDetails }: IAlertsProps) => {
  const { isError, isLoading, error, data, refetch } = useQuery<IAlert[], Error>(
    ['opsgenie/alerts', name, query, times],
    async () => {
      try {
        const response = await fetch(`/api/plugins/opsgenie/alerts/${name}?query=${queryWithTime(query, times)}`, {
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
    <Alert
      variant={AlertVariant.danger}
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
    </Alert>;
  }

  if (!data) {
    return null;
  }

  return (
    <div>
      {data.map((alert, index) => (
        <div key={alert.id}>
          <AlertsItem name={name} alert={alert} setDetails={setDetails} />
          {index !== data.length - 1 ? <p>&nbsp;</p> : null}
        </div>
      ))}
    </div>
  );
};

export default Alerts;
