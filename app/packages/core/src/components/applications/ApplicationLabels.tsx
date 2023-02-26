import { OpenInNew, HubOutlined, PeopleOutlined } from '@mui/icons-material';
import { Chip } from '@mui/material';
import { Box } from '@mui/system';
import { FunctionComponent } from 'react';
import { Link } from 'react-router-dom';

import { IApplication } from '../../crds/application';

interface IApplicationLabelsProps {
  application: IApplication;
}

/**
 * The `ApplicationLabels` component is responsible for rendering the "labels" of an application and should be used in
 * the insights drawer and applications page for a single application. The following labels will be shown when
 * available: tags, teams, dependencies and links.
 *
 * If none of these values is available the component will render nothing.
 */
const ApplicationLabels: FunctionComponent<IApplicationLabelsProps> = ({ application }) => {
  if (
    (application.tags && application.tags.length > 0) ||
    (application.teams && application.teams.length > 0) ||
    (application.topology && application.topology.dependencies && application.topology.dependencies.length > 0) ||
    (application.links && application.links.length > 0)
  ) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
        {application.tags && application.tags.length > 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 2 }}>
            {application.tags.map((tag) => (
              <Chip
                key={tag}
                color="primary"
                size="small"
                clickable={true}
                label={tag}
                component={Link}
                to={`/applications?tags[]=${encodeURIComponent(tag)}`}
              />
            ))}
          </Box>
        )}
        {application.teams && application.teams.length > 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 2 }}>
            {application.teams.map((team) => (
              <Chip
                key={team}
                size="small"
                clickable={true}
                icon={<PeopleOutlined />}
                label={team}
                component={Link}
                to={`/teams/${encodeURIComponent(team)}`}
              />
            ))}
          </Box>
        )}
        {application.topology && application.topology.dependencies && application.topology.dependencies.length > 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 2 }}>
            {application.topology.dependencies.map((dependency) => (
              <Chip
                key={dependency.cluster + dependency.namespace + dependency.name}
                size="small"
                clickable={true}
                icon={<HubOutlined />}
                label={dependency.name}
                component={Link}
                to={`/applications/cluster/${dependency.cluster}/namespace/${dependency.namespace}/name/${dependency.name}`}
              />
            ))}
          </Box>
        )}
        {application.links && application.links.length > 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 2 }}>
            {application.links.map((link) => (
              <Chip
                key={link.link}
                size="small"
                clickable={true}
                icon={<OpenInNew />}
                label={link.title}
                component="a"
                target="_blank"
                href={link.link}
              />
            ))}
          </Box>
        )}
      </Box>
    );
  }

  return null;
};

export default ApplicationLabels;
