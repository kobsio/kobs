import { Alert, AlertActionLink, AlertVariant, Spinner } from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from '@tanstack/react-query';
import React from 'react';

import { IPluginInstance, ITimes } from '@kobsio/shared';
import { IIncident } from '../../utils/interfaces';
import IncidentsList from './IncidentsList';
import NoData from './NoData';
import { queryWithTime } from '../../utils/helpers';

interface IIncidentsProps {
  instance: IPluginInstance;
  query: string;
  interval?: number;
  times: ITimes;
  setDetails?: (details: React.ReactNode) => void;
}

const Incidents: React.FunctionComponent<IIncidentsProps> = ({
  instance,
  query,
  interval,
  times,
  setDetails,
}: IIncidentsProps) => {
  const { isError, isLoading, error, data, refetch } = useQuery<IIncident[], Error>(
    ['opsgenie/incidents', instance, query, interval, times],
    async () => {
      try {
        const response = await fetch(`/api/plugins/opsgenie/incidents?query=${queryWithTime(query, times, interval)}`, {
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
      </Alert>
    );
  }

  if (!data || data.length === 0) {
    return (
      <NoData
        title="Incidents not found"
        description={`We could not find any incidents for the following query: "${query}" in the selected time range.`}
      />
    );
  }

  return <IncidentsList instance={instance} incidents={data} refetch={refetch} setDetails={setDetails} />;
};

export default Incidents;
