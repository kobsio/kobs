import { AlertVariant, Button, ButtonVariant, Modal, ModalVariant } from '@patternfly/react-core';
import React, { useState } from 'react';
import { V1EphemeralContainer } from '@kubernetes/client-node';
import yaml from 'js-yaml';

import { Editor } from '@kobsio/shared';
import { IAlert } from '../../utils/interfaces';
import { IResource } from '../../../../resources/clusters';
import { IResourceRow } from '../../utils/tabledata';

interface ICreateEphemeralContainerProps {
  resource: IResource;
  resourceData: IResourceRow;
  show: boolean;
  setShow: (value: boolean) => void;
  setAlert: (alert: IAlert) => void;
}

const CreateEphemeralContainer: React.FunctionComponent<ICreateEphemeralContainerProps> = ({
  resourceData,
  show,
  setShow,
  setAlert,
}: ICreateEphemeralContainerProps) => {
  const [ephemeralContainer, setEphemeralContainer] = useState<string>(`name: debugger-busybox
image: busybox
command:
  - sh
terminationMessagePolicy: File
imagePullPolicy: IfNotPresent
stdin: true
tty: true
`);

  const createEphemeralContainer = async (): Promise<void> => {
    try {
      const parsedEphemeralContainer = yaml.load(ephemeralContainer) as V1EphemeralContainer;
      const manifest = {
        apiVersion: 'v1',
        ephemeralContainers: [parsedEphemeralContainer],
        kind: 'EphemeralContainers',
        metadata: {
          name: resourceData.name,
          namespace: resourceData.namespace,
        },
      };

      const response = await fetch(
        `/api/resources?satellite=${resourceData.satellite}&cluster=${resourceData.cluster}${
          resourceData.namespace ? `&namespace=${resourceData.namespace}` : ''
        }&name=${resourceData.name}&resource=pods&path=/api/v1&subResource=ephemeralcontainers`,
        {
          body: JSON.stringify(manifest),
          method: 'post',
        },
      );
      const json = await response.json();

      if (response.status >= 200 && response.status < 300) {
        setShow(false);
        setAlert({
          title: `Ephemeral Container ${parsedEphemeralContainer.name} was created`,
          variant: AlertVariant.success,
        });
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
      variant={ModalVariant.medium}
      title="Create Ephemeral Container"
      isOpen={show}
      onClose={(): void => setShow(false)}
      actions={[
        <Button key="createEphemeralContainer" variant={ButtonVariant.primary} onClick={createEphemeralContainer}>
          Create Ephemeral Container
        </Button>,
        <Button key="cancel" variant={ButtonVariant.link} onClick={(): void => setShow(false)}>
          Cancel
        </Button>,
      ]}
    >
      <Editor value={ephemeralContainer} mode="yaml" readOnly={false} onChange={setEphemeralContainer} />
    </Modal>
  );
};

export default CreateEphemeralContainer;
