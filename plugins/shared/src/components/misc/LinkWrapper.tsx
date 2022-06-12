import { Link } from 'react-router-dom';
import React from 'react';

interface ILinkWrapperProps {
  to: string;
  children: React.ReactElement;
}

export const LinkWrapper: React.FunctionComponent<ILinkWrapperProps> = ({ children, to }: ILinkWrapperProps) => {
  if (to.startsWith('http')) {
    return <div onClick={(): Window | null => window.open(to, '_blank')}>{children}</div>;
  }

  return (
    <Link to={to} style={{ color: 'inherit', textDecoration: 'inherit' }}>
      {children}
    </Link>
  );
};
