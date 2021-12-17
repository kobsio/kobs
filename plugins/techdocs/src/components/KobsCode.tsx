import React from 'react';

import { IPanel, IPluginTimes, PluginPanel } from '@kobsio/plugin-core';

interface IKobsCodeProps {
  panel: IPanel;
  setDetails?: (details: React.ReactNode) => void;
}

const KobsCode: React.FunctionComponent<IKobsCodeProps> = ({ panel, setDetails }: IKobsCodeProps) => {
  const times: IPluginTimes = {
    time: 'last15Minutes',
    timeEnd: Math.floor(Date.now() / 1000),
    timeStart: Math.floor(Date.now() / 1000) - 900,
  };

  return (
    <div style={{ height: '300px', overflow: 'scroll' }}>
      <PluginPanel
        defaults={{ cluster: '', name: '', namespace: '' }}
        times={times}
        title={panel.title}
        description={panel.description}
        name={panel.plugin.name}
        options={panel.plugin.options}
        setDetails={setDetails}
      />
    </div>
  );
};

export default KobsCode;
