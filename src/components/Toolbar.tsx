import { 
  Sparkles, 
  Trash2, 
  FileText, 
  FileDown, 
  Languages, 
  Type,
  Maximize2
} from 'lucide-react';

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
  'Times New Roman', 'Arial', 'Georgia', 'Verdana', 'Calibri', 'Cambria',
  'Garamond', 'Merriweather', 'Playfair Display', 'Lora', 'Poppins',
  'Montserrat', 'Nunito', 'Source Sans 3', 'IBM Plex Serif',
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
    <div className="glass-panel rounded-2xl p-5 w-full flex flex-col gap-5">
      
      {/* Top Row: Core Tools & Actions */}
      <div className="flex flex-col lg:flex-row items-center gap-4 justify-between w-full">
        
        {/* Left: Typography & View */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <div className="flex items-center gap-2 bg-slate-900/50 p-1.5 rounded-xl border border-slate-700">
            <Type className="w-4 h-4 text-slate-400 ml-2" />
            <select
              value={fontFamily}
              onChange={(e) => setFontFamily(e.target.value)}
              className="bg-transparent text-slate-200 border-none rounded-lg py-1.5 px-2 text-sm focus:ring-2 focus:ring-sky-500/50 outline-none w-36 sm:w-44 appearance-none cursor-pointer"
            >
              {fontFamilies.map((font) => (
                <option key={font} value={font} className="bg-slate-800 text-slate-200">
                  {font}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center gap-2 bg-slate-900/50 p-1.5 rounded-xl border border-slate-700">
            <Maximize2 className="w-4 h-4 text-slate-400 ml-2" />
            <select
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="bg-transparent text-slate-200 border-none rounded-lg py-1.5 px-2 pr-6 text-sm focus:ring-2 focus:ring-sky-500/50 outline-none appearance-none cursor-pointer"
            >
              {fontSizes.map((size) => (
                <option key={size} value={size} className="bg-slate-800 text-slate-200">
                  {size}pt
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Center: Main Action (Convert & Clear) */}
        <div className="flex items-center gap-3 w-full lg:w-auto justify-center">
          <button
            onClick={onConvert}
            disabled={isProcessing}
            className="group relative flex items-center gap-2 bg-sky-500 hover:bg-sky-400 text-slate-900 font-semibold px-6 py-2.5 rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(14,165,233,0.3)] disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" />
                <span className="relative z-10">Processing...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 relative z-10" />
                <span className="relative z-10">Convert Notes</span>
              </>
            )}
          </button>

          <button
            onClick={onClear}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2.5 rounded-xl transition-colors border border-slate-700/50 font-medium"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">Clear</span>
          </button>
        </div>

        {/* Right: Export Options */}
        <div className="flex items-center gap-3 w-full lg:w-auto justify-end">
          <button
            onClick={onDownloadWord}
            disabled={!isConverted}
            className="flex items-center gap-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 px-4 py-2.5 rounded-xl transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed font-medium"
          >
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">Word</span>
          </button>
          
          <button
            onClick={onDownloadPDF}
            disabled={!isConverted}
            className="flex items-center gap-2 bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/30 px-4 py-2.5 rounded-xl transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed font-medium"
          >
            <FileDown className="w-4 h-4" />
            <span className="hidden sm:inline">PDF</span>
          </button>
        </div>
      </div>

      <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-700 to-transparent opacity-50" />

      {/* Bottom Row: Settings & Translation */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
        
        {/* Settings Toggles */}
        <div className="flex flex-wrap items-center gap-3">
          <label className={`flex items-center gap-2.5 px-4 py-2 rounded-xl border transition-all cursor-pointer select-none ${removeAiMarks ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : 'bg-slate-800/50 border-slate-700 text-slate-400'}`}>
            <div className={`w-4 h-4 rounded shadow-sm border flex items-center justify-center transition-colors ${removeAiMarks ? 'bg-amber-500 border-amber-400' : 'bg-slate-900 border-slate-600'}`}>
              {removeAiMarks && <Sparkles className="w-3 h-3 text-slate-900" />}
            </div>
            <input
              type="checkbox"
              className="hidden"
              checked={removeAiMarks}
              onChange={(e) => setRemoveAiMarks(e.target.checked)}
            />
            <span className="text-sm font-medium">Auto-Clean AI Marks</span>
          </label>

          <label className={`flex items-center gap-2.5 px-4 py-2 rounded-xl border transition-all cursor-pointer select-none ${realtimePreview ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-slate-800/50 border-slate-700 text-slate-400'}`}>
            <div className={`relative w-8 h-4 rounded-full transition-colors ${realtimePreview ? 'bg-emerald-500/30' : 'bg-slate-700'}`}>
              <div className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full transition-transform ${realtimePreview ? 'translate-x-4 bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]' : 'bg-slate-400'}`} />
            </div>
            <input
              type="checkbox"
              className="hidden"
              checked={realtimePreview}
              onChange={(e) => setRealtimePreview(e.target.checked)}
            />
            <span className="text-sm font-medium">Live Preview</span>
          </label>
        </div>

        {/* Translation Studio */}
        <div className="flex items-center gap-2 bg-slate-800/50 p-1.5 rounded-xl border border-slate-700">
          <Languages className="w-4 h-4 text-purple-400 ml-2" />
          <select
            value={targetLanguage}
            onChange={(e) => setTargetLanguage(e.target.value)}
            className="bg-transparent text-slate-200 border-none py-1.5 px-2 text-sm focus:outline-none w-32 cursor-pointer appearance-none"
          >
            {languageOptions.map((lang) => (
              <option key={lang.code} value={lang.code} className="bg-slate-800 text-slate-200">
                {lang.label}
              </option>
            ))}
          </select>
          <div className="w-px h-6 bg-slate-700 mx-1" />
          <button
            onClick={onTranslate}
            disabled={isTranslating}
            className="bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium px-4 py-1.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isTranslating ? 'Translating...' : 'Translate'}
          </button>
        </div>

      </div>
    </div>
  );
}

export default Toolbar;
