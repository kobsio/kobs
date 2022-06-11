import {
  Card,
  CardBody,
  CardTitle,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
} from '@patternfly/react-core';
import { Link } from 'react-router-dom';
import React from 'react';

import { IPluginInstance, pluginBasePath } from '@kobsio/shared';
import { ICrossNamespaceObjectReference } from '../../../utils/interfaces';
import { convertSourceKind } from '../../../utils/helpers';

interface IKustomizationInfoProps {
  instance: IPluginInstance;
  cluster: string;
  source?: ICrossNamespaceObjectReference;
  namespace?: string;
  path?: string;
  interval?: string;
  prune?: string;
  appliedRevision?: string;
}

const KustomizationInfo: React.FunctionComponent<IKustomizationInfoProps> = ({
  instance,
  cluster,
  source,
  namespace,
  path,
  interval,
  prune,
  appliedRevision,
}: IKustomizationInfoProps) => {
  return (
    <Card className="pf-u-mb-lg" isCompact={true}>
      <CardTitle>Info</CardTitle>
      <CardBody>
        <DescriptionList className="pf-u-text-break-word" isHorizontal={true}>
          <DescriptionListGroup>
            <DescriptionListTerm>Source</DescriptionListTerm>
            <DescriptionListDescription>
              {source ? (
                <Link
                  to={`${pluginBasePath(instance)}?type=${convertSourceKind(
                    source.kind,
                  )}&cluster=${cluster}&namespace=${source.namespace || namespace}`}
                >
                  {source.kind} ({source.namespace || namespace})
                </Link>
              ) : (
                '-'
              )}
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>Namespace</DescriptionListTerm>
            <DescriptionListDescription>{namespace ? namespace : '-'}</DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>Path</DescriptionListTerm>
            <DescriptionListDescription>{path ? path : '-'}</DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>Interval</DescriptionListTerm>
            <DescriptionListDescription>{interval ? interval : '-'}</DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>Prune</DescriptionListTerm>
            <DescriptionListDescription>
              {prune !== undefined ? (prune ? 'true' : 'false') : '-'}
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>Applied Revision</DescriptionListTerm>
            <DescriptionListDescription>{appliedRevision ? appliedRevision : '-'}</DescriptionListDescription>
          </DescriptionListGroup>
        </DescriptionList>
      </CardBody>
    </Card>
  );
};

export default KustomizationInfo;
