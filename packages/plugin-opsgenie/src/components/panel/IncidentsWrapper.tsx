import React, { useState } from 'react';
import { Tab, TabTitleText, Tabs } from '@patternfly/react-core';

import { IPluginInstance, ITimes } from '@kobsio/shared';
import Incidents from './Incidents';

interface IIncidentsWrapperProps {
  instance: IPluginInstance;
  queries: string[];
  interval?: number;
  times: ITimes;
  setDetails?: (details: React.ReactNode) => void;
}

const IncidentsWrapper: React.FunctionComponent<IIncidentsWrapperProps> = ({
  instance,
  queries,
  interval,
  times,
  setDetails,
}: IIncidentsWrapperProps) => {
  const [activeKey, setActiveKey] = useState<string>(queries[0]);

  return (
    <Tabs
      activeKey={activeKey}
      isFilled={false}
      onSelect={(event: React.MouseEvent<HTMLElement, MouseEvent>, eventKey: string | number): void => {
        setActiveKey(eventKey.toString());
      }}
      mountOnEnter={true}
      unmountOnExit={true}
    >
      {queries.map((query) => (
        <Tab key={query} eventKey={query} title={<TabTitleText>{query}</TabTitleText>}>
          <Incidents instance={instance} query={query} interval={interval} times={times} setDetails={setDetails} />
        </Tab>
      ))}
    </Tabs>
  );
};

export default IncidentsWrapper;
