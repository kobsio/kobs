import { IPluginInstance, IPluginPageProps, ITimes, Page } from '@kobsio/core';
import { Box, Grid } from '@mui/material';
import { FunctionComponent } from 'react';
import { Route, Routes } from 'react-router-dom';

import { OrgPullRequests } from './org/OrgPullRequests';
import { OrgRepos } from './org/OrgRepos';

import { AuthCallback } from '../context/AuthCallback';
import { AuthContextProvider } from '../context/AuthContext';
import { description } from '../utils/utils';

const Overview: FunctionComponent<{ instance: IPluginInstance }> = ({ instance }) => {
  const times: ITimes = {
    time: 'last15Minutes',
    timeEnd: Math.floor(Date.now() / 1000),
    timeStart: Math.floor(Date.now() / 1000) - 900,
  };

  return (
    <AuthContextProvider title="" instance={instance}>
      <Grid container={true} spacing={6}>
        <Grid item={true} xs={12} md={6}>
          <Box sx={{ display: 'flex' }}>
            <OrgRepos title="Repositories" instance={instance} times={times} />
          </Box>
        </Grid>

        <Grid item={true} xs={12} md={6}>
          <Box sx={{ display: 'flex' }}>
            <OrgPullRequests title="Pull Requests" instance={instance} times={times} />
          </Box>
        </Grid>
      </Grid>
    </AuthContextProvider>
  );
};

const GithubPage: FunctionComponent<IPluginPageProps> = ({ instance }) => {
  return (
    <Page
      title={instance.name}
      subtitle={`(${instance.cluster} / ${instance.type})`}
      description={instance.description || description}
    >
      <Routes>
        <Route path="/" element={<Overview instance={instance} />} />
        <Route path="/oauth/callback" element={<AuthCallback instance={instance} />} />
      </Routes>
    </Page>
  );
};

export default GithubPage;
