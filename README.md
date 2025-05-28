# AI Code Editor

A powerful code editor with AI capabilities, allowing you to chat with multiple AI models, analyze code, debug issues, and find vulnerabilities.

## Features

- 🧠 Multi-model AI support including:
  - Ollama (local models)
  - OpenAI
  - Anthropic Claude
  - Google Gemini
  - DeepSeek
- 📝 Modern code editor with syntax highlighting
- 🔍 Code analysis and vulnerability detection
- 🐛 Smart debugging suggestions
- 🚀 Multiple specialized AI modes
- 💾 File system management
- 🌙 Dark mode interface

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- For Ollama support: [Ollama](https://ollama.ai) installed and running
- API keys for cloud providers (OpenAI, Anthropic, etc.) as needed

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

## Configuration

### AI Providers

Configure AI providers in the Settings page:

- **Ollama**: Set the URL (default: http://localhost:11434)
- **OpenAI, Anthropic, Gemini, DeepSeek**: Add your API keys

### Editor Settings

Customize the editor in the Settings page:
- Theme
- Font size
- Tab size
- Word wrap
- Minimap

## Usage

1. Create or open files using the sidebar
2. Edit code in the editor pane
3. Chat with AI using the chat panel
4. Select different AI roles for specialized assistance:
   - Code Explainer
   - Code Generator
   - Debugger
   - Security Auditor
   - Code Refactorer
   - Test Generator

## Development

### Project Structure

- `/src` - Source code
  - `/components` - React components
  - `/contexts` - React context providers
  - `/pages` - Page components
  - `/services` - Service modules for AI and file operations
  - `/utils` - Utility functions

### Building for Production

```bash
npm run build
```

## License

This project is licensed under the GPL-3.0 License - see the LICENSE.md file for details.