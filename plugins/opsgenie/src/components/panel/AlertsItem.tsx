import { Card, CardActions, CardBody, CardHeader, CardTitle } from '@patternfly/react-core';
import React from 'react';

import Alert from './details/alert/Alert';
import { IAlert } from '../../utils/interfaces';
import Infos from './details/alert/Infos';
import { formatTimeWrapper } from '../../utils/helpers';

interface IAlertsItemProps {
  name: string;
  alert: IAlert;
  setDetails?: (details: React.ReactNode) => void;
}

const AlertsItem: React.FunctionComponent<IAlertsItemProps> = ({ name, alert, setDetails }: IAlertsItemProps) => {
  return (
    <Card
      style={{ cursor: 'pointer' }}
      isCompact={true}
      isHoverable={true}
      onClick={
        setDetails
          ? (): void => setDetails(<Alert name={name} alert={alert} close={(): void => setDetails(undefined)} />)
          : undefined
      }
    >
      <CardHeader>
        {alert.createdAt ? (
          <CardActions>
            <span className="pf-u-pl-sm pf-u-font-size-sm pf-u-color-400">{formatTimeWrapper(alert.createdAt)}</span>
          </CardActions>
        ) : null}
        <CardTitle>{alert.message}</CardTitle>
      </CardHeader>
      <CardBody>
        <Infos alert={alert} />
      </CardBody>
    </Card>
  );
};

export default AlertsItem;
