import { Alert, AlertActionLink, AlertVariant, Spinner } from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from 'react-query';
import React from 'react';

import { IIndex } from '../../utils/interfaces';
import { PluginCard } from '@kobsio/plugin-core';
import TableOfContents from './TableOfContents';

interface ITableOfContentsWrapperProps {
  name: string;
  title: string;
  description?: string;
  service: string;
}

const TableOfContentsWrapper: React.FunctionComponent<ITableOfContentsWrapperProps> = ({
  name,
  title,
  description,
  service,
}: ITableOfContentsWrapperProps) => {
  const { isError, isLoading, error, data, refetch } = useQuery<IIndex, Error>(
    ['techdocs/index', name, service],
    async () => {
      try {
        const response = await fetch(`/api/plugins/techdocs/${name}/index?service=${service}`, {
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

  return (
    <PluginCard title={title} description={description}>
      {isLoading ? (
        <div className="pf-u-text-align-center">
          <Spinner />
        </div>
      ) : isError ? (
        <Alert
          variant={AlertVariant.danger}
          title="Could not get table of contents"
          actionLinks={
            <React.Fragment>
              <AlertActionLink onClick={(): Promise<QueryObserverResult<IIndex, Error>> => refetch()}>
                Retry
              </AlertActionLink>
            </React.Fragment>
          }
        >
          <p>{error?.message}</p>
        </Alert>
      ) : data && data.toc ? (
        <TableOfContents name={name} service={service} toc={data.toc} />
      ) : null}
    </PluginCard>
  );
};

export default TableOfContentsWrapper;
