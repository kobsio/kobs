import { Button, ButtonVariant } from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';
import { Link } from 'react-router-dom';
import React from 'react';

interface IDrawerLinkProps {
  link: string;
  icon?: React.ReactNode;
}

// DrawerLink is a component, which can be used to render an additional link in the Drawer header next to the
// DrawerCloseButton component. The component requires a link and an optional icon. If no icon is specified the
// ExternalLinkAltIcon icon is used.
export const DrawerLink: React.FunctionComponent<IDrawerLinkProps> = ({ link, icon }: IDrawerLinkProps) => {
  return (
    <div className="pf-c-drawer__close">
      <Link to={link}>
        <Button variant={ButtonVariant.plain}>{icon ? icon : <ExternalLinkAltIcon />}</Button>
      </Link>
    </div>
  );
};
