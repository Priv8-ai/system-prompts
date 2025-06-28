'use client';

import React, { useState } from 'react';
import { useFileSystem } from '@/contexts/FileSystemContext';
import { useEditor } from '@/contexts/EditorContext';
import { FiFolder, FiFolderPlus, FiFile, FiFilePlus, FiChevronRight, FiTrash2, FiEdit, FiCheck, FiX } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

export function Sidebar() {
  const { currentPath, directories, getItemsInDirectory, createDirectory, createFile, readFile } = useFileSystem();
  const { openFile } = useEditor();
  const [expandedDirs, setExpandedDirs] = useState({ '/': true });
  const [newItemType, setNewItemType] = useState<'file' | 'directory' | null>(null);
  const [newItemName, setNewItemName] = useState('');
  const [newItemParentDir, setNewItemParentDir] = useState('');

  const toggleDir = (dirPath: string) => {
    setExpandedDirs(prev => ({
      ...prev,
      [dirPath]: !prev[dirPath]
    }));
  };

  const handleOpenFile = (filePath: string) => {
    const content = readFile(filePath);
    if (content !== null) {
      openFile(filePath, content);
    }
  };

  const startCreatingItem = (type: 'file' | 'directory', parentDir: string) => {
    setNewItemType(type);
    setNewItemParentDir(parentDir);
    setNewItemName('');
  };

  const handleCreateItem = () => {
    if (!newItemName.trim()) return;
    
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

  const renderTree = (dirPath: string, level = 0) => {
    const { files, directories: subDirs } = getItemsInDirectory(dirPath);
    const isExpanded = expandedDirs[dirPath];
    
    return (
      <div className={`${level > 0 ? 'ml-4' : ''} space-y-1`}>
        {/* Render directories */}
        {subDirs.map((dir) => (
          <motion.div
            key={dir.path}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div 
              className="filetree-folder group"
              onClick={() => toggleDir(dir.path)}
              whileHover={{ x: 2 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <motion.span
                className="filetree-chevron mr-2"
                animate={{ rotate: isExpanded ? 90 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <FiChevronRight size={14} />
              </motion.span>
              <FiFolder className="filetree-folder-icon" />
              <span className="filetree-folder-name flex-1">{dir.name}</span>
              <div className="filetree-actions">
                <motion.button 
                  className="filetree-action-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    startCreatingItem('directory', dir.path);
                  }}
                  title="New Folder"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <FiFolderPlus size={14} />
                </motion.button>
                <motion.button 
                  className="filetree-action-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    startCreatingItem('file', dir.path);
                  }}
                  title="New File"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <FiFilePlus size={14} />
                </motion.button>
              </div>
            </motion.div>
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {renderTree(dir.path, level + 1)}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
        
        {/* Render files */}
        {files.map((file) => (
          <motion.div 
            key={file.path}
            className="filetree-file group"
            onClick={() => handleOpenFile(file.path)}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
            whileHover={{ x: 2 }}
          >
            <FiFile className={`filetree-file-icon ${getFileIcon(file.name)}`} />
            <span className="filetree-file-name flex-1">{file.name}</span>
          </motion.div>
        ))}
        
        {/* New item creation form */}
        <AnimatePresence>
          {newItemType && newItemParentDir === dirPath && (
            <motion.div
              className={`flex items-center py-2 px-3 ${level > 0 ? 'ml-4' : ''} bg-surface/50 rounded-lg border border-border glass-effect`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              {newItemType === 'directory' ? 
                <FiFolder className="mr-2 text-yellow-400" /> : 
                <FiFile className="mr-2 text-blue-400" />
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
                className="input-field flex-1 py-1 px-2 text-sm"
                autoFocus
              />
              <motion.button 
                onClick={handleCreateItem} 
                className="ml-2 filetree-action-btn text-green-500 hover:bg-green-500/20"
                title="Create"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <FiCheck size={14} />
              </motion.button>
              <motion.button 
                onClick={cancelCreating} 
                className="ml-1 filetree-action-btn text-red-500 hover:bg-red-500/20"
                title="Cancel"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <FiX size={14} />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="w-64 bg-surface border-r border-border overflow-y-auto glass-effect">
      <div className="p-4">
        {/* Header */}
        <motion.div
          className="flex justify-between items-center mb-4"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h2 className="text-lg font-semibold text-text-primary bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
            Files
          </h2>
          <div className="flex space-x-1">
            <motion.button 
              className="filetree-action-btn hover:bg-primary-500/20" 
              onClick={() => startCreatingItem('directory', '/')}
              title="New Folder"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <FiFolderPlus size={16} />
            </motion.button>
            <motion.button 
              className="filetree-action-btn hover:bg-primary-500/20"
              onClick={() => startCreatingItem('file', '/')}
              title="New File"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <FiFilePlus size={16} />
            </motion.button>
          </div>
        </motion.div>
        
        {/* File Tree */}
        <motion.div
          className="space-y-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <motion.div 
            className="filetree-folder group"
            onClick={() => toggleDir('/')}
            whileHover={{ x: 2 }}
          >
            <motion.span
              className="filetree-chevron mr-2"
              animate={{ rotate: expandedDirs['/'] ? 90 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <FiChevronRight size={14} />
            </motion.span>
            <FiFolder className="filetree-folder-icon" />
            <span className="filetree-folder-name">Project Root</span>
          </motion.div>
          
          <AnimatePresence>
            {expandedDirs['/'] && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                {renderTree('/')}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
        
        {/* New item creation at root */}
        <AnimatePresence>
          {newItemType && newItemParentDir === '/' && (
            <motion.div
              className="flex items-center py-2 px-3 ml-4 bg-surface/50 rounded-lg border border-border mt-2 glass-effect"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              {newItemType === 'directory' ? 
                <FiFolder className="mr-2 text-yellow-400" /> : 
                <FiFile className="mr-2 text-blue-400" />
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
                className="input-field flex-1 py-1 px-2 text-sm"
                autoFocus
              />
              <motion.button 
                onClick={handleCreateItem} 
                className="ml-2 filetree-action-btn text-green-500 hover:bg-green-500/20"
                title="Create"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <FiCheck size={14} />
              </motion.button>
              <motion.button 
                onClick={cancelCreating} 
                className="ml-1 filetree-action-btn text-red-500 hover:bg-red-500/20"
                title="Cancel"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <FiX size={14} />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}