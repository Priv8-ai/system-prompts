import React, { createContext, useContext, useState, useEffect } from 'react';

const EditorContext = createContext(null);

export const useEditor = () => {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error('useEditor must be used within an EditorProvider');
  }
  return context;
};

export const EditorProvider = ({ children }) => {
  const [activeFile, setActiveFile] = useState(null);
  const [openFiles, setOpenFiles] = useState([]);
  const [editorContent, setEditorContent] = useState('');
  const [editorTheme, setEditorTheme] = useState('vs-dark');
  const [language, setLanguage] = useState('javascript');
  const [diagnostics, setDiagnostics] = useState([]);
  const [customThemes, setCustomThemes] = useState([]);
  const [editorOptions, setEditorOptions] = useState({
    minimap: { enabled: true },
    fontFamily: 'JetBrains Mono',
    fontSize: 14,
    tabSize: 2,
    automaticLayout: true,
    wordWrap: 'on',
    lineNumbers: 'on',
    scrollBeyondLastLine: false,
    renderLineHighlight: 'all',
    cursorBlinking: 'smooth',
    cursorSmoothCaretAnimation: 'on',
    smoothScrolling: true
  });

  // Load editor state from localStorage on component mount
  useEffect(() => {
    const loadEditorState = () => {
      try {
        const savedOpenFiles = localStorage.getItem('openFiles');
        if (savedOpenFiles) {
          const files = JSON.parse(savedOpenFiles);
          setOpenFiles(files);
        }

        const savedActiveFile = localStorage.getItem('activeFile');
        if (savedActiveFile) {
          setActiveFile(JSON.parse(savedActiveFile));
        }

        const savedEditorTheme = localStorage.getItem('editorTheme');
        if (savedEditorTheme) {
          setEditorTheme(savedEditorTheme);
        }

        const savedEditorOptions = localStorage.getItem('editorOptions');
        if (savedEditorOptions) {
          setEditorOptions(JSON.parse(savedEditorOptions));
        }
        
        const savedCustomThemes = localStorage.getItem('customThemes');
        if (savedCustomThemes) {
          setCustomThemes(JSON.parse(savedCustomThemes));
        } else {
          // Set default custom themes
          const defaultThemes = [
            {
              id: 'monokai',
              name: 'Monokai',
              base: 'vs-dark',
              colors: {
                'editor.background': '#272822',
                'editor.foreground': '#f8f8f2',
                'editorLineNumber.foreground': '#8F908A',
                'editor.selectionBackground': '#49483E',
                'editor.lineHighlightBackground': '#3E3D32',
              }
            },
            {
              id: 'github',
              name: 'GitHub',
              base: 'vs',
              colors: {
                'editor.background': '#ffffff',
                'editor.foreground': '#24292e',
                'editorLineNumber.foreground': '#1b1f234d',
                'editor.selectionBackground': '#0366d625',
                'editor.lineHighlightBackground': '#f6f8fa',
              }
            },
            {
              id: 'nord',
              name: 'Nord',
              base: 'vs-dark',
              colors: {
                'editor.background': '#2e3440',
                'editor.foreground': '#d8dee9',
                'editorLineNumber.foreground': '#4c566a',
                'editor.selectionBackground': '#434c5e',
                'editor.lineHighlightBackground': '#3b4252',
              }
            },
            {
              id: 'dracula',
              name: 'Dracula',
              base: 'vs-dark',
              colors: {
                'editor.background': '#282a36',
                'editor.foreground': '#f8f8f2',
                'editorLineNumber.foreground': '#6272a4',
                'editor.selectionBackground': '#44475a',
                'editor.lineHighlightBackground': '#44475a',
              }
            }
          ];
          setCustomThemes(defaultThemes);
          localStorage.setItem('customThemes', JSON.stringify(defaultThemes));
        }
      } catch (error) {
        console.error('Error loading editor state:', error);
      }
    };

    loadEditorState();
  }, []);

  // Save editor state to localStorage when it changes
  useEffect(() => {
    if (openFiles.length > 0) {
      localStorage.setItem('openFiles', JSON.stringify(openFiles));
    }
  }, [openFiles]);

  useEffect(() => {
    if (activeFile) {
      localStorage.setItem('activeFile', JSON.stringify(activeFile));
    }
  }, [activeFile]);

  useEffect(() => {
    localStorage.setItem('editorTheme', editorTheme);
  }, [editorTheme]);

  useEffect(() => {
    localStorage.setItem('editorOptions', JSON.stringify(editorOptions));
  }, [editorOptions]);
  
  useEffect(() => {
    if (customThemes.length > 0) {
      localStorage.setItem('customThemes', JSON.stringify(customThemes));
    }
  }, [customThemes]);

  const detectLanguage = (filename) => {
    if (!filename) return 'plaintext';
    
    const extension = filename.split('.').pop().toLowerCase();
    
    const languageMap = {
      js: 'javascript',
      jsx: 'javascript',
      ts: 'typescript',
      tsx: 'typescript',
      py: 'python',
      html: 'html',
      css: 'css',
      json: 'json',
      md: 'markdown',
      go: 'go',
      java: 'java',
      rs: 'rust',
      c: 'c',
      cpp: 'cpp',
      h: 'cpp',
      hpp: 'cpp',
      cs: 'csharp',
      rb: 'ruby',
      php: 'php'
    };
    
    return languageMap[extension] || 'plaintext';
  };

  const openFile = (filePath, content) => {
    // Check if file is already open
    if (!openFiles.some(file => file.path === filePath)) {
      const newFile = { 
        path: filePath, 
        name: filePath.split('/').pop(),
        language: detectLanguage(filePath)
      };
      
      setOpenFiles(prev => [...prev, newFile]);
    }
    
    // Set as active file
    setActiveFile({ 
      path: filePath, 
      name: filePath.split('/').pop(),
      language: detectLanguage(filePath)
    });
    
    // Set content and language
    setEditorContent(content);
    setLanguage(detectLanguage(filePath));
  };

  const closeFile = (filePath) => {
    setOpenFiles(prev => prev.filter(file => file.path !== filePath));
    
    // If closing the active file, set active to the first remaining file or null
    if (activeFile && activeFile.path === filePath) {
      const remainingFiles = openFiles.filter(file => file.path !== filePath);
      if (remainingFiles.length > 0) {
        setActiveFile(remainingFiles[0]);
      } else {
        setActiveFile(null);
        setEditorContent('');
      }
    }
  };

  const updateEditorContent = (newContent) => {
    setEditorContent(newContent);
  };

  const updateEditorOptions = (newOptions) => {
    setEditorOptions(prev => ({ ...prev, ...newOptions }));
  };

  const updateEditorTheme = (newTheme) => {
    setEditorTheme(newTheme);
  };
  
  const addCustomTheme = (theme) => {
    setCustomThemes(prev => [...prev, theme]);
  };
  
  const updateCustomTheme = (themeId, updates) => {
    setCustomThemes(prev => 
      prev.map(theme => 
        theme.id === themeId 
          ? { ...theme, ...updates } 
          : theme
      )
    );
  };
  
  const deleteCustomTheme = (themeId) => {
    setCustomThemes(prev => prev.filter(theme => theme.id !== themeId));
  };

  const runDiagnostics = (content, filePath) => {
    // This would be integrated with a real linting/diagnostic service
    // For now, we'll just simulate some basic diagnostics
    
    const lang = detectLanguage(filePath);
    const newDiagnostics = [];
    
    // Example diagnostics for demonstration
    if (content.includes('console.log')) {
      newDiagnostics.push({
        severity: 'warning',
        message: 'Avoid using console.log in production code',
        line: content.split('\n').findIndex(line => line.includes('console.log')) + 1,
        column: 1
      });
    }
    
    setDiagnostics(newDiagnostics);
    return newDiagnostics;
  };

  const value = {
    activeFile,
    openFiles,
    editorContent,
    editorTheme,
    language,
    diagnostics,
    editorOptions,
    customThemes,
    openFile,
    closeFile,
    updateEditorContent,
    updateEditorOptions,
    updateEditorTheme,
    runDiagnostics,
    detectLanguage,
    addCustomTheme,
    updateCustomTheme,
    deleteCustomTheme
  };

  return <EditorContext.Provider value={value}>{children}</EditorContext.Provider>;
};