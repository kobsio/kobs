import { Editor, fileDownload, IPluginInstance, pluginBasePath } from '@kobsio/core';
import { Download, KeyboardArrowDown, KeyboardArrowRight, MoreVert, OpenInNew } from '@mui/icons-material';
import {
  Box,
  Collapse,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Typography,
  useTheme,
} from '@mui/material';
import {
  EJSON,
  Document,
  ObjectId,
  BSONRegExp,
  BSONSymbol,
  Binary,
  Code,
  DBRef,
  Decimal128,
  Double,
  Int32,
  Long,
  MaxKey,
  MinKey,
  Timestamp,
  UUID,
} from 'bson';
import { FunctionComponent, MouseEvent, useState } from 'react';
import { Link } from 'react-router-dom';

import { toExtendedJson } from '../utils/utils';

const SingleDocumentDetailsTree: FunctionComponent<{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  documentKey: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  documentValue: any;
}> = ({ documentKey, documentValue }) => {
  const theme = useTheme();
  const [open, setOpen] = useState<boolean>(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const canBeRenderedAsValue = (value: any): boolean => {
    return (
      value === null ||
      ['string', 'number', 'boolean'].some((type) => typeof value === type) ||
      value instanceof Binary ||
      value instanceof Code ||
      value instanceof DBRef ||
      value instanceof Decimal128 ||
      value instanceof Double ||
      value instanceof Int32 ||
      value instanceof Long ||
      value instanceof UUID ||
      value instanceof MaxKey ||
      value instanceof MinKey ||
      value instanceof ObjectId ||
      value instanceof BSONRegExp ||
      value instanceof BSONSymbol ||
      value instanceof Timestamp ||
      value instanceof Date
    );
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getTypeName = (value: any): string => {
    if (value === null) return 'null';
    if (value instanceof Binary) return 'Binary';
    if (value instanceof Code) return 'Code';
    if (value instanceof DBRef) return 'DBRef';
    if (value instanceof Decimal128) return 'Decimal128';
    if (value instanceof Double) return 'Double';
    if (value instanceof Int32) return 'Int32';
    if (value instanceof Long) return 'Long';
    if (value instanceof UUID) return 'UUID';
    if (value instanceof MaxKey) return 'MaxKey';
    if (value instanceof MinKey) return 'MinKey';
    if (value instanceof ObjectId) return 'ObjectId';
    if (value instanceof BSONRegExp) return 'BSONRegExp';
    if (value instanceof BSONSymbol) return 'BSONSymbol';
    if (value instanceof Timestamp) return 'Timestamp';
    if (value instanceof Date) return 'Date';
    return typeof value;
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const formatValue = (value: any): React.ReactNode => {
    if (canBeRenderedAsValue(value)) {
      return (
        <TableCell sx={{ verticalAlign: 'top' }}>
          <Typography>
            {value?.toString() ?? 'null'}
            <small style={{ marginLeft: '4px' }}>({getTypeName(value)})</small>
          </Typography>
        </TableCell>
      );
    }

    return (
      <TableCell sx={{ verticalAlign: 'top' }}>
        <Box
          sx={{
            WebkitBoxOrient: 'vertical',
            WebkitLineClamp: 4,
            display: '-webkit-box',
            lineHeight: '30px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {Object.keys(value).map((key) => (
            <span key={key} style={{ paddingBottom: '8px', paddingRight: '8px' }}>
              <span style={{ backgroundColor: theme.palette.action.selected, borderRadius: '6px', padding: '4px' }}>
                {key}:
              </span>
              <span style={{ padding: '4px' }}>{value[key]?.toString() ?? 'null'}</span>
            </span>
          ))}
        </Box>
      </TableCell>
    );
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const formatDetails = (value: any): React.ReactNode => {
    if (canBeRenderedAsValue(value)) {
      return (
        <TableCell sx={{ verticalAlign: 'top' }}>
          <Typography>
            {value?.toString() ?? 'null'}
            <small style={{ marginLeft: '4px' }}>({getTypeName(value)})</small>
          </Typography>
        </TableCell>
      );
    }

    return (
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell>Key</TableCell>
              <TableCell>Value</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.keys(value).map((key) => (
              <SingleDocumentDetailsTree
                key={value[key]?.toString() ?? 'null'}
                documentKey={key}
                documentValue={value[key]}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  return (
    <>
      <TableRow hover={true} selected={open}>
        <TableCell sx={{ verticalAlign: 'top' }}>
          {canBeRenderedAsValue(documentValue) ? null : (
            <IconButton size="small" onClick={() => setOpen(!open)}>
              {open ? <KeyboardArrowDown /> : <KeyboardArrowRight />}
            </IconButton>
          )}
        </TableCell>
        <TableCell sx={{ verticalAlign: 'top' }}>{documentKey?.toString() ?? 'null'}</TableCell>
        {formatValue(documentValue)}
      </TableRow>

      {canBeRenderedAsValue(documentValue) ? null : (
        <TableRow sx={{ border: 0 }}>
          <TableCell style={{ border: 0, paddingBottom: 0, paddingTop: 0 }} />
          <TableCell style={{ border: 0, paddingBottom: 0, paddingTop: 0 }} colSpan={2}>
            <Collapse in={open} timeout="auto" unmountOnExit={true}>
              {formatDetails(documentValue)}
            </Collapse>
          </TableCell>
        </TableRow>
      )}
    </>
  );
};

const SingleDocumentDetails: FunctionComponent<{
  document: Document;
}> = ({ document }) => {
  const [activeTab, setActiveTab] = useState<string>('tree');

  return (
    <>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs variant="scrollable" scrollButtons={false} value={activeTab} onChange={(_, value) => setActiveTab(value)}>
          <Tab key="tree" label="Tree" value="tree" />
          <Tab key="bson" label="BSON" value="bson" />
          <Tab key="json" label="JSON" value="json" />
        </Tabs>
      </Box>

      <Box key="tree" hidden={activeTab !== 'tree'} py={6}>
        {activeTab === 'tree' && (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell />
                  <TableCell>Key</TableCell>
                  <TableCell>Value</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.keys(document)
                  .filter((key) => key !== '_id')
                  .map((key) => (
                    <SingleDocumentDetailsTree
                      key={document[key]?.toString() ?? 'null'}
                      documentKey={key}
                      documentValue={document[key]}
                    />
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      <Box key="bson" hidden={activeTab !== 'bson'} py={6}>
        {activeTab === 'bson' && (
          <Box height="300px">
            <Editor
              value={JSON.stringify(EJSON.serialize(document, { relaxed: true }), null, 2)}
              language="json"
              readOnly={true}
            />
          </Box>
        )}
      </Box>

      <Box key="json" hidden={activeTab !== 'json'} py={6}>
        {activeTab === 'json' && (
          <Box height="300px">
            <Editor value={JSON.stringify(document, null, 2)} language="json" readOnly={true} />
          </Box>
        )}
      </Box>
    </>
  );
};

const SingleDocumentActions: FunctionComponent<{
  collectionName: string;
  document: Document;
  instance: IPluginInstance;
}> = ({ instance, collectionName, document }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleOpenMenu = (e: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(e.currentTarget);
  };

  const handleCloseMenu = (e: Event) => {
    setAnchorEl(null);
  };

  const download = (type: 'bson' | 'json') => {
    if (type === 'bson') {
      fileDownload(
        JSON.stringify(EJSON.serialize(document, { relaxed: true }), null, 2),
        `${document['_id']?.toString() ?? 'null'}.bson`,
      );
    } else if (type === 'json') {
      fileDownload(JSON.stringify(document, null, 2), `${document['_id']?.toString() ?? 'null'}.json`);
    }

    setAnchorEl(null);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getFilter = (value: any): string => {
    if (value instanceof ObjectId) return `{"_id": ObjectId("${value?.toString() ?? 'null'}")}`;
    return `{"_id": "${value?.toString() ?? 'null'}"}`;
  };

  return (
    <>
      <IconButton size="small" onClick={handleOpenMenu}>
        <MoreVert />
      </IconButton>

      <Menu anchorEl={anchorEl} open={open} onClose={handleCloseMenu}>
        <MenuItem
          component={Link}
          to={`${pluginBasePath(instance)}/${collectionName}/document?filter=${encodeURIComponent(
            toExtendedJson(getFilter(document['_id'])),
          )}`}
        >
          <ListItemIcon>
            <OpenInNew fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Document</ListItemText>
        </MenuItem>

        <MenuItem onClick={() => download('bson')}>
          <ListItemIcon>
            <Download fontSize="small" />
          </ListItemIcon>
          <ListItemText>Download BSON</ListItemText>
        </MenuItem>

        <MenuItem onClick={() => download('json')}>
          <ListItemIcon>
            <Download fontSize="small" />
          </ListItemIcon>
          <ListItemText>Download JSON</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};

const SingleDocument: FunctionComponent<{
  collectionName: string;
  document: Document;
  instance: IPluginInstance;
}> = ({ instance, collectionName, document }) => {
  const theme = useTheme();
  const [open, setOpen] = useState<boolean>(false);

  return (
    <>
      <TableRow hover={true} selected={open}>
        <TableCell sx={{ verticalAlign: 'top' }}>
          <IconButton aria-label="expand" size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowDown /> : <KeyboardArrowRight />}
          </IconButton>
        </TableCell>
        <TableCell sx={{ verticalAlign: 'top' }}>{document['_id']?.toString() ?? 'null'}</TableCell>
        <TableCell sx={{ verticalAlign: 'top' }}>
          <Box
            sx={{
              WebkitBoxOrient: 'vertical',
              WebkitLineClamp: 4,
              display: '-webkit-box',
              lineHeight: '30px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {Object.keys(document)
              .filter((key) => key !== '_id')
              .map((key) => (
                <span key={key} style={{ paddingBottom: '8px', paddingRight: '8px' }}>
                  <span style={{ backgroundColor: theme.palette.action.selected, borderRadius: '6px', padding: '4px' }}>
                    {key}:
                  </span>
                  <span style={{ padding: '4px' }}>{document[key]?.toString() ?? 'null'}</span>
                </span>
              ))}
          </Box>
        </TableCell>
        <TableCell sx={{ verticalAlign: 'top' }}>
          <SingleDocumentActions instance={instance} collectionName={collectionName} document={document} />
        </TableCell>
      </TableRow>

      <TableRow sx={{ border: 0 }}>
        <TableCell style={{ border: 0, paddingBottom: 0, paddingTop: 0 }} />
        <TableCell style={{ border: 0, paddingBottom: 0, paddingTop: 0 }} colSpan={2}>
          <Collapse in={open} timeout="auto" unmountOnExit={true}>
            <SingleDocumentDetails document={document} />
          </Collapse>
        </TableCell>
        <TableCell style={{ border: 0, paddingBottom: 0, paddingTop: 0 }} />
      </TableRow>
    </>
  );
};

export const Documents: FunctionComponent<{
  collectionName: string;
  documents: Document[];
  instance: IPluginInstance;
}> = ({ instance, collectionName, documents }) => {
  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell />
            <TableCell>ID</TableCell>
            <TableCell>Document</TableCell>
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {documents.map((document) => (
            <SingleDocument
              key={document['_id']?.toString() ?? 'null'}
              instance={instance}
              collectionName={collectionName}
              document={document}
            />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
