import { useEffect, useRef, useState } from 'react';
import { parseTextToElements, ParsedElement, convertTableForTranslation, convertTranslatedTable, cleanContent } from './utils/textParser';
import { generateWordDocument, generatePDF } from './utils/documentGenerator';
import PreviewPanel from './components/PreviewPanel';
import Toolbar from './components/Toolbar';
import { 
  Sparkles, 
  Wand2, 
  FileText, 
  Table, 
  Infinity as InfinityIcon, 
  Languages, 
  Download,
  CheckCircle2,
  AlertCircle,
  Copy,
  ScanLine
} from 'lucide-react';

function App() {
  const [inputText, setInputText] = useState('');
  const [parsedElements, setParsedElements] = useState<ParsedElement[]>([]);
  const [isConverted, setIsConverted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [fontSize, setFontSize] = useState(12);
  const [fontFamily, setFontFamily] = useState('Times New Roman');
  const [removeAiMarks, setRemoveAiMarks] = useState(true);
  const [realtimePreview, setRealtimePreview] = useState(true);
  const [targetLanguage, setTargetLanguage] = useState('en');
  const [translatedText, setTranslatedText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationError, setTranslationError] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Real-time preview effect
  useEffect(() => {
    if (!realtimePreview) return;
    
    if (!inputText.trim()) {
      setParsedElements([]);
      setIsConverted(false);
      setIsProcessing(false);
      return;
    }

    setIsProcessing(true);
    const timer = window.setTimeout(() => {
      const elements = parseTextToElements(inputText, { removeAiMarks, autoCorrect: false });
      setParsedElements(elements);
      setIsConverted(elements.length > 0);
      setIsProcessing(false);
    }, 100); // Fast update for real-time feel

    return () => window.clearTimeout(timer);
  }, [inputText, removeAiMarks, realtimePreview]);

  const handleConvert = () => {
    if (!inputText.trim()) return;

    setIsProcessing(true);
    const elements = parseTextToElements(inputText, { removeAiMarks, autoCorrect: false });
    setParsedElements(elements);
    setIsConverted(elements.length > 0);
    setIsProcessing(false);
  };

  const handleClear = () => {
    setInputText('');
    setParsedElements([]);
    setIsConverted(false);
    setTranslatedText('');
    setTranslationError('');
  };

  const handleTranslate = async () => {
    if (!inputText.trim()) return;

    setIsTranslating(true);
    setTranslationError('');

    try {
      const translateChunk = async (source: string): Promise<string> => {
        if (!source.trim()) return source;
        const endpoint = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${encodeURIComponent(targetLanguage)}&dt=t&q=${encodeURIComponent(source)}`;
        const response = await fetch(endpoint);
        if (!response.ok) return source;
        const data = await response.json();
        const translated = Array.isArray(data?.[0])
          ? data[0].map((part: [string]) => part[0]).join('')
          : '';
        return translated || source;
      };

      const lines = inputText.split('\n');
      const outputLines: string[] = [];
      let i = 0;

      while (i < lines.length) {
        const currentLine = lines[i];
        const trimmed = currentLine.trim();

        if (!trimmed) {
          outputLines.push('');
          i += 1;
          continue;
        }

        const isTableLikeLine = trimmed.includes('|');
        if (isTableLikeLine) {
          const tableBlock: string[] = [];
          while (i < lines.length && lines[i].trim().includes('|')) {
            tableBlock.push(lines[i]);
            i += 1;
          }

          const rows = convertTableForTranslation(tableBlock);
          if (rows.length === 0) {
            outputLines.push(...tableBlock);
            continue;
          }

          const translatedRows: string[][] = [];
          for (const row of rows) {
            const translatedRow: string[] = [];
            for (const cell of row) {
              const cleanedCell = cleanContent(cell, removeAiMarks, false);
              const translatedCell = await translateChunk(cleanedCell);
              translatedRow.push(translatedCell);
            }
            translatedRows.push(translatedRow);
          }

          outputLines.push(convertTranslatedTable(translatedRows));
          continue;
        }

        const cleanedLine = cleanContent(currentLine, removeAiMarks, false);
        if (!cleanedLine.trim()) {
          outputLines.push('');
          i += 1;
          continue;
        }

        const translatedLine = await translateChunk(cleanedLine);
        outputLines.push(translatedLine);
        i += 1;
      }

      const finalTranslation = outputLines.join('\n').replace(/\n{3,}/g, '\n\n');
      if (!finalTranslation.trim()) {
        setTranslationError('No translatable text found after cleanup.');
        setTranslatedText('');
        return;
      }

      setTranslatedText(finalTranslation);
    } catch (error) {
      setTranslationError('Translation is temporarily unavailable. Please try again in a moment.');
      console.error(error);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleDownloadWord = async () => {
    if (parsedElements.length === 0) return;
    await generateWordDocument(parsedElements, fontSize, fontFamily);
  };

  const handleDownloadPDF = async () => {
    if (parsedElements.length === 0) return;
    await generatePDF(parsedElements, fontSize, fontFamily);
  };

  const handleDownloadTranslatedWord = async () => {
    if (!translatedText.trim()) return;
    const translatedElements = parseTextToElements(translatedText, {
      removeAiMarks: true,
      autoCorrect: false,
    });
    await generateWordDocument(translatedElements, fontSize, fontFamily);
  };

  const handleDownloadTranslatedPDF = async () => {
    if (!translatedText.trim()) return;
    const translatedElements = parseTextToElements(translatedText, {
      removeAiMarks: true,
      autoCorrect: false,
    });
    await generatePDF(translatedElements, fontSize, fontFamily);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text');
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newText = inputText.substring(0, start) + text + inputText.substring(end);
      setInputText(newText);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col">
      {/* Header */}
      <header className="bg-black/80 backdrop-blur-sm border-b border-yellow-500/30 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-500/30">
                <svg className="w-7 h-7 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-200">
                  AURA TEXT
                </h1>
                <p className="text-xs text-blue-300">AI Text to Document Converter</p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <span className="text-yellow-400 text-sm flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                No Word Limit
              </span>
              <span className="text-blue-400 text-sm flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Auto Table Detection
              </span>
              <span className="text-green-400 text-sm flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Free Forever
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 flex-1">
        {/* Info Banner */}
        <div className="bg-gradient-to-r from-blue-900/50 to-yellow-900/30 rounded-2xl p-6 mb-8 border border-blue-500/30">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="text-center md:text-left">
              <h2 className="text-xl font-bold text-white mb-1">Convert AI-Generated Text to Professional Documents</h2>
              <p className="text-gray-300 text-sm">
                Paste your AI text (ChatGPT, Gemini, Claude, etc.) and convert it to properly formatted Word or PDF documents. 
                <strong className="text-yellow-400"> Use Option A to remove all AI text marks automatically!</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <Toolbar 
          fontSize={fontSize}
          setFontSize={setFontSize}
          fontFamily={fontFamily}
          setFontFamily={setFontFamily}
          removeAiMarks={removeAiMarks}
          setRemoveAiMarks={setRemoveAiMarks}
          realtimePreview={realtimePreview}
          setRealtimePreview={setRealtimePreview}
          targetLanguage={targetLanguage}
          setTargetLanguage={setTargetLanguage}
          onTranslate={handleTranslate}
          isTranslating={isTranslating}
          onConvert={handleConvert}
          onClear={handleClear}
          onDownloadWord={handleDownloadWord}
          onDownloadPDF={handleDownloadPDF}
          isConverted={isConverted}
          isProcessing={isProcessing}
        />

        {/* Editor Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Input Panel */}
          <div className="bg-gray-800/50 rounded-2xl border border-gray-700 overflow-hidden">
            <div className="bg-black/50 px-4 py-3 border-b border-gray-700 flex items-center justify-between">
              <h3 className="text-yellow-400 font-semibold flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Input Text
              </h3>
              <span className="text-gray-400 text-sm">
                {inputText.length.toLocaleString()} characters | {inputText.split(/\s+/).filter(w => w).length.toLocaleString()} words
              </span>
            </div>
            <textarea
              ref={textareaRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onPaste={handlePaste}
              placeholder={`Paste your AI-generated text here...

EXAMPLE TABLE FORMAT:
| Extract Name | Dragendorff's Test | Mayer's Test | Wagner's Test | Hager's Test |
|--------------|-------------------|--------------|---------------|--------------|
| Alkaloids    | + (Orange)        | + (White)    | + (Brown)     | + (Yellow)   |
| Glycosides   | - (Negative)      | - (Negative) | - (Negative)  | - (Negative) |

The converter will automatically detect:
• Tables (with | separators)
• Bullet points (•, -, *, ▪)
• Numbered lists (1., 2., etc.)
• Headings (# Heading or **Bold Heading**)
• Code blocks (\`\`\` code \`\`\`)

✓ Enable "Option A" to remove AI formatting marks like **bold**, *italic*, [citations], etc.`}
              className="w-full h-[500px] bg-transparent text-gray-100 p-4 resize-none focus:outline-none font-mono text-sm leading-relaxed placeholder:text-gray-500"
              style={{ whiteSpace: 'pre-wrap', tabSize: 4 }}
            />
          </div>

          {/* Preview Panel */}
          <div className="bg-gray-800/50 rounded-2xl border border-gray-700 overflow-hidden">
            <div className="bg-black/50 px-4 py-3 border-b border-gray-700 flex items-center justify-between">
              <h3 className="text-blue-400 font-semibold flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Document Preview
              </h3>
              <div className="flex items-center gap-3">
                {removeAiMarks && (
                  <span className="text-yellow-400 text-xs bg-yellow-500/20 px-2 py-1 rounded flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    AI Marks Removed
                  </span>
                )}
                {realtimePreview && parsedElements.length > 0 && (
                  <span className="text-green-400 text-xs flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    LIVE
                  </span>
                )}
                {isProcessing && (
                  <span className="text-blue-400 text-xs flex items-center gap-1">
                    <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing
                  </span>
                )}
              </div>
            </div>
            <PreviewPanel 
              elements={parsedElements}
              fontSize={fontSize}
              fontFamily={fontFamily}
              isConverted={isConverted}
            />
          </div>
        </div>

        {/* Translation Section */}
        <section className="mt-8 bg-gray-800/50 rounded-2xl border border-cyan-500/30 overflow-hidden">
          <div className="bg-black/50 px-4 py-3 border-b border-gray-700 flex items-center justify-between">
            <h3 className="text-cyan-300 font-semibold flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.5 13.5L8 21m5.5-2.5L16 21m-4.5-2.5l5-5m0 0l-5-5m5 5H4" />
              </svg>
              Translation Studio (Any Language)
            </h3>
            <span className="text-xs text-gray-400">Uses cleaned text from Option A</span>
          </div>
          <div className="p-4">
            {!translatedText && !translationError && (
              <p className="text-gray-400 text-sm">
                Choose a language in the toolbar and click <span className="text-cyan-300">Translate</span>.
              </p>
            )}

            {translationError && (
              <div className="bg-red-900/30 border border-red-500/40 text-red-300 rounded-lg px-4 py-3 text-sm">
                {translationError}
              </div>
            )}

            {translatedText && (
              <div className="space-y-3">
                <div className="bg-white rounded-lg border border-gray-300 p-4 min-h-[180px] text-black text-sm leading-relaxed">
                  {translatedText.split('\n').map((line, idx) => {
                    // Check if line is a table row
                    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
                      return (
                        <div key={idx} className="flex border-b border-gray-200">
                          {line.trim().slice(1, -1).split('|').map((cell, cellIdx) => (
                            <div key={cellIdx} className={`flex-1 p-2 ${cellIdx === 0 ? 'font-semibold bg-gray-50' : ''}`}>
                              {cell.trim()}
                            </div>
                          ))}
                        </div>
                      );
                    }
                    // Check if line is a separator
                    if (line.trim().match(/^\|[-:\s|]+\|$/)) {
                      return null;
                    }
                    // Regular text line
                    return <p key={idx} className="mb-2">{line}</p>;
                  })}
                </div>
                <div className="flex flex-wrap justify-end gap-2">
                  <button
                    onClick={handleDownloadTranslatedWord}
                    className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                  >
                    Download Translated Word
                  </button>
                  <button
                    onClick={handleDownloadTranslatedPDF}
                    className="bg-red-600 hover:bg-red-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                  >
                    Download Translated PDF
                  </button>
                  <button
                    onClick={() => navigator.clipboard.writeText(translatedText)}
                    className="bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                  >
                    Copy Translation
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Features Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-yellow-900/30 to-yellow-800/10 rounded-xl p-6 border border-yellow-500/30">
            <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </div>
            <h3 className="text-yellow-400 font-bold text-lg mb-2">Auto Table Detection</h3>
            <p className="text-gray-300 text-sm">
              Automatically detects pipe-separated tables from AI output and converts them to proper formatted tables.
            </p>
          </div>

          <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/10 rounded-xl p-6 border border-blue-500/30">
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-blue-400 font-bold text-lg mb-2">Remove AI Marks (Option A)</h3>
            <p className="text-gray-300 text-sm">
              Removes **bold**, *italic*, [citations], markdown syntax and AI disclaimer text automatically.
            </p>
          </div>

          <div className="bg-gradient-to-br from-green-900/30 to-green-800/10 rounded-xl p-6 border border-green-500/30">
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </div>
            <h3 className="text-green-400 font-bold text-lg mb-2">Export Options</h3>
            <p className="text-gray-300 text-sm">
              Download as Word (.docx) or PDF format with professional formatting ready for submission.
            </p>
          </div>

          <div className="bg-gradient-to-br from-cyan-900/30 to-cyan-800/10 rounded-xl p-6 border border-cyan-500/30 md:col-span-3">
            <div className="w-12 h-12 bg-cyan-500 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14m-6 2h.01M4 6h8a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2z" />
              </svg>
            </div>
            <h3 className="text-cyan-300 font-bold text-lg mb-2">Real-Time Preview</h3>
            <p className="text-gray-300 text-sm">
              Review cleaned and formatted output instantly while typing so your exported files match what you see.
            </p>
          </div>
        </div>

        {/* Benefits */}
        <div className="mt-12 bg-gray-800/30 rounded-2xl p-8 border border-gray-700">
          <h2 className="text-2xl font-bold text-yellow-400 mb-6 text-center">Benefits of AURA TEXT</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { icon: '01', title: 'Professional Output', desc: 'Transforms raw AI text into polished, structured documents ready for business, academic, or client use.' },
              { icon: '02', title: 'Cleaner Content', desc: 'Removes AI marks, markdown symbols, and noisy formatting so your final text looks human-written.' },
              { icon: '03', title: 'Multilingual Workflow', desc: 'Translate content while preserving table structure and formatting for clear cross-language documentation.' },
              { icon: '04', title: 'Ready-to-Share Files', desc: 'Download clean documents instantly as Word or PDF, including translated versions from the same screen.' },
            ].map((item) => (
              <div key={item.icon} className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-3 text-black font-bold text-base shadow-lg shadow-yellow-500/20">
                  {item.icon}
                </div>
                <h3 className="text-white font-semibold mb-1">{item.title}</h3>
                <p className="text-gray-400 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer with Developer Credit */}
      <footer className="bg-black border-t border-yellow-500/30 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col items-center gap-4">
            {/* Logo and Name */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-200">
                AURA TEXT
              </span>
            </div>
            
            {/* Features */}
            <p className="text-gray-400 text-sm text-center">
              AI Text to Document Converter | No Word Limit | Free Forever
            </p>
            
            {/* Developer Credit */}
            <div className="mt-4 pt-4 border-t border-gray-800 w-full text-center">
              <p className="text-gray-500 text-sm">
                © 2024 AURA TEXT. All rights reserved.
              </p>
              <p className="text-yellow-400 font-semibold mt-2 text-lg">
                Developed by <span className="text-blue-400">JENISH JIYANI</span>
              </p>
            </div>

            {/* Website URL */}
            <div className="mt-2">
              <a 
                href="https://auratext.in" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 text-sm underline"
              >
                www.auratext.in
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
