import React, { useContext } from 'react';
import { Button } from '@patternfly/react-core';
import ExternalLinkAltIcon from '@patternfly/react-icons/dist/esm/icons/external-link-alt-icon';

import { AuthContext, IAuthContext } from '../../context/AuthContext';
import { IIssue } from '../../utils/issue';

interface IIssueDetailsLinkProps {
  issue: IIssue;
}

const IssueDetailsLink: React.FunctionComponent<IIssueDetailsLinkProps> = ({ issue }: IIssueDetailsLinkProps) => {
  const authContext = useContext<IAuthContext>(AuthContext);

  return (
    <Button
      style={{ paddingRight: 0 }}
      variant="plain"
      component={(props): React.ReactElement => (
        <a {...props} href={`${authContext.url}/browse/${issue.key}`} target="_blank" rel="noreferrer">
          <ExternalLinkAltIcon />
        </a>
      )}
    />
  );
};

export default IssueDetailsLink;
