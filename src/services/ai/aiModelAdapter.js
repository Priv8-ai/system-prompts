import axios from 'axios';

// Factory function to create the appropriate adapter based on provider
export const createAIModelAdapter = (provider) => {
  switch (provider.id) {
    case 'ollama':
      return new OllamaAdapter(provider);
    case 'openai':
      return new OpenAIAdapter(provider);
    case 'anthropic':
      return new AnthropicAdapter(provider);
    case 'gemini':
      return new GeminiAdapter(provider);
    case 'deepseek':
      return new DeepSeekAdapter(provider);
    default:
      throw new Error(`Unknown provider: ${provider.id}`);
  }
};

// Base adapter class with common functionality
class BaseAIAdapter {
  constructor(provider) {
    this.provider = provider;
    this.axios = axios.create({
      headers: this.getHeaders()
    });
  }
  
  getHeaders() {
    return { 'Content-Type': 'application/json' };
  }
  
  formatMessages(messages) {
    // Default implementation, may be overridden by specific adapters
    return messages;
  }
  
  async listModels() {
    throw new Error('listModels must be implemented by subclasses');
  }
  
  async generateResponse(modelId, messages, systemPrompt = null, files = null) {
    throw new Error('generateResponse must be implemented by subclasses');
  }
}

// Ollama implementation
class OllamaAdapter extends BaseAIAdapter {
  constructor(provider) {
    super(provider);
    this.baseUrl = provider.url || 'http://localhost:11434';
  }
  
  formatMessages(messages) {
    // Format messages for Ollama API
    return messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));
  }
  
  async listModels() {
    try {
      const response = await axios.get(`${this.baseUrl}/api/tags`);
      return response.data.models.map(model => ({
        id: model.name,
        name: model.name,
        provider: this.provider.id,
        description: model.model || 'Ollama model'
      }));
    } catch (error) {
      console.error('Error listing Ollama models:', error);
      throw new Error('Failed to list Ollama models: ' + (error.response?.data?.error || error.message));
    }
  }
  
  async generateResponse(modelId, messages, systemPrompt = null, files = null) {
    const formattedMessages = this.formatMessages(messages);
    
    const payload = {
      model: modelId,
      messages: formattedMessages
    };
    
    // Add system prompt if provided
    if (systemPrompt) {
      payload.system = systemPrompt;
    }
    
    // For now, files are not directly supported by Ollama API
    // We could include file content in the messages if needed
    
    try {
      const response = await axios.post(`${this.baseUrl}/api/chat`, payload);
      return response.data.message.content;
    } catch (error) {
      console.error('Error generating response from Ollama:', error);
      throw new Error('Failed to generate response: ' + (error.response?.data?.error || error.message));
    }
  }
}

// OpenAI implementation
class OpenAIAdapter extends BaseAIAdapter {
  constructor(provider) {
    super(provider);
    this.baseUrl = 'https://api.openai.com/v1';
  }
  
  getHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.provider.apiKey}`
    };
  }
  
  async listModels() {
    if (!this.provider.apiKey) {
      return [
        { id: 'gpt-4o', name: 'GPT-4o', provider: 'openai', description: 'Most powerful OpenAI model (API key required)' },
        { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', provider: 'openai', description: 'Powerful and efficient OpenAI model (API key required)' },
        { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'openai', description: 'Fast and efficient OpenAI model (API key required)' }
      ];
    }
    
    try {
      const response = await axios.get(`${this.baseUrl}/models`, {
        headers: this.getHeaders()
      });
      
      // Filter for chat models
      return response.data.data
        .filter(model => model.id.includes('gpt'))
        .map(model => ({
          id: model.id,
          name: model.id,
          provider: 'openai',
          description: model.description || 'OpenAI model'
        }));
    } catch (error) {
      console.error('Error listing OpenAI models:', error);
      throw new Error('Failed to list OpenAI models: ' + (error.response?.data?.error?.message || error.message));
    }
  }
  
  async generateResponse(modelId, messages, systemPrompt = null, files = null) {
    const formattedMessages = [...messages]; // Clone the array
    
    // Add system prompt if provided
    if (systemPrompt) {
      formattedMessages.unshift({ role: 'system', content: systemPrompt });
    }
    
    const payload = {
      model: modelId,
      messages: formattedMessages,
      temperature: 0.7
    };
    
    // TODO: Handle files for vision models if needed
    
    try {
      const response = await axios.post(`${this.baseUrl}/chat/completions`, payload, {
        headers: this.getHeaders()
      });
      
      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('Error generating response from OpenAI:', error);
      throw new Error('Failed to generate response: ' + (error.response?.data?.error?.message || error.message));
    }
  }
}

// Anthropic implementation
class AnthropicAdapter extends BaseAIAdapter {
  constructor(provider) {
    super(provider);
    this.baseUrl = 'https://api.anthropic.com/v1';
  }
  
  getHeaders() {
    return {
      'Content-Type': 'application/json',
      'x-api-key': this.provider.apiKey,
      'anthropic-version': '2023-06-01'
    };
  }
  
  async listModels() {
    // Anthropic API doesn't provide a list models endpoint
    // Return hard-coded list of known models
    return [
      { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', provider: 'anthropic', description: 'Most powerful Claude model' },
      { id: 'claude-3-sonnet-20240229', name: 'Claude 3 Sonnet', provider: 'anthropic', description: 'Balanced Claude model' },
      { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku', provider: 'anthropic', description: 'Fast and efficient Claude model' }
    ];
  }
  
  formatMessages(messages) {
    // Convert message format from OpenAI style to Anthropic style
    let anthropicMessages = [];
    
    for (const msg of messages) {
      // Map roles from OpenAI format to Anthropic format
      const role = msg.role === 'assistant' ? 'assistant' : 'user';
      
      anthropicMessages.push({
        role,
        content: msg.content
      });
    }
    
    return anthropicMessages;
  }
  
  async generateResponse(modelId, messages, systemPrompt = null, files = null) {
    const formattedMessages = this.formatMessages(messages);
    
    const payload = {
      model: modelId,
      messages: formattedMessages,
      max_tokens: 4096
    };
    
    // Add system prompt if provided
    if (systemPrompt) {
      payload.system = systemPrompt;
    }
    
    try {
      const response = await axios.post(`${this.baseUrl}/messages`, payload, {
        headers: this.getHeaders()
      });
      
      return response.data.content[0].text;
    } catch (error) {
      console.error('Error generating response from Anthropic:', error);
      throw new Error('Failed to generate response: ' + (error.response?.data?.error?.message || error.message));
    }
  }
}

// Google Gemini implementation
class GeminiAdapter extends BaseAIAdapter {
  constructor(provider) {
    super(provider);
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta';
  }
  
  getHeaders() {
    return {
      'Content-Type': 'application/json'
    };
  }
  
  async listModels() {
    // Return hardcoded list of Gemini models
    return [
      { id: 'gemini-pro', name: 'Gemini Pro', provider: 'gemini', description: 'Google\'s advanced language model' },
      { id: 'gemini-pro-vision', name: 'Gemini Pro Vision', provider: 'gemini', description: 'Vision capabilities for Gemini Pro' }
    ];
  }
  
  formatMessages(messages) {
    // Convert to Gemini format
    return messages.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));
  }
  
  async generateResponse(modelId, messages, systemPrompt = null, files = null) {
    const formattedMessages = this.formatMessages(messages);
    
    let payload = {
      contents: formattedMessages,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048
      }
    };
    
    // For Gemini, we can add the system prompt as the first user message
    if (systemPrompt) {
      payload.contents.unshift({
        role: 'user',
        parts: [{ text: systemPrompt }]
      });
    }
    
    try {
      const response = await axios.post(
        `${this.baseUrl}/models/${modelId}:generateContent?key=${this.provider.apiKey}`,
        payload
      );
      
      return response.data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error('Error generating response from Gemini:', error);
      throw new Error('Failed to generate response: ' + (error.response?.data?.error?.message || error.message));
    }
  }
}

// DeepSeek implementation
class DeepSeekAdapter extends BaseAIAdapter {
  constructor(provider) {
    super(provider);
    this.baseUrl = 'https://api.deepseek.com/v1';
  }
  
  getHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.provider.apiKey}`
    };
  }
  
  async listModels() {
    // Return hardcoded list of DeepSeek models
    return [
      { id: 'deepseek-coder', name: 'DeepSeek Coder', provider: 'deepseek', description: 'Optimized for code generation and understanding' },
      { id: 'deepseek-chat', name: 'DeepSeek Chat', provider: 'deepseek', description: 'General purpose chat model' }
    ];
  }
  
  async generateResponse(modelId, messages, systemPrompt = null, files = null) {
    const payload = {
      model: modelId,
      messages: messages,
      temperature: 0.7,
      max_tokens: 4000
    };
    
    // Add system prompt if provided
    if (systemPrompt) {
      payload.messages.unshift({ role: 'system', content: systemPrompt });
    }
    
    try {
      const response = await axios.post(`${this.baseUrl}/chat/completions`, payload, {
        headers: this.getHeaders()
      });
      
      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('Error generating response from DeepSeek:', error);
      throw new Error('Failed to generate response: ' + (error.response?.data?.error?.message || error.message));
    }
  }
}