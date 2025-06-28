import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface FileItem {
  path: string;
  name: string;
  content: string;
  lastModified: number;
}

interface DirectoryItem {
  path: string;
  name: string;
}

interface FileSystemContextType {
  files: FileItem[];
  directories: DirectoryItem[];
  currentPath: string;
  loading: boolean;
  error: string | null;
  setCurrentPath: (path: string) => void;
  getItemsInDirectory: (dirPath: string) => { files: FileItem[]; directories: DirectoryItem[] };
  createDirectory: (path: string, name: string) => boolean;
  createFile: (dirPath: string, name: string, initialContent?: string) => FileItem | false;
  readFile: (path: string) => string | null;
  writeFile: (path: string, content: string) => boolean;
  deleteItem: (path: string, isDirectory?: boolean) => boolean;
  renameItem: (oldPath: string, newPath: string, isDirectory?: boolean) => boolean;
  downloadProjectAsZip: () => Promise<string>;
  importProjectFromZip: (zipData: string) => Promise<boolean>;
}

const FileSystemContext = createContext<FileSystemContextType | null>(null);

export const useFileSystem = () => {
  const context = useContext(FileSystemContext);
  if (!context) {
    throw new Error('useFileSystem must be used within a FileSystemProvider');
  }
  return context;
};

interface FileSystemProviderProps {
  children: ReactNode;
}

export const FileSystemProvider = ({ children }: FileSystemProviderProps) => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [directories, setDirectories] = useState<DirectoryItem[]>([]);
  const [currentPath, setCurrentPath] = useState('/');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Simulate a file system structure in browser memory
  // In a real application, this would connect to a backend API
  useEffect(() => {
    const initFileSystem = () => {
      try {
        // Try to load saved file system from localStorage
        const savedFileSystem = localStorage.getItem('fileSystem');
        if (savedFileSystem) {
          const { files, directories } = JSON.parse(savedFileSystem);
          setFiles(files);
          setDirectories(directories);
          return;
        }
        
        // If no saved state, initialize with some default structure
        const defaultDirs: DirectoryItem[] = [
          { path: '/src', name: 'src' },
          { path: '/src/components', name: 'components' },
          { path: '/src/utils', name: 'utils' },
          { path: '/public', name: 'public' }
        ];
        
        const defaultFiles: FileItem[] = [
          { 
            path: '/src/App.js', 
            name: 'App.js',
            content: 'import React from "react";\n\nfunction App() {\n  return (\n    <div className="App">\n      <h1>Hello World</h1>\n    </div>\n  );\n}\n\nexport default App;',
            lastModified: Date.now()
          },
          {
            path: '/src/index.js',
            name: 'index.js',
            content: 'import React from "react";\nimport ReactDOM from "react-dom";\nimport App from "./App";\n\nReactDOM.render(\n  <React.StrictMode>\n    <App />\n  </React.StrictMode>,\n  document.getElementById("root")\n);',
            lastModified: Date.now()
          }
        ];
        
        setDirectories(defaultDirs);
        setFiles(defaultFiles);
        
        // Save to localStorage
        localStorage.setItem('fileSystem', JSON.stringify({
          files: defaultFiles,
          directories: defaultDirs
        }));
      } catch (err) {
        console.error('Error initializing file system:', err);
        setError('Failed to initialize file system');
      }
    };
    
    initFileSystem();
  }, []);
  
  // Save file system state to localStorage when it changes
  useEffect(() => {
    if (files.length > 0 || directories.length > 0) {
      localStorage.setItem('fileSystem', JSON.stringify({
        files,
        directories
      }));
    }
  }, [files, directories]);
  
  const getItemsInDirectory = (dirPath: string) => {
    const dirFiles = files.filter(file => {
      // Get parent directory of the file
      const fileDir = file.path.substring(0, file.path.lastIndexOf('/'));
      return fileDir === dirPath;
    });
    
    const subDirs = directories.filter(dir => {
      // Check if directory is a direct child of current path
      if (dir.path === dirPath) return false;
      const parentPath = dir.path.substring(0, dir.path.lastIndexOf('/')) || '/';
      return parentPath === dirPath;
    });
    
    return { files: dirFiles, directories: subDirs };
  };
  
  const createDirectory = (path: string, name: string): boolean => {
    const fullPath = path.endsWith('/') ? `${path}${name}` : `${path}/${name}`;
    
    // Check if directory already exists
    if (directories.some(dir => dir.path === fullPath)) {
      setError(`Directory '${name}' already exists`);
      return false;
    }
    
    setDirectories(prev => [...prev, { path: fullPath, name }]);
    return true;
  };
  
  const createFile = (dirPath: string, name: string, initialContent = ''): FileItem | false => {
    const fullPath = dirPath.endsWith('/') ? `${dirPath}${name}` : `${dirPath}/${name}`;
    
    // Check if file already exists
    if (files.some(file => file.path === fullPath)) {
      setError(`File '${name}' already exists`);
      return false;
    }
    
    const newFile: FileItem = {
      path: fullPath,
      name,
      content: initialContent,
      lastModified: Date.now()
    };
    
    setFiles(prev => [...prev, newFile]);
    return newFile;
  };
  
  const readFile = (path: string): string | null => {
    const file = files.find(file => file.path === path);
    if (!file) {
      setError(`File '${path}' not found`);
      return null;
    }
    
    return file.content;
  };
  
  const writeFile = (path: string, content: string): boolean => {
    setFiles(prev => 
      prev.map(file => 
        file.path === path 
          ? { ...file, content, lastModified: Date.now() } 
          : file
      )
    );
    
    return true;
  };
  
  const deleteItem = (path: string, isDirectory = false): boolean => {
    if (isDirectory) {
      // Check if directory has children
      const { files: childFiles, directories: childDirs } = getItemsInDirectory(path);
      if (childFiles.length > 0 || childDirs.length > 0) {
        setError(`Directory '${path}' is not empty`);
        return false;
      }
      
      setDirectories(prev => prev.filter(dir => dir.path !== path));
    } else {
      setFiles(prev => prev.filter(file => file.path !== path));
    }
    
    return true;
  };
  
  const renameItem = (oldPath: string, newPath: string, isDirectory = false): boolean => {
    if (isDirectory) {
      // Update directory path
      setDirectories(prev => 
        prev.map(dir => 
          dir.path === oldPath 
            ? { ...dir, path: newPath, name: newPath.split('/').pop() || '' } 
            : dir
        )
      );
      
      // Update paths of all children files and directories
      setFiles(prev => 
        prev.map(file => 
          file.path.startsWith(oldPath + '/') 
            ? { ...file, path: file.path.replace(oldPath, newPath) } 
            : file
        )
      );
      
      setDirectories(prev => 
        prev.map(dir => 
          dir.path !== oldPath && dir.path.startsWith(oldPath + '/') 
            ? { ...dir, path: dir.path.replace(oldPath, newPath) } 
            : dir
        )
      );
    } else {
      // Rename file
      setFiles(prev => 
        prev.map(file => 
          file.path === oldPath 
            ? { ...file, path: newPath, name: newPath.split('/').pop() || '' } 
            : file
        )
      );
    }
    
    return true;
  };
  
  const downloadProjectAsZip = async (): Promise<string> => {
    // This would be implemented to generate a zip file in a real app
    // For this demo we'll just return a JSON representation
    return JSON.stringify({ files, directories }, null, 2);
  };
  
  const importProjectFromZip = async (zipData: string): Promise<boolean> => {
    // This would be implemented to import from a real zip file
    // For this demo we'll just parse JSON
    try {
      const { files: newFiles, directories: newDirs } = JSON.parse(zipData);
      setFiles(newFiles);
      setDirectories(newDirs);
      return true;
    } catch (err) {
      console.error('Error importing project:', err);
      setError('Invalid project data format');
      return false;
    }
  };
  
  const value: FileSystemContextType = {
    files,
    directories,
    currentPath,
    loading,
    error,
    setCurrentPath,
    getItemsInDirectory,
    createDirectory,
    createFile,
    readFile,
    writeFile,
    deleteItem,
    renameItem,
    downloadProjectAsZip,
    importProjectFromZip
  };
  
  return <FileSystemContext.Provider value={value}>{children}</FileSystemContext.Provider>;
};