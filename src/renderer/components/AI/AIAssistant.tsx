import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Sparkles, Loader2, Copy, Trash2, X } from 'lucide-react'
import { useSettingsStore } from '../../store/settingsStore'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const AIAssistant = ({ onClose }: { onClose: () => void }): JSX.Element => {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [streamingResponse, setStreamingResponse] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { activeLLMId, llmConfigs } = useSettingsStore()

  const activeConfig = activeLLMId ? llmConfigs.get(activeLLMId) : null

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, streamingResponse])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    setStreamingResponse('')

    try {
      if (!activeLLMId) {
        throw new Error('No LLM configuration found. Please configure an LLM in settings.')
      }

      const response = await window.electronAPI.llm.generate(userMessage.content, activeLLMId)

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.content,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Error: ${(error as Error).message}`,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
      setStreamingResponse('')
    }
  }

  const handleClear = () => {
    setMessages([])
  }

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content)
  }

  return (
    <div className="flex flex-col h-full bg-terminal-bgSecondary">
      <div className="p-4 border-b border-terminal-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-terminal-accent to-terminal-info flex items-center justify-center">
            <Sparkles className="text-black" size={16} />
          </div>
          <div>
            <h2 className="font-bold text-terminal-text">AI Assistant</h2>
            {activeConfig && (
              <p className="text-xs text-terminal-textMuted">
                {activeConfig.provider} - {activeConfig.model}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <motion.button
            onClick={handleClear}
            className="p-2 rounded-lg text-terminal-textMuted hover:bg-terminal-border hover:text-terminal-text transition-all duration-200"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Trash2 size={16} />
          </motion.button>
          <motion.button
            onClick={onClose}
            className="p-2 rounded-lg text-terminal-textMuted hover:bg-terminal-border hover:text-terminal-text transition-all duration-200"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <X size={16} />
          </motion.button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-lg p-3 ${
                  message.role === 'user'
                    ? 'bg-terminal-accent/10 border border-terminal-accent/30'
                    : 'bg-terminal-bg border border-terminal-border'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-xs font-medium text-terminal-textMuted">
                    {message.role === 'user' ? 'You' : 'AI'}
                  </span>
                  <span className="text-xs text-terminal-textMuted">
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-sm text-terminal-output whitespace-pre-wrap">{message.content}</p>
                {message.role === 'assistant' && (
                  <motion.button
                    onClick={() => handleCopy(message.content)}
                    className="mt-2 text-xs text-terminal-textMuted hover:text-terminal-accent transition-colors flex items-center gap-1"
                    whileHover={{ scale: 1.05 }}
                  >
                    <Copy size={12} />
                    Copy
                  </motion.button>
                )}
              </div>
            </motion.div>
          ))}

          {isLoading && streamingResponse && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="max-w-[85%] rounded-lg p-3 bg-terminal-bg border border-terminal-border">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-terminal-textMuted">AI</span>
                  <Loader2 size={12} className="animate-spin text-terminal-accent" />
                </div>
                <p className="text-sm text-terminal-output whitespace-pre-wrap">{streamingResponse}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-terminal-border">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask AI assistant..."
            className="flex-1 bg-terminal-bg border border-terminal-border rounded-lg px-4 py-2 text-terminal-text outline-none focus:border-terminal-accent transition-colors text-sm"
            disabled={isLoading || !activeLLMId}
          />
          <motion.button
            onClick={handleSend}
            disabled={!input.trim() || isLoading || !activeLLMId}
            className="px-4 py-2 bg-terminal-accent hover:bg-terminal-accentHover disabled:bg-terminal-border disabled:cursor-not-allowed text-black rounded-lg transition-all duration-200"
            whileHover={{ scale: input.trim() && !isLoading ? 1.05 : 1 }}
            whileTap={{ scale: 0.95 }}
          >
            {isLoading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Send size={16} />
            )}
          </motion.button>
        </div>
        {!activeLLMId && (
          <p className="text-xs text-terminal-warning mt-2 text-center">
            Configure an LLM in settings to use AI features
          </p>
        )}
      </div>
    </div>
  )
}

export default AIAssistant
