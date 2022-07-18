import React, { useState } from 'react';
import { Tab, TabTitleText, Tabs } from '@patternfly/react-core';

import Details from '../Details';
import { IPluginInstance } from '@kobsio/shared';
import Repository from './Repository';
import RepositoryIssues from './RepositoryIssues';
import RepositoryPullRequests from './RepositoryPullRequests';
import RepositoryWorkflowRuns from './RepositoryWorkflowRuns';

interface IRepositoryDetailsProps {
  repo: string;
  url: string;
  instance: IPluginInstance;
  close: () => void;
}

const RepositoryDetails: React.FunctionComponent<IRepositoryDetailsProps> = ({
  repo,
  url,
  instance,
  close,
}: IRepositoryDetailsProps) => {
  const [activeTab, setActiveTab] = useState<string>('details');

  return (
    <Details title={repo} link={url} instance={instance} close={close}>
      <Tabs
        activeKey={activeTab}
        onSelect={(event, tabIndex): void => setActiveTab(tabIndex.toString())}
        className="pf-u-mt-md"
        isFilled={false}
        usePageInsets={true}
        mountOnEnter={true}
      >
        <Tab eventKey="details" title={<TabTitleText>Details</TabTitleText>}>
          <div style={{ maxWidth: '100%', padding: '24px 24px' }}>
            <Repository title="Details" repo={repo} instance={instance} />
          </div>
        </Tab>
        <Tab eventKey="issues" title={<TabTitleText>Issues</TabTitleText>}>
          <div style={{ maxWidth: '100%', padding: '24px 24px' }}>
            <RepositoryIssues title="Issues" repo={repo} instance={instance} />
          </div>
        </Tab>
        <Tab eventKey="pullrequests" title={<TabTitleText>Pull Requests</TabTitleText>}>
          <div style={{ maxWidth: '100%', padding: '24px 24px' }}>
            <RepositoryPullRequests title="Pull Requests" repo={repo} instance={instance} />
          </div>
        </Tab>
        <Tab eventKey="workflows" title={<TabTitleText>Workflow Runs</TabTitleText>}>
          <div style={{ maxWidth: '100%', padding: '24px 24px' }}>
            <RepositoryWorkflowRuns title="Workflows" repo={repo} instance={instance} />
          </div>
        </Tab>
      </Tabs>
    </Details>
  );
};

export default RepositoryDetails;
