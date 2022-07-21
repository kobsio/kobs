import {
  Button,
  DrawerActions,
  DrawerCloseButton,
  DrawerHead,
  DrawerPanelBody,
  DrawerPanelContent,
  Title,
} from '@patternfly/react-core';
import ExternalLinkAltIcon from '@patternfly/react-icons/dist/esm/icons/external-link-alt-icon';
import React from 'react';

import { AuthContextProvider } from '../../context/AuthContext';
import { IPluginInstance } from '@kobsio/shared';

interface IDetailsProps {
  title: string;
  link?: string;
  instance: IPluginInstance;
  close: () => void;
  children: React.ReactElement;
}

const Details: React.FunctionComponent<IDetailsProps> = ({ title, link, instance, close, children }: IDetailsProps) => {
  return (
    <DrawerPanelContent minSize="50%">
      <DrawerHead>
        <Title headingLevel="h2" size="xl">
          {title}
        </Title>
        <DrawerActions>
          {link && (
            <Button
              style={{ paddingRight: 0 }}
              variant="plain"
              // eslint-disable-next-line jsx-a11y/anchor-has-content
              component={(props): React.ReactElement => <a {...props} href={link} />}
            >
              <ExternalLinkAltIcon />
            </Button>
          )}

          <DrawerCloseButton onClick={close} />
        </DrawerActions>
      </DrawerHead>
      <DrawerPanelBody>
        <AuthContextProvider title="" instance={instance}>
          {children}
        </AuthContextProvider>
      </DrawerPanelBody>
    </DrawerPanelContent>
  );
};

export default Details;
