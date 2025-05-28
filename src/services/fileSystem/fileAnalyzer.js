// Service to analyze code files for structure, potential issues, and vulnerabilities

export class FileAnalyzer {
  constructor() {
    this.languageHandlers = {
      javascript: this.analyzeJavaScript,
      typescript: this.analyzeTypeScript,
      python: this.analyzePython,
      java: this.analyzeJava,
      // Add more language handlers as needed
    };
  }
  
  analyzeFile(content, language) {
    const handler = this.languageHandlers[language] || this.analyzeGeneric;
    return handler.call(this, content);
  }
  
  analyzeGeneric(content) {
    return {
      lineCount: content.split('\n').length,
      characterCount: content.length,
      issues: [],
      structure: {
        imports: [],
        functions: [],
        classes: []
      }
    };
  }
  
  analyzeJavaScript(content) {
    const lines = content.split('\n');
    const analysis = {
      lineCount: lines.length,
      characterCount: content.length,
      issues: [],
      structure: {
        imports: [],
        functions: [],
        classes: [],
        components: []
      }
    };
    
    // Extract imports
    const importRegex = /import\s+(?:(?:{[^}]+}|\*\s+as\s+[^;]+)\s+from\s+)?['"]([^'"]+)['"]/g;
    let match;
    while ((match = importRegex.exec(content)) !== null) {
      analysis.structure.imports.push({
        path: match[1],
        statement: match[0]
      });
    }
    
    // Find potential issues
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Check for console.log statements
      if (line.includes('console.log')) {
        analysis.issues.push({
          line: i + 1,
          type: 'warning',
          message: 'Console statement found - should be removed in production code'
        });
      }
      
      // Check for potential security issues
      if (line.includes('eval(') || line.includes('new Function(')) {
        analysis.issues.push({
          line: i + 1,
          type: 'security',
          message: 'Potential security risk: dynamic code execution'
        });
      }
      
      // Check for React component definition
      if (line.includes('function') && line.includes('(') && line.includes(')') && 
          (line.includes('return') || content.includes('return'))) {
        const funcMatch = /function\s+([A-Z][A-Za-z0-9_]*)\s*\(/g.exec(line);
        if (funcMatch && /[A-Z]/.test(funcMatch[1][0])) {
          analysis.structure.components.push({
            name: funcMatch[1],
            line: i + 1
          });
        }
      }
      
      // Check for class component definition
      if (line.includes('class') && line.includes('extends')) {
        const classMatch = /class\s+([A-Z][A-Za-z0-9_]*)\s+extends/g.exec(line);
        if (classMatch) {
          analysis.structure.classes.push({
            name: classMatch[1],
            line: i + 1
          });
        }
      }
    }
    
    // Extract functions
    const functionRegex = /function\s+([a-zA-Z0-9_]+)\s*\(/g;
    while ((match = functionRegex.exec(content)) !== null) {
      analysis.structure.functions.push({
        name: match[1],
        position: match.index
      });
    }
    
    return analysis;
  }
  
  analyzeTypeScript(content) {
    // Start with JavaScript analysis
    const analysis = this.analyzeJavaScript(content);
    
    // Add TypeScript-specific analysis
    const lines = content.split('\n');
    
    // Look for interfaces
    const interfaces = [];
    const interfaceRegex = /interface\s+([A-Za-z0-9_]+)/g;
    let match;
    while ((match = interfaceRegex.exec(content)) !== null) {
      interfaces.push({
        name: match[1],
        position: match.index
      });
    }
    
    // Look for types
    const types = [];
    const typeRegex = /type\s+([A-Za-z0-9_]+)/g;
    while ((match = typeRegex.exec(content)) !== null) {
      types.push({
        name: match[1],
        position: match.index
      });
    }
    
    analysis.structure.interfaces = interfaces;
    analysis.structure.types = types;
    
    return analysis;
  }
  
  analyzePython(content) {
    const lines = content.split('\n');
    const analysis = {
      lineCount: lines.length,
      characterCount: content.length,
      issues: [],
      structure: {
        imports: [],
        functions: [],
        classes: []
      }
    };
    
    // Extract imports
    const importRegex = /^import\s+([a-zA-Z0-9_]+)|^from\s+([a-zA-Z0-9_.]+)\s+import/gm;
    let match;
    while ((match = importRegex.exec(content)) !== null) {
      analysis.structure.imports.push({
        module: match[1] || match[2],
        statement: match[0]
      });
    }
    
    // Find potential issues
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Check for print statements
      if (line.includes('print(')) {
        analysis.issues.push({
          line: i + 1,
          type: 'info',
          message: 'Print statement found - consider using logging for production code'
        });
      }
      
      // Check for potential security issues
      if (line.includes('eval(') || line.includes('exec(')) {
        analysis.issues.push({
          line: i + 1,
          type: 'security',
          message: 'Potential security risk: dynamic code execution'
        });
      }
    }
    
    // Extract functions
    const functionRegex = /def\s+([a-zA-Z0-9_]+)\s*\(/g;
    while ((match = functionRegex.exec(content)) !== null) {
      analysis.structure.functions.push({
        name: match[1],
        position: match.index
      });
    }
    
    // Extract classes
    const classRegex = /class\s+([a-zA-Z0-9_]+)(?:\s*\(([^)]*)\))?:/g;
    while ((match = classRegex.exec(content)) !== null) {
      analysis.structure.classes.push({
        name: match[1],
        inherits: match[2] || '',
        position: match.index
      });
    }
    
    return analysis;
  }
  
  analyzeJava(content) {
    const lines = content.split('\n');
    const analysis = {
      lineCount: lines.length,
      characterCount: content.length,
      issues: [],
      structure: {
        imports: [],
        methods: [],
        classes: []
      }
    };
    
    // Extract imports
    const importRegex = /import\s+([a-zA-Z0-9_.]+)(?:\.\*)?;/g;
    let match;
    while ((match = importRegex.exec(content)) !== null) {
      analysis.structure.imports.push({
        package: match[1],
        statement: match[0]
      });
    }
    
    // Find potential issues
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Check for System.out.println statements
      if (line.includes('System.out.println')) {
        analysis.issues.push({
          line: i + 1,
          type: 'info',
          message: 'Consider using a logger instead of System.out.println for production code'
        });
      }
    }
    
    // Extract methods
    const methodRegex = /(?:public|private|protected|static|\s) +[\w<>[\]]+\s+(\w+) *\([^)]*\) *(?:\{|throws|;)/g;
    while ((match = methodRegex.exec(content)) !== null) {
      analysis.structure.methods.push({
        name: match[1],
        position: match.index
      });
    }
    
    // Extract classes
    const classRegex = /class\s+(\w+)(?:\s+extends\s+(\w+))?(?:\s+implements\s+([^{]+))?/g;
    while ((match = classRegex.exec(content)) !== null) {
      analysis.structure.classes.push({
        name: match[1],
        extends: match[2] || '',
        implements: match[3] ? match[3].trim().split(/\s*,\s*/) : [],
        position: match.index
      });
    }
    
    return analysis;
  }
  
  // Function to scan for potential security vulnerabilities
  scanForVulnerabilities(content, language) {
    const vulnerabilities = [];
    const lines = content.split('\n');
    
    // Common vulnerable patterns across languages
    const commonPatterns = {
      // SQL Injection
      sqlInjection: {
        regex: /(?:execute|query|select|update|delete).*(?:[\$\{\}\[\]"`'].*\+|[\$\{\}\[\]'"]\s*\+\s*)/i,
        message: 'Potential SQL injection vulnerability detected. Use parameterized queries instead.'
      },
      
      // Command Injection
      commandInjection: {
        regex: /(?:exec|spawn|shell|system|popen|subprocess|child_process).*(?:[\$\{\}\[\]"`'].*\+|[\$\{\}\[\]'"]\s*\+\s*)/i,
        message: 'Potential command injection vulnerability detected. Validate and sanitize user inputs before passing to command execution functions.'
      },
      
      // Hardcoded Secrets
      hardcodedSecrets: {
        regex: /(?:password|secret|api[_]?key|access[_]?token|auth[_]?token).*=.*['"][a-zA-Z0-9_\-+\/=]{8,}['"]|['"][a-zA-Z0-9_\-+\/=]{32,}['"]|['"]eyJ[a-zA-Z0-9_\-\.]+['"]|bearer /i,
        message: 'Potential hardcoded secret detected. Store secrets in environment variables or a secure vault.'
      },
      
      // Insecure Randomness
      insecureRandomness: {
        regex: /(?:Math\.random|Random\(|random\.random)/i,
        message: 'Potentially insecure random number generation. For security-critical operations, use cryptographically secure random number generators.'
      },
      
      // XSS
      xss: {
        regex: /(?:innerHTML|outerHTML|document\.write|eval|dangerouslySetInnerHTML)/i,
        message: 'Potential XSS vulnerability detected. Use safe rendering techniques and sanitize inputs properly.'
      }
    };
    
    // Language-specific patterns
    const languagePatterns = {
      javascript: {
        // JavaScript-specific patterns
        regexDoS: {
          regex: /new RegExp\(.*\)/i,
          message: 'Potential ReDoS vulnerability. Be careful when creating regular expressions from user input.'
        },
        prototype: {
          regex: /\.__proto__|Object\.prototype|\.constructor\./i,
          message: 'Potential prototype pollution vulnerability. Validate object properties and use Object.create(null) for safer objects.'
        }
      },
      python: {
        // Python-specific patterns
        pickleSerialization: {
          regex: /pickle\.loads|pickle\.load|cPickle\.loads|cPickle\.load/i,
          message: 'Insecure deserialization using pickle detected. This can lead to remote code execution.'
        },
        yaml: {
          regex: /yaml\.load(?!\(.*Loader=yaml\.SafeLoader)/i,
          message: 'Unsafe YAML parsing detected. Use yaml.safe_load() instead.'
        }
      },
      // Add more language-specific patterns as needed
    };
    
    // Check common patterns
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      Object.entries(commonPatterns).forEach(([key, pattern]) => {
        if (pattern.regex.test(line)) {
          vulnerabilities.push({
            line: i + 1,
            type: 'security',
            category: key,
            message: pattern.message,
            code: line.trim()
          });
        }
      });
      
      // Check language-specific patterns
      if (language && languagePatterns[language]) {
        Object.entries(languagePatterns[language]).forEach(([key, pattern]) => {
          if (pattern.regex.test(line)) {
            vulnerabilities.push({
              line: i + 1,
              type: 'security',
              category: key,
              message: pattern.message,
              code: line.trim()
            });
          }
        });
      }
    }
    
    return vulnerabilities;
  }
}

export default new FileAnalyzer();