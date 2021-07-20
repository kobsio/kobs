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
import Details from './Details';
import { IAlert } from '../../../../utils/interfaces';
import Infos from './Infos';
import Logs from '../Logs';
import Notes from '../Notes';
import { Title } from '@kobsio/plugin-core';
import { formatTimeWrapper } from '../../../../utils/helpers';

export interface IAlertProps {
  name: string;
  alert: IAlert;
  close: () => void;
}

const Alert: React.FunctionComponent<IAlertProps> = ({ name, alert, close }: IAlertProps) => {
  const [activeTab, setActiveTab] = useState<string>('details');

  return (
    <DrawerPanelContent minSize="50%">
      <DrawerHead>
        <Title
          title={alert.message || ''}
          subtitle={alert.createdAt ? formatTimeWrapper(alert.createdAt) : ''}
          size="lg"
        />
        <DrawerActions style={{ padding: 0 }}>
          <Actions name={name} alert={alert} />
          <DrawerCloseButton onClose={close} />
        </DrawerActions>
      </DrawerHead>

      <DrawerPanelBody>
        <Infos alert={alert} />
        <Tabs
          activeKey={activeTab}
          onSelect={(event, tabIndex): void => setActiveTab(tabIndex.toString())}
          className="pf-u-mt-md"
          isFilled={true}
          mountOnEnter={true}
        >
          <Tab eventKey="details" title={<TabTitleText>Details</TabTitleText>}>
            <div style={{ maxWidth: '100%', overflowX: 'scroll', padding: '24px 24px' }}>
              <Details name={name} id={alert.id || ''} />
            </div>
          </Tab>
          <Tab eventKey="logs" title={<TabTitleText>Logs</TabTitleText>}>
            <div style={{ maxWidth: '100%', overflowX: 'scroll', padding: '24px 24px' }}>
              <Logs name={name} id={alert.id || ''} type="alert" />
            </div>
          </Tab>
          <Tab eventKey="notes" title={<TabTitleText>Notes</TabTitleText>}>
            <div style={{ maxWidth: '100%', overflowX: 'scroll', padding: '24px 24px' }}>
              <Notes name={name} id={alert.id || ''} type="alert" />
            </div>
          </Tab>
        </Tabs>
      </DrawerPanelBody>
    </DrawerPanelContent>
  );
};

export default Alert;
