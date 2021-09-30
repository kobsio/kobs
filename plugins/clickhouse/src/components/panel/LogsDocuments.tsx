import {
  IExtraColumnData,
  SortByDirection,
  TableComposable,
  TableVariant,
  Th,
  Thead,
  Tr,
} from '@patternfly/react-table';
import React from 'react';

import { IDocument } from '../../utils/interfaces';
import LogsDocument from './LogsDocument';

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
  const activeSortIndex = fields && orderBy ? fields?.indexOf(orderBy) : -1;
  const activeSortDirection = order === 'descending' ? 'desc' : 'asc';

  return (
    <TableComposable aria-label="Logs" variant={TableVariant.compact} borders={false}>
      <Thead>
        <Tr>
          <Th />
          <Th>Time</Th>
          {fields && fields.length > 0 ? (
            fields.map((field, index) => (
              <Th
                key={index}
                sort={{
                  columnIndex: index,
                  onSort: (
                    event: React.MouseEvent,
                    columnIndex: number,
                    sortByDirection: SortByDirection,
                    extraData: IExtraColumnData,
                  ): void => {
                    if (changeOrder) {
                      changeOrder(sortByDirection === 'desc' ? 'descending' : 'ascending', field);
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
        ? documents.map((document, index) => (
            <LogsDocument
              key={index}
              document={document}
              fields={fields}
              addFilter={addFilter}
              selectField={selectField}
            />
          ))
        : null}
    </TableComposable>
  );
};

export default LogsDocuments;
