import React, { useState } from 'react';
import { DataList } from '@patternfly/react-core';

import Alert from './details/alert/Alert';
import AlertsListItem from './AlertsListItem';
import { IAlert } from '../../utils/interfaces';
import { IPluginInstance } from '@kobsio/shared';

interface IAlertsListProps {
  instance: IPluginInstance;
  alerts: IAlert[];
  refetch: () => void;
  setDetails?: (details: React.ReactNode) => void;
}

const AlertsList: React.FunctionComponent<IAlertsListProps> = ({
  instance,
  alerts,
  refetch,
  setDetails,
}: IAlertsListProps) => {
  const [selectedAlert, setSelectedAlert] = useState<string>();

  const selectAlert = (id: string): void => {
    const alert = alerts.filter((alert) => alert.id === id);
    if (setDetails && alert.length === 1) {
      setSelectedAlert(alert[0].id);
      setDetails(
        <Alert
          instance={instance}
          alert={alert[0]}
          refetch={refetch}
          close={(): void => {
            setSelectedAlert(undefined);
            setDetails(undefined);
          }}
        />,
      );
    }
  };

  return (
    <DataList aria-label="Alerts list" selectedDataListItemId={selectedAlert} onSelectDataListItem={selectAlert}>
      {alerts.map((alert) => (
        <AlertsListItem key={alert.id} alert={alert} />
      ))}
    </DataList>
  );
};

export default AlertsList;
