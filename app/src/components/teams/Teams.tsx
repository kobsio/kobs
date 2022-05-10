import {
  Alert,
  AlertActionLink,
  AlertVariant,
  Gallery,
  PageSection,
  PageSectionVariants,
  Pagination,
  PaginationVariant,
  SearchInput,
  Spinner,
  ToggleGroup,
  ToggleGroupItem,
  ToolbarContent,
  ToolbarItem,
} from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from 'react-query';
import React, { useState } from 'react';

import { PageContentSection, PageHeaderSection, useDebounce } from '@kobsio/shared';
import { ITeam } from '../../crds/team';
import TeamsItem from './TeamsItem';

const Teams: React.FunctionComponent = () => {
  const [state, setState] = useState<{
    all: boolean;
    page: number;
    perPage: number;
    searchTerm: string;
  }>({ all: false, page: 1, perPage: 10, searchTerm: '' });
  const debouncedSearchTerm = useDebounce<string>(state.searchTerm, 500);

  const { isError, isLoading, error, data, refetch } = useQuery<ITeam[], Error>(
    ['teams/teams', state.all],
    async () => {
      const response = await fetch(`/api/teams?all=${state.all}`, {
        method: 'get',
      });
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

  return (
    <React.Fragment>
      <PageHeaderSection title="Teams" description="A list of all available teams." />

      <PageContentSection
        toolbarContent={
          <ToolbarContent>
            <ToolbarItem>
              <ToggleGroup aria-label="Select owned or all teams">
                <ToggleGroupItem
                  className="pf-u-text-nowrap"
                  text="Owned"
                  isSelected={state.all === false}
                  onChange={(): void => setState({ ...state, all: false, page: 1 })}
                />
                <ToggleGroupItem
                  className="pf-u-text-nowrap"
                  text="All"
                  isSelected={state.all === true}
                  onChange={(): void => setState({ ...state, all: true, page: 1 })}
                />
              </ToggleGroup>
            </ToolbarItem>
            <ToolbarItem variant="search-filter">
              <SearchInput
                aria-label="Search team input"
                onChange={(value: string): void => setState({ ...state, page: 1, searchTerm: value })}
                value={state.searchTerm}
                onClear={(): void => setState({ ...state, page: 1, searchTerm: '' })}
              />
            </ToolbarItem>
          </ToolbarContent>
        }
        panelContent={undefined}
      >
        {isLoading ? (
          <div className="pf-u-text-align-center">
            <Spinner />
          </div>
        ) : isError ? (
          <Alert
            variant={AlertVariant.danger}
            title="An error occured while teams were fetched"
            actionLinks={
              <React.Fragment>
                <AlertActionLink onClick={(): Promise<QueryObserverResult<ITeam[], Error>> => refetch()}>
                  Retry
                </AlertActionLink>
              </React.Fragment>
            }
          >
            <p>{error?.message}</p>
          </Alert>
        ) : data && data.length > 0 ? (
          <Gallery hasGutter={true}>
            {data
              .filter((team) => team.group.includes(debouncedSearchTerm))
              .slice((state.page - 1) * state.perPage, state.page * state.perPage)
              .map((team) => (
                <TeamsItem key={team.group} team={team} />
              ))}
          </Gallery>
        ) : (
          <div></div>
        )}
      </PageContentSection>

      <PageSection
        isFilled={false}
        sticky="bottom"
        padding={{ default: 'noPadding' }}
        variant={PageSectionVariants.light}
      >
        <Pagination
          itemCount={data ? data.length : 0}
          perPage={state.perPage}
          page={state.page}
          variant={PaginationVariant.bottom}
          onSetPage={(event: React.MouseEvent | React.KeyboardEvent | MouseEvent, newPage: number): void =>
            setState({ ...state, page: newPage })
          }
          onPerPageSelect={(event: React.MouseEvent | React.KeyboardEvent | MouseEvent, newPerPage: number): void =>
            setState({ ...state, perPage: newPerPage })
          }
          onFirstClick={(event: React.SyntheticEvent<HTMLButtonElement>, newPage: number): void =>
            setState({ ...state, page: newPage })
          }
          onLastClick={(event: React.SyntheticEvent<HTMLButtonElement>, newPage: number): void =>
            setState({ ...state, page: newPage })
          }
          onNextClick={(event: React.SyntheticEvent<HTMLButtonElement>, newPage: number): void =>
            setState({ ...state, page: newPage })
          }
          onPreviousClick={(event: React.SyntheticEvent<HTMLButtonElement>, newPage: number): void =>
            setState({ ...state, page: newPage })
          }
        />
      </PageSection>
    </React.Fragment>
  );
};

export default Teams;
