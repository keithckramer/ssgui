/// <reference types="vite/client" />

// Fallbacks in case your editor doesn't pick up vite/client for SVGs:
declare module '*.svg' {
  const src: string
  export default src
}
