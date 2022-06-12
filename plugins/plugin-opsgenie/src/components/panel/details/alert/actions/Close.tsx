import { AlertVariant, DropdownItem } from '@patternfly/react-core';
import React from 'react';

import { IAlert, IMessage } from '../../../../../utils/interfaces';
import { IPluginInstance } from '@kobsio/shared';

interface ICloseProps {
  instance: IPluginInstance;
  alert: IAlert;
  refetch: () => void;
  hideDropdown: () => void;
  setMessage: (message: IMessage) => void;
}

const Close: React.FunctionComponent<ICloseProps> = ({
  instance,
  alert,
  refetch,
  hideDropdown,
  setMessage,
}: ICloseProps) => {
  const close = async (): Promise<void> => {
    hideDropdown();

    try {
      const response = await fetch(`/api/plugins/opsgenie/alert/close?id=${alert.id}`, {
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
          title: `Alert ${alert.message} was closed`,
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
