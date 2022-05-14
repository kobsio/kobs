import { Alert, AlertActionCloseButton, AlertGroup, Dropdown, DropdownItem, KebabToggle } from '@patternfly/react-core';
import React, { useState } from 'react';

import CreateEphemeralContainer from './actions/CreateEphemeralContainer';
import CreateJob from './actions/CreateJob';
import Delete from './actions/Delete';
import DownloadFile from './actions/DownloadFile';
import Edit from './actions/Edit';
import { IAlert } from '../utils/interfaces';
import { IResource } from '../../../resources/clusters';
import { IResourceRow } from '../utils/tabledata';
import Restart from './actions/Restart';
import Scale from './actions/Scale';
import UploadFile from './actions/UploadFile';

interface IActionProps {
  resource: IResource;
  resourceData: IResourceRow;
}

const Actions: React.FunctionComponent<IActionProps> = ({ resource, resourceData }: IActionProps) => {
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [alerts, setAlerts] = useState<IAlert[]>([]);
  const [showScale, setShowScale] = useState<boolean>(false);
  const [showRestart, setShowRestart] = useState<boolean>(false);
  const [showCreateJob, setShowCreateJob] = useState<boolean>(false);
  const [showDownloadFile, setShowDownloadFile] = useState<boolean>(false);
  const [showUploadFile, setShowUploadFile] = useState<boolean>(false);
  const [showCreateEphemeralContainer, setShowCreateEphemeralContainer] = useState<boolean>(false);
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
  const dropdownItems: React.ReactNode[] = [];

  if (resource.id === 'deployments' || resource.id === 'statefulsets' || resource.id === 'replicasets') {
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

  if (resource.id === 'daemonsets' || resource.id === 'deployments' || resource.id === 'statefulsets') {
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

  if (resource.id === 'cronjobs') {
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

  if (resource.id === 'pods') {
    dropdownItems.push(
      <DropdownItem
        key="donwloadfile"
        onClick={(): void => {
          setShowDropdown(false);
          setShowDownloadFile(true);
        }}
      >
        Download File
      </DropdownItem>,
    );
  }

  if (resource.id === 'pods') {
    dropdownItems.push(
      <DropdownItem
        key="uploadfile"
        onClick={(): void => {
          setShowDropdown(false);
          setShowUploadFile(true);
        }}
      >
        Upload File
      </DropdownItem>,
    );
  }

  if (resource.id === 'pods') {
    dropdownItems.push(
      <DropdownItem
        key="debug"
        onClick={(): void => {
          setShowDropdown(false);
          setShowCreateEphemeralContainer(true);
        }}
      >
        Create Ephemeral Container
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
        resource={resource}
        resourceData={resourceData}
        show={showScale}
        setShow={setShowScale}
        setAlert={(alert: IAlert): void => setAlerts([...alerts, alert])}
      />

      <Restart
        resource={resource}
        resourceData={resourceData}
        show={showRestart}
        setShow={setShowRestart}
        setAlert={(alert: IAlert): void => setAlerts([...alerts, alert])}
      />

      <CreateJob
        resource={resource}
        resourceData={resourceData}
        show={showCreateJob}
        setShow={setShowCreateJob}
        setAlert={(alert: IAlert): void => setAlerts([...alerts, alert])}
      />

      <DownloadFile
        resource={resource}
        resourceData={resourceData}
        show={showDownloadFile}
        setShow={setShowDownloadFile}
        setAlert={(alert: IAlert): void => setAlerts([...alerts, alert])}
      />

      <UploadFile
        resource={resource}
        resourceData={resourceData}
        show={showUploadFile}
        setShow={setShowUploadFile}
        setAlert={(alert: IAlert): void => setAlerts([...alerts, alert])}
      />

      <CreateEphemeralContainer
        resource={resource}
        resourceData={resourceData}
        show={showCreateEphemeralContainer}
        setShow={setShowCreateEphemeralContainer}
        setAlert={(alert: IAlert): void => setAlerts([...alerts, alert])}
      />

      <Edit
        resource={resource}
        resourceData={resourceData}
        show={showEdit}
        setShow={setShowEdit}
        setAlert={(alert: IAlert): void => setAlerts([...alerts, alert])}
      />

      <Delete
        resource={resource}
        resourceData={resourceData}
        show={showDelete}
        setShow={setShowDelete}
        setAlert={(alert: IAlert): void => setAlerts([...alerts, alert])}
      />
    </React.Fragment>
  );
};

export default Actions;
