import {
  Button,
  Card,
  CardBody,
  DrawerActions,
  DrawerCloseButton,
  DrawerHead,
  DrawerPanelBody,
  DrawerPanelContent,
  Flex,
  FlexItem,
  Title,
} from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';
import { Link } from 'react-router-dom';
import React from 'react';

import ApplicationDetailsChart from './ApplicationDetailsChart';
import ApplicationDetailsLabels from './ApplicationDetailsLabels';
import { IApplication } from '../../crds/application';
import { ITimes } from '@kobsio/shared';

interface IApplicationDetailsProps {
  application: IApplication;
  close: () => void;
}

const ApplicationDetails: React.FunctionComponent<IApplicationDetailsProps> = ({
  application,
  close,
}: IApplicationDetailsProps) => {
  const times: ITimes = {
    time: 'last15Minutes',
    timeEnd: Math.floor(Date.now() / 1000),
    timeStart: Math.floor(Date.now() / 1000) - 900,
  };

  return (
    <DrawerPanelContent>
      <DrawerHead>
        <Title headingLevel="h2" size="xl">
          {application.name}
          <span className="pf-u-pl-sm pf-u-font-size-sm pf-u-color-400">
            {application.topology && application.topology.external === true
              ? ''
              : `${application.namespace} / ${application.cluster} (${application.satellite})`}
          </span>
        </Title>
        <DrawerActions>
          <Button
            style={{ paddingRight: 0 }}
            variant="plain"
            component={(props): React.ReactElement => <Link {...props} to={`/applications${application.id}`} />}
          >
            <ExternalLinkAltIcon />
          </Button>

          <DrawerCloseButton onClick={close} />
        </DrawerActions>
      </DrawerHead>
      <DrawerPanelBody>
        <Flex spaceItems={{ default: 'spaceItemsLg' }} direction={{ default: 'column' }}>
          <FlexItem>
            <p>{application.description}</p>
          </FlexItem>
          <ApplicationDetailsLabels application={application} />

          {application.insights && application.insights.length > 0 && (
            <Card isCompact={true}>
              <CardBody>
                {application.insights.map((insight, index) => (
                  <FlexItem key={insight.title} style={index !== 0 ? { marginTop: '16px' } : undefined}>
                    <ApplicationDetailsChart insight={insight} times={times} />
                  </FlexItem>
                ))}
              </CardBody>
            </Card>
          )}
        </Flex>
      </DrawerPanelBody>
    </DrawerPanelContent>
  );
};

export default ApplicationDetails;
