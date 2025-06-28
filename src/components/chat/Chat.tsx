'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAI } from '@/contexts/AIContext';
import { useEditor } from '@/contexts/EditorContext';
import { useFileSystem } from '@/contexts/FileSystemContext';
import { getPromptForRole } from '@/services/ai/promptTemplates';
import { FiSend, FiAlertTriangle, FiChevronDown, FiChevronUp, FiCode, FiTerminal } from 'react-icons/fi';
import ReactMarkdown from 'react-markdown';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { motion, AnimatePresence } from 'framer-motion';

export function Chat() {
  const { 
    currentModel, 
    availableModels, 
    isLoading, 
    error,
    chatHistory,
    sendMessage,
    clearChatHistory
  } = useAI();
  
  const { activeFile, editorContent } = useEditor();
  const { readFile } = useFileSystem();
  
  const [message, setMessage] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [promptRole, setPromptRole] = useState('default');
  const [attachActiveFile, setAttachActiveFile] = useState(false);
  const [showSystemPrompt, setShowSystemPrompt] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Update system prompt when role changes
    setSystemPrompt(getPromptForRole(promptRole));
  }, [promptRole]);
  
  useEffect(() => {
    // Scroll to bottom of chat
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);
  
  const handleSend = async () => {
    if (!message.trim() || !currentModel) return;
    
    // Prepare files to include
    let files = null;
    if (attachActiveFile && activeFile) {
      files = [
        {
          name: activeFile.name,
          path: activeFile.path,
          content: editorContent
        }
      ];
    }
    
    await sendMessage(message, systemPrompt, files);
    setMessage('');
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  return (
    <motion.div
      className="h-full flex flex-col bg-surface glass-effect"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Chat header */}
      <div className="p-4 border-b border-border">
        <div className="flex justify-between items-center">
          <div className="text-lg font-semibold bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
            AI Assistant
          </div>
          <div className="flex items-center space-x-2">
            <motion.button
              className="p-2 text-xs bg-surface hover:bg-surface-hover rounded-lg border border-border transition-all duration-200"
              onClick={() => setShowSystemPrompt(!showSystemPrompt)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <motion.div
                animate={{ rotate: showSystemPrompt ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                {showSystemPrompt ? <FiChevronUp /> : <FiChevronDown />}
              </motion.div>
              <span className="ml-1">System Prompt</span>
            </motion.button>
            <motion.button
              className="p-2 text-xs bg-red-900/30 hover:bg-red-800/40 text-red-300 rounded-lg border border-red-700/30 transition-all duration-200"
              onClick={clearChatHistory}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Clear Chat
            </motion.button>
          </div>
        </div>
        
        {/* System prompt editor */}
        <AnimatePresence>
          {showSystemPrompt && (
            <motion.div
              className="mt-4"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm text-text-secondary">System Prompt:</label>
                <select
                  value={promptRole}
                  onChange={(e) => setPromptRole(e.target.value)}
                  className="text-xs p-2 bg-surface border border-border rounded-lg text-white"
                >
                  <option value="default">Default</option>
                  <option value="codeExplainer">Code Explainer</option>
                  <option value="codeGenerator">Code Generator</option>
                  <option value="debugger">Debugger</option>
                  <option value="securityAuditor">Security Auditor</option>
                  <option value="refactoring">Code Refactor</option>
                  <option value="testGenerator">Test Generator</option>
                </select>
              </div>
              <textarea
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                className="input-field h-32 font-mono text-sm"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {chatHistory.length === 0 ? (
          <motion.div
            className="flex flex-col items-center justify-center h-full text-text-muted"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-center space-y-4">
              <motion.div
                className="w-16 h-16 mx-auto bg-surface rounded-full flex items-center justify-center"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <FiTerminal className="text-3xl text-primary-400" />
              </motion.div>
              <div>
                <h3 className="text-xl font-semibold text-text-primary mb-2">No Messages Yet</h3>
                <p className="text-center max-w-md text-text-secondary">
                  Send a message to start chatting with the AI assistant. You can ask questions, get code explanations, or request help with debugging.
                </p>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {chatHistory.map((msg, index) => (
                <motion.div 
                  key={index} 
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <motion.div 
                    className={`max-w-3/4 rounded-xl p-4 shadow-sm glass-effect ${
                      msg.role === 'user' 
                        ? 'bg-primary-500/10 text-text-primary border border-primary-500/20' 
                        : 'bg-surface text-text-primary border border-border'
                    }`}
                    whileHover={{ scale: 1.01 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <div className="chat-message prose prose-invert prose-sm max-w-none">
                      <ReactMarkdown
                        components={{
                          code({node, inline, className, children, ...props}) {
                            const match = /language-(\w+)/.exec(className || '');
                            return !inline && match ? (
                              <SyntaxHighlighter
                                style={atomDark}
                                language={match[1]}
                                PreTag="div"
                                {...props}
                              >
                                {String(children).replace(/\n$/, '')}
                              </SyntaxHighlighter>
                            ) : (
                              <code className={className} {...props}>
                                {children}
                              </code>
                            );
                          }
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                    
                    {msg.model && (
                      <div className="mt-3 pt-2 border-t border-border/50 text-right text-xs text-text-muted">
                        <span className="bg-surface/50 px-2 py-1 rounded">
                          {msg.model}
                        </span>
                      </div>
                    )}
                  </motion.div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input area */}
      <div className="p-4 border-t border-border bg-surface/50">
        <AnimatePresence>
          {error && (
            <motion.div
              className="error-message mb-3 flex items-center"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <FiAlertTriangle className="mr-2 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </motion.div>
          )}
        </AnimatePresence>
        
        <div className="flex items-end space-x-3">
          <div className="flex-1 relative">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading || !currentModel}
              placeholder={
                !currentModel
                  ? "Select an AI model to start chatting..."
                  : isLoading
                  ? "Waiting for response..."
                  : "Type your message... (Shift+Enter for new line)"
              }
              className="input-field resize-none min-h-[44px] max-h-32"
              rows={1}
              style={{ height: 'auto' }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = Math.min(target.scrollHeight, 128) + 'px';
              }}
            />
          </div>
          <motion.button
            onClick={handleSend}
            disabled={isLoading || !currentModel || !message.trim()}
            className={`p-3 rounded-lg transition-all duration-200 ${
              isLoading || !currentModel || !message.trim()
                ? 'bg-surface text-text-muted cursor-not-allowed'
                : 'btn-primary'
            }`}
            title="Send message (Enter)"
            whileHover={{ scale: isLoading || !currentModel || !message.trim() ? 1 : 1.05 }}
            whileTap={{ scale: isLoading || !currentModel || !message.trim() ? 1 : 0.95 }}
          >
            <FiSend />
          </motion.button>
        </div>
        
        {/* Attach file option */}
        <div className="mt-3 flex items-center justify-between">
          <label className="flex items-center text-sm text-text-muted cursor-pointer hover:text-text-secondary transition-colors">
            <input
              type="checkbox"
              checked={attachActiveFile}
              onChange={() => setAttachActiveFile(!attachActiveFile)}
              disabled={!activeFile}
              className="mr-2 rounded border-border bg-surface text-primary-500 focus:ring-primary-500/20"
            />
            Attach active file to message
          </label>
          
          <AnimatePresence>
            {activeFile && attachActiveFile && (
              <motion.div
                className="flex items-center text-sm bg-surface/50 px-3 py-1 rounded-lg border border-border glass-effect"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <FiCode className="mr-2 text-primary-400" />
                <span className="text-text-secondary">{activeFile.name}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}