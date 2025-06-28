'use client';

import React, { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { useEditor } from '@/contexts/EditorContext';
import { useFileSystem } from '@/contexts/FileSystemContext';
import { FiX, FiSave, FiCode, FiAlertTriangle, FiFile } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

// Dynamically import Monaco Editor to avoid SSR issues
const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => (
    <div className="h-full flex items-center justify-center">
      <div className="text-text-muted">Loading editor...</div>
    </div>
  ),
});

export function Editor() {
  const { 
    activeFile, 
    openFiles, 
    editorContent, 
    editorTheme, 
    language, 
    diagnostics,
    editorOptions,
    customThemes,
    closeFile,
    updateEditorContent
  } = useEditor();
  const { writeFile } = useFileSystem();
  const editorRef = useRef<any>(null);
  const [monacoInstance, setMonacoInstance] = useState<any>(null);
  
  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
    setMonacoInstance(monaco);
    
    // Set up editor options
    editor.updateOptions(editorOptions);
    
    // Register custom themes
    if (customThemes.length > 0) {
      customThemes.forEach(theme => {
        monaco.editor.defineTheme(theme.id, {
          base: theme.base,
          inherit: true,
          rules: [],
          colors: theme.colors
        });
      });
    }
    
    // Set up a model marker for diagnostics
    if (activeFile) {
      const model = editor.getModel();
      
      if (model && diagnostics.length > 0) {
        const markers = diagnostics.map(d => ({
          startLineNumber: d.line,
          startColumn: d.column || 1,
          endLineNumber: d.line,
          endColumn: d.column + 1 || 2,
          message: d.message,
          severity: d.severity === 'error' ? monaco.MarkerSeverity.Error : 
                    d.severity === 'warning' ? monaco.MarkerSeverity.Warning : 
                    monaco.MarkerSeverity.Info
        }));
        
        monaco.editor.setModelMarkers(model, "diagnostics", markers);
      }
    }
  };
  
  // Apply custom theme definitions when they change
  useEffect(() => {
    if (monacoInstance && customThemes.length > 0) {
      customThemes.forEach(theme => {
        monacoInstance.editor.defineTheme(theme.id, {
          base: theme.base,
          inherit: true,
          rules: [],
          colors: theme.colors
        });
      });
      
      // If current theme is a custom theme, reapply it
      if (customThemes.some(theme => theme.id === editorTheme)) {
        monacoInstance.editor.setTheme(editorTheme);
      }
    }
  }, [customThemes, monacoInstance]);
  
  const handleEditorChange = (value: string | undefined) => {
    updateEditorContent(value || '');
  };
  
  const handleSaveFile = () => {
    if (activeFile && editorContent) {
      writeFile(activeFile.path, editorContent);
    }
  };
  
  useEffect(() => {
    if (editorRef.current) {
      const editor = editorRef.current;
      editor.updateOptions(editorOptions);
    }
  }, [editorOptions]);

  // Function to get file icon based on file extension
  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    const iconClasses: Record<string, string> = {
      'js': 'text-yellow-400',
      'jsx': 'text-blue-400',
      'ts': 'text-blue-500',
      'tsx': 'text-blue-500',
      'css': 'text-blue-300',
      'html': 'text-orange-400',
      'json': 'text-green-400',
      'md': 'text-purple-400',
      'py': 'text-green-500',
      'java': 'text-red-500',
      'cpp': 'text-blue-600',
      'c': 'text-blue-600',
      'php': 'text-purple-500',
      'rb': 'text-red-400',
      'go': 'text-cyan-400',
      'rs': 'text-orange-500',
      'vue': 'text-green-500',
      'svelte': 'text-orange-400',
      'yml': 'text-purple-300',
      'yaml': 'text-purple-300',
      'xml': 'text-orange-300',
      'sql': 'text-blue-400',
      'sh': 'text-green-300',
      'bat': 'text-green-300',
      'ps1': 'text-blue-300',
      'dockerfile': 'text-blue-500',
      'gitignore': 'text-gray-400',
      'env': 'text-yellow-300',
      'txt': 'text-gray-300',
      'log': 'text-gray-400',
      'config': 'text-gray-400'
    };
    
    return iconClasses[extension || ''] || 'text-gray-400';
  };
  
  if (!activeFile) {
    return (
      <motion.div
        className="h-full flex flex-col items-center justify-center text-text-muted bg-background"
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
            <FiCode className="text-3xl text-primary-400" />
          </motion.div>
          <div>
            <h2 className="text-xl font-semibold text-text-primary mb-2">No File Open</h2>
            <p className="text-text-secondary max-w-md">
              Select or create a file from the sidebar to start editing. You can create new files and folders using the buttons in the file explorer.
            </p>
          </div>
        </div>
      </motion.div>
    );
  }
  
  return (
    <motion.div
      className="h-full flex flex-col bg-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Tabs */}
      <div className="flex bg-surface border-b border-border overflow-x-auto">
        <AnimatePresence>
          {openFiles.map((file) => (
            <motion.div
              key={file.path}
              className={`flex items-center px-4 py-3 min-w-0 max-w-xs border-r border-border cursor-pointer transition-all duration-200 group ${
                activeFile && activeFile.path === file.path 
                  ? 'bg-background text-text-primary border-b-2 border-b-primary-500' 
                  : 'text-text-secondary hover:bg-background/50 hover:text-text-primary'
              }`}
              onClick={() => {
                const content = useFileSystem().readFile(file.path);
                if (content !== null) {
                  useEditor().openFile(file.path, content);
                }
              }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              whileHover={{ y: -1 }}
            >
              <FiFile className={`mr-2 text-sm ${getFileIcon(file.name)}`} />
              <span className="truncate text-sm font-medium">{file.name}</span>
              <motion.button
                className="ml-2 p-1 rounded-full opacity-0 group-hover:opacity-100 hover:bg-surface transition-all duration-200"
                onClick={(e) => {
                  e.stopPropagation();
                  closeFile(file.path);
                }}
                title="Close file"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <FiX size={14} />
              </motion.button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      
      {/* Editor */}
      <div className="flex-1 relative">
        <MonacoEditor
          height="100%"
          language={language}
          value={editorContent}
          theme={editorTheme}
          onChange={handleEditorChange}
          onMount={handleEditorDidMount}
          options={{
            ...editorOptions,
            readOnly: false,
            padding: { top: 16, bottom: 16 }
          }}
        />
        
        {/* Actions */}
        <motion.div
          className="absolute bottom-6 right-6 flex space-x-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <motion.button
            className="btn-primary shadow-lg flex items-center space-x-2"
            onClick={handleSaveFile}
            title="Save file (Ctrl+S)"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <FiSave />
            <span>Save</span>
          </motion.button>
          
          {/* Diagnostics indicator */}
          <AnimatePresence>
            {diagnostics.length > 0 && (
              <motion.div
                className="warning-message p-3 rounded-lg shadow-lg flex items-center"
                title={`${diagnostics.length} warnings/errors detected`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <FiAlertTriangle className="mr-2" />
                <span className="text-sm font-medium">{diagnostics.length}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.div>
  );
}