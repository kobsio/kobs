import { Button, Tooltip } from '@patternfly/react-core';
import React, { useContext, useState } from 'react';
import { Td, Tr } from '@patternfly/react-table';
import ColumnsIcon from '@patternfly/react-icons/dist/esm/icons/columns-icon';
import SearchIcon from '@patternfly/react-icons/dist/esm/icons/search-icon';
import SearchMinusIcon from '@patternfly/react-icons/dist/esm/icons/search-minus-icon';
import SearchPlusIcon from '@patternfly/react-icons/dist/esm/icons/search-plus-icon';

import { Link } from 'react-router-dom';

import { AutolinkReference } from '../../utils/ResolveReference';

export interface ILogsDocumentDetailsRowProps {
  documentKey: string;
  documentValue: string;
  addFilter?: (filter: string) => void;
  selectField?: (field: { name: string }) => void;
}

const LogsDocumentDetailsRow: React.FunctionComponent<ILogsDocumentDetailsRowProps> = ({
  documentKey,
  documentValue,
  addFilter,
  selectField,
}: ILogsDocumentDetailsRowProps) => {
  const { getReferenceForField } = useContext(AutolinkReference.Context);
  const [showActions, setShowActions] = useState<boolean>(false);
  const reference = getReferenceForField(documentKey, documentValue);

  return (
    <Tr onMouseEnter={(): void => setShowActions(true)} onMouseLeave={(): void => setShowActions(false)}>
      {addFilter && selectField && (
        <Td noPadding={true} dataLabel="Actions" style={{ width: '75px' }}>
          {showActions && (
            <div>
              <Tooltip content={<div>Filter for value</div>}>
                <Button
                  style={{ padding: '0', paddingRight: '3px' }}
                  variant="plain"
                  aria-label="Filter for value"
                  isSmall={true}
                  onClick={(): void => addFilter(` _and_ ${documentKey}='${documentValue}'`)}
                >
                  <SearchPlusIcon />
                </Button>
              </Tooltip>

              <Tooltip content={<div>Filter out value</div>}>
                <Button
                  style={{ padding: '0', paddingRight: '3px' }}
                  variant="plain"
                  aria-label="Filter out value"
                  isSmall={true}
                  onClick={(): void => addFilter(` _and_ ${documentKey}!='${documentValue}'`)}
                >
                  <SearchMinusIcon />
                </Button>
              </Tooltip>

              <Tooltip content={<div>Filter for field present</div>}>
                <Button
                  style={{ padding: '0', paddingRight: '3px' }}
                  variant="plain"
                  aria-label="Filter for field present"
                  isSmall={true}
                  onClick={(): void => addFilter(` _and_ _exists_ ${documentKey}`)}
                >
                  <SearchIcon />
                </Button>
              </Tooltip>

              <Tooltip content={<div>Toggle field in table</div>}>
                <Button
                  style={{ padding: '0', paddingRight: '3px' }}
                  variant="plain"
                  aria-label="Toggle field in table"
                  isSmall={true}
                  onClick={(): void => selectField({ name: documentKey })}
                >
                  <ColumnsIcon />
                </Button>
              </Tooltip>
            </div>
          )}
        </Td>
      )}
      <Td noPadding={true} dataLabel="Key">
        <b>{documentKey}</b>
      </Td>
      <Td className="pf-u-text-wrap pf-u-text-break-word" noPadding={true} dataLabel="Value">
        <div style={{ whiteSpace: 'pre-wrap' }}>
          {reference ? <Link to={reference}>{documentValue}</Link> : documentValue}
        </div>
      </Td>
    </Tr>
  );
};

export default LogsDocumentDetailsRow;
