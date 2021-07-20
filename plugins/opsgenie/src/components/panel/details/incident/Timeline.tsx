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

import { ITimelineEntry } from '../../../../utils/interfaces';
import { formatTimeWrapper } from '../../../../utils/helpers';

interface IDetailsProps {
  name: string;
  id: string;
}

const Details: React.FunctionComponent<IDetailsProps> = ({ name, id }: IDetailsProps) => {
  const { isError, isLoading, error, data, refetch } = useQuery<ITimelineEntry[], Error>(
    ['opsgenie/incident/timeline', name, id],
    async () => {
      try {
        const response = await fetch(`/api/plugins/opsgenie/incident/timeline/${name}?id=${id}`, {
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
    { keepPreviousData: true },
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
      title="Could not get alert details"
      actionLinks={
        <React.Fragment>
          <AlertActionLink onClick={(): Promise<QueryObserverResult<ITimelineEntry[], Error>> => refetch()}>
            Retry
          </AlertActionLink>
        </React.Fragment>
      }
    >
      <p>{error?.message}</p>
    </Alert>;
  }

  if (!data || data.length === 0) {
    return null;
  }

  return (
    <DescriptionList className="pf-u-text-break-word" isHorizontal={true}>
      {data.map((entry, index) => (
        <DescriptionListGroup key={index}>
          <DescriptionListTerm className="pf-u-text-nowrap">
            {entry.eventTime ? formatTimeWrapper(entry.eventTime) : ''}
          </DescriptionListTerm>
          <DescriptionListDescription>
            {entry.type || ''} by {entry.actor?.name || ''}
          </DescriptionListDescription>
        </DescriptionListGroup>
      ))}
    </DescriptionList>
  );
};

export default Details;
