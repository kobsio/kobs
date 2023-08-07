import {
  APIContext,
  APIError,
  IAPIContext,
  ITimes,
  UseQueryWrapper,
  IPluginInstance,
  formatTimeString,
  DetailsDrawer,
  DescriptionList,
  DescriptionListGroup,
  DescriptionListTerm,
  DescriptionListDescription,
  Pagination,
} from '@kobsio/core';
import {
  Card,
  CardContent,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { FunctionComponent, useContext, useState } from 'react';

import { getFlag } from '../utils/utils';

interface IRequest {
  agentResponseCode: number;
  headersIn: string[][];
  headersOut: string[][];
  id: string;
  method: string;
  path: string;
  protocol: string;
  remoteCountryCode: string;
  remoteHostname: string;
  remoteIP: string;
  responseCode: number;
  responseMillis: number;
  responseSize: number;
  scheme: string;
  serverHostname: string;
  serverName: string;
  tags: IRequestTag[];
  timestamp: string;
  tlsCipher: string;
  tlsProtocol: string;
  uri: string;
  userAgent: string;
}

interface IRequestTag {
  detector: string;
  location: string;
  type: string;
  value: string;
}

const Details: FunctionComponent<{
  onClose: () => void;
  open: boolean;
  request: IRequest;
}> = ({ request, onClose, open }) => {
  return (
    <DetailsDrawer size="large" open={open} onClose={onClose} title={request.id || ''}>
      <Card sx={{ mb: 6 }}>
        <CardContent>
          <DescriptionList>
            <DescriptionListGroup>
              <DescriptionListTerm>Server Hostname</DescriptionListTerm>
              <DescriptionListDescription>{request.serverHostname}</DescriptionListDescription>
            </DescriptionListGroup>

            <DescriptionListGroup>
              <DescriptionListTerm>Remote Address</DescriptionListTerm>
              <DescriptionListDescription>{request.remoteIP}</DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>Remote Hostname</DescriptionListTerm>
              <DescriptionListDescription>{request.remoteHostname}</DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>Remote Country Code</DescriptionListTerm>
              <DescriptionListDescription>
                {getFlag(request.remoteCountryCode)} {request.remoteCountryCode}
              </DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>User Agent</DescriptionListTerm>
              <DescriptionListDescription>{request.userAgent}</DescriptionListDescription>
            </DescriptionListGroup>

            <DescriptionListGroup>
              <DescriptionListTerm>Request Timestamp</DescriptionListTerm>
              <DescriptionListDescription>{formatTimeString(request.timestamp || '')}</DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>Request Method</DescriptionListTerm>
              <DescriptionListDescription>{request.method}</DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>Request Server Name</DescriptionListTerm>
              <DescriptionListDescription>{request.serverName}</DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>Request Protocol</DescriptionListTerm>
              <DescriptionListDescription>{request.protocol}</DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>Request Path</DescriptionListTerm>
              <DescriptionListDescription>{request.path}</DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>Request URI</DescriptionListTerm>
              <DescriptionListDescription>{request.uri}</DescriptionListDescription>
            </DescriptionListGroup>

            <DescriptionListGroup>
              <DescriptionListTerm>Agent Response Code</DescriptionListTerm>
              <DescriptionListDescription>{request.agentResponseCode}</DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>Response Code</DescriptionListTerm>
              <DescriptionListDescription>{request.responseCode}</DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>Response Size</DescriptionListTerm>
              <DescriptionListDescription>{request.responseSize}B</DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>Response Time</DescriptionListTerm>
              <DescriptionListDescription>{request.responseMillis}ms</DescriptionListDescription>
            </DescriptionListGroup>

            <DescriptionListGroup>
              <DescriptionListTerm>Signals</DescriptionListTerm>
              <DescriptionListDescription>
                {request.tags?.map((tag) => (
                  <div key={tag.type}>
                    <Chip sx={{ mb: 1, mr: 2 }} size="small" color="primary" label={tag.type} />
                    {tag.value} (Detector: {tag.detector} / Location: {tag.location})
                  </div>
                ))}
              </DescriptionListDescription>
            </DescriptionListGroup>
          </DescriptionList>
        </CardContent>
      </Card>
    </DetailsDrawer>
  );
};

const Request: FunctionComponent<{ request: IRequest }> = ({ request }) => {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <>
      <TableRow
        sx={{ '&:last-child td, &:last-child th': { border: 0 }, cursor: 'pointer' }}
        hover={true}
        selected={open}
        onClick={() => setOpen(true)}
      >
        <TableCell sx={{ verticalAlign: 'top' }}>
          {formatTimeString(request.timestamp || '')}
          <div>
            <Typography fontWeight="bold">
              {request.method} {request.serverName}
            </Typography>
          </div>
          <div>
            <Typography fontWeight="bold" sx={{ wordBreak: 'break-all' }}>
              {request.path}
            </Typography>
          </div>
        </TableCell>
        <TableCell sx={{ verticalAlign: 'top' }}>
          {request.tags?.map((tag) => (
            <div key={tag.type}>
              <Chip sx={{ mb: 1, mr: 2 }} size="small" color="primary" label={tag.type} />
              <Typography sx={{ wordBreak: 'break-all' }}>{tag.value}</Typography>
            </div>
          ))}
        </TableCell>
        <TableCell sx={{ verticalAlign: 'top' }}>
          <div>
            {getFlag(request.remoteCountryCode)} {request.remoteIP}
          </div>
          <div>{request.remoteHostname}</div>
          <div>{request.userAgent}</div>
        </TableCell>
        <TableCell sx={{ verticalAlign: 'top' }}>
          <div>
            <Typography noWrap={true}>
              Agent:{' '}
              <Typography component="span" fontWeight="bold">
                {request.agentResponseCode}
              </Typography>
            </Typography>
          </div>
          <div>
            <Typography noWrap={true}>
              Server:{' '}
              <Typography component="span" fontWeight="bold">
                {request.responseCode}
              </Typography>
            </Typography>
          </div>
          <div>
            <Typography noWrap={true}>
              Response Size:{' '}
              <Typography component="span" fontWeight="bold">
                {request.responseSize}B
              </Typography>
            </Typography>
          </div>
          <div>
            <Typography noWrap={true}>
              Response Time:{' '}
              <Typography component="span" fontWeight="bold">
                {request.responseMillis}ms
              </Typography>
            </Typography>
          </div>
        </TableCell>
      </TableRow>

      {open && <Details request={request} open={open} onClose={() => setOpen(false)} />}
    </>
  );
};

const Requests: FunctionComponent<{
  instance: IPluginInstance;
  page: number;
  perPage: number;
  query: string;
  setPage: (page: number, perPage: number) => void;
  site: string;
  times: ITimes;
}> = ({ instance, times, site, query, page, perPage, setPage }) => {
  const apiContext = useContext<IAPIContext>(APIContext);

  const { isError, isLoading, error, data, refetch } = useQuery<{ requests?: IRequest[]; total?: number }, APIError>(
    ['signalsciences/requests', instance, times, site, query, page, perPage],
    async () => {
      return apiContext.client.get<{ requests?: IRequest[]; total?: number }>(
        `/api/plugins/signalsciences/requests?query=${encodeURIComponent(
          `${query} from:${times.timeStart} until:${times.timeEnd}` || `from:${times.timeStart} until:${times.timeEnd}`,
        )}&siteName=${encodeURIComponent(site)}&page=${page}&limit=${perPage}`,
        {
          headers: {
            'x-kobs-cluster': instance.cluster,
            'x-kobs-plugin': instance.name,
          },
        },
      );
    },
  );

  return (
    <UseQueryWrapper
      error={error}
      errorTitle="Failed to load requests"
      isError={isError}
      isLoading={isLoading}
      isNoData={!data || !data.requests || data.requests.length === 0}
      noDataTitle="No requests were found"
      refetch={refetch}
    >
      <Card>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Request</TableCell>
                <TableCell>Signals</TableCell>
                <TableCell>Source</TableCell>
                <TableCell>Response</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>{data?.requests?.map((request) => <Request key={request.id} request={request} />)}</TableBody>
          </Table>
        </TableContainer>
      </Card>
      <Pagination count={data?.total || 0} page={page} perPage={perPage} handleChange={setPage} />
    </UseQueryWrapper>
  );
};

export default Requests;
