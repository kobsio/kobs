import { AlertVariant, Button, ButtonVariant, Modal, ModalVariant } from '@patternfly/react-core';
import { IRow } from '@patternfly/react-table';
import React from 'react';

import { IAlert } from '../../../../utils/interfaces';
import { IResource } from '@kobsio/plugin-core';

interface IDeleteProps {
  request: IResource;
  resource: IRow;
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
  const handleDelete = async (): Promise<void> => {
    try {
      const response = await fetch(
        `/api/plugins/resources/resources?cluster=${resource.cluster.title}${
          resource.namespace ? `&namespace=${resource.namespace.title}` : ''
        }&name=${resource.name.title}&resource=${request.resource}&path=${request.path}`,
        { method: 'delete' },
      );
      const json = await response.json();

      if (response.status >= 200 && response.status < 300) {
        setShow(false);
        setAlert({ title: `${resource.name.title} was deleted`, variant: AlertVariant.danger });
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
      title={`Delete ${resource.name.title}`}
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
        Do you really want to delete <b>{resource.name.title}</b> (
        {resource.namespace ? `${resource.namespace.title} ${resource.cluster.title}` : resource.cluster.title})?
      </p>
    </Modal>
  );
};

export default Delete;
