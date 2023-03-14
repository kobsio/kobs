import { formatTime } from '@kobsio/core';
import { Download, ListAlt } from '@mui/icons-material';
import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import { FunctionComponent } from 'react';

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
    <Box>
      <Tooltip title="Download all logs as JSON">
        <IconButton onClick={handleJSONDownload} aria-label="Download all logs as JSON">
          <Download fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip
        title={
          <>
            <Typography fontSize={10}>Download all logs as CSV</Typography>
            {fields.length === 0 && (
              <Typography fontSize={10}>Select at least one column to download the logs in the CSV format.</Typography>
            )}
          </>
        }
      >
        <span>
          <IconButton
            onClick={handleCSVDownload}
            disabled={!rows || fields.length === 0}
            aria-label="Download all logs as CSV"
          >
            <ListAlt fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
    </Box>
  );
};

export default LogsDownload;
