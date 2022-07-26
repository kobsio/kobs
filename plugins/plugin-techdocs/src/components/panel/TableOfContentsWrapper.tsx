import { Alert, AlertActionLink, AlertVariant, Spinner } from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from '@tanstack/react-query';
import React from 'react';

import { IPluginInstance, PluginPanel } from '@kobsio/shared';
import { IIndex } from '../../utils/interfaces';
import TableOfContents from './TableOfContents';

interface ITableOfContentsWrapperProps {
  instance: IPluginInstance;
  title: string;
  description?: string;
  service: string;
}

const TableOfContentsWrapper: React.FunctionComponent<ITableOfContentsWrapperProps> = ({
  instance,
  title,
  description,
  service,
}: ITableOfContentsWrapperProps) => {
  const { isError, isLoading, error, data, refetch } = useQuery<IIndex, Error>(
    ['techdocs/index', instance, service],
    async () => {
      try {
        const response = await fetch(`/api/plugins/techdocs/index?service=${service}`, {
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

  return (
    <PluginPanel title={title} description={description}>
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
        <TableOfContents instance={instance} service={service} toc={data.toc} />
      ) : null}
    </PluginPanel>
  );
};

export default TableOfContentsWrapper;
