import {
  Card,
  CardBody,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
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
import { IDocument } from '../../../utils/interfaces';
import { formatTimeWrapper } from '../../../utils/helpers';

export interface IDetailsProps {
  document: IDocument;
  close: () => void;
}

const Details: React.FunctionComponent<IDetailsProps> = ({ document, close }: IDetailsProps) => {
  const [activeTab, setActiveTab] = useState<string>('overview');

  return (
    <DrawerPanelContent minSize="50%">
      <DrawerHead>
        <Title
          title={formatTimeWrapper(document['timestamp'])}
          subtitle={`${document['container_name']}/${document['pod_name']} (${document['namespace']}/${document['cluster']})`}
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
              <Card>
                <CardBody>
                  <DescriptionList className="pf-u-text-break-word">
                    {Object.keys(document).map((key) => (
                      <DescriptionListGroup key={key}>
                        <DescriptionListTerm>{key}</DescriptionListTerm>
                        <DescriptionListDescription>{document[key]}</DescriptionListDescription>
                      </DescriptionListGroup>
                    ))}
                  </DescriptionList>
                </CardBody>
              </Card>
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
