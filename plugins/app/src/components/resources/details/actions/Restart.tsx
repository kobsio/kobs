import { AlertVariant, Button, ButtonVariant, Modal, ModalVariant } from '@patternfly/react-core';
import React from 'react';
import { compare } from 'fast-json-patch';

import { IAlert } from '../../utils/interfaces';
import { IResource } from '../../../../resources/clusters';
import { IResourceRow } from '../../utils/tabledata';

interface IRestartProps {
  resource: IResource;
  resourceData: IResourceRow;
  show: boolean;
  setShow: (value: boolean) => void;
  setAlert: (alert: IAlert) => void;
}

const Restart: React.FunctionComponent<IRestartProps> = ({
  resource,
  resourceData,
  show,
  setShow,
  setAlert,
}: IRestartProps) => {
  const handleRestart = async (): Promise<void> => {
    try {
      const now = new Date();
      const copy = JSON.parse(JSON.stringify(resourceData.props));

      if (copy.spec && copy.spec.template.metadata) {
        if (copy.spec.template.metadata.annotations) {
          copy.spec.template.metadata.annotations['kobs.io/restartedAt'] = now.toJSON();
        } else {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          copy.spec.template.metadata.annotations = { 'kobs.io/restartedAt': now.toJSON() };
        }
      }

      const diff = compare(resourceData.props, copy);

      const response = await fetch(
        `/api/resources?satellite=${resourceData.satellite}&cluster=${resourceData.cluster}${
          resourceData.namespace ? `&namespace=${resourceData.namespace}` : ''
        }&name=${resourceData.name}&resource=${resource.resource}&path=${resource.path}`,
        {
          body: JSON.stringify(diff),
          method: 'put',
        },
      );
      const json = await response.json();

      if (response.status >= 200 && response.status < 300) {
        setShow(false);
        setAlert({ title: `${resourceData.name} was restarted`, variant: AlertVariant.success });
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
      title={`Restart ${resourceData.name}`}
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
        Do you really want to restart <b>{resourceData.name}</b> (
        {resourceData.namespace ? `${resourceData.namespace}/${resourceData.cluster}` : resourceData.cluster})?
      </p>
    </Modal>
  );
};

export default Restart;
