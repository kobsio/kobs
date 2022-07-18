import { Flex, FlexItem } from '@patternfly/react-core';
import React from 'react';

import Details from '../Details';
import { IPluginInstance } from '@kobsio/shared';
import Team from './Team';
import TeamMembers from './TeamMembers';
import TeamRepos from './TeamRepos';

interface ITeamDetailsProps {
  slug: string;
  name: string;
  url: string;
  instance: IPluginInstance;
  close: () => void;
}

const TeamDetails: React.FunctionComponent<ITeamDetailsProps> = ({
  slug,
  name,
  url,
  instance,
  close,
}: ITeamDetailsProps) => {
  return (
    <Details title={name} link={url} instance={instance} close={close}>
      <Flex direction={{ default: 'column' }}>
        <FlexItem>
          <Team title="Details" slug={slug} instance={instance} />
        </FlexItem>
        <FlexItem>
          <TeamMembers title="Members" slug={slug} instance={instance} />
        </FlexItem>
        <FlexItem>
          <TeamRepos title="Repositories" slug={slug} instance={instance} />
        </FlexItem>
      </Flex>
    </Details>
  );
};

export default TeamDetails;
