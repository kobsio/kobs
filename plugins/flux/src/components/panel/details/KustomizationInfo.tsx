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

interface IKustomizationInfoProps {
  name: string;
  cluster: string;
  source?: string;
  namespace?: string;
  path?: string;
  interval?: string;
  prune?: string;
  appliedRevision?: string;
}

const KustomizationInfo: React.FunctionComponent<IKustomizationInfoProps> = ({
  name,
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
              {source ? <Link to={`/${name}/?type=sources&cluster=${cluster}`}>{source}</Link> : '-'}
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
