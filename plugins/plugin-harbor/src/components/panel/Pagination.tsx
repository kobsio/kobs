import { PaginationVariant, Pagination as PatternflyPagination } from '@patternfly/react-core';
import React from 'react';

import { IOptions } from '../../utils/interfaces';

export interface IPaginationProps {
  count: number;
  options: IOptions;
  setOptions: (data: IOptions) => void;
  noPadding: boolean;
}

const Pagination: React.FunctionComponent<IPaginationProps> = ({
  count,
  options,
  setOptions,
  noPadding,
}: IPaginationProps) => {
  return (
    <PatternflyPagination
      style={noPadding ? { padding: 0 } : undefined}
      itemCount={count}
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

export default Pagination;
