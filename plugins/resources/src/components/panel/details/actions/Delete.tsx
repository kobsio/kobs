import { AlertVariant, Button, ButtonVariant, Checkbox, Modal, ModalVariant } from '@patternfly/react-core';
import React, { useState } from 'react';

import { IResource, IResourceRow } from '@kobsio/plugin-core';
import { IAlert } from '../../../../utils/interfaces';

interface IDeleteProps {
  request: IResource;
  resource: IResourceRow;
  show: boolean;
  setShow: (value: boolean) => void;
  setAlert: (alert: IAlert) => void;
  refetch: () => void;
}

const Delete: React.FunctionComponent<IDeleteProps> = ({
  request,
  resource,
  show,
  setShow,
  setAlert,
  refetch,
}: IDeleteProps) => {
  const [force, setForce] = useState<boolean>(false);

  const handleDelete = async (): Promise<void> => {
    try {
      const response = await fetch(
        `/api/plugins/resources/resources?cluster=${resource.cluster}${
          resource.namespace ? `&namespace=${resource.namespace}` : ''
        }&name=${resource.name}&resource=${request.resource}&path=${request.path}&force=${force}`,
        { method: 'delete' },
      );
      const json = await response.json();

      if (response.status >= 200 && response.status < 300) {
        setShow(false);
        setAlert({ title: `${resource.name} was deleted`, variant: AlertVariant.success });
        refetch();
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
      title={`Delete ${resource.name}`}
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
        Do you really want to delete <b>{resource.name}</b> (
        {resource.namespace ? `${resource.namespace} ${resource.cluster}` : resource.cluster})?
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