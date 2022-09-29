import {
  Accordion,
  Alert,
  AlertActionLink,
  AlertVariant,
  CardActions,
  Spinner,
  TextInput,
} from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from '@tanstack/react-query';
import React, { useState } from 'react';

import { IPluginInstance, PluginPanel } from '@kobsio/shared';
import Collection from './Collection';

interface ICollectionsProps {
  instance: IPluginInstance;
  title: string;
  description?: string;
}

const Collections: React.FunctionComponent<ICollectionsProps> = ({
  instance,
  title,
  description,
}: ICollectionsProps) => {
  const [filter, setFilter] = useState<string>('');

  const { isError, isLoading, data, error, refetch } = useQuery<string[], Error>(
    ['mongodb/collections', instance],
    async () => {
      try {
        const response = await fetch(`/api/plugins/mongodb/collections`, {
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
          if (json.error) {
            throw new Error(json.error);
          }

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
    {
      keepPreviousData: true,
    },
  );

  if (isLoading) {
    return (
      <PluginPanel title={title} description={description}>
        <div className="pf-u-text-align-center">
          <Spinner />
        </div>
      </PluginPanel>
    );
  }

  if (isError) {
    return (
      <PluginPanel title={title} description={description}>
        <Alert
          variant={AlertVariant.danger}
          isInline={true}
          title="Could not get database collections"
          actionLinks={
            <React.Fragment>
              <AlertActionLink onClick={(): Promise<QueryObserverResult<string[], Error>> => refetch()}>
                Retry
              </AlertActionLink>
            </React.Fragment>
          }
        >
          <p>{error?.message}</p>
        </Alert>
      </PluginPanel>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <PluginPanel
      title={title}
      description={description}
      actions={
        <CardActions>
          <TextInput
            placeholder="Filter"
            aria-label="Filter"
            value={filter}
            onChange={(value: string): void => setFilter(value)}
          />
        </CardActions>
      }
    >
      <Accordion asDefinitionList={true}>
        {data
          .filter((name) => name.toLowerCase().includes(filter.toLowerCase()))
          .map((name) => (
            <Collection key={name} instance={instance} collectionName={name} />
          ))}
      </Accordion>
    </PluginPanel>
  );
};

export default Collections;
