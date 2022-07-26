import { Alert, AlertActionLink, AlertVariant, Spinner } from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from '@tanstack/react-query';
import React from 'react';

import ApplicationsTopologyGraph from './ApplicationsTopologyGraph';
import { IOptions } from '../applications/utils/interfaces';
import { ITopology } from './utils/interfaces';

export interface IApplicationsTopologyProps {
  options: IOptions;
  setDetails?: (details: React.ReactNode) => void;
}

const ApplicationsTopology: React.FunctionComponent<IApplicationsTopologyProps> = ({
  options,
  setDetails,
}: IApplicationsTopologyProps) => {
  const { isError, isLoading, error, data, refetch } = useQuery<ITopology, Error>(
    ['app/applications/applications/topology', options],
    async () => {
      const c = options.clusterIDs.map((clusterID) => `&clusterID=${encodeURIComponent(clusterID)}`);
      const n = options.clusterIDs
        .map((clusterID) =>
          options.namespaces.map(
            (namespace) => `&namespaceID=${encodeURIComponent(`${clusterID}/namespace/${namespace}`)}`,
          ),
        )
        .flat();
      const t = options.tags.map((tag) => `&tag=${encodeURIComponent(tag)}`);

      const response = await fetch(
        `/api/applications/topology?all=${options.all}&external=${options.external}&searchTerm=${
          options.searchTerm
        }&limit=${options.perPage}&offset=${(options.page - 1) * options.perPage}${c.length > 0 ? c.join('') : ''}${
          n.length > 0 ? n.join('') : ''
        }${t.length > 0 ? t.join('') : ''}`,
        {
          method: 'get',
        },
      );
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
        title="An error occured while topology were fetched"
        actionLinks={
          <React.Fragment>
            <AlertActionLink onClick={(): Promise<QueryObserverResult<ITopology, Error>> => refetch()}>
              Retry
            </AlertActionLink>
          </React.Fragment>
        }
      >
        <p>{error?.message}</p>
      </Alert>
    );
  }

  if (!data || !data.edges || !data.nodes || data.edges.length === 0 || data.nodes.length === 0) {
    return null;
  }

  return <ApplicationsTopologyGraph edges={data.edges} nodes={data.nodes} setDetails={setDetails} />;
};

export default ApplicationsTopology;
