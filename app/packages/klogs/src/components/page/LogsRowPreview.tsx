import { TableCell, Typography, Box } from '@mui/material';
import { grey } from '@mui/material/colors';
import { alpha } from '@mui/material/styles';
import { Fragment, FunctionComponent } from 'react';

import { IRow } from '../common/types';

interface IRowPreviewProps {
  row: IRow;
}

/**
 * RowPreview renders a preview of a log document with pre-defined fields
 */
const RowPreview: FunctionComponent<IRowPreviewProps> = ({ row }) => {
  const knownColumns = ['cluster', 'namespace', 'app', 'pod_name', 'container_name', 'host'];
  const contentColumns = Object.keys(row).filter((col) => col.startsWith('content_'));

  return (
    <TableCell size="small">
      <Typography
        lineHeight={2}
        sx={{
          WebkitBoxOrient: 'vertical',
          WebkitLineClamp: '2',
          display: '-webkit-box',
          maxWidth: '100%',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {[...knownColumns, ...contentColumns].map((col) => (
          <Fragment key={col}>
            <Box component="span" sx={{ backgroundColor: alpha(grey[600], 0.3), mx: 1, px: 2, py: 1 }}>
              {col}
            </Box>
            <Box
              component="span"
              sx={{
                wordBreak: 'break-all',
              }}
            >
              {row[col]}
            </Box>
          </Fragment>
        ))}
      </Typography>
    </TableCell>
  );
};

export default RowPreview;
