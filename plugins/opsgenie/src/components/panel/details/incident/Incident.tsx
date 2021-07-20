import {
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

import Actions from './Actions';
import { IIncident } from '../../../../utils/interfaces';
import Infos from './Infos';
import Logs from '../Logs';
import Notes from '../Notes';
import Timeline from './Timeline';
import { Title } from '@kobsio/plugin-core';
import { formatTimeWrapper } from '../../../../utils/helpers';

export interface IIncidentProps {
  name: string;
  incident: IIncident;
  close: () => void;
}

const Incident: React.FunctionComponent<IIncidentProps> = ({ name, incident, close }: IIncidentProps) => {
  const [activeTab, setActiveTab] = useState<string>('timeline');

  return (
    <DrawerPanelContent minSize="50%">
      <DrawerHead>
        <Title
          title={incident.message || ''}
          subtitle={incident.createdAt ? formatTimeWrapper(incident.createdAt) : ''}
          size="lg"
        />
        <DrawerActions style={{ padding: 0 }}>
          <Actions name={name} incident={incident} />
          <DrawerCloseButton onClose={close} />
        </DrawerActions>
      </DrawerHead>

      <DrawerPanelBody>
        <Infos incident={incident} />
        <Tabs
          activeKey={activeTab}
          onSelect={(event, tabIndex): void => setActiveTab(tabIndex.toString())}
          className="pf-u-mt-md"
          isFilled={true}
          mountOnEnter={true}
        >
          <Tab eventKey="timeline" title={<TabTitleText>Timeline</TabTitleText>}>
            <div style={{ maxWidth: '100%', overflowX: 'scroll', padding: '24px 24px' }}>
              <Timeline name={name} id={incident.id || ''} />
            </div>
          </Tab>
          <Tab eventKey="logs" title={<TabTitleText>Logs</TabTitleText>}>
            <div style={{ maxWidth: '100%', overflowX: 'scroll', padding: '24px 24px' }}>
              <Logs name={name} id={incident.id || ''} type="incident" />
            </div>
          </Tab>
          <Tab eventKey="notes" title={<TabTitleText>Notes</TabTitleText>}>
            <div style={{ maxWidth: '100%', overflowX: 'scroll', padding: '24px 24px' }}>
              <Notes name={name} id={incident.id || ''} type="incident" />
            </div>
          </Tab>
        </Tabs>
      </DrawerPanelBody>
    </DrawerPanelContent>
  );
};

export default Incident;
