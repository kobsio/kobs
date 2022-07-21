import { CardFooter, Pagination, PaginationVariant } from '@patternfly/react-core';
import React from 'react';

export interface IPage {
  page: number;
  perPage: number;
}

interface IGitHubPaginationProps {
  itemCount: number;
  page: IPage;
  setPage: (page: IPage) => void;
}

const GitHubPagination: React.FunctionComponent<IGitHubPaginationProps> = ({
  itemCount,
  page,
  setPage,
}: IGitHubPaginationProps) => {
  return (
    <CardFooter>
      <Pagination
        style={{ padding: 0 }}
        isCompact={true}
        itemCount={itemCount}
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
  );
};

export default GitHubPagination;
