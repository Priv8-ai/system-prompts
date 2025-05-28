import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import EditorPage from './pages/EditorPage';
import SettingsPage from './pages/SettingsPage';
import ModelGalleryPage from './pages/ModelGalleryPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<EditorPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="models" element={<ModelGalleryPage />} />
      </Route>
    </Routes>
  );
}

export default App;