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

import { TType } from '../../../utils/interfaces';

interface ISourceInfoProps {
  type: TType;
  url?: string;
  timeout?: string;
  suspend?: boolean;
}

const SourceInfo: React.FunctionComponent<ISourceInfoProps> = ({ type, url, timeout, suspend }: ISourceInfoProps) => {
  return (
    <Card className="pf-u-mb-lg" isCompact={true}>
      <CardTitle>Info</CardTitle>
      <CardBody>
        <DescriptionList className="pf-u-text-break-word" isHorizontal={true}>
          <DescriptionListGroup>
            <DescriptionListTerm>Type</DescriptionListTerm>
            <DescriptionListDescription>
              {type === 'gitrepositories'
                ? 'Git'
                : type === 'helmrepositories'
                ? 'Helm'
                : type === 'buckets'
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
          <DescriptionListGroup>
            <DescriptionListTerm>Suspended</DescriptionListTerm>
            <DescriptionListDescription>{suspend ? 'True' : 'False'}</DescriptionListDescription>
          </DescriptionListGroup>
        </DescriptionList>
      </CardBody>
    </Card>
  );
};

export default SourceInfo;
