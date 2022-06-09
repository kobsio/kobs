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
import { useNavigate } from 'react-router-dom';

import { IApplicationOptions, IFilters } from '../../utils/interfaces';
import ApplicationActions from './ApplicationActions';
import { IPluginInstance } from '@kobsio/shared';
import Top from '../panel/Top';

export interface IApplicationTopProps extends IApplicationOptions {
  instance: IPluginInstance;
  namespace: string;
  application: string;
  setFilters: (filters: IFilters) => void;
  setDetails?: (details: React.ReactNode) => void;
}

const ApplicationTop: React.FunctionComponent<IApplicationTopProps> = ({
  instance,
  namespace,
  application,
  times,
  filters,
  setFilters,
  setDetails,
}: IApplicationTopProps) => {
  const navigate = useNavigate();
  const [liveUpdate, setLiveUpdate] = useState<boolean>(false);

  if (!instance.options?.klogs) {
    return (
      <DrawerContentBody>
        <PageSection variant={PageSectionVariants.default}>
          <Alert
            variant={AlertVariant.warning}
            title="klogs plugin is not enabled"
            actionLinks={
              <React.Fragment>
                <AlertActionLink onClick={(): void => navigate('/')}>Home</AlertActionLink>
              </React.Fragment>
            }
          >
            <p>You have to enable the klogs integration in the Istio plugin configuration.</p>
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
            <Top
              instance={instance}
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

export default ApplicationTop;
