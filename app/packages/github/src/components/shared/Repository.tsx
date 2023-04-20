import { DetailsDrawer, IPluginInstance, ITimes, timeDifference } from '@kobsio/core';
import { Box, ListItem, ListItemText, Tab, Tabs, Typography } from '@mui/material';
import { IssueOpenedIcon, RepoForkedIcon, StarIcon } from '@primer/octicons-react';
import { FunctionComponent, useState } from 'react';

import { languageColors } from '../../utils/languagecolors';
import { RepositoryIssues } from '../repos/RepositoryIssues';
import { RepositoryPullRequests } from '../repos/RepositoryPullRequests';
import { RepositoryWorkflowRuns } from '../repos/RepositoryWorkflowRuns';

const RepositoryDetails: FunctionComponent<{
  instance: IPluginInstance;
  onClose: () => void;
  open: boolean;
  repo: string;
  times: ITimes;
}> = ({ instance, repo, times, open, onClose }) => {
  const [activeTab, setActiveTab] = useState('issues');

  return (
    <DetailsDrawer size="large" open={open} onClose={onClose} title={repo}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs variant="scrollable" scrollButtons={false} value={activeTab} onChange={(_, value) => setActiveTab(value)}>
          <Tab key="issues" label="Issues" value="issues" />
          <Tab key="pullrequests" label="Pull Requests" value="pullrequests" />
          <Tab key="workflowruns" label="Workflow Runs" value="workflowruns" />
        </Tabs>
      </Box>

      <Box key="issues" hidden={activeTab !== 'issues'} py={6}>
        {activeTab === 'issues' && <RepositoryIssues instance={instance} title="Issues" repo={repo} times={times} />}
      </Box>

      <Box key="pullrequests" hidden={activeTab !== 'pullrequests'} py={6}>
        {activeTab === 'pullrequests' && (
          <RepositoryPullRequests instance={instance} title="Pull Requests" repo={repo} times={times} />
        )}
      </Box>

      <Box key="workflowruns" hidden={activeTab !== 'workflowruns'} py={6}>
        {activeTab === 'workflowruns' && (
          <RepositoryWorkflowRuns instance={instance} title="Workflow Runs" repo={repo} times={times} />
        )}
      </Box>
    </DetailsDrawer>
  );
};

export const Repository: FunctionComponent<{
  description: string | null;
  forksCount: number | undefined;
  instance: IPluginInstance;
  language: string | null | undefined;
  name: string;
  openIssuesCount: number | undefined;
  pushedAt: string | null | undefined;
  stargazersCount: number | undefined;
  times: ITimes;
}> = ({ instance, name, description, language, stargazersCount, forksCount, openIssuesCount, pushedAt, times }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <ListItem sx={{ cursor: 'pointer' }} onClick={() => setOpen(true)}>
        <ListItemText
          primary={<Typography variant="h6">{name}</Typography>}
          secondaryTypographyProps={{ component: 'div' }}
          secondary={
            <>
              <Typography color="text.secondary" variant="body1">
                {description}
              </Typography>

              <div>
                {language && (
                  <Box component="span" pr={4}>
                    <span
                      style={{
                        backgroundColor: languageColors[language].color
                          ? // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                            languageColors[language].color!
                          : '#000000',
                        border: '1px solid rgba(205, 217, 229, 0.2)',
                        borderRadius: '50%',
                        display: 'inline-block',
                        height: '12px',
                        position: 'relative',
                        top: '1px',
                        width: '12px',
                      }}
                    ></span>
                    <Box component="span" pl={2}>
                      {language}
                    </Box>
                  </Box>
                )}
                <Box component="span" pr={4}>
                  <span>
                    <StarIcon size={16} />
                  </span>
                  <Box component="span" pl={2}>
                    {stargazersCount || 0}
                  </Box>
                </Box>
                <Box component="span" pr={4}>
                  <span>
                    <RepoForkedIcon size={16} />
                  </span>
                  <Box component="span" pl={2}>
                    {forksCount || 0}
                  </Box>
                </Box>
                <Box component="span" pr={4}>
                  <span>
                    <IssueOpenedIcon size={16} />
                  </span>
                  <Box component="span" pl={2}>
                    {openIssuesCount || 0}
                  </Box>
                </Box>
                {pushedAt && (
                  <span>
                    {`Updated ${timeDifference(new Date().getTime(), new Date(pushedAt).getTime(), true)} ago`}
                  </span>
                )}
              </div>
            </>
          }
        />
      </ListItem>

      {open && (
        <RepositoryDetails instance={instance} repo={name} times={times} onClose={() => setOpen(false)} open={open} />
      )}
    </>
  );
};
