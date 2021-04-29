import { TableText, Td, Tr } from '@patternfly/react-table';
import React from 'react';

import { IDocument, formatTimeWrapper } from 'plugins/elasticsearch/helpers';
import ElasticsearchLogsDocumentsItemField from 'plugins/elasticsearch/ElasticsearchLogsDocumentsItemField';

export interface IElasticsearchLogsDocumentsItemProps {
  selectedFields: string[];
  document: IDocument;
  select?: (doc: IDocument) => void;
  showActions: boolean;
}

const ElasticsearchLogsDocumentsItem: React.FunctionComponent<IElasticsearchLogsDocumentsItemProps> = ({
  selectedFields,
  document,
  select,
  showActions,
}: IElasticsearchLogsDocumentsItemProps) => {
  return (
    <Tr>
      <Td dataLabel="Time" onClick={select ? (): void => select(document) : undefined}>
        <TableText wrapModifier="nowrap"> {formatTimeWrapper(document['_source']['@timestamp'])}</TableText>
      </Td>
      {selectedFields.length > 0 ? (
        selectedFields.map((selectedField, index) => (
          <ElasticsearchLogsDocumentsItemField
            key={index}
            document={document}
            selectedField={selectedField}
            showActions={showActions}
          />
        ))
      ) : (
        <Td dataLabel="_source">{JSON.stringify(document['_source'])}</Td>
      )}
    </Tr>
  );
};

export default ElasticsearchLogsDocumentsItem;
