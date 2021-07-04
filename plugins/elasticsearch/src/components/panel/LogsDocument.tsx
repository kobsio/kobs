import { TableText, Td, Tr } from '@patternfly/react-table';
import React from 'react';

import { formatTimeWrapper, getProperty } from '../../utils/helpers';
import Details from './details/Details';
import { IDocument } from '../../utils/interfaces';

interface ILogsDocumentProps {
  document: IDocument;
  fields?: string[];
  showDetails?: (details: React.ReactNode) => void;
}

const LogsDocument: React.FunctionComponent<ILogsDocumentProps> = ({
  document,
  fields,
  showDetails,
}: ILogsDocumentProps) => {
  return (
    <Tr
      onClick={(): void =>
        showDetails
          ? showDetails(<Details document={document} close={(): void => showDetails(undefined)} />)
          : undefined
      }
    >
      <Td dataLabel="Time">
        <TableText wrapModifier="nowrap"> {formatTimeWrapper(document['_source']['@timestamp'])}</TableText>
      </Td>
      {fields && fields.length > 0 ? (
        fields.map((field, index) => (
          <Td key={index} dataLabel={field}>
            {getProperty(document['_source'], field)}
          </Td>
        ))
      ) : (
        <Td dataLabel="_source">{JSON.stringify(document['_source'])}</Td>
      )}
    </Tr>
  );
};

export default LogsDocument;
