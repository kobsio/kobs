import { FunctionComponent, useState } from 'react';

import Teams from './Teams';
import { ITeamOptions } from './utils';

import { PluginPanel } from '../utils/PluginPanel';

interface ITeamsPanelProps {
  description?: string;
  title: string;
}

/**
 * The `TeamsPanel` renders a list of teams for the currently authenticated user in a dashboard panel. For that we are
 * reusing the `Teams` component with the `all` option set to `false`.
 */
const TeamsPanel: FunctionComponent<ITeamsPanelProps> = ({ title, description }) => {
  const [options, setOptions] = useState<ITeamOptions>({
    all: false,
    page: 1,
    perPage: 10,
    searchTerm: '',
  });

  return (
    <PluginPanel title={title} description={description}>
      <Teams isPanel={true} options={options} setOptions={setOptions} />
    </PluginPanel>
  );
};

export default TeamsPanel;
