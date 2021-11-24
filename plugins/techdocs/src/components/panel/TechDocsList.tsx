import { Alert, AlertActionLink, AlertVariant, Menu, MenuContent, MenuList, Spinner } from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from 'react-query';
import React from 'react';

import { IIndex } from '../../utils/interfaces';
import TechDocsListItem from './TechDocsListItem';

interface ITechDocsListProps {
  name: string;
}

const TechDocsList: React.FunctionComponent<ITechDocsListProps> = ({ name }: ITechDocsListProps) => {
  const { isError, isLoading, error, data, refetch } = useQuery<IIndex[], Error>(
    ['techdocs/indexes', name],
    async () => {
      try {
        const response = await fetch(`/api/plugins/techdocs/indexes/${name}`, {
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
        title="Could not get TechDocs"
        actionLinks={
          <React.Fragment>
            <AlertActionLink onClick={(): Promise<QueryObserverResult<IIndex[], Error>> => refetch()}>
              Retry
            </AlertActionLink>
          </React.Fragment>
        }
      >
        <p>{error?.message}</p>
      </Alert>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <Menu>
      <MenuContent>
        <MenuList>
          {data.map((index) => (
            <TechDocsListItem key={index.key} name={name} index={index} />
          ))}
        </MenuList>
      </MenuContent>
    </Menu>
  );
};

export default TechDocsList;
