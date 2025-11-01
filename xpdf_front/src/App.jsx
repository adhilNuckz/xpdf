// src/App.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

// Use production URL if deployed, otherwise localhost for development
const API_BASE_URL = import.meta.env.PROD 
  ? 'https://xpdf.nuckz.live'
  : 'http://localhost:4000';

function App() {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [simpleExplanation, setSimpleExplanation] = useState('');
  const [detailedExplanation, setDetailedExplanation] = useState('');
  const [loadingSimple, setLoadingSimple] = useState(false);
  const [loadingDetailed, setLoadingDetailed] = useState(false);
  const [terminalText, setTerminalText] = useState('');
  const [translatedSimple, setTranslatedSimple] = useState('');
  const [translatedDetailed, setTranslatedDetailed] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [isTranslating, setIsTranslating] = useState(false);
  const [copiedSimple, setCopiedSimple] = useState(false);
  const [copiedDetailed, setCopiedDetailed] = useState(false);

  useEffect(() => {
    // Terminal boot sequence
    const bootSequence = [
      '> INITIALIZING XPDF TERMINAL v2.0...',
      '> LOADING QUANTUM AI MODULES...',
      '> NEURAL NETWORK: ONLINE',
      '> PDF PARSER: READY',
      '> AWAITING INPUT...',
    ];
    
    let textBuffer = '';
    let index = 0;
    const interval = setInterval(() => {
      if (index < bootSequence.length) {
        textBuffer += bootSequence[index] + '\n';
        setTerminalText(textBuffer);
        index++;
      } else {
        clearInterval(interval);
      }
    }, 300);

    return () => clearInterval(interval);
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
      setSimpleExplanation('');
      setDetailedExplanation('');
      setTerminalText((prev) => prev + `\n> FILE DETECTED: ${selectedFile.name}\n> SIZE: ${(selectedFile.size / 1024).toFixed(2)} KB\n> STATUS: READY FOR ANALYSIS\n`);
    }
  };

  const handleExplain = async () => {
    if (!file) {
      setTerminalText((prev) => prev + '\n> ERROR: NO FILE UPLOADED\n');
      return;
    }

    const formData = new FormData();
    formData.append('document', file);

    setLoadingSimple(true);
    setSimpleExplanation('');
    setDetailedExplanation('');
    setTranslatedSimple('');
    setTerminalText((prev) => prev + '\n> EXECUTING: SIMPLE ANALYSIS\n> AI PROCESSING...\n');

    try {
      const res = await axios.post(`${API_BASE_URL}/api/explain`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSimpleExplanation(res.data.explanation);
      setTerminalText((prev) => prev + '> ANALYSIS COMPLETE\n');
    } catch (error) {
      console.error('Error getting simple explanation:', error);
      setTerminalText((prev) => prev + '> ERROR: CONNECTION FAILED\n');
    } finally {
      setLoadingSimple(false);
    }
  };

  const handleExplainMore = async () => {
    if (!file) {
      setTerminalText((prev) => prev + '\n> ERROR: NO FILE UPLOADED\n');
      return;
    }

    const formData = new FormData();
    formData.append('document', file);

    setLoadingDetailed(true);
    setSimpleExplanation('');
    setDetailedExplanation('');
    setTranslatedDetailed('');
    setTerminalText((prev) => prev + '\n> EXECUTING: DEEP ANALYSIS\n> NEURAL NETWORK ACTIVE...\n');

    try {
      const res = await axios.post(`${API_BASE_URL}/api/explain-more`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setDetailedExplanation(res.data.detailedExplanation);
      setTerminalText((prev) => prev + '> DEEP ANALYSIS COMPLETE\n');
    } catch (error) {
      console.error('Error getting detailed explanation:', error);
      setTerminalText((prev) => prev + '> ERROR: CONNECTION FAILED\n');
    } finally {
      setLoadingDetailed(false);
    }
  };

  const handleCopy = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'simple') {
        setCopiedSimple(true);
        setTerminalText((prev) => prev + '> TEXT COPIED TO CLIPBOARD\n');
        setTimeout(() => setCopiedSimple(false), 2000);
      } else {
        setCopiedDetailed(true);
        setTerminalText((prev) => prev + '> TEXT COPIED TO CLIPBOARD\n');
        setTimeout(() => setCopiedDetailed(false), 2000);
      }
    } catch (error) {
      console.error('Failed to copy:', error);
      setTerminalText((prev) => prev + '> ERROR: COPY FAILED\n');
    }
  };

  const handleTranslate = async (text, type) => {
    if (selectedLanguage === 'en') {
      setTerminalText((prev) => prev + '> ALREADY IN ENGLISH\n');
      return;
    }

    setIsTranslating(true);
    setTerminalText((prev) => prev + `\n> TRANSLATING TO ${languages.find(l => l.code === selectedLanguage)?.name.toUpperCase()}...\n`);

    try {
      const res = await axios.post(`${API_BASE_URL}/api/translate`, {
        text,
        targetLanguage: selectedLanguage,
      });
      
      if (type === 'simple') {
        setTranslatedSimple(res.data.translatedText);
      } else {
        setTranslatedDetailed(res.data.translatedText);
      }
      setTerminalText((prev) => prev + '> TRANSLATION COMPLETE\n');
    } catch (error) {
      console.error('Error translating:', error);
      setTerminalText((prev) => prev + '> ERROR: TRANSLATION FAILED\n');
    } finally {
      setIsTranslating(false);
    }
  };

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'ta', name: 'Tamil' },
    { code: 'si', name: 'Sinhala' },
    { code: 'ru', name: 'Russian' },
    { code: 'zh', name: 'Chinese' },
  ];

  const renderMarkdown = (text) => {
    // Enhanced markdown rendering with better formatting
    const lines = text.split('\n');
    const rendered = [];
    let inCodeBlock = false;
    let codeBlockContent = [];
    
    lines.forEach((line, i) => {
      // Code blocks (multi-line)
      if (line.trim().startsWith('```')) {
        if (inCodeBlock) {
          // End of code block
          rendered.push(
            <pre key={`code-${i}`} className="code-block">
              <code>{codeBlockContent.join('\n')}</code>
            </pre>
          );
          codeBlockContent = [];
          inCodeBlock = false;
        } else {
          // Start of code block
          inCodeBlock = true;
        }
        return;
      }
      
      if (inCodeBlock) {
        codeBlockContent.push(line);
        return;
      }
      
      // Headers
      if (line.startsWith('### ')) {
        rendered.push(<h3 key={i} className="output-h3">▸ {line.substring(4)}</h3>);
        return;
      }
      if (line.startsWith('## ')) {
        rendered.push(<h2 key={i} className="output-h2">▸▸ {line.substring(3)}</h2>);
        return;
      }
      if (line.startsWith('# ')) {
        rendered.push(<h1 key={i} className="output-h1">▸▸▸ {line.substring(2)}</h1>);
        return;
      }
      
      // Numbered lists
      if (/^\d+\.\s/.test(line.trim())) {
        const match = line.trim().match(/^(\d+)\.\s(.+)$/);
        if (match) {
          rendered.push(
            <div key={i} className="output-numbered">
              <span className="number-badge">{match[1]}</span>
              {formatInlineElements(match[2])}
            </div>
          );
          return;
        }
      }
      
      // Bullet points
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        rendered.push(
          <div key={i} className="output-bullet">
            <span className="bullet-icon">▸</span>
            {formatInlineElements(line.trim().substring(2))}
          </div>
        );
        return;
      }
      
      // Empty lines
      if (!line.trim()) {
        rendered.push(<div key={i} className="line-break"></div>);
        return;
      }
      
      // Regular text with inline formatting
      rendered.push(
        <p key={i} className="output-text">
          {formatInlineElements(line)}
        </p>
      );
    });
    
    return rendered;
  };
  
  const formatInlineElements = (text) => {
    // Handle inline code, bold, and italic
    const parts = [];
    let currentText = text;
    let key = 0;
    
    // Split by code blocks first
    const codeRegex = /`([^`]+)`/g;
    let lastIndex = 0;
    let match;
    
    while ((match = codeRegex.exec(text)) !== null) {
      // Add text before code
      if (match.index > lastIndex) {
        const beforeText = text.substring(lastIndex, match.index);
        parts.push(...formatBoldItalic(beforeText, key++));
      }
      // Add code
      parts.push(<code key={`code-${key++}`} className="inline-code">{match[1]}</code>);
      lastIndex = match.index + match[0].length;
    }
    
    // Add remaining text
    if (lastIndex < text.length) {
      const remainingText = text.substring(lastIndex);
      parts.push(...formatBoldItalic(remainingText, key++));
    }
    
    return parts.length > 0 ? parts : text;
  };
  
  const formatBoldItalic = (text, baseKey) => {
    const parts = [];
    let key = baseKey;
    
    // Handle bold (**text**)
    const boldRegex = /\*\*([^*]+)\*\*/g;
    let lastIndex = 0;
    let match;
    
    while ((match = boldRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      parts.push(<strong key={`bold-${key++}`} className="bold-text">{match[1]}</strong>);
      lastIndex = match.index + match[0].length;
    }
    
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }
    
    return parts.length > 0 ? parts : [text];
  };

  return (
    <div className="cyber-container">
      {/* Header */}
      <div className="cyber-header">
        <div className="header-title">
          <span className="glitch" data-text="XPDF">XPDF</span>
          <span className="subtitle">// QUANTUM PDF ANALYZER</span>
        </div>
        <div className="header-status">
          <span className={`status-dot ${file ? 'active' : ''}`}></span>
          <span className="status-text">{file ? 'ARMED' : 'STANDBY'}</span>
        </div>
      </div>

      {/* Terminal Console */}
      <div className="terminal-console">
        <div className="terminal-header">
          <span className="terminal-title">⬢ SYSTEM CONSOLE</span>
          <div className="terminal-dots">
            <span className="dot red"></span>
            <span className="dot yellow"></span>
            <span className="dot green"></span>
          </div>
        </div>
        <pre className="terminal-body">{terminalText}</pre>
      </div>

      {/* Upload Section - Hide after file is selected */}
      {!file && (
        <div className="upload-zone">
          <label htmlFor="file-upload" className="upload-label">
            <div className="upload-icon">📄</div>
            <div className="upload-text">
              DROP PDF FILE OR CLICK TO SELECT
            </div>
            <input
              id="file-upload"
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="file-input"
            />
          </label>
        </div>
      )}

      {/* File Info Card - Show after upload */}
      {file && (
        <div className="file-info-card">
          <div className="file-info-content">
            <div className="file-icon">📄</div>
            <div className="file-details">
              <div className="file-name">{fileName}</div>
              <div className="file-size">{(file.size / 1024).toFixed(2)} KB</div>
            </div>
          </div>
          <button 
            className="change-file-btn"
            onClick={() => {
              setFile(null);
              setFileName('');
              setSimpleExplanation('');
              setDetailedExplanation('');
              setTerminalText((prev) => prev + '\n> FILE CLEARED\n> READY FOR NEW UPLOAD\n');
            }}
          >
            ✕ CHANGE FILE
          </button>
        </div>
      )}

      {/* Action Buttons */}
      {file && (
        <div className="action-buttons">
          <button 
            className="cyber-button simple" 
            onClick={handleExplain} 
            disabled={loadingSimple || loadingDetailed}
          >
            <span className="button-text">
              {loadingSimple ? '◉ PROCESSING...' : '◉ SIMPLE ANALYSIS'}
            </span>
          </button>
          <button 
            className="cyber-button detailed" 
            onClick={handleExplainMore} 
            disabled={loadingSimple || loadingDetailed}
          >
            <span className="button-text">
              {loadingDetailed ? '◉ PROCESSING...' : '◉ DEEP ANALYSIS'}
            </span>
          </button>
        </div>
      )}

      {/* Output Section */}
      {simpleExplanation && (
        <div className="output-container simple-output">
          <div className="output-header">
            <span className="output-title">▸ SIMPLE ANALYSIS RESULT</span>
            <div className="output-actions">
              <button
                className={`action-btn copy-btn ${copiedSimple ? 'copied' : ''}`}
                onClick={() => handleCopy(translatedSimple || simpleExplanation, 'simple')}
              >
                {copiedSimple ? '✓ COPIED' : '📋 COPY'}
              </button>
            </div>
          </div>
          <div className="output-body">
            {renderMarkdown(translatedSimple || simpleExplanation)}
          </div>
          <div className="translate-section">
            <div className="translate-controls">
              <select
                className="language-select"
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
              <button
                className="translate-btn"
                onClick={() => handleTranslate(simpleExplanation, 'simple')}
                disabled={isTranslating || selectedLanguage === 'en'}
              >
                {isTranslating ? '⟳ TRANSLATING...' : '🌐 TRANSLATE'}
              </button>
              {translatedSimple && (
                <button
                  className="reset-btn"
                  onClick={() => setTranslatedSimple('')}
                >
                  ↻ SHOW ORIGINAL
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {detailedExplanation && (
        <div className="output-container detailed-output">
          <div className="output-header">
            <span className="output-title">▸ DEEP ANALYSIS RESULT</span>
            <div className="output-actions">
              <button
                className={`action-btn copy-btn ${copiedDetailed ? 'copied' : ''}`}
                onClick={() => handleCopy(translatedDetailed || detailedExplanation, 'detailed')}
              >
                {copiedDetailed ? '✓ COPIED' : '📋 COPY'}
              </button>
            </div>
          </div>
          <div className="output-body">
            {renderMarkdown(translatedDetailed || detailedExplanation)}
          </div>
          <div className="translate-section">
            <div className="translate-controls">
              <select
                className="language-select"
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
              <button
                className="translate-btn"
                onClick={() => handleTranslate(detailedExplanation, 'detailed')}
                disabled={isTranslating || selectedLanguage === 'en'}
              >
                {isTranslating ? '⟳ TRANSLATING...' : '🌐 TRANSLATE'}
              </button>
              {translatedDetailed && (
                <button
                  className="reset-btn"
                  onClick={() => setTranslatedDetailed('')}
                >
                  ↻ SHOW ORIGINAL
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="cyber-footer">
        <span className="footer-text">POWERED BY GEMINI 2.0 FLASH</span>
        <span className="footer-version">v2.0.1</span>
      </div>
    </div>
  );
}

export default App;