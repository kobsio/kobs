import { Alert, AlertActionCloseButton, AlertGroup, Dropdown, DropdownItem, KebabToggle } from '@patternfly/react-core';
import React, { useState } from 'react';
import { IRow } from '@patternfly/react-table';

import CreateJob from './actions/CreateJob';
import Delete from './actions/Delete';
import Edit from './actions/Edit';
import { IAlert } from '../../../utils/interfaces';
import { IResource } from '@kobsio/plugin-core';
import Restart from './actions/Restart';
import Scale from './actions/Scale';

interface IActionProps {
  request: IResource;
  resource: IRow;
  refetch: () => void;
}

const Actions: React.FunctionComponent<IActionProps> = ({ request, resource, refetch }: IActionProps) => {
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [alerts, setAlerts] = useState<IAlert[]>([]);
  const [showScale, setShowScale] = useState<boolean>(false);
  const [showRestart, setShowRestart] = useState<boolean>(false);
  const [showCreateJob, setShowCreateJob] = useState<boolean>(false);
  const [showEdit, setShowEdit] = useState<boolean>(false);
  const [showDelete, setShowDelete] = useState<boolean>(false);

  // removeAlert is used to remove an alert from the list of alerts, when the user clicks the close button.
  const removeAlert = (index: number): void => {
    const tmpAlerts = [...alerts];
    tmpAlerts.splice(index, 1);
    setAlerts(tmpAlerts);
  };

  // We have to add different items to the actions dropdown menu. For that we are checking the resource before it is
  // added to the menu. The only exceptions are the edit and delete actions, which are available for all resources.
  const dropdownItems = [];

  if (request.resource === 'deployments' || request.resource === 'statefulsets' || request.resource === 'replicasets') {
    dropdownItems.push(
      <DropdownItem
        key="scale"
        onClick={(): void => {
          setShowDropdown(false);
          setShowScale(true);
        }}
      >
        Scale
      </DropdownItem>,
    );
  }

  if (request.resource === 'daemonsets' || request.resource === 'deployments' || request.resource === 'statefulsets') {
    dropdownItems.push(
      <DropdownItem
        key="restart"
        onClick={(): void => {
          setShowDropdown(false);
          setShowRestart(true);
        }}
      >
        Restart
      </DropdownItem>,
    );
  }

  if (request.resource === 'cronjobs') {
    dropdownItems.push(
      <DropdownItem
        key="createJob"
        onClick={(): void => {
          setShowDropdown(false);
          setShowCreateJob(true);
        }}
      >
        Create Job
      </DropdownItem>,
    );
  }

  dropdownItems.push(
    <DropdownItem
      key="edit"
      onClick={(): void => {
        setShowDropdown(false);
        setShowEdit(true);
      }}
    >
      Edit
    </DropdownItem>,
  );

  dropdownItems.push(
    <DropdownItem
      key="delete"
      onClick={(): void => {
        setShowDropdown(false);
        setShowDelete(true);
      }}
    >
      Delete
    </DropdownItem>,
  );

  return (
    <React.Fragment>
      <Dropdown
        className="pf-c-drawer__close"
        toggle={<KebabToggle onToggle={(): void => setShowDropdown(!showDropdown)} />}
        isOpen={showDropdown}
        isPlain={true}
        position="right"
        dropdownItems={dropdownItems}
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

      <Scale
        request={request}
        resource={resource}
        show={showScale}
        setShow={setShowScale}
        setAlert={(alert: IAlert): void => setAlerts([...alerts, alert])}
        refetch={refetch}
      />

      <Restart
        request={request}
        resource={resource}
        show={showRestart}
        setShow={setShowRestart}
        setAlert={(alert: IAlert): void => setAlerts([...alerts, alert])}
        refetch={refetch}
      />

      <CreateJob
        request={request}
        resource={resource}
        show={showCreateJob}
        setShow={setShowCreateJob}
        setAlert={(alert: IAlert): void => setAlerts([...alerts, alert])}
        refetch={refetch}
      />

      <Edit
        request={request}
        resource={resource}
        show={showEdit}
        setShow={setShowEdit}
        setAlert={(alert: IAlert): void => setAlerts([...alerts, alert])}
        refetch={refetch}
      />

      <Delete
        request={request}
        resource={resource}
        show={showDelete}
        setShow={setShowDelete}
        setAlert={(alert: IAlert): void => setAlerts([...alerts, alert])}
        refetch={refetch}
      />
    </React.Fragment>
  );
};

export default Actions;
