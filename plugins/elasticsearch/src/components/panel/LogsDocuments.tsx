import { TableComposable, TableVariant, Tbody, Th, Thead, Tr } from '@patternfly/react-table';
import React from 'react';

import { ILogsData } from '../../utils/interfaces';
import LogsDocument from './LogsDocument';

interface ILogsDocumentsProps {
  pages: ILogsData[];
  fields?: string[];
  addFilter?: (filter: string) => void;
  selectField?: (field: string) => void;
}

const LogsDocuments: React.FunctionComponent<ILogsDocumentsProps> = ({
  pages,
  fields,
  addFilter,
  selectField,
}: ILogsDocumentsProps) => {
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
        {pages.map((page, pageIndex) =>
          page.documents.map((document, documentIndex) => (
            <LogsDocument
              key={`${pageIndex}_${documentIndex}`}
              document={document}
              fields={fields}
              addFilter={addFilter}
              selectField={selectField}
            />
          )),
        )}
      </Tbody>
    </TableComposable>
  );
};

export default LogsDocuments;
