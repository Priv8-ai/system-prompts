import React, { useState } from 'react';
import { useAI } from '../contexts/AIContext';
import { useEditor } from '../contexts/EditorContext';
import { FiSave, FiRefreshCw, FiCheckCircle } from 'react-icons/fi';

const SettingsPage = () => {
  const { 
    modelProviders, 
    updateProvider, 
    refreshModels,
    isLoading 
  } = useAI();
  
  const {
    editorOptions,
    editorTheme,
    updateEditorOptions,
    updateEditorTheme
  } = useEditor();
  
  const [providers, setProviders] = useState(modelProviders);
  const [options, setOptions] = useState(editorOptions);
  const [theme, setTheme] = useState(editorTheme);
  const [saved, setSaved] = useState(false);

  const handleProviderChange = (providerId, field, value) => {
    setProviders(prevProviders => 
      prevProviders.map(provider => 
        provider.id === providerId 
          ? { ...provider, [field]: value } 
          : provider
      )
    );
  };

  const handleOptionChange = (option, value) => {
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

  return (
    <div className="container mx-auto py-6 px-4">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* AI Model Settings */}
        <div>
          <div className="bg-surface rounded-lg p-4 mb-8">
            <h2 className="text-xl font-semibold mb-4">AI Providers</h2>

            {providers.map((provider) => (
              <div key={provider.id} className="mb-6 border-b border-editor-line pb-4 last:border-b-0">
                <div className="flex items-center mb-2">
                  <h3 className="text-lg font-medium">{provider.name}</h3>
                  <label className="ml-auto flex items-center cursor-pointer">
                    <span className="mr-2 text-sm text-gray-400">Enabled</span>
                    <input
                      type="checkbox"
                      checked={provider.enabled}
                      onChange={(e) => handleProviderChange(provider.id, 'enabled', e.target.checked)}
                      className="form-checkbox h-4 w-4 text-primary rounded"
                    />
                  </label>
                </div>

                {provider.id === 'ollama' ? (
                  <div className="mb-2">
                    <label className="block text-sm text-gray-400 mb-1">Server URL</label>
                    <input
                      type="text"
                      value={provider.url}
                      onChange={(e) => handleProviderChange(provider.id, 'url', e.target.value)}
                      className="w-full p-2 bg-editor-bg border border-editor-line rounded text-white"
                      placeholder="http://localhost:11434"
                    />
                  </div>
                ) : (
                  <div className="mb-2">
                    <label className="block text-sm text-gray-400 mb-1">API Key</label>
                    <input
                      type="password"
                      value={provider.apiKey || ''}
                      onChange={(e) => handleProviderChange(provider.id, 'apiKey', e.target.value)}
                      className="w-full p-2 bg-editor-bg border border-editor-line rounded text-white"
                      placeholder="Enter your API key"
                    />
                  </div>
                )}
              </div>
            ))}

            <button 
              className={`mt-2 p-2 rounded ${isLoading ? 'bg-gray-700 cursor-wait' : 'bg-primary hover:bg-primary/90'}`}
              onClick={refreshModels}
              disabled={isLoading}
            >
              <span className="flex items-center justify-center">
                <FiRefreshCw className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh Available Models
              </span>
            </button>
          </div>
        </div>

        {/* Editor Settings */}
        <div>
          <div className="bg-surface rounded-lg p-4 mb-8">
            <h2 className="text-xl font-semibold mb-4">Editor Settings</h2>

            <div className="mb-4">
              <label className="block text-sm text-gray-400 mb-1">Theme</label>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="w-full p-2 bg-editor-bg border border-editor-line rounded text-white"
              >
                <option value="vs-dark">Dark (Default)</option>
                <option value="light">Light</option>
                <option value="hc-black">High Contrast Dark</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm text-gray-400 mb-1">Font Size</label>
              <input
                type="number"
                value={options.fontSize}
                onChange={(e) => handleOptionChange('fontSize', parseInt(e.target.value))}
                className="w-full p-2 bg-editor-bg border border-editor-line rounded text-white"
                min="8"
                max="32"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm text-gray-400 mb-1">Tab Size</label>
              <select
                value={options.tabSize}
                onChange={(e) => handleOptionChange('tabSize', parseInt(e.target.value))}
                className="w-full p-2 bg-editor-bg border border-editor-line rounded text-white"
              >
                <option value="2">2 spaces</option>
                <option value="4">4 spaces</option>
                <option value="8">8 spaces</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.minimap?.enabled}
                  onChange={(e) => handleOptionChange('minimap', { ...options.minimap, enabled: e.target.checked })}
                  className="form-checkbox h-4 w-4 text-primary rounded mr-2"
                />
                <span>Show Minimap</span>
              </label>
            </div>

            <div className="mb-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.wordWrap === 'on'}
                  onChange={(e) => handleOptionChange('wordWrap', e.target.checked ? 'on' : 'off')}
                  className="form-checkbox h-4 w-4 text-primary rounded mr-2"
                />
                <span>Word Wrap</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Save button */}
      <div className="fixed bottom-6 right-6">
        <button
          onClick={handleSaveSettings}
          className="p-4 bg-primary text-white rounded-full shadow-lg hover:bg-primary/90 flex items-center"
        >
          {saved ? <FiCheckCircle className="mr-2" /> : <FiSave className="mr-2" />}
          <span>{saved ? 'Saved!' : 'Save Settings'}</span>
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;