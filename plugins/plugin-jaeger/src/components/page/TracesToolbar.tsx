import React, { useState } from 'react';
import { TextInput, ToolbarContent, ToolbarGroup, ToolbarGroupVariant, ToolbarItem } from '@patternfly/react-core';

import { IOptionsAdditionalFields, IPluginInstance, ITimes, Options } from '@kobsio/shared';
import { IOptions } from '../../utils/interfaces';
import TracesToolbarOperations from './TracesToolbarOperations';
import TracesToolbarServices from './TracesToolbarServices';

interface ITracesToolbarProps {
  instance: IPluginInstance;
  options: IOptions;
  setOptions: (data: IOptions) => void;
}

const TracesToolbar: React.FunctionComponent<ITracesToolbarProps> = ({
  instance,
  options,
  setOptions,
}: ITracesToolbarProps) => {
  const [service, setService] = useState<string>(options.service);
  const [operation, setOperation] = useState<string>(options.operation === '' ? 'All Operations' : options.operation);
  const [tags, setTags] = useState<string>(options.tags);

  const changeOptions = (times: ITimes, additionalFields: IOptionsAdditionalFields[] | undefined): void => {
    if (additionalFields && additionalFields.length === 3) {
      setOptions({
        limit: additionalFields[0].value,
        maxDuration: additionalFields[1].value,
        minDuration: additionalFields[2].value,
        operation: operation,
        service: service,
        tags: tags,
        times: times,
      });
    }
  };

  return (
    <ToolbarContent>
      <ToolbarGroup style={{ width: '100%' }}>
        <ToolbarGroup variant={ToolbarGroupVariant['filter-group']}>
          <ToolbarItem>
            <TracesToolbarServices
              instance={instance}
              service={service}
              setService={(value): void => setService(value)}
            />
          </ToolbarItem>
          <ToolbarItem>
            {service ? (
              <TracesToolbarOperations
                instance={instance}
                service={service}
                operation={operation}
                setOperation={(value): void => setOperation(value)}
              />
            ) : null}
          </ToolbarItem>
        </ToolbarGroup>
        <ToolbarItem variant="label">Tags</ToolbarItem>
        <ToolbarItem style={{ width: '100%' }}>
          <TextInput
            aria-label="Tags"
            placeholder="http.status_code=200 error=true"
            type="text"
            value={tags}
            onChange={(value: string): void => setTags(value)}
          />
        </ToolbarItem>

        <Options
          additionalFields={[
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
          times={options.times}
          showOptions={true}
          showSearchButton={true}
          setOptions={changeOptions}
        />
      </ToolbarGroup>
    </ToolbarContent>
  );
};

export default TracesToolbar;
