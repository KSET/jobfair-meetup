import {
  relative,
} from "path";
import ShortUniqueId from "short-unique-id";
import normalizePath from "normalize-path";
import cssesc from "cssesc";
import {
  interpolateName,
} from "loader-utils";

import hooks from "./hooks";

// eslint-disable-next-line no-control-regex
const filenameReservedRegex = /[<>:"/\\|?*\x00-\x1F]/g;
// eslint-disable-next-line no-control-regex
const reControlChars = /[\u0000-\u001F\u0080-\u009F]/g;
const reRelativePath = /^\.+/;

const uid = new ShortUniqueId();

const identNameMap = {};

export default {
  mode: "universal",
  /*
   ** Headers of the page
   */
  head: {
    titleTemplate: "%s | JobFair MeetUP",
    meta: [
      { charset: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=0.86, maximum-scale=3.0, minimum-scale=0.86, minimal-ui" },
      { hid: "description", name: "description", content: process.env.npm_package_description || "" },
      { hid: "theme-color", name: "theme-color", content: "#00003f" },
      { hid: "background-color", name: "background-color", content: "#00003f" },
    ],
  },
  /*
   ** Set settings for the PWA metadata
   */
  pwa: {
    meta: {
      name: "JobFair MeetUP",
      description: "Ulovi karijeru dolaskom na JobFair MeetUP!",
    },
  },
  /*
   ** Customize the progress-bar color
   */
  loading: { color: "#ecb000" },
  /*
   ** Global CSS
   */
  css: [
    "~/assets/styles/global.scss",
  ],
  /*
   ** Plugins to load before mounting the App
   */
  plugins: [
    { src: "~/plugins/vue-typer", ssr: false },
    { src: "~/plugins/axios" },
    { src: "~/plugins/rich-editor", ssr: false },
    { src: "~/plugins/translation-directive" },
  ],
  /*
   ** Nuxt.js dev-modules
   */
  buildModules: [
    "@nuxtjs/eslint-module",
    "@nuxtjs/stylelint-module",
    "@nuxtjs/vuetify",
    [
      "@nuxtjs/google-analytics",
      {
        id: process.env.GOOGLE_ANALYTICS_KEY,
      },
    ],
  ],
  /*
   ** Nuxt.js modules
   */
  modules: [
    // Doc: https://axios.nuxtjs.org/usage
    "@nuxtjs/axios",
    "@nuxtjs/pwa",
    // Doc: https://github.com/nuxt-community/dotenv-module
    "@nuxtjs/dotenv",
    [ "@nuxtjs/router", { keepDefaultRouter: true } ],
    "nuxt-svg-loader",
    [ "cookie-universal-nuxt", { parseJSON: false } ],
  ],

  serverMiddleware: [
    {
      path: "/api",
      handler: "~/api/index.js",
    },
    "~/middleware/logger",
  ],
  /*
   ** Axios module configuration
   ** See https://axios.nuxtjs.org/options
   */
  axios: {},
  /*
   ** Vuetify options
   */
  vuetify: {
    defaultAssets: {
      font: {
        family: "Raleway",
      },
    },
    theme: {
      light: true,

      themes: {
        light: {
          primary: "#ecb000",
          secondary: "#00003f",
          accent: "#00003f",
        },
      },
    },
  },
  /*
   ** Build configuration
   */
  build: {
    /*
     ** You can extend webpack config here
     */
    extend(config, { isDev, isClient }) {
      if (isDev && isClient) {
        config.devtool = isClient ? "eval-source-map" : "inline-source-map";

        config.module.rules.push({
          enforce: "pre",
          test: /\.(js|vue)$/,
          loader: "eslint-loader",
          exclude: /(node_modules)|(\.svg$)/,
        });
      }
    },
    /*
     ** Update loader configurations
     */
    loaders: {
      cssModules: {
        modules: {
          localIdentName: "[path][name]__[local]",
          getLocalIdent({ resource, ...loaderContext }, localIdentName, localName, options) {
            if (!options.context) {
              // eslint-disable-next-line no-param-reassign
              options.context = loaderContext.rootContext;
            }

            const request = normalizePath(
              relative(options.context || "", loaderContext.resourcePath),
            );

            // eslint-disable-next-line no-param-reassign
            options.content = `${ options.hashPrefix + request }+${ unescape(localName) }`;

            const parsedLocalIdentName = cssesc(
              interpolateName(loaderContext, localIdentName, options)
                // For `[hash]` placeholder
                .replace(/^((-?[0-9])|--)/, "_$1")
                .replace(filenameReservedRegex, "-")
                .replace(reControlChars, "-")
                .replace(reRelativePath, "-")
                .replace(/\./g, "-"),
              { isIdentifier: true },
            ).replace(/\\\[local\\]/gi, localName);

            if (!(parsedLocalIdentName in identNameMap)) {
              const id = cssesc(uid.sequentialUUID());

              if (/^\d+/.test(id)) {
                identNameMap[parsedLocalIdentName] = `_${ id }`;
              } else {
                identNameMap[parsedLocalIdentName] = id;
              }
            }

            const className = identNameMap[parsedLocalIdentName];

            if ("production" === process.env.NODE_ENV) {
              return className;
            } else {
              return `${ parsedLocalIdentName }__${ className }`;
            }
          },
        },
      },
      vue: {
        video: [ "src", "poster" ],
        source: "src",
        img: "src",
        image: [ "xlink:href", "href" ],
        use: [ "xlink:href", "href" ],
      },
    },

    filenames: {
      app: ({ isDev }) => isDev ? "[name].js" : "[chunkhash].js",
      chunk: ({ isDev }) => isDev ? "[name].js" : "[id].[chunkhash].js",
      css: ({ isDev }) => isDev ? "[name].css" : "[contenthash].css",
      img: ({ isDev }) => isDev ? "[path][name].[ext]" : "img/[hash].[ext]",
      font: ({ isDev }) => isDev ? "[path][name].[ext]" : "fonts/[hash].[ext]",
      video: ({ isDev }) => isDev ? "[path][name].[ext]" : "videos/[hash].[ext]",
    },

    optimization: {
      concatenateModules: true,
      moduleIds: "hashed",
      splitChunks: {
        chunks: "all",
        maxAsyncRequests: 50,
        maxInitialRequests: 20,
        name: false,
      },
    },
  },

  optimizedImages: {
    optimizeImages: true,
  },

  render: {

    bundleRenderer: {

      directives: {

        translation(node, binding) {
          const { $store } = node.context;

          if (!$store) {
            return;
          }

          const translate = $store.getters["translations/translation"];
          const registerKey = (key) => $store.commit("translations/ADD_TRANSLATION_KEY", key);

          const { value: bindValue } = binding;
          const { children = [] } = node;

          const { text: elValue = "" } = children.find(({ text }) => text && 0 < text.trim().length) || {};

          const key = bindValue || elValue.trim();

          registerKey(key);

          node.data.domProps = {
            innerHTML: translate(key),
          };
        },

      },

    },

  },

  hooks: hooks(this),

};
