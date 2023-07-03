import {
  APIContext,
  APIError,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Editor,
  IAPIContext,
  IPluginInstance,
  IPluginPageProps,
  ITimes,
  Page,
  pluginBasePath,
  UseQueryWrapper,
} from '@kobsio/core';
import { TechDocsMarkdown } from '@kobsio/techdocs';
import { OpenInNew } from '@mui/icons-material';
import { Card, CardContent, IconButton, Stack, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { FunctionComponent, useContext, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';

import { description, IRunbook } from '../utils/utils';

export const Runbook: FunctionComponent<{
  alert: string;
  group: string;
  instance: IPluginInstance;
  setTimes: (times: ITimes) => void;
  showActions: boolean;
  times: ITimes;
}> = ({ instance, alert, group, times, setTimes, showActions }) => {
  const apiContext = useContext<IAPIContext>(APIContext);

  const { isError, isLoading, error, data, refetch } = useQuery<IRunbook | undefined, APIError>(
    ['runbooks/runbooks', instance, alert, group],
    async () => {
      const runbooks = await apiContext.client.get<IRunbook[]>(
        `/api/plugins/runbooks/runbooks?alert=${alert}&group=${group}`,
        {
          headers: {
            'x-kobs-cluster': instance.cluster,
            'x-kobs-plugin': instance.name,
          },
        },
      );

      if (runbooks && runbooks.length === 1) {
        return runbooks[0];
      }

      return undefined;
    },
  );

  return (
    <UseQueryWrapper
      error={error}
      errorTitle="Failed to get runbook"
      isError={isError}
      isLoading={isLoading}
      isNoData={!data}
      noDataTitle="Runbook not found"
      refetch={refetch}
    >
      {data && (
        <>
          <Card sx={{ mb: 6 }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h6" pb={2} width="100%">
                  Details
                </Typography>

                {showActions && (
                  <IconButton
                    size="small"
                    style={{ margin: 0, padding: 0 }}
                    edge="end"
                    color="inherit"
                    sx={{ mr: 1 }}
                    component={Link}
                    to={`${pluginBasePath(instance)}/group/${data.group}/alert/${data.alert}`}
                  >
                    <OpenInNew />
                  </IconButton>
                )}
              </Stack>

              <DescriptionList>
                <DescriptionListGroup>
                  <DescriptionListTerm>Alert</DescriptionListTerm>
                  <DescriptionListDescription>{data.alert}</DescriptionListDescription>
                </DescriptionListGroup>
                <DescriptionListGroup>
                  <DescriptionListTerm>Group</DescriptionListTerm>
                  <DescriptionListDescription>{data.group}</DescriptionListDescription>
                </DescriptionListGroup>
                <DescriptionListGroup>
                  <DescriptionListTerm>Severity</DescriptionListTerm>
                  <DescriptionListDescription>{data.severity}</DescriptionListDescription>
                </DescriptionListGroup>
                <DescriptionListGroup>
                  <DescriptionListTerm>Expr</DescriptionListTerm>
                  <DescriptionListDescription>
                    <Editor language="promql" minimal={true} readOnly={true} value={data.expr} />
                  </DescriptionListDescription>
                </DescriptionListGroup>
                <DescriptionListGroup>
                  <DescriptionListTerm>Message</DescriptionListTerm>
                  <DescriptionListDescription>{data.message}</DescriptionListDescription>
                </DescriptionListGroup>
              </DescriptionList>
            </CardContent>
          </Card>

          <Card sx={{ mb: 6 }}>
            <CardContent>
              <Typography variant="h6" pb={2}>
                Runbook
              </Typography>

              <TechDocsMarkdown markdown={data.runbook} times={times} setTimes={setTimes} />
            </CardContent>
          </Card>
        </>
      )}
    </UseQueryWrapper>
  );
};

interface IDetailsPageParams extends Record<string, string | undefined> {
  alert?: string;
  group?: string;
}

const DetailsPage: FunctionComponent<IPluginPageProps> = ({ instance }) => {
  const params = useParams<IDetailsPageParams>();
  const [times, setTimes] = useState<ITimes>({
    time: 'last15Minutes',
    timeEnd: Math.floor(Date.now() / 1000),
    timeStart: Math.floor(Date.now() / 1000) - 900,
  });

  return (
    <Page
      title={instance.name}
      subtitle={`(${instance.cluster} / ${instance.type})`}
      description={instance.description || description}
    >
      {params.alert && params.group && (
        <Runbook
          instance={instance}
          alert={params.alert}
          group={params.group}
          times={times}
          setTimes={setTimes}
          showActions={false}
        />
      )}
    </Page>
  );
};

export default DetailsPage;
