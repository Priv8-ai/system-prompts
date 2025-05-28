import React, { useEffect, useRef, useState } from 'react';
import MonacoEditor from '@monaco-editor/react';
import { useEditor } from '../contexts/EditorContext';
import { useFileSystem } from '../contexts/FileSystemContext';
import { FiX, FiSave, FiCode, FiAlertTriangle, FiSettings } from 'react-icons/fi';

const Editor = () => {
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
  const editorRef = useRef(null);
  const [monacoInstance, setMonacoInstance] = useState(null);
  
  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    setMonacoInstance(monaco);
    
    // Set up editor options
    editor.updateOptions(editorOptions);
    
    // Apply custom themes
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
  
  const handleEditorChange = (value) => {
    updateEditorContent(value);
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
  
  if (!activeFile) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-400">
        <FiCode className="text-5xl mb-4" />
        <h2 className="text-xl font-semibold mb-2">No File Open</h2>
        <p>Select or create a file from the sidebar to start editing</p>
      </div>
    );
  }
  
  return (
    <div className="h-full flex flex-col">
      {/* Tabs */}
      <div className="flex bg-surface border-b border-editor-line overflow-x-auto">
        {openFiles.map((file) => (
          <div
            key={file.path}
            className={`flex items-center px-3 py-2 min-w-0 max-w-xs border-r border-editor-line cursor-pointer ${
              activeFile && activeFile.path === file.path 
                ? 'bg-background text-white' 
                : 'text-gray-400 hover:bg-background/50'
            }`}
            onClick={() => {
              const content = useFileSystem().readFile(file.path);
              if (content !== null) {
                useEditor().openFile(file.path, content);
              }
            }}
          >
            <span className="truncate text-sm">{file.name}</span>
            <button
              className="ml-2 p-1 rounded-full hover:bg-surface"
              onClick={(e) => {
                e.stopPropagation();
                closeFile(file.path);
              }}
            >
              <FiX size={14} />
            </button>
          </div>
        ))}
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
            readOnly: false
          }}
        />
        
        {/* Actions */}
        <div className="absolute bottom-4 right-4 flex space-x-2">
          <button
            className="p-2 bg-primary rounded-full text-white shadow-lg hover:bg-primary/90"
            onClick={handleSaveFile}
            title="Save file"
          >
            <FiSave />
          </button>
          
          {/* Diagnostics indicator */}
          {diagnostics.length > 0 && (
            <div className="p-2 bg-yellow-500 rounded-full text-white shadow-lg">
              <FiAlertTriangle />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Editor;