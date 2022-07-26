import {
  Alert,
  AlertActionLink,
  AlertVariant,
  Flex,
  FlexItem,
  Label,
  Spinner,
  Text,
  TextContent,
} from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import ExternalLinkAltIcon from '@patternfly/react-icons/dist/esm/icons/external-link-alt-icon';
import React from 'react';

import { PageContentSection, PageHeaderSection } from '@kobsio/shared';
import { DashboardsWrapper } from '../dashboards/DashboardsWrapper';
import { ITeam } from '../../crds/team';

interface ITeamParams extends Record<string, string | undefined> {
  team?: string;
}

const Team: React.FunctionComponent = () => {
  const navigate = useNavigate();
  const params = useParams<ITeamParams>();

  const { isError, isLoading, error, data, refetch } = useQuery<ITeam, Error>(
    ['app/teams/team', params.team],
    async () => {
      const response = await fetch(`/api/teams/team?group=${encodeURIComponent(params.team || '')}`, {
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

  if (isLoading) {
    return <Spinner style={{ left: '50%', position: 'fixed', top: '50%', transform: 'translate(-50%, -50%)' }} />;
  }

  if (isError) {
    return (
      <Alert
        style={{ left: '50%', position: 'fixed', top: '50%', transform: 'translate(-50%, -50%)' }}
        variant={AlertVariant.danger}
        title="Could not get team"
        actionLinks={
          <React.Fragment>
            <AlertActionLink onClick={(): void => navigate('/')}>Home</AlertActionLink>
            <AlertActionLink onClick={(): void => navigate('/teams')}>Teams</AlertActionLink>
            <AlertActionLink onClick={(): Promise<QueryObserverResult<ITeam, Error>> => refetch()}>
              Retry
            </AlertActionLink>
          </React.Fragment>
        }
      >
        <p>{error?.message}</p>
      </Alert>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <React.Fragment>
      <PageHeaderSection
        component={
          <Flex direction={{ default: 'column' }}>
            <FlexItem>
              <TextContent>
                <Text component="h1">{data.group}</Text>
                {data.description ? <Text component="p">{data.description}</Text> : <Text component="p"></Text>}
              </TextContent>
            </FlexItem>
            {data.links && data.links.length > 0 && (
              <Flex>
                <FlexItem>
                  {data.links.map((link, index) => (
                    <Label
                      key={index}
                      className="pf-u-mr-sm"
                      color="grey"
                      icon={<ExternalLinkAltIcon />}
                      href={link.link}
                    >
                      {link.title}
                    </Label>
                  ))}
                </FlexItem>
              </Flex>
            )}
          </Flex>
        }
      />

      <PageContentSection
        hasPadding={false}
        hasDivider={data.dashboards ? false : true}
        toolbarContent={undefined}
        panelContent={undefined}
      >
        {data.dashboards ? (
          <DashboardsWrapper manifest={data} references={data.dashboards} useDrawer={true} />
        ) : (
          <div></div>
        )}
      </PageContentSection>
    </React.Fragment>
  );
};

export default Team;
