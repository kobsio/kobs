import { TableText, Td, Tr } from '@patternfly/react-table';
import React from 'react';

import Details from './details/Details';
import { IDocument } from '../../utils/interfaces';
import { formatTimeWrapper } from '../../utils/helpers';

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
        <TableText wrapModifier="nowrap"> {formatTimeWrapper(document['timestamp'])}</TableText>
      </Td>
      {fields && fields.length > 0 ? (
        fields.map((field, index) => (
          <Td key={index} dataLabel={field}>
            {document[field]}
          </Td>
        ))
      ) : (
        <Td dataLabel="Log">{document['log']}</Td>
      )}
    </Tr>
  );
};

export default LogsDocument;
