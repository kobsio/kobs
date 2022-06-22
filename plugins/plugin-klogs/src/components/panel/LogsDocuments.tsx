import {
  IExtraColumnData,
  SortByDirection,
  TableComposable,
  TableVariant,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '@patternfly/react-table';
import { Pagination, PaginationVariant } from '@patternfly/react-core';
import React, { useEffect, useState } from 'react';

import { IDocument } from '../../utils/interfaces';
import LogsDocument from './LogsDocument';

interface IPage {
  page: number;
  perPage: number;
}

interface ILogsDocumentsProps {
  documents?: IDocument[];
  fields?: string[];
  order?: string;
  orderBy?: string;
  addFilter?: (filter: string) => void;
  changeOrder?: (order: string, orderBy: string) => void;
  selectField?: (field: string) => void;
}

const LogsDocuments: React.FunctionComponent<ILogsDocumentsProps> = ({
  documents,
  fields,
  order,
  orderBy,
  addFilter,
  changeOrder,
  selectField,
}: ILogsDocumentsProps) => {
  const [page, setPage] = useState<IPage>({ page: 1, perPage: 100 });

  const activeSortIndex = fields && orderBy && orderBy !== 'timestamp' ? fields?.indexOf(orderBy) : -1;
  const activeSortDirection = order === 'ascending' ? 'asc' : 'desc';

  useEffect(() => {
    setPage({ page: 1, perPage: 100 });
  }, [documents]);

  return (
    <TableComposable aria-label="Logs" variant={TableVariant.compact} borders={true}>
      <Thead>
        <Tr>
          <Th />
          <Th
            tooltip={null}
            sort={{
              columnIndex: -1,
              onSort: (
                event: React.MouseEvent,
                columnIndex: number,
                sortByDirection: SortByDirection,
                extraData: IExtraColumnData,
              ): void => {
                if (changeOrder) {
                  changeOrder(sortByDirection === 'asc' ? 'ascending' : 'descending', 'timestamp');
                }
              },
              sortBy: { direction: activeSortDirection, index: activeSortIndex },
            }}
          >
            Time
          </Th>
          {fields && fields.length > 0 ? (
            fields.map((field, index) => (
              <Th
                key={index}
                tooltip={null}
                sort={{
                  columnIndex: index,
                  onSort: (
                    event: React.MouseEvent,
                    columnIndex: number,
                    sortByDirection: SortByDirection,
                    extraData: IExtraColumnData,
                  ): void => {
                    if (changeOrder) {
                      changeOrder(sortByDirection === 'asc' ? 'ascending' : 'descending', field);
                    }
                  },
                  sortBy: { direction: activeSortDirection, index: activeSortIndex },
                }}
              >
                {field}
              </Th>
            ))
          ) : (
            <Th>Log</Th>
          )}
          <Th />
        </Tr>
      </Thead>

      {documents
        ? documents
            .slice((page.page - 1) * page.perPage, page.page * page.perPage)
            .map((document, index) => (
              <LogsDocument
                key={document['timestamp'] + index}
                document={document}
                fields={fields}
                addFilter={addFilter}
                selectField={selectField}
              />
            ))
        : null}

      {documents && (
        <Tbody>
          <Tr>
            <Td />
            <Td colSpan={fields && fields.length > 0 ? fields.length + 1 : 2}>
              <Pagination
                itemCount={documents.length}
                widgetId="pagination-options-menu-bottom"
                perPage={page.perPage}
                page={page.page}
                variant={PaginationVariant.bottom}
                onSetPage={(event: React.MouseEvent | React.KeyboardEvent | MouseEvent, newPage: number): void =>
                  setPage({ ...page, page: newPage })
                }
                onPerPageSelect={(
                  event: React.MouseEvent | React.KeyboardEvent | MouseEvent,
                  newPerPage: number,
                ): void => setPage({ page: 1, perPage: newPerPage })}
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
      )}
    </TableComposable>
  );
};

export default LogsDocuments;
