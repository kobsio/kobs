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

import { TApiType } from '../../../utils/interfaces';

interface ISourceInfoProps {
  type: TApiType;
  url?: string;
  timeout?: string;
}

const SourceInfo: React.FunctionComponent<ISourceInfoProps> = ({ type, url, timeout }: ISourceInfoProps) => {
  return (
    <Card className="pf-u-mb-lg" isCompact={true}>
      <CardTitle>Info</CardTitle>
      <CardBody>
        <DescriptionList className="pf-u-text-break-word" isHorizontal={true}>
          <DescriptionListGroup>
            <DescriptionListTerm>Type</DescriptionListTerm>
            <DescriptionListDescription>
              {type === 'gitrepositories.source.toolkit.fluxcd.io/v1beta1'
                ? 'Git'
                : type === 'helmrepositories.source.toolkit.fluxcd.io/v1beta1'
                ? 'Helm'
                : type === 'buckets.source.toolkit.fluxcd.io/v1beta1'
                ? 'Bucket'
                : '-'}
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>URL</DescriptionListTerm>
            <DescriptionListDescription>{url ? url : '-'}</DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>Timeout</DescriptionListTerm>
            <DescriptionListDescription>{timeout ? timeout : '-'}</DescriptionListDescription>
          </DescriptionListGroup>
        </DescriptionList>
      </CardBody>
    </Card>
  );
};

export default SourceInfo;
