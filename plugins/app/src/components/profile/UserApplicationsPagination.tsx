import { Pagination, PaginationVariant } from '@patternfly/react-core';
import React from 'react';
import { useQuery } from '@tanstack/react-query';

export interface IApplicationsPagination {
  options: { page: number; perPage: number };
  setOptions: (data: { page: number; perPage: number }) => void;
}

const Applications: React.FunctionComponent<IApplicationsPagination> = ({
  options,
  setOptions,
}: IApplicationsPagination) => {
  const { data } = useQuery<{ count: number }, Error>(['app/applications/user/count'], async () => {
    const response = await fetch(`/api/applications/count`, {
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
  });

  return (
    <Pagination
      style={{ padding: 0 }}
      itemCount={data && data.count ? data.count : 0}
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
  );
};

export default Applications;
