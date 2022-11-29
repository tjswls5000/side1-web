import { startTransition, StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { CacheProvider } from "@emotion/react"
import { RemixBrowser } from "@remix-run/react"

import { ClientStyleContext } from "~/lib/emotion/context"
import { createEmotionCache } from "~/lib/emotion/createEmotionCache"
import React from "react";

interface ClientCacheProviderProps {
  children: React.ReactNode
}

function ClientCacheProvider({ children }: ClientCacheProviderProps) {
  const [cache, setCache] = React.useState(createEmotionCache())

  function reset() {
    setCache(createEmotionCache())
  }

  return (
    <ClientStyleContext.Provider value={{ reset }}>
      <CacheProvider value={cache}>{children}</CacheProvider>
    </ClientStyleContext.Provider>
  )
}

function hydrate() {
  startTransition(() => {
    hydrateRoot(
      document,
      <ClientCacheProvider>
        <RemixBrowser />
      </ClientCacheProvider>
    );
  });
}
