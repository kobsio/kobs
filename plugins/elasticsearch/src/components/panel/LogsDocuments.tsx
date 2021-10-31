import { Pagination, PaginationVariant } from '@patternfly/react-core';
import React, { useState } from 'react';
import { TableComposable, TableVariant, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';

import { IDocument } from '../../utils/interfaces';
import LogsDocument from './LogsDocument';

interface IPage {
  page: number;
  perPage: number;
}

interface ILogsDocumentsProps {
  documents: IDocument[];
  fields?: string[];
  addFilter?: (filter: string) => void;
  selectField?: (field: string) => void;
}

const LogsDocuments: React.FunctionComponent<ILogsDocumentsProps> = ({
  documents,
  fields,
  addFilter,
  selectField,
}: ILogsDocumentsProps) => {
  const [page, setPage] = useState<IPage>({ page: 1, perPage: 100 });

  return (
    <TableComposable aria-label="Logs" variant={TableVariant.compact} borders={false}>
      <Thead>
        <Tr>
          <Th />
          <Th>Time</Th>
          {fields && fields.length > 0 ? (
            fields.map((selectedField, index) => <Th key={index}>{selectedField}</Th>)
          ) : (
            <Th>_source</Th>
          )}
          <Th />
        </Tr>
      </Thead>
      <Tbody>
        {documents
          ? documents
              .slice((page.page - 1) * page.perPage, page.page * page.perPage)
              .map((document, index) => (
                <LogsDocument
                  key={index}
                  document={document}
                  fields={fields}
                  addFilter={addFilter}
                  selectField={selectField}
                />
              ))
          : null}
      </Tbody>
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
                  setPage({ page: newPage, perPage: page.perPage })
                }
                onPerPageSelect={(
                  event: React.MouseEvent | React.KeyboardEvent | MouseEvent,
                  newPerPage: number,
                ): void => setPage({ page: page.page, perPage: newPerPage })}
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
            </Td>
            <Td />
          </Tr>
        </Tbody>
      )}
    </TableComposable>
  );
};

export default LogsDocuments;
