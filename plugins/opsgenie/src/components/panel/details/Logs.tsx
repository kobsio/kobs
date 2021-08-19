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
import { QueryObserverResult, useQuery } from 'react-query';
import React from 'react';

import { ILog } from '../../../utils/interfaces';
import { formatTimeWrapper } from '../../../utils/helpers';

interface ILogsProps {
  name: string;
  id: string;
  type: string;
}

const Logs: React.FunctionComponent<ILogsProps> = ({ name, id, type }: ILogsProps) => {
  const { isError, isLoading, error, data, refetch } = useQuery<ILog[], Error>(
    ['opsgenie/alerts/logs', name, id, type],
    async () => {
      try {
        const response = await fetch(`/api/plugins/opsgenie/${type}/logs/${name}?id=${id}`, {
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

  if (!data) {
    return null;
  }

  return (
    <DescriptionList className="pf-u-text-break-word" isHorizontal={true}>
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
