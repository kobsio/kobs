import { getStateHistory } from '@kobsio/core';
import { ManageSearch } from '@mui/icons-material';
import { IconButton, Menu, MenuItem, Typography } from '@mui/material';
import { FunctionComponent, MouseEvent, useMemo, useState } from 'react';

export const QueryHistory: FunctionComponent<{ optionsQuery: string; setQuery: (query: string) => void }> = ({
  optionsQuery,
  setQuery,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  /**
   * `queries` is a list of queries which are saved in the history. We refresh the list of queries each time the
   * provided `optionsQuery` (from the `options.query` property) is changed, because this means that the user executed a
   * new request and a new query was added to the history. This way we can save some unnecessary calls to the
   * `getStateHistory` function.
   */
  const queries = useMemo(() => {
    return getStateHistory('kobs-datadog-queryhistory');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [optionsQuery]);

  /**
   * `handleOpen` opens the menu, which is used to display the history, with all queries which were executed by a user
   * in the past.
   */
  const handleOpen = (e: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(e.currentTarget);
  };

  /**
   * `handleClose` closes the menu, wich displays the history, with all queries which were executed by a user in the
   * past.
   */
  const handleClose = () => {
    setAnchorEl(null);
  };

  /**
   * `handleSelect` handles the selection of a query in the history menu. The query will be passed to the `setQuery`
   * function and the menu will be closed.
   */
  const handleSelect = (query: string) => {
    handleClose();
    setQuery(query);
  };

  if (queries.length === 0) {
    return null;
  }

  return (
    <>
      <IconButton size="small" onClick={handleOpen} data-testid="datadog-query-history">
        <ManageSearch />
      </IconButton>

      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        {queries.map((query, index) => (
          <MenuItem key={index} onClick={() => handleSelect(query)}>
            <Typography noWrap={true}>{query}</Typography>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};
