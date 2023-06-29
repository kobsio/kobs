import {
  APIContext,
  APIError,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  DetailsDrawer,
  Editor,
  IAPIContext,
  IPluginInstance,
  IPluginPageProps,
  ITimes,
  Page,
  Pagination,
  Toolbar,
  ToolbarItem,
  useQueryState,
  UseQueryWrapper,
} from '@kobsio/core';
import { TechDocsMarkdown } from '@kobsio/techdocs';
import { Clear, Search, Sync } from '@mui/icons-material';
import {
  Box,
  CircularProgress,
  IconButton,
  InputAdornment,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  Typography,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { FormEvent, FunctionComponent, useContext, useEffect, useState } from 'react';

import { description, IRunbook } from '../utils/utils';

interface IOptions {
  alert: string;
  group: string;
  page: number;
  perPage: number;
  query: string;
}

const RunbookDetails: FunctionComponent<{
  onClose: () => void;
  open: boolean;
  runbook: IRunbook;
}> = ({ runbook, onClose, open }) => {
  const [times, setTimes] = useState<ITimes>({
    time: 'last15Minutes',
    timeEnd: Math.floor(Date.now() / 1000),
    timeStart: Math.floor(Date.now() / 1000) - 900,
  });

  return (
    <DetailsDrawer size="large" open={open} onClose={onClose} title={runbook.alert} subtitle={`(${runbook.group})`}>
      <Card sx={{ mb: 6 }}>
        <CardContent>
          <Typography variant="h6" pb={2}>
            Details
          </Typography>
          <DescriptionList>
            <DescriptionListGroup>
              <DescriptionListTerm>Severity</DescriptionListTerm>
              <DescriptionListDescription>{runbook.severity}</DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>Expr</DescriptionListTerm>
              <DescriptionListDescription>
                <Editor language="promql" minimal={true} readOnly={true} value={runbook.expr} />
              </DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>Message</DescriptionListTerm>
              <DescriptionListDescription>{runbook.message}</DescriptionListDescription>
            </DescriptionListGroup>
          </DescriptionList>
        </CardContent>
      </Card>

      <Card sx={{ mb: 6 }}>
        <CardContent>
          <Typography variant="h6" pb={2}>
            Runbook
          </Typography>

          <TechDocsMarkdown markdown={runbook.runbook} times={times} setTimes={setTimes} />
        </CardContent>
      </Card>
    </DetailsDrawer>
  );
};

const Runbook: FunctionComponent<{ runbook: IRunbook }> = ({ runbook }) => {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <>
      <TableRow
        sx={{ '&:last-child td, &:last-child th': { border: 0 }, cursor: 'pointer' }}
        hover={true}
        selected={open}
        onClick={() => setOpen(true)}
      >
        <TableCell>{runbook.alert}</TableCell>
        <TableCell>{runbook.group}</TableCell>
        <TableCell>{runbook.severity}</TableCell>
        <TableCell>{runbook.message}</TableCell>
      </TableRow>

      {open && <RunbookDetails runbook={runbook} open={open} onClose={() => setOpen(false)} />}
    </>
  );
};

export const Runbooks: FunctionComponent<{
  instance: IPluginInstance;
  options: IOptions;
  setPage: (page: number, perPage: number) => void;
}> = ({ instance, options, setPage }) => {
  const apiContext = useContext<IAPIContext>(APIContext);

  const { isError, isLoading, error, data, refetch } = useQuery<IRunbook[], APIError>(
    ['runbooks/runbooks', instance, options.query, options.alert, options.group],
    async () => {
      return apiContext.client.get<IRunbook[]>(
        `/api/plugins/runbooks/runbooks?query=${encodeURIComponent(options.query)}&alert=${options.alert}&group=${
          options.group
        }`,
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
      errorTitle="Failed to get runbooks"
      isError={isError}
      isLoading={isLoading}
      isNoData={!data || data.length === 0}
      noDataTitle="No runbooks were found"
      refetch={refetch}
    >
      <Card>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Group</TableCell>
                <TableCell>Severity</TableCell>
                <TableCell>Message</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data?.slice((options.page - 1) * options.perPage, options.page * options.perPage).map((runbook) => (
                <Runbook key={runbook.id} runbook={runbook} />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <Pagination
        count={data?.length ?? 0}
        page={options.page ?? 1}
        perPage={options.perPage ?? 10}
        handleChange={(page, perPage) => setPage(page, perPage)}
      />
    </UseQueryWrapper>
  );
};

const RunbooksPageToolbar: FunctionComponent<{ options: IOptions; setOptions: (options: IOptions) => void }> = ({
  options,
  setOptions,
}) => {
  const [query, setQuery] = useState<string>(options.query ?? '');

  /**
   * `handleSubmit` handles the submit of the toolbar
   */
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setOptions({ ...options, alert: '', group: '', page: 1, query: query });
  };

  /**
   * `handleClear` is the action which is executed when a user clicks the clear button in the search field. When the
   * action is executed we set the search term to an empty string and we adjust the options accordingly.
   */
  const handleClear = () => {
    setQuery('');
    setOptions({ ...options, alert: '', group: '', page: 1, query: '' });
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

const RunbooksSyncAction: FunctionComponent<{ instance: IPluginInstance }> = ({ instance }) => {
  const apiContext = useContext<IAPIContext>(APIContext);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const sync = async () => {
    setIsLoading(true);

    try {
      await apiContext.client.get(`/api/plugins/runbooks/runbooks/sync`, {
        headers: {
          'x-kobs-cluster': instance.cluster,
          'x-kobs-plugin': instance.name,
        },
      });
    } catch (_) {}

    setIsLoading(false);
  };

  if (isLoading) {
    return <CircularProgress size="24px" color="inherit" />;
  }

  return (
    <IconButton size="small" onClick={sync} aria-label="sync">
      <Sync />
    </IconButton>
  );
};

const RunbooksPage: FunctionComponent<IPluginPageProps> = ({ instance }) => {
  const [options, setOptions] = useQueryState<IOptions>({
    alert: '',
    group: '',
    page: 1,
    perPage: 10,
    query: '',
  });

  return (
    <Page
      title={instance.name}
      subtitle={`(${instance.cluster} / ${instance.type})`}
      description={instance.description || description}
      toolbar={<RunbooksPageToolbar options={options} setOptions={setOptions} />}
      actions={<RunbooksSyncAction instance={instance} />}
    >
      <Runbooks
        instance={instance}
        options={options}
        setPage={(page, perPage) => setOptions({ ...options, page: page, perPage: perPage })}
      />
    </Page>
  );
};

export default RunbooksPage;
