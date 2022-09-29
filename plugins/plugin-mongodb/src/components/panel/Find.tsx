import { Alert, AlertActionLink, AlertVariant, Spinner } from '@patternfly/react-core';
import { Document, EJSON } from 'bson';
import { QueryObserverResult, useQuery } from '@tanstack/react-query';
import React from 'react';

import { IPluginInstance, PluginPanel } from '@kobsio/shared';
import BsonPreview from '../page/BsonPreview';
import FindDocuments from './FindDocuments';
import { toExtendedJson } from '../../utils/helpers';

interface IFindProps {
  instance: IPluginInstance;
  title: string;
  description?: string;
  collectionName: string;
  query: string;
  limit: string;
  sort: string;
}

const Find: React.FunctionComponent<IFindProps> = ({
  instance,
  title,
  description,
  collectionName,
  query,
  limit,
  sort,
}: IFindProps) => {
  const { isError, isLoading, data, error, refetch } = useQuery<Document[], Error>(
    ['mongodb/collections/find', instance, collectionName, query, limit, sort],
    async () => {
      try {
        const response = await fetch(
          `/api/plugins/mongodb/collections/find?collectionName=${collectionName}&sort=${encodeURIComponent(
            toExtendedJson(sort),
          )}&limit=${limit}`,
          {
            body: toExtendedJson(query),
            headers: {
              // eslint-disable-next-line @typescript-eslint/naming-convention
              'x-kobs-plugin': instance.name,
              // eslint-disable-next-line @typescript-eslint/naming-convention
              'x-kobs-satellite': instance.satellite,
            },
            method: 'post',
          },
        );
        const json = await response.json();

        if (response.status >= 200 && response.status < 300) {
          if (json) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return json.map((item: any) => EJSON.parse(JSON.stringify(item)));
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
          title="Could not get query results"
          actionLinks={
            <React.Fragment>
              <AlertActionLink onClick={(): Promise<QueryObserverResult<Document[], Error>> => refetch()}>
                Retry
              </AlertActionLink>
            </React.Fragment>
          }
        >
          <p>{error?.message}</p>
          <p>
            <BsonPreview data={query} />
          </p>
        </Alert>
      </PluginPanel>
    );
  }

  if (!data) {
    return (
      <PluginPanel title={title} description={description}>
        <div></div>
      </PluginPanel>
    );
  }

  return (
    <PluginPanel title={title} description={description}>
      <FindDocuments instance={instance} collectionName={collectionName} documents={data} />
    </PluginPanel>
  );
};

export default Find;
