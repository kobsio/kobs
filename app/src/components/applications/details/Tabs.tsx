import { Tabs as PatternflyTabs, Tab, TabTitleText } from '@patternfly/react-core';
import React from 'react';

// DEFAULT_TAB is the first tab, which is selected in the application view.
export const DEFAULT_TAB = 'resources';

interface ITabsParams {
  tab: string;
  setTab(tab: string): void;
  refResourcesContent: React.RefObject<HTMLElement>;
  refMetricsContent: React.RefObject<HTMLElement>;
  refLogsContent: React.RefObject<HTMLElement>;
}

// Tabs renders the tabs header, which are used by the user to select a section he wants to view for an application.
// We can not use the tab state, within this component, because then the tab change isn't reflected in the TabsContent
// component. So that we have to manage the refs and tab in the parent component.
const Tabs: React.FunctionComponent<ITabsParams> = ({
  tab,
  setTab,
  refResourcesContent,
  refMetricsContent,
  refLogsContent,
}: ITabsParams) => {
  return (
    <PatternflyTabs
      className="pf-u-mt-md"
      mountOnEnter={true}
      isFilled={true}
      activeKey={tab}
      onSelect={(event, tabIndex): void => setTab(tabIndex.toString())}
    >
      <Tab
        eventKey="resources"
        title={<TabTitleText>Resources</TabTitleText>}
        tabContentId="refResources"
        tabContentRef={refResourcesContent}
      />
      <Tab
        eventKey="metrics"
        title={<TabTitleText>Metrics</TabTitleText>}
        tabContentId="refMetrics"
        tabContentRef={refMetricsContent}
      />
      <Tab
        eventKey="logs"
        title={<TabTitleText>Logs</TabTitleText>}
        tabContentId="refLogs"
        tabContentRef={refLogsContent}
      />
    </PatternflyTabs>
  );
};

export default Tabs;
