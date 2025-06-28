'use client';

import React, { useEffect, useState } from 'react';
import { useAI } from '@/contexts/AIContext';
import { FiCpu, FiLoader, FiCheck, FiAlertTriangle, FiRefreshCw } from 'react-icons/fi';
import { Layout } from '@/components/layout/Layout';
import { motion, AnimatePresence } from 'framer-motion';

export function ModelGalleryPage() {
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
  const groupedModels: Record<string, any[]> = {};
  filteredModels.forEach(model => {
    if (!groupedModels[model.provider]) {
      groupedModels[model.provider] = [];
    }
    groupedModels[model.provider].push(model);
  });
  
  const getProviderName = (providerId: string) => {
    const provider = modelProviders.find(p => p.id === providerId);
    return provider ? provider.name : providerId;
  };
  
  // Check if any providers are configured but disabled
  const hasDisabledProviders = modelProviders.some(p => !p.enabled);
  
  return (
    <Layout>
      <motion.div
        className="container mx-auto py-6 px-4 h-full overflow-y-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex justify-between items-center mb-6">
          <motion.h1
            className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            AI Models
          </motion.h1>
          
          <motion.div
            className="flex items-center space-x-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <select
              value={selectedProvider}
              onChange={(e) => setSelectedProvider(e.target.value)}
              className="input-field py-2 px-3"
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
            
            <motion.button 
              className={`btn-primary flex items-center space-x-2 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={refreshModels}
              disabled={isLoading}
              whileHover={{ scale: isLoading ? 1 : 1.02 }}
              whileTap={{ scale: isLoading ? 1 : 0.98 }}
            >
              <motion.div
                animate={{ rotate: isLoading ? 360 : 0 }}
                transition={{ duration: 1, repeat: isLoading ? Infinity : 0, ease: "linear" }}
              >
                <FiRefreshCw />
              </motion.div>
              <span>Refresh Models</span>
            </motion.button>
          </motion.div>
        </div>
        
        <AnimatePresence>
          {hasDisabledProviders && (
            <motion.div
              className="mb-6 p-4 bg-yellow-900/30 border border-yellow-700/30 rounded-lg text-yellow-300 flex items-start glass-effect"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <FiAlertTriangle className="mt-1 mr-3 flex-shrink-0" />
              <div>
                <p className="font-medium">Some AI providers are disabled</p>
                <p className="text-sm mt-1">Enable more providers in Settings to access additional models.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <AnimatePresence>
          {error && (
            <motion.div
              className="mb-6 error-message"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <p className="font-medium">Error loading models</p>
              <p className="text-sm mt-1">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>
        
        {isLoading ? (
          <motion.div
            className="flex flex-col items-center justify-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <FiLoader className="text-4xl text-primary-500 mb-4" />
            </motion.div>
            <p>Loading models...</p>
          </motion.div>
        ) : filteredModels.length === 0 ? (
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <FiCpu className="text-5xl mx-auto mb-4 text-gray-500" />
            <h3 className="text-xl font-semibold mb-2">No models available</h3>
            <p className="text-text-secondary mb-4">
              {selectedProvider === 'all' 
                ? "No AI models were found from any provider." 
                : `No AI models were found from ${getProviderName(selectedProvider)}.`}
            </p>
            <p className="text-text-muted text-sm max-w-lg mx-auto">
              Check your provider settings and ensure Ollama is running locally or API keys are configured correctly.
            </p>
          </motion.div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedModels).map(([providerId, models]) => (
              <motion.div
                key={providerId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <motion.span
                    className="w-8 h-8 bg-primary-500/20 rounded-full flex items-center justify-center mr-3"
                    whileHover={{ scale: 1.1 }}
                  >
                    <FiCpu className="text-primary-400" />
                  </motion.span>
                  {getProviderName(providerId)}
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {models.map((model, index) => (
                    <motion.div
                      key={`${model.provider}-${model.id}`}
                      className={`card cursor-pointer transition-all ${
                        currentModel && currentModel.id === model.id && currentModel.provider === model.provider
                          ? 'border-primary-500 bg-primary-500/10 gradient-border'
                          : 'hover:border-border-light'
                      }`}
                      onClick={() => selectModel(model)}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-semibold text-text-primary">{model.name}</h3>
                        <AnimatePresence>
                          {currentModel && currentModel.id === model.id && currentModel.provider === model.provider && (
                            <motion.span
                              className="bg-primary-500/20 p-1.5 rounded-full"
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0, opacity: 0 }}
                              transition={{ type: "spring", stiffness: 400, damping: 10 }}
                            >
                              <FiCheck className="text-primary-400" size={14} />
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </div>
                      
                      {model.description && (
                        <p className="text-sm text-text-secondary mb-3">{model.description}</p>
                      )}
                      
                      <div className="text-xs text-text-muted flex items-center justify-between">
                        <span>{model.provider} · {model.id}</span>
                        {currentModel && currentModel.id === model.id && currentModel.provider === model.provider && (
                          <motion.span
                            className="text-primary-400 font-medium"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                          >
                            Active
                          </motion.span>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </Layout>
  );
}