import {
  Card,
  CardBody,
  CardTitle,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
} from '@patternfly/react-core';
import React from 'react';

import { IArtifact } from '../../../utils/interfaces';

interface IArtifactProps {
  artifact: IArtifact;
}

const Artifact: React.FunctionComponent<IArtifactProps> = ({ artifact }: IArtifactProps) => {
  return (
    <Card className="pf-u-mb-lg" isCompact={true}>
      <CardTitle>Artifact</CardTitle>
      <CardBody>
        <DescriptionList className="pf-u-text-break-word" isHorizontal={true}>
          <DescriptionListGroup>
            <DescriptionListTerm>Checksum</DescriptionListTerm>
            <DescriptionListDescription>{artifact.checksum ? artifact.checksum : '-'}</DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>Revision</DescriptionListTerm>
            <DescriptionListDescription>{artifact.revision ? artifact.revision : '-'}</DescriptionListDescription>
          </DescriptionListGroup>
        </DescriptionList>
      </CardBody>
    </Card>
  );
};

export default Artifact;
