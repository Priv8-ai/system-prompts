'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createAIModelAdapter } from '@/services/ai/aiModelAdapter';

interface AIModel {
  id: string;
  name: string;
  provider: string;
  description?: string;
}

interface AIProvider {
  id: string;
  name: string;
  url?: string;
  apiKey?: string;
  enabled: boolean;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  model?: string;
  provider?: string;
}

interface AIContextType {
  currentModel: AIModel | null;
  availableModels: AIModel[];
  modelProviders: AIProvider[];
  isLoading: boolean;
  error: string | null;
  chatHistory: ChatMessage[];
  providerErrors: Record<string, string>;
  refreshModels: () => Promise<void>;
  updateProvider: (providerId: string, updates: Partial<AIProvider>) => void;
  sendMessage: (message: string, systemPrompt?: string | null, files?: any[] | null) => Promise<ChatMessage | null>;
  clearChatHistory: () => void;
  selectModel: (model: AIModel) => void;
  clearError: () => void;
  clearProviderError: (providerId: string) => void;
}

const AIContext = createContext<AIContextType | null>(null);

export const useAI = () => {
  const context = useContext(AIContext);
  if (!context) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
};

interface AIProviderProps {
  children: ReactNode;
}

export const AIProvider = ({ children }: AIProviderProps) => {
  const [currentModel, setCurrentModel] = useState<AIModel | null>(null);
  const [availableModels, setAvailableModels] = useState<AIModel[]>([]);
  const [modelProviders, setModelProviders] = useState<AIProvider[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [providerErrors, setProviderErrors] = useState<Record<string, string>>({});

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
          const defaultProviders: AIProvider[] = [
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
    setProviderErrors({});
    
    try {
      const models: AIModel[] = [];
      const errors: Record<string, string> = {};
      
      // Fetch models from each enabled provider
      for (const provider of modelProviders) {
        if (provider.enabled) {
          try {
            const adapter = createAIModelAdapter(provider);
            const providerModels = await adapter.listModels();
            models.push(...providerModels);
            
            // Clear any previous errors for this provider
            if (errors[provider.id]) {
              delete errors[provider.id];
            }
          } catch (err: any) {
            console.error(`Failed to fetch models from ${provider.name}:`, err);
            errors[provider.id] = err.message;
          }
        }
      }
      
      setAvailableModels(models);
      setProviderErrors(errors);
      
      // Set first model as current if none selected and models are available
      if (!currentModel && models.length > 0) {
        setCurrentModel(models[0]);
      }
      
      // Set a general error message if all enabled providers failed
      const enabledProviders = modelProviders.filter(p => p.enabled);
      const failedProviders = Object.keys(errors);
      
      if (enabledProviders.length > 0 && failedProviders.length === enabledProviders.length) {
        setError('All enabled AI providers are currently unavailable. Please check your connections and try again.');
      } else if (failedProviders.length > 0) {
        const failedNames = failedProviders.map(id => 
          modelProviders.find(p => p.id === id)?.name || id
        );
        setError(`Some providers are unavailable: ${failedNames.join(', ')}`);
      }
    } catch (err: any) {
      console.error('Error refreshing models:', err);
      setError('Failed to refresh models. Please check your connections and API keys.');
    } finally {
      setIsLoading(false);
    }
  };

  const updateProvider = (providerId: string, updates: Partial<AIProvider>) => {
    setModelProviders(prevProviders => 
      prevProviders.map(provider => 
        provider.id === providerId 
          ? { ...provider, ...updates } 
          : provider
      )
    );
    
    // Clear provider-specific errors when updating
    setProviderErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[providerId];
      return newErrors;
    });
  };

  const sendMessage = async (message: string, systemPrompt: string | null = null, files: any[] | null = null): Promise<ChatMessage | null> => {
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
      const userMessage: ChatMessage = { role: 'user', content: message, timestamp: Date.now() };
      setChatHistory(prev => [...prev, userMessage]);
      
      // Send message to the model
      const response = await adapter.generateResponse(
        currentModel.id, 
        [...chatHistory, userMessage], 
        systemPrompt,
        files
      );
      
      // Add response to history
      const assistantMessage: ChatMessage = { 
        role: 'assistant', 
        content: response, 
        timestamp: Date.now(),
        model: currentModel.id,
        provider: currentModel.provider
      };
      
      setChatHistory(prev => [...prev, assistantMessage]);
      return assistantMessage;
    } catch (err: any) {
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

  const selectModel = (model: AIModel) => {
    setCurrentModel(model);
  };

  const clearError = () => {
    setError(null);
  };

  const clearProviderError = (providerId: string) => {
    setProviderErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[providerId];
      return newErrors;
    });
  };

  const value: AIContextType = {
    currentModel,
    availableModels,
    modelProviders,
    isLoading,
    error,
    chatHistory,
    providerErrors,
    refreshModels,
    updateProvider,
    sendMessage,
    clearChatHistory,
    selectModel,
    clearError,
    clearProviderError
  };

  return <AIContext.Provider value={value}>{children}</AIContext.Provider>;
};