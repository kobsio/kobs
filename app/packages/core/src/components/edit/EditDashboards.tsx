import { Add, Delete, Edit } from '@mui/icons-material';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  Stack,
  Switch,
  Tab,
  Tabs,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import yaml from 'js-yaml';
import { Fragment, FunctionComponent, useContext, useEffect, useMemo, useState } from 'react';
import { WidthProvider, Responsive } from 'react-grid-layout';

import { APIContext, APIError, IAPIContext } from '../../context/APIContext';
import { PluginContext } from '../../context/PluginContext';
import { IDashboard, IPanel, IPlaceholders, IPlugin, IReference, IRow, IVariable } from '../../crds/dashboard';
import { ResourcesSelectClusters } from '../resources/ResourcesSelectClusters';
import { ResourcesSelectNamespaces } from '../resources/ResourcesSelectNamespaces';
import { Editor } from '../utils/editor/Editor';
import { Toolbar, ToolbarItem } from '../utils/Toolbar';

import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

/**
 * The `AddDashboard` is used to show a modal to add a new dashboard to a application, team or user. A user can select
 * between an inline dashboard or select an existing dashboard which should be added.
 */
const AddDashboard: FunctionComponent<{
  addDashboard: (reference: IReference) => void;
  onClose: () => void;
  open: boolean;
}> = ({ open, onClose, addDashboard }) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  const apiContext = useContext<IAPIContext>(APIContext);
  const [title, setTitle] = useState('');
  const [isInline, setIsInline] = useState(true);
  const [clusters, setClusters] = useState<string[]>([]);
  const [namespaces, setNamespaces] = useState<string[]>([]);
  const [dashboard, setDashboard] = useState<IDashboard>();
  const [placeholders, setPlaceholders] = useState<IPlaceholders>({});

  const { isLoading, data } = useQuery<IDashboard[], APIError>(
    ['core/dashboards/dashboards', clusters, namespaces],
    async () => {
      if (clusters.length === 0) {
        return [];
      }

      const join = (v: string[] | undefined): string => (v && v.length > 0 ? v.join('') : '');
      const c = join(clusters.map((cluster) => `&cluster=${encodeURIComponent(cluster)}`));
      const n = join(namespaces.map((namespace) => `&namespace=${encodeURIComponent(namespace)}`));

      return apiContext.client.get<IDashboard[]>(`/api/dashboards?${c}${n}`);
    },
  );

  return (
    <Dialog open={open} onClose={onClose} fullScreen={fullScreen} maxWidth="md">
      <DialogTitle>Add Dashboard</DialogTitle>
      <DialogContent sx={{ width: '50vw' }}>
        <Stack py={2} spacing={4} direction="column">
          <ToggleButtonGroup
            size="small"
            fullWidth={true}
            value={isInline}
            exclusive={true}
            onChange={(_, value) => setIsInline(value ?? false)}
          >
            <ToggleButton sx={{ px: 4 }} value={true}>
              Inline
            </ToggleButton>
            <ToggleButton sx={{ px: 4 }} value={false}>
              Reference
            </ToggleButton>
          </ToggleButtonGroup>

          <TextField size="small" label="Title" value={title} onChange={(e) => setTitle(e.target.value)} />

          {!isInline && (
            <>
              <ResourcesSelectClusters
                disableCloseOnSelect={false}
                selectedClusters={clusters}
                selectClusters={(clusters) => setClusters(clusters)}
              />
              <ResourcesSelectNamespaces
                disableCloseOnSelect={false}
                selectedClusters={clusters}
                selectedNamespaces={namespaces}
                selectNamespaces={(namespaces) => setNamespaces(namespaces)}
              />
              <Autocomplete
                size="small"
                loading={isLoading}
                options={data ?? []}
                getOptionLabel={(option) => `${option.name} (${option.cluster} / ${option.namespace})` ?? ''}
                value={dashboard}
                onChange={(e, value) => setDashboard(value ?? undefined)}
                renderInput={(params) => <TextField {...params} label="Dashboard" placeholder="Dashboard" />}
              />
              {dashboard?.placeholders?.map((placeholder) => (
                <TextField
                  key={placeholder.name}
                  size="small"
                  label={`Placeholder: ${placeholder.name}`}
                  value={placeholder.name in placeholders ? placeholders[placeholder.name] : ''}
                  onChange={(e) => setPlaceholders({ ...placeholders, [placeholder.name]: e.target.value })}
                />
              ))}
            </>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button
          variant="contained"
          color="primary"
          size="small"
          disabled={!title || (!isInline && !dashboard)}
          onClick={
            title
              ? isInline
                ? () =>
                    addDashboard({
                      cluster: '',
                      inline: {
                        defaultTime: 'last15Minutes',
                        hideToolbar: false,
                        rows: [],
                        variables: [],
                      },
                      name: '',
                      namespace: '',
                      title: title,
                    })
                : dashboard
                  ? () =>
                      addDashboard({
                        cluster: dashboard.cluster,
                        name: dashboard.name,
                        namespace: dashboard.namespace,
                        placeholders: placeholders,
                        title: title,
                      })
                  : undefined
              : undefined
          }
        >
          Add
        </Button>
        <Button variant="outlined" size="small" onClick={onClose}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

/**
 * The `EditVariable` component is used to add, edit or delete a variable.
 */
const EditVariable: FunctionComponent<{
  onClose: () => void;
  open: boolean;
  setVariable: (variable?: IVariable) => void;
  variable: IVariable;
}> = ({ open, onClose, variable, setVariable }) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  const [name, setName] = useState(variable.name);
  const [label, setLabel] = useState(variable.label);
  const [hide, setHide] = useState(variable.hide);
  const [includeAllOption, setIncludeAllOption] = useState(variable.includeAllOption);
  const [plugin, setPlugin] = useState<string>(
    variable.plugin
      ? yaml.dump({ plugin: variable.plugin })
      : `plugin:
  cluster:
  name:
  type:
  options:`,
  );
  const [error, setError] = useState<string>('');

  const handleSave = () => {
    try {
      const parsedPlugin = yaml.load(plugin) as { plugin: IPlugin };
      setVariable({
        label: label,
        name: name,
        plugin: parsedPlugin.plugin,
      });
    } catch (err) {
      setError('Save failed');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullScreen={fullScreen} maxWidth="md">
      <DialogTitle>Edit Variable</DialogTitle>
      <DialogContent sx={{ width: '50vw' }}>
        <Stack py={2} spacing={4} direction="column">
          <TextField size="small" label="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <TextField size="small" label="Label" value={label} onChange={(e) => setLabel(e.target.value)} />
          <FormControlLabel
            control={<Switch size="small" checked={hide} onChange={(_, checked) => setHide(checked)} />}
            label="Hide"
          />
          <FormControlLabel
            control={
              <Switch size="small" checked={includeAllOption} onChange={(_, checked) => setIncludeAllOption(checked)} />
            }
            label="Include All Option"
          />
          <Box height="25vh">
            <Editor language="yaml" value={plugin} onChange={(value) => setPlugin(value)} />
          </Box>
          {error && (
            <Alert severity="error" onClose={() => setError('')}>
              {error}
            </Alert>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" color="primary" size="small" onClick={handleSave}>
          Save
        </Button>
        <Button variant="contained" color="error" size="small" onClick={() => setVariable(undefined)}>
          Delete
        </Button>
        <Button variant="outlined" size="small" onClick={onClose}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

/**
 * The `EditRow` component is used to add, edit or delete a row.
 */
const EditRow: FunctionComponent<{
  onClose: () => void;
  open: boolean;
  row: IRow;
  setRow: (row?: IRow) => void;
}> = ({ open, onClose, row, setRow }) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  const [title, setTitle] = useState(row.title);
  const [description, setDescription] = useState(row.description ?? '');
  const [condition, setCondition] = useState(row.if ?? '');
  const [autoHeight, setAutoHeight] = useState(row.autoHeight ?? false);

  return (
    <Dialog open={open} onClose={onClose} fullScreen={fullScreen} maxWidth="md">
      <DialogTitle>Edit Row</DialogTitle>
      <DialogContent sx={{ width: '50vw' }}>
        <Stack py={2} spacing={4} direction="column">
          <TextField size="small" label="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <TextField
            size="small"
            label="Description"
            multiline={true}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <TextField size="small" label="Condition" value={condition} onChange={(e) => setCondition(e.target.value)} />
          <FormControlLabel
            control={<Switch size="small" checked={autoHeight} onChange={(_, checked) => setAutoHeight(checked)} />}
            label="Auto Height"
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button
          variant="contained"
          color="primary"
          size="small"
          onClick={() =>
            setRow({
              autoHeight: autoHeight,
              description: description,
              if: condition,
              title: title,
            })
          }
        >
          Save
        </Button>
        <Button variant="contained" color="error" size="small" onClick={() => setRow(undefined)}>
          Delete
        </Button>
        <Button variant="outlined" size="small" onClick={onClose}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

/**
 * The `EditPanel` component is used to add, edit or delete a panel.
 */
const EditPanel: FunctionComponent<{
  onClose: () => void;
  open: boolean;
  panel: IPanel;
  setPanel: (panel?: IPanel) => void;
}> = ({ open, onClose, panel, setPanel }) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  const pluginContext = useContext(PluginContext);
  const [title, setTitle] = useState(panel.title);
  const [description, setDescription] = useState(panel.description);
  const [pluginType, setPluginType] = useState(panel.plugin.type);
  const [plugin, setPlugin] = useState<string>(
    panel.plugin.type
      ? yaml.dump({ plugin: panel.plugin })
      : `plugin:
  cluster:
  name:
  type:
  options:`,
  );
  const [error, setError] = useState<string>('');

  const handleSave = () => {
    try {
      const parsedPlugin = yaml.load(plugin) as { plugin: IPlugin };
      setPanel({
        description: description,
        plugin: parsedPlugin.plugin,
        title: title,
      });
    } catch (err) {
      setError('Save failed');
    }
  };

  useEffect(() => {
    if (pluginType !== panel.plugin.type) {
      const example = pluginContext.getPlugin(pluginType)?.example;
      if (example) {
        setPlugin(example);
      }
    }
  }, [panel.plugin.type, pluginContext, pluginType]);

  return (
    <Dialog open={open} onClose={onClose} fullScreen={fullScreen} maxWidth="md">
      <DialogTitle>Edit Panel</DialogTitle>
      <DialogContent sx={{ width: '50vw' }}>
        <Stack py={2} spacing={4} direction="column">
          <TextField size="small" label="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <TextField
            size="small"
            label="Description"
            multiline={true}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Autocomplete
            size="small"
            options={pluginContext.getPluginTypes()}
            getOptionLabel={(option) => option ?? ''}
            value={pluginType}
            onChange={(e, value) => setPluginType(value ?? '')}
            renderInput={(params) => <TextField {...params} label="Type" placeholder="Type" />}
          />
          <Box height="25vh">
            <Editor language="yaml" value={plugin} onChange={(value) => setPlugin(value)} />
          </Box>
          {error && (
            <Alert severity="error" onClose={() => setError('')}>
              {error}
            </Alert>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" color="primary" size="small" disabled={!plugin} onClick={handleSave}>
          Save
        </Button>
        <Button variant="contained" color="error" size="small" onClick={() => setPanel(undefined)}>
          Delete
        </Button>
        <Button variant="outlined" size="small" onClick={onClose}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

/**
 * The `DashboardGrid` component renders the grid for all the provided `panels`. The grid is used to add / edit panels
 * and to adjust the size and position of the panels.
 */
const DashboardGrid: FunctionComponent<{ panels: IPanel[]; setPanels: (panels: IPanel[]) => void }> = ({
  panels,
  setPanels,
}) => {
  const [openEditPanel, setOpenEditPanel] = useState(-1);

  const ResponsiveReactGridLayout = useMemo(() => WidthProvider(Responsive), []);

  /**
   * `onLayoutChange` is called when the user changes the position or size of a panel. To update the state we update
   * all panels with their new size / position by calling the `setPanels` function.
   */
  const onLayoutChange = (currentLayout: ReactGridLayout.Layout[], allLayouts: ReactGridLayout.Layouts) => {
    if (allLayouts.md) {
      setPanels(
        panels.map((p, i) => ({
          ...p,
          h: allLayouts.md[i].h,
          w: allLayouts.md[i].w,
          x: allLayouts.md[i].x,
          y: allLayouts.md[i].y,
        })),
      );
    }
  };

  /**
   * `handleEditPanel` applies the changes to the dashboard panel with the provided `index`. If the `index` is
   * `-2` a new panel will be added to the dashboard. If the `panel` is `undefined` the panel will be deleted.
   * If the `index` is larger than or equal `0` the panel will be updated.
   */
  const handleEditPanel = (index: number, panel?: IPanel) => {
    setOpenEditPanel(-1);

    if (index === -2) {
      if (panel) {
        setPanels([...panels, panel]);
      }
    } else {
      if (!panel) {
        setPanels(panels.filter((_, i) => i !== index));
      } else {
        setPanels(panels?.map((p, i) => (i === index ? { ...p, ...panel } : p)));
      }
    }
  };

  return (
    <>
      <ResponsiveReactGridLayout
        breakpoints={{ md: 925, sm: 600 }}
        cols={{ md: 12, sm: 1 }}
        rowHeight={32}
        margin={[16, 16]}
        containerPadding={[0, 0]}
        onLayoutChange={onLayoutChange}
      >
        {panels.map((panel, index) => (
          <div
            key={panel.title}
            data-grid={{
              h: !panel.h || panel.h < 1 ? 6 : panel.h,
              isBounded: true,
              static: false,
              w: !panel.w || panel.w < 1 ? 6 : panel.w,
              x: panel.x ?? 0,
              y: panel.y ?? 0,
            }}
          >
            <Box sx={{ backgroundColor: 'background.paper', height: '100%', p: 4 }}>
              <Typography fontWeight="bold">
                <Tooltip title={panel.description && <span style={{ whiteSpace: 'pre' }}>{panel.description}</span>}>
                  <span>{panel.title}</span>
                </Tooltip>
              </Typography>

              <Box textAlign="center" pt={10}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<Edit />}
                  onClick={() => setOpenEditPanel(index)}
                >
                  Edit
                </Button>
              </Box>
            </Box>
          </div>
        ))}
      </ResponsiveReactGridLayout>

      <Box pt={6}>
        <Button
          variant="contained"
          color="primary"
          fullWidth={true}
          startIcon={<Add />}
          onClick={() => setOpenEditPanel(-2)}
        >
          Add Panel
        </Button>
      </Box>

      {openEditPanel !== -1 && (
        <EditPanel
          open={openEditPanel !== -1}
          onClose={() => setOpenEditPanel(-1)}
          panel={
            openEditPanel < 0
              ? {
                  description: '',
                  plugin: {
                    cluster: '',
                    name: '',
                    options: {},
                    type: '',
                  },
                  title: '',
                }
              : panels[openEditPanel]
          }
          setPanel={(panel) => handleEditPanel(openEditPanel, panel)}
        />
      )}
    </>
  );
};

/**
 * The `Dashboard` component renders a single dashboard, where the user can edit variables and rows. The component is
 * also responsible for rendering a button to delete the dashboard.
 */
const Dashboard: FunctionComponent<{
  handleDeleteDashboard: () => void;
  reference: IReference;
  setReference: (reference: IReference) => void;
}> = ({ reference, setReference, handleDeleteDashboard }) => {
  const [openEditVariable, setOpenEditVariable] = useState(-1);
  const [openEditRow, setOpenEditRow] = useState(-1);

  /**
   * `handleEditVariable` applies the changes to the dashboard variable with the provided `index`. If the `index` is
   * `-2` a new variable will be added to the dashboard. If the `variable` is `undefined` the variable will be deleted.
   * If the `index` is larger than or equal `0` the variable will be updated.
   */
  const handleEditVariable = (index: number, variable?: IVariable) => {
    setOpenEditVariable(-1);

    if (index === -2) {
      if (variable) {
        setReference({
          ...reference,
          inline: { ...reference.inline, variables: [...(reference.inline?.variables ?? []), variable] },
        });
      }
    } else {
      if (!variable) {
        setReference({
          ...reference,
          inline: { ...reference.inline, variables: reference.inline?.variables?.filter((_, i) => i !== index) },
        });
      } else {
        setReference({
          ...reference,
          inline: {
            ...reference.inline,
            variables: reference.inline?.variables?.map((v, i) => (i === index ? variable : v)),
          },
        });
      }
    }
  };

  /**
   * `handleEditRow` applies the changes to the dashboard row with the provided `index`. If the `index` is
   * `-2` a new row will be added to the dashboard. If the `row` is `undefined` the row will be deleted.
   * If the `index` is larger than or equal `0` the row will be updated.
   */
  const handleEditRow = (index: number, row?: IRow) => {
    setOpenEditRow(-1);

    if (index === -2) {
      if (row) {
        setReference({
          ...reference,
          inline: { ...reference.inline, rows: [...(reference.inline?.rows ?? []), row] },
        });
      }
    } else {
      if (!row) {
        setReference({
          ...reference,
          inline: { ...reference.inline, rows: reference.inline?.rows?.filter((_, i) => i !== index) },
        });
      } else {
        setReference({
          ...reference,
          inline: {
            ...reference.inline,
            rows: reference.inline?.rows?.map((r, i) => (i === index ? { ...r, ...row } : r)),
          },
        });
      }
    }
  };

  /**
   * `setPanels` sets the panels for the row with the provided `index` to the provided `panels`.
   */
  const setPanels = (index: number, panels: IPanel[]) => {
    setReference({
      ...reference,
      inline: {
        ...reference.inline,
        rows: reference.inline?.rows?.map((r, i) => (i === index ? { ...r, panels: panels } : r)),
      },
    });
  };

  return (
    <>
      <Card sx={{ p: 4 }}>
        <Toolbar>
          {reference.inline?.variables?.map((variable, index) =>
            variable.hide ? null : (
              <ToolbarItem key={variable.name}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<Edit />}
                  onClick={() => setOpenEditVariable(index)}
                >
                  {variable.label}
                </Button>
                {openEditVariable === index && (
                  <EditVariable
                    open={openEditVariable === index}
                    onClose={() => setOpenEditVariable(-1)}
                    variable={variable}
                    setVariable={(variable) => handleEditVariable(index, variable)}
                  />
                )}
              </ToolbarItem>
            ),
          )}
          <ToolbarItem>
            <Button variant="contained" color="primary" startIcon={<Add />} onClick={() => setOpenEditVariable(-2)}>
              Add Variable
            </Button>
            {openEditVariable === -2 && (
              <EditVariable
                open={openEditVariable === -2}
                onClose={() => setOpenEditVariable(-1)}
                variable={{
                  hide: false,
                  includeAllOption: false,
                  label: '',
                  name: '',
                  plugin: {
                    cluster: '',
                    name: '',
                    options: {},
                    type: '',
                  },
                }}
                setVariable={(variable) => handleEditVariable(-2, variable)}
              />
            )}
          </ToolbarItem>

          <ToolbarItem align="right" grow={true}>
            <Button
              sx={{ ml: 3 }}
              variant="contained"
              color="error"
              startIcon={<Delete />}
              onClick={handleDeleteDashboard}
            >
              Delete Dashboard
            </Button>
          </ToolbarItem>
        </Toolbar>
      </Card>

      <Box
        pt={6}
        sx={(theme) => ({
          '.react-grid-item.react-grid-placeholder': {
            backgroundColor: 'background.paper',
          },
        })}
      >
        {reference.inline?.rows?.map((row, index) => (
          <Fragment key={index}>
            <Typography variant="h6" pb={4} pt={index === 0 ? 0 : 4}>
              <Tooltip title={row.description && <span style={{ whiteSpace: 'pre' }}>{row.description}</span>}>
                <span>{row.title}</span>
              </Tooltip>
              <IconButton
                color="inherit"
                size="small"
                sx={{ ml: row.title ? 2 : 0 }}
                onClick={() => setOpenEditRow(index)}
              >
                <Edit fontSize="small" />
              </IconButton>
              {openEditRow === index && (
                <EditRow
                  open={openEditRow === index}
                  onClose={() => setOpenEditRow(-1)}
                  row={row}
                  setRow={(row) => handleEditRow(index, row)}
                />
              )}
            </Typography>

            <DashboardGrid panels={row.panels ?? []} setPanels={(panels) => setPanels(index, panels)} />
          </Fragment>
        ))}

        <Box pt={6}>
          <Button
            variant="contained"
            color="primary"
            fullWidth={true}
            startIcon={<Add />}
            onClick={() => setOpenEditRow(-2)}
          >
            Add Row
          </Button>
          {openEditRow === -2 && (
            <EditRow
              open={openEditRow === -2}
              onClose={() => setOpenEditRow(-1)}
              row={{
                autoHeight: false,
                description: 'My Row Description',
                if: '',
                title: 'My Row Title',
              }}
              setRow={(row) => handleEditRow(-2, row)}
            />
          )}
        </Box>
      </Box>
    </>
  );
};

/**
 * The `EditDashboards` component allows a user to edit the dashboards for an application, user or team and to add new
 * dashboards or delete existing ones.
 */
const EditDashboards: FunctionComponent<{
  references: IReference[];
  setReferences: (references: IReference[]) => void;
}> = ({ references, setReferences }) => {
  const [openAddDashboard, setOpenAddDashboard] = useState<boolean>(false);
  const [selectedDashboard, setSelectedDashboard] = useState<string>(
    references && references.length > 0 ? references[0].title : '',
  );

  const handleAddDashboard = (reference: IReference) => {
    setOpenAddDashboard(false);
    setReferences([...references, reference]);
  };

  const handleEditDashboard = (index: number, reference: IReference) => {
    setReferences(references.map((r, i) => (i === index ? reference : r)));
  };

  return (
    <>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          variant="scrollable"
          scrollButtons={false}
          value={selectedDashboard}
          onChange={(_, value) =>
            value === '_add_dashboard_' ? setOpenAddDashboard(true) : setSelectedDashboard(value)
          }
        >
          {references?.map((reference) => (
            <Tab key={reference.title} label={reference.title} value={reference.title} />
          ))}
          <Tab label="Add Dashboard" value="_add_dashboard_" />
        </Tabs>
      </Box>
      {references?.map((reference, index) => (
        <Box key={reference.title} hidden={reference.title !== selectedDashboard} sx={{ pt: 6 }}>
          {reference.title === selectedDashboard && (
            <>
              {reference.inline ? (
                <Dashboard
                  reference={reference}
                  setReference={(reference) => handleEditDashboard(index, reference)}
                  handleDeleteDashboard={() => setReferences(references.filter((_, i) => i !== index))}
                />
              ) : (
                <Alert
                  severity="info"
                  action={
                    <Button
                      color="inherit"
                      size="small"
                      startIcon={<Delete />}
                      onClick={() => setReferences(references.filter((_, i) => i !== index))}
                    >
                      DELETE DASHBOARD
                    </Button>
                  }
                >
                  Dashboard can not be edited.
                </Alert>
              )}
            </>
          )}
        </Box>
      ))}

      {openAddDashboard && (
        <AddDashboard
          open={openAddDashboard}
          onClose={() => setOpenAddDashboard(false)}
          addDashboard={handleAddDashboard}
        />
      )}
    </>
  );
};

export default EditDashboards;
