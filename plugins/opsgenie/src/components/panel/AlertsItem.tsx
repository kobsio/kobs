import { MenuItem } from '@patternfly/react-core';
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
    <MenuItem
      description={<Infos alert={alert} />}
      onClick={
        setDetails
          ? (): void => setDetails(<Alert name={name} alert={alert} close={(): void => setDetails(undefined)} />)
          : undefined
      }
    >
      {alert.message}
      {alert.createdAt ? (
        <span className="pf-u-float-right pf-u-pl-sm pf-u-font-size-sm pf-u-color-400">
          {formatTimeWrapper(alert.createdAt)}
        </span>
      ) : null}
    </MenuItem>
  );
};

export default AlertsItem;
