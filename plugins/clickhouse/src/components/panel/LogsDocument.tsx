import React, { useState } from 'react';
import { TableText, Tbody, Td, Tr } from '@patternfly/react-table';
import { InView } from 'react-intersection-observer';

import { IDocument } from '../../utils/interfaces';
import LogsDocumentDetails from './LogsDocumentDetails';
import { formatTime } from '../../utils/helpers';

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
          download={`${document['timestamp']}__${document['container_name']}__${document['pod_name']}__${document['namespace']}__${document['cluster']}.json`}
        >
          Download JSON
        </a>
      ),
    },
  ];

  return (
    <InView>
      {({ inView, ref }): React.ReactNode => (
        <Tbody ref={ref}>
          {inView ? (
            <React.Fragment>
              <Tr>
                <Td
                  noPadding={true}
                  style={{ padding: 0 }}
                  expand={{ isExpanded: isExpanded, onToggle: (): void => setIsExpanded(!isExpanded), rowIndex: 0 }}
                />
                <Td className="pf-u-text-wrap pf-u-text-break-word" dataLabel="Time">
                  <TableText wrapModifier="nowrap">{formatTime(document['timestamp'])}</TableText>
                </Td>
                {fields && fields.length > 0 ? (
                  fields.map((field, index) => (
                    <Td key={index} className="pf-u-text-wrap pf-u-text-break-word" dataLabel={field}>
                      {document[field]}
                    </Td>
                  ))
                ) : (
                  <Td className="pf-u-text-wrap pf-u-text-break-word" dataLabel="Log">
                    <div className="kobsio-clickhouse-logs-preview">
                      <span className="pf-u-mr-sm pf-u-mb-sm">
                        <span className="pf-u-background-color-200 pf-u-p-xs">cluster:</span>
                        <span className="pf-u-p-xs"> {document['cluster']}</span>
                      </span>
                      <span className="pf-u-mr-sm pf-u-mb-sm">
                        <span className="pf-u-background-color-200 pf-u-p-xs">namespace:</span>
                        <span className="pf-u-p-xs"> {document['namespace']}</span>
                      </span>
                      <span className="pf-u-mr-sm pf-u-mb-sm">
                        <span className="pf-u-background-color-200 pf-u-p-xs">app:</span>
                        <span className="pf-u-p-xs"> {document['app']}</span>
                      </span>
                      <span className="pf-u-mr-sm pf-u-mb-sm">
                        <span className="pf-u-background-color-200 pf-u-p-xs">pod_name:</span>
                        <span className="pf-u-p-xs"> {document['pod_name']}</span>
                      </span>
                      <span className="pf-u-mr-sm pf-u-mb-sm">
                        <span className="pf-u-background-color-200 pf-u-p-xs">container_name:</span>
                        <span className="pf-u-p-xs"> {document['container_name']}</span>
                      </span>
                      <span className="pf-u-mr-sm pf-u-mb-sm">
                        <span className="pf-u-background-color-200 pf-u-p-xs">host:</span>
                        <span className="pf-u-p-xs"> {document['host']}</span>
                      </span>

                      {Object.keys(document)
                        .filter((key) => key.startsWith('content.') && document[key].length < 128)
                        .map((key) => (
                          <span key={key} className="pf-u-mr-sm pf-u-mb-sm">
                            <span className="pf-u-background-color-200 pf-u-p-xs">{key}:</span>
                            <span className="pf-u-p-xs"> {document[key]}</span>
                          </span>
                        ))}

                      <span className="pf-u-mr-sm pf-u-mb-sm">
                        <span className="pf-u-background-color-200 pf-u-p-xs">log:</span>
                        <span className="pf-u-p-xs"> {document['log']}</span>
                      </span>

                      {Object.keys(document).filter((key) => key.startsWith('content.') && document[key].length < 128)
                        .length === 0
                        ? Object.keys(document)
                            .filter((key) => key.startsWith('kubernetes.'))
                            .map((key) => (
                              <span key={key} className="pf-u-mr-sm pf-u-mb-sm">
                                <span className="pf-u-background-color-200 pf-u-p-xs">{key}:</span>
                                <span className="pf-u-p-xs"> {document[key]}</span>
                              </span>
                            ))
                        : null}
                    </div>
                  </Td>
                )}
                <Td noPadding={true} style={{ padding: 0 }} actions={{ items: defaultActions }} />
              </Tr>
              <Tr isExpanded={isExpanded}>
                <Td />
                <Td colSpan={fields && fields.length > 0 ? fields.length + 1 : 2}>
                  {isExpanded && (
                    <LogsDocumentDetails document={document} addFilter={addFilter} selectField={selectField} />
                  )}
                </Td>
                <Td />
              </Tr>
            </React.Fragment>
          ) : (
            <Tr style={{ height: fields && fields.length > 0 ? '38px' : '135px' }}></Tr>
          )}
        </Tbody>
      )}
    </InView>
  );
};

export default LogsDocument;
