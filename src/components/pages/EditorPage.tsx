'use client';

import React from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { Editor } from '@/components/editor/Editor';
import { Chat } from '@/components/chat/Chat';
import { Layout } from '@/components/layout/Layout';
import { motion } from 'framer-motion';

export function EditorPage() {
  return (
    <Layout>
      <motion.div
        className="h-full overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <PanelGroup direction="horizontal">
          <Panel defaultSize={70} minSize={30}>
            <Editor />
          </Panel>
          <PanelResizeHandle className="w-1 bg-border hover:bg-primary-500 hover:w-1 transition-all" />
          <Panel defaultSize={30} minSize={20}>
            <Chat />
          </Panel>
        </PanelGroup>
      </motion.div>
    </Layout>
  );
}