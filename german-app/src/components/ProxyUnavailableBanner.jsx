import { useUIStore } from '../stores/uiStore'

/**
 * Shown when the local proxy does not respond to /health on app load (NFR13).
 * Blocks no UI — AI-dependent features will fail gracefully on their own.
 */
export default function ProxyUnavailableBanner() {
  const proxyAvailable = useUIStore((s) => s.proxyAvailable)

  if (proxyAvailable !== false) return null

  return (
    <div className="flex items-center justify-between gap-4 bg-amber-50 border-b border-amber-200 px-6 py-3 text-sm">
      <div className="flex items-center gap-2 text-amber-800">
        <span className="text-base">⚠️</span>
        <span>
          <strong>Local proxy not running.</strong> AI features are unavailable. Start it with:
          <code className="ml-2 rounded bg-amber-100 px-2 py-0.5 font-mono text-xs">npm run dev:proxy</code>
        </span>
      </div>
    </div>
  )
}
