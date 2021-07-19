import { AlertVariant, Button, ButtonVariant, Modal, ModalVariant } from '@patternfly/react-core';
import { IRow } from '@patternfly/react-table';
import React from 'react';
import { compare } from 'fast-json-patch';

import { IAlert } from '../../../../utils/interfaces';
import { IResource } from '@kobsio/plugin-core';

interface IRestartProps {
  request: IResource;
  resource: IRow;
  show: boolean;
  setShow: (value: boolean) => void;
  setAlert: (alert: IAlert) => void;
  refetch: () => void;
}

const Restart: React.FunctionComponent<IRestartProps> = ({
  request,
  resource,
  show,
  setShow,
  setAlert,
  refetch,
}: IRestartProps) => {
  const handleRestart = async (): Promise<void> => {
    try {
      const now = new Date();
      const copy = JSON.parse(JSON.stringify(resource.props));

      if (copy.spec && copy.spec.template.metadata) {
        if (copy.spec.template.metadata.annotations) {
          copy.spec.template.metadata.annotations['kobs.io/restartedAt'] = now.toJSON();
        } else {
          copy.spec.template.metadata.annotations = { 'kobs.io/restartedAt': now.toJSON() };
        }
      }

      const diff = compare(resource.props, copy);

      const response = await fetch(
        `/api/plugins/resources/resources?cluster=${resource.cluster.title}${
          resource.namespace ? `&namespace=${resource.namespace.title}` : ''
        }&name=${resource.name.title}&resource=${request.resource}&path=${request.path}`,
        {
          body: JSON.stringify(diff),
          method: 'put',
        },
      );
      const json = await response.json();

      if (response.status >= 200 && response.status < 300) {
        setShow(false);
        setAlert({ title: `${resource.name.title} was restarted`, variant: AlertVariant.success });
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
      title={`Restart ${resource.name.title}`}
      isOpen={show}
      onClose={(): void => setShow(false)}
      actions={[
        <Button key="restart" variant={ButtonVariant.primary} onClick={handleRestart}>
          Restart
        </Button>,
        <Button key="cancel" variant={ButtonVariant.link} onClick={(): void => setShow(false)}>
          Cancel
        </Button>,
      ]}
    >
      <p>
        Do you really want to restart <b>{resource.name.title}</b> (
        {resource.namespace ? `${resource.namespace.title} ${resource.cluster.title}` : resource.cluster.title})?
      </p>
    </Modal>
  );
};

export default Restart;
