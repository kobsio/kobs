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

import { ICrossNamespaceObjectReference } from '../../../utils/interfaces';

interface IHelmSourceProps {
  name: string;
  cluster: string;
  source: ICrossNamespaceObjectReference;
}

const HelmSource: React.FunctionComponent<IHelmSourceProps> = ({ name, cluster, source }: IHelmSourceProps) => {
  return (
    <Card className="pf-u-mb-lg" isCompact={true}>
      <CardTitle>Source</CardTitle>
      <CardBody>
        <DescriptionList className="pf-u-text-break-word" isHorizontal={true}>
          <DescriptionListGroup>
            <DescriptionListTerm>Source</DescriptionListTerm>
            <DescriptionListDescription>
              {source.name ? <Link to={`/${name}/?type=sources&cluster=${cluster}`}>{source.name}</Link> : '-'}
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>Kind</DescriptionListTerm>
            <DescriptionListDescription>{source.kind ? source.kind : '-'}</DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>Namespace</DescriptionListTerm>
            <DescriptionListDescription>{source.namespace ? source.namespace : '-'}</DescriptionListDescription>
          </DescriptionListGroup>
        </DescriptionList>
      </CardBody>
    </Card>
  );
};

export default HelmSource;
