import {
  DetailsDrawer,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  IPluginInstance,
  ITimes,
  formatTimeString,
} from '@kobsio/core';
import { ExpandMore } from '@mui/icons-material';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Card,
  CardContent,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import yaml from 'js-yaml';
import { FunctionComponent, useState } from 'react';

import Editor from './Editor';
import History from './History';

import { IRelease } from '../utils/utils';

/**
 * The `Release` component is used to render a details drawer for the provided Helm release. The details contain the
 * applied values file, the history of the release and the templates used for the release.
 */
const Release: FunctionComponent<{
  instance: IPluginInstance;
  onClose: () => void;
  open: boolean;
  release: IRelease;
  times: ITimes;
}> = ({ instance, release, times, onClose, open }) => {
  const [activeTab, setActiveTab] = useState<string>('details');

  return (
    <DetailsDrawer
      size="large"
      open={open}
      onClose={onClose}
      title={release.name ?? ''}
      subtitle={`(${release.cluster} / ${release.namespace})`}
    >
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs variant="scrollable" scrollButtons={false} value={activeTab} onChange={(_, value) => setActiveTab(value)}>
          <Tab key="details" label="Details" value="details" />
          <Tab key="values" label="Values" value="values" />
          <Tab key="history" label="History" value="history" />
          <Tab key="templates" label="Templates" value="templates" />
        </Tabs>
      </Box>

      <Box key="details" hidden={activeTab !== 'details'} py={6}>
        {activeTab === 'details' && (
          <Card>
            <CardContent>
              <DescriptionList>
                {release.name && (
                  <DescriptionListGroup>
                    <DescriptionListTerm>Name</DescriptionListTerm>
                    <DescriptionListDescription>{release.name}</DescriptionListDescription>
                  </DescriptionListGroup>
                )}
                {release.namespace && (
                  <DescriptionListGroup>
                    <DescriptionListTerm>Namespace</DescriptionListTerm>
                    <DescriptionListDescription>{release.namespace}</DescriptionListDescription>
                  </DescriptionListGroup>
                )}
                {release.cluster && (
                  <DescriptionListGroup>
                    <DescriptionListTerm>Cluster</DescriptionListTerm>
                    <DescriptionListDescription>{release.cluster}</DescriptionListDescription>
                  </DescriptionListGroup>
                )}
                {release.version && (
                  <DescriptionListGroup>
                    <DescriptionListTerm>Version</DescriptionListTerm>
                    <DescriptionListDescription>{release.version}</DescriptionListDescription>
                  </DescriptionListGroup>
                )}
                {release.info?.status && (
                  <DescriptionListGroup>
                    <DescriptionListTerm>Status</DescriptionListTerm>
                    <DescriptionListDescription>{release.info.status}</DescriptionListDescription>
                  </DescriptionListGroup>
                )}
                {release.chart?.metadata?.version && (
                  <DescriptionListGroup>
                    <DescriptionListTerm>Chart Version</DescriptionListTerm>
                    <DescriptionListDescription>{release.chart.metadata.version}</DescriptionListDescription>
                  </DescriptionListGroup>
                )}
                {release.chart?.metadata?.appVersion && (
                  <DescriptionListGroup>
                    <DescriptionListTerm>App Version</DescriptionListTerm>
                    <DescriptionListDescription>{release.chart.metadata.appVersion}</DescriptionListDescription>
                  </DescriptionListGroup>
                )}
                {release.info?.description && (
                  <DescriptionListGroup>
                    <DescriptionListTerm>Description</DescriptionListTerm>
                    <DescriptionListDescription>{release.info.description}</DescriptionListDescription>
                  </DescriptionListGroup>
                )}
                {release.info?.first_deployed && (
                  <DescriptionListGroup>
                    <DescriptionListTerm>First Deployment</DescriptionListTerm>
                    <DescriptionListDescription>
                      {formatTimeString(release.info.first_deployed)}
                    </DescriptionListDescription>
                  </DescriptionListGroup>
                )}
                {release.info?.last_deployed && (
                  <DescriptionListGroup>
                    <DescriptionListTerm>Last Deployment</DescriptionListTerm>
                    <DescriptionListDescription>
                      {formatTimeString(release.info.last_deployed)}
                    </DescriptionListDescription>
                  </DescriptionListGroup>
                )}
                {release.info?.notes && (
                  <DescriptionListGroup>
                    <DescriptionListTerm>Notes</DescriptionListTerm>
                    <DescriptionListDescription>
                      <Box sx={{ whiteSpace: 'pre-wrap' }}>{release.info.notes}</Box>
                    </DescriptionListDescription>
                  </DescriptionListGroup>
                )}
              </DescriptionList>
            </CardContent>
          </Card>
        )}
      </Box>

      <Box key="values" hidden={activeTab !== 'values'} py={6}>
        {activeTab === 'values' && (
          <Box height="calc(100vh - 161px)">
            <Editor value={yaml.dump(release.config)} />
          </Box>
        )}
      </Box>

      <Box key="history" hidden={activeTab !== 'history'} py={6}>
        {activeTab === 'history' && (
          <History
            instance={instance}
            cluster={release.cluster ?? ''}
            namespace={release.namespace ?? ''}
            name={release.name ?? ''}
            times={times}
          />
        )}
      </Box>

      <Box key="templates" hidden={activeTab !== 'templates'} py={6}>
        {activeTab === 'templates' && (
          <>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography>values.yaml</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box height="300px">
                  <Editor value={yaml.dump(release.chart?.values)} />
                </Box>
              </AccordionDetails>
            </Accordion>

            {release.chart?.templates.map((template) => (
              <Accordion key={template?.name}>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography>{template?.name}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Box height="300px">
                    <Editor value={atob(template?.data ?? '')} />
                  </Box>
                </AccordionDetails>
              </Accordion>
            ))}
          </>
        )}
      </Box>
    </DetailsDrawer>
  );
};

export default Release;
