// https://nuxt.com/docs/api/configuration/nuxt-config

import fs from 'fs'

const DEFAULT_SITE_URL = 'http://localhost:3000'
const EXCLUDED_SITEMAP_ROUTES = ['/404/']

export default defineNuxtConfig({
  devtools: { enabled: false },

  hooks: {
    'sitemap:generate:done' () {
      const sitemapServerPath = './.output/public/sitemap.xml'
      const sitemapStaticPath = './dist/sitemap.xml'

      if (fs.existsSync(sitemapServerPath)) {
        fs.renameSync(sitemapServerPath, sitemapStaticPath)
      }
    },
  },

  nitro: {
    preset: 'cloudflare_pages',
  },

  modern: process.env.NODE_ENV !== 'development' ? 'client' : false,

  // Global page headers (https://go.nuxtjs.dev/config-head)
  head: {
    htmlAttrs: {
      lang: 'en',
    },

    title: 'Matter',

    meta: [
      {
        charset: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        hid: 'lang',
        name: 'lang',
        content: 'en',
      },
      {
        hid: 'language',
        name: 'language',
        content: 'English',
      },
      {
        hid: 'og:site_name',
        name: 'og:site_name',
        content: 'Nuxt Scratch',
      },
      {
        hid: 'og:locale',
        name: 'og:locale',
        content: 'en_gb',
      },
      { // @TODO: remove this on go live!!!!!!!!!!!!!
        hid: 'robots',
        name: 'robots',
        content: 'noindex',
      },
    ],
    link: [
      {
        rel: 'icon',
        type: 'image/x-icon',
        href: '/favicon.ico',
      },
    ],
  },

  css: [
    '~/assets/main.scss',
  ],

  components: true,

  modules: [
    '@nuxtjs/robots',
    ['@funken-studio/sitemap-nuxt-3', { generateOnBuild: true }],
  ],

  build: {
    transpile: ['gsap'],
  },

  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },

  runtimeConfig: {
    public: {
      isDevMode: process.env.NODE_ENV === 'development',
    },
  },

  detectBrowserLanguage: {
    useCookie: false,
  },

  tailwindcss: {
    viewer: false,
  },

  sitemap: {
    hostname: process.env.SITE_URL || DEFAULT_SITE_URL,
    trailingSlash: true,
    filter: ({ routes }) => {
      return routes.filter(({ url }) => !EXCLUDED_SITEMAP_ROUTES.find(excludedRoute => url.includes(excludedRoute)))
    },
  },
})
