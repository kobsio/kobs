import { Alert, AlertActionLink, AlertVariant, Spinner } from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from 'react-query';
import React from 'react';

import { IIncident } from '../../utils/interfaces';
import { IPluginTimes } from '@kobsio/plugin-core';
import IncidentsItem from './IncidentsItem';
import { queryWithTime } from '../../utils/helpers';

interface IIncidentsProps {
  name: string;
  query: string;
  times: IPluginTimes;
  setDetails?: (details: React.ReactNode) => void;
}

const Incidents: React.FunctionComponent<IIncidentsProps> = ({ name, query, times, setDetails }: IIncidentsProps) => {
  const { isError, isLoading, error, data, refetch } = useQuery<IIncident[], Error>(
    ['opsgenie/incidents', name, query, times],
    async () => {
      try {
        const response = await fetch(`/api/plugins/opsgenie/incidents/${name}?query=${queryWithTime(query, times)}`, {
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
      title="Could not get incidents"
      actionLinks={
        <React.Fragment>
          <AlertActionLink onClick={(): Promise<QueryObserverResult<IIncident[], Error>> => refetch()}>
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
      {data.map((incident) => (
        <div key={incident.id}>
          <IncidentsItem name={name} incident={incident} setDetails={setDetails} />
          <p>&nbsp;</p>
        </div>
      ))}
    </div>
  );
};

export default Incidents;
