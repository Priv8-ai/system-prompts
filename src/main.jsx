import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'
import { AIProvider } from './contexts/AIContext.jsx'
import { EditorProvider } from './contexts/EditorContext.jsx'
import { FileSystemProvider } from './contexts/FileSystemContext.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <FileSystemProvider>
        <AIProvider>
          <EditorProvider>
            <App />
          </EditorProvider>
        </AIProvider>
      </FileSystemProvider>
    </BrowserRouter>
  </React.StrictMode>,
)