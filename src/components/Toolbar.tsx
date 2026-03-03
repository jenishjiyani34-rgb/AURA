interface ToolbarProps {
  fontSize: number;
  setFontSize: (size: number) => void;
  fontFamily: string;
  setFontFamily: (font: string) => void;
  removeAiMarks: boolean;
  setRemoveAiMarks: (value: boolean) => void;
  realtimePreview: boolean;
  setRealtimePreview: (value: boolean) => void;
  targetLanguage: string;
  setTargetLanguage: (language: string) => void;
  onTranslate: () => void;
  isTranslating: boolean;
  onConvert: () => void;
  onClear: () => void;
  onDownloadWord: () => void;
  onDownloadPDF: () => void;
  isConverted: boolean;
  isProcessing: boolean;
}

const fontFamilies = [
  'Times New Roman',
  'Arial',
  'Georgia',
  'Verdana',
  'Calibri',
  'Cambria',
  'Garamond',
  'Merriweather',
  'Playfair Display',
  'Lora',
  'Poppins',
  'Montserrat',
  'Nunito',
  'Source Sans 3',
  'IBM Plex Serif',
];

const fontSizes = [10, 11, 12, 14, 16, 18, 20, 24];

const languageOptions = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'Hindi' },
  { code: 'gu', label: 'Gujarati' },
  { code: 'es', label: 'Spanish' },
  { code: 'fr', label: 'French' },
  { code: 'de', label: 'German' },
  { code: 'it', label: 'Italian' },
  { code: 'pt', label: 'Portuguese' },
  { code: 'ar', label: 'Arabic' },
  { code: 'zh-CN', label: 'Chinese (Simplified)' },
  { code: 'ja', label: 'Japanese' },
  { code: 'ko', label: 'Korean' },
  { code: 'ru', label: 'Russian' },
  { code: 'tr', label: 'Turkish' },
  { code: 'id', label: 'Indonesian' },
];

function Toolbar({
  fontSize,
  setFontSize,
  fontFamily,
  setFontFamily,
  removeAiMarks,
  setRemoveAiMarks,
  realtimePreview,
  setRealtimePreview,
  targetLanguage,
  setTargetLanguage,
  onTranslate,
  isTranslating,
  onConvert,
  onClear,
  onDownloadWord,
  onDownloadPDF,
  isConverted,
  isProcessing,
}: ToolbarProps) {
  return (
    <div className="bg-gray-800/70 backdrop-blur-sm rounded-xl border border-gray-700 p-4">
      <div className="flex flex-wrap items-center gap-4">
        {/* Font Controls */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <label className="text-gray-400 text-sm">Font:</label>
            <select
              value={fontFamily}
              onChange={(e) => setFontFamily(e.target.value)}
              className="bg-gray-700 text-white border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-500"
            >
              {fontFamilies.map((font) => (
                <option key={font} value={font}>
                  {font}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <label className="text-gray-400 text-sm">Size:</label>
            <select
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="bg-gray-700 text-white border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-500"
            >
              {fontSizes.map((size) => (
                <option key={size} value={size}>
                  {size}pt
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Divider */}
        <div className="h-8 w-px bg-gray-600 hidden md:block" />

        {/* Action Buttons */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={onConvert}
            disabled={isProcessing}
            className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black font-semibold px-6 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 shadow-lg shadow-yellow-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <>
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Processing...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Convert
              </>
            )}
          </button>

          <button
            onClick={onClear}
            className="bg-gray-700 hover:bg-gray-600 text-white font-medium px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 border border-gray-600"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Clear
          </button>
        </div>

        {/* Divider */}
        <div className="h-8 w-px bg-gray-600 hidden md:block" />

        {/* Options */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Option A - Remove AI Marks */}
          <label className="flex items-center gap-2 bg-yellow-500/10 border-2 border-yellow-500/50 rounded-lg px-3 py-2 cursor-pointer select-none hover:bg-yellow-500/20 transition-colors">
            <input
              type="checkbox"
              checked={removeAiMarks}
              onChange={(e) => setRemoveAiMarks(e.target.checked)}
              className="h-4 w-4 accent-yellow-500"
            />
            <span className="text-sm font-semibold text-yellow-400">
              Option A: Remove AI Marks (Always On)
            </span>
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
          </label>

          {/* Real-time Preview Toggle */}
          <label className="flex items-center gap-2 bg-blue-500/10 border-2 border-blue-500/50 rounded-lg px-3 py-2 cursor-pointer select-none hover:bg-blue-500/20 transition-colors">
            <input
              type="checkbox"
              checked={realtimePreview}
              onChange={(e) => setRealtimePreview(e.target.checked)}
              className="h-4 w-4 accent-blue-500"
            />
            <span className="text-sm font-semibold text-blue-400">
              Real-Time Preview
            </span>
            {realtimePreview && (
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            )}
          </label>
        </div>

        {/* Divider */}
        <div className="h-8 w-px bg-gray-600 hidden md:block" />

        {/* Download Buttons */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={onDownloadWord}
            disabled={!isConverted}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-medium px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-blue-500/25"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 2l5 5h-5V4zM6 20V4h6v6h6v10H6z"/>
              <path d="M8 12h8v2H8v-2zm0 4h8v2H8v-2z"/>
            </svg>
            Download Word
          </button>

          <button
            onClick={onDownloadPDF}
            disabled={!isConverted}
            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-medium px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-red-500/25"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 2l5 5h-5V4zM6 20V4h6v6h6v10H6z"/>
              <path d="M9 13h2v5H9v-5zm4 0h2v5h-2v-5z"/>
            </svg>
            Download PDF
          </button>
        </div>

        {/* Divider */}
        <div className="h-8 w-px bg-gray-600 hidden md:block" />

        {/* Translation */}
        <div className="flex items-center gap-2 flex-wrap">
          <label className="text-gray-400 text-sm">Translate to:</label>
          <select
            value={targetLanguage}
            onChange={(e) => setTargetLanguage(e.target.value)}
            className="bg-gray-700 text-white border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-400"
          >
            {languageOptions.map((language) => (
              <option key={language.code} value={language.code}>
                {language.label}
              </option>
            ))}
          </select>
          <button
            onClick={onTranslate}
            disabled={isTranslating}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-medium px-4 py-2 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isTranslating ? 'Translating...' : 'Translate'}
          </button>
        </div>
      </div>

      {/* Feature Tags */}
      <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-700">
        <span className="bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
          {removeAiMarks && <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>}
          AI Marks Removal
        </span>
        <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
          {realtimePreview && <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>}
          Real-Time Preview
        </span>
        <span className="bg-cyan-500/20 text-cyan-300 px-3 py-1 rounded-full text-xs font-medium">
          Auto Table Detection
        </span>
        <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-medium">
          No Word Limit
        </span>
        <span className="bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full text-xs font-medium">
          Format Preservation
        </span>
        <span className="bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-xs font-medium">
          Word & PDF Export
        </span>
      </div>
    </div>
  );
}

export default Toolbar;
