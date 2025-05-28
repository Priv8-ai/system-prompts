import React from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import Editor from '../components/Editor';
import Chat from '../components/Chat';

const EditorPage = () => {
  return (
    <div className="h-full overflow-hidden">
      <PanelGroup direction="horizontal">
        <Panel defaultSize={70} minSize={20}>
          <div className="h-full">
            <Editor />
          </div>
        </Panel>
        <PanelResizeHandle />
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