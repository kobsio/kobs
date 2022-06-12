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
import { V1Pod } from '@kubernetes/client-node';

import { IAlert } from '../../utils/interfaces';
import { IResource } from '../../../../resources/clusters';
import { IResourceRow } from '../../utils/tabledata';
import { blobDownload } from '@kobsio/shared';

// getContainers returns a list with all container names for the given Pod. It contains all specified init containers
// and the "normal" containers.
const getContainers = (pod: V1Pod): string[] => {
  const containers: string[] = [];

  if (pod.spec?.initContainers) {
    for (const container of pod.spec.initContainers) {
      containers.push(container.name);
    }
  }

  if (pod.spec?.containers) {
    for (const container of pod.spec.containers) {
      containers.push(container.name);
    }
  }

  if (pod.spec?.ephemeralContainers) {
    for (const container of pod.spec.ephemeralContainers) {
      containers.push(container.name);
    }
  }

  return containers;
};

interface IDownloadFileProps {
  resource: IResource;
  resourceData: IResourceRow;
  show: boolean;
  setShow: (value: boolean) => void;
  setAlert: (alert: IAlert) => void;
}

const DownloadFile: React.FunctionComponent<IDownloadFileProps> = ({
  resourceData,
  show,
  setShow,
  setAlert,
}: IDownloadFileProps) => {
  const containers = getContainers(resourceData.props);

  const [container, setContainer] = useState<string>(containers[0]);
  const [sourcePath, setSourcePath] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const downloadFile = async (): Promise<void> => {
    setIsLoading(true);

    try {
      const response = await fetch(
        `/api/resources/file?satellite=${resourceData.satellite}&cluster=${resourceData.cluster}${
          resourceData.namespace ? `&namespace=${resourceData.namespace}` : ''
        }&name=${resourceData.name}&container=${container}&srcPath=${sourcePath}`,
        { method: 'get' },
      );

      if (response.status >= 200 && response.status < 300) {
        const data = await response.blob();
        blobDownload(data, `${resourceData.name}__${container}.tar`);

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
            isRequired={true}
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
