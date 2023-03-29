import { formatTime } from '@kobsio/core';
import { Download, ListAlt, MoreVert } from '@mui/icons-material';
import { IconButton, ListItemIcon, ListItemText, Menu, MenuItem } from '@mui/material';
import { FunctionComponent, useState, MouseEvent } from 'react';

import { IRow } from '../common/types';

interface ILogsDownloadProps {
  fields: string[];
  fileDownload: (data: string, filepath: string) => void;
  rows: IRow[];
}

/**
 * LogsDownload renders two action items for downloading all rows in either JSON or CSV format
 */
const LogsDownload: FunctionComponent<ILogsDownloadProps> = ({ fields, fileDownload, rows }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleOpen = (e: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(e.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleJSONDownload = () => {
    fileDownload(JSON.stringify(rows, null, 2), 'kobs-export-logs.json');
  };

  const handleCSVDownload = () => {
    if (!rows || fields.length === 0) {
      return;
    }
    let csv = '';

    for (const row of rows) {
      csv = csv + formatTime(new Date(row['timestamp']));

      for (const field of fields) {
        csv = csv + ';' + (row.hasOwnProperty(field) ? row[field] : '-');
      }

      csv = csv + '\r\n';
    }

    fileDownload(csv, 'kobs-export-logs.csv');
  };

  return (
    <>
      <IconButton size="small" onClick={handleOpen} aria-label="open menu">
        <MoreVert />
      </IconButton>
      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        <MenuItem onClick={handleJSONDownload} aria-label="Download Logs">
          <ListItemIcon>
            <Download fontSize="small" />
          </ListItemIcon>

          <ListItemText>Download Logs</ListItemText>
        </MenuItem>

        <MenuItem onClick={handleCSVDownload} disabled={!rows || fields.length === 0} aria-label="Download CSV">
          <ListItemIcon>
            <ListAlt fontSize="small" />
          </ListItemIcon>
          <ListItemText>Download CSV</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};

export default LogsDownload;
