import { People } from '@mui/icons-material';
import {
  Avatar,
  Button,
  darken,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { Fragment, FunctionComponent, useContext } from 'react';
import { Link } from 'react-router-dom';

import { ITeamOptions } from './utils';

import { APIContext, APIError, IAPIContext } from '../../context/APIContext';
import { ITeam } from '../../crds/team';
import Pagination from '../utils/Pagination';
import UseQueryWrapper from '../utils/UseQueryWrapper';

interface ITeamProps {
  team: ITeam;
}

/**
 * The `Team` component renders a single team within the list of teams in the `Teams` component. We show the team id,
 * description and logo for each team. If a teams has no logo we show the teams icon.
 */
const Team: FunctionComponent<ITeamProps> = ({ team }) => {
  return (
    <ListItem
      component={Link}
      to={`/teams/${encodeURIComponent(team.id)}`}
      sx={{ color: 'inherit', textDecoration: 'inherit' }}
    >
      <ListItemAvatar>
        {team.logo ? (
          <Avatar alt={team.id} src={team.logo} />
        ) : (
          <Avatar sx={(theme) => ({ bgcolor: darken(theme.palette.background.paper, 0.13) })}>
            <People sx={{ color: 'text.primary' }} />
          </Avatar>
        )}
      </ListItemAvatar>
      <ListItemText
        primary={<Typography variant="h6">{team.id}</Typography>}
        secondaryTypographyProps={{ component: 'div' }}
        secondary={
          team.description && (
            <Typography color="text.secondary" variant="body1">
              {team.description}
            </Typography>
          )
        }
      />
    </ListItem>
  );
};

interface ITeamsProps {
  isPanel: boolean;
  options: ITeamOptions;
  setOptions: (options: ITeamOptions) => void;
}

/**
 * The `Teams` component is responsible for loading a list of teams for the provided options. If we are able to get a
 * list of teams the list will be rendered via the `Team` component. We always load all teams, but to improve the
 * render performance returned teams are paginated.
 */
const Teams: FunctionComponent<ITeamsProps> = ({ isPanel, options, setOptions }) => {
  const apiContext = useContext<IAPIContext>(APIContext);

  const { isError, isLoading, error, data, refetch } = useQuery<ITeam[], APIError>(
    ['core/teams/teams', options.all, options.searchTerm],
    async () => {
      return apiContext.client.get<ITeam[]>(
        `/api/teams?all=${options.all}&searchTerm=${encodeURIComponent(options.searchTerm ?? '')}`,
      );
    },
  );

  const page = options.page ?? 1;
  const perPage = options.perPage ?? 10;

  return (
    <UseQueryWrapper
      error={error}
      errorTitle="Failed to load teams"
      isError={isError}
      isLoading={isLoading}
      isNoData={!data || data.length === 0}
      noDataActions={
        options.all ? undefined : (
          <Button color="inherit" size="small" onClick={() => setOptions({ ...options, all: true })}>
            RETRY WITH ALL
          </Button>
        )
      }
      noDataTitle="No teams were found"
      noDataMessage={`No teams were found for your selected filters.${
        options.all ? 'You can try to search through all teams.' : ''
      }`}
      refetch={refetch}
    >
      <List sx={{ bgcolor: 'background.paper' }} disablePadding={true}>
        {data?.slice((page - 1) * perPage, page * perPage).map((team, index) => (
          <Fragment key={team.id}>
            <Team team={team} />
            {isPanel ? (
              <Divider variant="inset" component="li" />
            ) : index + 1 !== data?.length ? (
              <Divider variant="inset" component="li" />
            ) : null}
          </Fragment>
        ))}
      </List>

      <Pagination
        count={data?.length ?? 0}
        page={options.page ?? 1}
        perPage={options.perPage ?? 10}
        handleChange={(page, perPage) => setOptions({ ...options, page: page, perPage: perPage })}
      />
    </UseQueryWrapper>
  );
};

export default Teams;
