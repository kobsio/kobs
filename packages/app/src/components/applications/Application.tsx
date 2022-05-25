import {
  Alert,
  AlertActionLink,
  AlertVariant,
  Button,
  ButtonVariant,
  Label,
  List,
  ListItem,
  ListVariant,
  Spinner,
  Text,
  TextContent,
} from '@patternfly/react-core';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { QueryObserverResult, useQuery } from 'react-query';
import React, { useState } from 'react';
import { UsersIcon } from '@patternfly/react-icons';

import { ExternalLink, PageContentSection, PageHeaderSection } from '@kobsio/shared';
import { DashboardsWrapper } from '../dashboards/DashboardsWrapper';
import { IApplication } from '../../crds/application';

interface IApplicationParams extends Record<string, string | undefined> {
  application?: string;
}

const Application: React.FunctionComponent = () => {
  const navigate = useNavigate();
  const params = useParams<IApplicationParams>();
  const [details, setDetails] = useState<React.ReactNode>(undefined);

  const { isError, isLoading, error, data, refetch } = useQuery<IApplication, Error>(
    ['app/applications/application', params.application],
    async () => {
      const response = await fetch(`/api/applications/application?id=${encodeURIComponent(params.application || '')}`, {
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
        title="Could not get application"
        actionLinks={
          <React.Fragment>
            <AlertActionLink onClick={(): void => navigate('/')}>Home</AlertActionLink>
            <AlertActionLink onClick={(): Promise<QueryObserverResult<IApplication, Error>> => refetch()}>
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
          <React.Fragment>
            <TextContent>
              <Text component="h1">
                {data.name}
                <span className="pf-u-pl-sm pf-u-font-size-sm pf-u-color-400">
                  {data.topology && data.topology.external === true ? '' : `(${data.namespace} / ${data.cluster})`}
                </span>
                {data.tags && data.tags.length > 0 && (
                  <span
                    className="pf-u-float-right"
                    style={{ fontFamily: 'RedHatText, Overpass, overpass, helvetica, arial, sans-serif' }}
                  >
                    {data.tags.map((tag) => (
                      <Label key={tag} className="pf-u-ml-sm" color="blue">
                        {tag.toLowerCase()}
                      </Label>
                    ))}
                  </span>
                )}
              </Text>
              {data.description ? <Text component="p">{data.description}</Text> : <Text component="p"></Text>}
            </TextContent>
            {(data.teams && data.teams.length > 0) || (data.links && data.links.length > 0) ? (
              <List variant={ListVariant.inline}>
                {data.teams &&
                  data.teams.length > 0 &&
                  data.teams.map((team) => (
                    <ListItem key={team}>
                      <Link to={`/teams/${encodeURIComponent(team)}`}>
                        <Button variant={ButtonVariant.link} isInline={true} icon={<UsersIcon />}>
                          {team}
                        </Button>
                      </Link>
                    </ListItem>
                  ))}

                {data.links &&
                  data.links.length > 0 &&
                  data.links.map((link, index) => (
                    <ListItem key={index}>
                      <ExternalLink title={link.title} link={link.link} />
                    </ListItem>
                  ))}
              </List>
            ) : null}
          </React.Fragment>
        }
      />

      <PageContentSection hasPadding={false} toolbarContent={undefined} panelContent={details}>
        {data.dashboards ? <DashboardsWrapper references={data.dashboards} setDetails={setDetails} /> : <div></div>}
      </PageContentSection>
    </React.Fragment>
  );
};

export default Application;
