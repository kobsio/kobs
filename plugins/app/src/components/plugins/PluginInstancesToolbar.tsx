import React, { useContext, useState } from 'react';
import { SearchInput, Select, SelectOption, SelectOptionObject, SelectVariant } from '@patternfly/react-core';

import { IPluginsContext, PluginsContext } from '../../context/PluginsContext';
import { Toolbar, ToolbarItem } from '@kobsio/shared';
import { IOptions } from './utils/interfaces';

interface IPluginInstancesToolbarProps {
  options: IOptions;
  setOptions: (opts: IOptions) => void;
}

const PluginInstancesToolbar: React.FunctionComponent<IPluginInstancesToolbarProps> = ({
  options,
  setOptions,
}: IPluginInstancesToolbarProps) => {
  const [pluginSatelliteIsOpen, setPluginSatelliteIsOpen] = useState<boolean>(false);
  const [pluginTypeIsOpen, setPluginTypeIsOpen] = useState<boolean>(false);

  const pluginsContext = useContext<IPluginsContext>(PluginsContext);

  return (
    <Toolbar usePageInsets={true}>
      <ToolbarItem width="200px">
        <Select
          variant={SelectVariant.typeahead}
          aria-label="Select satellite input"
          placeholderText="Satellite"
          onToggle={(): void => setPluginSatelliteIsOpen(!pluginSatelliteIsOpen)}
          onSelect={(
            event: React.MouseEvent<Element, MouseEvent> | React.ChangeEvent<Element>,
            value: string | SelectOptionObject,
          ): void => setOptions({ ...options, page: 1, pluginSatellite: value.toString() })}
          onClear={(): void => setOptions({ ...options, page: 1, pluginSatellite: '' })}
          selections={options.pluginSatellite}
          isOpen={pluginSatelliteIsOpen}
          maxHeight="50vh"
        >
          {pluginsContext.getPluginSatellites().map((option) => (
            <SelectOption key={option} value={option} />
          ))}
        </Select>
      </ToolbarItem>

      <ToolbarItem width="200px">
        <Select
          variant={SelectVariant.typeahead}
          aria-label="Select plugin type input"
          placeholderText="Plugin Type"
          onToggle={(): void => setPluginTypeIsOpen(!pluginTypeIsOpen)}
          onSelect={(
            event: React.MouseEvent<Element, MouseEvent> | React.ChangeEvent<Element>,
            value: string | SelectOptionObject,
          ): void => setOptions({ ...options, page: 1, pluginType: value.toString() })}
          onClear={(): void => setOptions({ ...options, page: 1, pluginType: '' })}
          selections={options.pluginType}
          isOpen={pluginTypeIsOpen}
          maxHeight="50vh"
        >
          {pluginsContext.getPluginTypes().map((option) => (
            <SelectOption key={option} value={option} />
          ))}
        </Select>
      </ToolbarItem>

      <ToolbarItem grow={true}>
        <SearchInput
          aria-label="Search plugin input"
          onChange={(value: string): void => setOptions({ ...options, page: 1, searchTerm: value })}
          value={options.searchTerm}
          onClear={(): void => setOptions({ ...options, page: 1, searchTerm: '' })}
        />
      </ToolbarItem>
    </Toolbar>
  );
};

export default PluginInstancesToolbar;
