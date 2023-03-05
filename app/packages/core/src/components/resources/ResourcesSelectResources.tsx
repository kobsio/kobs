import { CheckBox, CheckBoxOutlineBlank } from '@mui/icons-material';
import { Autocomplete, Box, Checkbox, Chip, Stack, TextField } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useContext, FunctionComponent, useState, useEffect } from 'react';

import { IResource } from './utils';

import { APIContext, IAPIContext } from '../../context/APIContext';

const icon = <CheckBoxOutlineBlank fontSize="small" />;
const checkedIcon = <CheckBox fontSize="small" />;

interface IResourcesSelectResourcesInternalProps {
  loadedResources: IResource[];
  selectResources: (resources: string[]) => void;
  selectedResources: string[];
}

const ResourcesSelectResourcesInternal: FunctionComponent<IResourcesSelectResourcesInternalProps> = ({
  selectedResources,
  selectResources,
  loadedResources,
}) => {
  const [selectedResourcesInternal, setSelectedResourcesInternal] = useState<IResource[]>(() =>
    loadedResources.filter((r) => selectedResources?.includes(r.id)),
  );

  /**
   * When the value of the `selectedResourcesInternal` variable changes, we also have to change the `selectedResources`
   * via the `selectResources` function.
   */
  useEffect(() => {
    const r = selectedResourcesInternal.map((r) => r.id);
    selectResources(r);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedResourcesInternal]);

  useEffect(() => {
    if (selectedResources.length === 0) {
      setSelectedResourcesInternal([]);
    }
  }, [selectedResources]);

  return (
    <Autocomplete
      size="small"
      multiple={true}
      disableCloseOnSelect={true}
      options={loadedResources ?? []}
      getOptionLabel={(option) => option.id ?? ''}
      value={selectedResourcesInternal}
      onChange={(e, value) => setSelectedResourcesInternal(value)}
      renderTags={(value) => <Chip size="small" label={value.length} />}
      renderOption={(props, option, { selected }) => (
        <li {...props} style={{ padding: 1 }}>
          <Checkbox icon={icon} checkedIcon={checkedIcon} style={{ marginRight: 8 }} checked={selected} />
          <Stack direction="column">
            <Box component="span">{option.title}</Box>
            {option.isCRD ? (
              <Box component="span" sx={{ color: 'text.secondary' }}>
                {option.id}
              </Box>
            ) : null}
          </Stack>
        </li>
      )}
      renderInput={(params) => <TextField {...params} label="Resources" placeholder="Resources" />}
    />
  );
};

/**
 * `IResourcesSelectResourcesProps` is the interface for the `ResourcesSelectResources` component, which requires a list
 * of resources and a function to change the selected resources.
 */
interface IResourcesSelectResourcesProps {
  selectResources: (resources: string[]) => void;
  selectedResources: string[];
}

/**
 * The `ResourcesSelectResources` renders a select box, which allows a user to select a list of resources, to filter the
 * shown resources on a page. The component is also responsible for loading the resources from our API.
 */
const ResourcesSelectResources: FunctionComponent<IResourcesSelectResourcesProps> = ({
  selectedResources,
  selectResources,
}) => {
  const apiContext = useContext<IAPIContext>(APIContext);

  const { data } = useQuery<IResource[], Error>(['core/resources'], async () => {
    return apiContext.client.get<IResource[]>('/api/clusters/resources');
  });

  if (!data || data.length === 0) {
    return null;
  }

  return (
    <ResourcesSelectResourcesInternal
      selectedResources={selectedResources}
      selectResources={selectResources}
      loadedResources={data}
    />
  );
};

export default ResourcesSelectResources;
