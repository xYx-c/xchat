import { rmSync } from 'node:fs';
import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import electron from 'vite-plugin-electron';
import renderer from 'vite-plugin-electron-renderer';
import pkg from './package.json';

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
  rmSync('dist-electron', { recursive: true, force: true });

  const isServe = command === 'serve';
  const isBuild = command === 'build';
  const sourcemap = isServe || !!process.env.VSCODE_DEBUG;

  return {
    build: {
      commonjsOptions: {
        esmExternals: true,
      },
    },
    resolve: {
      alias: {
        '@': path.join(__dirname, 'src'),
        src: path.join(__dirname, 'src'),
        utils: path.join(__dirname, 'src/utils'),
        components: path.join(__dirname, 'src/components'),
        images: path.join(__dirname, './public/images/'),
        fonts: path.join(__dirname, './public/fonts/'),
      },
    },
    plugins: [
      react({
        babel: {
          plugins: [
            ['@babel/plugin-proposal-decorators', { legacy: true }],
            ['@babel/plugin-proposal-class-properties', { loose: true }],
          ],
        },
      }),
      electron([
        {
          // Main-Process entry file of the Electron App.
          entry: 'electron/main/index.js',
          onstart(options) {
            if (process.env.VSCODE_DEBUG) {
              console.log(/* For `.vscode/.debug.script.mjs` */ '[startup] Electron App');
            } else {
              options.startup();
            }
          },
          vite: {
            build: {
              sourcemap,
              minify: isBuild,
              outDir: 'dist-electron/main',
              rollupOptions: {
                external: Object.keys('dependencies' in pkg ? pkg.dependencies : {}),
              },
            },
          },
        },
        {
          entry: 'electron/preload/index.js',
          onstart(options) {
            // Notify the Renderer-Process to reload the page when the Preload-Scripts build is complete,
            // instead of restarting the entire Electron App.
            options.reload();
          },
          vite: {
            build: {
              sourcemap: sourcemap ? 'inline' : undefined, // #332
              minify: isBuild,
              outDir: 'dist-electron/preload',
              rollupOptions: {
                external: Object.keys('dependencies' in pkg ? pkg.dependencies : {}),
              },
            },
          },
        },
      ]),
      // Use Node.js API in the Renderer-process
      renderer(),
    ],
    // server:
    //   process.env.VSCODE_DEBUG &&
    //   (() => {
    //     const url = new URL(pkg.debug.env.VITE_DEV_SERVER_URL);
    //     return {
    //       host: url.hostname,
    //       port: +url.port,
    //       proxy: {
    //         '/api': {
    //           target: 'https://login.wx.qq.com/',
    //           changeOrigin: true,
    //           rewrite: path => path.replace(/^\/api/, ''),
    //         },
    //       },
    //     };
    //   })(),
    server: {
      proxy: {
        '/api': {
          target: 'https://login.wx.qq.com/',
          changeOrigin: true,
          rewrite: path => path.replace(/^\/api/, ''),
        },
      },
    },
    clearScreen: false,
  };
});
