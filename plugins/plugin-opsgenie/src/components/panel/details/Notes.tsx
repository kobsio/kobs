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

import { INote } from '../../../utils/interfaces';
import { IPluginInstance } from '@kobsio/shared';
import NoData from '../NoData';
import { formatTimeWrapper } from '../../../utils/helpers';

interface INotesProps {
  instance: IPluginInstance;
  id: string;
  type: string;
}

const Notes: React.FunctionComponent<INotesProps> = ({ instance, id, type }: INotesProps) => {
  const { isError, isLoading, error, data, refetch } = useQuery<INote[], Error>(
    ['opsgenie/alerts/notes', instance, id, type],
    async () => {
      try {
        const response = await fetch(`/api/plugins/opsgenie/${type}/notes?id=${id}`, {
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
        title="Could not get alert notes"
        actionLinks={
          <React.Fragment>
            <AlertActionLink onClick={(): Promise<QueryObserverResult<INote[], Error>> => refetch()}>
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
    return <NoData title="Notes not found" description="We could not find any notes for the Alert / Incident." />;
  }

  return (
    <DescriptionList className="pf-u-text-break-word">
      {data.map((note, index) => (
        <DescriptionListGroup key={index}>
          <DescriptionListTerm className="pf-u-text-nowrap">
            {note.createdAt ? formatTimeWrapper(note.createdAt) : ''}
          </DescriptionListTerm>
          <DescriptionListDescription>{note.note || ''}</DescriptionListDescription>
        </DescriptionListGroup>
      ))}
    </DescriptionList>
  );
};

export default Notes;
