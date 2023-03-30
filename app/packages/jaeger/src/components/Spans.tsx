import { IPluginInstance } from '@kobsio/core';
import { ContentCopy, Error, ExpandMore } from '@mui/icons-material';
import {
  Collapse,
  Grid,
  Typography,
  Box,
  Chip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TableContainer,
  Table,
  TableHead,
  TableCell,
  TableRow,
  TableBody,
  Stack,
} from '@mui/material';
import { FunctionComponent, useState } from 'react';
import { Virtuoso } from 'react-virtuoso';

import { doesSpanContainsError, formatTraceTime, IKeyValuePair, IProcess, ISpan, ITrace } from '../utils/utils';

const PADDING = 20;

const Tag: FunctionComponent<{ tag: IKeyValuePair }> = ({ tag }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const copy = (): void => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${tag.key ? `${tag.key}=` : ''}${tag.value}`);
    }
    setAnchorEl(null);
  };

  return (
    <>
      <Chip
        size="small"
        clickable={true}
        label={`${tag.key ? `${tag.key}=` : ''}${tag.value}`}
        sx={{ mb: 2, ml: 2 }}
        onClick={(e) => setAnchorEl(e.currentTarget)}
      />

      <Menu
        anchorEl={anchorEl}
        anchorOrigin={{
          horizontal: 'center',
          vertical: 'bottom',
        }}
        open={open}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={copy}>
          <ListItemIcon>
            <ContentCopy fontSize="small" />
          </ListItemIcon>
          <ListItemText>Copy</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};

const Span: FunctionComponent<{
  colors: Record<string, string>;
  duration: number;
  expanded: boolean;
  instance: IPluginInstance;
  processes: Record<string, IProcess>;
  setExpanded: (spanID: string) => void;
  span: ISpan;
  startTime: number;
}> = ({ instance, colors, span, duration, startTime, processes, expanded, setExpanded }) => {
  const [expandedSpan, setExpandedSpan] = useState<boolean>(false);
  const offset = ((span.startTime - startTime) / 1000 / (duration / 1000)) * 100;
  const fill = (span.duration / 1000 / (duration / 1000)) * 100;

  const getTreeOffset = (block: boolean) => {
    const treeOffset = [];
    for (let index = 0; index < span.depth + 1; index++) {
      treeOffset.push(
        <span
          key={index}
          style={{
            borderRight: index === span.depth ? `3px solid ${colors[span.process.serviceName]}` : '1px dashed #8a8d90',
            display: block ? 'inline-block' : 'inline',
            height: '100%',
            paddingLeft: `${index === 0 ? 0 : PADDING}px`,
          }}
        ></span>,
      );
    }
    return treeOffset;
  };

  return (
    <div>
      <Grid container={true} onClick={() => setExpanded(span.spanID)} sx={{ cursor: 'pointer' }}>
        <Grid
          item={true}
          xs={expandedSpan ? 12 : 3}
          overflow="hidden"
          textOverflow="ellipsis"
          onMouseEnter={(): void => setExpandedSpan(true)}
          onMouseLeave={(): void => setExpandedSpan(false)}
        >
          {getTreeOffset(false)}
          <Typography component="span" variant="subtitle1" noWrap={true} sx={{ pl: `${PADDING}px` }}>
            {doesSpanContainsError(span) ? (
              <Error
                color="error"
                // fontSize="small"
                sx={(theme) => ({
                  height: theme.typography.subtitle1.fontSize,
                  mr: 2,
                  position: 'relative',
                  top: theme.spacing(0.75),
                  width: theme.typography.subtitle1.fontSize,
                })}
              />
            ) : null}
            {span.process.serviceName}:
            <Typography component="span" color="text.secondary" sx={{ pl: 2 }}>
              {span.operationName}
            </Typography>
          </Typography>
        </Grid>
        {!expandedSpan && (
          <Grid item={true} xs={9} sx={{ pl: 2 }}>
            <div style={{ position: 'relative' }}>
              <span
                style={{
                  height: '10px',
                  left: '0',
                  position: 'absolute',
                  width: '100%',
                }}
              >
                <span
                  style={{
                    backgroundColor: colors[span.process.serviceName],
                    bottom: '8px',
                    height: '10px',
                    left: `${offset}%`,
                    minWidth: '2px',
                    position: 'absolute',
                    top: '8px',
                    width: `${fill}%`,
                  }}
                ></span>
              </span>
            </div>
          </Grid>
        )}
      </Grid>

      <Collapse in={expanded} timeout="auto" unmountOnExit={true}>
        <Grid container={true}>
          <Grid item={true} xs={3}>
            {getTreeOffset(true)}
          </Grid>
          <Grid item={true} xs={9} sx={{ pl: 2 }}>
            <Stack sx={{ py: 2 }} spacing={2} direction="row" justifyContent="space-between" alignItems="center">
              <Typography component="span" variant="subtitle1" sx={{ wordBreak: 'break-all' }}>
                {span.operationName}
              </Typography>

              <Typography component="span">
                <Typography component="span" color="text.secondary">
                  Service:
                </Typography>
                <Typography component="span" fontWeight="bold" sx={{ pl: 2, pr: 4 }}>
                  {span.process.serviceName}
                </Typography>

                <Typography component="span" color="text.secondary">
                  Duration:
                </Typography>
                <Typography component="span" fontWeight="bold" sx={{ pl: 2, pr: 4 }}>
                  {span.duration / 1000}ms
                </Typography>
              </Typography>
            </Stack>

            {processes[span.processID].tags.length > 0 && (
              <Box sx={{ py: 2 }}>
                Process:
                {processes[span.processID].tags.map((tag, index) => (
                  <Tag key={index} tag={tag} />
                ))}
              </Box>
            )}
            {span.tags.length > 0 && (
              <Box sx={{ py: 2 }}>
                Tags:
                {span.tags.map((tag, index) => (
                  <Tag key={index} tag={tag} />
                ))}
              </Box>
            )}
            {span.logs.length > 0 && (
              <Box sx={{ py: 2 }}>
                Logs:
                {span.logs.map((log, index) => (
                  <Accordion key={index}>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Typography>{formatTraceTime(log.timestamp)}</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Key</TableCell>
                              <TableCell>Value</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {log.fields.map((field, rowIndex) => (
                              <TableRow
                                key={rowIndex}
                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                hover={true}
                              >
                                <TableCell sx={{ verticalAlign: 'top' }}>{field.key}</TableCell>
                                <TableCell sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                                  {field.value}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </Box>
            )}
            {span.warnings.length > 0 && (
              <Box sx={{ py: 2 }}>
                Warnings:
                {span.warnings.map((warning, index) => (
                  <Tag key={index} tag={{ key: '', value: warning }} />
                ))}
              </Box>
            )}
          </Grid>
        </Grid>
      </Collapse>
    </div>
  );
};

export const Spans: FunctionComponent<{ colors: Record<string, string>; instance: IPluginInstance; trace: ITrace }> = ({
  instance,
  colors,
  trace,
}) => {
  const [expanded, setExpanded] = useState<string[]>([]);

  const changeExpanded = (spanID: string): void => {
    let tmpExpanded: string[] = [...expanded];

    if (tmpExpanded.includes(spanID)) {
      tmpExpanded = tmpExpanded.filter((s) => s !== spanID);
    } else {
      tmpExpanded.push(spanID);
    }

    setExpanded(tmpExpanded);
  };

  return (
    <Virtuoso
      style={{ height: '100%' }}
      useWindowScroll={false}
      data={trace.spans}
      itemContent={(index, span) => (
        <Span
          key={span.spanID}
          instance={instance}
          colors={colors}
          span={span}
          duration={trace.duration}
          startTime={trace.startTime}
          processes={trace.processes}
          expanded={expanded.includes(span.spanID)}
          setExpanded={changeExpanded}
        />
      )}
    />
  );
};
