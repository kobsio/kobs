import React, { useState } from 'react';
import { TableText, Td, Tr } from '@patternfly/react-table';

import { formatTime, getProperty } from '../../utils/helpers';
import { IDocument } from '../../utils/interfaces';
import LogsDocumentDetails from './LogsDocumentDetails';
import LogsDocumentPreview from './LogsDocumentPreview';

interface ILogsDocumentProps {
  document: IDocument;
  fields?: string[];
  addFilter?: (filter: string) => void;
  selectField?: (field: string) => void;
}

const LogsDocument: React.FunctionComponent<ILogsDocumentProps> = ({
  document,
  fields,
  addFilter,
  selectField,
}: ILogsDocumentProps) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const defaultActions = [
    {
      title: (
        <a
          style={{ color: 'inherit', textDecoration: 'inherit' }}
          href={URL.createObjectURL(new Blob([JSON.stringify({ data: document }, null, 2)]))}
          download={`${document['_id']}__${document['_index']}.json`}
        >
          Download JSON
        </a>
      ),
    },
  ];

  return (
    <React.Fragment>
      <Tr>
        <Td
          noPadding={true}
          style={{ padding: 0 }}
          expand={{ isExpanded: isExpanded, onToggle: (): void => setIsExpanded(!isExpanded), rowIndex: 0 }}
        />
        <Td className="pf-u-text-wrap pf-u-text-break-word" dataLabel="Time">
          <TableText wrapModifier="nowrap"> {formatTime(document['_source']['@timestamp'])}</TableText>
        </Td>
        {fields && fields.length > 0 ? (
          fields.map((field, index) => (
            <Td className="pf-u-text-wrap pf-u-text-break-word" key={index} dataLabel={field}>
              {getProperty(document['_source'], field)}
            </Td>
          ))
        ) : (
          <Td className="pf-u-text-wrap pf-u-text-break-word" dataLabel="_source">
            <LogsDocumentPreview document={document} />
          </Td>
        )}
        <Td noPadding={true} style={{ padding: 0 }} actions={{ items: defaultActions }} />
      </Tr>
      <Tr isExpanded={isExpanded}>
        <Td />
        <Td colSpan={fields && fields.length > 0 ? fields.length + 1 : 2}>
          {isExpanded && <LogsDocumentDetails document={document} addFilter={addFilter} selectField={selectField} />}
        </Td>
        <Td />
      </Tr>
    </React.Fragment>
  );
};

export default LogsDocument;
