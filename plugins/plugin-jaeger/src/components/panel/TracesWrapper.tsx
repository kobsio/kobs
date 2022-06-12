import React, { useState } from 'react';
import { Tab, TabContentBody, TabTitleText, Tabs } from '@patternfly/react-core';

import { IPluginInstance, ITimes, PluginPanel } from '@kobsio/shared';
import { IQuery } from '../../utils/interfaces';
import Traces from './Traces';
import TracesActions from './TracesActions';

interface ITracesWrapperProps {
  instance: IPluginInstance;
  title: string;
  description?: string;
  showChart: boolean;
  queries: IQuery[];
  times: ITimes;
  setDetails?: (details: React.ReactNode) => void;
}

const TracesWrapper: React.FunctionComponent<ITracesWrapperProps> = ({
  instance,
  title,
  description,
  times,
  setDetails,
  showChart,
  queries,
}: ITracesWrapperProps) => {
  const [activeQuery, setActiveQuery] = useState<string>(queries[0].name || '');

  if (queries.length === 1) {
    return (
      <PluginPanel
        title={title}
        description={description}
        actions={<TracesActions instance={instance} queries={queries} times={times} />}
      >
        <Traces instance={instance} query={queries[0]} times={times} showChart={showChart} setDetails={setDetails} />
      </PluginPanel>
    );
  }

  return (
    <PluginPanel
      title={title}
      description={description}
      actions={<TracesActions instance={instance} queries={queries} times={times} />}
    >
      <Tabs
        style={{ backgroundColor: '#ffffff' }}
        activeKey={activeQuery}
        isFilled={false}
        usePageInsets={false}
        mountOnEnter={true}
        unmountOnExit={true}
        onSelect={(event, tabIndex): void => setActiveQuery(tabIndex.toString())}
      >
        {queries.map((query) => (
          <Tab key={query.name} eventKey={query.name || ''} title={<TabTitleText>{query.name}</TabTitleText>}>
            <TabContentBody hasPadding={false}>
              <Traces instance={instance} query={query} times={times} showChart={showChart} setDetails={setDetails} />
            </TabContentBody>
          </Tab>
        ))}
      </Tabs>
    </PluginPanel>
  );
};

export default TracesWrapper;
