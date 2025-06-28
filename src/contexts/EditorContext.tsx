import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface FileInfo {
  path: string;
  name: string;
  language: string;
}

interface Diagnostic {
  line: number;
  column?: number;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

interface CustomTheme {
  id: string;
  name: string;
  base: 'vs' | 'vs-dark' | 'hc-black';
  colors: Record<string, string>;
}

interface EditorOptions {
  minimap: { enabled: boolean };
  fontFamily: string;
  fontSize: number;
  tabSize: number;
  automaticLayout: boolean;
  wordWrap: 'on' | 'off';
  lineNumbers: 'on' | 'off';
  scrollBeyondLastLine: boolean;
  renderLineHighlight: 'all' | 'line' | 'none';
  cursorBlinking: 'blink' | 'smooth' | 'phase' | 'expand' | 'solid';
  cursorSmoothCaretAnimation: 'on' | 'off';
  smoothScrolling: boolean;
}

interface EditorContextType {
  activeFile: FileInfo | null;
  openFiles: FileInfo[];
  editorContent: string;
  editorTheme: string;
  language: string;
  diagnostics: Diagnostic[];
  editorOptions: EditorOptions;
  customThemes: CustomTheme[];
  openFile: (filePath: string, content: string) => void;
  closeFile: (filePath: string) => void;
  updateEditorContent: (newContent: string) => void;
  updateEditorOptions: (newOptions: Partial<EditorOptions>) => void;
  updateEditorTheme: (newTheme: string) => void;
  runDiagnostics: (content: string, filePath: string) => Diagnostic[];
  detectLanguage: (filename: string) => string;
  addCustomTheme: (theme: CustomTheme) => void;
  updateCustomTheme: (themeId: string, updates: Partial<CustomTheme>) => void;
  deleteCustomTheme: (themeId: string) => void;
}

const EditorContext = createContext<EditorContextType | null>(null);

export const useEditor = () => {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error('useEditor must be used within an EditorProvider');
  }
  return context;
};

interface EditorProviderProps {
  children: ReactNode;
}

export const EditorProvider = ({ children }: EditorProviderProps) => {
  const [activeFile, setActiveFile] = useState<FileInfo | null>(null);
  const [openFiles, setOpenFiles] = useState<FileInfo[]>([]);
  const [editorContent, setEditorContent] = useState('');
  const [editorTheme, setEditorTheme] = useState('vs-dark');
  const [language, setLanguage] = useState('javascript');
  const [diagnostics, setDiagnostics] = useState<Diagnostic[]>([]);
  const [customThemes, setCustomThemes] = useState<CustomTheme[]>([]);
  const [editorOptions, setEditorOptions] = useState<EditorOptions>({
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
          const defaultThemes: CustomTheme[] = [
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

  const detectLanguage = (filename: string): string => {
    if (!filename) return 'plaintext';
    
    const extension = filename.split('.').pop()?.toLowerCase();
    
    const languageMap: Record<string, string> = {
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
    
    return languageMap[extension || ''] || 'plaintext';
  };

  const openFile = (filePath: string, content: string) => {
    // Check if file is already open
    if (!openFiles.some(file => file.path === filePath)) {
      const newFile: FileInfo = { 
        path: filePath, 
        name: filePath.split('/').pop() || '',
        language: detectLanguage(filePath)
      };
      
      setOpenFiles(prev => [...prev, newFile]);
    }
    
    // Set as active file
    setActiveFile({ 
      path: filePath, 
      name: filePath.split('/').pop() || '',
      language: detectLanguage(filePath)
    });
    
    // Set content and language
    setEditorContent(content);
    setLanguage(detectLanguage(filePath));
  };

  const closeFile = (filePath: string) => {
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

  const updateEditorContent = (newContent: string) => {
    setEditorContent(newContent);
  };

  const updateEditorOptions = (newOptions: Partial<EditorOptions>) => {
    setEditorOptions(prev => ({ ...prev, ...newOptions }));
  };

  const updateEditorTheme = (newTheme: string) => {
    setEditorTheme(newTheme);
  };
  
  const addCustomTheme = (theme: CustomTheme) => {
    setCustomThemes(prev => [...prev, theme]);
  };
  
  const updateCustomTheme = (themeId: string, updates: Partial<CustomTheme>) => {
    setCustomThemes(prev => 
      prev.map(theme => 
        theme.id === themeId 
          ? { ...theme, ...updates } 
          : theme
      )
    );
  };
  
  const deleteCustomTheme = (themeId: string) => {
    setCustomThemes(prev => prev.filter(theme => theme.id !== themeId));
  };

  const runDiagnostics = (content: string, filePath: string): Diagnostic[] => {
    // This would be integrated with a real linting/diagnostic service
    // For now, we'll just simulate some basic diagnostics
    
    const lang = detectLanguage(filePath);
    const newDiagnostics: Diagnostic[] = [];
    
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

  const value: EditorContextType = {
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