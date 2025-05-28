import React, { createContext, useContext, useState, useEffect } from 'react';
import { createAIModelAdapter } from '../services/ai/aiModelAdapter';

const AIContext = createContext(null);

export const useAI = () => {
  const context = useContext(AIContext);
  if (!context) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
};

export const AIProvider = ({ children }) => {
  const [currentModel, setCurrentModel] = useState(null);
  const [availableModels, setAvailableModels] = useState([]);
  const [modelProviders, setModelProviders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);

  // Load available models from localStorage on component mount
  useEffect(() => {
    const loadInitialState = () => {
      try {
        // Load saved providers
        const savedProviders = localStorage.getItem('aiProviders');
        if (savedProviders) {
          setModelProviders(JSON.parse(savedProviders));
        } else {
          // Set default providers
          const defaultProviders = [
            { id: 'ollama', name: 'Ollama', url: 'http://localhost:11434', enabled: true },
            { id: 'openai', name: 'OpenAI', apiKey: '', enabled: false },
            { id: 'anthropic', name: 'Anthropic', apiKey: '', enabled: false },
            { id: 'gemini', name: 'Google Gemini', apiKey: '', enabled: false },
            { id: 'deepseek', name: 'DeepSeek', apiKey: '', enabled: false }
          ];
          setModelProviders(defaultProviders);
          localStorage.setItem('aiProviders', JSON.stringify(defaultProviders));
        }

        // Load saved models
        const savedModels = localStorage.getItem('availableModels');
        if (savedModels) {
          setAvailableModels(JSON.parse(savedModels));
        }

        // Load current model
        const savedCurrentModel = localStorage.getItem('currentModel');
        if (savedCurrentModel) {
          setCurrentModel(JSON.parse(savedCurrentModel));
        }

        // Load chat history
        const savedHistory = localStorage.getItem('chatHistory');
        if (savedHistory) {
          setChatHistory(JSON.parse(savedHistory));
        }
      } catch (error) {
        console.error('Error loading AI state:', error);
        setError('Failed to load AI configuration');
      }
    };

    loadInitialState();
  }, []);

  // Save state to localStorage when it changes
  useEffect(() => {
    if (modelProviders.length > 0) {
      localStorage.setItem('aiProviders', JSON.stringify(modelProviders));
    }
  }, [modelProviders]);

  useEffect(() => {
    if (availableModels.length > 0) {
      localStorage.setItem('availableModels', JSON.stringify(availableModels));
    }
  }, [availableModels]);

  useEffect(() => {
    if (currentModel) {
      localStorage.setItem('currentModel', JSON.stringify(currentModel));
    }
  }, [currentModel]);

  useEffect(() => {
    if (chatHistory.length > 0) {
      localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
    }
  }, [chatHistory]);

  const refreshModels = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const models = [];
      
      // Fetch models from each enabled provider
      for (const provider of modelProviders) {
        if (provider.enabled) {
          try {
            const adapter = createAIModelAdapter(provider);
            const providerModels = await adapter.listModels();
            models.push(...providerModels);
          } catch (err) {
            console.error(`Failed to fetch models from ${provider.name}:`, err);
            setError((prev) => prev ? `${prev}, ${provider.name}` : `Failed to fetch models from: ${provider.name}`);
          }
        }
      }
      
      setAvailableModels(models);
      
      // Set first model as current if none selected
      if (!currentModel && models.length > 0) {
        setCurrentModel(models[0]);
      }
    } catch (err) {
      console.error('Error refreshing models:', err);
      setError('Failed to refresh models. Check your connections and API keys.');
    } finally {
      setIsLoading(false);
    }
  };

  const updateProvider = (providerId, updates) => {
    setModelProviders(prevProviders => 
      prevProviders.map(provider => 
        provider.id === providerId 
          ? { ...provider, ...updates } 
          : provider
      )
    );
  };

  const sendMessage = async (message, systemPrompt = null, files = null) => {
    if (!currentModel) {
      setError('No model selected');
      return null;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Find the provider for the current model
      const provider = modelProviders.find(p => p.id === currentModel.provider);
      if (!provider) {
        throw new Error(`Provider ${currentModel.provider} not found`);
      }
      
      const adapter = createAIModelAdapter(provider);
      
      // Add message to history
      const userMessage = { role: 'user', content: message, timestamp: Date.now() };
      setChatHistory(prev => [...prev, userMessage]);
      
      // Send message to the model
      const response = await adapter.generateResponse(
        currentModel.id, 
        [...chatHistory, userMessage], 
        systemPrompt,
        files
      );
      
      // Add response to history
      const assistantMessage = { 
        role: 'assistant', 
        content: response, 
        timestamp: Date.now(),
        model: currentModel.id,
        provider: currentModel.provider
      };
      
      setChatHistory(prev => [...prev, assistantMessage]);
      return assistantMessage;
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err.message || 'Failed to send message');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const clearChatHistory = () => {
    setChatHistory([]);
    localStorage.removeItem('chatHistory');
  };

  const selectModel = (model) => {
    setCurrentModel(model);
  };

  const value = {
    currentModel,
    availableModels,
    modelProviders,
    isLoading,
    error,
    chatHistory,
    refreshModels,
    updateProvider,
    sendMessage,
    clearChatHistory,
    selectModel
  };

  return <AIContext.Provider value={value}>{children}</AIContext.Provider>;
};