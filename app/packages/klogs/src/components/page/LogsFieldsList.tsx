import { ArrowDownward, ArrowUpward, ContentCopy, Delete } from '@mui/icons-material';
import { Divider, IconButton, List, ListItem, ListItemButton, ListItemText, Stack, Typography } from '@mui/material';
import { FunctionComponent } from 'react';

import compareFields from '../common/sortFields';

interface ILogsFieldsList {
  fields: string[];
  onSwapItem: (from: number, to: number) => void;
  onToggleField: (key: string) => void;
  selectedFields: string[];
}

/**
 * LogsFieldsList renders the given fields in a list format
 * fields are toggle'able and trigger the callback `onToggleField`
 */
const LogsFieldsList: FunctionComponent<ILogsFieldsList> = ({ fields, selectedFields, onSwapItem, onToggleField }) => {
  return (
    <List
      sx={{
        position: 'relative',
        width: '250px',
        wordBreak: 'break-all',
      }}
      dense={true}
      subheader={<li />}
    >
      {selectedFields.length > 0 && (
        <>
          <Typography variant="h5" p={2}>
            Selected fields
          </Typography>
          <Divider />
        </>
      )}
      {selectedFields
        .filter((field) => field !== 'timestamp')
        .map((field, i) => (
          <ListItem
            key={field}
            disablePadding={true}
            aria-label={field}
            sx={{
              '&:hover .fields-action-items': { opacity: 1 },
            }}
          >
            <ListItemText primary={field} sx={{ mx: 4 }} />
            <Stack
              className="fields-action-items"
              direction="row"
              sx={{
                mr: 2,
                opacity: 0,
              }}
            >
              <IconButton
                aria-label="move down"
                sx={{ p: 0 }}
                size="small"
                disabled={i === selectedFields.length - 1}
                onClick={() => {
                  onSwapItem(i, i + 1);
                }}
              >
                <ArrowDownward sx={{ fontSize: 14 }} />
              </IconButton>
              <IconButton
                aria-label="move up"
                sx={{ p: 0 }}
                size="small"
                disabled={i === 0}
                onClick={() => {
                  onSwapItem(i - 1, i);
                }}
              >
                <ArrowUpward sx={{ fontSize: 14 }} />
              </IconButton>
              <IconButton
                aria-label="copy"
                sx={{ p: 0 }}
                size="small"
                onClick={() => {
                  navigator.clipboard.writeText(field);
                }}
              >
                <ContentCopy sx={{ fontSize: 14 }} />
              </IconButton>
              <IconButton aria-label="delete" onClick={() => onToggleField(field)} sx={{ p: 0 }} size="small">
                <Delete sx={{ fontSize: 14 }} />
              </IconButton>
            </Stack>
          </ListItem>
        ))}
      <Typography variant="h5" p={2}>
        Fields
      </Typography>
      <Divider />
      {[...fields] // copy slice, because sort() sorts in place
        .sort(compareFields)
        .filter((field) => field !== 'timestamp')
        .map((field) => (
          <ListItem key={field} disablePadding={true}>
            <ListItemButton onClick={() => onToggleField(field)} aria-label={field}>
              <ListItemText primary={field} />
            </ListItemButton>
          </ListItem>
        ))}
    </List>
  );
};

export default LogsFieldsList;
