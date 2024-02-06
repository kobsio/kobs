import {
  APIContext,
  APIError,
  DetailsDrawer,
  Editor,
  IAPIContext,
  IPluginInstance,
  Pagination,
  pluginBasePath,
  PluginPanel,
  UseQueryWrapper,
} from '@kobsio/core';
import { Clear, InsightsOutlined, Search } from '@mui/icons-material';
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { FormEvent, Fragment, FunctionComponent, MouseEvent, useContext, useState } from 'react';
import { Link } from 'react-router-dom';

import { humanReadableSize } from '../utils/utils';

interface ICollectionStats {
  avgObjSize: number;
  count: number;
  freeStorageSize: number;
  nindexes: number;
  ns: string;
  numOrphanDocs: number;
  size: number;
  storageSize: number;
  totalIndexSize: number;
  totalSize: number;
}

const CollectionListItemDetailsIndexes: FunctionComponent<{
  collection: string;
  instance: IPluginInstance;
}> = ({ instance, collection }) => {
  const apiContext = useContext<IAPIContext>(APIContext);

  const { isError, isLoading, error, data, refetch } = useQuery<unknown[], APIError>(
    ['mongodb/collections/indexes', instance, collection],
    async () => {
      return apiContext.client.get<unknown[]>(`/api/plugins/mongodb/collections/indexes?collectionName=${collection}`, {
        headers: {
          'x-kobs-cluster': instance.cluster,
          'x-kobs-plugin': instance.name,
        },
      });
    },
  );

  return (
    <Card sx={{ mb: 4 }}>
      <CardContent>
        <Typography variant="h6" pb={2}>
          Collection Indexes
        </Typography>
        <UseQueryWrapper
          error={error}
          errorTitle="Failed to load collection indexes"
          isError={isError}
          isLoading={isLoading}
          isNoData={!data}
          noDataTitle="No collection indexes were found"
          refetch={refetch}
        >
          {data && <Editor language="json" readOnly={true} value={JSON.stringify(data, null, 2)} />}
        </UseQueryWrapper>
      </CardContent>
    </Card>
  );
};

const CollectionListItemDetailsStats: FunctionComponent<{
  collection: string;
  instance: IPluginInstance;
}> = ({ instance, collection }) => {
  const apiContext = useContext<IAPIContext>(APIContext);

  const { isError, isLoading, error, data, refetch } = useQuery<ICollectionStats, APIError>(
    ['mongodb/collections/stats', instance, collection],
    async () => {
      return apiContext.client.get<ICollectionStats>(
        `/api/plugins/mongodb/collections/stats?collectionName=${collection}`,
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
    <Card sx={{ mb: 4 }}>
      <CardContent>
        <Typography variant="h6" pb={2}>
          Collection Statistics
        </Typography>
        <UseQueryWrapper
          error={error}
          errorTitle="Failed to load collection statistics"
          isError={isError}
          isLoading={isLoading}
          isNoData={!data}
          noDataTitle="No collection statistics were found"
          refetch={refetch}
        >
          {data && (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Metric</TableCell>
                    <TableCell>Value</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>Namespace</TableCell>
                    <TableCell>{data.ns}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Total data size</TableCell>
                    <TableCell>{humanReadableSize(data.size)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Number of documents</TableCell>
                    <TableCell>{data.count}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Average size of document</TableCell>
                    <TableCell>{humanReadableSize(data.avgObjSize)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Number of orphaned documents</TableCell>
                    <TableCell>{data.numOrphanDocs}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Size of allocated document storage</TableCell>
                    <TableCell>{humanReadableSize(data.storageSize)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Size of reusable storage</TableCell>
                    <TableCell>{humanReadableSize(data.freeStorageSize)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Number of indexes</TableCell>
                    <TableCell>{data.nindexes}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Total size of indexes</TableCell>
                    <TableCell>{humanReadableSize(data.totalIndexSize)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Total size of collection</TableCell>
                    <TableCell>{humanReadableSize(data.totalSize)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </UseQueryWrapper>
      </CardContent>
    </Card>
  );
};

const CollectionListItemDetails: FunctionComponent<{
  collection: string;
  instance: IPluginInstance;
  onClose: () => void;
  open: boolean;
}> = ({ instance, collection, open, onClose }) => {
  return (
    <DetailsDrawer size="small" open={open} onClose={onClose} title={collection}>
      <CollectionListItemDetailsStats instance={instance} collection={collection} />
      <CollectionListItemDetailsIndexes instance={instance} collection={collection} />
    </DetailsDrawer>
  );
};

const CollectionListItem: FunctionComponent<{ collection: string; instance: IPluginInstance }> = ({
  instance,
  collection,
}) => {
  const [open, setOpen] = useState<boolean>(false);

  const hideDetails = () => {
    setOpen(false);
  };

  const showDetails = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setOpen(true);
  };

  return (
    <>
      <ListItem
        component={Link}
        to={`${pluginBasePath(instance)}/${collection}/query`}
        sx={{ color: 'inherit', textDecoration: 'inherit' }}
        secondaryAction={
          <IconButton role="button" aria-label={`${collection} details`} edge="end" onClick={showDetails}>
            <InsightsOutlined />
          </IconButton>
        }
      >
        <ListItemText primary={<Typography variant="h6">{collection}</Typography>} />
      </ListItem>

      {open && (
        <CollectionListItemDetails instance={instance} collection={collection} onClose={hideDetails} open={open} />
      )}
    </>
  );
};

const CollectionList: FunctionComponent<{ collections: string[]; instance: IPluginInstance }> = ({
  instance,
  collections,
}) => {
  const [options, setOptions] = useState<{ filter: string; page: number; perPage: number }>({
    filter: '',
    page: 1,
    perPage: 10,
  });
  const [filter, setFilter] = useState<string>('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setOptions({ filter: filter, page: 1, perPage: options.perPage });
  };

  const handleClear = () => {
    setFilter('');
    setOptions({ filter: '', page: 1, perPage: options.perPage });
  };

  console.log(options);

  return (
    <>
      <Box sx={{ mb: 6 }} component="form" onSubmit={handleSubmit}>
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
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </Box>

      <List disablePadding={true}>
        {collections
          .filter((collection) => collection.includes(options.filter))
          .slice((options.page - 1) * options.perPage, options.page * options.perPage)
          .map((collection, index) => (
            <Fragment key={collection}>
              <CollectionListItem instance={instance} collection={collection} />
              {index + 1 !== collections.length && <Divider component="li" />}
            </Fragment>
          ))}
      </List>

      <Pagination
        count={collections.length}
        page={options.page ?? 1}
        perPage={options.perPage ?? 10}
        handleChange={(page, perPage) => setOptions({ filter: options.filter, page: page, perPage: perPage })}
      />
    </>
  );
};

export const Collections: FunctionComponent<{ description?: string; instance: IPluginInstance; title: string }> = ({
  instance,
  title,
  description,
}) => {
  const apiContext = useContext<IAPIContext>(APIContext);

  const { isError, isLoading, error, data, refetch } = useQuery<string[], APIError>(
    ['mongodb/collections', instance],
    async () => {
      const collections = await apiContext.client.get<string[]>(`/api/plugins/mongodb/collections`, {
        headers: {
          'x-kobs-cluster': instance.cluster,
          'x-kobs-plugin': instance.name,
        },
      });
      return collections.sort();
    },
  );

  return (
    <PluginPanel title={title} description={description}>
      <UseQueryWrapper
        error={error}
        errorTitle="Failed to load collections"
        isError={isError}
        isLoading={isLoading}
        isNoData={!data || data.length === 0}
        noDataTitle="No collections were found"
        refetch={refetch}
      >
        <CollectionList instance={instance} collections={data ?? []} />
      </UseQueryWrapper>
    </PluginPanel>
  );
};
