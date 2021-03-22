import { Tab, TabTitleText, Tabs } from '@patternfly/react-core';
import React from 'react';

interface IApplicationTabsParams {
  activeTab: string;
  setTab(tab: string): void;
  refResourcesContent: React.RefObject<HTMLElement>;
}

// ApplicationTabs is the component to render all tabs for an application. An application always contains a tab for
// resources and a dynamic list of plugins.
const ApplicationTabs: React.FunctionComponent<IApplicationTabsParams> = ({
  activeTab,
  setTab,
  refResourcesContent,
}: IApplicationTabsParams) => {
  return (
    <Tabs
      className="pf-u-mt-md"
      isFilled={true}
      activeKey={activeTab}
      onSelect={(event, tabIndex): void => setTab(tabIndex.toString())}
    >
      <Tab
        eventKey="resources"
        title={<TabTitleText>Resources</TabTitleText>}
        tabContentId="refResources"
        tabContentRef={refResourcesContent}
      />
    </Tabs>
  );
};

export default ApplicationTabs;
