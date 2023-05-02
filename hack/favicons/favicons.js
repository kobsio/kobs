import favicons from 'favicons';
import fs from 'fs/promises';
import path from 'path';

const source = 'logo.png';
const dest = './favicons';
const htmlBasename = 'index.html';

const configuration = {
  path: '/',
  appName: 'kobs',
  appShortName: 'kobs',
  appDescription: 'Kubernetes Observability Platform',
  dir: 'auto',
  lang: 'en-US',
  background: '#233044',
  theme_color: '#233044',
  appleStatusBarStyle: 'black',
  display: 'standalone',
  orientation: 'any',
  scope: '.',
  start_url: '/',
  loadManifestWithCredentials: true,
  manifestMaskable: true,
  icons: {
    android: { offset: 20, background: '#233044' },
    appleIcon: { offset: 15, background: '#233044' },
    appleStartup: { offset: 15, background: '#233044' },
    favicons: { offset: 15, background: '#233044' },
    windows: { offset: 15, background: '#233044' },
    yandex: false,
  },
};

const response = await favicons(source, configuration);
await fs.mkdir(dest, { recursive: true });

await Promise.all(response.images.map(async (image) => await fs.writeFile(path.join(dest, image.name), image.contents)));
await Promise.all(response.files.map(async (file) => await fs.writeFile(path.join(dest, file.name), file.contents)));
await fs.writeFile(path.join(dest, htmlBasename), response.html.join('\n'));
