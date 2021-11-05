import {
  Accordion,
  Alert,
  AlertActionLink,
  AlertVariant,
  Pagination,
  PaginationVariant,
  Spinner,
} from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from 'react-query';
import React, { useState } from 'react';

import { IResponseProjects } from '../../utils/interfaces';
import ProjectsItem from './ProjectsItem';

interface IPage {
  page: number;
  perPage: number;
}

interface IProjectsProps {
  name: string;
  query: string;
  url: string;
}

const Projects: React.FunctionComponent<IProjectsProps> = ({ name, query, url }: IProjectsProps) => {
  const [page, setPage] = useState<IPage>({ page: 1, perPage: 25 });

  const { isError, isLoading, error, data, refetch } = useQuery<IResponseProjects, Error>(
    ['sonarqube/projects', name, query, page],
    async () => {
      try {
        const response = await fetch(
          `/api/plugins/sonarqube/projects/${name}?query=${encodeURIComponent(query)}&pageNumber=${
            page.page
          }&pageSize=${page.perPage}`,
          {
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
      } catch (err) {
        throw err;
      }
    },
  );

  if (isLoading) {
    return (
      <div className="pf-u-text-align-center">
        <Spinner />
      </div>
    );
  }

  if (isError) {
    return (
      <Alert
        variant={AlertVariant.danger}
        title="Could not get projects"
        actionLinks={
          <React.Fragment>
            <AlertActionLink onClick={(): Promise<QueryObserverResult<IResponseProjects, Error>> => refetch()}>
              Retry
            </AlertActionLink>
          </React.Fragment>
        }
      >
        <p>{error?.message}</p>
      </Alert>
    );
  }

  if (!data || !data.components || data.components.length === 0) {
    return null;
  }

  return (
    <div>
      <Accordion asDefinitionList={false}>
        {data.components.map((project) => (
          <ProjectsItem key={project.key} name={name} project={project} url={url} />
        ))}
      </Accordion>

      <p>&nbsp;</p>

      <Pagination
        itemCount={data.paging.total}
        widgetId="pagination-options-menu-bottom"
        perPage={page.perPage}
        page={page.page}
        variant={PaginationVariant.bottom}
        onSetPage={(event: React.MouseEvent | React.KeyboardEvent | MouseEvent, newPage: number): void =>
          setPage({ page: newPage, perPage: page.perPage })
        }
        onPerPageSelect={(event: React.MouseEvent | React.KeyboardEvent | MouseEvent, newPerPage: number): void =>
          setPage({ page: page.page, perPage: newPerPage })
        }
        onFirstClick={(event: React.SyntheticEvent<HTMLButtonElement>, newPage: number): void =>
          setPage({ page: newPage, perPage: page.perPage })
        }
        onLastClick={(event: React.SyntheticEvent<HTMLButtonElement>, newPage: number): void =>
          setPage({ page: newPage, perPage: page.perPage })
        }
        onNextClick={(event: React.SyntheticEvent<HTMLButtonElement>, newPage: number): void =>
          setPage({ page: newPage, perPage: page.perPage })
        }
        onPreviousClick={(event: React.SyntheticEvent<HTMLButtonElement>, newPage: number): void =>
          setPage({ page: newPage, perPage: page.perPage })
        }
      />
    </div>
  );
};

export default Projects;
