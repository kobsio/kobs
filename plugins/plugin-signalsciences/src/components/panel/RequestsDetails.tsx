import {
  Badge,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  DrawerActions,
  DrawerCloseButton,
  DrawerHead,
  DrawerPanelBody,
  DrawerPanelContent,
  Title,
} from '@patternfly/react-core';
import React from 'react';

import { IRequest } from '../../utils/interfaces';
import { formatTime } from '@kobsio/shared';
import { getFlag } from '../../utils/helpers';

interface IRequestsDetailsProps {
  request: IRequest;
  close: () => void;
}

const RequestsDetails: React.FunctionComponent<IRequestsDetailsProps> = ({ request, close }: IRequestsDetailsProps) => {
  return (
    <DrawerPanelContent minSize="50%">
      <DrawerHead>
        <Title headingLevel="h2" size="xl">
          {request.ID}
        </Title>
        <DrawerActions>
          <DrawerCloseButton onClick={close} />
        </DrawerActions>
      </DrawerHead>
      <DrawerPanelBody>
        <DescriptionList className="pf-u-text-break-word">
          <DescriptionListGroup>
            <DescriptionListTerm className="pf-u-text-nowrap">Server Hostname</DescriptionListTerm>
            <DescriptionListDescription>{request.ServerHostname}</DescriptionListDescription>
          </DescriptionListGroup>

          <DescriptionListGroup>
            <DescriptionListTerm className="pf-u-text-nowrap">Remote Address</DescriptionListTerm>
            <DescriptionListDescription>{request.RemoteIP}</DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm className="pf-u-text-nowrap">Remote Hostname</DescriptionListTerm>
            <DescriptionListDescription>{request.RemoteHostname}</DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm className="pf-u-text-nowrap">Remote Country Code</DescriptionListTerm>
            <DescriptionListDescription>
              {getFlag(request.RemoteCountryCode)} {request.RemoteCountryCode}
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm className="pf-u-text-nowrap">User Agent</DescriptionListTerm>
            <DescriptionListDescription>{request.UserAgent}</DescriptionListDescription>
          </DescriptionListGroup>

          <DescriptionListGroup>
            <DescriptionListTerm className="pf-u-text-nowrap">Request Timestamp</DescriptionListTerm>
            <DescriptionListDescription>
              {formatTime(Math.floor(new Date(request.Timestamp).getTime() / 1000))}
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm className="pf-u-text-nowrap">Request Method</DescriptionListTerm>
            <DescriptionListDescription>{request.Method}</DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm className="pf-u-text-nowrap">Request Server Name</DescriptionListTerm>
            <DescriptionListDescription>{request.ServerName}</DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm className="pf-u-text-nowrap">Request Protocol</DescriptionListTerm>
            <DescriptionListDescription>{request.Protocol}</DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm className="pf-u-text-nowrap">Request Path</DescriptionListTerm>
            <DescriptionListDescription>{request.Path}</DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm className="pf-u-text-nowrap">Request URI</DescriptionListTerm>
            <DescriptionListDescription>{request.URI}</DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm className="pf-u-text-nowrap">Request Full URL</DescriptionListTerm>
            <DescriptionListDescription>{request.UserAgent}</DescriptionListDescription>
          </DescriptionListGroup>

          <DescriptionListGroup>
            <DescriptionListTerm className="pf-u-text-nowrap">Agent Response Code</DescriptionListTerm>
            <DescriptionListDescription>{request.AgentResponseCode}</DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm className="pf-u-text-nowrap">Response Code</DescriptionListTerm>
            <DescriptionListDescription>{request.ResponseCode}</DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm className="pf-u-text-nowrap">Response Size</DescriptionListTerm>
            <DescriptionListDescription>{request.ResponseSize}B</DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm className="pf-u-text-nowrap">Response Time</DescriptionListTerm>
            <DescriptionListDescription>{request.ResponseMillis}ms</DescriptionListDescription>
          </DescriptionListGroup>

          <DescriptionListGroup>
            <DescriptionListTerm className="pf-u-text-nowrap">Signals</DescriptionListTerm>
            <DescriptionListDescription>
              {request.Tags.map((tag) => (
                <div key={tag.Type}>
                  <Badge className="pf-u-mr-sm" style={{ backgroundColor: 'var(--pf-global--primary-color--100)' }}>
                    {tag.Type}
                  </Badge>
                  {tag.Value} (Detector: {tag.Detector} / Location: {tag.Location})
                </div>
              ))}
            </DescriptionListDescription>
          </DescriptionListGroup>
        </DescriptionList>
      </DrawerPanelBody>
    </DrawerPanelContent>
  );
};

export default RequestsDetails;
