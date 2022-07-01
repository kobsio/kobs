import {
  Alert,
  AlertActionLink,
  AlertVariant,
  Button,
  DrawerActions,
  DrawerCloseButton,
  DrawerHead,
  DrawerPanelBody,
  DrawerPanelContent,
  Flex,
  FlexItem,
  Spinner,
  Title,
} from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from 'react-query';
import ExternalLinkAltIcon from '@patternfly/react-icons/dist/esm/icons/external-link-alt-icon';
import { Link } from 'react-router-dom';
import React from 'react';

import ApplicationDetails from '../applications/ApplicationDetails';
import { IApplication } from '../../crds/application';

interface IApplicationDetailsWrapperProps {
  id: string;
  cluster: string;
  namespace: string;
  name: string;
  close: () => void;
}

const ApplicationDetailsWrapper: React.FunctionComponent<IApplicationDetailsWrapperProps> = ({
  id,
  cluster,
  namespace,
  name,
  close,
}: IApplicationDetailsWrapperProps) => {
  const { isError, isLoading, error, data, refetch } = useQuery<IApplication, Error>(
    ['app/applications/application', id],
    async () => {
      const response = await fetch(`/api/applications/application?id=${encodeURIComponent(id)}`, {
        method: 'get',
      });
      const json = await response.json();

      if (response.status >= 200 && response.status < 300) {
        return json;
      } else {
        if (json.error) {
          throw new Error(json.error);
        } else {
          throw new Error('An unknown error occured');
        }
      }
    },
  );

  if (isLoading || isError || !data) {
    return (
      <DrawerPanelContent>
        <DrawerHead>
          <Title headingLevel="h2" size="xl">
            {name}
            <span className="pf-u-pl-sm pf-u-font-size-sm pf-u-color-400">
              {namespace} / {cluster}
            </span>
          </Title>
          <DrawerActions>
            <Button
              style={{ paddingRight: 0 }}
              variant="plain"
              component={(props): React.ReactElement => <Link {...props} to={`/applications${id}`} />}
            >
              <ExternalLinkAltIcon />
            </Button>

            <DrawerCloseButton onClick={close} />
          </DrawerActions>
        </DrawerHead>
        <DrawerPanelBody>
          <Flex spaceItems={{ default: 'spaceItemsLg' }} direction={{ default: 'column' }}>
            <FlexItem>
              {isLoading ? (
                <div className="pf-u-text-align-center">
                  <Spinner />
                </div>
              ) : isError ? (
                <Alert
                  variant={AlertVariant.danger}
                  title="An error occured while applications were fetched"
                  actionLinks={
                    <React.Fragment>
                      <AlertActionLink onClick={(): Promise<QueryObserverResult<IApplication, Error>> => refetch()}>
                        Retry
                      </AlertActionLink>
                    </React.Fragment>
                  }
                >
                  <p>{error?.message}</p>
                </Alert>
              ) : null}
            </FlexItem>
          </Flex>
        </DrawerPanelBody>
      </DrawerPanelContent>
    );
  }

  return <ApplicationDetails application={data} close={close} />;
};

export default ApplicationDetailsWrapper;
