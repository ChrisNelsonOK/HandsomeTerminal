import { useState, useEffect } from 'react'
import TerminalView from './components/Terminal/TerminalView'
import Sidebar from './components/Layout/Sidebar'
import Header from './components/Layout/Header'
import AIAssistant from './components/AI/AIAssistant'
import SettingsPanel from './components/Settings/SettingsPanel'
import PluginManagerPanel from './components/Plugins/PluginManagerPanel'
import { useSettingsStore } from './store/settingsStore'

function App(): JSX.Element {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [aiPanelOpen, setAiPanelOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [pluginsOpen, setPluginsOpen] = useState(false)

  const { loadSettings } = useSettingsStore()

  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const handleToggleAI = () => {
    setAiPanelOpen(!aiPanelOpen)
  }

  const handleToggleSettings = () => {
    setSettingsOpen(!settingsOpen)
  }

  const handleTogglePlugins = () => {
    setPluginsOpen(!pluginsOpen)
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header
        onToggleSidebar={handleToggleSidebar}
        onToggleAI={handleToggleAI}
        onToggleSettings={handleToggleSettings}
        onTogglePlugins={handleTogglePlugins}
      />

      <div className="flex-1 flex overflow-hidden">
        {sidebarOpen && <Sidebar onClose={() => setSidebarOpen(false)} />}

        <main className="flex-1 flex overflow-hidden">
          <div className="flex-1 overflow-hidden">
            <TerminalView />
          </div>

          {aiPanelOpen && (
            <div className="w-96 border-l border-terminal-border flex flex-col">
              <AIAssistant onClose={() => setAiPanelOpen(false)} />
            </div>
          )}
        </main>
      </div>

      {settingsOpen && (
        <SettingsPanel onClose={() => setSettingsOpen(false)} />
      )}

      {pluginsOpen && (
        <PluginManagerPanel isOpen={pluginsOpen} onClose={() => setPluginsOpen(false)} />
      )}
    </div>
  )
}

export default App
