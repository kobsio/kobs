import React, { useState } from 'react';
import { Tab, TabContentBody, TabTitleText, Tabs } from '@patternfly/react-core';

import { IPluginInstance, ITimes, PluginPanel } from '@kobsio/shared';
import { IQuery } from '../../utils/interfaces';
import Logs from './Logs';
import LogsActions from './LogsActions';

interface ILogsWrapperProps {
  instance: IPluginInstance;
  title: string;
  description?: string;
  queries: IQuery[];
  times: ITimes;
}

const LogsWrapper: React.FunctionComponent<ILogsWrapperProps> = ({
  instance,
  title,
  description,
  queries,
  times,
}: ILogsWrapperProps) => {
  const [activeQuery, setActiveQuery] = useState<string>(queries[0].name || '');

  if (queries.length === 1) {
    return (
      <PluginPanel
        title={title}
        description={description}
        actions={<LogsActions instance={instance} queries={queries} times={times} />}
      >
        <Logs instance={instance} query={queries[0]} times={times} />
      </PluginPanel>
    );
  }

  return (
    <PluginPanel
      title={title}
      description={description}
      actions={<LogsActions instance={instance} queries={queries} times={times} />}
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
              <Logs instance={instance} query={query} times={times} />
            </TabContentBody>
          </Tab>
        ))}
      </Tabs>
    </PluginPanel>
  );
};

export default LogsWrapper;
