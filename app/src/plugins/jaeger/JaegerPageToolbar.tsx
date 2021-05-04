import {
  Alert,
  AlertActionLink,
  AlertVariant,
  Button,
  ButtonVariant,
  TextInput,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
  ToolbarToggleGroup,
} from '@patternfly/react-core';
import { FilterIcon, SearchIcon } from '@patternfly/react-icons';
import React, { useCallback, useEffect, useState } from 'react';

import {
  GetOperationsRequest,
  GetOperationsResponse,
  GetServicesRequest,
  GetServicesResponse,
  JaegerPromiseClient,
} from 'proto/jaeger_grpc_web_pb';
import Options, { IAdditionalFields } from 'components/Options';
import { IJaegerOptions } from 'plugins/jaeger/helpers';
import JaegerPageToolbarSelect from 'plugins/jaeger/JaegerPageToolbarSelect';
import { apiURL } from 'utils/constants';

// jaegerService is the gRPC service get all services and operations for Jaeger.
const jaegerService = new JaegerPromiseClient(apiURL, null, null);

interface IDataState {
  error: string;
  operations: string[];
  services: string[];
}
// IJaegerPageToolbarProps is the interface for all properties, which can be passed to the JaegerPageToolbar component.
// This are all available Jaeger options and a function to write changes to these properties back to the parent
// component.
interface IJaegerPageToolbarProps extends IJaegerOptions {
  name: string;
  changeOptions: (data: IJaegerOptions) => void;
}

// JaegerPageToolbar is the toolbar for the Jaeger plugin page. It allows a user to specify all options to get traces
// from a Jaeger instance.
const JaegerPageToolbar: React.FunctionComponent<IJaegerPageToolbarProps> = ({
  name,
  limit,
  maxDuration,
  minDuration,
  operation,
  service,
  tags,
  timeEnd,
  timeStart,
  changeOptions,
}: IJaegerPageToolbarProps) => {
  const [data, setData] = useState<IDataState>({ error: '', operations: [], services: [] });
  const [options, setOptions] = useState<IJaegerOptions>({
    limit: limit,
    maxDuration: maxDuration,
    minDuration: minDuration,
    operation: operation,
    queryName: '',
    service: service,
    tags: tags,
    timeEnd: timeEnd,
    timeStart: timeStart,
  });

  // changeAddtionalOptions changes the Jaeger options. This function is passed to the shared Options component.
  const changeAddtionalOptions = (
    additionalFields: IAdditionalFields[] | undefined,
    timeEnd: number,
    timeStart: number,
  ): void => {
    if (additionalFields && additionalFields.length === 3) {
      setOptions({
        ...options,
        limit: additionalFields[0].value,
        maxDuration: additionalFields[1].value,
        minDuration: additionalFields[2].value,
        timeEnd: timeEnd,
        timeStart: timeStart,
      });
    }
  };

  // fetchServices is used to retrieve the services from Jaeger.
  const fetchServices = useCallback(async (): Promise<void> => {
    try {
      const getServicesRequest = new GetServicesRequest();
      getServicesRequest.setName(name);

      const getServicesResponse: GetServicesResponse = await jaegerService.getServices(getServicesRequest, null);
      const { servicesList } = getServicesResponse.toObject();

      setData({ error: '', operations: [], services: servicesList });
    } catch (err) {
      setData({ error: err.message, operations: [], services: [] });
    }
  }, [name]);

  // fetchOperations is used to retrieve the operations for the given service. We only can fetch the operations, when a
  // user has selected an service.
  const fetchOperations = useCallback(async (): Promise<void> => {
    try {
      if (options.service !== '') {
        const getOperationsRequest = new GetOperationsRequest();
        getOperationsRequest.setName(name);
        getOperationsRequest.setService(options.service);

        const getOperationsResponse: GetOperationsResponse = await jaegerService.getOperations(
          getOperationsRequest,
          null,
        );
        const { operationsList } = getOperationsResponse.toObject();

        setData((d) => {
          return { ...d, error: '', operations: operationsList.map((operation) => operation.name) };
        });
      }
    } catch (err) {
      setData({ error: err.message, operations: [], services: [] });
    }
  }, [name, options.service]);

  // useEffect is used to call the fetchServices function.
  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  // useEffect is used to call the fetchOperations function everytime the Jaeger service is changed are changed.
  useEffect(() => {
    fetchOperations();
  }, [fetchOperations]);

  // useEffect is triggered when the tags property is changed. This is needed because, tags can also be set by clicking
  // on a tag and selecting the filter option.
  useEffect(() => {
    setOptions((o) => {
      return { ...o, tags: tags };
    });
  }, [tags]);

  if (data.error) {
    return (
      <Alert
        variant={AlertVariant.danger}
        isInline={true}
        title="Could not get services and operations"
        actionLinks={
          <React.Fragment>
            <AlertActionLink onClick={fetchServices}>Retry</AlertActionLink>
          </React.Fragment>
        }
      >
        <p>{data.error}</p>
      </Alert>
    );
  }

  return (
    <Toolbar id="jaeger-toolbar" style={{ paddingBottom: '0px', zIndex: 300 }}>
      <ToolbarContent style={{ padding: '0px' }}>
        <ToolbarToggleGroup style={{ width: '100%' }} toggleIcon={<FilterIcon />} breakpoint="lg">
          <ToolbarGroup style={{ width: '100%' }}>
            <ToolbarItem style={{ width: '100%' }}>
              <JaegerPageToolbarSelect
                isOperations={false}
                placeholder="Select service"
                items={data.services}
                selectedItem={options.service}
                selectItem={(item: string): void => setOptions({ ...options, service: item })}
              />
            </ToolbarItem>
            <ToolbarItem style={{ width: '100%' }}>
              <JaegerPageToolbarSelect
                isOperations={true}
                placeholder="Select operation"
                items={data.operations}
                selectedItem={options.operation}
                selectItem={(item: string): void =>
                  setOptions({ ...options, operation: item === 'All Operations' ? '' : item })
                }
              />
            </ToolbarItem>
            <ToolbarItem variant="label">Tags</ToolbarItem>
            <ToolbarItem style={{ width: '100%' }}>
              <TextInput
                aria-label="Tags"
                placeholder="http.status_code=200 error=true"
                type="text"
                value={options.tags}
                onChange={(value: string): void => setOptions({ ...options, tags: value })}
              />
            </ToolbarItem>
            <ToolbarItem>
              <Options
                pAdditionalFields={[
                  {
                    label: 'Limit',
                    name: 'limit',
                    placeholder: '20',
                    value: options.limit,
                  },
                  {
                    label: 'Max Duration',
                    name: 'maxDuration',
                    placeholder: '100ms',
                    value: options.maxDuration,
                  },
                  {
                    label: 'Min Duration',
                    name: 'minDuration',
                    placeholder: '100ms',
                    value: options.minDuration,
                  },
                ]}
                pTimeEnd={options.timeEnd}
                pTimeStart={options.timeStart}
                setValues={changeAddtionalOptions}
              />
            </ToolbarItem>
            <ToolbarItem>
              <Button
                variant={ButtonVariant.primary}
                icon={<SearchIcon />}
                onClick={(): void => changeOptions(options)}
              >
                Search
              </Button>
            </ToolbarItem>
          </ToolbarGroup>
        </ToolbarToggleGroup>
      </ToolbarContent>
    </Toolbar>
  );
};

export default JaegerPageToolbar;
