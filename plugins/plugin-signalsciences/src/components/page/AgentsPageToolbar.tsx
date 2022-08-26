import React, { useState } from 'react';

import { IOptionsAdditionalFields, IPluginInstance, ITimes, Options, Toolbar, ToolbarItem } from '@kobsio/shared';
import { IAgentsOptions } from '../../utils/interfaces';
import ToolbarItemSites from './ToolbarItemSites';

interface IAgentsPageToolbarProps {
  instance: IPluginInstance;
  options: IAgentsOptions;
  setOptions: (data: IAgentsOptions) => void;
}

const AgentsPageToolbar: React.FunctionComponent<IAgentsPageToolbarProps> = ({
  instance,
  options,
  setOptions,
}: IAgentsPageToolbarProps) => {
  const [siteName, setSiteName] = useState<string>(options.siteName);

  const changeOptions = (times: ITimes, additionalFields: IOptionsAdditionalFields[] | undefined): void => {
    setOptions({
      ...options,
      siteName: siteName,
      times: times,
    });
  };

  return (
    <Toolbar usePageInsets={true}>
      <ToolbarItem grow={true}>
        <ToolbarItemSites instance={instance} selectedSite={siteName} selectSite={setSiteName} />
      </ToolbarItem>

      <Options times={options.times} showOptions={false} showSearchButton={true} setOptions={changeOptions} />
    </Toolbar>
  );
};

export default AgentsPageToolbar;
