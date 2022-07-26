import { Alert, AlertActionLink, AlertVariant, Spinner } from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from '@tanstack/react-query';
import React from 'react';

import { IPluginInstance, ITimes } from '@kobsio/shared';
import Artifact from './details/Artifact';
import Conditions from './details/Conditions';
import GitReference from './details/GitReference';
import HelmInfo from './details/HelmInfo';
import HelmSource from './details/HelmSource';
import KustomizationInfo from './details/KustomizationInfo';
import SourceInfo from './details/SourceInfo';
import { TType } from '../../utils/interfaces';
import { resources } from '../../utils/constants';

interface IPanelItemProps {
  instance: IPluginInstance;
  type: TType;
  cluster: string;
  namespace: string;
  name: string;
  times?: ITimes;
  setDetails?: (details: React.ReactNode) => void;
}

const PanelItem: React.FunctionComponent<IPanelItemProps> = ({
  instance,
  type,
  cluster,
  namespace,
  name,
  times,
  setDetails,
}: IPanelItemProps) => {
  const resource = resources[type];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { isError, isLoading, error, data, refetch } = useQuery<any, Error>(
    ['flux/item', instance, cluster, type, namespace, name, times],
    async () => {
      try {
        const response = await fetch(
          `/api/resources?satellite=${instance.satellite}&cluster=${cluster}&namespace=${namespace}&name=${name}&resource=${resource.resource}&path=${resource.path}`,
          { method: 'get' },
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
        title={`Could not get ${resource.title}`}
        actionLinks={
          <React.Fragment>
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <AlertActionLink onClick={(): Promise<QueryObserverResult<any, Error>> => refetch()}>Retry</AlertActionLink>
          </React.Fragment>
        }
      >
        <p>{error?.message}</p>
      </Alert>
    );
  }

  return (
    <React.Fragment>
      {type === 'gitrepositories' || type === 'buckets' || type === 'helmrepositories' ? (
        <SourceInfo type={type} url={data?.spec?.url} timeout={data?.spec?.timeout} />
      ) : null}
      {type === 'kustomizations' ? (
        <KustomizationInfo
          instance={instance}
          cluster={cluster}
          source={data?.spec?.sourceRef}
          namespace={data?.metadata?.namespace}
          path={data?.spec?.path}
          interval={data?.spec?.interval}
          prune={data?.spec?.prune}
          appliedRevision={data?.status?.lastAppliedRevision}
        />
      ) : null}
      {type === 'helmreleases' ? (
        <HelmInfo
          interval={data?.spec?.interval}
          chart={data?.spec?.chart?.spec?.chart}
          version={data?.spec?.chart?.spec?.version}
        />
      ) : null}
      {type === 'helmreleases' &&
      data &&
      data.spec &&
      data.spec.chart &&
      data.spec.chart.spec &&
      data.spec.chart.spec.sourceRef ? (
        <HelmSource
          instance={instance}
          cluster={cluster}
          namespace={data.metadata.namespace}
          source={data?.spec?.chart?.spec?.sourceRef}
        />
      ) : null}
      {type === 'gitrepositories' ? (
        <GitReference
          branch={data?.spec?.ref?.branch}
          tag={data?.spec?.ref?.tag}
          semver={data?.spec?.ref?.semver}
          commit={data?.spec?.ref?.commit}
        />
      ) : null}
      {data && data.status && data.status.artifact ? <Artifact artifact={data?.status?.artifact} /> : null}
      <Conditions conditions={data?.status?.conditions} />
    </React.Fragment>
  );
};

export default PanelItem;
