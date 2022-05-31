import {
  Card,
  CardBody,
  DrawerActions,
  DrawerCloseButton,
  DrawerHead,
  DrawerPanelBody,
  DrawerPanelContent,
  Tab,
  TabTitleText,
  Tabs,
  Title,
} from '@patternfly/react-core';
import React, { useState } from 'react';

import Actions from './Actions';
import { IIncident } from '../../../../utils/interfaces';
import { IPluginInstance } from '@kobsio/shared';
import Infos from './Infos';
import Logs from '../Logs';
import Notes from '../Notes';
import Timeline from './Timeline';
import { formatTimeWrapper } from '../../../../utils/helpers';

export interface IIncidentProps {
  instance: IPluginInstance;
  incident: IIncident;
  refetch: () => void;
  close: () => void;
}

const Incident: React.FunctionComponent<IIncidentProps> = ({ instance, incident, refetch, close }: IIncidentProps) => {
  const [activeTab, setActiveTab] = useState<string>('timeline');

  return (
    <DrawerPanelContent minSize="50%">
      <DrawerHead>
        <Title headingLevel="h2" size="xl">
          {incident.message || incident.id || ''}
          <span className="pf-u-pl-sm pf-u-font-size-sm pf-u-color-400">
            {incident.createdAt ? formatTimeWrapper(incident.createdAt) : ''}
          </span>
        </Title>
        <DrawerActions style={{ padding: 0 }}>
          <Actions instance={instance} incident={incident} refetch={refetch} />
          <DrawerCloseButton onClose={close} />
        </DrawerActions>
      </DrawerHead>

      <DrawerPanelBody>
        <Infos incident={incident} />
        <Tabs
          activeKey={activeTab}
          onSelect={(event, tabIndex): void => setActiveTab(tabIndex.toString())}
          className="pf-u-mt-md"
          isFilled={false}
          usePageInsets={true}
          mountOnEnter={true}
        >
          <Tab eventKey="timeline" title={<TabTitleText>Timeline</TabTitleText>}>
            <div style={{ maxWidth: '100%', overflowX: 'scroll', padding: '24px 24px' }}>
              <Card isCompact={true}>
                <CardBody>
                  <Timeline instance={instance} id={incident.id || ''} />
                </CardBody>
              </Card>
            </div>
          </Tab>
          <Tab eventKey="logs" title={<TabTitleText>Logs</TabTitleText>}>
            <div style={{ maxWidth: '100%', overflowX: 'scroll', padding: '24px 24px' }}>
              <Card isCompact={true}>
                <CardBody>
                  <Logs instance={instance} id={incident.id || ''} type="incident" />
                </CardBody>
              </Card>
            </div>
          </Tab>
          <Tab eventKey="notes" title={<TabTitleText>Notes</TabTitleText>}>
            <div style={{ maxWidth: '100%', overflowX: 'scroll', padding: '24px 24px' }}>
              <Card isCompact={true}>
                <CardBody>
                  <Notes instance={instance} id={incident.id || ''} type="incident" />
                </CardBody>
              </Card>
            </div>
          </Tab>
        </Tabs>
      </DrawerPanelBody>
    </DrawerPanelContent>
  );
};

export default Incident;
