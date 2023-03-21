import { APIError, APIContext, IAPIContext, IPluginInstance } from '@kobsio/core';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useContext, FunctionComponent } from 'react';

interface ISite {
  AgentAnonMode?: string;
  AgentLevel?: string;
  Agents?: Record<string, string>;
  Alerts?: Record<string, string>;
  AnalyticsEvents?: Record<string, string>;
  Blacklist?: Record<string, string>;
  BlockDurationSeconds?: number;
  BlockHTTPCode?: number;
  Created?: string;
  DisplayName?: string;
  Events?: Record<string, string>;
  HeaderLinks?: Record<string, string>;
  Integrations?: Record<string, string>;
  Members?: Record<string, string>;
  Monitors?: Record<string, string>;
  Name?: string;
  Paramwhitelist?: Record<string, string>;
  Pathwhitelist?: Record<string, string>;
  Redactions?: Record<string, string>;
  Requests?: Record<string, string>;
  SuspiciousIPs?: Record<string, string>;
  TopAttacks?: Record<string, string>;
  Whitelist?: Record<string, string>;
}

interface ISiteSelectProps {
  instance: IPluginInstance;
  selectSite: (site: string) => void;
  selectedSite: string;
}

export const SiteSelect: FunctionComponent<ISiteSelectProps> = ({ instance, selectedSite, selectSite }) => {
  const apiContext = useContext<IAPIContext>(APIContext);

  const { isLoading, data } = useQuery<ISite[], APIError>(['signalsciences/sites', instance], async () => {
    return apiContext.client.get<ISite[]>('/api/plugins/signalsciences/sites', {
      headers: {
        'x-kobs-cluster': instance.cluster,
        'x-kobs-plugin': instance.name,
      },
    });
  });

  return (
    <FormControl size="small" fullWidth={true}>
      <InputLabel id="signalsciences-site-select">Site</InputLabel>
      <Select
        labelId="signalsciences-site-select"
        size="small"
        value={selectedSite}
        label="Site"
        onChange={(e) => selectSite(e.target.value as string)}
      >
        {isLoading ? (
          <MenuItem disabled={true}>Loading...</MenuItem>
        ) : data && data.length > 0 ? (
          data?.map((site) => (
            <MenuItem key={site.Name} value={site.Name}>
              {site.Name}
            </MenuItem>
          ))
        ) : (
          <MenuItem disabled={true}>No options</MenuItem>
        )}
      </Select>
    </FormControl>
  );
};
