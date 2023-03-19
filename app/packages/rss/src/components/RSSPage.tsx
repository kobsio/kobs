import { IPluginPageProps, Page, Toolbar, ToolbarItem, useQueryState } from '@kobsio/core';
import { Clear, Search } from '@mui/icons-material';
import { Alert, AlertTitle, Box, IconButton, InputAdornment, TextField } from '@mui/material';
import { FormEvent, FunctionComponent, useEffect, useState } from 'react';

import Feed from './Feed';

import { description } from '../utils/utils';

interface IOptions {
  url: string;
}

const RSSPageToolbar: FunctionComponent<{ options: IOptions; setOptions: (options: IOptions) => void }> = ({
  options,
  setOptions,
}) => {
  const [url, setURL] = useState<string>(options.url ?? '');

  /**
   * `handleSubmit` handles the submit of the toolbar
   */
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setOptions({ url: url });
  };

  /**
   * `handleClear` is the action which is executed when a user clicks the clear button in the search field. When the
   * action is executed we set the search term to an empty string and we adjust the options accordingly.
   */
  const handleClear = () => {
    setURL('');
    setOptions({ url: '' });
  };

  useEffect(() => {
    setURL(options.url);
  }, [options.url]);

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
            value={url}
            onChange={(e) => setURL(e.target.value)}
          />
        </Box>
      </ToolbarItem>
    </Toolbar>
  );
};

const RSSPage: FunctionComponent<IPluginPageProps> = ({ instance }) => {
  const [options, setOptions] = useQueryState<IOptions>({
    url: '',
  });

  return (
    <Page
      title={instance.name}
      subtitle={`(${instance.cluster} / ${instance.type})`}
      description={instance.description || description}
      toolbar={<RSSPageToolbar options={options} setOptions={setOptions} />}
    >
      {!options.url ? (
        <Alert severity="info">
          <AlertTitle>Provide a URL</AlertTitle>
          You have to provide the url of a RSS feed
        </Alert>
      ) : (
        <Feed
          instance={instance}
          urls={[options.url]}
          sortBy=""
          times={{
            time: 'last15Minutes',
            timeEnd: Math.floor(Date.now() / 1000),
            timeStart: Math.floor(Date.now() / 1000) - 900,
          }}
        />
      )}
    </Page>
  );
};

export default RSSPage;
