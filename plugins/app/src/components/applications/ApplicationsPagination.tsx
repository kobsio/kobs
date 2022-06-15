import { PageSection, PageSectionVariants, Pagination, PaginationVariant } from '@patternfly/react-core';
import React from 'react';
import { useQuery } from 'react-query';

import { IOptions } from './utils/interfaces';

export interface IApplicationsPagination {
  options: IOptions;
  setOptions: (data: IOptions) => void;
}

const Applications: React.FunctionComponent<IApplicationsPagination> = ({
  options,
  setOptions,
}: IApplicationsPagination) => {
  const { data } = useQuery<{ count: number }, Error>(
    [
      'app/applications/count',
      options.all,
      options.clusterIDs,
      options.external,
      options.namespaces,
      options.searchTerm,
      options.tags,
    ],
    async () => {
      const c = options.clusterIDs.map((clusterID) => `&clusterID=${encodeURIComponent(clusterID)}`);
      const n = options.clusterIDs.map((clusterID) =>
        options.namespaces.map(
          (namespace) => `&namespaceID=${encodeURIComponent(`${clusterID}/namespace/${namespace}`)}`,
        ),
      );
      const t = options.tags.map((tag) => `&tag=${encodeURIComponent(tag)}`);

      const response = await fetch(
        `/api/applications/count?all=${options.all}&external=${options.external}&searchTerm=${options.searchTerm}${
          c.length > 0 ? c.join('') : ''
        }${n.length > 0 ? n.join('') : ''}${t.length > 0 ? t.join('') : ''}`,
        {
          method: 'get',
        },
      );
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

  return (
    <PageSection
      isFilled={false}
      sticky="bottom"
      padding={{ default: 'noPadding' }}
      variant={PageSectionVariants.light}
    >
      <Pagination
        itemCount={data && data.count ? data.count : 0}
        perPage={options.perPage}
        page={options.page}
        variant={PaginationVariant.bottom}
        onSetPage={(event: React.MouseEvent | React.KeyboardEvent | MouseEvent, newPage: number): void =>
          setOptions({ ...options, page: newPage })
        }
        onPerPageSelect={(event: React.MouseEvent | React.KeyboardEvent | MouseEvent, newPerPage: number): void =>
          setOptions({ ...options, perPage: newPerPage })
        }
        onFirstClick={(event: React.SyntheticEvent<HTMLButtonElement>, newPage: number): void =>
          setOptions({ ...options, page: newPage })
        }
        onLastClick={(event: React.SyntheticEvent<HTMLButtonElement>, newPage: number): void =>
          setOptions({ ...options, page: newPage })
        }
        onNextClick={(event: React.SyntheticEvent<HTMLButtonElement>, newPage: number): void =>
          setOptions({ ...options, page: newPage })
        }
        onPreviousClick={(event: React.SyntheticEvent<HTMLButtonElement>, newPage: number): void =>
          setOptions({ ...options, page: newPage })
        }
      />
    </PageSection>
  );
};

export default Applications;
