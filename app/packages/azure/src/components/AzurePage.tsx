import { MetricDefinition } from '@azure/arm-monitor';
import {
  APIContext,
  APIError,
  GridContextProvider,
  IAPIContext,
  IOptionsAdditionalFields,
  IPluginInstance,
  IPluginPageProps,
  ITimes,
  Options,
  Page,
  Toolbar,
  ToolbarItem,
  useQueryState,
} from '@kobsio/core';
import { Autocomplete, TextField, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { FunctionComponent, useContext } from 'react';

import { CostManagement } from './CostManagement';
import { Metrics } from './Metrics';

import { description } from '../utils/utils';

interface IOptions extends ITimes {
  aggregationType: string;
  interval: string;
  managedCluster: string;
  metric: string;
  resourceGroup: string;
  service: string;
  virtualMachineScaleSet: string;
  virtualMachineScaleSetType: 'VMSS' | 'VM';
  virtualMachineScaleSetVirtualMachine: string;
}

export const AzureResourceGroups: FunctionComponent<{
  instance: IPluginInstance;
  selectResourceGroup: (resourceGroup: string) => void;
  selectedResourceGroup: string;
}> = ({ instance, selectedResourceGroup, selectResourceGroup }) => {
  const apiContext = useContext<IAPIContext>(APIContext);

  const { isLoading, data } = useQuery<string[], APIError>(['azure/variables/resourcegroups', instance], async () => {
    return apiContext.client.post<string[]>(`/api/plugins/azure/variable`, {
      body: {
        type: 'Resource Groups',
      },
      headers: {
        'x-kobs-cluster': instance.cluster,
        'x-kobs-plugin': instance.name,
      },
    });
  });

  return (
    <Autocomplete
      size="small"
      multiple={false}
      loading={isLoading}
      options={data ?? []}
      getOptionLabel={(option) => option ?? ''}
      value={selectedResourceGroup}
      onChange={(_, value) => selectResourceGroup(value ?? '')}
      renderInput={(params) => <TextField {...params} label="Resource Group" placeholder="Resource Group" />}
    />
  );
};

export const AzureKubernetesServicesManagedClusters: FunctionComponent<{
  instance: IPluginInstance;
  resourceGroup: string;
  selectManagedCluster: (managedCluster: string) => void;
  selectedManagedCluster: string;
}> = ({ instance, resourceGroup, selectManagedCluster, selectedManagedCluster }) => {
  const apiContext = useContext<IAPIContext>(APIContext);

  const { isLoading, data } = useQuery<string[], APIError>(
    ['azure/variables/kubernetesservices/managedclusters', instance, resourceGroup],
    async () => {
      return apiContext.client.post<string[]>(`/api/plugins/azure/variable`, {
        body: {
          resourceGroup: resourceGroup,
          type: 'Kubernetes Services',
        },
        headers: {
          'x-kobs-cluster': instance.cluster,
          'x-kobs-plugin': instance.name,
        },
      });
    },
  );

  return (
    <Autocomplete
      size="small"
      multiple={false}
      loading={isLoading}
      options={data ?? []}
      getOptionLabel={(option) => option ?? ''}
      value={selectedManagedCluster}
      onChange={(_, value) => selectManagedCluster(value ?? '')}
      renderInput={(params) => <TextField {...params} label="Managed Cluster" placeholder="Managed Cluster" />}
    />
  );
};

export const AzureVirtualMachineScaleSets: FunctionComponent<{
  instance: IPluginInstance;
  resourceGroup: string;
  selectVirtualMachineScaleSet: (virtualMachineScaleSet: string) => void;
  selectedVirtualMachineScaleSet: string;
}> = ({ instance, resourceGroup, selectVirtualMachineScaleSet, selectedVirtualMachineScaleSet }) => {
  const apiContext = useContext<IAPIContext>(APIContext);

  const { isLoading, data } = useQuery<string[], APIError>(
    ['azure/variables/virtualmachinescalesets', instance, resourceGroup],
    async () => {
      return apiContext.client.post<string[]>(`/api/plugins/azure/variable`, {
        body: {
          resourceGroup: resourceGroup,
          type: 'Virtual Machine Scale Sets',
        },
        headers: {
          'x-kobs-cluster': instance.cluster,
          'x-kobs-plugin': instance.name,
        },
      });
    },
  );

  return (
    <Autocomplete
      size="small"
      multiple={false}
      loading={isLoading}
      options={data ?? []}
      getOptionLabel={(option) => option ?? ''}
      value={selectedVirtualMachineScaleSet}
      onChange={(_, value) => selectVirtualMachineScaleSet(value ?? '')}
      renderInput={(params) => (
        <TextField {...params} label="Virtual Machine Scale Sets" placeholder="Virtual Machine Scale Sets" />
      )}
    />
  );
};

export const AzureVirtualMachineScaleSetsVirtualMachines: FunctionComponent<{
  instance: IPluginInstance;
  resourceGroup: string;
  selectVirtualMachineScaleSetVirtualMachine: (virtualMachineScaleSetVirtualMachine: string) => void;
  selectedVirtualMachineScaleSetVirtualMachine: string;
  virtualMachineScaleSet: string;
}> = ({
  instance,
  resourceGroup,
  virtualMachineScaleSet,
  selectVirtualMachineScaleSetVirtualMachine,
  selectedVirtualMachineScaleSetVirtualMachine,
}) => {
  const apiContext = useContext<IAPIContext>(APIContext);

  const { isLoading, data } = useQuery<string[], APIError>(
    ['azure/variables/virtualmachinescalesets/virtualmachines', instance, resourceGroup, virtualMachineScaleSet],
    async () => {
      return apiContext.client.post<string[]>(`/api/plugins/azure/variable`, {
        body: {
          resourceGroup: resourceGroup,
          type: 'Virtual Machine Scale Sets - Virtual Machines',
          virtualMachineScaleSet: virtualMachineScaleSet,
        },
        headers: {
          'x-kobs-cluster': instance.cluster,
          'x-kobs-plugin': instance.name,
        },
      });
    },
  );

  return (
    <Autocomplete
      size="small"
      multiple={false}
      loading={isLoading}
      options={data ?? []}
      getOptionLabel={(option) => option ?? ''}
      value={selectedVirtualMachineScaleSetVirtualMachine}
      onChange={(_, value) => selectVirtualMachineScaleSetVirtualMachine(value ?? '')}
      renderInput={(params) => <TextField {...params} label="Virtual Machines" placeholder="Virtual Machines" />}
    />
  );
};

export const AzureMetric: FunctionComponent<{
  instance: IPluginInstance;
  provider: string;
  resourceGroup: string;
  selectAggregationType: (aggregationType: string) => void;
  selectMetric: (metric: string, aggregationType: string) => void;
  selectedAggregationType: string;
  selectedMetric: string;
}> = ({
  instance,
  resourceGroup,
  provider,
  selectMetric,
  selectedMetric,
  selectAggregationType,
  selectedAggregationType,
}) => {
  const apiContext = useContext<IAPIContext>(APIContext);

  const { isLoading, data } = useQuery<MetricDefinition[], APIError>(
    ['azure/variables/monitor/metricdefinitions', instance, resourceGroup, provider],
    async () => {
      return apiContext.client.get<MetricDefinition[]>(
        `/api/plugins/azure/monitor/metricdefinitions?resourceGroup=${resourceGroup}&provider=${provider}`,
        {
          headers: {
            'x-kobs-cluster': instance.cluster,
            'x-kobs-plugin': instance.name,
          },
        },
      );
    },
  );

  const onChangeMetric = (value: string | null | undefined) => {
    const metric = data?.filter((definition) => definition.name?.localizedValue === value)[0];
    selectMetric(metric?.name?.value ?? '', metric?.primaryAggregationType ?? '');
  };

  return (
    <>
      <ToolbarItem width="200px">
        <Autocomplete
          size="small"
          multiple={false}
          loading={isLoading}
          options={data?.map((definition) => definition.name?.localizedValue) ?? []}
          getOptionLabel={(option) => option ?? ''}
          value={data?.filter((definition) => definition.name?.value === selectedMetric)[0]?.name?.localizedValue}
          onChange={(_, value) => onChangeMetric(value)}
          renderInput={(params) => <TextField {...params} label="Metric" placeholder="Metric" />}
        />
      </ToolbarItem>
      <ToolbarItem width="200px">
        <Autocomplete
          size="small"
          multiple={false}
          loading={isLoading}
          options={
            data?.filter((definition) => definition.name?.value === selectedMetric)[0]?.supportedAggregationTypes ?? []
          }
          getOptionLabel={(option) => option ?? ''}
          value={selectedAggregationType}
          onChange={(_, value) => selectAggregationType(value ?? '')}
          renderInput={(params) => <TextField {...params} label="Aggregation Type" placeholder="Aggregation Type" />}
        />
      </ToolbarItem>
    </>
  );
};

export const AzureService: FunctionComponent<{
  selectService: (service: string) => void;
  selectedService: string;
}> = ({ selectedService, selectService }) => {
  return (
    <Autocomplete
      size="small"
      multiple={false}
      options={['Cost Management', 'Kubernetes Services', 'Virtual Machine Scale Sets']}
      getOptionLabel={(option) => option ?? ''}
      value={selectedService}
      onChange={(_, value) => selectService(value ?? '')}
      renderInput={(params) => <TextField {...params} label="Service" placeholder="Service" />}
    />
  );
};

const AzurePageToolbar: FunctionComponent<{
  instance: IPluginInstance;
  options: IOptions;
  setOptions: (options: IOptions) => void;
}> = ({ instance, options, setOptions }) => {
  const changeOptions = (times: ITimes, additionalFields: IOptionsAdditionalFields[] | undefined) => {
    if (additionalFields && additionalFields.length === 1) {
      setOptions({ ...options, ...times, interval: additionalFields[0].value });
    }
  };

  return (
    <Toolbar>
      <ToolbarItem width="200px">
        <AzureService
          selectedService={options.service}
          selectService={(service) => setOptions({ ...options, service })}
        />
      </ToolbarItem>
      <ToolbarItem width="200px">
        <AzureResourceGroups
          instance={instance}
          selectedResourceGroup={options.resourceGroup}
          selectResourceGroup={(resourceGroup) => setOptions({ ...options, resourceGroup })}
        />
      </ToolbarItem>
      {options.service === 'Kubernetes Services' && options.resourceGroup && (
        <>
          <ToolbarItem width="200px">
            <AzureKubernetesServicesManagedClusters
              instance={instance}
              resourceGroup={options.resourceGroup}
              selectedManagedCluster={options.managedCluster}
              selectManagedCluster={(managedCluster) => setOptions({ ...options, managedCluster })}
            />
          </ToolbarItem>
          {options.managedCluster && (
            <AzureMetric
              instance={instance}
              resourceGroup={options.resourceGroup}
              provider={`Microsoft.ContainerService/managedClusters/${options.managedCluster}`}
              selectedMetric={options.metric}
              selectMetric={(metric, aggregationType) => setOptions({ ...options, aggregationType, metric })}
              selectedAggregationType={options.aggregationType}
              selectAggregationType={(aggregationType) => setOptions({ ...options, aggregationType })}
            />
          )}
        </>
      )}
      {options.service === 'Virtual Machine Scale Sets' && options.resourceGroup && (
        <>
          <ToolbarItem width="200px">
            <AzureVirtualMachineScaleSets
              instance={instance}
              resourceGroup={options.resourceGroup}
              selectedVirtualMachineScaleSet={options.virtualMachineScaleSet}
              selectVirtualMachineScaleSet={(virtualMachineScaleSet) =>
                setOptions({ ...options, virtualMachineScaleSet })
              }
            />
          </ToolbarItem>
          <ToolbarItem>
            <ToggleButtonGroup
              size="small"
              value={options.virtualMachineScaleSetType}
              exclusive={true}
              onChange={(_, value) => setOptions({ ...options, virtualMachineScaleSetType: value })}
            >
              <ToggleButton sx={{ px: 4 }} value="VMSS">
                VMSS
              </ToggleButton>
              <ToggleButton sx={{ px: 4 }} value="VM">
                VM
              </ToggleButton>
            </ToggleButtonGroup>
          </ToolbarItem>

          {options.virtualMachineScaleSet && options.virtualMachineScaleSetType === 'VMSS' && (
            <AzureMetric
              instance={instance}
              resourceGroup={options.resourceGroup}
              provider={`Microsoft.Compute/virtualMachineScaleSets/${options.virtualMachineScaleSet}`}
              selectedMetric={options.metric}
              selectMetric={(metric, aggregationType) => setOptions({ ...options, aggregationType, metric })}
              selectedAggregationType={options.aggregationType}
              selectAggregationType={(aggregationType) => setOptions({ ...options, aggregationType })}
            />
          )}
          {options.virtualMachineScaleSet && options.virtualMachineScaleSetType === 'VM' && (
            <>
              <ToolbarItem width="200px">
                <AzureVirtualMachineScaleSetsVirtualMachines
                  instance={instance}
                  resourceGroup={options.resourceGroup}
                  virtualMachineScaleSet={options.virtualMachineScaleSet}
                  selectedVirtualMachineScaleSetVirtualMachine={options.virtualMachineScaleSetVirtualMachine}
                  selectVirtualMachineScaleSetVirtualMachine={(virtualMachineScaleSetVirtualMachine) =>
                    setOptions({ ...options, virtualMachineScaleSetVirtualMachine })
                  }
                />
              </ToolbarItem>
              {options.virtualMachineScaleSetVirtualMachine !== '' && (
                <AzureMetric
                  instance={instance}
                  resourceGroup={options.resourceGroup}
                  provider={`Microsoft.Compute/virtualMachineScaleSets/${options.virtualMachineScaleSet}/virtualMachines/${options.virtualMachineScaleSetVirtualMachine}`}
                  selectedMetric={options.metric}
                  selectMetric={(metric, aggregationType) => setOptions({ ...options, aggregationType, metric })}
                  selectedAggregationType={options.aggregationType}
                  selectAggregationType={(aggregationType) => setOptions({ ...options, aggregationType })}
                />
              )}
            </>
          )}
        </>
      )}
      <ToolbarItem grow={true} align="right">
        <Options
          additionalFields={[
            {
              label: 'Interval',
              name: 'interval',
              placeholder: 'auto',
              type: 'select',
              value: options.interval,
              values: ['auto', 'PT1M', 'PT5M', 'PT15M', 'PT30M', 'PT1H', 'PT6H', 'PT12H', 'P1D'],
            },
          ]}
          times={options}
          showOptions={true}
          showSearchButton={false}
          setOptions={changeOptions}
        />
      </ToolbarItem>
    </Toolbar>
  );
};

const AzurePage: FunctionComponent<IPluginPageProps> = ({ instance }) => {
  const [options, setOptions] = useQueryState<IOptions>({
    aggregationType: '',
    interval: 'auto',
    managedCluster: '',
    metric: '',
    resourceGroup: '',
    service: 'Cost Management',
    time: 'last15Minutes',
    timeEnd: Math.floor(Date.now() / 1000),
    timeStart: Math.floor(Date.now() / 1000) - 900,
    virtualMachineScaleSet: '',
    virtualMachineScaleSetType: 'VMSS',
    virtualMachineScaleSetVirtualMachine: '',
  });

  return (
    <Page
      title={instance.name}
      subtitle={`(${instance.cluster} / ${instance.type})`}
      description={instance.description || description}
      toolbar={<AzurePageToolbar instance={instance} options={options} setOptions={setOptions} />}
    >
      <GridContextProvider autoHeight={true}>
        {options.service === 'Cost Management' ? (
          <CostManagement title="Costs" instance={instance} resourceGroup={options.resourceGroup} times={options} />
        ) : options.service === 'Kubernetes Services' &&
          options.resourceGroup &&
          options.managedCluster &&
          options.metric &&
          options.aggregationType ? (
          <Metrics
            title="Metrics"
            instance={instance}
            provider={`Microsoft.ContainerService/managedClusters/${options.managedCluster}`}
            resourceGroup={options.resourceGroup}
            metric={options.metric}
            aggregationType={options.aggregationType}
            interval={options.interval}
            times={options}
            setTimes={(times: ITimes) => setOptions({ ...options, ...times })}
          />
        ) : options.service === 'Virtual Machine Scale Sets' &&
          options.virtualMachineScaleSetType === 'VMSS' &&
          options.resourceGroup &&
          options.virtualMachineScaleSet &&
          options.metric &&
          options.aggregationType ? (
          <Metrics
            title="Metrics"
            instance={instance}
            provider={`Microsoft.Compute/virtualMachineScaleSets/${options.virtualMachineScaleSet}`}
            resourceGroup={options.resourceGroup}
            metric={options.metric}
            aggregationType={options.aggregationType}
            interval={options.interval}
            times={options}
            setTimes={(times: ITimes) => setOptions({ ...options, ...times })}
          />
        ) : options.service === 'Virtual Machine Scale Sets' &&
          options.virtualMachineScaleSetType === 'VM' &&
          options.resourceGroup &&
          options.virtualMachineScaleSet &&
          options.virtualMachineScaleSetVirtualMachine !== '' &&
          options.metric &&
          options.aggregationType ? (
          <Metrics
            title="Metrics"
            instance={instance}
            provider={`Microsoft.Compute/virtualMachineScaleSets/${options.virtualMachineScaleSet}/virtualMachines/${options.virtualMachineScaleSetVirtualMachine}`}
            resourceGroup={options.resourceGroup}
            metric={options.metric}
            aggregationType={options.aggregationType}
            interval={options.interval}
            times={options}
            setTimes={(times: ITimes) => setOptions({ ...options, ...times })}
          />
        ) : null}
      </GridContextProvider>
    </Page>
  );
};

export default AzurePage;
