import {
  Alert,
  AlertActionLink,
  AlertVariant,
  CardFooter,
  DataList,
  Pagination,
  PaginationVariant,
  Spinner,
} from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from '@tanstack/react-query';
import React, { useState } from 'react';

import { IPluginInstance, PluginPanel } from '@kobsio/shared';
import { IIssue } from '../../utils/issue';
import Issue from './Issue';
import IssueDetails from './IssueDetails';

interface IIssuesProps {
  title: string;
  description?: string;
  instance: IPluginInstance;
  jql?: string;
  setDetails?: (details: React.ReactNode) => void;
}

const Issues: React.FunctionComponent<IIssuesProps> = ({
  title,
  description,
  instance,
  jql,
  setDetails,
}: IIssuesProps) => {
  const [page, setPage] = useState<{ page: number; perPage: number }>({ page: 1, perPage: 50 });
  const [selectedIssue, setSelectedIssue] = useState<IIssue>();

  const { isError, isLoading, error, data, refetch } = useQuery<{ issues: IIssue[]; total: number }, Error>(
    ['jira/issues', instance, jql, page],
    async () => {
      const response = await fetch(
        `/api/plugins/jira/issues?jql=${jql || ''}&startAt=${page.page - 1}&maxResults=${page.perPage}`,
        {
          headers: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            'x-kobs-plugin': instance.name,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            'x-kobs-satellite': instance.satellite,
          },
          method: 'get',
        },
      );
      const json = await response.json();

      if (response.status >= 200 && response.status < 300) {
        return json;
      } else {
        if (json.error) {
          throw new Error(json.error);
        } else {
          throw new Error('An unknown error occured');
        }
      }
    },
  );

  const selectIssue = (id: string): void => {
    if (setDetails) {
      const issue = data?.issues.filter((issue) => issue.id === id);
      if (issue && issue.length === 1) {
        setSelectedIssue(issue[0]);
        setDetails(
          <IssueDetails
            instance={instance}
            issue={issue[0]}
            close={(): void => {
              setSelectedIssue(undefined);
              setDetails(undefined);
            }}
          />,
        );
      }
    }
  };

  return (
    <PluginPanel
      title={title}
      description={description}
      footer={
        <CardFooter>
          <Pagination
            style={{ padding: 0 }}
            isCompact={true}
            itemCount={data?.total || 0}
            perPage={page.perPage}
            page={page.page}
            variant={PaginationVariant.bottom}
            onSetPage={(event: React.MouseEvent | React.KeyboardEvent | MouseEvent, newPage: number): void =>
              setPage({ ...page, page: newPage })
            }
            onPerPageSelect={(event: React.MouseEvent | React.KeyboardEvent | MouseEvent, newPerPage: number): void =>
              setPage({ ...page, page: 1, perPage: newPerPage })
            }
            onFirstClick={(event: React.SyntheticEvent<HTMLButtonElement>, newPage: number): void =>
              setPage({ ...page, page: newPage })
            }
            onLastClick={(event: React.SyntheticEvent<HTMLButtonElement>, newPage: number): void =>
              setPage({ ...page, page: newPage })
            }
            onNextClick={(event: React.SyntheticEvent<HTMLButtonElement>, newPage: number): void =>
              setPage({ ...page, page: newPage })
            }
            onPreviousClick={(event: React.SyntheticEvent<HTMLButtonElement>, newPage: number): void =>
              setPage({ ...page, page: newPage })
            }
          />
        </CardFooter>
      }
    >
      {isLoading ? (
        <div className="pf-u-text-align-center">
          <Spinner />
        </div>
      ) : isError ? (
        <Alert
          variant={AlertVariant.danger}
          isInline={true}
          title="Could not get issues"
          actionLinks={
            <React.Fragment>
              <AlertActionLink
                onClick={(): Promise<QueryObserverResult<{ issues: IIssue[]; total: number }, Error>> => refetch()}
              >
                Retry
              </AlertActionLink>
            </React.Fragment>
          }
        >
          <p>{error?.message}</p>
        </Alert>
      ) : data && data.issues.length > 0 ? (
        <DataList
          aria-label="issues"
          isCompact={true}
          selectedDataListItemId={selectedIssue ? selectedIssue.id : undefined}
          onSelectDataListItem={setDetails ? selectIssue : undefined}
        >
          {data.issues.map((issue) => (
            <Issue key={issue.id} issue={issue} />
          ))}
        </DataList>
      ) : (
        <Alert variant={AlertVariant.info} isInline={true} title="No issues found">
          <p>No issues found for the selected JQL filter.</p>
        </Alert>
      )}
    </PluginPanel>
  );
};

export default Issues;
