import React, { useState } from 'react';
import { useAI } from '../contexts/AIContext';
import { useEditor } from '../contexts/EditorContext';
import { FiSave, FiRefreshCw, FiCheckCircle, FiPlus, FiTrash2, FiEye, FiSettings } from 'react-icons/fi';

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
  const [editingTheme, setEditingTheme] = useState(null);

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

  const handleDeleteTheme = (themeId) => {
    deleteCustomTheme(themeId);
    
    // If the current theme is the one being deleted, switch to a default theme
    if (theme === themeId) {
      setTheme('vs-dark');
      updateEditorTheme('vs-dark');
    }
  };

  const startEditingTheme = (theme) => {
    setEditingTheme({...theme});
  };

  const updateThemeColor = (property, color) => {
    if (editingTheme) {
      setEditingTheme(prev => ({
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

  const generateThemePreview = (themeObj) => {
    const { base, colors } = themeObj;
    const isDark = base.includes('dark');
    
    // Generate background, foreground, and accent colors based on theme
    const bgColor = colors['editor.background'];
    const fgColor = colors['editor.foreground'];
    const selectionColor = colors['editor.selectionBackground'];
    const lineHighlightColor = colors['editor.lineHighlightBackground'];
    
    return (
      <div className="rounded overflow-hidden border border-editor-line" style={{ height: '150px' }}>
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
    <div className="container mx-auto py-6 px-4 overflow-y-auto">
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
                <optgroup label="Default Themes">
                  <option value="vs-dark">Dark (Default)</option>
                  <option value="vs">Light</option>
                  <option value="hc-black">High Contrast Dark</option>
                </optgroup>
                
                {customThemes.length > 0 && (
                  <optgroup label="Custom Themes">
                    {customThemes.map(theme => (
                      <option key={theme.id} value={theme.id}>
                        {theme.name}
                      </option>
                    ))}
                  </optgroup>
                )}
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
              <label className="block text-sm text-gray-400 mb-1">Font Family</label>
              <select
                value={options.fontFamily}
                onChange={(e) => handleOptionChange('fontFamily', e.target.value)}
                className="w-full p-2 bg-editor-bg border border-editor-line rounded text-white"
              >
                <option value="JetBrains Mono">JetBrains Mono</option>
                <option value="Fira Code">Fira Code</option>
                <option value="Consolas">Consolas</option>
                <option value="Menlo">Menlo</option>
                <option value="Monaco">Monaco</option>
                <option value="monospace">Monospace</option>
              </select>
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
              <label className="block text-sm text-gray-400 mb-1">Cursor Animation</label>
              <select
                value={options.cursorBlinking}
                onChange={(e) => handleOptionChange('cursorBlinking', e.target.value)}
                className="w-full p-2 bg-editor-bg border border-editor-line rounded text-white"
              >
                <option value="blink">Blink</option>
                <option value="smooth">Smooth</option>
                <option value="phase">Phase</option>
                <option value="expand">Expand</option>
                <option value="solid">Solid</option>
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

            <div className="mb-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.smoothScrolling}
                  onChange={(e) => handleOptionChange('smoothScrolling', e.target.checked)}
                  className="form-checkbox h-4 w-4 text-primary rounded mr-2"
                />
                <span>Smooth Scrolling</span>
              </label>
            </div>
          </div>

          {/* Custom Themes Section */}
          <div className="bg-surface rounded-lg p-4 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Custom Themes</h2>
              <button
                className="p-1 bg-primary/20 hover:bg-primary/30 text-primary rounded"
                onClick={() => setShowNewThemeForm(!showNewThemeForm)}
              >
                <FiPlus size={16} />
              </button>
            </div>

            {/* New Theme Form */}
            {showNewThemeForm && (
              <div className="mb-6 p-4 border border-editor-line rounded-md">
                <h3 className="text-lg font-medium mb-3">Create New Theme</h3>
                
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Theme ID</label>
                    <input
                      type="text"
                      value={newTheme.id}
                      onChange={(e) => setNewTheme({...newTheme, id: e.target.value})}
                      className="w-full p-2 bg-editor-bg border border-editor-line rounded text-white"
                      placeholder="my-custom-theme"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Theme Name</label>
                    <input
                      type="text"
                      value={newTheme.name}
                      onChange={(e) => setNewTheme({...newTheme, name: e.target.value})}
                      className="w-full p-2 bg-editor-bg border border-editor-line rounded text-white"
                      placeholder="My Custom Theme"
                    />
                  </div>
                </div>
                
                <div className="mb-3">
                  <label className="block text-sm text-gray-400 mb-1">Base Theme</label>
                  <select
                    value={newTheme.base}
                    onChange={(e) => setNewTheme({...newTheme, base: e.target.value})}
                    className="w-full p-2 bg-editor-bg border border-editor-line rounded text-white"
                  >
                    <option value="vs">Light</option>
                    <option value="vs-dark">Dark</option>
                    <option value="hc-black">High Contrast Dark</option>
                  </select>
                </div>
                
                <h4 className="font-medium mb-2">Colors</h4>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Background</label>
                    <div className="flex">
                      <input
                        type="color"
                        value={newTheme.colors['editor.background']}
                        onChange={(e) => updateThemeColor('editor.background', e.target.value)}
                        className="w-10 h-10 rounded border-0"
                      />
                      <input
                        type="text"
                        value={newTheme.colors['editor.background']}
                        onChange={(e) => updateThemeColor('editor.background', e.target.value)}
                        className="flex-1 ml-2 p-2 bg-editor-bg border border-editor-line rounded text-white"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Foreground</label>
                    <div className="flex">
                      <input
                        type="color"
                        value={newTheme.colors['editor.foreground']}
                        onChange={(e) => updateThemeColor('editor.foreground', e.target.value)}
                        className="w-10 h-10 rounded border-0"
                      />
                      <input
                        type="text"
                        value={newTheme.colors['editor.foreground']}
                        onChange={(e) => updateThemeColor('editor.foreground', e.target.value)}
                        className="flex-1 ml-2 p-2 bg-editor-bg border border-editor-line rounded text-white"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Line Numbers</label>
                    <div className="flex">
                      <input
                        type="color"
                        value={newTheme.colors['editorLineNumber.foreground']}
                        onChange={(e) => updateThemeColor('editorLineNumber.foreground', e.target.value)}
                        className="w-10 h-10 rounded border-0"
                      />
                      <input
                        type="text"
                        value={newTheme.colors['editorLineNumber.foreground']}
                        onChange={(e) => updateThemeColor('editorLineNumber.foreground', e.target.value)}
                        className="flex-1 ml-2 p-2 bg-editor-bg border border-editor-line rounded text-white"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Selection</label>
                    <div className="flex">
                      <input
                        type="color"
                        value={newTheme.colors['editor.selectionBackground']}
                        onChange={(e) => updateThemeColor('editor.selectionBackground', e.target.value)}
                        className="w-10 h-10 rounded border-0"
                      />
                      <input
                        type="text"
                        value={newTheme.colors['editor.selectionBackground']}
                        onChange={(e) => updateThemeColor('editor.selectionBackground', e.target.value)}
                        className="flex-1 ml-2 p-2 bg-editor-bg border border-editor-line rounded text-white"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Line Highlight</label>
                    <div className="flex">
                      <input
                        type="color"
                        value={newTheme.colors['editor.lineHighlightBackground']}
                        onChange={(e) => updateThemeColor('editor.lineHighlightBackground', e.target.value)}
                        className="w-10 h-10 rounded border-0"
                      />
                      <input
                        type="text"
                        value={newTheme.colors['editor.lineHighlightBackground']}
                        onChange={(e) => updateThemeColor('editor.lineHighlightBackground', e.target.value)}
                        className="flex-1 ml-2 p-2 bg-editor-bg border border-editor-line rounded text-white"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="mb-4">
                  <h4 className="text-sm text-gray-400 mb-1">Preview</h4>
                  {generateThemePreview(newTheme)}
                </div>
                
                <div className="flex justify-end">
                  <button
                    className="mr-2 px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-white"
                    onClick={() => setShowNewThemeForm(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-3 py-1 bg-primary hover:bg-primary/90 rounded text-white"
                    onClick={handleCreateTheme}
                    disabled={!newTheme.id || !newTheme.name}
                  >
                    Create Theme
                  </button>
                </div>
              </div>
            )}

            {/* Theme List */}
            {customThemes.length > 0 ? (
              <div className="space-y-4">
                {customThemes.map((themeObj) => (
                  <div key={themeObj.id} className="p-3 border border-editor-line rounded-md">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium">{themeObj.name}</h3>
                      <div className="flex space-x-2">
                        <button
                          className="p-1 text-primary hover:text-primary/80"
                          onClick={() => setTheme(themeObj.id)}
                          title="Use this theme"
                        >
                          <FiEye size={16} />
                        </button>
                        <button
                          className="p-1 text-yellow-500 hover:text-yellow-400"
                          onClick={() => startEditingTheme(themeObj)}
                          title="Edit theme"
                        >
                          <FiSettings size={16} />
                        </button>
                        <button
                          className="p-1 text-red-500 hover:text-red-400"
                          onClick={() => handleDeleteTheme(themeObj.id)}
                          title="Delete theme"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </div>
                    
                    {generateThemePreview(themeObj)}
                    
                    {editingTheme && editingTheme.id === themeObj.id && (
                      <div className="mt-3 p-3 border border-editor-line rounded-md">
                        <h4 className="font-medium mb-3">Edit Theme</h4>
                        
                        <div className="grid grid-cols-2 gap-4 mb-3">
                          <div>
                            <label className="block text-sm text-gray-400 mb-1">Theme Name</label>
                            <input
                              type="text"
                              value={editingTheme.name}
                              onChange={(e) => setEditingTheme({...editingTheme, name: e.target.value})}
                              className="w-full p-2 bg-editor-bg border border-editor-line rounded text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-400 mb-1">Base Theme</label>
                            <select
                              value={editingTheme.base}
                              onChange={(e) => setEditingTheme({...editingTheme, base: e.target.value})}
                              className="w-full p-2 bg-editor-bg border border-editor-line rounded text-white"
                            >
                              <option value="vs">Light</option>
                              <option value="vs-dark">Dark</option>
                              <option value="hc-black">High Contrast Dark</option>
                            </select>
                          </div>
                        </div>
                        
                        <h4 className="font-medium mb-2">Colors</h4>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="block text-sm text-gray-400 mb-1">Background</label>
                            <div className="flex">
                              <input
                                type="color"
                                value={editingTheme.colors['editor.background']}
                                onChange={(e) => updateThemeColor('editor.background', e.target.value)}
                                className="w-10 h-10 rounded border-0"
                              />
                              <input
                                type="text"
                                value={editingTheme.colors['editor.background']}
                                onChange={(e) => updateThemeColor('editor.background', e.target.value)}
                                className="flex-1 ml-2 p-2 bg-editor-bg border border-editor-line rounded text-white"
                              />
                            </div>
                          </div>
                          
                          <div>
                            <label className="block text-sm text-gray-400 mb-1">Foreground</label>
                            <div className="flex">
                              <input
                                type="color"
                                value={editingTheme.colors['editor.foreground']}
                                onChange={(e) => updateThemeColor('editor.foreground', e.target.value)}
                                className="w-10 h-10 rounded border-0"
                              />
                              <input
                                type="text"
                                value={editingTheme.colors['editor.foreground']}
                                onChange={(e) => updateThemeColor('editor.foreground', e.target.value)}
                                className="flex-1 ml-2 p-2 bg-editor-bg border border-editor-line rounded text-white"
                              />
                            </div>
                          </div>
                          
                          <div>
                            <label className="block text-sm text-gray-400 mb-1">Line Numbers</label>
                            <div className="flex">
                              <input
                                type="color"
                                value={editingTheme.colors['editorLineNumber.foreground']}
                                onChange={(e) => updateThemeColor('editorLineNumber.foreground', e.target.value)}
                                className="w-10 h-10 rounded border-0"
                              />
                              <input
                                type="text"
                                value={editingTheme.colors['editorLineNumber.foreground']}
                                onChange={(e) => updateThemeColor('editorLineNumber.foreground', e.target.value)}
                                className="flex-1 ml-2 p-2 bg-editor-bg border border-editor-line rounded text-white"
                              />
                            </div>
                          </div>
                          
                          <div>
                            <label className="block text-sm text-gray-400 mb-1">Selection</label>
                            <div className="flex">
                              <input
                                type="color"
                                value={editingTheme.colors['editor.selectionBackground']}
                                onChange={(e) => updateThemeColor('editor.selectionBackground', e.target.value)}
                                className="w-10 h-10 rounded border-0"
                              />
                              <input
                                type="text"
                                value={editingTheme.colors['editor.selectionBackground']}
                                onChange={(e) => updateThemeColor('editor.selectionBackground', e.target.value)}
                                className="flex-1 ml-2 p-2 bg-editor-bg border border-editor-line rounded text-white"
                              />
                            </div>
                          </div>
                          
                          <div>
                            <label className="block text-sm text-gray-400 mb-1">Line Highlight</label>
                            <div className="flex">
                              <input
                                type="color"
                                value={editingTheme.colors['editor.lineHighlightBackground']}
                                onChange={(e) => updateThemeColor('editor.lineHighlightBackground', e.target.value)}
                                className="w-10 h-10 rounded border-0"
                              />
                              <input
                                type="text"
                                value={editingTheme.colors['editor.lineHighlightBackground']}
                                onChange={(e) => updateThemeColor('editor.lineHighlightBackground', e.target.value)}
                                className="flex-1 ml-2 p-2 bg-editor-bg border border-editor-line rounded text-white"
                              />
                            </div>
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <h4 className="text-sm text-gray-400 mb-1">Preview</h4>
                          {generateThemePreview(editingTheme)}
                        </div>
                        
                        <div className="flex justify-end">
                          <button
                            className="mr-2 px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-white"
                            onClick={() => setEditingTheme(null)}
                          >
                            Cancel
                          </button>
                          <button
                            className="px-3 py-1 bg-primary hover:bg-primary/90 rounded text-white"
                            onClick={handleUpdateTheme}
                          >
                            Update Theme
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-400">
                <p>No custom themes created yet. Click the + button to create one.</p>
              </div>
            )}
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