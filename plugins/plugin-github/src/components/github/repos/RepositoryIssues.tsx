import {
  Alert,
  AlertActionLink,
  AlertVariant,
  Badge,
  CardActions,
  DataList,
  DataListCell,
  DataListItem,
  DataListItemCells,
  DataListItemRow,
  Flex,
  FlexItem,
  Spinner,
  ToggleGroup,
  ToggleGroupItem,
} from '@patternfly/react-core';
import { IssueClosedIcon, IssueOpenedIcon } from '@primer/octicons-react';
import { QueryObserverResult, useQuery } from 'react-query';
import React, { useContext, useState } from 'react';

import { AuthContext, IAuthContext } from '../../../context/AuthContext';
import GitHubPagination, { IPage } from '../GitHubPagination';
import { IPluginInstance, LinkWrapper, PluginPanel, formatTime } from '@kobsio/shared';
import { TRepositoryIssues } from '../../../utils/interfaces';

interface IRepositoryIssuesProps {
  title: string;
  description?: string;
  repo: string;
  instance: IPluginInstance;
}

const RepositoryIssues: React.FunctionComponent<IRepositoryIssuesProps> = ({
  title,
  description,
  repo,
  instance,
}: IRepositoryIssuesProps) => {
  const authContext = useContext<IAuthContext>(AuthContext);
  const [page, setPage] = useState<IPage>({ page: 1, perPage: 20 });
  const [state, setState] = useState<'open' | 'closed' | 'all'>('open');

  const { isError, isLoading, error, data, refetch } = useQuery<TRepositoryIssues, Error>(
    ['github/repo/issues', authContext.organization, repo, state, instance],
    async () => {
      try {
        const issues: TRepositoryIssues = [];
        const octokit = authContext.getOctokitClient();

        for await (const response of octokit.paginate.iterator(octokit.rest.issues.listForRepo, {
          owner: authContext.organization,
          repo: repo,
          state: state,
        })) {
          const filteredIssues = response.data.filter((issue) => issue.pull_request === undefined);
          issues.push(...filteredIssues);
          if (issues.length >= 100) {
            break;
          }
        }

        return issues;
      } catch (err) {
        throw err;
      }
    },
  );

  return (
    <PluginPanel
      title={title}
      description={description}
      actions={
        <CardActions>
          <ToggleGroup aria-label="Type">
            <ToggleGroupItem
              className="pf-u-text-nowrap"
              text="open"
              isSelected={state === 'open'}
              onChange={(): void => setState('open')}
            />
            <ToggleGroupItem
              className="pf-u-text-nowrap"
              text="closed"
              isSelected={state === 'closed'}
              onChange={(): void => setState('closed')}
            />
            <ToggleGroupItem
              className="pf-u-text-nowrap"
              text="all"
              isSelected={state === 'all'}
              onChange={(): void => setState('all')}
            />
          </ToggleGroup>
        </CardActions>
      }
      footer={<GitHubPagination itemCount={data?.length || 0} page={page} setPage={setPage} />}
    >
      {isLoading ? (
        <div className="pf-u-text-align-center">
          <Spinner />
        </div>
      ) : isError ? (
        <Alert
          variant={AlertVariant.danger}
          isInline={true}
          title="Could not get repository issues"
          actionLinks={
            <React.Fragment>
              <AlertActionLink onClick={(): Promise<QueryObserverResult<TRepositoryIssues, Error>> => refetch()}>
                Retry
              </AlertActionLink>
            </React.Fragment>
          }
        >
          <p>{error?.message}</p>
        </Alert>
      ) : data ? (
        <DataList aria-label="issues" isCompact={true}>
          {data.slice((page.page - 1) * page.perPage, page.page * page.perPage).map((issue) => (
            <LinkWrapper key={issue.id} to={issue.html_url}>
              <DataListItem aria-labelledby={issue.title} style={{ cursor: 'pointer' }}>
                <DataListItemRow>
                  <DataListItemCells
                    dataListCells={[
                      <DataListCell key="main">
                        <Flex direction={{ default: 'column' }}>
                          <FlexItem>
                            <p>
                              {state === 'open' ? (
                                <IssueOpenedIcon size={16} fill="#57ab5a" />
                              ) : (
                                <IssueClosedIcon size={16} fill="#986ee2" />
                              )}
                              <span className="pf-u-pl-sm">{issue.title}</span>
                            </p>
                            <small>
                              {issue.closed_at
                                ? `#${issue.number} by ${issue.user?.login || '-'} was closed on ${formatTime(
                                    Math.floor(new Date(issue.closed_at).getTime() / 1000),
                                  )}`
                                : `#${issue.number} opened on ${formatTime(
                                    Math.floor(new Date(issue.created_at).getTime() / 1000),
                                  )} by ${issue.user?.login || '-'}`}
                              <span className="pf-u-pl-sm">
                                {issue.labels.map((label) =>
                                  typeof label === 'string' ? (
                                    <Badge key={label} className="pf-u-pl-sm" isRead={true}>
                                      {label}
                                    </Badge>
                                  ) : (
                                    <Badge
                                      key={label.id}
                                      className="pf-u-pl-sm"
                                      style={label.color ? { backgroundColor: `#${label.color}` } : undefined}
                                    >
                                      {label.name}
                                    </Badge>
                                  ),
                                )}
                              </span>
                            </small>
                          </FlexItem>
                        </Flex>
                      </DataListCell>,
                    ]}
                  />
                </DataListItemRow>
              </DataListItem>
            </LinkWrapper>
          ))}
        </DataList>
      ) : (
        <div></div>
      )}
    </PluginPanel>
  );
};

export default RepositoryIssues;
