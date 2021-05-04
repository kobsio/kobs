import {
  Card,
  DrawerActions,
  DrawerCloseButton,
  DrawerHead,
  DrawerPanelBody,
  DrawerPanelContent,
  Tab,
  TabTitleText,
  Tabs,
} from '@patternfly/react-core';
import React, { useState } from 'react';

import { IDocument, formatTimeWrapper } from 'plugins/elasticsearch/helpers';
import Editor from 'components/Editor';
import ElasticsearchLogsDocumentOverview from 'plugins/elasticsearch/ElasticsearchLogsDocumentOverview';
import Title from 'components/Title';

export interface IElasticsearchLogsDocumentProps {
  document: IDocument;
  showActions: boolean;
  close: () => void;
}

// Document renders a single document in a drawer panel. We show the whole JSON representation for this document in a
// code view. The highlighting of this JSON document is handled by highlight.js.
const ElasticsearchLogsDocument: React.FunctionComponent<IElasticsearchLogsDocumentProps> = ({
  document,
  showActions,
  close,
}: IElasticsearchLogsDocumentProps) => {
  const [activeTab, setActiveTab] = useState<string>('overview');

  return (
    <DrawerPanelContent minSize="50%">
      <DrawerHead>
        <Title
          title={formatTimeWrapper(document['_source']['@timestamp'])}
          subtitle={`${document['_id']} (${document['_index']})`}
          size="lg"
        />
        <DrawerActions style={{ padding: 0 }}>
          <DrawerCloseButton onClose={close} />
        </DrawerActions>
      </DrawerHead>

      <DrawerPanelBody>
        <Tabs
          activeKey={activeTab}
          onSelect={(event, tabIndex): void => setActiveTab(tabIndex.toString())}
          className="pf-u-mt-md"
          isFilled={true}
          mountOnEnter={true}
        >
          <Tab eventKey="overview" title={<TabTitleText>Overview</TabTitleText>}>
            <div style={{ maxWidth: '100%', overflowX: 'scroll', padding: '24px 24px' }}>
              <ElasticsearchLogsDocumentOverview document={document} showActions={showActions} />
            </div>
          </Tab>
          <Tab eventKey="json" title={<TabTitleText>JSON</TabTitleText>}>
            <div style={{ maxWidth: '100%', overflowX: 'scroll', padding: '24px 24px' }}>
              <Card>
                <Editor value={JSON.stringify(document, null, 2)} mode="json" readOnly={true} />
              </Card>
            </div>
          </Tab>
        </Tabs>
      </DrawerPanelBody>
    </DrawerPanelContent>
  );
};

export default ElasticsearchLogsDocument;
