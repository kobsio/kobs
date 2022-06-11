import {
  DrawerActions,
  DrawerCloseButton,
  DrawerHead,
  DrawerPanelBody,
  DrawerPanelContent,
  Title,
} from '@patternfly/react-core';
import React from 'react';

import Actions from './Actions';
import Artifact from './Artifact';
import Conditions from './Conditions';
import GitReference from './GitReference';
import HelmInfo from './HelmInfo';
import HelmSource from './HelmSource';
import { IPluginInstance } from '@kobsio/shared';
import KustomizationInfo from './KustomizationInfo';
import SourceInfo from './SourceInfo';
import { TType } from '../../../utils/interfaces';

interface IDetailsProps {
  instance: IPluginInstance;
  cluster: string;
  type: TType;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  item: any;
  close: () => void;
  refetch: () => void;
}

const Details: React.FunctionComponent<IDetailsProps> = ({
  instance,
  cluster,
  type,
  item,
  close,
  refetch,
}: IDetailsProps) => {
  return (
    <DrawerPanelContent minSize="50%">
      <DrawerHead>
        <Title headingLevel="h2" size="xl">
          {item.metadata.name}
          <span className="pf-u-pl-sm pf-u-font-size-sm pf-u-color-400">{item.metadata.namespace}</span>
        </Title>
        <DrawerActions style={{ padding: 0 }}>
          {type === 'kustomizations' || type === 'helmreleases' ? (
            <Actions instance={instance} cluster={cluster} type={type} item={item} refetch={refetch} />
          ) : null}
          <DrawerCloseButton onClose={close} />
        </DrawerActions>
      </DrawerHead>

      <DrawerPanelBody>
        {type === 'gitrepositories' || type === 'buckets' || type === 'helmrepositories' ? (
          <SourceInfo type={type} url={item?.spec?.url} timeout={item?.spec?.timeout} />
        ) : null}
        {type === 'kustomizations' ? (
          <KustomizationInfo
            instance={instance}
            cluster={cluster}
            source={item?.spec?.sourceRef}
            namespace={item?.metadata?.namespace}
            path={item?.spec?.path}
            interval={item?.spec?.interval}
            prune={item?.spec?.prune}
            appliedRevision={item?.status?.lastAppliedRevision}
          />
        ) : null}
        {type === 'helmreleases' ? (
          <HelmInfo
            interval={item?.spec?.interval}
            chart={item?.spec?.chart?.spec?.chart}
            version={item?.spec?.chart?.spec?.version}
          />
        ) : null}
        {type === 'helmreleases' &&
        item &&
        item.spec &&
        item.spec.chart &&
        item.spec.chart.spec &&
        item.spec.chart.spec.sourceRef ? (
          <HelmSource
            instance={instance}
            cluster={cluster}
            namespace={item.metadata.namespace}
            source={item?.spec?.chart?.spec?.sourceRef}
          />
        ) : null}
        {type === 'gitrepositories' ? (
          <GitReference
            branch={item?.spec?.ref?.branch}
            tag={item?.spec?.ref?.tag}
            semver={item?.spec?.ref?.semver}
            commit={item?.spec?.ref?.commit}
          />
        ) : null}
        {item && item.status && item.status.artifact ? <Artifact artifact={item?.status?.artifact} /> : null}
        <Conditions conditions={item?.status?.conditions} />
        <p>&nbsp;</p>
      </DrawerPanelBody>
    </DrawerPanelContent>
  );
};

export default Details;
