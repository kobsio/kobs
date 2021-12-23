import {
  Alert,
  AlertActionLink,
  AlertVariant,
  Menu,
  MenuContent,
  MenuList,
  Pagination,
  PaginationVariant,
  Spinner,
} from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from 'react-query';
import React, { useState } from 'react';

import { IPage, IRepositoriesData } from '../../utils/interfaces';
import RepositoriesItem from './RepositoriesItem';

interface IRepositoriesProps {
  name: string;
  projectName: string;
  query: string;
}

const Repositories: React.FunctionComponent<IRepositoriesProps> = ({
  name,
  projectName,
  query,
}: IRepositoriesProps) => {
  const [page, setPage] = useState<IPage>({ page: 1, pageSize: 25 });

  const { isError, isLoading, error, data, refetch } = useQuery<IRepositoriesData, Error>(
    ['harbor/repositories', name, page, projectName, query],
    async () => {
      try {
        const response = await fetch(
          `/api/plugins/harbor/${name}/repositories?projectName=${projectName}&query=${query}&page=${page.page}&pageSize=${page.pageSize}`,
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
        title="Could not get repositories"
        actionLinks={
          <React.Fragment>
            <AlertActionLink onClick={(): Promise<QueryObserverResult<IRepositoriesData, Error>> => refetch()}>
              Retry
            </AlertActionLink>
          </React.Fragment>
        }
      >
        <p>{error?.message}</p>
      </Alert>
    );
  }

  if (!data || !data.total || !data.repositories) {
    return null;
  }

  return (
    <div>
      <Menu>
        <MenuContent>
          <MenuList>
            {data.repositories.map((repository) => (
              <RepositoriesItem key={repository.id} name={name} projectName={projectName} repository={repository} />
            ))}
          </MenuList>
        </MenuContent>
      </Menu>

      <p>&nbsp;</p>

      <Pagination
        itemCount={data.total}
        widgetId="pagination-options-menu-bottom"
        perPage={page.pageSize}
        page={page.page}
        variant={PaginationVariant.bottom}
        onSetPage={(event: React.MouseEvent | React.KeyboardEvent | MouseEvent, newPage: number): void =>
          setPage({ page: newPage, pageSize: page.pageSize })
        }
        onPerPageSelect={(event: React.MouseEvent | React.KeyboardEvent | MouseEvent, newPerPage: number): void =>
          setPage({ page: page.page, pageSize: newPerPage })
        }
        onFirstClick={(event: React.SyntheticEvent<HTMLButtonElement>, newPage: number): void =>
          setPage({ page: newPage, pageSize: page.pageSize })
        }
        onLastClick={(event: React.SyntheticEvent<HTMLButtonElement>, newPage: number): void =>
          setPage({ page: newPage, pageSize: page.pageSize })
        }
        onNextClick={(event: React.SyntheticEvent<HTMLButtonElement>, newPage: number): void =>
          setPage({ page: newPage, pageSize: page.pageSize })
        }
        onPreviousClick={(event: React.SyntheticEvent<HTMLButtonElement>, newPage: number): void =>
          setPage({ page: newPage, pageSize: page.pageSize })
        }
      />
    </div>
  );
};

export default Repositories;
