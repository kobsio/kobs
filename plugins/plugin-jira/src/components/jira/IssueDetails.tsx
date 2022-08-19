import {
  Avatar,
  DataList,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  DrawerActions,
  DrawerCloseButton,
  DrawerHead,
  DrawerPanelBody,
  DrawerPanelContent,
  Flex,
  FlexItem,
  Label,
  TextContent,
  Title,
} from '@patternfly/react-core';
import { Link } from 'react-router-dom';
import React from 'react';
import ReactMarkdown from 'react-markdown';

import { IPluginInstance, LinkWrapper, pluginBasePath } from '@kobsio/shared';
import { AuthContextProvider } from '../../context/AuthContext';
import { IIssue } from '../../utils/issue';
import Issue from './Issue';
import IssueDetailsLink from './IssueDetailsLink';
import { getStatusColor } from '../../utils/helpers';

interface IIssueDetailsProps {
  instance: IPluginInstance;
  issue: IIssue;
  close: () => void;
}

const IssueDetails: React.FunctionComponent<IIssueDetailsProps> = ({ instance, issue, close }: IIssueDetailsProps) => {
  return (
    <DrawerPanelContent minSize="50%">
      <DrawerHead>
        <Title headingLevel="h2" size="xl">
          {issue.fields?.summary}
          <span className="pf-u-pl-sm pf-u-font-size-sm pf-u-color-400">{issue.key}</span>
        </Title>
        <DrawerActions>
          <AuthContextProvider title="" isNotification={false} instance={instance}>
            <IssueDetailsLink issue={issue} />
          </AuthContextProvider>

          <DrawerCloseButton onClick={close} />
        </DrawerActions>
      </DrawerHead>
      <DrawerPanelBody>
        <DescriptionList className="pf-u-text-break-word">
          <DescriptionListGroup>
            <DescriptionListTerm className="pf-u-text-nowrap">Issue Type</DescriptionListTerm>
            <DescriptionListDescription>
              <Flex direction={{ default: 'row' }}>
                <FlexItem alignSelf={{ default: 'alignSelfCenter' }}>
                  {issue.fields?.issuetype?.iconUrl && (
                    <Avatar style={{ height: '24px', width: '24px' }} src={issue.fields?.issuetype?.iconUrl} alt="" />
                  )}
                </FlexItem>
                <FlexItem>{issue.fields?.issuetype?.name || ''}</FlexItem>
              </Flex>
            </DescriptionListDescription>
          </DescriptionListGroup>

          <DescriptionListGroup>
            <DescriptionListTerm className="pf-u-text-nowrap">Assignee</DescriptionListTerm>
            <DescriptionListDescription>
              <Flex direction={{ default: 'row' }}>
                <FlexItem alignSelf={{ default: 'alignSelfCenter' }}>
                  {issue.fields?.assignee?.avatarUrls?.['24x24'] && (
                    <Avatar
                      style={{ height: '24px', width: '24px' }}
                      src={issue.fields?.assignee?.avatarUrls?.['24x24']}
                      alt=""
                    />
                  )}
                </FlexItem>
                <FlexItem>{issue.fields?.assignee?.displayName || ''}</FlexItem>
              </Flex>
            </DescriptionListDescription>
          </DescriptionListGroup>

          <DescriptionListGroup>
            <DescriptionListTerm className="pf-u-text-nowrap">Reporter</DescriptionListTerm>
            <DescriptionListDescription>
              <Flex direction={{ default: 'row' }}>
                <FlexItem alignSelf={{ default: 'alignSelfCenter' }}>
                  {issue.fields?.reporter?.avatarUrls?.['24x24'] && (
                    <Avatar
                      style={{ height: '24px', width: '24px' }}
                      src={issue.fields?.reporter?.avatarUrls?.['24x24']}
                      alt=""
                    />
                  )}
                </FlexItem>
                <FlexItem>{issue.fields?.reporter?.displayName || ''}</FlexItem>
              </Flex>
            </DescriptionListDescription>
          </DescriptionListGroup>

          <DescriptionListGroup>
            <DescriptionListTerm className="pf-u-text-nowrap">Reporter</DescriptionListTerm>
            <DescriptionListDescription>
              <Flex direction={{ default: 'row' }}>
                <FlexItem alignSelf={{ default: 'alignSelfCenter' }}>
                  {issue.fields?.reporter?.avatarUrls?.['24x24'] && (
                    <Avatar
                      style={{ height: '24px', width: '24px' }}
                      src={issue.fields?.reporter?.avatarUrls?.['24x24']}
                      alt=""
                    />
                  )}
                </FlexItem>
                <FlexItem>{issue.fields?.reporter?.displayName || ''}</FlexItem>
              </Flex>
            </DescriptionListDescription>
          </DescriptionListGroup>

          <DescriptionListGroup>
            <DescriptionListTerm className="pf-u-text-nowrap">Status</DescriptionListTerm>
            <DescriptionListDescription>
              <Label color={getStatusColor(issue.fields?.status?.statusCategory.colorName)}>
                {issue.fields?.status?.name.toUpperCase()}
              </Label>
            </DescriptionListDescription>
          </DescriptionListGroup>

          <DescriptionListGroup>
            <DescriptionListTerm className="pf-u-text-nowrap">Description</DescriptionListTerm>
            <DescriptionListDescription>
              <TextContent>
                <ReactMarkdown linkTarget="_blank">{issue.fields?.description || ''}</ReactMarkdown>
              </TextContent>
            </DescriptionListDescription>
          </DescriptionListGroup>

          <DescriptionListGroup>
            <DescriptionListTerm className="pf-u-text-nowrap">Parent</DescriptionListTerm>
            <DescriptionListDescription>
              {issue.fields?.parent && issue.fields?.parent.key ? (
                <Link
                  to={`${pluginBasePath(instance)}/search?jql=${encodeURIComponent(
                    `key = ${issue.fields?.parent.key}`,
                  )}`}
                >
                  <div>{issue.fields?.parent.key}</div>
                </Link>
              ) : null}
            </DescriptionListDescription>
          </DescriptionListGroup>

          <DescriptionListGroup>
            <DescriptionListTerm className="pf-u-text-nowrap">Subtasks</DescriptionListTerm>
            <DescriptionListDescription>
              {issue.fields?.subtasks && issue.fields?.subtasks.length > 0 ? (
                <DataList aria-label="subtasks" isCompact={true}>
                  {issue.fields?.subtasks?.map((issue) => (
                    <LinkWrapper
                      key={issue.id}
                      to={`${pluginBasePath(instance)}/search?jql=${encodeURIComponent(`key = ${issue.key}`)}`}
                    >
                      <Issue issue={issue} />
                    </LinkWrapper>
                  ))}
                </DataList>
              ) : null}
            </DescriptionListDescription>
          </DescriptionListGroup>

          <DescriptionListGroup>
            <DescriptionListTerm className="pf-u-text-nowrap">Linked Issues</DescriptionListTerm>
            <DescriptionListDescription>
              {issue.fields?.issuelinks && issue.fields?.issuelinks.length > 0 ? (
                <DataList aria-label="subtasks" isCompact={true}>
                  {issue.fields?.issuelinks?.map((issue) => (
                    <LinkWrapper
                      key={issue.id}
                      to={`${pluginBasePath(instance)}/search?jql=${encodeURIComponent(
                        `key = ${
                          issue.inwardIssue && issue.inwardIssue.key
                            ? issue.inwardIssue.key
                            : issue.outwardIssue && issue.outwardIssue.key
                            ? issue.outwardIssue.key
                            : ''
                        }`,
                      )}`}
                    >
                      {issue.inwardIssue ? (
                        <Issue issue={issue.inwardIssue} />
                      ) : issue.outwardIssue ? (
                        <Issue issue={issue.outwardIssue} />
                      ) : (
                        <div></div>
                      )}
                    </LinkWrapper>
                  ))}
                </DataList>
              ) : null}
            </DescriptionListDescription>
          </DescriptionListGroup>
        </DescriptionList>
      </DrawerPanelBody>
    </DrawerPanelContent>
  );
};

export default IssueDetails;
