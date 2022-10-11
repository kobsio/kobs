import { Pagination, PaginationVariant } from '@patternfly/react-core';
import React, { useEffect, useState } from 'react';
import { TableComposable, TableVariant, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';

import { ILog } from '../../utils/interfaces';
import LogsTableRow from './LogsTableRow';

interface IPage {
  page: number;
  perPage: number;
}

interface ILogsTableProps {
  logs: ILog[];
}

const LogsTable: React.FunctionComponent<ILogsTableProps> = ({ logs }: ILogsTableProps) => {
  const [page, setPage] = useState<IPage>({ page: 1, perPage: 100 });

  useEffect(() => {
    setPage({ page: 1, perPage: 100 });
  }, [logs]);

  return (
    <TableComposable aria-label="Logs" variant={TableVariant.compact} borders={true}>
      <Thead>
        <Tr>
          <Th />
          <Th tooltip={null}>Time</Th>
          <Th>Host</Th>
          <Th>Service</Th>
          <Th>Content</Th>
          <Th />
        </Tr>
      </Thead>

      {logs.slice((page.page - 1) * page.perPage, page.page * page.perPage).map((log, index) => (
        <LogsTableRow key={log.id} log={log} />
      ))}

      <Tbody>
        <Tr>
          <Td />
          <Td colSpan={6}>
            <Pagination
              itemCount={logs.length}
              widgetId="pagination-options-menu-bottom"
              perPage={page.perPage}
              page={page.page}
              variant={PaginationVariant.bottom}
              onSetPage={(event: React.MouseEvent | React.KeyboardEvent | MouseEvent, newPage: number): void =>
                setPage({ ...page, page: newPage })
              }
              onPerPageSelect={(event: React.MouseEvent | React.KeyboardEvent | MouseEvent, newPerPage: number): void =>
                setPage({ page: 1, perPage: newPerPage })
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
          </Td>
          <Td />
        </Tr>
      </Tbody>
    </TableComposable>
  );
};

export default LogsTable;
