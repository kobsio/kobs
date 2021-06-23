import { Link } from 'react-router-dom';
import React from 'react';

interface ILinkWrapperProps {
  link: string;
  children: React.ReactElement;
}

// The LinkWrapper component can be used to wrap another component inside a link. This can be used for selectedable
// cards, which should navigate the user to another location. This is to prefer over an onClick handler, so that the
// user can decide if he wants the link in a new tab or not.
export const LinkWrapper: React.FunctionComponent<ILinkWrapperProps> = ({ children, link }: ILinkWrapperProps) => {
  if (link.startsWith('http')) {
    return <div onClick={(): Window | null => window.open(link, '_blank')}>{children}</div>;
  }

  return (
    <Link to={link} style={{ color: 'inherit', textDecoration: 'inherit' }}>
      {children}
    </Link>
  );
};
