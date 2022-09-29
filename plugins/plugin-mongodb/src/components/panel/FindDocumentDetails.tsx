import { Document, EJSON } from 'bson';
import React, { useState } from 'react';
import { Tab, TabTitleText, Tabs } from '@patternfly/react-core';
import { TableComposable, TableVariant, Th, Thead, Tr } from '@patternfly/react-table';

import { Editor } from '@kobsio/shared';
import FindDocumentDetailsTree from './FindDocumentDetailsTree';

export interface IFindDocumentDetailsProps {
  document: Document;
}

const FindDocumentDetails: React.FunctionComponent<IFindDocumentDetailsProps> = ({
  document,
}: IFindDocumentDetailsProps) => {
  const [activeTab, setActiveTab] = useState<string>('tree');

  return (
    <Tabs
      activeKey={activeTab}
      onSelect={(event, tabIndex): void => setActiveTab(tabIndex.toString())}
      isFilled={true}
      mountOnEnter={true}
    >
      <Tab eventKey="tree" title={<TabTitleText>Tree</TabTitleText>}>
        <div style={{ maxWidth: '100%', overflowX: 'scroll', padding: '24px 0px' }}>
          <TableComposable aria-label="Document Data" variant={TableVariant.compact} borders={true}>
            <Thead>
              <Tr>
                <Th />
                <Th>Key</Th>
                <Th>Value</Th>
              </Tr>
            </Thead>
            {Object.keys(document)
              .filter((key) => key !== '_id')
              .map((key) => (
                <FindDocumentDetailsTree
                  key={document[key]?.toString() ?? 'null'}
                  documentKey={key}
                  documentValue={document[key]}
                />
              ))}
          </TableComposable>
        </div>
      </Tab>
      <Tab eventKey="bson" title={<TabTitleText>BSON</TabTitleText>}>
        <div style={{ maxWidth: '100%', overflowX: 'scroll', padding: '24px 0px' }}>
          <Editor
            value={JSON.stringify(EJSON.serialize(document, { relaxed: true }), null, 2)}
            mode="json"
            readOnly={true}
          />
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

export default FindDocumentDetails;
