import { AlertVariant, DropdownItem } from '@patternfly/react-core';
import React from 'react';

import { IIncident, IMessage } from '../../../../../utils/interfaces';

interface ICloseProps {
  name: string;
  incident: IIncident;
  refetch: () => void;
  hideDropdown: () => void;
  setMessage: (message: IMessage) => void;
}

const Close: React.FunctionComponent<ICloseProps> = ({
  name,
  incident,
  refetch,
  hideDropdown,
  setMessage,
}: ICloseProps) => {
  const close = async (): Promise<void> => {
    hideDropdown();

    try {
      const response = await fetch(`/api/plugins/opsgenie/${name}/incident/close?id=${incident.id}`, {
        method: 'get',
      });
      const json = await response.json();

      if (response.status >= 200 && response.status < 300) {
        refetch();
        setMessage({
          title: `Incident ${incident.message} was closed`,
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

  return <DropdownItem onClick={close}>Close</DropdownItem>;
};

export default Close;
