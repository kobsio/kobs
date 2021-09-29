import { TableComposable, TableVariant, Th, Thead, Tr } from '@patternfly/react-table';
import React from 'react';

import { IDocument } from '../../utils/interfaces';
import LogsDocument from './LogsDocument';

interface ILogsDocumentsProps {
  documents?: IDocument[];
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
  return (
    <TableComposable aria-label="Logs" variant={TableVariant.compact} borders={false}>
      <Thead>
        <Tr>
          <Th />
          <Th>Time</Th>
          {fields && fields.length > 0 ? (
            fields.map((selectedField, index) => <Th key={index}>{selectedField}</Th>)
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
