import { OpenInNew } from '@mui/icons-material';
import { Box, IconButton, Typography } from '@mui/material';
import { FunctionComponent } from 'react';
import { Link } from 'react-router-dom';

import ApplicationLabels from './ApplicationLabels';

import { IApplication } from '../../crds/application';
import { DetailsDrawer } from '../utils/DetailsDrawer';

interface IApplicationInsightsProps {
  application: IApplication;
  onClose: () => void;
  open: boolean;
}

/**
 * The `ApplicationInsights` component is responsible for rendering the insights of an application in a drawer. Next to
 * the insight charts we also render the labels (tags, teams, dependencies and link) in this component.
 */
const ApplicationInsights: FunctionComponent<IApplicationInsightsProps> = ({ application, onClose, open }) => {
  return (
    <DetailsDrawer
      size="small"
      open={open}
      onClose={onClose}
      title={application.name}
      subtitle={
        application.topology && application.topology.external === true
          ? ''
          : `(${application.cluster} / ${application.namespace})`
      }
      actions={
        <IconButton edge="end" color="inherit" sx={{ mr: 1 }} component={Link} to={`/applications${application.id}`}>
          <OpenInNew />
        </IconButton>
      }
    >
      <Box>
        {application.description && (
          <Typography color="text.primary" variant="body1" pb={6}>
            {application.description}
          </Typography>
        )}
        <ApplicationLabels application={application} />
      </Box>

      <Box>TODO: Show Insights</Box>
    </DetailsDrawer>
  );
};

export default ApplicationInsights;
