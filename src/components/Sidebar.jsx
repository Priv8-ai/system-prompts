import React, { useState } from 'react';
import { useFileSystem } from '../contexts/FileSystemContext';
import { useEditor } from '../contexts/EditorContext';
import { FiFolder, FiFolderPlus, FiFile, FiFilePlus, FiChevronRight, FiTrash2, FiEdit } from 'react-icons/fi';

const Sidebar = () => {
  const { currentPath, directories, getItemsInDirectory, createDirectory, createFile, readFile } = useFileSystem();
  const { openFile } = useEditor();
  const [expandedDirs, setExpandedDirs] = useState({ '/': true });
  const [newItemType, setNewItemType] = useState(null);
  const [newItemName, setNewItemName] = useState('');
  const [newItemParentDir, setNewItemParentDir] = useState('');

  const toggleDir = (dirPath) => {
    setExpandedDirs(prev => ({
      ...prev,
      [dirPath]: !prev[dirPath]
    }));
  };

  const handleOpenFile = (filePath) => {
    const content = readFile(filePath);
    if (content !== null) {
      openFile(filePath, content);
    }
  };

  const startCreatingItem = (type, parentDir) => {
    setNewItemType(type);
    setNewItemParentDir(parentDir);
    setNewItemName('');
  };

  const handleCreateItem = () => {
    if (!newItemName) return;
    
    if (newItemType === 'directory') {
      createDirectory(newItemParentDir, newItemName);
    } else if (newItemType === 'file') {
      const newFile = createFile(newItemParentDir, newItemName);
      if (newFile) {
        handleOpenFile(newFile.path);
      }
    }
    
    // Reset state
    setNewItemType(null);
    setNewItemName('');
    setNewItemParentDir('');
  };

  const cancelCreating = () => {
    setNewItemType(null);
    setNewItemName('');
    setNewItemParentDir('');
  };

  // Function to get file icon based on file extension
  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    switch(extension) {
      case 'js':
      case 'jsx':
        return 'text-yellow-400';
      case 'ts':
      case 'tsx':
        return 'text-blue-500';
      case 'css':
        return 'text-blue-400';
      case 'html':
        return 'text-orange-400';
      case 'json':
        return 'text-green-300';
      case 'md':
        return 'text-purple-400';
      default:
        return 'text-blue-400';
    }
  };

  const renderTree = (dirPath, level = 0) => {
    const { files, directories: subDirs } = getItemsInDirectory(dirPath);
    const isExpanded = expandedDirs[dirPath];
    
    return (
      <div className={`ml-${level > 0 ? '4' : '0'}`}>
        {/* Render directories */}
        {subDirs.map((dir) => (
          <div key={dir.path}>
            <div 
              className="filetree-folder"
              onClick={() => toggleDir(dir.path)}
            >
              <span className="filetree-chevron mr-1">
                <FiChevronRight 
                  size={14} 
                  className={`${isExpanded ? 'filetree-chevron-expanded' : ''}`}
                  style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}
                />
              </span>
              <FiFolder className="filetree-folder-icon" />
              <span className="filetree-folder-name">{dir.name}</span>
              <div className="filetree-actions">
                <button 
                  className="filetree-action-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    startCreatingItem('directory', dir.path);
                  }}
                  title="New Folder"
                >
                  <FiFolderPlus size={14} />
                </button>
                <button 
                  className="filetree-action-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    startCreatingItem('file', dir.path);
                  }}
                  title="New File"
                >
                  <FiFilePlus size={14} />
                </button>
              </div>
            </div>
            {isExpanded && renderTree(dir.path, level + 1)}
          </div>
        ))}
        
        {/* Render files */}
        {files.map((file) => (
          <div 
            key={file.path}
            className="filetree-file"
            onClick={() => handleOpenFile(file.path)}
          >
            <FiFile className={`filetree-file-icon ${getFileIcon(file.name)}`} />
            <span className="filetree-file-name">{file.name}</span>
          </div>
        ))}
        
        {/* New item creation form */}
        {newItemType && newItemParentDir === dirPath && (
          <div className={`flex items-center py-1 ${level > 0 ? 'ml-5' : 'ml-0'} px-1`}>
            {newItemType === 'directory' ? 
              <FiFolder className="mr-1 text-yellow-400" /> : 
              <FiFile className="mr-1 text-blue-400" />
            }
            <input
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateItem();
                if (e.key === 'Escape') cancelCreating();
              }}
              placeholder={newItemType === 'directory' ? 'Folder name...' : 'File name...'}
              className="bg-editor-bg border border-editor-line rounded px-1 py-0.5 text-sm w-full"
              autoFocus
            />
            <button onClick={handleCreateItem} className="ml-1 filetree-action-btn text-green-500">
              <FiEdit size={14} />
            </button>
            <button onClick={cancelCreating} className="ml-1 filetree-action-btn text-red-500">
              <FiTrash2 size={14} />
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-64 bg-surface border-r border-editor-line overflow-y-auto">
      <div className="p-3">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold">Files</h2>
          <div className="flex">
            <button 
              className="filetree-action-btn" 
              onClick={() => startCreatingItem('directory', '/')}
              title="New Folder"
            >
              <FiFolderPlus size={16} />
            </button>
            <button 
              className="filetree-action-btn"
              onClick={() => startCreatingItem('file', '/')}
              title="New File"
            >
              <FiFilePlus size={16} />
            </button>
          </div>
        </div>
        
        <div className="group">
          <div 
            className="filetree-folder"
            onClick={() => toggleDir('/')}
          >
            <span className="filetree-chevron mr-1">
              <FiChevronRight 
                size={14}
                className={`${expandedDirs['/'] ? 'filetree-chevron-expanded' : ''}`}
                style={{ transform: expandedDirs['/'] ? 'rotate(90deg)' : 'rotate(0deg)' }}
              />
            </span>
            <FiFolder className="filetree-folder-icon" />
            <span className="filetree-folder-name">Project Root</span>
          </div>
          {expandedDirs['/'] && renderTree('/')}
        </div>
        
        {/* New item creation at root */}
        {newItemType && newItemParentDir === '/' && (
          <div className="flex items-center py-1 ml-4">
            {newItemType === 'directory' ? 
              <FiFolder className="mr-1 text-yellow-400" /> : 
              <FiFile className="mr-1 text-blue-400" />
            }
            <input
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateItem();
                if (e.key === 'Escape') cancelCreating();
              }}
              placeholder={newItemType === 'directory' ? 'Folder name...' : 'File name...'}
              className="bg-editor-bg border border-editor-line rounded px-1 py-0.5 text-sm w-full"
              autoFocus
            />
            <button onClick={handleCreateItem} className="ml-1 filetree-action-btn text-green-500">
              <FiEdit size={14} />
            </button>
            <button onClick={cancelCreating} className="ml-1 filetree-action-btn text-red-500">
              <FiTrash2 size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;