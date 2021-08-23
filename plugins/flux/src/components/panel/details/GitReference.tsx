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

interface IGitReferenceProps {
  branch?: string;
  tag?: string;
  semver?: string;
  commit?: string;
}

const GitReference: React.FunctionComponent<IGitReferenceProps> = ({
  branch,
  tag,
  semver,
  commit,
}: IGitReferenceProps) => {
  return (
    <Card className="pf-u-mb-lg" isCompact={true}>
      <CardTitle>Git Reference</CardTitle>
      <CardBody>
        <DescriptionList className="pf-u-text-break-word" isHorizontal={true}>
          <DescriptionListGroup>
            <DescriptionListTerm>Branch</DescriptionListTerm>
            <DescriptionListDescription>{branch ? branch : '-'}</DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>Tag</DescriptionListTerm>
            <DescriptionListDescription>{tag ? tag : '-'}</DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>SemVer</DescriptionListTerm>
            <DescriptionListDescription>{semver ? semver : '-'}</DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>Commit</DescriptionListTerm>
            <DescriptionListDescription>{commit ? commit : '-'}</DescriptionListDescription>
          </DescriptionListGroup>
        </DescriptionList>
      </CardBody>
    </Card>
  );
};

export default GitReference;
