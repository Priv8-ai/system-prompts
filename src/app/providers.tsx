'use client';

import React from 'react';
import { AIProvider } from '@/contexts/AIContext';
import { EditorProvider } from '@/contexts/EditorContext';
import { FileSystemProvider } from '@/contexts/FileSystemContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <FileSystemProvider>
      <AIProvider>
        <EditorProvider>
          {children}
        </EditorProvider>
      </AIProvider>
    </FileSystemProvider>
  );
}