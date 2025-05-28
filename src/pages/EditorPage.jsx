import React, { useState } from 'react';
import SplitPane from 'react-split-pane';
import Editor from '../components/Editor';
import Chat from '../components/Chat';

const EditorPage = () => {
  const [verticalSplit, setVerticalSplit] = useState(70); // Percentage for editor
  
  return (
    <div className="h-full overflow-hidden">
      <SplitPane
        split="vertical"
        minSize={300}
        defaultSize={`${verticalSplit}%`}
        onChange={(size) => {
          // Convert size to percentage
          const containerWidth = document.querySelector('.Pane1').parentElement.offsetWidth;
          const percentage = (size / containerWidth) * 100;
          setVerticalSplit(percentage);
        }}
      >
        <div className="h-full">
          <Editor />
        </div>
        <div className="h-full">
          <Chat />
        </div>
      </SplitPane>
    </div>
  );
};

export default EditorPage;