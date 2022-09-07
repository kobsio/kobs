import React, { useState } from 'react';

import { IOptionsAdditionalFields, IPluginInstance, ITimes, Options, Toolbar, ToolbarItem } from '@kobsio/shared';
import { IMonitorOptions } from '../../utils/interfaces';
import TracesToolbarServices from './TracesToolbarServices';

interface IMonitorToolbarProps {
  instance: IPluginInstance;
  options: IMonitorOptions;
  setOptions: (data: IMonitorOptions) => void;
}

const MonitorToolbar: React.FunctionComponent<IMonitorToolbarProps> = ({
  instance,
  options,
  setOptions,
}: IMonitorToolbarProps) => {
  const [service, setService] = useState<string>(options.service);

  const changeOptions = (times: ITimes, additionalFields: IOptionsAdditionalFields[] | undefined): void => {
    setOptions({
      service: service,
      times: times,
    });
  };

  return (
    <Toolbar usePageInsets={true}>
      <ToolbarItem grow={true}>
        <TracesToolbarServices instance={instance} service={service} setService={(value): void => setService(value)} />
      </ToolbarItem>

      <Options times={options.times} showOptions={true} showSearchButton={true} setOptions={changeOptions} />
    </Toolbar>
  );
};

export default MonitorToolbar;
