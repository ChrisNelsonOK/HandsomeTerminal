import { useEffect, useRef } from 'react'
import { Terminal } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import { WebLinksAddon } from '@xterm/addon-web-links'
import { SearchAddon } from '@xterm/addon-search'
import '@xterm/xterm/css/xterm.css'
import { motion } from 'framer-motion'
import { Square, Plus, Maximize2 } from 'lucide-react'
import { useTerminalStore } from '../../store/terminalStore'

const TerminalView = (): JSX.Element => {
  const terminalRef = useRef<HTMLDivElement>(null)
  const terminals = useTerminalStore((state) => state.terminals)
  const activeTab = useTerminalStore((state) => state.activeTab)
  const createTerminal = useTerminalStore((state) => state.createTerminal)
  const closeTerminal = useTerminalStore((state) => state.closeTerminal)
  const setActiveTab = useTerminalStore((state) => state.setActiveTab)
  const resizeTerminal = useTerminalStore((state) => state.resizeTerminal)

  const terminalInstances = useRef<Map<string, Terminal>>(new Map())

  useEffect(() => {
    if (terminals.length === 0) {
      createTerminal()
    }

    const instances = terminalInstances.current
    return () => {
      instances.forEach(term => term.dispose())
    }
  }, [createTerminal, terminals.length])

  useEffect(() => {
    if (!terminalRef.current) {
      return
    }

    const activeTerminal = terminals.find(t => t.id === activeTab)
    if (!activeTerminal) {
      return
    }

    let term = terminalInstances.current.get(activeTerminal.id)

    if (!term) {
      term = new Terminal({
        cursorBlink: true,
        fontSize: 14,
        fontFamily: 'JetBrains Mono, Fira Code, monospace',
        theme: {
          background: '#0a0a0a',
          foreground: '#e0e0e0',
          cursor: '#00ff88',
          black: '#000000',
          red: '#ff5c5c',
          green: '#00ff88',
          yellow: '#ffcc00',
          blue: '#00ccff',
          magenta: '#ff5cff',
          cyan: '#00ffff',
          white: '#ffffff',
          brightBlack: '#5a5a5a',
          brightRed: '#ff8080',
          brightGreen: '#55ffaa',
          brightYellow: '#ffdd55',
          brightBlue: '#55ddff',
          brightMagenta: '#ff88ff',
          brightCyan: '#55ffff',
          brightWhite: '#ffffff'
        },
        allowProposedApi: true,
        scrollback: 10000
      })

      const fitAddon = new FitAddon()
      const webLinksAddon = new WebLinksAddon()
      const searchAddon = new SearchAddon()

      term.loadAddon(fitAddon)
      term.loadAddon(webLinksAddon)
      term.loadAddon(searchAddon)

      term.open(terminalRef.current)
      fitAddon.fit()

      term.onData(data => {
        const activeTerminal = terminals.find(t => t.id === activeTab)
        if (activeTerminal && activeTerminal.write) {
          activeTerminal.write(data)
        }
      })

      terminalInstances.current.set(activeTerminal.id, term)

      const handleResize = () => {
        fitAddon.fit()
        const cols = term?.cols
        const rows = term?.rows
        if (cols && rows) {
          resizeTerminal(activeTerminal.id, cols, rows)
        }
      }

      window.addEventListener('resize', handleResize)

      if (activeTerminal.onOutput) {
        activeTerminal.onOutput((data: string) => {
          term?.write(data)
        })
      }

      return () => {
        window.removeEventListener('resize', handleResize)
      }
    }
  }, [activeTab, terminals, resizeTerminal])

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-2 bg-terminal-bgSecondary border-b border-terminal-border">
        <div className="flex items-center gap-2">
          {terminals.map((terminal) => (
            <motion.div
              key={terminal.id}
              onClick={() => setActiveTab(terminal.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 cursor-pointer ${
                terminal.id === activeTab
                  ? 'bg-terminal-accent/10 text-terminal-accent border-t-2 border-terminal-accent'
                  : 'text-terminal-textMuted hover:bg-terminal-border hover:text-terminal-text'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              role="button"
              tabIndex={0}
            >
              {terminal.title}
              {terminals.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    closeTerminal(terminal.id)
                  }}
                  className="ml-2 opacity-0 hover:opacity-100 transition-opacity"
                  aria-label="Close terminal"
                >
                  <Square size={12} />
                </button>
              )}
            </motion.div>
          ))}

          <motion.button
            onClick={() => createTerminal()}
            className="px-3 py-2 rounded-lg text-terminal-textMuted hover:bg-terminal-border hover:text-terminal-text transition-all duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="New terminal"
          >
            <Plus size={16} />
          </motion.button>
        </div>

        <div className="flex items-center gap-2">
          <motion.button
            className="p-2 rounded-lg text-terminal-textMuted hover:bg-terminal-border hover:text-terminal-text transition-all duration-200"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Maximize"
          >
            <Maximize2 size={16} />
          </motion.button>
        </div>
      </div>

      <div className="flex-1 relative">
        <div ref={terminalRef} className="absolute inset-0" />
      </div>
    </div>
  )
}

export default TerminalView
