import React, { useState, useEffect, useRef } from 'react';
import { useAI } from '../contexts/AIContext';
import { useEditor } from '../contexts/EditorContext';
import { useFileSystem } from '../contexts/FileSystemContext';
import { getPromptForRole } from '../services/ai/promptTemplates';
import { FiSend, FiAlertTriangle, FiChevronDown, FiChevronUp, FiCode, FiTerminal } from 'react-icons/fi';
import ReactMarkdown from 'react-markdown';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

const Chat = () => {
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
  
  const messagesEndRef = useRef(null);
  
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
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  return (
    <div className="h-full flex flex-col bg-surface">
      {/* Chat header */}
      <div className="p-3 border-b border-editor-line">
        <div className="flex justify-between items-center">
          <div className="text-lg font-semibold">AI Assistant</div>
          <div className="flex items-center space-x-2">
            <button
              className="p-1 text-xs bg-editor-line hover:bg-editor-line/70 rounded"
              onClick={() => setShowSystemPrompt(!showSystemPrompt)}
            >
              {showSystemPrompt ? <FiChevronUp /> : <FiChevronDown />}
              <span className="ml-1">System Prompt</span>
            </button>
            <button
              className="p-1 text-xs bg-red-900/30 hover:bg-red-800/40 text-red-300 rounded"
              onClick={clearChatHistory}
            >
              Clear Chat
            </button>
          </div>
        </div>
        
        {/* System prompt editor */}
        {showSystemPrompt && (
          <div className="mt-3">
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm text-gray-400">System Prompt:</label>
              <select
                value={promptRole}
                onChange={(e) => setPromptRole(e.target.value)}
                className="text-xs p-1 bg-editor-bg border border-editor-line rounded text-white"
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
              className="w-full h-32 p-2 bg-editor-bg border border-editor-line rounded text-sm font-mono"
            />
          </div>
        )}
      </div>
      
      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-3">
        {chatHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <FiTerminal className="text-5xl mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Messages Yet</h3>
            <p className="text-center max-w-md">
              Send a message to start chatting with the AI assistant. You can ask questions, get code explanations, or request help with debugging.
            </p>
          </div>
        ) : (
          chatHistory.map((msg, index) => (
            <div 
              key={index} 
              className={`mb-4 ${msg.role === 'user' ? 'flex justify-end' : 'flex justify-start'}`}
            >
              <div 
                className={`max-w-3/4 rounded-lg p-3 ${
                  msg.role === 'user' 
                    ? 'bg-primary/20 text-white' 
                    : 'bg-surface text-white border border-editor-line'
                }`}
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
                  <div className="mt-2 text-right text-xs text-gray-400">
                    {msg.model}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input area */}
      <div className="p-3 border-t border-editor-line">
        {error && (
          <div className="mb-2 p-2 bg-red-900/30 text-red-300 rounded-md flex items-center">
            <FiAlertTriangle className="mr-2" />
            <span className="text-sm">{error}</span>
          </div>
        )}
        
        <div className="flex items-center">
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
                  : "Type your message..."
              }
              className="w-full p-3 bg-editor-bg border border-editor-line rounded-md text-white resize-none"
              rows={3}
            />
          </div>
          <button
            onClick={handleSend}
            disabled={isLoading || !currentModel || !message.trim()}
            className={`ml-3 p-3 rounded-full ${
              isLoading || !currentModel || !message.trim()
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-primary hover:bg-primary/90 text-white'
            }`}
          >
            <FiSend />
          </button>
        </div>
        
        {/* Attach file option */}
        <div className="mt-2 flex items-center">
          <label className="flex items-center text-xs text-gray-400">
            <input
              type="checkbox"
              checked={attachActiveFile}
              onChange={() => setAttachActiveFile(!attachActiveFile)}
              disabled={!activeFile}
              className="mr-2"
            />
            Attach active file to message
          </label>
          
          {activeFile && attachActiveFile && (
            <div className="ml-2 text-xs bg-editor-bg px-2 py-1 rounded flex items-center">
              <FiCode className="mr-1" />
              {activeFile.name}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;