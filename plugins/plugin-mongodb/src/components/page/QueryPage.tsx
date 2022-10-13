import { Flex, FlexItem } from '@patternfly/react-core';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { IPluginInstance, PageContentSection, PageHeaderSection, PluginPageTitle } from '@kobsio/shared';
import Count from '../panel/Count';
import Find from '../panel/Find';
import { IQueryOptions } from '../../utils/interfaces';
import QueryPageToolbar from './QueryPageToolbar';
import { defaultDescription } from '../../utils/constants';
import { getInitialQueryOptions } from '../../utils/helpers';

interface IQueryPageParams extends Record<string, string | undefined> {
  collectionName?: string;
}

interface IQueryPageProps {
  instance: IPluginInstance;
}

const QueryPage: React.FunctionComponent<IQueryPageProps> = ({ instance }: IQueryPageProps) => {
  const params = useParams<IQueryPageParams>();
  const navigate = useNavigate();
  const location = useLocation();

  const [options, setOptions] = useState<IQueryOptions>();

  const changeOptions = (opts: IQueryOptions): void => {
    navigate(
      `${location.pathname}?query=${encodeURIComponent(opts.query)}&operation=${
        opts.operation
      }&sort=${encodeURIComponent(opts.sort)}&limit=${opts.limit}`,
    );
  };

  useEffect(() => {
    setOptions((prevOptions) => getInitialQueryOptions(location.search, !prevOptions));
  }, [location.search]);

  if (!options || !params.collectionName) {
    return null;
  }

  return (
    <React.Fragment>
      <PageHeaderSection
        component={
          <PluginPageTitle
            satellite={`${instance.name} / ${instance.satellite}`}
            name={params.collectionName || ''}
            description={instance.description || defaultDescription}
          />
        }
      />
      <PageContentSection
        hasPadding={true}
        hasDivider={true}
        toolbarContent={<QueryPageToolbar options={options} setOptions={changeOptions} />}
        panelContent={undefined}
      >
        <Flex direction={{ default: 'column' }}>
          <FlexItem>
            {options.operation === 'find' ? (
              <Find
                instance={instance}
                title="Results"
                collectionName={params.collectionName}
                query={options.query}
                limit={options.limit}
                sort={options.sort}
              />
            ) : options.operation === 'count' ? (
              <Count instance={instance} title="Results" collectionName={params.collectionName} query={options.query} />
            ) : (
              <div></div>
            )}
          </FlexItem>
        </Flex>
      </PageContentSection>
    </React.Fragment>
  );
};

export default QueryPage;
