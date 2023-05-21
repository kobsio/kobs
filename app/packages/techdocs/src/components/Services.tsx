import { APIContext, APIError, IAPIContext, IPluginInstance, UseQueryWrapper, pluginBasePath } from '@kobsio/core';
import { Card, Divider, List, ListItem, ListItemText, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { Fragment, FunctionComponent, useContext } from 'react';
import { Link } from 'react-router-dom';

import { IIndex } from '../utils/utils';

export const Services: FunctionComponent<{ instance: IPluginInstance }> = ({ instance }) => {
  const apiContext = useContext<IAPIContext>(APIContext);

  const { isError, isLoading, error, data, refetch } = useQuery<IIndex[], APIError>(
    ['techdocs/indexes', instance],
    async () => {
      return apiContext.client.get<IIndex[]>(`/api/plugins/techdocs/indexes`, {
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
      errorTitle="Failed to load services"
      isError={isError}
      isLoading={isLoading}
      isNoData={!data || data.length === 0}
      noDataTitle="No services were found"
      refetch={refetch}
    >
      <Card>
        <List disablePadding={true}>
          {data?.map((index, i) => (
            <Fragment key={index.key}>
              <ListItem
                component={Link}
                to={`${pluginBasePath(instance)}/${index.key}`}
                sx={{ color: 'inherit', textDecoration: 'inherit' }}
              >
                <ListItemText
                  primary={<Typography variant="h6">{index.name}</Typography>}
                  secondaryTypographyProps={{ component: 'div' }}
                  secondary={
                    <Typography color="text.secondary" variant="body1">
                      {index.description}
                    </Typography>
                  }
                />
              </ListItem>
              {i + 1 !== data?.length && <Divider component="li" />}
            </Fragment>
          ))}
        </List>
      </Card>
    </UseQueryWrapper>
  );
};
