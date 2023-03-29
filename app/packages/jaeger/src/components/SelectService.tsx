import { APIContext, APIError, IAPIContext, IPluginInstance } from '@kobsio/core';
import { Autocomplete, TextField } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useContext, FunctionComponent } from 'react';

interface ISelectServiceProps {
  instance: IPluginInstance;
  selectService: (service: string) => void;
  selectedService: string;
}

export const SelectService: FunctionComponent<ISelectServiceProps> = ({ instance, selectService, selectedService }) => {
  const apiContext = useContext<IAPIContext>(APIContext);

  const { isLoading, data } = useQuery<string[], APIError>(['jaeger/services', instance], async () => {
    const res = await apiContext.client.get<{ data?: string[] }>('/api/plugins/jaeger/services', {
      headers: {
        'x-kobs-cluster': instance.cluster,
        'x-kobs-plugin': instance.name,
      },
    });

    return res?.data ?? [];
  });

  return (
    <Autocomplete
      size="small"
      loading={isLoading}
      options={data ?? []}
      value={selectedService}
      onChange={(e, value) => selectService(value ?? '')}
      renderInput={(params) => <TextField {...params} label="Service" placeholder="Service" />}
    />
  );
};
