import {
  AlertVariant,
  Button,
  ButtonVariant,
  Form,
  FormGroup,
  FormSelect,
  FormSelectOption,
  Modal,
  ModalVariant,
  TextInput,
} from '@patternfly/react-core';
import React, { useState } from 'react';
import { IRow } from '@patternfly/react-table';
import { V1Pod } from '@kubernetes/client-node';

import { IAlert } from '../../../../utils/interfaces';
import { blobDownload } from '@kobsio/plugin-core';

// getContainers returns a list with all container names for the given Pod. It contains all specified init containers
// and the "normal" containers.
const getContainers = (pod: V1Pod): string[] => {
  const containers: string[] = [];

  if (pod.spec?.initContainers) {
    for (const container of pod.spec?.initContainers) {
      containers.push(container.name);
    }
  }

  if (pod.spec?.containers) {
    for (const container of pod.spec?.containers) {
      containers.push(container.name);
    }
  }

  if (pod.spec?.ephemeralContainers) {
    for (const container of pod.spec?.ephemeralContainers) {
      containers.push(container.name);
    }
  }

  return containers;
};

interface IDownloadFileProps {
  resource: IRow;
  show: boolean;
  setShow: (value: boolean) => void;
  setAlert: (alert: IAlert) => void;
}

const DownloadFile: React.FunctionComponent<IDownloadFileProps> = ({
  resource,
  show,
  setShow,
  setAlert,
}: IDownloadFileProps) => {
  const containers = getContainers(resource.props);

  const [container, setContainer] = useState<string>(containers[0]);
  const [sourcePath, setSourcePath] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const downloadFile = async (): Promise<void> => {
    setIsLoading(true);

    try {
      const response = await fetch(
        `/api/plugins/resources/file?cluster=${resource.cluster.title}${
          resource.namespace ? `&namespace=${resource.namespace.title}` : ''
        }&name=${resource.name.title}&container=${container}&srcPath=${sourcePath}`,
        { method: 'get' },
      );

      if (response.status >= 200 && response.status < 300) {
        const data = await response.blob();
        blobDownload(data, `${resource.name.title}__${container}.tar`);

        setIsLoading(false);
        setShow(false);
      } else {
        const json = await response.json();

        if (json.error) {
          throw new Error(json.error);
        } else {
          throw new Error('An unknown error occured');
        }
      }
    } catch (err) {
      setIsLoading(false);
      setShow(false);
      setAlert({ title: err.message, variant: AlertVariant.danger });
    }
  };

  return (
    <Modal
      variant={ModalVariant.small}
      title="Download File"
      isOpen={show}
      onClose={(): void => setShow(false)}
      actions={[
        <Button key="download" variant={ButtonVariant.primary} isLoading={isLoading} onClick={downloadFile}>
          Download
        </Button>,
        <Button key="cancel" variant={ButtonVariant.link} onClick={(): void => setShow(false)}>
          Cancel
        </Button>,
      ]}
    >
      <Form isHorizontal={true}>
        <FormGroup label="Container" fieldId="download-form-container">
          <FormSelect
            value={container}
            onChange={(value): void => setContainer(value)}
            id="download-form-container"
            name="download-form-container"
            aria-label="Container"
          >
            {containers.map((container, index) => (
              <FormSelectOption key={index} value={container} label={container} />
            ))}
          </FormSelect>
        </FormGroup>

        <FormGroup label="Source Path" fieldId="download-form-source-path">
          <TextInput
            value={sourcePath}
            isRequired
            type="text"
            id="download-form-source-path"
            aria-describedby="download-form-source-path"
            name="download-form-source-path"
            onChange={(value): void => setSourcePath(value)}
          />
        </FormGroup>
      </Form>
    </Modal>
  );
};

export default DownloadFile;
