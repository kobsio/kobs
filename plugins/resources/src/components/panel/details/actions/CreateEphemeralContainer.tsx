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
} from '@patternfly/react-core';
import React, { useContext, useState } from 'react';
import { IRow } from '@patternfly/react-table';
import { V1EphemeralContainer } from '@kubernetes/client-node';
import yaml from 'js-yaml';

import { Editor, IPluginsContext, IResource, PluginsContext } from '@kobsio/plugin-core';
import { IAlert } from '../../../../utils/interfaces';

interface ICreateEphemeralContainerProps {
  request: IResource;
  resource: IRow;
  show: boolean;
  setShow: (value: boolean) => void;
  setAlert: (alert: IAlert) => void;
  refetch: () => void;
}

const CreateEphemeralContainer: React.FunctionComponent<ICreateEphemeralContainerProps> = ({
  resource,
  show,
  setShow,
  setAlert,
  refetch,
}: ICreateEphemeralContainerProps) => {
  const pluginsContext = useContext<IPluginsContext>(PluginsContext);
  const pluginDetails = pluginsContext.getPluginDetails('resources');
  const ephemeralContainers: V1EphemeralContainer[] | undefined =
    pluginDetails && pluginDetails.options && pluginDetails.options && pluginDetails.options.ephemeralContainers
      ? pluginDetails.options.ephemeralContainers
      : undefined;

  const [ephemeralContainer, setEphemeralContainer] = useState<string>(
    ephemeralContainers && ephemeralContainers.length > 0 ? yaml.dump(ephemeralContainers[0]) : '',
  );

  const createEphemeralContainer = async (): Promise<void> => {
    try {
      const parsedEphemeralContainer = yaml.load(ephemeralContainer) as V1EphemeralContainer;
      const manifest = {
        apiVersion: 'v1',
        ephemeralContainers: [parsedEphemeralContainer],
        kind: 'EphemeralContainers',
        metadata: {
          name: resource.name.title,
          namespace: resource.namespace.title,
        },
      };

      const response = await fetch(
        `/api/plugins/resources/resources?cluster=${resource.cluster.title}${
          resource.namespace ? `&namespace=${resource.namespace.title}` : ''
        }&name=${resource.name.title}&resource=pods&path=/api/v1&subResource=ephemeralcontainers`,
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
      {ephemeralContainers && ephemeralContainers.length > 0 && (
        <React.Fragment>
          <Form isHorizontal={true}>
            <FormGroup label="Template" fieldId="create-ephemeral-container-form-container">
              <FormSelect
                value={ephemeralContainer}
                onChange={(value): void => setEphemeralContainer(value)}
                id="create-ephemeral-container-form-container"
                name="create-ephemeral-container-form-container"
                aria-label="Template"
              >
                {ephemeralContainers.map((container, index) => (
                  <FormSelectOption key={index} value={yaml.dump(container)} label={container.name} />
                ))}
              </FormSelect>
            </FormGroup>
          </Form>
          <p>&nbsp;</p>
        </React.Fragment>
      )}

      <Editor value={ephemeralContainer} mode="yaml" readOnly={false} onChange={setEphemeralContainer} />
    </Modal>
  );
};

export default CreateEphemeralContainer;
