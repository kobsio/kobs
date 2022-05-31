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
import { ExternalLinkAltIcon, UsersIcon } from '@patternfly/react-icons';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { QueryObserverResult, useQuery } from 'react-query';
import React, { useState } from 'react';

import { PageContentSection, PageHeaderSection } from '@kobsio/shared';
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
          <Flex direction={{ default: 'column' }}>
            <FlexItem>
              <TextContent>
                <Text component="h1">
                  {data.name}
                  <span className="pf-u-pl-sm pf-u-font-size-sm pf-u-color-400">
                    {data.topology && data.topology.external === true ? '' : `(${data.namespace} / ${data.cluster})`}
                  </span>
                </Text>
                {data.description ? <Text component="p">{data.description}</Text> : <Text component="p"></Text>}
              </TextContent>
            </FlexItem>

            {(data.tags && data.tags.length > 0) ||
            (data.teams && data.teams.length > 0) ||
            (data.links && data.links.length > 0) ? (
              <Flex>
                {data.tags && data.tags.length > 0 && (
                  <FlexItem>
                    {data.tags.map((tag) => (
                      <Label
                        key={tag}
                        className="pf-u-mr-sm"
                        color="blue"
                        render={({ className, content, componentRef }): React.ReactNode => (
                          <Link
                            to={`/applications?tag=${encodeURIComponent(tag)}`}
                            className={className}
                            ref={componentRef}
                          >
                            {content}
                          </Link>
                        )}
                      >
                        {tag}
                      </Label>
                    ))}
                  </FlexItem>
                )}

                {data.teams && data.teams.length > 0 && (
                  <FlexItem>
                    {data.teams.map((team) => (
                      <Label
                        key={team}
                        className="pf-u-mr-sm"
                        color="grey"
                        icon={<UsersIcon />}
                        render={({ className, content, componentRef }): React.ReactNode => (
                          <Link to={`/teams/${encodeURIComponent(team)}`} className={className} ref={componentRef}>
                            {content}
                          </Link>
                        )}
                      >
                        {team}
                      </Label>
                    ))}
                  </FlexItem>
                )}

                {data.links && data.links.length > 0 && (
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
                )}
              </Flex>
            ) : null}
          </Flex>
        }
      />

      <PageContentSection hasPadding={false} toolbarContent={undefined} panelContent={details}>
        {data.dashboards ? <DashboardsWrapper references={data.dashboards} setDetails={setDetails} /> : <div></div>}
      </PageContentSection>
    </React.Fragment>
  );
};

export default Application;
