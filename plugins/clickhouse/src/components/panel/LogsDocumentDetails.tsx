import React, { useState } from 'react';
import { Tab, TabTitleText, Tabs } from '@patternfly/react-core';
import { TableComposable, TableVariant, Tbody, Td, Tr } from '@patternfly/react-table';

import { Editor } from '@kobsio/plugin-core';
import { IDocument } from '../../utils/interfaces';

export interface ILogsDocumentDetailsProps {
  document: IDocument;
}

const LogsDocumentDetails: React.FunctionComponent<ILogsDocumentDetailsProps> = ({
  document,
}: ILogsDocumentDetailsProps) => {
  const [activeTab, setActiveTab] = useState<string>('table');

  return (
    <Tabs
      activeKey={activeTab}
      onSelect={(event, tabIndex): void => setActiveTab(tabIndex.toString())}
      isFilled={true}
      mountOnEnter={true}
    >
      <Tab eventKey="table" title={<TabTitleText>Table</TabTitleText>}>
        <div style={{ maxWidth: '100%', overflowX: 'scroll', padding: '24px 0px' }}>
          <TableComposable aria-label="Details" variant={TableVariant.compact} borders={false}>
            <Tbody>
              {Object.keys(document).map((key) => (
                <Tr key={key}>
                  <Td noPadding={true} dataLabel="Key">
                    <b>{key}</b>
                  </Td>
                  <Td className="pf-u-text-wrap pf-u-text-break-word" noPadding={true} dataLabel="Value">
                    <div style={{ whiteSpace: 'pre-wrap' }}>{document[key]}</div>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </TableComposable>
        </div>
      </Tab>
      <Tab eventKey="json" title={<TabTitleText>JSON</TabTitleText>}>
        <div style={{ maxWidth: '100%', overflowX: 'scroll', padding: '24px 0px' }}>
          <Editor value={JSON.stringify(document, null, 2)} mode="json" readOnly={true} />
        </div>
      </Tab>
    </Tabs>
  );
};

export default LogsDocumentDetails;
