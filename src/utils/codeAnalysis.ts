import fileAnalyzer from '../services/fileSystem/fileAnalyzer';

// Utility functions for code analysis and processing

export const getCodeSummary = (content: string, language: string) => {
  if (!content || !language) return null;
  
  const analysis = fileAnalyzer.analyzeFile(content, language);
  return analysis;
};

export const findVulnerabilities = (content: string, language: string) => {
  if (!content || !language) return [];
  
  const vulnerabilities = fileAnalyzer.scanForVulnerabilities(content, language);
  return vulnerabilities;
};

export const extractFunctionNames = (content: string, language: string): string[] => {
  if (!content) return [];
  
  const functions: string[] = [];
  
  switch (language) {
    case 'javascript':
    case 'typescript':
      // Match function declarations, function expressions, and arrow functions
      const jsMatches = content.match(/(?:function\s+(\w+)|(?:const|let|var)\s+(\w+)\s*=\s*(?:function|\([^)]*\)\s*=>))/g) || [];
      
      jsMatches.forEach(match => {
        const funcName = match.includes('function') 
          ? match.replace('function', '').trim() 
          : match.split('=')[0].replace(/(?:const|let|var)/, '').trim();
        
        if (funcName && !functions.includes(funcName)) {
          functions.push(funcName);
        }
      });
      break;
      
    case 'python':
      // Match Python function definitions
      const pyMatches = content.match(/def\s+(\w+)\s*\(/g) || [];
      
      pyMatches.forEach(match => {
        const funcName = match.replace('def', '').replace('(', '').trim();
        
        if (funcName && !functions.includes(funcName)) {
          functions.push(funcName);
        }
      });
      break;
      
    case 'java':
      // Match Java method definitions
      const javaMatches = content.match(/(?:public|private|protected|static|\s) +[\w<>[\]]+\s+(\w+) *\([^)]*\) *(?:\{|throws)/g) || [];
      
      javaMatches.forEach(match => {
        // Extract method name
        const methodMatch = /\s+(\w+)\s*\(/.exec(match);
        if (methodMatch && methodMatch[1] && !functions.includes(methodMatch[1])) {
          functions.push(methodMatch[1]);
        }
      });
      break;
  }
  
  return functions;
};

export const extractImports = (content: string, language: string): string[] => {
  if (!content) return [];
  
  const imports: string[] = [];
  
  switch (language) {
    case 'javascript':
    case 'typescript':
      // Match ES6 imports
      const jsMatches = content.match(/import\s+(?:{[^}]+}|\*\s+as\s+[^;]+|\w+)\s+from\s+['"][^'"]+['"]/g) || [];
      
      jsMatches.forEach(match => {
        imports.push(match.trim());
      });
      
      // Match require statements
      const requireMatches = content.match(/(?:const|let|var)\s+(?:{[^}]+}|\w+)\s*=\s*require\(['"][^'"]+['"]\)/g) || [];
      
      requireMatches.forEach(match => {
        imports.push(match.trim());
      });
      break;
      
    case 'python':
      // Match Python imports
      const importMatches = content.match(/import\s+[\w.]+|from\s+[\w.]+\s+import\s+[^#\n]+/g) || [];
      
      importMatches.forEach(match => {
        imports.push(match.trim());
      });
      break;
      
    case 'java':
      // Match Java imports
      const javaMatches = content.match(/import\s+[\w.]+(?:\.\*)?;/g) || [];
      
      javaMatches.forEach(match => {
        imports.push(match.trim());
      });
      break;
  }
  
  return imports;
};

// Extract line numbers where errors might be occurring based on common patterns
export const findPotentialErrorLocations = (content: string, errorMessage: string): number[] => {
  if (!content || !errorMessage) return [];
  
  const lines = content.split('\n');
  const lineNumbers: number[] = [];
  
  // Look for line numbers in error message
  const lineNumberMatches = errorMessage.match(/line\s+(\d+)/gi) || [];
  
  for (const match of lineNumberMatches) {
    const lineNum = parseInt(match.replace(/[^\d]/g, ''), 10);
    if (lineNum > 0 && lineNum <= lines.length) {
      lineNumbers.push(lineNum);
    }
  }
  
  // If no line numbers found in error message, look for common error patterns
  if (lineNumbers.length === 0) {
    // Check for undefined variables
    if (errorMessage.includes('undefined') || errorMessage.includes('not defined')) {
      const varMatch = errorMessage.match(/'([^']+)'\s+is\s+not\s+defined/) || 
                       errorMessage.match(/undefined\s+variable\s+['"]?([a-zA-Z0-9_]+)['"]?/i);
      
      if (varMatch && varMatch[1]) {
        const varName = varMatch[1];
        lines.forEach((line, index) => {
          if (line.includes(varName)) {
            lineNumbers.push(index + 1);
          }
        });
      }
    }
    
    // Check for syntax errors
    if (errorMessage.includes('Syntax') || errorMessage.includes('SyntaxError')) {
      // Look for unclosed brackets, missing semicolons, etc.
      let bracketCount = 0;
      let parenCount = 0;
      
      lines.forEach((line, index) => {
        const openBrackets = (line.match(/{/g) || []).length;
        const closeBrackets = (line.match(/}/g) || []).length;
        const openParens = (line.match(/\(/g) || []).length;
        const closeParens = (line.match(/\)/g) || []).length;
        
        bracketCount += openBrackets - closeBrackets;
        parenCount += openParens - closeParens;
        
        // If we have more closing than opening or missing semicolons in relevant languages
        if (bracketCount < 0 || parenCount < 0 || 
            (line.trim().length > 0 && 
             !line.trim().endsWith('{') && 
             !line.trim().endsWith('}') && 
             !line.trim().endsWith(';') && 
             !line.trim().endsWith(',') &&
             !line.trim().endsWith(')') &&
             !line.includes('//') &&
             !line.includes('/*'))) {
          lineNumbers.push(index + 1);
        }
      });
    }
  }
  
  return [...new Set(lineNumbers)]; // Remove duplicates
};

export const formatCode = (content: string, language: string): string => {
  // Simple code formatting - in a real app this would use prettier or language-specific formatters
  if (!content) return content;
  
  let formattedCode = content;
  
  // Normalize indentation to 2 spaces
  const lines = content.split('\n');
  const formattedLines = lines.map(line => {
    // Replace tabs with 2 spaces
    let formatted = line.replace(/\t/g, '  ');
    
    // Normalize trailing whitespace
    formatted = formatted.trimRight();
    
    return formatted;
  });
  
  formattedCode = formattedLines.join('\n');
  
  return formattedCode;
};