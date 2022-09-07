import {
  Card,
  CardBody,
  DrawerActions,
  DrawerCloseButton,
  DrawerHead,
  DrawerPanelBody,
  DrawerPanelContent,
  Title,
} from '@patternfly/react-core';
import React from 'react';

import { IPluginInstance, ITimes } from '@kobsio/shared';
import { IOperationData } from '../../../utils/interfaces';
import MonitorChart from '../MonitorChart';
import OperationActions from './OperationActions';

export interface IOperationProps {
  operation: IOperationData;
  instance: IPluginInstance;
  service: string;
  times: ITimes;
  close: () => void;
}

const Operation: React.FunctionComponent<IOperationProps> = ({
  operation,
  instance,
  service,
  times,
  close,
}: IOperationProps) => {
  return (
    <DrawerPanelContent minSize="50%">
      <DrawerHead>
        <Title headingLevel="h2" size="xl">
          {operation.operation}
        </Title>
        <DrawerActions style={{ padding: 0 }}>
          <OperationActions instance={instance} service={service} operation={operation.operation} times={times} />
          <DrawerCloseButton onClose={close} />
        </DrawerActions>
      </DrawerHead>

      <DrawerPanelBody>
        <Card isCompact={true}>
          <CardBody>
            <div style={{ height: '300px' }}>
              <MonitorChart
                data={[operation.chartData[0], operation.chartData[1], operation.chartData[2]]}
                unit="ms"
                times={times}
              />
            </div>
          </CardBody>
        </Card>
        <p>&nbsp;</p>
        <Card isCompact={true}>
          <CardBody>
            <div style={{ height: '300px' }}>
              <MonitorChart data={[operation.chartData[3]]} unit="%" times={times} />
            </div>
          </CardBody>
        </Card>
        <p>&nbsp;</p>
        <Card isCompact={true}>
          <CardBody>
            <div style={{ height: '300px' }}>
              <MonitorChart data={[operation.chartData[4]]} unit="req/s" times={times} />
            </div>
          </CardBody>
        </Card>
      </DrawerPanelBody>
    </DrawerPanelContent>
  );
};

export default Operation;
