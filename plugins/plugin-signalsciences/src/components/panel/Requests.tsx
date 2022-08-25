import React, { useState } from 'react';
import { TableComposable, TableVariant, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { Badge } from '@patternfly/react-core';

import { IRequest } from '../../utils/interfaces';
import RequestsDetails from './RequestsDetails';
import { formatTime } from '@kobsio/shared';
import { getFlag } from '../../utils/helpers';

interface IRequestsProps {
  requests: IRequest[];
  page: number;
  perPage: number;
  setDetails?: (details: React.ReactNode) => void;
}

const Requests: React.FunctionComponent<IRequestsProps> = ({ requests, page, perPage, setDetails }: IRequestsProps) => {
  const [selectedRequest, setSelectedRequest] = useState<IRequest>();

  const selectRow = (request: IRequest): void => {
    if (setDetails) {
      setSelectedRequest(request);
      setDetails(
        <RequestsDetails
          request={request}
          close={(): void => {
            setSelectedRequest(undefined);
            setDetails(undefined);
          }}
        />,
      );
    }
  };

  return (
    <TableComposable aria-label="requests table" variant={TableVariant.compact} borders={true}>
      <Thead>
        <Tr>
          <Th>Request</Th>
          <Th>Signals</Th>
          <Th>Source</Th>
          <Th>Response</Th>
        </Tr>
      </Thead>
      <Tbody>
        {requests.slice((page - 1) * perPage, page * perPage).map((request) => (
          <Tr
            key={request.ID}
            isHoverable={setDetails ? true : false}
            isRowSelected={selectedRequest && selectedRequest.ID === request.ID ? true : false}
            onClick={(): void => (setDetails ? selectRow(request) : undefined)}
          >
            <Td dataLabel="Request">
              {formatTime(Math.floor(new Date(request.Timestamp).getTime() / 1000))}
              <div className="pf-u-font-weight-bold">
                {request.Method} {request.ServerName}
              </div>
              <div className="pf-u-font-weight-bold">{request.Path}</div>
            </Td>
            <Td dataLabel="Signals">
              {request.Tags.map((tag) => (
                <div key={tag.Type}>
                  <Badge className="pf-u-mr-sm" style={{ backgroundColor: 'var(--pf-global--primary-color--100)' }}>
                    {tag.Type}
                  </Badge>
                  {tag.Value}
                </div>
              ))}
            </Td>
            <Td dataLabel="Source">
              <div>
                {getFlag(request.RemoteCountryCode)} {request.RemoteIP}
              </div>
              <div>{request.RemoteHostname}</div>
              <div>{request.UserAgent}</div>
            </Td>
            <Td dataLabel="Response">
              <div>
                Agent: <span className="pf-u-font-weight-bold">{request.AgentResponseCode}</span>
              </div>
              <div>
                Server: <span className="pf-u-font-weight-bold">{request.ResponseCode}</span>
              </div>
              <div>
                Response Size: <span className="pf-u-font-weight-bold">{request.ResponseSize}B</span>
              </div>
              <div>
                Response Time: <span className="pf-u-font-weight-bold">{request.ResponseMillis}ms</span>
              </div>
            </Td>
          </Tr>
        ))}
      </Tbody>
    </TableComposable>
  );
};

export default Requests;
