import {
  DrawerActions,
  DrawerCloseButton,
  DrawerHead,
  DrawerPanelBody,
  DrawerPanelContent,
} from '@patternfly/react-core';
import { IRow } from '@patternfly/react-table';
import React from 'react';

import { IResource, Title } from '@kobsio/plugin-core';
import Actions from './Actions';
import Artifact from './Artifact';
import Conditions from './Conditions';
import GitReference from './GitReference';
import HelmInfo from './HelmInfo';
import HelmSource from './HelmSource';
import KustomizationInfo from './KustomizationInfo';
import SourceInfo from './SourceInfo';
import { TApiType } from '../../../utils/interfaces';

interface IDetailsProps {
  name: string;
  type: TApiType;
  request: IResource;
  resource: IRow;
  close: () => void;
  refetch: () => void;
}

const Details: React.FunctionComponent<IDetailsProps> = ({
  name,
  type,
  request,
  resource,
  close,
  refetch,
}: IDetailsProps) => {
  return (
    <DrawerPanelContent minSize="50%">
      <DrawerHead>
        <Title
          title={resource.name}
          subtitle={resource.namespace ? `${resource.namespace} (${resource.cluster})` : resource.cluster}
          size="lg"
        />
        <DrawerActions style={{ padding: 0 }}>
          {type === 'kustomizations.kustomize.toolkit.fluxcd.io/v1beta1' ||
          type === 'helmreleases.helm.toolkit.fluxcd.io/v2beta1' ? (
            <Actions request={request} resource={resource} refetch={refetch} />
          ) : null}
          <DrawerCloseButton onClose={close} />
        </DrawerActions>
      </DrawerHead>

      <DrawerPanelBody>
        {type === 'gitrepositories.source.toolkit.fluxcd.io/v1beta1' ||
        type === 'buckets.source.toolkit.fluxcd.io/v1beta1' ||
        type === 'helmrepositories.source.toolkit.fluxcd.io/v1beta1' ? (
          <SourceInfo type={type} url={resource.props?.spec?.url} timeout={resource.props?.spec?.timeout} />
        ) : null}
        {type === 'kustomizations.kustomize.toolkit.fluxcd.io/v1beta1' ? (
          <KustomizationInfo
            name={name}
            cluster={resource.cluster}
            source={resource.props?.spec?.sourceRef?.name}
            namespace={resource.namespace}
            path={resource.props?.spec?.path}
            interval={resource.props?.spec?.interval}
            prune={resource.props?.spec?.prune}
            appliedRevision={resource.props?.status?.lastAppliedRevision}
          />
        ) : null}
        {type === 'helmreleases.helm.toolkit.fluxcd.io/v2beta1' ? (
          <HelmInfo
            interval={resource.props?.spec?.interval}
            chart={resource.props?.spec?.chart?.spec?.chart}
            version={resource.props?.spec?.chart?.spec?.version}
          />
        ) : null}
        {type === 'helmreleases.helm.toolkit.fluxcd.io/v2beta1' &&
        resource.props &&
        resource.props.spec &&
        resource.props.spec.chart &&
        resource.props.spec.chart.spec &&
        resource.props.spec.chart.spec.sourceRef ? (
          <HelmSource name={name} cluster={resource.cluster} source={resource.props?.spec?.chart?.spec?.sourceRef} />
        ) : null}
        {type === 'gitrepositories.source.toolkit.fluxcd.io/v1beta1' ? (
          <GitReference
            branch={resource.props?.spec?.ref?.branch}
            tag={resource.props?.spec?.ref?.tag}
            semver={resource.props?.spec?.ref?.semver}
            commit={resource.props?.spec?.ref?.commit}
          />
        ) : null}
        {resource.props && resource.props.status && resource.props.status.artifact ? (
          <Artifact artifact={resource.props?.status?.artifact} />
        ) : null}
        <Conditions conditions={resource.props?.status?.conditions} />
        <p>&nbsp;</p>
      </DrawerPanelBody>
    </DrawerPanelContent>
  );
};

export default Details;
