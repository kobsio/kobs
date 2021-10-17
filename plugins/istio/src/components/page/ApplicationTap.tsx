import {
  Alert,
  AlertActionLink,
  AlertVariant,
  Card,
  CardBody,
  CardHeader,
  CardHeaderMain,
  DrawerContentBody,
  PageSection,
  PageSectionVariants,
} from '@patternfly/react-core';
import React, { useState } from 'react';
import { useHistory } from 'react-router';

import { IApplicationOptions, IFilters, IPluginOptions } from '../../utils/interfaces';
import ApplicationActions from './ApplicationActions';
import Tap from '../panel/Tap';

export interface IApplicationTapProps extends IApplicationOptions {
  name: string;
  namespace: string;
  application: string;
  pluginOptions: IPluginOptions;
  setFilters: (filters: IFilters) => void;
  setDetails?: (details: React.ReactNode) => void;
}

const ApplicationTap: React.FunctionComponent<IApplicationTapProps> = ({
  name,
  namespace,
  application,
  times,
  filters,
  pluginOptions,
  setFilters,
  setDetails,
}: IApplicationTapProps) => {
  const history = useHistory();
  const [liveUpdate, setLiveUpdate] = useState<boolean>(false);

  if (!pluginOptions.clickhouse) {
    return (
      <DrawerContentBody>
        <PageSection variant={PageSectionVariants.default}>
          <Alert
            variant={AlertVariant.warning}
            title="Clickhouse plugin is not enabled"
            actionLinks={
              <React.Fragment>
                <AlertActionLink onClick={(): void => history.push('/')}>Home</AlertActionLink>
              </React.Fragment>
            }
          >
            <p>You have to enable the Clickhouse integration in the Istio plugin configuration.</p>
          </Alert>
        </PageSection>
      </DrawerContentBody>
    );
  }

  return (
    <DrawerContentBody>
      <PageSection variant={PageSectionVariants.default}>
        <Card isCompact={true}>
          <CardHeader>
            <CardHeaderMain>
              <span className="pf-u-font-weight-bold">Tap</span>
            </CardHeaderMain>
            <ApplicationActions
              liveUpdate={liveUpdate}
              filters={filters}
              setLiveUpdate={setLiveUpdate}
              setFilters={setFilters}
            />
          </CardHeader>
          <CardBody>
            <Tap
              name={name}
              namespace={namespace}
              application={application}
              times={times}
              liveUpdate={liveUpdate}
              filters={filters}
              setDetails={setDetails}
            />
          </CardBody>
        </Card>
      </PageSection>
    </DrawerContentBody>
  );
};

export default ApplicationTap;
