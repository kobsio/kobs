import {
  Avatar,
  DataListAction,
  DataListCell,
  DataListItem,
  DataListItemCells,
  DataListItemRow,
  Flex,
  FlexItem,
  Label,
  Tooltip,
} from '@patternfly/react-core';
import React from 'react';

import { IIssue } from '../../utils/issue';
import { getStatusColor } from '../../utils/helpers';

interface IIssueProps {
  issue: IIssue;
}

const Issue: React.FunctionComponent<IIssueProps> = ({ issue }: IIssueProps) => {
  return (
    <DataListItem id={issue.id} aria-labelledby={issue.id}>
      <DataListItemRow>
        <DataListItemCells
          dataListCells={[
            <DataListCell key="main">
              <Flex direction={{ default: 'row' }}>
                <FlexItem alignSelf={{ default: 'alignSelfCenter' }}>
                  <Avatar style={{ height: '24px', width: '24px' }} src={issue.fields?.issuetype?.iconUrl} alt="" />
                </FlexItem>
                <Flex direction={{ default: 'column' }}>
                  <FlexItem>
                    <p>{issue.key}</p>
                    <small>{issue.fields?.summary}</small>
                  </FlexItem>
                </Flex>
              </Flex>
            </DataListCell>,
          ]}
        />
        <DataListAction
          aria-labelledby={issue.id || ''}
          id={issue.id || ''}
          aria-label="Details"
          className="pf-u-text-nowrap"
        >
          <Tooltip content={issue.fields?.priority?.name}>
            <Avatar style={{ height: '14px', width: '14px' }} src={issue.fields?.priority?.iconUrl} alt="" />
          </Tooltip>
          <Label style={{ fontSize: '10px' }} color={getStatusColor(issue.fields?.status?.statusCategory.colorName)}>
            {issue.fields?.status?.name.toUpperCase()}
          </Label>
          {issue.fields?.assignee?.avatarUrls?.['24x24'] && (
            <Tooltip content={issue.fields?.assignee.displayName}>
              <Avatar
                className="pf-u-mr-md"
                style={{ height: '24px', width: '24px' }}
                src={issue.fields?.assignee?.avatarUrls?.['24x24']}
                alt=""
              />
            </Tooltip>
          )}
        </DataListAction>
      </DataListItemRow>
    </DataListItem>
  );
};

export default Issue;
