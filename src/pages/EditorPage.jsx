import React, { useState } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import Editor from '../components/Editor';
import Chat from '../components/Chat';

const EditorPage = () => {
  const [verticalSplit, setVerticalSplit] = useState(70); // Percentage for editor
  
  return (
    <div className="h-full overflow-hidden">
      <PanelGroup direction="horizontal" onLayout={(sizes) => {
        setVerticalSplit(sizes[0]);
      }}>
        <Panel defaultSize={verticalSplit} minSize={20}>
          <div className="h-full">
            <Editor />
          </div>
        </Panel>
        <PanelResizeHandle className="w-2 bg-editor-line hover:bg-primary/30 transition-colors" />
        <Panel minSize={20}>
          <div className="h-full">
            <Chat />
          </div>
        </Panel>
      </PanelGroup>
    </div>
  );
};

export default EditorPage;