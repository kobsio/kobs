import { Button, ButtonVariant } from '@patternfly/react-core';
import { ColumnsIcon, MinusIcon, PlusIcon } from '@patternfly/react-icons';
import { useHistory, useLocation } from 'react-router-dom';
import React from 'react';

import { IKeyValue, getOptionsFromSearch } from 'plugins/elasticsearch/helpers';

interface IElasticsearchLogsActionsProps {
  field: IKeyValue;
}

const ElasticsearchLogsActions: React.FunctionComponent<IElasticsearchLogsActionsProps> = ({
  field,
}: IElasticsearchLogsActionsProps) => {
  const history = useHistory();
  const location = useLocation();

  const adjustQuery = (addition: string): void => {
    const opts = getOptionsFromSearch(location.search);
    const fields = opts.fields ? opts.fields.map((field) => `&field=${field}`) : [];
    const query = `${opts.query} ${addition}`;

    history.push({
      pathname: location.pathname,
      search: `?query=${query}${fields && fields.length > 0 ? fields.join('') : ''}&timeEnd=${opts.timeEnd}&timeStart=${
        opts.timeStart
      }`,
    });
  };

  const adjustFields = (field: string): void => {
    const opts = getOptionsFromSearch(location.search);
    let tmpFields = opts.fields ? opts.fields : [];

    if (tmpFields.includes(field)) {
      tmpFields = tmpFields.filter((f) => f !== field);
    } else {
      tmpFields.push(field);
    }

    const fields = tmpFields ? tmpFields.map((field) => `&field=${field}`) : [];

    history.push({
      pathname: location.pathname,
      search: `?query=${opts.query}${fields && fields.length > 0 ? fields.join('') : ''}&timeEnd=${
        opts.timeEnd
      }&timeStart=${opts.timeStart}`,
    });
  };

  return (
    <React.Fragment>
      <Button
        style={{ fontSize: '10px', padding: '0px 6px' }}
        variant={ButtonVariant.plain}
        isSmall={true}
        aria-label="Include"
        onClick={(): void => adjustQuery(`AND ${field.key}: ${field.value}`)}
      >
        <PlusIcon />
      </Button>
      <Button
        style={{ fontSize: '10px', padding: '0px 6px' }}
        variant={ButtonVariant.plain}
        isSmall={true}
        aria-label="Exclude"
        onClick={(): void => adjustQuery(`AND NOT ${field.key}: ${field.value}`)}
      >
        <MinusIcon />
      </Button>
      <Button
        style={{ fontSize: '10px', padding: '0px 6px' }}
        variant={ButtonVariant.plain}
        isSmall={true}
        aria-label="Toggle"
        onClick={(): void => adjustFields(field.key)}
      >
        <ColumnsIcon />
      </Button>
    </React.Fragment>
  );
};

export default ElasticsearchLogsActions;
