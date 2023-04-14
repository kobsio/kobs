import { Box, Chip, ListItem, ListItemText, Typography } from '@mui/material';
import { FunctionComponent } from 'react';
import { Link } from 'react-router-dom';

import { getPRIcon, getPRSubTitle } from '../../utils/utils';

export const PullRequest: FunctionComponent<{
  closedAt: string | null;
  createdAt: string;
  draft: boolean | undefined;
  labels: {
    color?: string | undefined;
    default?: boolean | undefined;
    description?: string | null | undefined;
    id?: number | undefined;
    name?: string | undefined;
    node_id?: string | undefined;
    url?: string | undefined;
  }[];
  mergedAt: string | null | undefined;
  number: number;
  state: string;
  title: string;
  url: string;
  user: string | undefined;
}> = ({ title, url, number, user, state, draft, createdAt, closedAt, mergedAt, labels }) => {
  return (
    <ListItem sx={{ color: 'inherit', textDecoration: 'inherit' }} component={Link} to={url} target="_blank">
      <ListItemText
        primary={
          <Typography variant="h6">
            {getPRIcon(state, draft, mergedAt)}
            <Box component="span" pl={1}>
              {title}
            </Box>
          </Typography>
        }
        secondaryTypographyProps={{ component: 'div' }}
        secondary={
          <>
            {getPRSubTitle(number, user, state, createdAt, closedAt, mergedAt)}
            <Box component="span" pl={2}>
              {labels.map((label) =>
                typeof label === 'string' ? (
                  <Chip key={label} sx={{ ml: 2 }} size="small" color="default" label={label} />
                ) : (
                  <Chip
                    key={label.id}
                    sx={{ backgroundColor: label.color ? `#${label.color}` : undefined, ml: 2 }}
                    size="small"
                    label={label.name}
                  />
                ),
              )}
            </Box>
          </>
        }
      />
    </ListItem>
  );
};
