import { TableComposable, TableVariant, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import React from 'react';

import { IDocument, formatTimeWrapper, getProperty } from 'components/datasources/elasticsearch/helpers';

export interface IDocumentsProps {
  selectedFields: string[];
  documents: IDocument[];
  select?: (doc: IDocument) => void;
}

// Documents renders a list of documents. If the user has selected some fields, we will render the table with the
// selected fields. If the selected fields list is empty, we only render the @timestamp field and the _source field as
// the only two columns
const Documents: React.FunctionComponent<IDocumentsProps> = ({
  selectedFields,
  documents,
  select,
}: IDocumentsProps) => {
  return (
    <div className="kobsis-table-wrapper">
      <TableComposable aria-label="Logs" variant={TableVariant.compact} borders={false}>
        <Thead>
          <Tr>
            <Th>Time</Th>
            {selectedFields.length > 0 ? (
              selectedFields.map((selectedField, index) => <Th key={index}>{selectedField}</Th>)
            ) : (
              <Th>_source</Th>
            )}
          </Tr>
        </Thead>
        <Tbody>
          {documents.map((document, index) => (
            <Tr key={index} onClick={select ? (): void => select(document) : undefined}>
              <Td dataLabel="Time">{formatTimeWrapper(document['_source']['@timestamp'])}</Td>
              {selectedFields.length > 0 ? (
                selectedFields.map((selectedField, index) => (
                  <Td key={index} dataLabel={selectedField}>
                    {getProperty(document['_source'], selectedField)}
                  </Td>
                ))
              ) : (
                <Td dataLabel="_source">{JSON.stringify(document['_source'])}</Td>
              )}
            </Tr>
          ))}
        </Tbody>
      </TableComposable>
    </div>
  );
};

export default Documents;
