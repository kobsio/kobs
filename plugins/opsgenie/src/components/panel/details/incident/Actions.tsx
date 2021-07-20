import { Dropdown, DropdownItem, KebabToggle } from '@patternfly/react-core';
import React, { useContext, useState } from 'react';

import { IPluginsContext, PluginsContext } from '@kobsio/plugin-core';
import { IIncident } from '../../../../utils/interfaces';

interface IActionsProps {
  name: string;
  incident: IIncident;
}

const Actions: React.FunctionComponent<IActionsProps> = ({ name, incident }: IActionsProps) => {
  const pluginsContext = useContext<IPluginsContext>(PluginsContext);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);

  const pluginDetails = pluginsContext.getPluginDetails(name);
  const url =
    pluginDetails && pluginDetails.options && pluginDetails.options && pluginDetails.options.url
      ? pluginDetails.options.url
      : undefined;

  if (!url) {
    return null;
  }

  return (
    <Dropdown
      className="pf-c-drawer__close"
      toggle={<KebabToggle onToggle={(): void => setShowDropdown(!showDropdown)} />}
      isOpen={showDropdown}
      isPlain={true}
      position="right"
      dropdownItems={[
        <DropdownItem key={0} href={`${url}/incident/detail/${incident.id}`} target="_blank">
          Open in Opsgenie
        </DropdownItem>,
      ]}
    />
  );
};

export default Actions;
