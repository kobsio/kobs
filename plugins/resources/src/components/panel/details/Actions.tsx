import { Dropdown, DropdownItem, KebabToggle } from '@patternfly/react-core';
import React, { useState } from 'react';
import { IRow } from '@patternfly/react-table';

import CreateJob from './actions/CreateJob';
import Delete from './actions/Delete';
import Edit from './actions/Edit';
import { IResource } from '@kobsio/plugin-core';
import Restart from './actions/Restart';
import Scale from './actions/Scale';

interface IActionProps {
  request: IResource;
  resource: IRow;
}

const Actions: React.FunctionComponent<IActionProps> = ({ request, resource }: IActionProps) => {
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [showScale, setShowScale] = useState<boolean>(false);
  const [showRestart, setShowRestart] = useState<boolean>(false);
  const [showCreateJob, setShowCreateJob] = useState<boolean>(false);
  const [showEdit, setShowEdit] = useState<boolean>(false);
  const [showDelete, setShowDelete] = useState<boolean>(false);

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

      <Scale request={request} resource={resource} show={showScale} setShow={setShowScale} />
      <Restart request={request} resource={resource} show={showRestart} setShow={setShowRestart} />
      <CreateJob request={request} resource={resource} show={showCreateJob} setShow={setShowCreateJob} />
      <Edit request={request} resource={resource} show={showEdit} setShow={setShowEdit} />
      <Delete request={request} resource={resource} show={showDelete} setShow={setShowDelete} />
    </React.Fragment>
  );
};

export default Actions;
