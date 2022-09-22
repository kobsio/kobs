import React, { useState } from 'react';
import { Tab, TabTitleText, Tabs } from '@patternfly/react-core';
import { EJSON } from 'bson';
import { Editor } from '@kobsio/shared';
import QueryResultTreeView from './QueryResultTreeView';

interface IQueryResultsViewProps {
  data: EJSON.SerializableTypes;
}

const ResultViewTypes = {
  JSON: 'JSON',
  Table: 'Table',
  Tree: 'Tree',
};

const QueryResultsView: React.FunctionComponent<IQueryResultsViewProps> = ({ data }: IQueryResultsViewProps) => {
  const [activeTab, setActiveTab] = useState<string>(ResultViewTypes.Tree);

  return (
    <Tabs
      activeKey={activeTab}
      onSelect={(event, tabIndex): void => setActiveTab(tabIndex.toString())}
      isFilled={true}
      mountOnEnter={true}
    >
      <Tab eventKey={ResultViewTypes.Tree} title={<TabTitleText>{ResultViewTypes.Tree}</TabTitleText>}>
        <div style={{ maxWidth: '100%', overflowX: 'scroll', padding: '24px 0px' }}>
          <QueryResultTreeView data={data} />
        </div>
      </Tab>
      <Tab eventKey={ResultViewTypes.JSON} title={<TabTitleText>{ResultViewTypes.JSON}</TabTitleText>}>
        <div style={{ maxWidth: '100%', overflowX: 'scroll', padding: '24px 0px' }}>
          <Editor
            value={JSON.stringify(EJSON.serialize(data, { relaxed: true }), null, 2)}
            mode="json"
            readOnly={true}
          />
        </div>
      </Tab>
      <Tab eventKey={ResultViewTypes.Table} title={<TabTitleText>{ResultViewTypes.Table}</TabTitleText>}>
        <div style={{ maxWidth: '100%', overflowX: 'scroll', padding: '24px 0px' }}>
          <Editor
            value={JSON.stringify(EJSON.serialize(data, { relaxed: true }), null, 2)}
            mode="json"
            readOnly={true}
          />
        </div>
      </Tab>
    </Tabs>
  );
};

export default QueryResultsView;
