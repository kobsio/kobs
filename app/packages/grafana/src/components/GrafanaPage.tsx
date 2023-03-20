import {
  APIContext,
  APIError,
  IAPIContext,
  IPluginInstance,
  IPluginPageProps,
  Page,
  Toolbar,
  ToolbarItem,
  useQueryState,
  UseQueryWrapper,
} from '@kobsio/core';
import { Clear, Search } from '@mui/icons-material';
import {
  Box,
  Divider,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  TextField,
  Typography,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { FormEvent, Fragment, FunctionComponent, useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { description, IDashboard } from '../utils/utils';

interface IOptions {
  query: string;
}

const Dashboards: FunctionComponent<{ instance: IPluginInstance; query: string }> = ({ instance, query }) => {
  const apiContext = useContext<IAPIContext>(APIContext);

  const { isError, isLoading, error, data, refetch } = useQuery<IDashboard[], APIError>(
    ['grafana/dashboards', instance, query],
    async () => {
      return apiContext.client.get<IDashboard[]>(`/api/plugins/grafana/dashboards?query=${query}`, {
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
      errorTitle="Failed to load dashboards"
      isError={isError}
      isLoading={isLoading}
      isNoData={!data || data.length === 0}
      noDataTitle="No dashboards were found"
      noDataMessage="No dashboards were found for the provided query"
      refetch={refetch}
    >
      <List sx={{ bgcolor: 'background.paper' }} disablePadding={true}>
        {data?.map((dashboard, index) => (
          <Fragment key={dashboard.id}>
            <ListItem
              sx={{ color: 'inherit', cursor: 'pointer', textDecoration: 'inherit' }}
              component={Link}
              to={`${instance.options?.address}${dashboard.url}`}
              target="_blank"
            >
              <ListItemText
                primary={
                  <Typography variant="h6">
                    {dashboard.title}
                    {dashboard.folderTitle && (
                      <Typography pl={2} color="text.secondary" variant="caption">
                        {dashboard.folderTitle}
                      </Typography>
                    )}
                  </Typography>
                }
              />
            </ListItem>
            {index + 1 !== data?.length && <Divider component="li" />}
          </Fragment>
        ))}
      </List>
    </UseQueryWrapper>
  );
};

const GrafanaPageToolbar: FunctionComponent<{ options: IOptions; setOptions: (options: IOptions) => void }> = ({
  options,
  setOptions,
}) => {
  const [query, setQuery] = useState<string>(options.query ?? '');

  /**
   * `handleSubmit` handles the submit of the toolbar
   */
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setOptions({ query: query });
  };

  /**
   * `handleClear` is the action which is executed when a user clicks the clear button in the search field. When the
   * action is executed we set the search term to an empty string and we adjust the options accordingly.
   */
  const handleClear = () => {
    setQuery('');
    setOptions({ query: '' });
  };

  useEffect(() => {
    setQuery(options.query);
  }, [options.query]);

  return (
    <Toolbar>
      <ToolbarItem grow={true}>
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            size="small"
            variant="outlined"
            placeholder="Search"
            fullWidth={true}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={handleClear}>
                    <Clear />
                  </IconButton>
                </InputAdornment>
              ),
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </Box>
      </ToolbarItem>
    </Toolbar>
  );
};

const GrafanaPage: FunctionComponent<IPluginPageProps> = ({ instance }) => {
  const [options, setOptions] = useQueryState<IOptions>({
    query: '',
  });

  return (
    <Page
      title={instance.name}
      subtitle={`(${instance.cluster} / ${instance.type})`}
      description={instance.description || description}
      toolbar={<GrafanaPageToolbar options={options} setOptions={setOptions} />}
    >
      <Dashboards instance={instance} query={options.query} />
    </Page>
  );
};

export default GrafanaPage;
