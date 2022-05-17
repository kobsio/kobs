import {
  AlertVariant,
  Button,
  ButtonVariant,
  FileUpload,
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

interface ISourceFile {
  filename: string;
  value?: string | File;
}

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

interface IUploadFileProps {
  resource: IResource;
  resourceData: IResourceRow;
  show: boolean;
  setShow: (value: boolean) => void;
  setAlert: (alert: IAlert) => void;
}

const UploadFile: React.FunctionComponent<IUploadFileProps> = ({
  resourceData,
  show,
  setShow,
  setAlert,
}: IUploadFileProps) => {
  const containers = getContainers(resourceData.props);

  const [container, setContainer] = useState<string>(containers[0]);
  const [sourceFile, setSourceFile] = useState<ISourceFile>({ filename: '', value: undefined });
  const [destinationPath, setDestinationPath] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const uploadFile = async (): Promise<void> => {
    setIsLoading(true);

    try {
      if (!sourceFile.value) {
        throw new Error('Source file is missing');
      }

      const formData = new FormData();
      formData.append('file', sourceFile.value);

      const response = await fetch(
        `/api/resources/file?satellite=${resourceData.satellite}&cluster=${resourceData.cluster}${
          resourceData.namespace ? `&namespace=${resourceData.namespace}` : ''
        }&name=${resourceData.name}&container=${container}&destPath=${destinationPath}`,
        {
          body: formData,
          method: 'post',
        },
      );

      const json = await response.json();

      if (response.status >= 200 && response.status < 300) {
        setIsLoading(false);
        setShow(false);
        setAlert({ title: 'File was uploaded', variant: AlertVariant.success });
      } else {
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
      title="Upload File"
      isOpen={show}
      onClose={(): void => setShow(false)}
      actions={[
        <Button key="upload" variant={ButtonVariant.primary} isLoading={isLoading} onClick={uploadFile}>
          Upload
        </Button>,
        <Button key="cancel" variant={ButtonVariant.link} onClick={(): void => setShow(false)}>
          Cancel
        </Button>,
      ]}
    >
      <Form isHorizontal={true}>
        <FormGroup label="Container" fieldId="upload-form-container">
          <FormSelect
            value={container}
            onChange={(value): void => setContainer(value)}
            id="upload-form-container"
            name="upload-form-container"
            aria-label="Container"
          >
            {containers.map((container, index) => (
              <FormSelectOption key={index} value={container} label={container} />
            ))}
          </FormSelect>
        </FormGroup>

        <FormGroup label="Destination Path" fieldId="upload-form-source-file">
          <FileUpload
            id="upload-form-source-file"
            value={sourceFile.value}
            filename={sourceFile.filename}
            filenamePlaceholder="Select a File"
            browseButtonText="Select File"
            onChange={(value, filename, event): void => setSourceFile({ filename: filename, value: value })}
          />
        </FormGroup>

        <FormGroup label="Destination Path" fieldId="upload-form-destination-path">
          <TextInput
            value={destinationPath}
            isRequired
            type="text"
            id="upload-form-destination-path"
            aria-describedby="upload-form-destination-path"
            name="upload-form-destination-path"
            onChange={(value): void => setDestinationPath(value)}
          />
        </FormGroup>
      </Form>
    </Modal>
  );
};

export default UploadFile;
