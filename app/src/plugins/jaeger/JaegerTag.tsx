import { Button, ButtonVariant, Popover } from '@patternfly/react-core';
import { Link, useLocation } from 'react-router-dom';
import React, { useState } from 'react';
import { PlusIcon } from '@patternfly/react-icons';

import { IKeyValue, getOptionsFromSearch } from 'plugins/jaeger/helpers';

interface IDataState {
  link: string;
  value: string | boolean | number;
}

interface IJaegerTagProps {
  name: string;
  tag: IKeyValue;
}

const JaegerTag: React.FunctionComponent<IJaegerTagProps> = ({ name, tag }: IJaegerTagProps) => {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [data, setData] = useState<IDataState>({ link: '', value: tag.value });
  const location = useLocation();

  const show = (): void => {
    const opts = getOptionsFromSearch(location.search);
    const link =
      location.pathname === `/plugins/${name}`
        ? `${location.pathname}?limit=${opts.limit}&maxDuration=${opts.maxDuration}&minDuration=${opts.minDuration}&operation=${opts.operation}&service=${opts.service}&tags=${tag.key}=${tag.value}&timeEnd=${opts.timeEnd}&timeStart=${opts.timeStart}`
        : '';

    let value = tag.value;
    if (typeof value === 'string') {
      try {
        value = JSON.stringify(JSON.parse(value), null, 2);
      } catch (err) {
        value = tag.value;
      }
    }

    setData({ link: link, value: value });
    setIsVisible(true);
  };

  return (
    <Popover
      aria-label="Tag"
      isVisible={isVisible}
      shouldOpen={show}
      shouldClose={(): void => setIsVisible(false)}
      headerContent={<div>{tag.key}</div>}
      bodyContent={
        <div>
          <div style={{ maxHeight: '200px', overflow: 'scroll', whiteSpace: 'pre' }}>{data.value}</div>
        </div>
      }
      footerContent={
        data.link ? (
          <Link to={data.link}>
            <Button variant={ButtonVariant.link} isSmall={true} isInline={true} icon={<PlusIcon />}>
              Filter
            </Button>
          </Link>
        ) : undefined
      }
    >
      <div className="pf-c-chip pf-u-ml-sm pf-u-mb-sm" style={{ cursor: 'pointer', maxWidth: '100%' }}>
        <span className="pf-c-chip__text" style={{ maxWidth: '100%' }}>
          {tag.key}: {tag.value}
        </span>
      </div>
    </Popover>
  );
};

export default JaegerTag;
