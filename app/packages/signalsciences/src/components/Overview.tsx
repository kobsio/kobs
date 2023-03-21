import {
  APIContext,
  APIError,
  IAPIContext,
  ITimes,
  UseQueryWrapper,
  roundNumber,
  IPluginInstance,
  pluginBasePath,
} from '@kobsio/core';
import { Computer, ManageSearch, MoreVert } from '@mui/icons-material';
import {
  Card,
  Chip,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { FunctionComponent, MouseEvent, useContext, useState } from 'react';
import { Link } from 'react-router-dom';

import { getFlag } from '../utils/utils';

interface IOverviewSite {
  AttackCount?: number;
  BlockedCount?: number;
  DisplayName?: string;
  FlaggedCount?: number;
  FlaggedIPCount?: number;
  Name?: string;
  TopAttackSources?: ITopAttackSource[];
  TopAttackTypes?: ITopAttackType[];
  TotalCount?: number;
}

interface ITopAttackType {
  TagCount?: number;
  TagName?: string;
  TotalCount?: number;
}

interface ITopAttackSource {
  CountryCode?: string;
  CountryName?: string;
  RequestCount?: number;
  TotalCount?: number;
}

const OverviewActions: FunctionComponent<{ instance: IPluginInstance; site: string }> = ({ instance, site }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleOpenMenu = (e: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(e.currentTarget);
  };

  const handleCloseMenu = (e: Event) => {
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton size="small" onClick={handleOpenMenu}>
        <MoreVert />
      </IconButton>

      <Menu anchorEl={anchorEl} open={open} onClose={handleCloseMenu}>
        <MenuItem component={Link} to={`${pluginBasePath(instance)}/agents?site=${site}`}>
          <ListItemIcon>
            <Computer fontSize="small" />
          </ListItemIcon>
          <ListItemText>Agents</ListItemText>
        </MenuItem>
        <MenuItem component={Link} to={`${pluginBasePath(instance)}/requests?site=${site}`}>
          <ListItemIcon>
            <ManageSearch fontSize="small" />
          </ListItemIcon>
          <ListItemText>Requests</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};

const Overview: FunctionComponent<{ instance: IPluginInstance; times: ITimes }> = ({ instance, times }) => {
  const apiContext = useContext<IAPIContext>(APIContext);

  const { isError, isLoading, error, data, refetch } = useQuery<IOverviewSite[], APIError>(
    ['signalsciences/overview', instance, times],
    async () => {
      return apiContext.client.get<IOverviewSite[]>(
        `/api/plugins/signalsciences/overview?from=${times.timeStart}&until=${times.timeEnd}`,
        {
          headers: {
            'x-kobs-cluster': instance.cluster,
            'x-kobs-plugin': instance.name,
          },
        },
      );
    },
  );

  return (
    <UseQueryWrapper
      error={error}
      errorTitle="Failed to load overview"
      isError={isError}
      isLoading={isLoading}
      isNoData={!data || data.length === 0}
      noDataTitle="No sites were found"
      refetch={refetch}
    >
      <Card>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Site</TableCell>
                <TableCell>Requests</TableCell>
                <TableCell>Attack Signals</TableCell>
                <TableCell>Countries</TableCell>
                <TableCell>Flagged IPs</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {data?.map((site) => (
                <TableRow key={site.Name} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell sx={{ verticalAlign: 'top' }}>
                    <Typography fontWeight="bold"> {site.DisplayName}</Typography>
                  </TableCell>
                  <TableCell sx={{ verticalAlign: 'top' }}>
                    <div>{site.TotalCount} requests</div>
                    <div>{site.AttackCount} attacked</div>
                    <div>{site.BlockedCount} blocked</div>
                  </TableCell>
                  <TableCell sx={{ verticalAlign: 'top' }}>
                    {site.TopAttackTypes?.map((attack) => (
                      <div key={attack.TagName}>
                        {roundNumber(((attack.TagCount || 0) * 100) / (attack.TotalCount || 1))}%
                        <Chip sx={{ mb: 1, ml: 2 }} size="small" color="error" label={attack.TagName} />
                      </div>
                    ))}
                  </TableCell>
                  <TableCell sx={{ verticalAlign: 'top' }}>
                    {site.TopAttackSources?.map((source) => (
                      <div key={source.CountryCode}>
                        {getFlag(source.CountryCode)}{' '}
                        {roundNumber(((source.RequestCount || 0) * 100) / (source.TotalCount || 1))}%
                      </div>
                    ))}
                  </TableCell>
                  <TableCell sx={{ verticalAlign: 'top' }}>{site.FlaggedIPCount}</TableCell>
                  <TableCell sx={{ verticalAlign: 'top' }}>
                    <OverviewActions instance={instance} site={site.Name || ''} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </UseQueryWrapper>
  );
};

export default Overview;
