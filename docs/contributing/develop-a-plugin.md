# Develop a Plugin

In the following you find some instructions and recommendations which will help you to develop your own plugins for kobs.

!!! notes
    Please read the following notes, before you start with the development of your own plugins:

    - **Adding a plugin to the [kobsio/kobs](https://github.com/kobsio/kobs) repository:** When you want to create a plugin, which should be added as official plugin to the kobsio/kobs repository, [create a new issue first](https://github.com/kobsio/kobs/issues). The issue should contain a description for the plugin you want to develop and an explanation why it makes sens to add it as official plugin.
    - **Maintaining a plugin in your own repository:** If you develop a public plugin in your own repository it would be nice to add a markdown file for your plugin to the `docs/community-plugins` folder. You can also add a [`kobs-plugin`](https://github.com/topics/kobs-plugin) label so that users can find your plugin via GitHub.
    - **Private plugins:** You can also extend kobs with private plugins. More recommendations on how to maintain and use private plugins can be found in the [Using the kobsio/app](./using-the-kobsio-app.md) section of the documentation.

## Structure

Each plugin contains a backend and a frontend part. The backend part is written in Go and provides the API for the frontend. The frontend part is written in TypeScript and will become part of the React UI of kobs.

In the following we show the backend and frontend code, which is required for a plugin named `helloworld`.

### Backend Code

For each plugin you develop your should create a new Go package with the name of your plugin. In our case the package will be named `helloworld`:

```go
package helloworld
```

Each plugin should export a `Route` constant. This constant can then be used in the [plugins.go](https://github.com/kobsio/app/blob/a99f8ab1f33ee3e1fde583f45f19ed76a280f2b7/cmd/kobs/plugins/plugins.go#L92) file to mount your plugin API routes under the give route.

```go
const Route = "/helloworld"
```

If your plugin requires a configuration, which should be provided by a user via a `config.yaml` file your Go package should export a `Config` struct with all the fields a user should provide via the configuration.

This struct can then be added to the `Config` struct in the [plugins.go](https://github.com/kobsio/app/blob/a99f8ab1f33ee3e1fde583f45f19ed76a280f2b7/cmd/kobs/plugins/plugins.go#L51) file with the name of your plugin as json key, e.g. <code>HelloWorld helloworld.Config `json:"helloworld"`</code>.

```go
type Config struct {
    Name           string `json:"name"`
    DisplayName    string `json:"displayName"`
    Description    string `json:"description"`
    HelloWorldName string `json:"helloWorldName"`
}
```

Each plugin must export `chi.Router` router interface, so that the router can be mounted by kobs. To be able to use your configuration within your plugin routes we recommend, that you implement a `Router` struct. This struct should contain your configuration and each instance of your plugin (e.g. [prometheus.go](https://github.com/kobsio/kobs/blob/2132e06c91cf4f23c48f8c5914f7a3edf15d57e3/plugins/prometheus/prometheus.go#L28)).

```go
type Router struct {
    *chi.Mux
    clustersClient clusters.Client
    config   Config
}
```

With the `Router` struct you can then create your APIs as follows, where you have access to the `clustersClient`, `config`, etc.

```go
func (router *Router) getName(w http.ResponseWriter, r *http.Request) {}
```

Finally your plugin should export a `Register` function, which returns the `chi.Router` interface. This function should be used to initialize your plugin and to mount all the API routes for your plugin.

You have to add an entry to the `plugins` slice for each instance of your plugin, so that the React UI is aware of the plugin. Then you can create your `router` object, which will then be mounted under the before specified `Route`.

```go
func Register(clustersClient clusters.Client, plugins *plugin.Plugins, config Config) chi.Router {
    plugins.Append(plugin.Plugin{
        Name:        config.Name,
        DisplayName: config.DisplayName,
        Description: config.Description,
        Type:        "helloworld",
    })

    router := Router{
        chi.NewRouter(),
        clustersClient,
        config,
    }

    router.Get("/name", router.getName)

    return router
}
```

??? "Complete Go Code"

    The complete Go code for our `helloworld` plugin looks as follows:

    ```go
    package helloworld

    import (
        "net/http"

        "github.com/kobsio/kobs/pkg/api/clusters"
        "github.com/kobsio/kobs/pkg/api/middleware/errresponse"
        "github.com/kobsio/kobs/pkg/api/plugins/plugin"
        "github.com/kobsio/kobs/pkg/log"

        "github.com/go-chi/chi/v5"
        "github.com/go-chi/render"
        "go.uber.org/zap"
    )

    const Route = "/helloworld"

    type Config struct {
        Name           string `json:"name"`
        DisplayName    string `json:"displayName"`
        Description    string `json:"description"`
        HelloWorldName string `json:"helloWorldName"`
    }

    type Router struct {
        *chi.Mux
        clustersClient clusters.Client
        config   Config
    }

    // getName returns the name form the configuration.
    func (router *Router) getName(w http.ResponseWriter, r *http.Request) {
        if router.config.HelloWorldName == "" {
            log.Error(r.Context(), "Name is missing")
            errresponse.Render(w, r, nil, http.StatusInternalServerError, "Name is missing")
            return
        }

        data := struct {
            Name string `json:"name"`
        }{
            router.config.HelloWorldName,
        }

        log.Debug(r.Context(), "Get name result", zap.String("name", data.Name))
        render.JSON(w, r, data)
    }

    // Register returns a new router which can be used in the router for the kobs rest api.
    func Register(clustersClient clusters.Client, plugins *plugin.Plugins, config Config) chi.Router {
        plugins.Append(plugin.Plugin{
            Name:        config.Name,
            DisplayName: config.DisplayName,
            Description: config.Description,
            Type:        "helloworld",
        })

        router := Router{
            chi.NewRouter(),
            clustersClient,
            config,
        }

        router.Get("/name", router.getName)

        return router
    }
    ```

### Frontend Code

For each plugin you develop you should create a new NPM package, which exports the `IPluginComponents` interface with the name of your plugin as key:

```ts
export interface IPluginComponents {
  [key: string]: IPluginComponent;
}

export interface IPluginComponent {
  home?: React.FunctionComponent<IPluginPageProps>;
  icon: string;
  page?: React.FunctionComponent<IPluginPageProps>;
  panel: React.FunctionComponent<IPluginPanelProps>;
  preview?: React.FunctionComponent<IPluginPreviewProps>;
  variables?: (variable: IDashboardVariableValues, variables: IDashboardVariableValues[], times: IPluginTimes) => Promise<IDashboardVariableValues>;
}
```

In our `helloworld` example the `index.ts` file would then look as follows:

```ts
import { IPluginComponents } from '@kobsio/plugin-core';

import icon from './assets/icon.png';

import Page from './components/page/Page';
import Panel from './components/panel/Panel';

const helloworldPlugin: IPluginComponents = {
  helloworld: {
    icon: icon,
    page: Page,
    panel: Panel,
  },
};

export default helloworldPlugin;
```

As you can see each plugin should contain a `icon`, `panel` and an optional `page` component. The icon will be displayed on the plugins page of kobs, next to the `DisplayName` and `Description` specified in the Go code of the plugin.

The `panel` component is used to implement a Dashboard panel for your plugin. The component receives all the properties defined by the `IPluginPanelProps` interface.

The `options` field contains the complete JSON structure defined by a user in a Dashboard, so you should make sure to validate these options before blindly using them. The reason for this is that Kubernetes can not validate these options while a CR is applied and so the user can pass what every he wants as options.

```ts
export interface IPluginPanelProps {
  defaults: IPluginDefaults;
  times?: IPluginTimes;
  name: string;
  title: string;
  description?: string;
  pluginOptions?: IPluginDataOptions;
  options?: any;
  setDetails?: (details: React.ReactNode) => void;
}
```

??? "Example Panel"

    The following example shows a panel component for the `helloworld` plugin.

    ```ts
    import React from 'react';
    import { IPluginPanelProps, PluginOptionsMissing, PluginCard } from '@kobsio/plugin-core';

    import HelloWorld from './HelloWorld';
    import { IPanelOptions } from '../../utils/interfaces';

    interface IPanelProps extends IPluginPanelProps {
      options?: IPanelOptions;
    }

    export const Panel: React.FunctionComponent<IPanelProps> = ({ title, description, options }: IPanelProps) => {
      if (!options || !options.name) {
        return (
          <PluginOptionsMissing
            title={title}
            message="Options for Hello World panel are missing or invalid"
            details="The panel doesn't contain the required options to get hello world or the provided options are invalid."
            documentation="https://kobs.io/"
          />
        );
      }

      return (
        <PluginCard title={title} description={description}>
          <HelloWorld name={options.name} />
        </PluginCard>
      );
    };

    export default Panel;
    ```

The `page` compinent is shown when a user selects your plugin on the plugins page of kobs. The component receives all the properties defined by the `IPluginPageProps` interface.

The `options` field can be used to pass options from the Go code to the TypeScript code. These options can be set by adding a `map[string]interface{}` to the `options` field in the `plugins` slice in the Go code (e.g. [opsgenie.go](https://github.com/kobsio/kobs/blob/2132e06c91cf4f23c48f8c5914f7a3edf15d57e3/plugins/opsgenie/opsgenie.go#L330)).

```ts
export interface IPluginPageProps {
  name: string;
  displayName: string;
  description: string;
  options?: IPluginDataOptions;
}
```

??? "Example Page"

    The following example shows a page component for the `helloworld` plugin.

    ```ts
    import {
      Alert,
      AlertActionLink,
      AlertVariant,
      PageSection,
      PageSectionVariants,
      Spinner,
      Title,
    } from '@patternfly/react-core';
    import { QueryObserverResult, useQuery } from 'react-query';
    import { IPluginPageProps } from '@kobsio/plugin-core';
    import React from 'react';
    import { useHistory } from 'react-router-dom';

    import { IHelloWorld } from '../../utils/interfaces';
    import HelloWorld from '../panel/HelloWorld';

    const Page: React.FunctionComponent<IPluginPageProps> = ({ name, displayName, description }: IPluginPageProps) => {
      const history = useHistory();

      const { isError, isLoading, error, data, refetch } = useQuery<IHelloWorld, Error>(['helloworld/helloworld', name], async () => {
        try {
          const response = await fetch(`/api/plugins/${name}/name`, { method: 'get' });
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
        } catch (err) {
          throw err;
        }
      });

      return (
        <React.Fragment>
          <PageSection variant={PageSectionVariants.light}>
            <Title headingLevel="h6" size="xl">
              {displayName}
            </Title>
            <p>{description}</p>
          </PageSection>

          <PageSection style={{ height: '100%', minHeight: '100%' }} variant={PageSectionVariants.default}>
            {isLoading ? (
              <div className="pf-u-text-align-center">
                <Spinner />
              </div>
            ) : isError ? (
              <Alert
                variant={AlertVariant.danger}
                title="Could not get teams"
                actionLinks={
                  <React.Fragment>
                    <AlertActionLink onClick={(): void => history.push('/')}>Home</AlertActionLink>
                    <AlertActionLink onClick={(): Promise<QueryObserverResult<IHelloWorld, Error>> => refetch()}>
                      Retry
                    </AlertActionLink>
                  </React.Fragment>
                }
              >
                <p>{error?.message}</p>
              </Alert>
            ) : data ?
                <HelloWorld name={data.name} /> : null}
          </PageSection>
        </React.Fragment>
      );
    };

    export default Page;
    ```
