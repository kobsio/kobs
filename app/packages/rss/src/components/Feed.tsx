import {
  APIContext,
  APIError,
  DetailsDrawer,
  formatTimestamp,
  IAPIContext,
  IPluginInstance,
  ITimes,
  pluginBasePath,
  UseQueryWrapper,
} from '@kobsio/core';
import { MoreVert, OpenInNew, RssFeed } from '@mui/icons-material';
import {
  Card,
  CardContent,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Typography,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import parse from 'html-react-parser';
import { Fragment, FunctionComponent, MouseEvent, useContext, useState } from 'react';
import { Link } from 'react-router-dom';

interface IItem {
  categories?: string[];
  content?: string;
  custom?: { [key: string]: string };
  description?: string;
  feedImage?: string;
  feedLink?: string;
  feedTitle?: string;
  image?: string;
  link?: string;
  links?: string[];
  published?: number;
  title?: string;
  updated?: number;
}

const Actions: FunctionComponent<{ instance: IPluginInstance; item: IItem }> = ({ instance, item }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  /**
   * `handleOpenMenu` opens the menu, which is used to display the actions for a resource. The menu can then be closed
   * via the `handleCloseMenu` function.
   */
  const handleOpenMenu = (e: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(e.currentTarget);
  };

  /**
   * `handleCloseMenu` closes the menu, wich displays the actions for a resource. To open the menu the `handleOpenMenu`
   * function is used.
   */
  const handleCloseMenu = (e: Event) => {
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton edge="end" color="inherit" sx={{ mr: 1 }} onClick={handleOpenMenu}>
        <MoreVert />
      </IconButton>

      <Menu anchorEl={anchorEl} open={open} onClose={handleCloseMenu}>
        <MenuItem
          key="feed"
          component={Link}
          to={`${pluginBasePath(instance)}?url=${encodeURIComponent(item.feedLink ?? '')}`}
        >
          <ListItemIcon>
            <RssFeed fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Feed</ListItemText>
        </MenuItem>
        <MenuItem key="source" component={Link} to={item.link ?? ''} target="_blank">
          <ListItemIcon>
            <OpenInNew fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Source</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};

const Details: FunctionComponent<{
  instance: IPluginInstance;
  item: IItem;
  onClose: () => void;
  open: boolean;
}> = ({ instance, item, open, onClose }) => {
  return (
    <DetailsDrawer
      size="small"
      open={open}
      onClose={onClose}
      title={item.title ?? ''}
      subtitle={`(${item.feedTitle})`}
      actions={<Actions instance={instance} item={item} />}
    >
      <Card sx={{ mb: 6 }}>
        <CardContent>
          {item.published ? (
            <Typography variant="h6" pb={2}>
              {formatTimestamp(item.published)}
            </Typography>
          ) : null}

          {item.description ? (
            <Typography>{parse(item.description)}</Typography>
          ) : item.content ? (
            <Typography>{parse(item.content)}</Typography>
          ) : null}
        </CardContent>
      </Card>
    </DetailsDrawer>
  );
};

const Item: FunctionComponent<{ instance: IPluginInstance; item: IItem }> = ({ instance, item }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <ListItem onClick={() => setOpen(true)} sx={{ cursor: 'pointer' }}>
        <ListItemText
          primary={<Typography variant="h6">{item.title}</Typography>}
          secondaryTypographyProps={{ component: 'div' }}
          secondary={
            <Typography color="text.secondary" variant="body1">
              {item.feedTitle}
              {item.published ? ` - ${formatTimestamp(item.published)}` : ''}
            </Typography>
          }
        />
      </ListItem>

      <Details instance={instance} item={item} onClose={() => setOpen(false)} open={open} />
    </>
  );
};

const Feed: FunctionComponent<{ instance: IPluginInstance; sortBy: string; times: ITimes; urls: string[] }> = ({
  instance,
  urls,
  sortBy,
  times,
}) => {
  const apiContext = useContext<IAPIContext>(APIContext);

  const { isError, isLoading, error, data, refetch } = useQuery<IItem[], APIError>(
    ['rss/feed', instance, urls, sortBy, times],
    async () => {
      const join = (v: string[] | undefined): string => (v && v.length > 0 ? v.join('') : '');
      const u = join(urls?.map((url) => `&url=${encodeURIComponent(url)}`));

      return apiContext.client.get<IItem[]>(`/api/plugins/rss/feed?${u}&sortBy=${sortBy}`, {
        headers: {
          'x-kobs-cluster': instance.cluster,
          'x-kobs-plugin': instance.name,
        },
      });
    },
  );

  return (
    <UseQueryWrapper
      error={error}
      errorTitle="Failed to load RSS feed"
      isError={isError}
      isLoading={isLoading}
      isNoData={!data || data.length === 0}
      noDataTitle="No RSS feed items were found"
      noDataMessage="No RSS feed items were found for the provided RSS feed urls"
      refetch={refetch}
    >
      <List sx={{ bgcolor: 'background.paper' }} disablePadding={true}>
        {data?.map((item, index) => (
          <Fragment key={index}>
            <Item instance={instance} item={item} />
            {index + 1 !== data?.length && <Divider component="li" />}
          </Fragment>
        ))}
      </List>
    </UseQueryWrapper>
  );
};

export default Feed;
