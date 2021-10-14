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

import { Editor, Title } from '@kobsio/plugin-core';
import Actions from './Actions';
import Document from './Document';
import { IDocument } from '../../../utils/interfaces';
import { formatTime } from '../../../utils/helpers';

export interface IDetailsProps {
  document: IDocument;
  close: () => void;
}

// Details renders a single document in a drawer panel. The user can select between two different tabs. The first one
// shows all fields and their values in a description list, the second one show the JSON representation of the document.
const Details: React.FunctionComponent<IDetailsProps> = ({ document, close }: IDetailsProps) => {
  const [activeTab, setActiveTab] = useState<string>('overview');

  return (
    <DrawerPanelContent minSize="50%">
      <DrawerHead>
        <Title
          title={formatTime(document['_source']['@timestamp'])}
          subtitle={`${document['_id']} (${document['_index']})`}
          size="lg"
        />
        <DrawerActions style={{ padding: 0 }}>
          <Actions document={document} />
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
              <Document document={document} />
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

export default Details;
