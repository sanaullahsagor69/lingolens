import React, { useState, useEffect, useRef } from 'react';
import { 
  Languages, 
  ArrowRight, 
  Loader2, 
  History,
  Trash2,
  Upload,
  FileAudio,
  X
} from './components/Icons';
import TranslationCard from './components/TranslationCard';
import { analyzeText, analyzeAudio } from './services/gemini';
import { TranslationResult, TargetLanguage, HistoryItem, LoadingState } from './types';

const SUGGESTIONS = [
  "Ami bhalo achi", // Banglish
  "Ki obostha?", // Banglish
  "Kya haal hai?", // Hinglish
  "Goyna gachh", 
  "Adda"
];

function App() {
  const [inputText, setInputText] = useState('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [targetLang, setTargetLang] = useState<TargetLanguage>(TargetLanguage.ENGLISH);
  const [status, setStatus] = useState<LoadingState>('idle');
  const [result, setResult] = useState<TranslationResult | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load history from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('lingolens_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  const addToHistory = (item: TranslationResult) => {
    const newItem: HistoryItem = {
      ...item,
      id: Date.now().toString(),
      timestamp: Date.now()
    };
    const updated = [newItem, ...history].slice(0, 10); // Keep last 10
    setHistory(updated);
    localStorage.setItem('lingolens_history', JSON.stringify(updated));
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('lingolens_history');
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          // Remove the "data:*/*;base64," prefix
          const base64String = reader.result.split(',')[1];
          resolve(base64String);
        } else {
          reject(new Error('Failed to convert file to base64'));
        }
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleAnalyze = async () => {
    if (!inputText.trim() && !audioFile) return;

    setStatus('analyzing');
    setError(null);
    setResult(null);

    try {
      let data: TranslationResult;

      if (audioFile) {
        const base64Audio = await fileToBase64(audioFile);
        data = await analyzeAudio(base64Audio, audioFile.type, targetLang);
      } else {
        data = await analyzeText(inputText, targetLang);
      }

      setResult(data);
      addToHistory(data);
      setStatus('idle');
    } catch (err) {
      console.error(err);
      setError("Failed to analyze. Please try again.");
      setStatus('error');
    }
  };

  const handleSuggestionClick = (text: string) => {
    setInputText(text);
    setAudioFile(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAudioFile(e.target.files[0]);
      setInputText(''); // Clear text input when file is selected
    }
  };

  const clearFile = () => {
    setAudioFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const loadHistoryItem = (item: HistoryItem) => {
    setResult(item);
    if (item.transcription) {
       setInputText(""); 
       setAudioFile(null); 
    } else {
       setInputText(item.originalText);
       setAudioFile(null);
    }
    setTargetLang(item.targetLanguage as TargetLanguage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#0f172a] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0f172a] to-black text-white selection:bg-brand-500/30">
      
      {/* Navbar */}
      <nav className="border-b border-white/5 bg-[#0f172a]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-tr from-brand-400 to-indigo-500 p-2 rounded-lg">
              <Languages className="w-5 h-5 text-white" />
            </div>
            <span className="font-serif text-xl font-bold tracking-tight text-slate-100">
              LingoLens
            </span>
          </div>
          <span className="text-xs font-medium text-slate-500">
            Created by Sana Ullah Sagar
          </span>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-12 md:py-16">
        
        {/* Hero / Input Section */}
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400 mb-4">
            Decode Cultural Context
          </h1>
          <p className="text-slate-400 text-lg mb-8 max-w-2xl mx-auto">
            Translate dialects, slang, and regional nuances into standard language with deep analysis of emotion and cultural history.
          </p>

          <div className="glass-panel p-2 rounded-2xl md:rounded-3xl shadow-2xl ring-1 ring-white/10">
            <div className="flex flex-col md:flex-row gap-2">
              <div className="relative flex-grow group">
                {audioFile ? (
                   <div className="w-full h-14 md:h-16 px-6 bg-slate-900/50 rounded-xl md:rounded-2xl border border-brand-500/30 flex items-center justify-between">
                      <div className="flex items-center gap-3 text-brand-300">
                        <FileAudio className="w-5 h-5" />
                        <span className="font-medium truncate max-w-[200px]">{audioFile.name}</span>
                      </div>
                      <button 
                        onClick={clearFile}
                        className="p-1 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                   </div>
                ) : (
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                    placeholder="Enter a phrase or upload audio"
                    className="w-full h-14 md:h-16 px-6 pr-12 bg-slate-900/50 rounded-xl md:rounded-2xl border border-transparent focus:border-brand-500/50 focus:ring-4 focus:ring-brand-500/10 focus:bg-slate-900 outline-none text-lg text-white placeholder:text-slate-500 transition-all"
                  />
                )}
                
                {/* File Upload Trigger - Only show if no file selected */}
                {!audioFile && (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2">
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2.5 text-slate-400 hover:text-brand-300 hover:bg-white/5 rounded-xl transition-all"
                      title="Upload Audio"
                    >
                      <Upload className="w-5 h-5" />
                    </button>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="audio/*" 
                      onChange={handleFileChange}
                    />
                  </div>
                )}
              </div>
              
              <div className="flex gap-2">
                <select 
                  value={targetLang}
                  onChange={(e) => setTargetLang(e.target.value as TargetLanguage)}
                  className="h-14 md:h-16 px-4 bg-slate-900/50 border border-transparent hover:bg-slate-800 rounded-xl md:rounded-2xl text-sm font-medium text-slate-300 focus:outline-none cursor-pointer transition-colors max-w-[150px]"
                >
                  <optgroup label="Global Hub">
                    <option value={TargetLanguage.ENGLISH}>{TargetLanguage.ENGLISH}</option>
                    <option value={TargetLanguage.CHINESE}>{TargetLanguage.CHINESE}</option>
                    <option value={TargetLanguage.SPANISH}>{TargetLanguage.SPANISH}</option>
                    <option value={TargetLanguage.FRENCH}>{TargetLanguage.FRENCH}</option>
                    <option value={TargetLanguage.PORTUGUESE}>{TargetLanguage.PORTUGUESE}</option>
                    <option value={TargetLanguage.RUSSIAN}>{TargetLanguage.RUSSIAN}</option>
                    <option value={TargetLanguage.GERMAN}>{TargetLanguage.GERMAN}</option>
                  </optgroup>
                  <optgroup label="Asia & Indo-Pacific">
                    <option value={TargetLanguage.HINDI}>{TargetLanguage.HINDI}</option>
                    <option value={TargetLanguage.BENGALI}>{TargetLanguage.BENGALI}</option>
                    <option value={TargetLanguage.JAPANESE}>{TargetLanguage.JAPANESE}</option>
                    <option value={TargetLanguage.KOREAN}>{TargetLanguage.KOREAN}</option>
                    <option value={TargetLanguage.INDONESIAN}>{TargetLanguage.INDONESIAN}</option>
                    <option value={TargetLanguage.VIETNAMESE}>{TargetLanguage.VIETNAMESE}</option>
                    <option value={TargetLanguage.THAI}>{TargetLanguage.THAI}</option>
                    <option value={TargetLanguage.PUNJABI}>{TargetLanguage.PUNJABI}</option>
                    <option value={TargetLanguage.TAMIL}>{TargetLanguage.TAMIL}</option>
                    <option value={TargetLanguage.TELUGU}>{TargetLanguage.TELUGU}</option>
                    <option value={TargetLanguage.MARATHI}>{TargetLanguage.MARATHI}</option>
                    <option value={TargetLanguage.FILIPINO}>{TargetLanguage.FILIPINO}</option>
                  </optgroup>
                  <optgroup label="Middle East & Africa">
                    <option value={TargetLanguage.ARABIC}>{TargetLanguage.ARABIC}</option>
                    <option value={TargetLanguage.PERSIAN}>{TargetLanguage.PERSIAN}</option>
                    <option value={TargetLanguage.URDU}>{TargetLanguage.URDU}</option>
                    <option value={TargetLanguage.SWAHILI}>{TargetLanguage.SWAHILI}</option>
                  </optgroup>
                  <optgroup label="Digital/Europe">
                    <option value={TargetLanguage.DUTCH}>{TargetLanguage.DUTCH}</option>
                    <option value={TargetLanguage.POLISH}>{TargetLanguage.POLISH}</option>
                    <option value={TargetLanguage.ITALIAN}>{TargetLanguage.ITALIAN}</option>
                    <option value={TargetLanguage.TURKISH}>{TargetLanguage.TURKISH}</option>
                  </optgroup>
                </select>

                <button
                  onClick={handleAnalyze}
                  disabled={status === 'analyzing' || (!inputText.trim() && !audioFile)}
                  className="h-14 md:h-16 px-8 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-xl md:rounded-2xl transition-all shadow-lg shadow-brand-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
                >
                  {status === 'analyzing' ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Analyzing
                    </>
                  ) : (
                    <>
                      Translate
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Suggestions */}
          {!result && !audioFile && (
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <span className="text-sm text-slate-500 py-1">Try:</span>
              {SUGGESTIONS.map((s) => (
                <button 
                  key={s} 
                  onClick={() => handleSuggestionClick(s)}
                  className="text-sm px-3 py-1 rounded-full bg-slate-800/50 text-brand-300 hover:bg-brand-500/10 hover:text-brand-200 border border-slate-700 transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="max-w-3xl mx-auto mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-200 text-center animate-fade-in">
            {error}
          </div>
        )}

        {/* Results Section */}
        {result && (
          <div className="max-w-4xl mx-auto mb-16">
            <TranslationCard result={result} />
          </div>
        )}

        {/* History Section */}
        {history.length > 0 && (
          <div className="max-w-4xl mx-auto border-t border-white/5 pt-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-slate-300 flex items-center gap-2">
                <History className="w-5 h-5" />
                Recent Translations
              </h2>
              <button 
                onClick={clearHistory}
                className="text-sm text-slate-500 hover:text-red-400 flex items-center gap-1 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Clear
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {history.map((item) => (
                <button
                  key={item.id}
                  onClick={() => loadHistoryItem(item)}
                  className="text-left group p-4 rounded-xl bg-slate-900/30 hover:bg-slate-800/50 border border-white/5 hover:border-brand-500/30 transition-all"
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium text-slate-200 group-hover:text-brand-300 transition-colors truncate pr-4">
                      {item.transcription ? <span className="flex items-center gap-1"><FileAudio className="w-3 h-3"/> {item.transcription}</span> : item.originalText}
                    </span>
                    <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">
                      {item.intensity}/10
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 line-clamp-1">{item.meaning}</p>
                </button>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;