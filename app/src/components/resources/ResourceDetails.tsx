import {
  Alert,
  AlertVariant,
  Button,
  ButtonVariant,
  Card,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  DrawerActions,
  DrawerCloseButton,
  DrawerHead,
  DrawerPanelBody,
  DrawerPanelContent,
  Tab,
  TabTitleText,
  Tabs,
} from '@patternfly/react-core';

import { ResourceOverview } from './ResourceOverview';

import React, { useContext, useState } from 'react';
import { TopologyIcon, UsersIcon } from '@patternfly/react-icons';
import { IRow } from '@patternfly/react-table';
import { JSONPath } from 'jsonpath-plus';
import { Link } from 'react-router-dom';
import yaml from 'js-yaml';

import { IPluginsContext, PluginsContext } from 'context/PluginsContext';
import { applicationAnnotation, pluginAnnotation, teamAnnotation } from 'utils/constants';
import Editor from 'components/Editor';
import { Plugin as IPlugin } from 'proto/plugins_grpc_web_pb';
import Plugin from 'components/plugins/Plugin';
import ResourceEvents from 'components/resources/ResourceEvents';
import ResourceLogs from 'components/resources/ResourceLogs';
import Title from 'components/Title';
import { plugins as pluginsDefinition } from 'utils/plugins';

// interpolate is used to replace a variable ("<< $.metadata.name >>") with the result of the JSONPath from the resource
// object. This can be used to replace a query in a plugin with the name of the resource, which has the plugins
// annotation.
// To interpolate the plugins annotation we split the string by the given start pattern ("<<"), then we split the
// results again by the end pattern (">>"). The string between these patterns is then given over to our JSONPath
// function together with the complete manifest for the resource. The result of the JSONPath function is then placed at
// the position of the placeholder. Finally we have to merge everything together.
// See: https://stackoverflow.com/a/57598892/4104109
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const interpolate = (str: string, resource: any, interpolator: string[] = ['<<', '>>']): string => {
  return str
    .split(interpolator[0])
    .map((s1, i) => {
      if (i === 0) {
        return s1;
      }

      const s2 = s1.split(interpolator[1]);
      if (s1 === s2[0]) {
        return interpolator[0] + s2[0];
      }

      if (s2.length > 1) {
        s2[0] = s2[0] ? JSONPath({ json: resource, path: s2[0].trim(), wrap: false }) : interpolator.join('');
      }

      return s2.join('');
    })
    .join('');
};

interface IApplications {
  namespace?: string;
  name: string;
}

// IResourceDetailsProps is the interface for the ResourceDetails. The component requires a resource and an function to
// close the drawer panel.
interface IResourceDetailsProps {
  resource: IRow;
  close: () => void;
}

// ResourceDetails is a drawer panel to display details for a selected resource. It displayes the name of the resource,
// namespace and cluster in the title of the drawer panel. The body contains several tabs, which displays the yaml
// representation of the resource and events, which are related to this resource.
const ResourceDetails: React.FunctionComponent<IResourceDetailsProps> = ({
  resource,
  close,
}: IResourceDetailsProps) => {
  const [activeTab, setActiveTab] = useState<string>('overview');

  const pluginsContext = useContext<IPluginsContext>(PluginsContext);

  let applications: IApplications[] = [];
  let teams: string[] = [];
  const plugins: IPlugin.AsObject[] = [];
  let applicationsError = '';
  let teamsError = '';
  let pluginsError = '';

  try {
    if (
      resource.props &&
      resource.props.metadata &&
      resource.props.metadata.annotations &&
      resource.props.metadata.annotations[applicationAnnotation]
    ) {
      applications = JSON.parse(resource.props.metadata.annotations[applicationAnnotation], resource.props);
    }
  } catch (err) {
    applicationsError = err.message;
  }

  try {
    if (
      resource.props &&
      resource.props.metadata &&
      resource.props.metadata.annotations &&
      resource.props.metadata.annotations[teamAnnotation]
    ) {
      teams = JSON.parse(resource.props.metadata.annotations[teamAnnotation], resource.props);
    }
  } catch (err) {
    teamsError = err.message;
  }

  try {
    if (
      resource.props &&
      resource.props.metadata &&
      resource.props.metadata.annotations &&
      resource.props.metadata.annotations[pluginAnnotation]
    ) {
      const parsedPlugins = JSON.parse(
        interpolate(resource.props.metadata.annotations[pluginAnnotation], resource.props),
      );

      for (const parsedPlugin of parsedPlugins) {
        if (!parsedPlugin.name) {
          throw new Error('Plugin name is missing');
        }

        const pluginDetails = pluginsContext.getPluginDetails(parsedPlugin.name);
        if (!pluginDetails) {
          throw new Error('Plugin was not found');
        }

        const plugin = pluginsDefinition[pluginDetails.type].jsonToProto(parsedPlugin);
        if (!plugin) {
          throw new Error('Could not parse plugin annotation.');
        }

        plugins.push(plugin);
      }
    }
  } catch (err) {
    pluginsError = err.message;
  }

  return (
    <DrawerPanelContent minSize="50%">
      <DrawerHead>
        <Title
          title={resource.name.title}
          subtitle={
            resource.namespace ? `${resource.namespace.title} (${resource.cluster.title})` : resource.cluster.title
          }
          size="lg"
        />
        <DrawerActions style={{ padding: 0 }}>
          <DrawerCloseButton onClose={close} />
        </DrawerActions>
      </DrawerHead>

      <DrawerPanelBody>
        <div style={{ maxWidth: '100%', padding: '0px 24px' }}>
          {applicationsError ? (
            <Alert variant={AlertVariant.danger} title="Could not parse applications annotation">
              <p>{applicationsError}</p>
            </Alert>
          ) : teamsError ? (
            <Alert variant={AlertVariant.danger} title="Could not parse teams annotation">
              <p>{teamsError}</p>
            </Alert>
          ) : applications.length > 0 || teams.length > 0 ? (
            <DescriptionList isHorizontal={true} isAutoFit={true}>
              {applications.length > 0 ? (
                <DescriptionListGroup>
                  <DescriptionListTerm>Applications</DescriptionListTerm>
                  <DescriptionListDescription>
                    {applications.map((application, index) => (
                      <Link
                        key={index}
                        to={`/applications/${resource.cluster.title}/${
                          application.namespace ? application.namespace : resource.namespace.title
                        }/${application.name}`}
                      >
                        <Button variant={ButtonVariant.link} isInline={true} icon={<TopologyIcon />}>
                          {application.name}
                        </Button>
                        <br />
                      </Link>
                    ))}
                  </DescriptionListDescription>
                </DescriptionListGroup>
              ) : null}
              {teams.length > 0 ? (
                <DescriptionListGroup>
                  <DescriptionListTerm>Teams</DescriptionListTerm>
                  <DescriptionListDescription>
                    {teams.map((team, index) => (
                      <Link key={index} to={`/teams/${team}`}>
                        <Button variant={ButtonVariant.link} isInline={true} icon={<UsersIcon />}>
                          {team}
                        </Button>
                        <br />
                      </Link>
                    ))}
                  </DescriptionListDescription>
                </DescriptionListGroup>
              ) : null}
            </DescriptionList>
          ) : null}
        </div>

        <Tabs
          activeKey={activeTab}
          onSelect={(event, tabIndex): void => setActiveTab(tabIndex.toString())}
          className="pf-u-mt-md"
          isFilled={true}
          mountOnEnter={true}
        >
          <Tab eventKey="overview" title={<TabTitleText>Overview</TabTitleText>}>
            <ResourceOverview resource={resource} />
          </Tab>
          <Tab eventKey="yaml" title={<TabTitleText>Yaml</TabTitleText>}>
            <div style={{ maxWidth: '100%', overflowX: 'scroll', padding: '24px 24px' }}>
              <Card>
                <Editor value={yaml.dump(resource.props)} mode="yaml" readOnly={true} />
              </Card>
            </div>
          </Tab>
          <Tab eventKey="events" title={<TabTitleText>Events</TabTitleText>}>
            <div style={{ maxWidth: '100%', overflowX: 'scroll', padding: '24px 24px' }}>
              <ResourceEvents
                cluster={resource.cluster.title}
                namespace={resource.namespace ? resource.namespace.title : ''}
                name={resource.name.title}
              />
            </div>
          </Tab>

          {resource.props && resource.props.apiVersion === 'v1' && resource.props.kind === 'Pod' ? (
            <Tab eventKey="logs" title={<TabTitleText>Logs</TabTitleText>}>
              <div style={{ maxWidth: '100%', overflowX: 'scroll', padding: '24px 24px' }}>
                <ResourceLogs
                  cluster={resource.cluster.title}
                  namespace={resource.namespace ? resource.namespace.title : ''}
                  name={resource.name.title}
                  pod={resource.props}
                />
              </div>
            </Tab>
          ) : null}

          {pluginsError ? (
            <Tab eventKey="plugins" title={<TabTitleText>Plugins</TabTitleText>}>
              <div style={{ maxWidth: '100%', overflowX: 'scroll', padding: '24px 24px' }}>
                <Alert variant={AlertVariant.danger} title="Could not parse plugins annotation">
                  <p>{pluginsError}</p>
                </Alert>
              </div>
            </Tab>
          ) : plugins.length > 0 ? (
            plugins.map((plugin, index) => (
              <Tab
                key={index}
                eventKey={`plugin_${index}`}
                title={<TabTitleText>{plugin.displayname ? plugin.displayname : plugin.name}</TabTitleText>}
              >
                <div style={{ maxWidth: '100%', overflowX: 'scroll', padding: '24px 24px' }}>
                  <Plugin plugin={plugin} showDetails={undefined} />
                </div>
              </Tab>
            ))
          ) : null}
        </Tabs>
      </DrawerPanelBody>
    </DrawerPanelContent>
  );
};

export default ResourceDetails;
