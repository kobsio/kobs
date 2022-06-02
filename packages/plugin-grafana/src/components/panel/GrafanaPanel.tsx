import React from 'react';

import { IPluginInstance, ITimes } from '@kobsio/shared';
import { IGrafanaPanelVariables } from '../../utils/interfaces';

interface IGrafanaPanelProps {
  instance: IPluginInstance;
  title: string;
  dashboardID: string;
  panelID: string;
  variables?: IGrafanaPanelVariables;
  times: ITimes;
}

const GrafanaPanel: React.FunctionComponent<IGrafanaPanelProps> = ({
  instance,
  title,
  dashboardID,
  panelID,
  variables,
  times,
}: IGrafanaPanelProps) => {
  const variableParams = variables
    ? Object.keys(variables)
        .map((key) => `${key}=${variables[key]}`)
        .join('&')
    : '';

  return (
    <div>
      <iframe
        style={{ height: '100%', width: '100%' }}
        title={title}
        src={`${instance.options?.address}/d-solo/${dashboardID}?from=${times.timeStart * 1000}&to=${
          times.timeEnd * 1000
        }&theme=light&panelId=${panelID}&${variableParams}`}
        frameBorder="0"
      ></iframe>
    </div>
  );
};

export default GrafanaPanel;
