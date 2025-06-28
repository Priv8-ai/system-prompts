'use client';

import React, { useState } from 'react';
import { useAI } from '@/contexts/AIContext';
import { useEditor } from '@/contexts/EditorContext';
import { FiSave, FiRefreshCw, FiCheckCircle, FiPlus, FiTrash2, FiEye, FiSettings } from 'react-icons/fi';
import { Layout } from '@/components/layout/Layout';
import { motion, AnimatePresence } from 'framer-motion';

export function SettingsPage() {
  const { 
    modelProviders, 
    updateProvider, 
    refreshModels,
    isLoading 
  } = useAI();
  
  const {
    editorOptions,
    editorTheme,
    customThemes,
    updateEditorOptions,
    updateEditorTheme,
    addCustomTheme,
    updateCustomTheme,
    deleteCustomTheme
  } = useEditor();
  
  const [providers, setProviders] = useState(modelProviders);
  const [options, setOptions] = useState(editorOptions);
  const [theme, setTheme] = useState(editorTheme);
  const [saved, setSaved] = useState(false);
  const [newTheme, setNewTheme] = useState({
    id: '',
    name: '',
    base: 'vs-dark',
    colors: {
      'editor.background': '#1e1e1e',
      'editor.foreground': '#d4d4d4',
      'editorLineNumber.foreground': '#858585',
      'editor.selectionBackground': '#264f78',
      'editor.lineHighlightBackground': '#2d2d30'
    }
  });
  const [showNewThemeForm, setShowNewThemeForm] = useState(false);
  const [editingTheme, setEditingTheme] = useState<any>(null);

  const handleProviderChange = (providerId: string, field: string, value: any) => {
    setProviders(prevProviders => 
      prevProviders.map(provider => 
        provider.id === providerId 
          ? { ...provider, [field]: value } 
          : provider
      )
    );
  };

  const handleOptionChange = (option: string, value: any) => {
    setOptions(prev => ({ ...prev, [option]: value }));
  };

  const handleSaveSettings = () => {
    // Save AI provider settings
    providers.forEach(provider => {
      updateProvider(provider.id, provider);
    });
    
    // Save editor settings
    updateEditorOptions(options);
    updateEditorTheme(theme);
    
    // Refresh models from updated providers
    refreshModels();
    
    // Show saved confirmation
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleCreateTheme = () => {
    if (newTheme.id && newTheme.name) {
      addCustomTheme(newTheme);
      setShowNewThemeForm(false);
      setNewTheme({
        id: '',
        name: '',
        base: 'vs-dark',
        colors: {
          'editor.background': '#1e1e1e',
          'editor.foreground': '#d4d4d4',
          'editorLineNumber.foreground': '#858585',
          'editor.selectionBackground': '#264f78',
          'editor.lineHighlightBackground': '#2d2d30'
        }
      });
    }
  };

  const handleUpdateTheme = () => {
    if (editingTheme) {
      updateCustomTheme(editingTheme.id, editingTheme);
      setEditingTheme(null);
    }
  };

  const handleDeleteTheme = (themeId: string) => {
    deleteCustomTheme(themeId);
    
    // If the current theme is the one being deleted, switch to a default theme
    if (theme === themeId) {
      setTheme('vs-dark');
      updateEditorTheme('vs-dark');
    }
  };

  const startEditingTheme = (themeToEdit: any) => {
    setEditingTheme({...themeToEdit});
  };

  const updateThemeColor = (property: string, color: string) => {
    if (editingTheme) {
      setEditingTheme((prev: any) => ({
        ...prev,
        colors: {
          ...prev.colors,
          [property]: color
        }
      }));
    } else {
      setNewTheme(prev => ({
        ...prev,
        colors: {
          ...prev.colors,
          [property]: color
        }
      }));
    }
  };

  const generateThemePreview = (themeObj: any) => {
    const { base, colors } = themeObj;
    const isDark = base.includes('dark');
    
    // Generate background, foreground, and accent colors based on theme
    const bgColor = colors['editor.background'];
    const fgColor = colors['editor.foreground'];
    const selectionColor = colors['editor.selectionBackground'];
    const lineHighlightColor = colors['editor.lineHighlightBackground'];
    
    return (
      <div className="rounded overflow-hidden border border-border glass-effect" style={{ height: '150px' }}>
        <div className="h-6 flex items-center px-2 text-xs" style={{ background: isDark ? '#3c3c3c' : '#e7e7e7', color: isDark ? '#cccccc' : '#333333' }}>
          Theme Preview
        </div>
        <div style={{ background: bgColor, color: fgColor, height: 'calc(100% - 24px)', position: 'relative' }}>
          <div className="p-2 font-mono text-xs">
            <div className="flex">
              <div className="mr-2" style={{ color: colors['editorLineNumber.foreground'] }}>1</div>
              <div>function <span className="text-blue-400">greet</span>(<span className="text-orange-400">name</span>) {'{'}</div>
            </div>
            <div className="flex" style={{ background: lineHighlightColor }}>
              <div className="mr-2" style={{ color: colors['editorLineNumber.foreground'] }}>2</div>
              <div>&nbsp;&nbsp;<span className="text-purple-400">return</span> <span style={{ background: selectionColor }}>Hello, ${'{name}'}!</span>;</div>
            </div>
            <div className="flex">
              <div className="mr-2" style={{ color: colors['editorLineNumber.foreground'] }}>3</div>
              <div>{'}'}</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Layout>
      <motion.div
        className="container mx-auto py-6 px-4 overflow-y-auto h-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <motion.h1
          className="text-2xl font-bold mb-6 bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          Settings
        </motion.h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* AI Model Settings */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <div className="card mb-8">
              <h2 className="text-xl font-semibold mb-4 text-text-primary">AI Providers</h2>

              {providers.map((provider, index) => (
                <motion.div
                  key={provider.id}
                  className="mb-6 border-b border-border pb-4 last:border-b-0"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
                >
                  <div className="flex items-center mb-3">
                    <h3 className="text-lg font-medium text-text-primary">{provider.name}</h3>
                    <label className="ml-auto flex items-center cursor-pointer">
                      <span className="mr-2 text-sm text-text-secondary">Enabled</span>
                      <motion.input
                        type="checkbox"
                        checked={provider.enabled}
                        onChange={(e) => handleProviderChange(provider.id, 'enabled', e.target.checked)}
                        className="form-checkbox h-4 w-4 text-primary-500 rounded"
                        whileTap={{ scale: 0.9 }}
                      />
                    </label>
                  </div>

                  {provider.id === 'ollama' ? (
                    <div className="mb-2">
                      <label className="block text-sm text-text-secondary mb-1">Server URL</label>
                      <input
                        type="text"
                        value={provider.url}
                        onChange={(e) => handleProviderChange(provider.id, 'url', e.target.value)}
                        className="input-field"
                        placeholder="http://localhost:11434"
                      />
                    </div>
                  ) : (
                    <div className="mb-2">
                      <label className="block text-sm text-text-secondary mb-1">API Key</label>
                      <input
                        type="password"
                        value={provider.apiKey || ''}
                        onChange={(e) => handleProviderChange(provider.id, 'apiKey', e.target.value)}
                        className="input-field"
                        placeholder="Enter your API key"
                      />
                    </div>
                  )}
                </motion.div>
              ))}

              <motion.button 
                className={`mt-2 btn-primary flex items-center space-x-2 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={refreshModels}
                disabled={isLoading}
                whileHover={{ scale: isLoading ? 1 : 1.02 }}
                whileTap={{ scale: isLoading ? 1 : 0.98 }}
              >
                <motion.div
                  animate={{ rotate: isLoading ? 360 : 0 }}
                  transition={{ duration: 1, repeat: isLoading ? Infinity : 0, ease: "linear" }}
                >
                  <FiRefreshCw />
                </motion.div>
                <span>Refresh Available Models</span>
              </motion.button>
            </div>
          </motion.div>

          {/* Editor Settings */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <div className="card mb-8">
              <h2 className="text-xl font-semibold mb-4 text-text-primary">Editor Settings</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-text-secondary mb-1">Theme</label>
                  <select
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                    className="input-field"
                  >
                    <optgroup label="Default Themes">
                      <option value="vs-dark">Dark (Default)</option>
                      <option value="vs">Light</option>
                      <option value="hc-black">High Contrast Dark</option>
                    </optgroup>
                    
                    {customThemes.length > 0 && (
                      <optgroup label="Custom Themes">
                        {customThemes.map(customTheme => (
                          <option key={customTheme.id} value={customTheme.id}>
                            {customTheme.name}
                          </option>
                        ))}
                      </optgroup>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-text-secondary mb-1">Font Size</label>
                  <input
                    type="number"
                    value={options.fontSize}
                    onChange={(e) => handleOptionChange('fontSize', parseInt(e.target.value))}
                    className="input-field"
                    min="8"
                    max="32"
                  />
                </div>

                <div>
                  <label className="block text-sm text-text-secondary mb-1">Font Family</label>
                  <select
                    value={options.fontFamily}
                    onChange={(e) => handleOptionChange('fontFamily', e.target.value)}
                    className="input-field"
                  >
                    <option value="JetBrains Mono">JetBrains Mono</option>
                    <option value="Fira Code">Fira Code</option>
                    <option value="Consolas">Consolas</option>
                    <option value="Menlo">Menlo</option>
                    <option value="Monaco">Monaco</option>
                    <option value="monospace">Monospace</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-text-secondary mb-1">Tab Size</label>
                  <select
                    value={options.tabSize}
                    onChange={(e) => handleOptionChange('tabSize', parseInt(e.target.value))}
                    className="input-field"
                  >
                    <option value="2">2 spaces</option>
                    <option value="4">4 spaces</option>
                    <option value="8">8 spaces</option>
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={options.minimap?.enabled}
                      onChange={(e) => handleOptionChange('minimap', { ...options.minimap, enabled: e.target.checked })}
                      className="form-checkbox h-4 w-4 text-primary-500 rounded mr-3"
                    />
                    <span>Show Minimap</span>
                  </label>

                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={options.wordWrap === 'on'}
                      onChange={(e) => handleOptionChange('wordWrap', e.target.checked ? 'on' : 'off')}
                      className="form-checkbox h-4 w-4 text-primary-500 rounded mr-3"
                    />
                    <span>Word Wrap</span>
                  </label>

                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={options.smoothScrolling}
                      onChange={(e) => handleOptionChange('smoothScrolling', e.target.checked)}
                      className="form-checkbox h-4 w-4 text-primary-500 rounded mr-3"
                    />
                    <span>Smooth Scrolling</span>
                  </label>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Save button */}
        <motion.div
          className="fixed bottom-6 right-6"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          <motion.button
            onClick={handleSaveSettings}
            className="btn-primary flex items-center space-x-2 shadow-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <AnimatePresence mode="wait">
              {saved ? (
                <motion.div
                  key="saved"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <FiCheckCircle />
                </motion.div>
              ) : (
                <motion.div
                  key="save"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <FiSave />
                </motion.div>
              )}
            </AnimatePresence>
            <span>{saved ? 'Saved!' : 'Save Settings'}</span>
          </motion.button>
        </motion.div>
      </motion.div>
    </Layout>
  );
}