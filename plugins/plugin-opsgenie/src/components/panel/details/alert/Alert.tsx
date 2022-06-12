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
import Details from './Details';
import { IAlert } from '../../../../utils/interfaces';
import { IPluginInstance } from '@kobsio/shared';
import Infos from './Infos';
import Logs from '../Logs';
import Notes from '../Notes';
import { formatTimeWrapper } from '../../../../utils/helpers';

export interface IAlertProps {
  instance: IPluginInstance;
  alert: IAlert;
  refetch: () => void;
  close: () => void;
}

const Alert: React.FunctionComponent<IAlertProps> = ({ instance, alert, refetch, close }: IAlertProps) => {
  const [activeTab, setActiveTab] = useState<string>('details');

  return (
    <DrawerPanelContent minSize="50%">
      <DrawerHead>
        <Title headingLevel="h2" size="xl">
          {alert.message || alert.id || ''}
          <span className="pf-u-pl-sm pf-u-font-size-sm pf-u-color-400">
            {alert.createdAt ? formatTimeWrapper(alert.createdAt) : ''}
          </span>
        </Title>
        <DrawerActions style={{ padding: 0 }}>
          <Actions instance={instance} alert={alert} refetch={refetch} />
          <DrawerCloseButton onClose={close} />
        </DrawerActions>
      </DrawerHead>

      <DrawerPanelBody>
        <Infos alert={alert} />
        <Tabs
          activeKey={activeTab}
          onSelect={(event, tabIndex): void => setActiveTab(tabIndex.toString())}
          className="pf-u-mt-md"
          isFilled={false}
          usePageInsets={true}
          mountOnEnter={true}
        >
          <Tab eventKey="details" title={<TabTitleText>Details</TabTitleText>}>
            <div style={{ maxWidth: '100%', overflowX: 'scroll', padding: '24px 24px' }}>
              <Card isCompact={true}>
                <CardBody>
                  <Details instance={instance} id={alert.id || ''} />
                </CardBody>
              </Card>
            </div>
          </Tab>
          <Tab eventKey="logs" title={<TabTitleText>Logs</TabTitleText>}>
            <div style={{ maxWidth: '100%', overflowX: 'scroll', padding: '24px 24px' }}>
              <Card isCompact={true}>
                <CardBody>
                  <Logs instance={instance} id={alert.id || ''} type="alert" />
                </CardBody>
              </Card>
            </div>
          </Tab>
          <Tab eventKey="notes" title={<TabTitleText>Notes</TabTitleText>}>
            <div style={{ maxWidth: '100%', overflowX: 'scroll', padding: '24px 24px' }}>
              <Card isCompact={true}>
                <CardBody>
                  <Notes instance={instance} id={alert.id || ''} type="alert" />
                </CardBody>
              </Card>
            </div>
          </Tab>
        </Tabs>
      </DrawerPanelBody>
    </DrawerPanelContent>
  );
};

export default Alert;
