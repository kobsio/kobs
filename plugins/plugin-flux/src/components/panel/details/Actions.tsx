import { Alert, AlertActionCloseButton, AlertGroup, Dropdown, DropdownItem, KebabToggle } from '@patternfly/react-core';
import React, { useState } from 'react';

import { IAlert, TType } from '../../../utils/interfaces';
import { IPluginInstance } from '@kobsio/shared';
import Sync from './actions/Sync';

interface IActionProps {
  instance: IPluginInstance;
  cluster: string;
  type: TType;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  item: any;
  refetch: () => void;
}

const Actions: React.FunctionComponent<IActionProps> = ({ instance, cluster, type, item, refetch }: IActionProps) => {
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [alerts, setAlerts] = useState<IAlert[]>([]);
  const [showSync, setShowSync] = useState<boolean>(false);

  // removeAlert is used to remove an alert from the list of alerts, when the user clicks the close button.
  const removeAlert = (index: number): void => {
    const tmpAlerts = [...alerts];
    tmpAlerts.splice(index, 1);
    setAlerts(tmpAlerts);
  };

  return (
    <React.Fragment>
      <Dropdown
        className="pf-c-drawer__close"
        toggle={<KebabToggle onToggle={(): void => setShowDropdown(!showDropdown)} />}
        isOpen={showDropdown}
        isPlain={true}
        position="right"
        dropdownItems={[
          <DropdownItem
            key="sync"
            onClick={(): void => {
              setShowDropdown(false);
              setShowSync(true);
            }}
          >
            Sync
          </DropdownItem>,
        ]}
      />

      <AlertGroup isToast={true}>
        {alerts.map((alert, index) => (
          <Alert
            key={index}
            isLiveRegion={true}
            variant={alert.variant}
            title={alert.title}
            actionClose={<AlertActionCloseButton onClick={(): void => removeAlert(index)} />}
          />
        ))}
      </AlertGroup>

      <Sync
        instance={instance}
        cluster={cluster}
        type={type}
        item={item}
        show={showSync}
        setShow={setShowSync}
        setAlert={(alert: IAlert): void => setAlerts([...alerts, alert])}
        refetch={refetch}
      />
    </React.Fragment>
  );
};

export default Actions;
