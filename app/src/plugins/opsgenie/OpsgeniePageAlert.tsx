import {
  Alert,
  AlertActionLink,
  AlertVariant,
  Badge,
  Card,
  CardBody,
  CardTitle,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Grid,
  GridItem,
  PageSection,
  PageSectionVariants,
  Spinner,
  Text,
  Title,
} from '@patternfly/react-core';
import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { GetAlertRequest, GetAlertResponse, Alert as IAlert, OpsgeniePromiseClient } from 'proto/opsgenie_grpc_web_pb';
import AlertPriority from 'plugins/opsgenie/AlertPriority';
import AlertStatus from 'plugins/opsgenie/AlertStatus';
import { apiURL } from 'utils/constants';
import { formatTime } from 'utils/helpers';

// opsgenieService is the Opsgenie gRPC service, which is used to get a single alert.
const opsgenieService = new OpsgeniePromiseClient(apiURL, null, null);

interface IDataState {
  alert?: IAlert.AsObject;
  error: string;
  isLoading: boolean;
}

interface IOpsgeniePageAlertParams {
  alertID: string;
}

interface IOpsgeniePageAlertProps {
  name: string;
}

// OpsgeniePageAlert is the component to render a single alert.
const OpsgeniePageAlert: React.FunctionComponent<IOpsgeniePageAlertProps> = ({ name }: IOpsgeniePageAlertProps) => {
  const params = useParams<IOpsgeniePageAlertParams>();
  const [data, setData] = useState<IDataState>({ alert: undefined, error: '', isLoading: true });

  // fetchAlert is the function to fetch a single alert by it's id from our gRPC server.
  const fetchAlert = useCallback(async () => {
    try {
      setData({ alert: undefined, error: '', isLoading: true });

      const getAlertRequest = new GetAlertRequest();
      getAlertRequest.setName(name);
      getAlertRequest.setId(params.alertID);

      const getAlertResponse: GetAlertResponse = await opsgenieService.getAlert(getAlertRequest, null);
      setData({ alert: getAlertResponse.toObject().alert, error: '', isLoading: false });
    } catch (err) {
      setData({ alert: undefined, error: err.message, isLoading: false });
    }
  }, [name, params.alertID]);

  // useEffect is used to call the fetchAlert function each time the alert id or name of the Opsgenie instance is
  // changed.
  useEffect(() => {
    fetchAlert();
  }, [fetchAlert]);

  if (data.isLoading) {
    return <Spinner style={{ left: '50%', position: 'fixed', top: '50%', transform: 'translate(-50%, -50%)' }} />;
  }

  if (data.error || !data.alert) {
    return (
      <Alert
        style={{ left: '50%', position: 'fixed', top: '50%', transform: 'translate(-50%, -50%)' }}
        variant={AlertVariant.danger}
        title="Could not get alert"
        actionLinks={
          <React.Fragment>
            <AlertActionLink onClick={fetchAlert}>Retry</AlertActionLink>
          </React.Fragment>
        }
      >
        <p>{data.error ? data.error : 'Alert is undefined'}</p>
      </Alert>
    );
  }

  return (
    <React.Fragment>
      <PageSection variant={PageSectionVariants.light}>
        <Title headingLevel="h6" size="xl">
          {data.alert.message}
          <span className="pf-u-pl-sm pf-u-font-size-sm pf-u-color-400" style={{ float: 'right' }}>
            {formatTime(data.alert.createdat)}
          </span>
        </Title>
        <span className="pf-u-mr-xl">
          <span className="pf-u-mr-sm pf-u-color-400">Priority:</span>
          <AlertPriority priority={data.alert.priority} />
        </span>
        <span className="pf-u-mr-xl">
          <span className="pf-u-mr-sm pf-u-color-400">Status:</span>
          <AlertStatus status={data.alert.status} snoozed={data.alert.snoozed} acknowledged={data.alert.acknowledged} />
        </span>
        <span className="pf-u-mr-xl">
          <span className="pf-u-mr-sm pf-u-color-400">Tags:</span>
          {data.alert.tagsList.map((tag, index) => (
            <Badge key={index} className="pf-u-mr-sm" isRead={true}>
              {tag}
            </Badge>
          ))}
        </span>
        <span className="pf-u-mr-xl">
          <span className="pf-u-mr-sm pf-u-color-400">Responders:</span>
          <b>{data.alert.respondersList.join(', ')}</b>
        </span>
        <span className="pf-u-mr-xl">
          <span className="pf-u-mr-sm pf-u-color-400">Owner:</span>
          <b>{data.alert.owner}</b>
        </span>
      </PageSection>

      <PageSection style={{ minHeight: '100%' }} variant={PageSectionVariants.default}>
        <Grid hasGutter={true}>
          <GridItem sm={12} md={12} lg={6} xl={6} xl2={6}>
            <Card isCompact={true}>
              <CardTitle>Description</CardTitle>
              <CardBody>
                <Text style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>{data.alert.description}</Text>
              </CardBody>
            </Card>
          </GridItem>
          <GridItem sm={12} md={12} lg={6} xl={6} xl2={6}>
            <Card isCompact={true}>
              <CardTitle>Details</CardTitle>
              <CardBody>
                <DescriptionList isHorizontal={true}>
                  {data.alert.detailsMap.map((detail, index) => (
                    <DescriptionListGroup key={index}>
                      <DescriptionListTerm>{detail[0]}</DescriptionListTerm>
                      <DescriptionListDescription>{detail[1]}</DescriptionListDescription>
                    </DescriptionListGroup>
                  ))}
                </DescriptionList>
              </CardBody>
            </Card>
          </GridItem>
        </Grid>
      </PageSection>
    </React.Fragment>
  );
};

export default OpsgeniePageAlert;
