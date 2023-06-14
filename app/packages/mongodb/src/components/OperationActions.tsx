import { fileDownload, IPluginInstance } from '@kobsio/core';
import { Download, MoreVert, OpenInNew } from '@mui/icons-material';
import { IconButton, ListItemIcon, ListItemText, Menu, MenuItem } from '@mui/material';
import { Document, EJSON } from 'bson';
import { FunctionComponent, MouseEvent, useState } from 'react';
import { Link } from 'react-router-dom';

export const OperationActions: FunctionComponent<{
  collectionName: string;
  documents?: Document[];
  instance: IPluginInstance;
  link: string;
  showActions?: boolean;
}> = ({ showActions, instance, collectionName, link, documents }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  /**
   * `handleOpenMenu` opens the menu, which is used to display the link.
   */
  const handleOpenMenu = (e: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(e.currentTarget);
  };

  /**
   * `handleCloseMenu` closes the menu, wich displays the link.
   */
  const handleCloseMenu = (e: Event) => {
    setAnchorEl(null);
  };

  const download = (type: 'bson' | 'json') => {
    if (type === 'bson') {
      fileDownload(JSON.stringify(EJSON.serialize(documents, { relaxed: true }), null, 2), `${collectionName}.bson`);
    } else if (type === 'json') {
      fileDownload(JSON.stringify(documents, null, 2), `${collectionName}.json`);
    }

    setAnchorEl(null);
  };

  if (!showActions && (!documents || documents.length === 0)) {
    return null;
  }

  return (
    <>
      <IconButton size="small" sx={{ m: 0, p: 0 }} disableRipple={true} onClick={handleOpenMenu}>
        <MoreVert />
      </IconButton>

      <Menu anchorEl={anchorEl} open={open} onClose={handleCloseMenu}>
        {showActions && (
          <MenuItem component={Link} to={link}>
            <ListItemIcon>
              <OpenInNew fontSize="small" />
            </ListItemIcon>
            <ListItemText>Explore</ListItemText>
          </MenuItem>
        )}

        {documents && (
          <MenuItem onClick={() => download('bson')}>
            <ListItemIcon>
              <Download fontSize="small" />
            </ListItemIcon>
            <ListItemText>Download BSON</ListItemText>
          </MenuItem>
        )}

        {documents && (
          <MenuItem onClick={() => download('json')}>
            <ListItemIcon>
              <Download fontSize="small" />
            </ListItemIcon>
            <ListItemText>Download JSON</ListItemText>
          </MenuItem>
        )}
      </Menu>
    </>
  );
};
