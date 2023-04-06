import { APIContext, APIError, IPluginInstance } from '@kobsio/core';
import { Search } from '@mui/icons-material';
import { Box, List, ListItem, ListItemButton, ListItemText, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { FunctionComponent, useContext } from 'react';

import { ISQLMetaInfo } from './types';

interface ISQLTableSelectProps {
  instance: IPluginInstance;
  onSelectTable: (table: string) => void;
}

const SQLTableSelect: FunctionComponent<ISQLTableSelectProps> = ({ instance, onSelectTable }) => {
  const { client } = useContext(APIContext);
  const queryResult = useQuery<ISQLMetaInfo | null, APIError>(['sql/meta', instance], () => {
    return client.get<ISQLMetaInfo>(`/api/plugins/sql/meta`, {
      headers: {
        'x-kobs-cluster': instance.cluster,
        'x-kobs-plugin': instance.name,
      },
    });
  });

  return (
    <Box px={2}>
      <Typography p={2} variant="h5">
        Tables
      </Typography>
      <List subheader={<li />}>
        {queryResult.data?.completions &&
          Object.keys(queryResult.data.completions).map((table) => (
            <ListItem key={table} disablePadding={true}>
              <ListItemButton onClick={() => onSelectTable(table)} aria-label={`SELECT * FROM ${table} LIMIT 100`}>
                <Search sx={{ mr: 2 }} />
                <ListItemText primary={table} />
              </ListItemButton>
            </ListItem>
          ))}
      </List>
    </Box>
  );
};

export default SQLTableSelect;
