import { Alert, AlertActionLink, AlertVariant, DataList, Spinner } from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from 'react-query';
import React from 'react';

import { IIndex } from '../../utils/interfaces';
import { IPluginInstance } from '@kobsio/shared';
import TechDocsListItem from './TechDocsListItem';

interface ITechDocsListProps {
  instance: IPluginInstance;
}

const TechDocsList: React.FunctionComponent<ITechDocsListProps> = ({ instance }: ITechDocsListProps) => {
  const { isError, isLoading, error, data, refetch } = useQuery<IIndex[], Error>(
    ['techdocs/indexes', instance],
    async () => {
      try {
        const response = await fetch(`/api/plugins/techdocs/indexes`, {
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
    <DataList aria-label="techdocs list">
      {data.map((index) => (
        <TechDocsListItem key={index.key} instance={instance} index={index} />
      ))}
    </DataList>
  );
};

export default TechDocsList;
