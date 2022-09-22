import React, { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { EJSON } from 'bson';
import { Spinner } from '@patternfly/react-core';
import { useQuery } from 'react-query';

import { IPluginInstance, PageContentSection, PageHeaderSection, PluginPageTitle } from '@kobsio/shared';
import { getInitialQueryOptions, toExtendedJson } from '../../utils/helpers';
import { Document as BsonDocument } from 'bson';
import { IQueryOptions } from '../../utils/interfaces';
import QueryResultsView from './QueryResultView';
import QueryToolbar from './QueryToolbar';
import { defaultDescription } from '../../utils/constants';

interface IQueryPageProps {
  instance: IPluginInstance;
}

const QueryPage: React.FunctionComponent<IQueryPageProps> = ({ instance }: IQueryPageProps) => {
  const params = useParams();
  const collectionName = decodeURIComponent(params.collectionName ?? '');

  const location = useLocation();

  const url = new URL(window.location.href);
  const [options, setOptions] = useState<IQueryOptions>();

  const changeOptions = (opts: IQueryOptions): void => {
    opts.operation !== undefined && url.searchParams.set('operation', opts.operation);
    opts.query !== '' && url.searchParams.set('query', opts.query);
    window.history.pushState(null, '', url.href);
  };

  useEffect(() => {
    setOptions((prevOptions) => getInitialQueryOptions(location.search, !prevOptions));
  }, [location.search]);

  const { isLoading, data, refetch } = useQuery<BsonDocument[], Error>(
    [`mongodb/collections/${collectionName}/${options?.operation}`, instance, options?.query],
    async () => {
      try {
        const response = await fetch(`/api/plugins/mongodb/collections/${collectionName}/${options?.operation}`, {
          body: toExtendedJson(options?.query ?? '{}'),
          headers: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            'x-kobs-plugin': instance.name,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            'x-kobs-satellite': instance.satellite,
          },
          method: 'post',
        });
        const json = await response.json();

        if (response.status >= 200 && response.status < 300) {
          if (json.error) {
            throw new Error(json.error);
          }

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return json.map((item: any) => EJSON.parse(JSON.stringify(item)));
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

  //if (isError) {
  //  return (
  //    <Alert
  //      variant={AlertVariant.danger}
  //      title="Query execution failed"
  //      actionLinks={
  //        <React.Fragment>
  //          <AlertActionLink onClick={(): void => navigate('/')}>Home</AlertActionLink>
  //          <AlertActionLink onClick={(): Promise<QueryObserverResult<string, Error>> => refetch()}>
  //            Retry
  //          </AlertActionLink>
  //        </React.Fragment>
  //      }
  //    >
  //      <p>{error?.message}</p>
  //    </Alert>
  //  );
  //}
  //
  //if (!data) {
  //  return null;
  //}

  if (!collectionName) return null; // todo: remove

  if (!options) {
    return null;
  }

  return (
    <React.Fragment>
      <PageHeaderSection
        component={
          <PluginPageTitle
            satellite={instance.satellite}
            name={instance.name}
            description={instance.description || defaultDescription}
          />
        }
      />
      <PageContentSection
        hasPadding={true}
        hasDivider={true}
        toolbarContent={<QueryToolbar options={options} changeOptions={changeOptions} runQuery={refetch} />}
        panelContent={undefined}
      >
        <React.Fragment>
          {isLoading && (
            <div className="pf-u-text-align-center">
              <Spinner />
            </div>
          )}
          {!isLoading && data && <QueryResultsView data={data} />}
        </React.Fragment>
      </PageContentSection>
    </React.Fragment>
  );
};

export default QueryPage;
