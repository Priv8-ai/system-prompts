import React from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import Editor from '../components/Editor';
import Chat from '../components/Chat';

const EditorPage = () => {
  return (
    <div className="h-full overflow-hidden">
      <PanelGroup direction="horizontal">
        <Panel defaultSize={70} minSize={30}>
          <Editor />
        </Panel>
        <PanelResizeHandle className="w-1 bg-editor-line hover:bg-primary hover:w-1 transition-all" />
        <Panel defaultSize={30} minSize={20}>
          <Chat />
        </Panel>
      </PanelGroup>
    </div>
  );
};

export default EditorPage;