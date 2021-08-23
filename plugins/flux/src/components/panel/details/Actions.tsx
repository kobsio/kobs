import { Alert, AlertActionCloseButton, AlertGroup, Dropdown, DropdownItem, KebabToggle } from '@patternfly/react-core';
import React, { useState } from 'react';
import { IRow } from '@patternfly/react-table';

import { IAlert } from '../../../utils/interfaces';
import { IResource } from '@kobsio/plugin-core';
import Sync from './actions/Sync';

interface IActionProps {
  request: IResource;
  resource: IRow;
  refetch: () => void;
}

const Actions: React.FunctionComponent<IActionProps> = ({ request, resource, refetch }: IActionProps) => {
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
        request={request}
        resource={resource}
        show={showSync}
        setShow={setShowSync}
        setAlert={(alert: IAlert): void => setAlerts([...alerts, alert])}
        refetch={refetch}
      />
    </React.Fragment>
  );
};

export default Actions;
