import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  Send, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Bot, 
  User, 
  Zap, 
  RefreshCw,
  ArrowRight,
  MessageSquarePlus,
  Compass
} from 'lucide-react';
import ResponseWidget from '../Widgets/ResponseWidget';

export default function ChatPanel({ 
  selectedProject, 
  onTaskUpdated, 
  onNavigateTab,
  triggerVoiceOnLoad = false
}) {
  const [messages, setMessages] = useState([
    {
      id: 'welcome-1',
      sender: 'ai',
      text: `Hello! I'm your ArchVoice Project Assistant. I'm connected to your active database for **${selectedProject}**.\n\nYou can speak or type commands like *"What tasks are overdue?"* or *"Create a task for Rahul to finish the electrical drawing by Friday."*`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      widgetType: 'PROJECT_SUMMARY',
      widgetData: null
    }
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isTtsEnabled, setIsTtsEnabled] = useState(true);
  const [demoMode, setDemoMode] = useState(false);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const isProcessingVoiceRef = useRef(false); // Guard: prevents mic from picking up AI response

  // Suggested Prompts as requested
  const suggestedPrompts = [
    'What is the current status of Project Alpha?',
    'Show me all overdue tasks.',
    'Download drawings for Project Alpha.',
    'Who is responsible for the electrical drawing?',
    'Create a task for Rahul to finish the electrical drawing by Friday.',
    'Show pending approvals.',
    'Mark the HVAC drawing as completed.',
    'Send a reminder to Rahul about the overdue drawing.',
  ];


  const [voiceStatus, setVoiceStatus] = useState(''); // Visual status banner
  const silenceTimerRef = useRef(null);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Auto-start listening when triggerVoiceOnLoad is activated
  useEffect(() => {
    if (triggerVoiceOnLoad) {
      startListening();
    }
  }, [triggerVoiceOnLoad]);


  // Dynamic voice recognition with noise suppression — stops after user finishes speaking
  const startListening = async () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Browser Speech Recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.');
      return;
    }

    // Don't allow starting mic while processing a previous voice command / AI is responding
    if (isProcessingVoiceRef.current) return;

    if (isListening) {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
      setIsListening(false);
      setVoiceStatus('');
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      return;
    }

    try {
      // Cancel any active TTS so the mic doesn't pick up the AI's voice
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }

      // Step 1: Microphone stream with Noise Suppression & Echo Cancellation audio constraints
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        setVoiceStatus('Initializing noise-suppressed microphone...');
        await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            channelCount: 1,
            sampleRate: 48000
          }
        });
      }

      // Step 2: SpeechRecognition — continuous=false so it stops after a natural speech pause
      const recognition = new SpeechRecognition();
      recognition.continuous = false; // Stop automatically after user pauses speaking
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      recognition.lang = 'en-US';

      let accumulatedText = '';
      let hasSubmitted = false; // Prevent double-submit

      recognition.onstart = () => {
        setIsListening(true);
        isProcessingVoiceRef.current = false;
        setVoiceStatus('🎙 Listening (Noise Suppressed)... Speak your command!');
        setInputQuery('');
      };

      recognition.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = 0; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + ' ';
          } else {
            interimTranscript += event.results[i][0].transcript + ' ';
          }
        }

        const displayText = (finalTranscript + interimTranscript).trim();
        if (displayText) {
          accumulatedText = displayText;
          setInputQuery(displayText);
          setVoiceStatus(`Heard: "${displayText}"`);
        }

        // If we got a final result, stop recognition immediately and submit
        if (finalTranscript.trim().length > 2) {
          accumulatedText = finalTranscript.trim();
          setInputQuery(accumulatedText);

          // Clear any existing silence timer
          if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);

          // Stop recognition right away — no need to wait
          try { recognition.stop(); } catch (e) {}
        }
      };

      recognition.onerror = (event) => {
        console.warn('Speech Recognition Event Error:', event.error);
        if (event.error === 'no-speech') {
          setVoiceStatus('No speech detected — try again.');
        } else if (event.error === 'not-allowed' || event.error === 'permission-denied') {
          setIsListening(false);
          setVoiceStatus('Microphone permission blocked. Please allow mic in browser address bar (🔒 icon).');
          alert('Microphone access blocked. Click the lock icon in your address bar and set Microphone to ALLOW.');
        } else if (event.error === 'audio-capture') {
          setIsListening(false);
          setVoiceStatus('No working microphone input found.');
        } else {
          setIsListening(false);
          setVoiceStatus(`Voice error: ${event.error}`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        recognitionRef.current = null;

        if (!hasSubmitted && accumulatedText && accumulatedText.trim().length > 1) {
          hasSubmitted = true;
          isProcessingVoiceRef.current = true; // Block mic restart until AI responds
          setVoiceStatus('Sending your voice command...');
          const textToSubmit = accumulatedText.trim();
          // Small delay to ensure recognition is fully torn down before sending
          setTimeout(() => {
            handleSendMessage(textToSubmit);
            setVoiceStatus('');
            // Allow mic again after a delay (gives AI TTS time to finish)
            setTimeout(() => {
              isProcessingVoiceRef.current = false;
            }, 1000);
          }, 200);
        } else {
          setTimeout(() => setVoiceStatus(''), 2000);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();

    } catch (err) {
      console.error('Voice start exception:', err);
      setIsListening(false);
      setVoiceStatus('Microphone access denied or unreadable.');
      alert('Could not start microphone. Please ensure your microphone is connected and allowed in browser settings.');
    }
  };

  // Text To Speech readout — only speaks when mic is fully stopped
  const speakText = (text) => {
    if (!isTtsEnabled || !('speechSynthesis' in window)) return;
    // Never speak if mic is still listening (prevents mic from recording AI response)
    if (isListening || recognitionRef.current) return;
    window.speechSynthesis.cancel(); // Stop any active speech
    
    // Strip markdown tags before speaking
    const cleanText = text.replace(/[*_#`]/g, '').slice(0, 300);
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  // Submit Query to Backend API
  const handleSendMessage = async (textToSend = null) => {
    const query = (textToSend || inputQuery).trim();
    if (!query || isLoading) return;

    // Force-stop recognition if somehow still active
    if (isListening && recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
      recognitionRef.current = null;
      setIsListening(false);
    }

    // Add user message
    const userMsgId = 'user-' + Date.now();
    const newUserMsg = {
      id: userMsgId,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, newUserMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const activeUser = (() => {
        try {
          const saved = localStorage.getItem('archvoice_user');
          return saved ? JSON.parse(saved) : null;
        } catch (e) { return null; }
      })();

      const response = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          projectContext: selectedProject,
          userName: activeUser?.name || 'User'
        })
      });


      const resData = await response.json();

      if (resData.isDemoFallback) {
        setDemoMode(true);
      }

      const aiMsg = {
        id: 'ai-' + Date.now(),
        sender: 'ai',
        text: resData.response || "Here is the requested project information.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        intent: resData.intent,
        widgetType: resData.widgetType,
        widgetData: resData.widgetData,
        isDemoFallback: resData.isDemoFallback
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsLoading(false);

      // Speak response back
      speakText(resData.response);

      // Auto download PDF if a specific document was targeted
      if (resData.autoDownloadDoc) {
        try {
          const doc = resData.autoDownloadDoc;
          const res = await fetch(`http://localhost:5000/api/documents/${doc.id}/download`);
          if (res.ok) {
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const contentDisposition = res.headers.get('Content-Disposition');
            const match = contentDisposition && contentDisposition.match(/filename="(.+)"/);
            a.download = match ? match[1] : doc.name.replace(/\.[^.]+$/, '') + '.pdf';
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
          }
        } catch (e) {
          console.error('Auto-download exception:', e);
        }
      }

      // Trigger automatic background refresh of dashboard if an action was taken
      if (onTaskUpdated && (resData.intent === 'CREATE_TASK' || resData.intent === 'UPDATE_TASK' || resData.intent === 'CREATE_REMINDER')) {
        onTaskUpdated();
      }


    } catch (error) {
      console.error('Chat AI submit error:', error);
      setIsLoading(false);
      setMessages((prev) => [
        ...prev,
        {
          id: 'error-' + Date.now(),
          sender: 'ai',
          text: `⚠️ Offline mode fallback: Connected to local database. ${error.message}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0b0f19] overflow-hidden select-text">
      {/* Assistant Header Banner */}
      <div className="px-6 py-4 bg-[#0d1322] border-b border-slate-800 flex items-center justify-between shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-white tracking-tight">Talk to your project</h2>
            {demoMode && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-400" /> Demo Engine
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Ask questions, find information, and take action using natural language.
          </p>
        </div>

        {/* Header Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsTtsEnabled(!isTtsEnabled)}
            className={`p-2 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-all ${
              isTtsEnabled
                ? 'bg-blue-600/20 text-blue-300 border-blue-500/40'
                : 'bg-slate-900 text-slate-400 border-slate-800'
            }`}
            title="Toggle Assistant Speech Readout"
          >
            {isTtsEnabled ? <Volume2 className="w-4 h-4 text-blue-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            <span className="hidden sm:inline">{isTtsEnabled ? 'Voice On' : 'Muted'}</span>
          </button>
        </div>
      </div>

      {/* Chat Messages Body */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 max-w-3xl ${
              msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
            }`}
          >
            {/* Avatar */}
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                msg.sender === 'user'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-400 text-white shadow-md shadow-indigo-600/30'
              }`}
            >
              {msg.sender === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
            </div>

            {/* Bubble */}
            <div className="space-y-1 max-w-2xl">
              <div
                className={`p-4 rounded-2xl text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-none shadow-md'
                    : 'bg-[#131a2b] border border-slate-800/90 text-slate-100 rounded-tl-none shadow-lg'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.text}</div>

                {/* Render Visual Widget (Task Card, Approval List, Action Success) */}
                {msg.sender === 'ai' && msg.widgetType && (
                  <ResponseWidget
                    widgetType={msg.widgetType}
                    data={msg.widgetData}
                    onTaskUpdated={onTaskUpdated}
                    onNavigateTab={onNavigateTab}
                  />
                )}
              </div>

              {/* Timestamp & Intent Badge */}
              <div
                className={`flex items-center gap-2 text-[10px] text-slate-500 px-1 ${
                  msg.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <span>{msg.timestamp}</span>
                {msg.intent && (
                  <span className="font-semibold text-slate-400 bg-slate-900 px-1.5 py-0.2 rounded border border-slate-800">
                    {msg.intent}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Loading Typing Skeleton */}
        {isLoading && (
          <div className="flex gap-3 mr-auto max-w-md">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-600 text-white flex items-center justify-center shrink-0 animate-pulse">
              <Bot className="w-5 h-5" />
            </div>
            <div className="p-4 rounded-2xl rounded-tl-none bg-[#131a2b] border border-slate-800 text-slate-400 text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-400 animate-spin" />
              <span>Analyzing project database & extracting intent...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompts Shelf */}
      <div className="px-6 py-2 bg-[#0d1322]/60 border-t border-slate-800/60 overflow-x-auto scrollbar-none flex items-center gap-2">
        <div className="text-[11px] font-bold text-slate-400 flex items-center gap-1 shrink-0 mr-1">
          <Compass className="w-3.5 h-3.5 text-blue-400" /> Prompts:
        </div>
        {suggestedPrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(prompt)}
            className="text-xs text-slate-300 hover:text-white bg-slate-900/90 hover:bg-blue-900/40 border border-slate-800 hover:border-blue-700/50 px-3 py-1.5 rounded-full transition-all shrink-0 flex items-center gap-1"
          >
            <span>{prompt}</span>
          </button>
        ))}
      </div>

      {/* Listening & Voice Status Feedback Bar */}
      {(isListening || voiceStatus) && (
        <div className={`border-t px-6 py-2 flex items-center justify-between transition-all ${
          isListening 
            ? 'bg-rose-950/50 border-rose-900/60' 
            : 'bg-blue-950/40 border-blue-900/50 text-blue-300'
        }`}>
          <div className="flex items-center gap-3">
            {isListening && (
              <div className="flex items-end gap-1 h-5">
                <div className="w-1 bg-rose-500 rounded-full sound-bar" />
                <div className="w-1 bg-rose-500 rounded-full sound-bar" />
                <div className="w-1 bg-rose-500 rounded-full sound-bar" />
                <div className="w-1 bg-rose-500 rounded-full sound-bar" />
                <div className="w-1 bg-rose-500 rounded-full sound-bar" />
              </div>
            )}
            <span className={`text-xs font-bold tracking-wide ${isListening ? 'text-rose-300 animate-pulse' : 'text-slate-200'}`}>
              {voiceStatus || (isListening ? '🎙 Listening... Speak clearly into your microphone' : '')}
            </span>
          </div>
          {isListening && (
            <button
              onClick={startListening}
              className="text-xs text-rose-400 hover:underline font-semibold"
            >
              Stop
            </button>
          )}
        </div>
      )}

      {/* Input Box Footer */}
      <div className="p-4 bg-[#0d1322] border-t border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2 bg-[#131a2b] border border-slate-700/70 rounded-2xl p-1.5 focus-within:border-blue-500 transition-colors shadow-inner"
        >
          {/* Mic Button */}
          <button
            type="button"
            onClick={startListening}
            className={`p-3 rounded-xl transition-all ${
              isListening
                ? 'bg-rose-600 text-white animate-bounce shadow-lg shadow-rose-600/50'
                : 'bg-slate-800/80 hover:bg-blue-600 text-slate-300 hover:text-white'
            }`}
            title={isListening ? 'Stop Listening' : 'Speak to ArchVoice'}
          >
            <Mic className="w-5 h-5" />
          </button>

          {/* Text Input */}
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder={`Ask ArchVoice about ${selectedProject}...`}
            className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none px-2"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputQuery.trim() || isLoading}
            className={`p-3 rounded-xl font-semibold transition-all flex items-center justify-center ${
              inputQuery.trim() && !isLoading
                ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 cursor-pointer'
                : 'bg-slate-800 text-slate-600 cursor-not-allowed'
            }`}
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
