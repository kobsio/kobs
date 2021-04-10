// apiURL is the URL, which should be used for the GRPC requests. When the React UI is served for development
// (yarn start), we are using the complete URL for the Envoy container. In production the React UI should be served via
// the same URL as the gRPC API so that we can omit the URL. The correct routing should be handled by Envoy.
export const apiURL = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:15222';

// applicationsDescription is the description, which is displayed in the UI for the Application CR. Similar to other
// resources, this should be a short description of the Application CR and for what it is used.
export const applicationsDescription = 'Applications are a Custom Resource for kobs.';

// resourcesDescription is the description, which is displayed in the UI on the resources card on the overview page
// and the resources page.
export const resourcesDescription = 'Resources are all available Kubernetes resources.';

// teamsDescription is the description, which is displayed in the UI for the Team CR,
export const teamsDescription = 'Teams are a Custom Resource for kobs.';

// applicationAnnotation is the key for the annotation, which allows a user to specify a list of applications within a
// resource
export const applicationAnnotation = 'kobs.io/applications';

// teamAnnotation is the key for the annotation, which allows a user to specify a list of teams within a resource.
export const teamAnnotation = 'kobs.io/teams';

// pluginAnnotation is the key for the annotation, which allows a user to specify a list of plugins within a resource.
export const pluginAnnotation = 'kobs.io/plugins';
