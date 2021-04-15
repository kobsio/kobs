import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  SimpleList,
  SimpleListItem,
} from '@patternfly/react-core';
import React, { memo } from 'react';

import { timeDifference } from 'utils/helpers';

export interface IMetadata {
  annotations?: Record<string, string>;
  creationTimestamp: string;
  labels?: Record<string, string>;
  name: string;
  namespace: string;
}

export interface IMetaDataDescriptionListProps {
  metadata: IMetadata;
}

interface IObjectEntryListProps {
  object: Record<string, string>;
}

const ObjectEntryList = ({ object }: IObjectEntryListProps): JSX.Element => {
  return (
    <SimpleList>
      {Object.entries(object).map(([key, value]: string[]) => {
        return (
          <SimpleListItem key={`${key}: ${value}`}>
            <b>{key}: </b>
            {value}
          </SimpleListItem>
        );
      })}
    </SimpleList>
  );
};

export default memo(function metaDataDescriptionList({ metadata }: IMetaDataDescriptionListProps): JSX.Element {
  return (
    <DescriptionList>
      <DescriptionListGroup>
        <DescriptionListTerm>Name</DescriptionListTerm>
        <DescriptionListDescription>{metadata.name}</DescriptionListDescription>
      </DescriptionListGroup>
      <DescriptionListGroup>
        <DescriptionListTerm>Namespace</DescriptionListTerm>
        <DescriptionListDescription>{metadata.namespace}</DescriptionListDescription>
      </DescriptionListGroup>
      <DescriptionListGroup>
        <DescriptionListTerm>Labels</DescriptionListTerm>
        <DescriptionListDescription>
          {metadata.labels ? <ObjectEntryList object={metadata.labels} /> : '-'}
        </DescriptionListDescription>
      </DescriptionListGroup>
      <DescriptionListGroup>
        <DescriptionListTerm>Annotations</DescriptionListTerm>
        <DescriptionListDescription>
          {metadata.annotations ? <ObjectEntryList object={metadata.annotations} /> : '-'}
        </DescriptionListDescription>
      </DescriptionListGroup>
      <DescriptionListGroup>
        <DescriptionListTerm>Age</DescriptionListTerm>
        <DescriptionListDescription>
          {timeDifference(new Date().getTime(), new Date(metadata.creationTimestamp.toString()).getTime())}
        </DescriptionListDescription>
      </DescriptionListGroup>
    </DescriptionList>
  );
});
