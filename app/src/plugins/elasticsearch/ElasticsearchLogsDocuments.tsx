import { TableComposable, TableVariant, Tbody, Th, Thead, Tr } from '@patternfly/react-table';
import { Card } from '@patternfly/react-core';
import React from 'react';

import ElasticsearchLogsDocumentsItem from 'plugins/elasticsearch/ElasticsearchLogsDocumentsItem';
import { IDocument } from 'plugins/elasticsearch/helpers';

export interface IElasticsearchLogsDocumentsProps {
  selectedFields: string[];
  documents: IDocument[];
  select?: (doc: IDocument) => void;
  showActions: boolean;
}

// ElasticsearchLogsDocuments renders a list of documents. If the user has selected some fields, we will render the
// table with the selected fields. If the selected fields list is empty, we only render the @timestamp field and the
// _source field as the only two columns
const ElasticsearchLogsDocuments: React.FunctionComponent<IElasticsearchLogsDocumentsProps> = ({
  selectedFields,
  documents,
  select,
  showActions,
}: IElasticsearchLogsDocumentsProps) => {
  return (
    <Card style={{ maxWidth: '100%', overflowX: 'scroll' }}>
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
            <ElasticsearchLogsDocumentsItem
              key={index}
              document={document}
              selectedFields={selectedFields}
              select={select}
              showActions={showActions}
            />
          ))}
        </Tbody>
      </TableComposable>
    </Card>
  );
};

export default ElasticsearchLogsDocuments;
