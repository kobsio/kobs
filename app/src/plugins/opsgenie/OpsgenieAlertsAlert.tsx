import { Badge, Card, CardActions, CardBody, CardHeader, CardTitle } from '@patternfly/react-core';
import React from 'react';

import { Alert } from 'proto/opsgenie_grpc_web_pb';
import AlertPriority from 'plugins/opsgenie/AlertPriority';
import AlertStatus from 'plugins/opsgenie/AlertStatus';
import LinkWrapper from 'components/LinkWrapper';
import { formatTime } from 'utils/helpers';

interface IOpsgenieAlertsAlertProps {
  name: string;
  alert: Alert.AsObject;
}

// OpsgenieAlertsAlert is the component for an alert in the list of alerts in the OpsgenieAlerts component.
const OpsgenieAlertsAlert: React.FunctionComponent<IOpsgenieAlertsAlertProps> = ({
  name,
  alert,
}: IOpsgenieAlertsAlertProps) => {
  return (
    <LinkWrapper link={`/plugins/${name}/alert/${alert.id}`}>
      <Card style={{ cursor: 'pointer' }} isCompact={true} isHoverable={true}>
        <CardHeader>
          <CardActions>
            <span className="pf-u-pl-sm pf-u-font-size-sm pf-u-color-400">{formatTime(alert.createdat)}</span>
          </CardActions>
          <CardTitle>{alert.message}</CardTitle>
        </CardHeader>
        <CardBody>
          <span className="pf-u-mr-xl">
            <span className="pf-u-mr-sm pf-u-color-400">Priority:</span>
            <AlertPriority priority={alert.priority} />
          </span>
          <span className="pf-u-mr-xl ">
            <span className="pf-u-mr-sm pf-u-color-400">Status:</span>
            <AlertStatus status={alert.status} snoozed={alert.snoozed} acknowledged={alert.acknowledged} />
          </span>
          <span className="pf-u-mr-sm pf-u-color-400">Tags:</span>
          {alert.tagsList.map((tag, index) => (
            <Badge key={index} className="pf-u-mr-sm" isRead={true}>
              {tag}
            </Badge>
          ))}
        </CardBody>
      </Card>
    </LinkWrapper>
  );
};

export default OpsgenieAlertsAlert;
