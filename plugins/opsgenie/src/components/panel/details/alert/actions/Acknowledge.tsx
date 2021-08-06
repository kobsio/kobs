import { AlertVariant, DropdownItem } from '@patternfly/react-core';
import React from 'react';

import { IAlert, IMessage } from '../../../../../utils/interfaces';

interface IAcknowledgeProps {
  name: string;
  alert: IAlert;
  hideDropdown: () => void;
  setMessage: (message: IMessage) => void;
}

const Acknowledge: React.FunctionComponent<IAcknowledgeProps> = ({
  name,
  alert,
  hideDropdown,
  setMessage,
}: IAcknowledgeProps) => {
  const acknowledge = async (): Promise<void> => {
    hideDropdown();

    try {
      const response = await fetch(`/api/plugins/opsgenie/alert/acknowledge/${name}?id=${alert.id}`, {
        method: 'get',
      });
      const json = await response.json();

      if (response.status >= 200 && response.status < 300) {
        setMessage({
          title: `Alert ${alert.message} was acknowledge`,
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
      setMessage({ title: err.message, variant: AlertVariant.danger });
    }
  };

  return <DropdownItem onClick={acknowledge}>Acknowledge</DropdownItem>;
};

export default Acknowledge;
