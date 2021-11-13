import React from 'react';

import { IGrafanaPanelVariables } from '../../utils/interfaces';
import { IPluginTimes } from '@kobsio/plugin-core';

interface IGrafanaPanelProps {
  title: string;
  dashboardID: string;
  panelID: string;
  variables?: IGrafanaPanelVariables;
  internalAddress: string;
  times: IPluginTimes;
}

const GrafanaPanel: React.FunctionComponent<IGrafanaPanelProps> = ({
  title,
  dashboardID,
  panelID,
  internalAddress,
  variables,
  times,
}: IGrafanaPanelProps) => {
  const variableParams = variables
    ? Object.keys(variables)
        .map((key) => `${key}=${variables[key]}`)
        .join('&')
    : '';

  return (
    <iframe
      style={{ height: '100%', width: '100%' }}
      title={title}
      src={`${internalAddress}/d-solo/${dashboardID}?from=${times.timeStart * 1000}&to=${
        times.timeEnd * 1000
      }&theme=light&panelId=${panelID}&${variableParams}`}
      frameBorder="0"
    ></iframe>
  );
};

export default GrafanaPanel;
