import { AlertVariant, DropdownItem } from '@patternfly/react-core';
import React from 'react';

import { IIncident, IMessage } from '../../../../../utils/interfaces';
import { IPluginInstance } from '@kobsio/shared';

interface IResolveProps {
  instance: IPluginInstance;
  incident: IIncident;
  refetch: () => void;
  hideDropdown: () => void;
  setMessage: (message: IMessage) => void;
}

const Resolve: React.FunctionComponent<IResolveProps> = ({
  instance,
  incident,
  refetch,
  hideDropdown,
  setMessage,
}: IResolveProps) => {
  const resolve = async (): Promise<void> => {
    hideDropdown();

    try {
      const response = await fetch(`/api/plugins/opsgenie/incident/resolve?id=${incident.id}`, {
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
        refetch();
        setMessage({
          title: `Incident ${incident.message} was resolved`,
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

  return <DropdownItem onClick={resolve}>Resolve</DropdownItem>;
};

export default Resolve;
