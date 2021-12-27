import { AlertVariant, DropdownItem } from '@patternfly/react-core';
import React from 'react';

import { IIncident, IMessage } from '../../../../../utils/interfaces';

interface IAcknowledgeProps {
  name: string;
  incident: IIncident;
  refetch: () => void;
  hideDropdown: () => void;
  setMessage: (message: IMessage) => void;
}

const Acknowledge: React.FunctionComponent<IAcknowledgeProps> = ({
  name,
  incident,
  refetch,
  hideDropdown,
  setMessage,
}: IAcknowledgeProps) => {
  const acknowledge = async (): Promise<void> => {
    hideDropdown();

    try {
      const response = await fetch(`/api/plugins/opsgenie/${name}/incident/resolve?id=${incident.id}`, {
        method: 'get',
      });
      const json = await response.json();

      if (response.status >= 200 && response.status < 300) {
        refetch();
        setMessage({
          title: `Incident ${incident.message} was acknowledge`,
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
