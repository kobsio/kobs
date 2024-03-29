import { Edit, OpenInNew } from '@mui/icons-material';
import { Box, Button, Chip } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { FunctionComponent, useContext } from 'react';
import { Link, useParams } from 'react-router-dom';

import { APIContext, APIError, IAPIContext } from '../../context/APIContext';
import { IApplication } from '../../crds/application';
import { ITeam } from '../../crds/team';
import { Dashboards } from '../dashboards/Dashboards';
import { Page } from '../utils/Page';
import { UseQueryWrapper } from '../utils/UseQueryWrapper';

interface ITeamParams extends Record<string, string | undefined> {
  id?: string;
}

/**
 * The `TeamPage` component is used to render the page for a single team within a React Router route. The team is
 * identified by the `id` parameter.
 */
const TeamPage: FunctionComponent = () => {
  const params = useParams<ITeamParams>();
  const apiContext = useContext<IAPIContext>(APIContext);

  const { isError, isLoading, error, data, refetch } = useQuery<ITeam, APIError>(
    ['core/teams/team', params.id],
    async () => {
      return apiContext.client.get<IApplication>(`/api/teams/team?id=${encodeURIComponent(params.id || '')}`);
    },
  );

  return (
    <UseQueryWrapper
      error={error}
      errorTitle="Failed to load team"
      isError={isError}
      isLoading={isLoading}
      isNoData={!data}
      noDataTitle="Team not found"
      noDataMessage="The requested team was not found"
      refetch={refetch}
    >
      <Page
        title={data?.id ?? ''}
        description={data?.description}
        toolbar={
          data?.links ? (
            <Box sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 2 }}>
              {data.links.map((link) => (
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
          ) : undefined
        }
        hasTabs={true}
        actions={
          <Button
            variant="contained"
            color="primary"
            size="small"
            startIcon={<Edit />}
            component={Link}
            to={`/edit/team?state=${encodeURIComponent(btoa(JSON.stringify(data)))}`}
          >
            Edit Team
          </Button>
        }
      >
        {data?.dashboards && data.dashboards.length > 0 ? (
          <Dashboards manifest={data} references={data?.dashboards} />
        ) : null}
      </Page>
    </UseQueryWrapper>
  );
};

export default TeamPage;
