import {
  Alert,
  AlertActionLink,
  AlertVariant,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Spinner,
} from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from '@tanstack/react-query';
import React from 'react';

import { ILog } from '../../../utils/interfaces';
import { IPluginInstance } from '@kobsio/shared';
import NoData from '../NoData';
import { formatTimeWrapper } from '../../../utils/helpers';

interface ILogsProps {
  instance: IPluginInstance;
  id: string;
  type: string;
}

const Logs: React.FunctionComponent<ILogsProps> = ({ instance, id, type }: ILogsProps) => {
  const { isError, isLoading, error, data, refetch } = useQuery<ILog[], Error>(
    ['opsgenie/alerts/logs', instance, id, type],
    async () => {
      try {
        const response = await fetch(`/api/plugins/opsgenie/${type}/logs?id=${id}`, {
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
    <Alert
      variant={AlertVariant.danger}
      isInline={true}
      title="Could not get alert logs"
      actionLinks={
        <React.Fragment>
          <AlertActionLink onClick={(): Promise<QueryObserverResult<ILog[], Error>> => refetch()}>
            Retry
          </AlertActionLink>
        </React.Fragment>
      }
    >
      <p>{error?.message}</p>
    </Alert>;
  }

  if (!data || data.length === 0) {
    return <NoData title="Logs not found" description="We could not find any logs for the Alert / Incident." />;
  }

  return (
    <DescriptionList className="pf-u-text-break-word">
      {data.map((log, index) => (
        <DescriptionListGroup key={index}>
          <DescriptionListTerm className="pf-u-text-nowrap">
            {log.createdAt ? formatTimeWrapper(log.createdAt) : ''}
          </DescriptionListTerm>
          <DescriptionListDescription>{log.log || ''}</DescriptionListDescription>
        </DescriptionListGroup>
      ))}
    </DescriptionList>
  );
};

export default Logs;
