import { V1OwnerReference } from '@kubernetes/client-node';
import { Alert, Box, Button, Card, Chip, Tab, Tabs } from '@mui/material';
import yaml from 'js-yaml';
import { Fragment, FunctionComponent, useState } from 'react';

import Conditions from './overview/Conditions';
import CronJob from './overview/CronJob';
import DaemonSet from './overview/DaemonSet';
import Deployment from './overview/Deployment';
import Job from './overview/Job';
import Pod from './overview/Pod';
import StatefulSet from './overview/StatefulSet';
import ResourceActions from './ResourceActions';
import Resources from './Resources';
import { IResource, getSelector, getDashboards, IDashboard } from './utils';

import { timeDifference } from '../../utils/times';
import Dashboards from '../dashboards/Dashboards';
import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
} from '../utils/DescriptionList';
import { DetailsDrawer } from '../utils/DetailsDrawer';
import { Editor } from '../utils/editor/Editor';

/**
 * `IResourceOverviewProps` is the interface, which defines the properties for the `ResourceOverview` component.
 */
interface IResourceOverviewProps {
  cluster: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  manifest: any;
  name: string;
  namespace: string;
  resource: IResource;
}

/**
 * The `ResourceOverview` renders the content for the overview tab in the resource details. This includes the name,
 * namespace, cluster, labels and annotations for each resource. As well as the conditions when they are used and some
 * resource specific details, which can be found in the `overview` folder.
 */
const ResourceOverview: FunctionComponent<IResourceOverviewProps> = ({
  resource,
  cluster,
  namespace,
  name,
  manifest,
}) => {
  let additions =
    manifest && manifest.status && manifest.status.conditions && Array.isArray(manifest.status.conditions) ? (
      <Conditions conditions={manifest.status.conditions} />
    ) : null;

  if (resource.id === 'pods') {
    additions = <Pod cluster={cluster} namespace={namespace} name={name} pod={manifest} />;
  } else if (resource.id === 'deployments') {
    additions = <Deployment cluster={cluster} namespace={namespace} deployment={manifest} />;
  } else if (resource.id === 'daemonsets') {
    additions = <DaemonSet cluster={cluster} namespace={namespace} daemonSet={manifest} />;
  } else if (resource.id === 'statefulsets') {
    additions = <StatefulSet cluster={cluster} namespace={namespace} statefulSet={manifest} />;
  } else if (resource.id === 'cronjobs') {
    additions = <CronJob cronJob={manifest} />;
  } else if (resource.id === 'jobs') {
    additions = <Job cluster={cluster} namespace={namespace} job={manifest} />;
  }

  return (
    <Card sx={{ p: 4 }}>
      <DescriptionList>
        {name && (
          <DescriptionListGroup>
            <DescriptionListTerm>Name</DescriptionListTerm>
            <DescriptionListDescription>{name}</DescriptionListDescription>
          </DescriptionListGroup>
        )}
        {namespace && (
          <DescriptionListGroup>
            <DescriptionListTerm>Namespace</DescriptionListTerm>
            <DescriptionListDescription>{namespace}</DescriptionListDescription>
          </DescriptionListGroup>
        )}
        {cluster && (
          <DescriptionListGroup>
            <DescriptionListTerm>Cluster</DescriptionListTerm>
            <DescriptionListDescription>{cluster}</DescriptionListDescription>
          </DescriptionListGroup>
        )}
        {manifest?.metadata?.labels && (
          <DescriptionListGroup>
            <DescriptionListTerm>Labels</DescriptionListTerm>
            <DescriptionListDescription>
              {Object.keys(manifest?.metadata?.labels).map((key) => (
                <Chip key={key} size="small" label={`${key}: ${manifest?.metadata?.labels[key]}`} />
              ))}
            </DescriptionListDescription>
          </DescriptionListGroup>
        )}
        {manifest?.metadata?.annotations && (
          <DescriptionListGroup>
            <DescriptionListTerm>Annotations</DescriptionListTerm>
            <DescriptionListDescription>
              {Object.keys(manifest?.metadata?.annotations).map((key) => (
                <Chip key={key} size="small" label={`${key}: ${manifest?.metadata?.annotations[key]}`} />
              ))}
            </DescriptionListDescription>
          </DescriptionListGroup>
        )}
        {manifest?.metadata?.creationTimestamp && (
          <DescriptionListGroup>
            <DescriptionListTerm>Age</DescriptionListTerm>
            <DescriptionListDescription>
              {timeDifference(new Date().getTime(), new Date(manifest.metadata.creationTimestamp.toString()).getTime())}
              <Box component="span" color="text.secondary">
                ({manifest.metadata.creationTimestamp})
              </Box>
            </DescriptionListDescription>
          </DescriptionListGroup>
        )}
        {manifest?.metadata?.ownerReferences && (
          <DescriptionListGroup>
            <DescriptionListTerm>Crontrolled By</DescriptionListTerm>
            <DescriptionListDescription>
              {manifest?.metadata?.ownerReferences.map((owner: V1OwnerReference, index: number) => (
                <Fragment key={index}>
                  <Box component="span">{owner.kind}</Box>
                  <Box component="span">({owner.name})</Box>
                </Fragment>
              ))}
            </DescriptionListDescription>
          </DescriptionListGroup>
        )}

        {additions}
      </DescriptionList>
    </Card>
  );
};

/**
 * `IResourceDashboardsProps` defines the interface for the `ResourceDashboards` component.
 */
interface IResourceDashboardsProps {
  cluster: string;
  dashboards?: IDashboard[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  manifest: any;
  namespace: string;
}

/**
 * The `ResourceDashboards` component is used to display a list of dashboards within a resource. The dashboards which
 * will be displayed can be defined in the app settings or via the `kobs.io/dashboards` annotation on a resource.
 */
const ResourceDashboards: FunctionComponent<IResourceDashboardsProps> = ({
  cluster,
  namespace,
  manifest,
  dashboards,
}) => {
  const references = getDashboards(cluster, namespace, manifest, dashboards);

  if (references.length === 0) {
    return (
      <Alert
        severity="info"
        title="No dashboards found"
        action={
          <Button
            color="inherit"
            size="small"
            href="https://kobs.io/main/resources/kubernetes-resources/#dashboards"
            target="_blank"
          >
            DOCUMENTATION
          </Button>
        }
      >
        You can use dashboards within you Kubernetes resources via the <code>kobs.io/dashboards</code> annotation.
      </Alert>
    );
  }

  return <Dashboards manifest={manifest} references={references} />;
};

/**
 * `IResourceDetailsProps` is the interface for the `ResourceDetails` component.
 */
interface IResourceDetailsProps {
  cluster: string;
  dashboards?: IDashboard[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  manifest: any;
  name: string;
  namespace: string;
  onClose: () => void;
  open: boolean;
  refetch: () => void;
  resource: IResource;
}

/**
 * The `ResourceDetails` component is responsibel for providing a drawer to show some details for a selected resource.
 * It will show an overview page, the yaml file for the manifest of the resource, the events for the resource and a list
 * of dashboards if they are defined.
 *
 * For some specific resources it will also show a list of Pods which are related to the provided resource.
 */
const ResourceDetails: FunctionComponent<IResourceDetailsProps> = ({
  resource,
  cluster,
  namespace,
  name,
  manifest,
  dashboards,
  refetch,
  onClose,
  open,
}) => {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const selector = getSelector(resource, manifest);

  return (
    <DetailsDrawer
      size="large"
      open={open}
      onClose={onClose}
      title={name}
      subtitle={namespace ? `(${cluster} / ${namespace})` : `(${cluster})`}
      actions={
        <ResourceActions
          isDrawerAction={true}
          resource={resource}
          cluster={cluster}
          namespace={namespace}
          name={name}
          manifest={manifest}
          refetch={refetch}
        />
      }
    >
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs variant="scrollable" scrollButtons={false} value={activeTab} onChange={(_, value) => setActiveTab(value)}>
          <Tab key="overview" label="Overview" value="overview" />
          <Tab key="yaml" label="Yaml" value="yaml" />
          <Tab key="events" label="Events" value="events" />
          {selector || resource.id === 'nodes' ? <Tab key="pods" label="Pods" value="pods" /> : null}
          <Tab key="dashboards" label="Dashboards" value="dashboards" />
        </Tabs>
      </Box>

      <Box key="overview" hidden={activeTab !== 'overview'} py={6}>
        {activeTab === 'overview' && (
          <ResourceOverview
            resource={resource}
            cluster={cluster}
            namespace={namespace}
            name={name}
            manifest={manifest}
          />
        )}
      </Box>

      <Box key="yaml" hidden={activeTab !== 'yaml'} py={6}>
        {activeTab === 'yaml' && (
          <Box height="calc(100vh - 161px)">
            <Editor language="yaml" readOnly={true} value={yaml.dump(manifest)} />
          </Box>
        )}
      </Box>

      <Box key="events" hidden={activeTab !== 'events'} py={6}>
        {activeTab === 'events' && (
          <Resources
            options={{
              clusters: [cluster],
              namespaces: [namespace],
              param: `involvedObject.name=${name}`,
              paramName: 'fieldSelector',
              resources: ['events'],
            }}
            times={{
              time: 'last15Minutes',
              timeEnd: Math.floor(Date.now() / 1000),
              timeStart: Math.floor(Date.now() / 1000) - 900,
            }}
          />
        )}
      </Box>

      {selector || resource.id === 'nodes' ? (
        <Box key="pods" hidden={activeTab !== 'pods'} py={6}>
          {activeTab === 'pods' && (
            <Resources
              options={{
                clusters: [cluster],
                namespaces: [namespace],
                param: selector ? selector : `spec.nodeName=${manifest?.metadata?.name}`,
                paramName: selector ? 'labelSelector' : 'fieldSelector',
                resources: ['pods'],
              }}
              times={{
                time: 'last15Minutes',
                timeEnd: Math.floor(Date.now() / 1000),
                timeStart: Math.floor(Date.now() / 1000) - 900,
              }}
            />
          )}
        </Box>
      ) : null}

      <Box key="dashboards" hidden={activeTab !== 'dashboards'} py={6}>
        {activeTab === 'dashboards' && (
          <ResourceDashboards cluster={cluster} namespace={namespace} manifest={manifest} dashboards={dashboards} />
        )}
      </Box>
    </DetailsDrawer>
  );
};

export default ResourceDetails;
