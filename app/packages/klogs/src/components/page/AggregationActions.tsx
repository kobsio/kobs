import { Link } from '@kobsio/core';
import { MoreVert } from '@mui/icons-material';
import { IconButton, ListItemText, Menu, MenuItem } from '@mui/material';
import { FunctionComponent, useState, MouseEvent } from 'react';
import { useLocation } from 'react-router-dom';

const AggregationActions: FunctionComponent = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const { search } = useLocation();

  const handleOpen = (e: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(e.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton size="small" onClick={handleOpen} aria-label="open menu">
        <MoreVert />
      </IconButton>
      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        <MenuItem component={Link} to={`..${search}`}>
          <ListItemText>Logs</ListItemText>
        </MenuItem>

        <MenuItem component="a" href="https://kobs.io/main/plugins/klogs/" target="_blank">
          <ListItemText>Documentation</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};

export default AggregationActions;
