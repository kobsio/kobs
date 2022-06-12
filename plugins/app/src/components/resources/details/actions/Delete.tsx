import { AlertVariant, Button, ButtonVariant, Checkbox, Modal, ModalVariant } from '@patternfly/react-core';
import React, { useState } from 'react';

import { IAlert } from '../../utils/interfaces';
import { IResource } from '../../../../resources/clusters';
import { IResourceRow } from '../../utils/tabledata';

interface IDeleteProps {
  resource: IResource;
  resourceData: IResourceRow;
  show: boolean;
  setShow: (value: boolean) => void;
  setAlert: (alert: IAlert) => void;
}

const Delete: React.FunctionComponent<IDeleteProps> = ({
  resource,
  resourceData,
  show,
  setShow,
  setAlert,
}: IDeleteProps) => {
  const [force, setForce] = useState<boolean>(false);

  const handleDelete = async (): Promise<void> => {
    try {
      const response = await fetch(
        `/api/resources?satellite=${resourceData.satellite}&cluster=${resourceData.cluster}${
          resourceData.namespace ? `&namespace=${resourceData.namespace}` : ''
        }&name=${resourceData.name}&resource=${resource.resource}&path=${resource.path}&force=${force}`,
        {
          method: 'delete',
        },
      );
      const json = await response.json();

      if (response.status >= 200 && response.status < 300) {
        setShow(false);
        setAlert({ title: `${resourceData.name} was deleted`, variant: AlertVariant.success });
      } else {
        if (json.error) {
          throw new Error(json.error);
        } else {
          throw new Error('An unknown error occured');
        }
      }
    } catch (err) {
      setShow(false);
      setAlert({ title: err.message, variant: AlertVariant.danger });
    }
  };

  return (
    <Modal
      variant={ModalVariant.small}
      title={`Delete ${resourceData.name}`}
      isOpen={show}
      onClose={(): void => setShow(false)}
      actions={[
        <Button key="delete" variant={ButtonVariant.danger} onClick={handleDelete}>
          Delete
        </Button>,
        <Button key="cancel" variant={ButtonVariant.link} onClick={(): void => setShow(false)}>
          Cancel
        </Button>,
      ]}
    >
      <p>
        Do you really want to delete <b>{resourceData.name}</b> (
        {resourceData.namespace ? `${resourceData.namespace} ${resourceData.cluster}` : resourceData.cluster})?
      </p>
      <p>&nbsp;</p>
      <Checkbox
        label="Force"
        isChecked={force}
        onChange={setForce}
        aria-label="Force"
        id="force-delete"
        name="force-delete"
      />
    </Modal>
  );
};

export default Delete;
