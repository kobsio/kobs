import React, { useState } from 'react';

import { Tab, TabTitleText, Tabs } from '@patternfly/react-core';
import { IRow } from '@patternfly/react-table';
import MetaDataDescriptionList from './MetaDataDescriptionList';

interface IResourceOverviewProps {
  resource: IRow;
}

export const ResourceOverview = ({ resource }: IResourceOverviewProps): JSX.Element => {
  const [activeSubTab, setActiveSubTab] = useState<string>('metadata');

  return (
    <Tabs
      activeKey={activeSubTab}
      isSecondary
      onSelect={(event, tabIndex: number | string): void => setActiveSubTab(tabIndex.toString())}
    >
      <Tab eventKey="metadata" title={<TabTitleText>metadata</TabTitleText>}>
        <div style={{ maxWidth: '100%', overflowX: 'scroll', padding: '24px 24px' }}>
          <MetaDataDescriptionList metadata={resource.props.metadata} />
        </div>
      </Tab>
    </Tabs>
  );
};
