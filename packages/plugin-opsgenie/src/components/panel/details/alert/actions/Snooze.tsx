import {
  AlertVariant,
  Button,
  ButtonVariant,
  DropdownItem,
  Form,
  FormGroup,
  FormSelect,
  FormSelectOption,
  Modal,
  ModalVariant,
} from '@patternfly/react-core';
import React, { useState } from 'react';

import { IAlert, IMessage } from '../../../../../utils/interfaces';
import { IPluginInstance } from '@kobsio/shared';

interface ISnoozeProps {
  instance: IPluginInstance;
  alert: IAlert;
  refetch: () => void;
  hideDropdown: () => void;
  setMessage: (message: IMessage) => void;
}

const Snooze: React.FunctionComponent<ISnoozeProps> = ({
  instance,
  alert,
  refetch,
  hideDropdown,
  setMessage,
}: ISnoozeProps) => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [duration, setDuration] = useState<string>('1h');

  const snooze = async (): Promise<void> => {
    hideDropdown();

    try {
      const response = await fetch(`/api/plugins/opsgenie/alert/snooze?id=${alert.id}&snooze=${duration}`, {
        headers: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          'x-kobs-plugin': instance.name,
          // eslint-disable-next-line @typescript-eslint/naming-convention
          'x-kobs-satellite': instance.satellite,
        },
        method: 'get',
      });
      const json = await response.json();

      if (response.status >= 200 && response.status < 300) {
        setShowModal(false);
        refetch();
        setMessage({
          title: `Alert ${alert.message} was snoozed for ${duration}`,
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
      setShowModal(false);
      setMessage({ title: err.message, variant: AlertVariant.danger });
    }
  };

  return (
    <React.Fragment>
      <DropdownItem onClick={(): void => setShowModal(true)}>Snooze</DropdownItem>

      <Modal
        variant={ModalVariant.medium}
        title="Snooze Alert"
        isOpen={showModal}
        onClose={(): void => setShowModal(false)}
        actions={[
          <Button key="snooze" variant={ButtonVariant.primary} onClick={snooze}>
            Snooze
          </Button>,
          <Button key="cancel" variant={ButtonVariant.link} onClick={(): void => setShowModal(false)}>
            Cancel
          </Button>,
        ]}
      >
        <Form isHorizontal={true}>
          <FormGroup label="Duration" fieldId="opsgenie-snooze-duration">
            <FormSelect
              value={duration}
              onChange={(value): void => setDuration(value)}
              id="opsgenie-snooze-duration"
              name="opsgenie-snooze-duration"
              aria-label="Duration"
            >
              <FormSelectOption key={0} value="15m" label="15m" />
              <FormSelectOption key={1} value="30m" label="30m" />
              <FormSelectOption key={2} value="1h" label="1h" />
              <FormSelectOption key={3} value="3h" label="3h" />
              <FormSelectOption key={4} value="6h" label="6h" />
              <FormSelectOption key={5} value="12h" label="12h" />
              <FormSelectOption key={6} value="24h" label="24h" />
              <FormSelectOption key={7} value="48h" label="48h" />
              <FormSelectOption key={8} value="72h" label="72h" />
              <FormSelectOption key={9} value="168h" label="168h" />
            </FormSelect>
          </FormGroup>
        </Form>
      </Modal>
    </React.Fragment>
  );
};

export default Snooze;
