// @NOTE: register any extra GSAP plugins here

import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

export default defineNuxtPlugin(() => {
  if (!process.client) { return }
  gsap.registerPlugin(ScrollTrigger)
})
