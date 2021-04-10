import {
  AtlassianIcon,
  BitbucketIcon,
  ExternalLinkAltIcon,
  GithubIcon,
  GitlabIcon,
  SlackIcon,
  TwitterIcon,
} from '@patternfly/react-icons';
import { Button, ButtonVariant } from '@patternfly/react-core';
import React from 'react';

interface IExternalLinkProps {
  title: string;
  link: string;
}

// ExternalLink is used to render an external link. We add the external link icon to the text and if it contains one of
// the defined domains (e.g. github.com) we add the corresponding brand icon.
const ExternalLink: React.FunctionComponent<IExternalLinkProps> = ({ title, link }: IExternalLinkProps) => {
  let icon = <ExternalLinkAltIcon />;
  if (link.includes('github.com')) icon = <GithubIcon />;
  else if (link.includes('gitlab.com')) icon = <GitlabIcon />;
  else if (link.includes('bitbucket.com')) icon = <BitbucketIcon />;
  else if (link.includes('slack.com')) icon = <SlackIcon />;
  else if (link.includes('atlassian.net')) icon = <AtlassianIcon />;
  else if (link.includes('slack.com')) icon = <SlackIcon />;
  else if (link.includes('twitter.com')) icon = <TwitterIcon />;

  return (
    <a href={link} rel="noreferrer" target="_blank">
      <Button variant={ButtonVariant.link} isInline={true} icon={icon}>
        {title}
      </Button>
    </a>
  );
};

export default ExternalLink;
