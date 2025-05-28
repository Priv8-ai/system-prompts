import React, { useEffect, useState } from 'react';
import { useAI } from '../contexts/AIContext';
import { FiCpu, FiLoader, FiCheck, FiAlertTriangle } from 'react-icons/fi';

const ModelGalleryPage = () => {
  const { 
    availableModels, 
    currentModel,
    selectModel, 
    refreshModels, 
    isLoading, 
    error,
    modelProviders
  } = useAI();
  
  const [selectedProvider, setSelectedProvider] = useState('all');
  
  // Refresh models on component mount if no models available
  useEffect(() => {
    if (availableModels.length === 0 && !isLoading) {
      refreshModels();
    }
  }, []);
  
  // Filter models based on selected provider
  const filteredModels = selectedProvider === 'all'
    ? availableModels
    : availableModels.filter(model => model.provider === selectedProvider);
  
  // Group models by provider for display
  const groupedModels = {};
  filteredModels.forEach(model => {
    if (!groupedModels[model.provider]) {
      groupedModels[model.provider] = [];
    }
    groupedModels[model.provider].push(model);
  });
  
  const getProviderName = (providerId) => {
    const provider = modelProviders.find(p => p.id === providerId);
    return provider ? provider.name : providerId;
  };
  
  // Check if any providers are configured but disabled
  const hasDisabledProviders = modelProviders.some(p => !p.enabled);
  
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">AI Models</h1>
        
        <div className="flex items-center">
          <select
            value={selectedProvider}
            onChange={(e) => setSelectedProvider(e.target.value)}
            className="mr-4 p-2 bg-surface border border-editor-line rounded text-white"
          >
            <option value="all">All Providers</option>
            {modelProviders
              .filter(provider => provider.enabled)
              .map(provider => (
                <option key={provider.id} value={provider.id}>
                  {provider.name}
                </option>
              ))}
          </select>
          
          <button 
            className={`p-2 rounded ${isLoading ? 'bg-gray-700 cursor-wait' : 'bg-primary hover:bg-primary/90'}`}
            onClick={refreshModels}
            disabled={isLoading}
          >
            <span className="flex items-center justify-center">
              <FiLoader className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh Models
            </span>
          </button>
        </div>
      </div>
      
      {hasDisabledProviders && (
        <div className="mb-6 p-3 bg-yellow-900/30 border border-yellow-700/30 rounded-md text-yellow-300 flex items-start">
          <FiAlertTriangle className="mt-1 mr-2 flex-shrink-0" />
          <div>
            <p className="font-medium">Some AI providers are disabled</p>
            <p className="text-sm mt-1">Enable more providers in Settings to access additional models.</p>
          </div>
        </div>
      )}
      
      {error && (
        <div className="mb-6 p-3 bg-red-900/30 border border-red-700/30 rounded-md text-red-300">
          <p className="font-medium">Error loading models</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      )}
      
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <FiLoader className="text-4xl animate-spin text-primary mb-4" />
          <p>Loading models...</p>
        </div>
      ) : filteredModels.length === 0 ? (
        <div className="text-center py-12">
          <FiCpu className="text-5xl mx-auto mb-4 text-gray-500" />
          <h3 className="text-xl font-semibold mb-2">No models available</h3>
          <p className="text-gray-400 mb-4">
            {selectedProvider === 'all' 
              ? "No AI models were found from any provider." 
              : `No AI models were found from ${getProviderName(selectedProvider)}.`}
          </p>
          <p className="text-gray-500 text-sm max-w-lg mx-auto">
            Check your provider settings and ensure Ollama is running locally or API keys are configured correctly.
          </p>
        </div>
      ) : (
        <div>
          {Object.entries(groupedModels).map(([providerId, models]) => (
            <div key={providerId} className="mb-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <span className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center mr-2">
                  <FiCpu className="text-primary" />
                </span>
                {getProviderName(providerId)}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {models.map((model) => (
                  <div 
                    key={`${model.provider}-${model.id}`}
                    className={`p-4 rounded-lg cursor-pointer transition-all ${
                      currentModel && currentModel.id === model.id && currentModel.provider === model.provider
                        ? 'bg-primary/20 border-2 border-primary'
                        : 'bg-surface border border-editor-line hover:border-primary/50'
                    }`}
                    onClick={() => selectModel(model)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold">{model.name}</h3>
                      {currentModel && currentModel.id === model.id && currentModel.provider === model.provider && (
                        <span className="bg-primary/20 p-1 rounded-full">
                          <FiCheck className="text-primary" size={14} />
                        </span>
                      )}
                    </div>
                    
                    {model.description && (
                      <p className="text-sm text-gray-400 mb-3">{model.description}</p>
                    )}
                    
                    <div className="text-xs text-gray-500">
                      {model.provider} · {model.id}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ModelGalleryPage;