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
        <PanelResizeHandle>
          {({ isHovered }) => (
            <div 
              className="h-full" 
              style={{
                backgroundColor: isHovered ? 'rgba(59, 130, 246, 0.7)' : 'rgba(30, 30, 30, 0.6)',
                width: isHovered ? '3px' : '1px',
                transition: 'background-color 0.2s, width 0.2s',
                opacity: isHovered ? 1 : 0.6
              }}
            ></div>
          )}
        </PanelResizeHandle>
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