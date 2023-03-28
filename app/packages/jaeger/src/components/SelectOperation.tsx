import { APIContext, APIError, IAPIContext, IPluginInstance } from '@kobsio/core';
import { Autocomplete, TextField } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useContext, FunctionComponent } from 'react';

interface ISelectOperationProps {
  instance: IPluginInstance;
  selectOperation: (service: string) => void;
  selectedOperation: string;
  service: string;
}

export const SelectOperation: FunctionComponent<ISelectOperationProps> = ({
  instance,
  service,
  selectOperation,
  selectedOperation,
}) => {
  const apiContext = useContext<IAPIContext>(APIContext);

  const { isLoading, data } = useQuery<string[], APIError>(['jaeger/operations', instance, service], async () => {
    if (!service) {
      return [];
    }

    const res = await apiContext.client.get<{ data?: { name: string; spanKind: string }[] }>(
      `/api/plugins/jaeger/operations?service=${service}`,
      {
        headers: {
          'x-kobs-cluster': instance.cluster,
          'x-kobs-plugin': instance.name,
        },
      },
    );

    if (res && res.data) {
      return ['', ...res.data.map((operation) => operation.name).sort()];
    }

    return [];
  });

  return (
    <Autocomplete
      size="small"
      loading={isLoading}
      options={data ?? []}
      getOptionLabel={(option) => (option === '' ? 'All Operations' : option)}
      value={selectedOperation}
      onChange={(e, value) => selectOperation(value ?? '')}
      renderInput={(params) => <TextField {...params} label="Service" placeholder="Service" />}
    />
  );
};
