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

import { IArtifactsData, IPage } from '../../utils/interfaces';
import ArtifactsItem from './ArtifactsItem';

interface IArtifactsProps {
  name: string;
  address: string;
  projectName: string;
  repositoryName: string;
  query: string;
  setDetails?: (details: React.ReactNode) => void;
}

const Artifacts: React.FunctionComponent<IArtifactsProps> = ({
  name,
  address,
  projectName,
  repositoryName,
  query,
  setDetails,
}: IArtifactsProps) => {
  const [page, setPage] = useState<IPage>({ page: 1, pageSize: 25 });

  const { isError, isLoading, error, data, refetch } = useQuery<IArtifactsData, Error>(
    ['harbor/artifacts', name, page, projectName, repositoryName, query],
    async () => {
      try {
        const response = await fetch(
          `/api/plugins/harbor/artifacts/${name}?projectName=${projectName}&repositoryName=${repositoryName}&query=${query}&page=${page.page}&pageSize=${page.pageSize}`,
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
            <AlertActionLink onClick={(): Promise<QueryObserverResult<IArtifactsData, Error>> => refetch()}>
              Retry
            </AlertActionLink>
          </React.Fragment>
        }
      >
        <p>{error?.message}</p>
      </Alert>
    );
  }

  if (!data || !data.total || !data.artifacts) {
    return null;
  }

  return (
    <div>
      <Menu>
        <MenuContent>
          <MenuList>
            {data.artifacts.map((artifact) => (
              <ArtifactsItem
                key={artifact.id}
                name={name}
                address={address}
                projectName={projectName}
                repositoryName={repositoryName}
                artifact={artifact}
                setDetails={setDetails}
              />
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

export default Artifacts;
