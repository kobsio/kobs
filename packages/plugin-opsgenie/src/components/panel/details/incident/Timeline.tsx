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

import { IPluginInstance } from '@kobsio/shared';
import { ITimelineEntry } from '../../../../utils/interfaces';
import NoData from '../../NoData';
import { formatTimeWrapper } from '../../../../utils/helpers';

interface IDetailsProps {
  instance: IPluginInstance;
  id: string;
}

const Details: React.FunctionComponent<IDetailsProps> = ({ instance, id }: IDetailsProps) => {
  const { isError, isLoading, error, data, refetch } = useQuery<ITimelineEntry[], Error>(
    ['opsgenie/incident/timeline', instance, id],
    async () => {
      try {
        const response = await fetch(`/api/plugins/opsgenie/incident/timeline?id=${id}`, {
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
    return <NoData title="Timeline not found" description="We could not find any timeline entries for the Incident." />;
  }

  return (
    <DescriptionList className="pf-u-text-break-word">
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
