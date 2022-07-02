/* eslint-disable sort-keys */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import favicons from 'favicons';
import fs from 'fs';

var source = 'logo.png';

var configuration = {
  path: '/',
  appName: 'kobs',
  appShortName: 'kobs',
  appDescription: 'Kubernetes Observability Platform',
  dir: 'auto',
  lang: 'en-US',
  background: '#000000',
  theme_color: '#000000',
  appleStatusBarStyle: 'black',
  display: 'standalone',
  orientation: 'any',
  scope: '.',
  start_url: '/',
  loadManifestWithCredentials: true,
  manifestMaskable: true,
  icons: {
    android: { offset: 20, background: '#000000' },
    appleIcon: { offset: 10, background: '#000000' },
    appleStartup: { offset: 10, background: '#000000' },
    favicons: { offset: 10, background: '#000000' },
    windows: { offset: 10, background: '#000000' },
    yandex: false,
  },
  shortcuts: [
    {
      name: 'Applications',
      short_name: 'Applications',
      description: 'View your applications',
      url: '/applications',
      icon: 'applications.png',
    },
    {
      name: 'Teams',
      short_name: 'Teams',
      description: 'View your teams',
      url: '/teams',
      icon: 'teams.png',
    },
    {
      name: 'Profile',
      short_name: 'Profile',
      description: 'View your profile',
      url: '/profile',
      icon: 'profile.png',
    },
  ],
};

const callback = (error, response) => {
  if (error) {
    console.log(error.message);
    return;
  }

  // console.log(response.images);
  // console.log(response.files);
  // console.log(response.html);

  response.images.forEach((image) => {
    fs.writeFileSync(`./icons/${image.name}`, image.contents);
  });

  response.files.forEach((file) => {
    fs.writeFileSync(`./files/${file.name}`, file.contents);
  });

  fs.writeFileSync(`./files/index.html`, response.html.join('\n'));
};

favicons(source, configuration, callback);
