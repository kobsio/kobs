# Release

Before we can create a new tag we have to update the following files, so that they contain the correct version for the new Docker image:

- [hub Chart.yaml](https://github.com/kobsio/kobs/blob/main/deploy/helm/hub/Chart.yaml): Update the `appVersion` field and bump the `version` field in the Helm chart for the hub.
- [hub values.yaml](https://github.com/kobsio/kobs/blob/main/deploy/helm/hub/values.yaml): Set the new tag in the `kobs.image.tag` value in the Helm chart for the hub.
- [satellite deployment.yaml](https://github.com/kobsio/kobs/blob/main/deploy/kustomize/hub/deployment.yaml): Update the Docker image in the Kustomize deployment file for the hub.
- [satellite Chart.yaml](https://github.com/kobsio/kobs/blob/main/deploy/helm/hub/Chart.yaml): Update the `appVersion` field and bump the `version` field in the Helm chart for the hub.
- [satellite values.yaml](https://github.com/kobsio/kobs/blob/main/deploy/helm/hub/values.yaml): Set the new tag in the `kobs.image.tag` value in the Helm chart for the hub.
- [satellite deployment.yaml](https://github.com/kobsio/kobs/blob/main/deploy/kustomize/satellite/deployment.yaml): Update the Docker image in the Kustomize deployment file for the hub.
- [helm.md](https://github.com/kobsio/kobs/blob/main/docs/getting-started/installation/helm.md): Update the table with the Helm values for the hub and satellite, so that it contains the new value for the `image.tag`.

Now we can use our [Makefile](https://github.com/kobsio/kobs/blob/main/Makefile) to create a new tag:

```sh
make release-patch
make release-minor
make release-major
```

Now we can publish the created draft release, which is automatically updated by the [Release GitHub Action](https://github.com/kobsio/kobs/blob/main/.github/workflows/release.yaml). When we create the GitHub release the **Create a discussion for this release** should be checked, and the discussion should be created in the **Announcements** category.

## Publish NPM Packages

In the next step we have to publish a new version for our NPM packages. To do that we have to run the following commands, where `<version>` should be replaced with the version which was just created:

```sh
yarn build
npx lerna publish <version> --force-publish --no-changelog --no-git-tag-version --no-private --no-push
git restore .
```

!!! note
    To check if we are using the correct user to publish the packages we can run `npm whoami` and `npm adduser` to use the correct one.

    If publishing fails with a message like `lerna ERR! E402 You must sign up for private packages` we have to run `npm config set access public`.

## Publish new Templates

Once the release in the [kobsio/kobs](https://github.com/kobsio/kobs) repository was created, we have to publish a new version for our templates:

- [kobsio/app-template](https://github.com/kobsio/app-template)
- [kobsio/plugin-template](https://github.com/kobsio/plugin-template)

The version numbers used in the template should follow the versioning of the [kobsio/kobs](https://github.com/kobsio/kobs) repository.
