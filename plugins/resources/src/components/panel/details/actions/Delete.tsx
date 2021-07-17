import {
  Alert,
  AlertActionCloseButton,
  AlertGroup,
  AlertVariant,
  Button,
  ButtonVariant,
  Modal,
  ModalVariant,
} from '@patternfly/react-core';
import React, { useState } from 'react';
import { IRow } from '@patternfly/react-table';

import { IResource } from '@kobsio/plugin-core';

interface IDeleteProps {
  request: IResource;
  resource: IRow;
  show: boolean;
  setShow: (value: boolean) => void;
}

const Delete: React.FunctionComponent<IDeleteProps> = ({ request, resource, show, setShow }: IDeleteProps) => {
  const [error, setError] = useState<string>('');

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
      } else {
        if (json.error) {
          throw new Error(json.error);
        } else {
          throw new Error('An unknown error occured');
        }
      }
    } catch (err) {
      setShow(false);
      setError(err.message);
    }
  };

  if (error) {
    return (
      <div style={{ height: '100%', minHeight: '100%' }}>
        <AlertGroup isToast={true}>
          <Alert
            isLiveRegion={true}
            variant={AlertVariant.danger}
            title={error}
            actionClose={<AlertActionCloseButton onClick={(): void => setError('')} />}
          />
        </AlertGroup>
      </div>
    );
  }

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
