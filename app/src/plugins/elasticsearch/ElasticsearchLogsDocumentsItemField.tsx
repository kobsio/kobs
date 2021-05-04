import React, { useState } from 'react';
import { Td } from '@patternfly/react-table';

import { IDocument, getProperty } from 'plugins/elasticsearch/helpers';
import ElasticsearchLogsActions from 'plugins/elasticsearch/ElasticsearchLogsActions';

export interface IElasticsearchLogsDocumentsItemFieldProps {
  selectedField: string;
  document: IDocument;
  select?: (doc: IDocument) => void;
  showActions: boolean;
}

const ElasticsearchLogsDocumentsItemField: React.FunctionComponent<IElasticsearchLogsDocumentsItemFieldProps> = ({
  document,
  selectedField,
  showActions,
}: IElasticsearchLogsDocumentsItemFieldProps) => {
  const [show, setShow] = useState<boolean>(false);
  const value = getProperty(document['_source'], selectedField);

  return (
    <Td dataLabel={selectedField} onMouseEnter={(): void => setShow(true)} onMouseLeave={(): void => setShow(false)}>
      {value}
      {showActions && show ? <ElasticsearchLogsActions field={{ key: selectedField, value: value as string }} /> : null}
    </Td>
  );
};

export default ElasticsearchLogsDocumentsItemField;
