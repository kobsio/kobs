import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
} from '@patternfly/react-core';
import { ExpandableRowContent, TableComposable, TableVariant, Tbody, Td, Tr } from '@patternfly/react-table';
import React, { useState } from 'react';

import DetailsContainerGroupEvent from './DetailsContainerGroupEvent';
import { IContainer } from './interfaces';

interface IDetailsContainerGroupContainerProps {
  rowIndex: number;
  container: IContainer;
}

const DetailsContainerGroupContainer: React.FunctionComponent<IDetailsContainerGroupContainerProps> = ({
  rowIndex,
  container,
}: IDetailsContainerGroupContainerProps) => {
  const [isExpanded, setIsExpaned] = useState<boolean>(false);

  return (
    <Tbody key={rowIndex} isExpanded={isExpanded}>
      <Tr>
        <Td
          noPadding={true}
          style={{ padding: 0 }}
          expand={{
            isExpanded: isExpanded,
            onToggle: (): void => setIsExpaned(!isExpanded),
            rowIndex: rowIndex,
          }}
        />
        <Td dataLabel="Name">{container.name}</Td>
        <Td dataLabel="Restarts">{container.properties?.instanceView?.restartCount || '-'}</Td>
        <Td dataLabel="Current State">{container.properties?.instanceView?.currentState?.state || '-'}</Td>
        <Td dataLabel="Previous State">{container.properties?.instanceView?.previousState?.state || '-'}</Td>
      </Tr>
      <Tr isExpanded={isExpanded}>
        <Td colSpan={5}>
          <ExpandableRowContent>
            <DescriptionList className="pf-u-text-break-word" isHorizontal={true}>
              {container.properties?.image && (
                <DescriptionListGroup>
                  <DescriptionListTerm>Image</DescriptionListTerm>
                  <DescriptionListDescription>{container.properties?.image}</DescriptionListDescription>
                </DescriptionListGroup>
              )}
              {container.properties?.command && container.properties?.command.length > 0 && (
                <DescriptionListGroup>
                  <DescriptionListTerm>Command</DescriptionListTerm>
                  <DescriptionListDescription>{container.properties.command.join(' ')}</DescriptionListDescription>
                </DescriptionListGroup>
              )}
              {container.properties?.environmentVariables && (
                <DescriptionListGroup>
                  <DescriptionListTerm>Environment</DescriptionListTerm>
                  <DescriptionListDescription>
                    {container.properties?.environmentVariables?.map((env, index) => (
                      <div key={index}>
                        {env.name}:
                        <span className="pf-u-pl-sm pf-u-font-size-sm pf-u-color-400">
                          {env.value ? env.value : env.secureValue}
                        </span>
                      </div>
                    ))}
                  </DescriptionListDescription>
                </DescriptionListGroup>
              )}
              {container.properties?.volumeMounts && (
                <DescriptionListGroup>
                  <DescriptionListTerm>Mounts</DescriptionListTerm>
                  <DescriptionListDescription>
                    {container.properties?.volumeMounts.map((mount, index) => (
                      <div key={index}>
                        {mount.name}:
                        <span className="pf-u-pl-sm pf-u-font-size-sm pf-u-color-400">{mount.mountPath}</span>
                      </div>
                    ))}
                  </DescriptionListDescription>
                </DescriptionListGroup>
              )}
              {container.properties?.instanceView?.events && container.properties?.instanceView?.events.length > 0 && (
                <DescriptionListGroup>
                  <DescriptionListTerm>Events</DescriptionListTerm>
                  <DescriptionListDescription>
                    <TableComposable aria-label="Events" variant={TableVariant.compact} borders={true}>
                      <Tbody>
                        {container.properties?.instanceView?.events.map((event, index) => (
                          <DetailsContainerGroupEvent key={index} event={event} />
                        ))}
                      </Tbody>
                    </TableComposable>
                  </DescriptionListDescription>
                </DescriptionListGroup>
              )}
            </DescriptionList>
          </ExpandableRowContent>
        </Td>
      </Tr>
    </Tbody>
  );
};

export default DetailsContainerGroupContainer;
