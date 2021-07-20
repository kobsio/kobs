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

import { INote } from '../../../utils/interfaces';
import { formatTimeWrapper } from '../../../utils/helpers';

interface INotesProps {
  name: string;
  id: string;
  type: string;
}

const Notes: React.FunctionComponent<INotesProps> = ({ name, id, type }: INotesProps) => {
  const { isError, isLoading, error, data, refetch } = useQuery<INote[], Error>(
    ['opsgenie/alerts/notes', name, id, type],
    async () => {
      try {
        const response = await fetch(`/api/plugins/opsgenie/${type}/notes/${name}?id=${id}`, {
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
    </Alert>;
  }

  if (!data) {
    return null;
  }

  return (
    <DescriptionList className="pf-u-text-break-word" isHorizontal={true}>
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
