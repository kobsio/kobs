# Release

Before a new version of kobs can be release we have to make sure that the [changelog](https://github.com/kobsio/kobs/blob/main/CHANGELOG.md) contains all added, fixed and changed feature. When this is the case we can replace the `## Unreleased` line for the new version, e.g.

```txt
## [v0.4.0](https://github.com/kobsio/kobs/releases/tag/v0.4.0) (2021-07-14)
```

Each release entry contains a link to the GitHub release and the date, when the release was created. When we have updated the changelog we can create a new section for unreleased features.

In the last step before we can create a new tag we have to update the following files, so that they contain the correct version for the new Docker image:

- [Chart.yaml](https://github.com/kobsio/kobs/blob/main/deploy/helm/kobs/Chart.yaml): Update the `appVersion` field and bump the `version` field.
- [values.yaml](https://github.com/kobsio/kobs/blob/main/deploy/helm/kobs/values.yaml): Set the new tag in the `kobs.image.tag` value.
- [deployment.yaml](https://github.com/kobsio/kobs/blob/main/deploy/kustomize/kobs/deployment.yaml): Update the Docker image in the Kustomize deployment file.
- [helm.md](https://github.com/kobsio/kobs/blob/main/docs/installation/helm.md): Update the table with the Helm values, so that it contains the new value for the `kobs.image.tag`.

Now we can use our [Makefile](https://github.com/kobsio/kobs/blob/main/Makefile) to create a new tag:

```sh
make release-patch
make release-minor
make release-major
```

When the new tag was created we run a GitHub Action to create the new Docker image and to publish the new Helm chart version. While the GitHub Actions are running we can create a new release on GitHub, where we are using the changelog as description.

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
