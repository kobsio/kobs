import {
  Alert,
  AlertActionLink,
  AlertVariant,
  DataList,
  PageSection,
  PageSectionVariants,
  Pagination,
  PaginationVariant,
  Spinner,
} from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { IPluginInstance, PageContentSection, PageHeaderSection, PluginPageTitle } from '@kobsio/shared';
import { AuthContextProvider } from '../../context/AuthContext';
import { IIssue } from '../../utils/issue';
import { IOptions } from '../../utils/interfaces';
import Issue from '../jira/Issue';
import IssueDetails from '../jira/IssueDetails';
import SearchActions from './SearchActions';
import SearchToolbar from './SearchToolbar';
import { defaultDescription } from '../../utils/constants';
import { getInitialOptions } from '../../utils/helpers';

interface ISearchProps {
  instance: IPluginInstance;
}

const Search: React.FunctionComponent<ISearchProps> = ({ instance }: ISearchProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [options, setOptions] = useState<IOptions>();
  const [selectedIssue, setSelectedIssue] = useState<IIssue>();
  const [details, setDetails] = useState<React.ReactNode>(undefined);

  const { isError, isLoading, error, data, refetch } = useQuery<{ issues: IIssue[]; total: number }, Error>(
    ['jira/issues', instance, options],
    async () => {
      if (options) {
        const response = await fetch(
          `/api/plugins/jira/issues?jql=${options.jql || ''}&startAt=${options.page - 1}&maxResults=${options.perPage}`,
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
      }
    },
  );

  const changeOptions = (opts: IOptions): void => {
    navigate(`${location.pathname}?jql=${encodeURIComponent(opts.jql)}&page=${opts.page}&perPage=${opts.perPage}`);
  };

  const selectIssue = (id: string): void => {
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
  };

  useEffect(() => {
    setOptions((prevOptions) => getInitialOptions(location.search, !prevOptions));
  }, [location.search]);

  if (!options) {
    return null;
  }

  return (
    <React.Fragment>
      <PageHeaderSection
        component={
          <PluginPageTitle
            satellite={instance.satellite}
            name={instance.name}
            description={instance.description || defaultDescription}
            actions={<SearchActions instance={instance} />}
          />
        }
      />

      <PageContentSection
        hasPadding={true}
        hasDivider={true}
        toolbarContent={<SearchToolbar options={options} setOptions={changeOptions} />}
        panelContent={details}
      >
        <AuthContextProvider title="" isNotification={false} instance={instance}>
          {isLoading ? (
            <div className="pf-u-text-align-center">
              <Spinner />
            </div>
          ) : isError ? (
            <Alert
              variant={AlertVariant.danger}
              isInline={false}
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
              onSelectDataListItem={selectIssue}
            >
              {data.issues.map((issue) => (
                <Issue key={issue.id} issue={issue} />
              ))}
            </DataList>
          ) : (
            <Alert variant={AlertVariant.info} isInline={false} title="No issues found">
              <p>No issues found for the selected JQL filter.</p>
            </Alert>
          )}
        </AuthContextProvider>
      </PageContentSection>

      <PageSection
        isFilled={false}
        sticky="bottom"
        padding={{ default: 'noPadding' }}
        variant={PageSectionVariants.light}
      >
        <Pagination
          itemCount={data?.total || 0}
          perPage={options.perPage}
          page={options.page}
          variant={PaginationVariant.bottom}
          onSetPage={(event: React.MouseEvent | React.KeyboardEvent | MouseEvent, newPage: number): void =>
            setOptions({ ...options, page: newPage })
          }
          onPerPageSelect={(event: React.MouseEvent | React.KeyboardEvent | MouseEvent, newPerPage: number): void =>
            setOptions({ ...options, page: 1, perPage: newPerPage })
          }
          onFirstClick={(event: React.SyntheticEvent<HTMLButtonElement>, newPage: number): void =>
            setOptions({ ...options, page: newPage })
          }
          onLastClick={(event: React.SyntheticEvent<HTMLButtonElement>, newPage: number): void =>
            setOptions({ ...options, page: newPage })
          }
          onNextClick={(event: React.SyntheticEvent<HTMLButtonElement>, newPage: number): void =>
            setOptions({ ...options, page: newPage })
          }
          onPreviousClick={(event: React.SyntheticEvent<HTMLButtonElement>, newPage: number): void =>
            setOptions({ ...options, page: newPage })
          }
        />
      </PageSection>
    </React.Fragment>
  );
};

export default Search;
