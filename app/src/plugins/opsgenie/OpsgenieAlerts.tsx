import { Alert, AlertActionLink, AlertVariant, Spinner } from '@patternfly/react-core';
import React, { useCallback, useEffect, useState } from 'react';

import {
  GetAlertsRequest,
  GetAlertsResponse,
  Alert as IAlert,
  OpsgeniePromiseClient,
} from 'proto/opsgenie_grpc_web_pb';
import OpsgenieAlertsAlert from 'plugins/opsgenie/OpsgenieAlertsAlert';
import { apiURL } from 'utils/constants';

// opsgenieService is the Opsgenie gRPC service, which is used to get a list of alerts.
const opsgenieService = new OpsgeniePromiseClient(apiURL, null, null);

interface IDataState {
  alerts: IAlert.AsObject[];
  error: string;
  isLoading: boolean;
}

interface IOpsgenieAlertsProps {
  name: string;
  query: string;
}

// OpsgenieAlerts is the component to retrieve a list of alerts.
const OpsgenieAlerts: React.FunctionComponent<IOpsgenieAlertsProps> = ({ name, query }: IOpsgenieAlertsProps) => {
  const [data, setData] = useState<IDataState>({ alerts: [], error: '', isLoading: false });

  // fetchAlerts is used to fetch a list of alerts from the gRPC API. To get the list of alerts the user must provide a
  // query.
  const fetchAlerts = useCallback(async () => {
    try {
      setData({ alerts: [], error: '', isLoading: true });

      const getAlertsRequest = new GetAlertsRequest();
      getAlertsRequest.setName(name);
      getAlertsRequest.setQuery(query);

      const getAlertsResponse: GetAlertsResponse = await opsgenieService.getAlerts(getAlertsRequest, null);
      setData({ alerts: getAlertsResponse.toObject().alertsList, error: '', isLoading: false });
    } catch (err) {
      setData({ alerts: [], error: err.message, isLoading: false });
    }
  }, [name, query]);

  // useEffect is used to call the fetchAlerts function, each time the instance name or query is changed.
  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  // When we fetch the alerts, we are showing a spinner, below the page header of the Opsgenie page.
  if (data.isLoading) {
    return (
      <div className="pf-u-text-align-center">
        <Spinner />
      </div>
    );
  }

  // If an error occurred during the fetching of the alerts, we show the error within an Alert component. The user can
  // retry the fetch within the retry action link.
  if (data.error) {
    return (
      <Alert
        variant={AlertVariant.danger}
        title="Could not get alerts"
        actionLinks={
          <React.Fragment>
            <AlertActionLink onClick={fetchAlerts}>Retry</AlertActionLink>
          </React.Fragment>
        }
      >
        <p>{data.error}</p>
      </Alert>
    );
  }

  return (
    <React.Fragment>
      {data.alerts.map((alert, index) => (
        <React.Fragment key={index}>
          <OpsgenieAlertsAlert name={name} alert={alert} />
          <p>&nbsp;</p>
        </React.Fragment>
      ))}
    </React.Fragment>
  );
};

export default OpsgenieAlerts;
