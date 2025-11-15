import { Link } from '@tanstack/react-router';
import { useState } from 'react';

import { Icon } from '@/components/icons';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [groupedExpanded, setGroupedExpanded] = useState<
    Record<string, boolean>
  >({});

  return (
    <>
      <header className="flex items-center bg-gray-800 p-4 text-white shadow-lg">
        <button
          aria-label="Open menu"
          className="rounded-lg p-2 transition-colors hover:bg-gray-700"
          onClick={() => setIsOpen(true)}
        >
          <Icon.Menu size="xl" />
        </button>
        <h1 className="ml-4 text-xl font-semibold">
          <Link to="/">
            <img
              alt="TanStack Logo"
              className="h-10"
              src="/tanstack-word-logo-white.svg"
            />
          </Link>
        </h1>
      </header>

      <aside
        className={`fixed top-0 left-0 z-50 flex h-full w-80 transform flex-col bg-gray-900 text-white shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-gray-700 p-4">
          <h2 className="text-xl font-bold">Navigation</h2>
          <button
            aria-label="Close menu"
            className="rounded-lg p-2 transition-colors hover:bg-gray-800"
            onClick={() => setIsOpen(false)}
          >
            <Icon.X size="xl" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4">
          <Link
            activeProps={{
              className:
                'flex items-center gap-3 p-3 rounded-lg bg-cyan-600 hover:bg-cyan-700 transition-colors mb-2',
            }}
            className="mb-2 flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-gray-800"
            to="/"
            onClick={() => setIsOpen(false)}
          >
            <Icon.Home size="lg" />
            <span className="font-medium">Home</span>
          </Link>

          {/* Demo Links Start */}

          <Link
            activeProps={{
              className:
                'flex items-center gap-3 p-3 rounded-lg bg-cyan-600 hover:bg-cyan-700 transition-colors mb-2',
            }}
            className="mb-2 flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-gray-800"
            to="/demo/start/server-funcs"
            onClick={() => setIsOpen(false)}
          >
            <Icon.SquareFunction size="lg" />
            <span className="font-medium">Start - Server Functions</span>
          </Link>

          <Link
            activeProps={{
              className:
                'flex items-center gap-3 p-3 rounded-lg bg-cyan-600 hover:bg-cyan-700 transition-colors mb-2',
            }}
            className="mb-2 flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-gray-800"
            to="/demo/start/api-request"
            onClick={() => setIsOpen(false)}
          >
            <Icon.Network size="lg" />
            <span className="font-medium">Start - API Request</span>
          </Link>

          <div className="flex flex-row justify-between">
            <Link
              activeProps={{
                className:
                  'flex-1 flex items-center gap-3 p-3 rounded-lg bg-cyan-600 hover:bg-cyan-700 transition-colors mb-2',
              }}
              className="mb-2 flex flex-1 items-center gap-3 rounded-lg p-3 transition-colors hover:bg-gray-800"
              to="/demo/start/ssr"
              onClick={() => setIsOpen(false)}
            >
              <Icon.StickyNote size="lg" />
              <span className="font-medium">Start - SSR Demos</span>
            </Link>
            <button
              className="rounded-lg p-2 transition-colors hover:bg-gray-800"
              onClick={() =>
                setGroupedExpanded((prev) => ({
                  ...prev,
                  StartSSRDemo: !prev.StartSSRDemo,
                }))
              }
            >
              {groupedExpanded.StartSSRDemo ? (
                <Icon.ChevronDown size="lg" />
              ) : (
                <Icon.ChevronRight size="lg" />
              )}
            </button>
          </div>
          {groupedExpanded.StartSSRDemo && (
            <div className="ml-4 flex flex-col">
              <Link
                activeProps={{
                  className:
                    'flex items-center gap-3 p-3 rounded-lg bg-cyan-600 hover:bg-cyan-700 transition-colors mb-2',
                }}
                className="mb-2 flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-gray-800"
                to="/demo/start/ssr/spa-mode"
                onClick={() => setIsOpen(false)}
              >
                <Icon.StickyNote size="lg" />
                <span className="font-medium">SPA Mode</span>
              </Link>

              <Link
                activeProps={{
                  className:
                    'flex items-center gap-3 p-3 rounded-lg bg-cyan-600 hover:bg-cyan-700 transition-colors mb-2',
                }}
                className="mb-2 flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-gray-800"
                to="/demo/start/ssr/full-ssr"
                onClick={() => setIsOpen(false)}
              >
                <Icon.StickyNote size="lg" />
                <span className="font-medium">Full SSR</span>
              </Link>

              <Link
                activeProps={{
                  className:
                    'flex items-center gap-3 p-3 rounded-lg bg-cyan-600 hover:bg-cyan-700 transition-colors mb-2',
                }}
                className="mb-2 flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-gray-800"
                to="/demo/start/ssr/data-only"
                onClick={() => setIsOpen(false)}
              >
                <Icon.StickyNote size="lg" />
                <span className="font-medium">Data Only</span>
              </Link>
            </div>
          )}

          <Link
            activeProps={{
              className:
                'flex items-center gap-3 p-3 rounded-lg bg-cyan-600 hover:bg-cyan-700 transition-colors mb-2',
            }}
            className="mb-2 flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-gray-800"
            to="/demo/tanstack-query"
            onClick={() => setIsOpen(false)}
          >
            <Icon.Network size="lg" />
            <span className="font-medium">TanStack Query</span>
          </Link>

          {/* Demo Links End */}
        </nav>
      </aside>
    </>
  );
}
