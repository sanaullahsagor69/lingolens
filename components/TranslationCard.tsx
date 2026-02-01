import React, { useState } from 'react';
import { TranslationResult } from '../types';
import IntensityMeter from './IntensityMeter';
import { Volume2, Sparkles, Loader2, FileAudio, Languages, Info, Share2, Copy, Check } from './Icons';
import { generateSpeech, playAudioBuffer } from '../services/gemini';

interface TranslationCardProps {
  result: TranslationResult;
}

const TranslationCard: React.FC<TranslationCardProps> = ({ result }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSpeak = async () => {
    if (isPlaying) return;
    setIsPlaying(true);
    try {
      // Speak the equivalent expression or meaning based on what's more "speakable"
      const textToSpeak = result.equivalent && result.equivalent.length < 100 
        ? result.equivalent 
        : result.meaning;
      const audioData = await generateSpeech(textToSpeak);
      await playAudioBuffer(audioData);
    } catch (err) {
      console.error("Failed to play audio", err);
    } finally {
      setIsPlaying(false);
    }
  };

  const formattedResult = `Standard Meaning: ${result.meaning}
Source Script: ${result.sourceNativeScript} (${result.sourcePhoneticScript})
Target Script: ${result.targetScript} (${result.targetPhonetic})
Target Insight (${result.targetLanguage}): ${result.culturalInsightTarget}
English Insight: ${result.culturalNuance}
User's Guide (Input Lang): ${result.inputLanguageSummary}
The "Sagor" Global Link: ${result.sagorGlobalLink?.language}: "${result.sagorGlobalLink?.phrase}" - ${result.sagorGlobalLink?.context}
Intensity: ${result.intensity}/10
Origin: ${result.detectedContext}

Translated by LingoLens (Sana Ullah Sagar)`;

  const handleCopy = () => {
    navigator.clipboard.writeText(formattedResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full animate-fade-in-up">
      <div className="glass-panel rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden group">
        {/* Background Decorative Gradient */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-brand-500/20 blur-3xl rounded-full pointer-events-none group-hover:bg-brand-500/30 transition-all duration-700"></div>

        {/* Header: Original Text & Origin */}
        <div className="mb-8 border-b border-white/10 pb-6">
           <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-semibold text-brand-400 uppercase tracking-widest">
                {result.detectedContext || 'Unknown Origin'}
              </span>
              <div className="flex gap-2">
                 <button 
                  onClick={handleSpeak}
                  disabled={isPlaying}
                  className="p-2 rounded-full hover:bg-white/10 text-slate-300 transition-colors disabled:opacity-50"
                  title="Listen to translation"
                 >
                   {isPlaying ? <Loader2 className="w-5 h-5 animate-spin" /> : <Volume2 className="w-5 h-5" />}
                 </button>
              </div>
           </div>
           
           <div className="space-y-2">
             {result.transcription && (
               <div className="flex items-center gap-2 text-slate-400 text-sm font-medium">
                 <FileAudio className="w-4 h-4" />
                 <span>Transcription: "{result.transcription}"</span>
               </div>
             )}
             
             {/* Source Script Display */}
             <h2 className="text-4xl md:text-5xl font-serif font-medium text-white leading-tight">
               {result.sourceNativeScript}
             </h2>

             {/* Source Phonetic Display */}
             <p className="text-xl text-brand-300/90 font-serif italic">
                {result.sourcePhoneticScript}
             </p>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          
          {/* Left Column: Meaning & Target Details */}
          <div className="space-y-8">
            <div>
              <h3 className="text-sm font-medium text-slate-400 mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-400" />
                Standard Meaning ({result.targetLanguage})
              </h3>
              <p className="text-xl text-slate-100 leading-relaxed font-light mb-3">
                {result.meaning}
              </p>
              
              {/* Target Script Block */}
              <div className="bg-white/5 rounded-lg p-3 border border-white/5">
                 <div className="text-2xl text-white font-serif mb-1">{result.targetScript}</div>
                 <div className="text-sm text-slate-400 font-mono">{result.targetPhonetic}</div>
              </div>
            </div>

            {result.sagorGlobalLink && (
              <div className="bg-gradient-to-br from-indigo-900/30 to-purple-900/30 rounded-xl p-5 border border-indigo-500/20">
                 <h3 className="text-xs font-bold text-indigo-300 mb-3 flex items-center gap-2 uppercase tracking-widest">
                   <Share2 className="w-4 h-4" />
                   The "Sagor" Global Link
                 </h3>
                 <div className="space-y-2">
                   <div className="flex items-baseline gap-2">
                     <span className="text-indigo-400 font-semibold text-sm">{result.sagorGlobalLink.language}:</span>
                     <span className="text-lg text-white font-serif italic">"{result.sagorGlobalLink.phrase}"</span>
                   </div>
                   <p className="text-sm text-indigo-200/80 leading-relaxed">
                     {result.sagorGlobalLink.context}
                   </p>
                 </div>
              </div>
            )}
          </div>

          {/* Right Column: Insights */}
          <div className="space-y-6">
            
            {/* Target & English Insights */}
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-brand-300 mb-1">Target Insight ({result.targetLanguage})</h3>
                <p className="text-base text-slate-200 leading-relaxed font-serif bg-brand-900/10 p-3 rounded-lg border-l-2 border-brand-500">
                  {result.culturalInsightTarget}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-slate-500 mb-1">English Insight</h3>
                <p className="text-sm text-slate-400 leading-relaxed italic">
                  {result.culturalNuance}
                </p>
              </div>
            </div>

            {/* User's Guide (Input Language) */}
            {result.inputLanguageSummary && (
               <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">User's Guide</h3>
                  <p className="text-sm text-slate-300 font-medium">
                     {result.inputLanguageSummary}
                  </p>
               </div>
            )}

            {/* SUS Insight */}
            {result.susInsight && (
              <div className="bg-brand-900/10 border border-brand-500/10 rounded-xl p-4 relative overflow-hidden">
                 <h3 className="text-xs font-bold text-brand-500/80 mb-2 uppercase tracking-wider flex items-center gap-2">
                   <Info className="w-3 h-3" />
                   SUS Insight
                 </h3>
                 <p className="text-sm text-brand-100/70 leading-relaxed font-medium">
                   {result.susInsight}
                 </p>
              </div>
            )}

            <div className="bg-slate-900/40 p-4 rounded-xl border border-white/5">
              <IntensityMeter value={result.intensity} />
            </div>
          </div>
        </div>

        {/* Copyable Code Block Section */}
        <div className="mt-8 pt-8 border-t border-white/5">
          <div className="bg-[#0b1221] rounded-xl border border-white/10 overflow-hidden relative group/code shadow-lg">
            <div className="flex justify-between items-center px-4 py-3 bg-white/5 border-b border-white/5">
               <span className="text-xs font-mono text-slate-500 flex items-center gap-2">
                 <span className="w-2 h-2 rounded-full bg-brand-500"></span>
                 Result.txt
               </span>
               <button 
                 onClick={handleCopy} 
                 className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-2.5 py-1.5 rounded-lg border border-white/5"
               >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Result</span>
                    </>
                  )}
               </button>
            </div>
            <pre className="p-4 text-sm text-slate-300 font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed selection:bg-brand-500/30">
              {formattedResult}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TranslationCard;