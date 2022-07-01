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

interface IHelmInfoProps {
  interval?: string;
  chart?: string;
  version?: string;
  suspend?: boolean;
}

const HelmInfo: React.FunctionComponent<IHelmInfoProps> = ({ interval, chart, version, suspend }: IHelmInfoProps) => {
  return (
    <Card className="pf-u-mb-lg" isCompact={true}>
      <CardTitle>Info</CardTitle>
      <CardBody>
        <DescriptionList className="pf-u-text-break-word" isHorizontal={true}>
          <DescriptionListGroup>
            <DescriptionListTerm>Interval</DescriptionListTerm>
            <DescriptionListDescription>{interval ? interval : '-'}</DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>Chart</DescriptionListTerm>
            <DescriptionListDescription>{chart ? chart : '-'}</DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>Version</DescriptionListTerm>
            <DescriptionListDescription>{version ? version : '-'}</DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>Suspended</DescriptionListTerm>
            <DescriptionListDescription>{suspend ? 'True' : 'False'}</DescriptionListDescription>
          </DescriptionListGroup>
        </DescriptionList>
      </CardBody>
    </Card>
  );
};

export default HelmInfo;
