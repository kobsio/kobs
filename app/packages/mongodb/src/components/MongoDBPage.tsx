import {
  addStateHistoryItem,
  Editor,
  getStateHistory,
  IPluginPageProps,
  ITimes,
  Page,
  useQueryState,
} from '@kobsio/core';
import { ManageSearch, Search } from '@mui/icons-material';
import { Button, Grid, IconButton, InputAdornment, Menu, MenuItem, Select, TextField, Typography } from '@mui/material';
import { FunctionComponent, MouseEvent, useMemo, useState } from 'react';
import { Route, Routes, useParams } from 'react-router-dom';

import { Collections } from './Collections';
import { DBStats } from './DBStats';
import { OperationAggregate } from './OperationAggregate';
import { OperationCount } from './OperationCount';
import { OperationDeleteMany } from './OperationDeleteMany';
import { OperationFind } from './OperationFind';
import { OperationFindOne } from './OperationFindOne';
import { OperationFindOneAndDelete } from './OperationFindOneAndDelete';
import { OperationFindOneAndUpdate } from './OperationFindOneAndUpdate';
import { OperationUpdateMany } from './OperationUpdateMany';

import { description } from '../utils/utils';

interface IQueryPageOptions {
  filter: string;
  limit: number;
  operation: string;
  pipeline: string;
  sort: string;
  update: string;
}

interface IQueryPageParams extends Record<string, string | undefined> {
  collectionName?: string;
}

interface IDocumentPageParams extends Record<string, string | undefined> {
  collectionName?: string;
}

const QueryPageToolbarHistory: FunctionComponent<{
  identifier: string;
  setValue: (value: string) => void;
  value: string;
}> = ({ identifier, value, setValue }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const values = useMemo(() => {
    return getStateHistory(identifier);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, identifier]);

  const handleOpen = (e: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(e.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelect = (value: string) => {
    handleClose();
    setValue(value);
  };

  if (values.length === 0) {
    return null;
  }

  return (
    <>
      <IconButton size="small" onClick={handleOpen}>
        <ManageSearch />
      </IconButton>

      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        {values.map((v, index) => (
          <MenuItem key={index} onClick={() => handleSelect(v)}>
            <Typography noWrap={true}>{v}</Typography>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

const QueryPageToolbar: FunctionComponent<{
  options: IQueryPageOptions;
  setOptions: (options: IQueryPageOptions) => void;
}> = ({ options, setOptions }) => {
  const [internalOptions, setInternalOptions] = useState<IQueryPageOptions>(options);

  const query = () => {
    addStateHistoryItem('kobs-mongodb-filterhistory', internalOptions.filter);
    addStateHistoryItem('kobs-mongodb-sorthistory', internalOptions.sort);
    addStateHistoryItem('kobs-mongodb-updatehistory', internalOptions.update);
    addStateHistoryItem('kobs-mongodb-pipelinehistory', internalOptions.pipeline);

    setOptions(internalOptions);
  };

  return (
    <Grid container={true} spacing={2}>
      <Grid item={true} xs={12} md={2}>
        Operation
      </Grid>
      <Grid item={true} xs={12} md={10}>
        <Select
          size="small"
          fullWidth={true}
          value={internalOptions.operation}
          onChange={(e) => setInternalOptions((prevOptions) => ({ ...prevOptions, operation: e.target.value }))}
        >
          <MenuItem value="find">find</MenuItem>
          <MenuItem value="count">count</MenuItem>
          <MenuItem value="findOne">findOne</MenuItem>
          <MenuItem value="findOneAndUpdate">findOneAndUpdate</MenuItem>
          <MenuItem value="findOneAndDelete">findOneAndDelete</MenuItem>
          <MenuItem value="updateMany">updateMany</MenuItem>
          <MenuItem value="deleteMany">deleteMany</MenuItem>
          <MenuItem value="aggregate">aggregate</MenuItem>
        </Select>
      </Grid>

      {(internalOptions.operation === 'find' ||
        internalOptions.operation === 'count' ||
        internalOptions.operation === 'findOne' ||
        internalOptions.operation === 'findOneAndUpdate' ||
        internalOptions.operation === 'findOneAndDelete' ||
        internalOptions.operation === 'updateMany' ||
        internalOptions.operation === 'deleteMany') && (
        <>
          <Grid item={true} xs={12} md={2}>
            Filter
          </Grid>
          <Grid item={true} xs={12} md={10}>
            <Editor
              language="mongodb"
              minimal={true}
              value={internalOptions.filter}
              onChange={(value) => setInternalOptions((prevOptions) => ({ ...prevOptions, filter: value }))}
              adornment={
                <InputAdornment position="end">
                  <QueryPageToolbarHistory
                    identifier="kobs-mongodb-filterhistory"
                    value={options.filter}
                    setValue={(value) => setInternalOptions((prevOptions) => ({ ...prevOptions, filter: value }))}
                  />
                </InputAdornment>
              }
            />
          </Grid>
        </>
      )}

      {internalOptions.operation === 'find' && (
        <>
          <Grid item={true} xs={12} md={2}>
            Sort
          </Grid>
          <Grid item={true} xs={12} md={10}>
            <Editor
              language="mongodb"
              minimal={true}
              value={internalOptions.sort}
              onChange={(value) => setInternalOptions((prevOptions) => ({ ...prevOptions, sort: value }))}
              adornment={
                <InputAdornment position="end">
                  <QueryPageToolbarHistory
                    identifier="kobs-mongodb-sorthistory"
                    value={options.sort}
                    setValue={(value) => setInternalOptions((prevOptions) => ({ ...prevOptions, sort: value }))}
                  />
                </InputAdornment>
              }
            />
          </Grid>
        </>
      )}

      {internalOptions.operation === 'find' && (
        <>
          <Grid item={true} xs={12} md={2}>
            Limit
          </Grid>
          <Grid item={true} xs={12} md={10}>
            <TextField
              size="small"
              value={internalOptions.limit}
              onChange={(e) =>
                setInternalOptions((prevOptions) => ({ ...prevOptions, limit: parseInt(e.target.value) }))
              }
              type="number"
              fullWidth={true}
            />
          </Grid>
        </>
      )}

      {(internalOptions.operation === 'findOneAndUpdate' || internalOptions.operation === 'updateMany') && (
        <>
          <Grid item={true} xs={12} md={2}>
            Update
          </Grid>
          <Grid item={true} xs={12} md={10}>
            <Editor
              language="mongodb"
              minimal={true}
              value={internalOptions.update}
              onChange={(value) => setInternalOptions((prevOptions) => ({ ...prevOptions, update: value }))}
              adornment={
                <InputAdornment position="end">
                  <QueryPageToolbarHistory
                    identifier="kobs-mongodb-updatehistory"
                    value={options.update}
                    setValue={(value) => setInternalOptions((prevOptions) => ({ ...prevOptions, update: value }))}
                  />
                </InputAdornment>
              }
            />
          </Grid>
        </>
      )}

      {internalOptions.operation === 'aggregate' && (
        <>
          <Grid item={true} xs={12} md={2}>
            Pipeline
          </Grid>
          <Grid item={true} xs={12} md={10}>
            <Editor
              language="mongodb"
              minimal={true}
              value={internalOptions.pipeline}
              onChange={(value) => setInternalOptions((prevOptions) => ({ ...prevOptions, pipeline: value }))}
              adornment={
                <InputAdornment position="end">
                  <QueryPageToolbarHistory
                    identifier="kobs-mongodb-pipelinehistory"
                    value={options.pipeline}
                    setValue={(value) => setInternalOptions((prevOptions) => ({ ...prevOptions, pipeline: value }))}
                  />
                </InputAdornment>
              }
            />
          </Grid>
        </>
      )}

      <Grid item={true} xs={12} md={2}></Grid>
      <Grid item={true} xs={12} md={10}>
        <Button variant="contained" color="primary" startIcon={<Search />} onClick={query}>
          Query
        </Button>
      </Grid>
    </Grid>
  );
};

const QueryPage: FunctionComponent<IPluginPageProps> = ({ instance }) => {
  const params = useParams<IQueryPageParams>();
  const [options, setOptions] = useQueryState<IQueryPageOptions>({
    filter: '{}',
    limit: 50,
    operation: 'find',
    pipeline: '[]',
    sort: '{"_id" : -1}',
    update: '{}',
  });

  const times: ITimes = {
    time: 'last15Minutes',
    timeEnd: Math.floor(Date.now() / 1000),
    timeStart: Math.floor(Date.now() / 1000) - 900,
  };

  return (
    <Page
      title={`${instance.name}: ${params.collectionName || 'Unknown Collection'}`}
      subtitle={`(${instance.cluster} / ${instance.type})`}
      description={instance.description || description}
      toolbar={<QueryPageToolbar options={options} setOptions={setOptions} />}
    >
      {options.operation === 'count' ? (
        <OperationCount
          instance={instance}
          title="Result"
          collectionName={params.collectionName ?? ''}
          filter={options.filter}
          times={times}
        />
      ) : options.operation === 'find' ? (
        <OperationFind
          instance={instance}
          title="Result"
          collectionName={params.collectionName ?? ''}
          filter={options.filter}
          sort={options.sort}
          limit={options.limit}
          times={times}
        />
      ) : options.operation === 'findOne' ? (
        <OperationFindOne
          instance={instance}
          title="Result"
          collectionName={params.collectionName ?? ''}
          filter={options.filter}
          times={times}
        />
      ) : options.operation === 'findOneAndUpdate' ? (
        <OperationFindOneAndUpdate
          instance={instance}
          title="Result"
          collectionName={params.collectionName ?? ''}
          filter={options.filter}
          update={options.update}
          times={times}
        />
      ) : options.operation === 'findOneAndDelete' ? (
        <OperationFindOneAndDelete
          instance={instance}
          title="Result"
          collectionName={params.collectionName ?? ''}
          filter={options.filter}
          times={times}
        />
      ) : options.operation === 'updateMany' ? (
        <OperationUpdateMany
          instance={instance}
          title="Result"
          collectionName={params.collectionName ?? ''}
          filter={options.filter}
          update={options.update}
          times={times}
        />
      ) : options.operation === 'deleteMany' ? (
        <OperationDeleteMany
          instance={instance}
          title="Result"
          collectionName={params.collectionName ?? ''}
          filter={options.filter}
          times={times}
        />
      ) : options.operation === 'aggregate' ? (
        <OperationAggregate
          instance={instance}
          title="Result"
          collectionName={params.collectionName ?? ''}
          pipeline={options.pipeline}
          times={times}
        />
      ) : null}
    </Page>
  );
};

const DocumentPage: FunctionComponent<IPluginPageProps> = ({ instance }) => {
  const params = useParams<IDocumentPageParams>();
  const [options] = useQueryState<{ filter: string }>({
    filter: '',
  });

  const times: ITimes = {
    time: 'last15Minutes',
    timeEnd: Math.floor(Date.now() / 1000),
    timeStart: Math.floor(Date.now() / 1000) - 900,
  };

  return (
    <Page
      title={`${instance.name}: ${params.collectionName || 'Unknown Collection'}`}
      subtitle={`(${instance.cluster} / ${instance.type})`}
      description={instance.description || description}
    >
      <OperationFindOne
        instance={instance}
        title="Result"
        collectionName={params.collectionName ?? ''}
        filter={options.filter}
        times={times}
      />
    </Page>
  );
};

const OverviewPage: FunctionComponent<IPluginPageProps> = ({ instance }) => {
  return (
    <Page
      title={instance.name}
      subtitle={`(${instance.cluster} / ${instance.type})`}
      description={instance.description || description}
    >
      <Grid container={true} spacing={4}>
        <Grid item={true} xs={12} lg={7} xl={9}>
          <Collections instance={instance} title="Collections" />
        </Grid>
        <Grid item={true} xs={12} lg={5} xl={3}>
          <DBStats instance={instance} title="Database Statistics" />
        </Grid>
      </Grid>
    </Page>
  );
};

const MongoDBPage: FunctionComponent<IPluginPageProps> = ({ instance }) => {
  return (
    <Routes>
      <Route path="/" element={<OverviewPage instance={instance} />} />
      <Route path="/:collectionName/query" element={<QueryPage instance={instance} />} />
      <Route path="/:collectionName/document" element={<DocumentPage instance={instance} />} />
    </Routes>
  );
};

export default MongoDBPage;
