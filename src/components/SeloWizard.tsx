import React, { useState, useEffect, useRef } from "react";
import { 
  ArrowLeft, Camera, Image as ImageIcon, MessageSquare, 
  Sparkles, Check, Play, Pause, RefreshCw, Volume2, 
  VolumeX, Shield, AlertCircle, HelpCircle, Info, ChevronRight, X, Trash2, Plus,
  Video
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Listing } from "../types";

// ==========================================
// PRESETS FOR UPLOAD INTAKE
// ==========================================
interface StockProductPreset {
  emoji: string;
  title: string;
  price: number;
  category: string;
  description: string;
  tags: string[];
  template: string;
  sound: string;
  background: string;
}

const STOCK_PRESETS: StockProductPreset[] = [
  {
    emoji: "🧅",
    title: "Mixed onion bag — 5kg",
    price: 85,
    category: "Fresh produce",
    description: "Farm-fresh high-grade mixed onions harvested this week from Shibuyunji District. Perfect for homes, local restaurants, and trade markets. Fully packed in breathable nets.",
    tags: ["onions", "fresh", "vegetables", "5kg", "shibuyunji"],
    template: "Market fresh",
    sound: "Market vibes",
    background: "Market"
  },
  {
    emoji: "🍯",
    title: "Premium Forest Honey — 1kg",
    price: 125,
    category: "Dried foodstuffs",
    description: "Pure multi-floral raw forest liquid gold sourced directly from expert beekeepers in Choma district. Unprocessed, zero additives, and rich in natural pollen.",
    tags: ["organic", "choma", "honey", "raw", "local-grown"],
    template: "Golden glow",
    sound: "Chill groove",
    background: "Sunny"
  },
  {
    emoji: "🐟",
    title: "Fresh Lake Kariba Bream",
    price: 110,
    category: "Fish & Seafood",
    description: "Plump wild-caught tilapia bream sourced fresh from Lake Kariba. Put on ice immediately after harvest. Perfect for frying, grilling, or stewing.",
    tags: ["bream", "tilapia", "kariba", "fresh-catch", "seafood"],
    template: "Market fresh",
    sound: "Market vibes",
    background: "Studio"
  },
  {
    emoji: "👗",
    title: "Authentic Zambian Chitenge",
    price: 195,
    category: "Fashion & chitenge",
    description: "Bright multi-layered pure cotton wax print fabric wrap. Handcrafted colorful motifs ideal for traditional ceremonies or custom wardrobe creation.",
    tags: ["chitenge", "african-print", "handcrafted", "style", "culture"],
    template: "Neon pop",
    sound: "Street buzz",
    background: "Abstract"
  },
  {
    emoji: "🔌",
    title: "UltraFast Universal Charger",
    price: 150,
    category: "Electronics",
    description: "High-speed multi-port smart power delivery block. Heavy-duty copper wiring, short-circuit heat protections, and universal compatible plugs.",
    tags: ["charger", "fast-charge", "electronics", "tech", "durable"],
    template: "Tech clean",
    sound: "Tech pulse",
    background: "Urban"
  }
];

// Sound Synthesizer engine using Web Audio API
class SeloAudioSynth {
  private ctx: AudioContext | null = null;
  private intervalId: any = null;
  private volumeNode: GainNode | null = null;
  private currentTrackName: string = "";

  startTrack(trackName: string, vol: number) {
    this.stop();
    if (trackName === "No sound") return;

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      this.ctx = new AudioContextClass();
      
      this.volumeNode = this.ctx.createGain();
      this.volumeNode.gain.value = vol / 100;
      this.volumeNode.connect(this.ctx.destination);
      this.currentTrackName = trackName;

      let tempo = 120;
      let notes: number[] = [];

      if (trackName === "Market vibes") {
        tempo = 115;
        // Bright bouncy pentatonic bouncy loop
        notes = [261.63, 293.66, 329.63, 392.00, 440.00, 392.00, 329.63, 293.66]; // C4, D4, E4, G4, A4, G4, E4, D4
      } else if (trackName === "Street buzz") {
        tempo = 140;
        // Fast driving higher register notes
        notes = [329.63, 349.23, 392.00, 392.00, 440.00, 392.00, 349.23, 329.63]; 
      } else if (trackName === "Chill groove") {
        tempo = 90;
        // Soft relaxing major 7th tones
        notes = [220.00, 277.18, 329.63, 415.30, 329.63, 277.18, 220.00, 196.00]; 
      } else if (trackName === "Tech pulse") {
        tempo = 130;
        // Fast cyber arpeggio
        notes = [261.63, 311.13, 392.00, 466.16, 523.25, 466.16, 392.00, 311.13]; 
      }

      let step = 0;
      const stepDuration = 60 / tempo / 2; // eighth notes

      this.intervalId = setInterval(() => {
        if (!this.ctx || !this.volumeNode) return;
        if (this.ctx.state === "suspended") {
          this.ctx.resume();
        }

        const osc = this.ctx.createOscillator();
        const noteGain = this.ctx.createGain();
        
        // Different timbres for different genres
        if (trackName === "Market vibes") {
          osc.type = "sine"; // xylophone-like/marimba
        } else if (trackName === "Tech pulse") {
          osc.type = "sawtooth"; // retro fat synth
        } else if (trackName === "Street buzz") {
          osc.type = "triangle"; // playful vintage key
        } else {
          osc.type = "sine";
        }

        const pitch = notes[step % notes.length];
        osc.frequency.setValueAtTime(pitch, this.ctx.currentTime);

        // Envelope trigger
        noteGain.gain.setValueAtTime(0.4, this.ctx.currentTime);
        noteGain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + stepDuration - 0.02);

        osc.connect(noteGain);
        noteGain.connect(this.volumeNode);
        osc.start();
        osc.stop(this.ctx.currentTime + stepDuration);

        // Occasional sub-bass beat
        if (step % 4 === 0) {
          const kickOsc = this.ctx.createOscillator();
          const kickGain = this.ctx.createGain();
          kickOsc.frequency.setValueAtTime(70, this.ctx.currentTime);
          kickOsc.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 0.15);
          
          kickGain.gain.setValueAtTime(0.5, this.ctx.currentTime);
          kickGain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.18);
          
          kickOsc.connect(kickGain);
          kickGain.connect(this.volumeNode);
          kickOsc.start();
          kickOsc.stop(this.ctx.currentTime + 0.19);
        }

        step++;
      }, stepDuration * 1000);

    } catch (err) {
      console.warn("Synth initialization failed, browser audio policy sandbox active.", err);
    }
  }

  setVolume(vol: number) {
    if (this.volumeNode) {
      this.volumeNode.gain.value = vol / 100;
    }
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
    }
    this.volumeNode = null;
    this.currentTrackName = "";
  }
}

// Global hook instantiating synth
const audioSynth = new SeloAudioSynth();

// Curated premium high-fidelity background scenes supporting Zambia & African Retail settings
const CURATED_SCENES: Record<string, string> = {
  "Market Scene": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80",
  "Market": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80",
  "Sunny Outdoor": "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=1200&q=80",
  "Sunny": "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=1200&q=80",
  "Sunset Glow": "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80",
  "Luxury Store": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
  "Studio": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
  "Tech Studio": "https://images.unsplash.com/photo-1547082299-de196ea013d6?auto=format&fit=crop&w=1200&q=80",
  "Urban": "https://images.unsplash.com/photo-1547082299-de196ea013d6?auto=format&fit=crop&w=1200&q=80"
};

interface SeloWizardProps {
  userRole: "SELLER" | "AGENT";
  portfolioSellers?: { seller_id: string; name: string }[];
  onBack: () => void;
  onPublishSuccess: (newListing: Listing) => void;
  onSpawnToast: (toast: { message: string; subText?: string } | null) => void;
}

export default function SeloWizard({
  userRole,
  portfolioSellers = [
    { seller_id: "sel-chipo", name: "Chipo Mwansa (Chisamba Maize)" },
    { seller_id: "sel-kabwa", name: "Fred Kabwe (Lake Kariba Bream)" },
    { seller_id: "sel-tembo", name: "Phiri Tembo (Organic Veggies)" }
  ],
  onBack,
  onPublishSuccess,
  onSpawnToast
}: SeloWizardProps) {
  
  // Current screen/step (1 to 9)
  const [step, setStep] = useState<number>(1);
  const [selectedPreset, setSelectedPreset] = useState<StockProductPreset>(STOCK_PRESETS[0]);

  // AI Analyst state properties
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const isAnalyzingRef = useRef<boolean>(false);

  // Cloudinary AI Background Removal states
  const [originalImageBase64, setOriginalImageBase64] = useState<string | null>(null);
  const [cloudinaryPngUrl, setCloudinaryPngUrl] = useState<string | null>(null);
  const [isRemovingBg, setIsRemovingBg] = useState<boolean>(false);
  const [bgRemoved, setBgRemoved] = useState<boolean>(false);
  const [cloudinaryWarning, setCloudinaryWarning] = useState<string | null>(null);

  useEffect(() => {
    isAnalyzingRef.current = isAnalyzing;
  }, [isAnalyzing]);

  useEffect(() => {
    return () => {
      if (voiceoverAudioRef.current) {
        voiceoverAudioRef.current.pause();
      }
    };
  }, []);
  
  // Custom states for wizard items
  const [title, setTitle] = useState<string>(STOCK_PRESETS[0].title);
  const [description, setDescription] = useState<string>(STOCK_PRESETS[0].description);
  const [price, setPrice] = useState<number>(STOCK_PRESETS[0].price);
  const [category, setCategory] = useState<string>(STOCK_PRESETS[0].category);
  const [tags, setTags] = useState<string[]>(STOCK_PRESETS[0].tags);
  const [newTagVal, setNewTagVal] = useState<string>("");

  // Step 3 state
  const [template, setTemplate] = useState<string>(STOCK_PRESETS[0].template);
  // Step 4 state
  const [background, setBackground] = useState<string>(STOCK_PRESETS[0].background);
  const [backgroundBlur, setBackgroundBlur] = useState<number>(10);
  
  // AI Scene Generation States
  const [aiBackgroundImage, setAiBackgroundImage] = useState<string | null>(CURATED_SCENES[STOCK_PRESETS[0].background] || null);
  const [aiEngine, setAiEngine] = useState<string>("Imagen 4");
  const [isGeneratingBg, setIsGeneratingBg] = useState<boolean>(false);
  const [generationLog, setGenerationLog] = useState<string | null>(null);
  // Step 5 state
  const [entryAnimation, setEntryAnimation] = useState<string>("Zoom in");
  const [visualEffect, setVisualEffect] = useState<string>("Sparkle");
  const [textOverlay, setTextOverlay] = useState<string>("Price pop");
  
  // Runway Video Generation States
  const [runwayVideoUrl, setRunwayVideoUrl] = useState<string | null>(null);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState<boolean>(false);
  const [videoPrompt, setVideoPrompt] = useState<string>("");
  const [videoDuration, setVideoDuration] = useState<number>(15);
  const [videoEngine, setVideoEngine] = useState<string>("Gen-4.5");
  const [videoLog, setVideoLog] = useState<string | null>(null);
  // Step 6 state
  const [soundTrack, setSoundTrack] = useState<string>("Market vibes");
  const [soundVolume, setSoundVolume] = useState<number>(60);
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false);

  // Agent Specific State
  const [selectedAgentSellerId, setSelectedAgentSellerId] = useState<string>(portfolioSellers[0].seller_id);
  const [customZone, setCustomZone] = useState<string>("Lusaka Central");

  // Step 2 processing simulation control
  const [pipelineProgress, setPipelineProgress] = useState<number>(0);
  const [activePipelineIdx, setActivePipelineIdx] = useState<number>(0);

  // Replay animation triggers
  const [animTriggerKey, setAnimTriggerKey] = useState<number>(0);
  const [showGuidelines, setShowGuidelines] = useState<boolean>(false);

  // ElevenLabs Voiceover states
  const [narrationText, setNarrationText] = useState<string>("Muli bwanji Zambian buyers! Selected direct from top local farms. Perfect quality, incredible taste, and amazing nourishment.");
  const [narrationAudioUrl, setNarrationAudioUrl] = useState<string>("");
  const [isGeneratingVoiceover, setIsGeneratingVoiceover] = useState<boolean>(false);
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>("JBFqnCBsd6RMkjVDRZzb");

  // Deepgram Speech-to-Text & Burn Captions states
  const [subtitles, setSubtitles] = useState<Array<{ text: string; start: number; end: number }>>([]);
  const [isGeneratingSubtitles, setIsGeneratingSubtitles] = useState<boolean>(false);
  const [subtitleStyle, setSubtitleStyle] = useState<string>("Selo Neon 🔥");
  const [subtitlePosition, setSubtitlePosition] = useState<"Center" | "Bottom" | "Top">("Bottom");
  const [voiceoverTime, setVoiceoverTime] = useState<number>(0);
  const [isPlayingVoiceover, setIsPlayingVoiceover] = useState<boolean>(false);
  const voiceoverAudioRef = useRef<HTMLAudioElement | null>(null);

  // Suno AI Music States
  const [sunoAudioUrl, setSunoAudioUrl] = useState<string>("");
  const [sunoTrackTitle, setSunoTrackTitle] = useState<string>("");
  const [isGeneratingSunoMusic, setIsGeneratingSunoMusic] = useState<boolean>(false);
  const [sunoMood, setSunoMood] = useState<string>("Exciting");
  const [sunoIndustry, setSunoIndustry] = useState<string>("Marketplace advertising");
  const [sunoDuration, setSunoDuration] = useState<number>(30);
  const [sunoInstrumental, setSunoInstrumental] = useState<boolean>(true);
  const [sunoPrompt, setSunoPrompt] = useState<string>(
    "Generate instrumental background music. Mood: Exciting. Industry: Marketplace advertising. Duration: 30 seconds. No vocals. Optimised for mobile video ads."
  );

  const sunoAudioRef = useRef<HTMLAudioElement | null>(null);

  // Final Video Render states (FFmpeg pipeline running in Cloud Run)
  const [isCompilingVideo, setIsCompilingVideo] = useState<boolean>(false);
  const [compiledVideoUrl, setCompiledVideoUrl] = useState<string>("");
  const [renderLogs, setRenderLogs] = useState<string[]>([]);
  const [renderSuccess, setRenderSuccess] = useState<boolean>(false);

  // Viral Listing Score State
  const [viralScoreReport, setViralScoreReport] = useState<{
    viralScore: number;
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
  } | null>(null);
  const [isAnalyzingViralScore, setIsAnalyzingViralScore] = useState<boolean>(false);
  const [viralScoreError, setViralScoreError] = useState<string | null>(null);

  const analyzeViralListingScore = async () => {
    setIsAnalyzingViralScore(true);
    setViralScoreError(null);
    try {
      const response = await fetch("/api/gemini/analyze-listing", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title,
          description,
          price,
          category,
          tags,
          template,
          background,
          entryAnimation,
          visualEffect,
          textOverlay,
          soundTrack: sunoAudioUrl ? `Suno: ${sunoTrackTitle}` : soundTrack,
          narrationText
        })
      });
      if (!response.ok) {
        throw new Error(`Failed to generate viral report: ${response.statusText}`);
      }
      const data = await response.json();
      setViralScoreReport(data);
      onSpawnToast({
        message: `Selonachipa Score: ${data.viralScore}/100! 📈`,
        subText: "Listing Quality AI report is ready."
      });
    } catch (err: any) {
      console.error(err);
      setViralScoreError(err.message || "Could not analyze listing. Please try again.");
    } finally {
      setIsAnalyzingViralScore(false);
    }
  };

  const startFinalVideoCompilation = async () => {
    setIsCompilingVideo(true);
    setRenderSuccess(false);
    setRenderLogs([]);
    try {
      const res = await fetch("/api/video/render", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productImage: cloudinaryPngUrl || originalImageBase64 || "📦",
          aiAnimation: runwayVideoUrl || "https://assets.mixkit.co/videos/preview/mixkit-vegetables-on-a-market-stall-40502-large.mp4",
          background,
          voiceoverUrl: narrationAudioUrl,
          musicUrl: sunoAudioUrl,
          subtitles,
          subtitleStyle,
          subtitlePosition
        })
      });

      if (!res.ok) throw new Error("Compilation server returned errors");
      const data = await res.json();
      if (data.success) {
        // Stream the logs for a pristine interactive developer terminal feel
        for (let i = 0; i < data.logs.length; i++) {
          await new Promise((resolve) => setTimeout(resolve, 150));
          setRenderLogs(prev => [...prev, data.logs[i]]);
        }
        setCompiledVideoUrl(data.videoUrl);
        setRenderSuccess(true);
        // Overwrite the runwayVideoUrl so this compiled MP4 propagates to other buyer views upon publish
        setRunwayVideoUrl(data.videoUrl);
        onSpawnToast({
          message: "1080x1920 MP4 Baked! 🎬",
          subText: "Assets successfully combined into professional aspect ratio with custom burned captions!"
        });
      }
    } catch (err: any) {
      setRenderLogs(prev => [...prev, `[RENDER FAIL] Critical compilation error: ${err.message || String(err)}`]);
      onSpawnToast({ message: "Render Failed!", subText: err.message || "FFmpeg cluster returned an error." });
    } finally {
      setIsCompilingVideo(false);
    }
  };

  const generateSunoMusicTrack = async () => {
    setIsGeneratingSunoMusic(true);
    try {
      const res = await fetch("/api/music/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          prompt: sunoPrompt,
          mood: sunoMood,
          industry: sunoIndustry,
          duration: sunoDuration,
          make_instrumental: sunoInstrumental
        })
      });

      if (!res.ok) {
        throw new Error("Suno AI Music Generation failed");
      }

      const data = await res.json();
      if (data.success) {
        setSunoAudioUrl(data.audioUrl);
        setSunoTrackTitle(data.title);
        
        // Switch to the newly generated Suno track
        setSoundTrack(`Suno AI: ${data.title}`);
        setIsAudioPlaying(true);

        onSpawnToast({
          message: "AI Ad Music Synthesized! 🎵",
          subText: `Suno Partner Access created track: "${data.title}".`
        });
      } else {
        throw new Error(data.errorMsg || "API failure");
      }
    } catch (err: any) {
      console.error(err);
      onSpawnToast({
        message: "Suno Generation Error",
        subText: err.message || "Failed to generate AI background music."
      });
    } finally {
      setIsGeneratingSunoMusic(false);
    }
  };


  const generateSubtitlesFromAudio = async (audioUrl: string, sampleText: string) => {
    setIsGeneratingSubtitles(true);
    try {
      console.log("[Auto-Subtitles] Triggering Deepgram Nova-3 API for STT...", audioUrl);
      const res = await fetch("/api/subtitles/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          audioUrl,
          text: sampleText
        })
      });

      if (!res.ok) {
        throw new Error("Transcriber API returned an error status");
      }

      const data = await res.json();
      if (data.success && Array.isArray(data.subtitles)) {
        setSubtitles(data.subtitles);
        onSpawnToast({
          message: "Deepgram Captions Online! 💬",
          subText: `Burned ${data.subtitles.length} dynamic captions synced to voiceover.`
        });
      }
    } catch (err: any) {
      console.error("[Auto-Subtitles Error]", err);
    } finally {
      setIsGeneratingSubtitles(false);
    }
  };


  const generateVoiceoverNarration = async () => {
    setIsGeneratingVoiceover(true);
    try {
      const res = await fetch("/api/voiceover/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title,
          description,
          price,
          category,
          voiceId: selectedVoiceId
        })
      });

      if (!res.ok) {
        throw new Error("Voiceover generation failed");
      }

      const data = await res.json();
      if (data.success) {
        setNarrationText(data.text);
        setNarrationAudioUrl(data.audioUrl);
        onSpawnToast({
          message: "AI Voiceover Unlocked! 🎙️",
          subText: "Voice narration script generated with ElevenLabs. Now running STT..."
        });

        // Pipeline: Voiceover -> Speech-to-Text
        await generateSubtitlesFromAudio(data.audioUrl, data.text);
      } else {
        throw new Error(data.errorMsg || "API failure");
      }
    } catch (err: any) {
      console.error(err);
      onSpawnToast({
        message: "Voiceover Error",
        subText: err.message || "Failed to generate narration speech."
      });
    } finally {
      setIsGeneratingVoiceover(false);
    }
  };

  const playVoiceoverPreview = () => {
    if (!narrationAudioUrl) return;

    if (voiceoverAudioRef.current) {
      voiceoverAudioRef.current.pause();
      if (isPlayingVoiceover) {
        setIsPlayingVoiceover(false);
        setVoiceoverTime(0);
        return;
      }
    }

    const audio = new Audio(narrationAudioUrl);
    voiceoverAudioRef.current = audio;

    audio.addEventListener("timeupdate", () => {
      setVoiceoverTime(audio.currentTime);
    });

    audio.addEventListener("ended", () => {
      setIsPlayingVoiceover(false);
      setVoiceoverTime(0);
    });

    setIsPlayingVoiceover(true);
    audio.play().catch(e => {
      console.warn("Failed to play preview:", e);
      setIsPlayingVoiceover(false);
    });
  };

  // Helper to render real uploaded product image (with Cloudinary transparent PNG) or fallback emoji
  const renderProductVisual = (sizeClass = "w-28 h-28 text-6xl") => {
    const parts = sizeClass.split(" ");
    const w = parts[0] || "w-28";
    const h = parts[1] || "h-28";
    const txtSize = parts[2] || "text-6xl";
    
    if (cloudinaryPngUrl || originalImageBase64) {
      return (
        <div className={`relative ${w} ${h} flex items-center justify-center shrink-0`}>
          <img 
            src={cloudinaryPngUrl || originalImageBase64 || ""} 
            alt={title}
            referrerPolicy="no-referrer"
            className="max-w-full max-h-full object-contain drop-shadow-xl transform hover:scale-105 transition-all duration-300"
          />
          {cloudinaryPngUrl && bgRemoved && (
            <div className="absolute -bottom-1 -right-1 bg-purple-500/90 border border-purple-500/30 text-[7px] font-mono uppercase font-black text-white px-1.5 py-0.2 rounded-full flex items-center gap-0.5 shadow-md">
              <span>✦ AI PNG</span>
            </div>
          )}
        </div>
      );
    }
    return (
      <span className={`${txtSize} drop-shadow-lg transform hover:scale-110 transition-transform select-none`}>
        {selectedPreset.emoji}
      </span>
    );
  };

  const pipelineSteps = [
    { label: "Object & product detection", desc: "Recognising product shapes, colors, and textures", status: "queued" },
    { label: "Background removal", desc: "Isolating product contours with precision edge detection", status: "queued" },
    { label: "Quality & lighting enhancement", desc: "Correcting white-balance and ambient color ratios", status: "queued" },
    { label: "Animation & motion effects", desc: "Layering entry motion filters and promotional overlays", status: "queued" },
    { label: "Background sound selection", desc: "Matching musical keys to item categories", status: "queued" },
    { label: "Product title, description & price", desc: "Predicting market prices and writing SEO copies", status: "queued" },
    { label: "Advert template assembly", desc: "Constructing high-retention video layouts", status: "queued" }
  ];

  // Map Preset click updates
  const handleSelectPreset = (p: StockProductPreset) => {
    setSelectedPreset(p);
    setTitle(p.title);
    setDescription(p.description);
    setPrice(p.price);
    setCategory(p.category);
    setTags(p.tags);
    setTemplate(p.template);
    setBackground(p.background);
    setAiBackgroundImage(CURATED_SCENES[p.background] || null);
    setSoundTrack(p.sound);
    setAiAnalysis(null); // Clear previous AI analysis if any
  };

  // Handle Real-Time base64 analysis with Gemini and Cloudinary AI Background Removal
  const handleImageSelected = async (file: File) => {
    if (!file) return;

    onSpawnToast({ message: "Selo AI Analyst Initialised", subText: `Reading ${file.name}...` });

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      setOriginalImageBase64(base64);
      setCloudinaryPngUrl(null);
      setBgRemoved(false);
      setCloudinaryWarning(null);

      // Temporary placeholder preset
      const customPreset: StockProductPreset = {
        emoji: "📸",
        title: "Scanning Image...",
        price: 0,
        category: "Other",
        description: "Scanning image details with Selonachipa AI Product Analyst...",
        tags: [],
        template: "Market fresh",
        sound: "Market vibes",
        background: "Studio"
      };
      setSelectedPreset(customPreset);

      // Go to processing screen
      setStep(2);
      setIsAnalyzing(true);
      setIsRemovingBg(true);

      // Execute Gemini and Cloudinary concurrently
      const geminiPromise = fetch("/api/gemini/analyze-product-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ imageBase64: base64 })
      }).then(async (res) => {
        if (!res.ok) throw new Error("Gemini analysis failed");
        return res.json();
      });

      const cloudinaryPromise = fetch("/api/cloudinary/remove-background", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ imageBase64: base64 })
      }).then(async (res) => {
        if (!res.ok) throw new Error("Cloudinary response error");
        return res.json();
      });

      // Handle Gemini Analysis Completion
      try {
        const data = await geminiPromise;
        setAiAnalysis(data);

        // Update step states with parsed details
        setTitle(data.title);
        setDescription(data.description);
        const parsedPrice = parseInt(data.estimatedPriceZMW.replace(/\D/g, "")) || 50;
        setPrice(parsedPrice);
        setCategory(data.category);
        setTags(data.seoTags);

        // Map Category to localized background preset if available
        let mappedBg = "Studio";
        if (data.category?.toLowerCase().includes("produce") || data.category?.toLowerCase().includes("food")) {
          mappedBg = "Market";
        } else if (data.category?.toLowerCase().includes("fashion") || data.category?.toLowerCase().includes("apparel") || data.category?.toLowerCase().includes("chitenge")) {
          mappedBg = "Abstract";
        } else if (data.category?.toLowerCase().includes("electronic") || data.category?.toLowerCase().includes("tech")) {
          mappedBg = "Urban";
        }
        setBackground(mappedBg);
        setAiBackgroundImage(CURATED_SCENES[mappedBg] || null);

        // Map Category to localized soundtrack
        let mappedSound = "Chill groove";
        if (mappedBg === "Market") mappedSound = "Market vibes";
        if (mappedBg === "Urban") mappedSound = "Tech pulse";
        if (mappedBg === "Abstract") mappedSound = "Street buzz";
        setSoundTrack(mappedSound);

        onSpawnToast({
          message: "Selo AI Scan Complete! 🤖",
          subText: `${data.title} - ZMW ${data.estimatedPriceZMW}`
        });
      } catch (err: any) {
        console.error("Analysis failure:", err);
        onSpawnToast({
          message: "Selo AI Analyst Error",
          subText: "Couldn't complete image scan, using default preset."
        });
      } finally {
        setIsAnalyzing(false);
      }

      // Handle Cloudinary Background Removal Completion
      try {
        const bgData = await cloudinaryPromise;
        if (bgData.url) {
          setCloudinaryPngUrl(bgData.url);
          setBgRemoved(bgData.backgroundRemoved);
          if (bgData.warning) {
            setCloudinaryWarning(bgData.warning);
          }
          onSpawnToast({
            message: bgData.backgroundRemoved ? "Cloudinary AI background removed! ✨" : "Photo uploaded to Cloudinary! 📸",
            subText: bgData.backgroundRemoved ? "Saved crystal clear transparent PNG." : "Ready for mock storage sandbox."
          });
        }
      } catch (bgErr: any) {
        console.error("Cloudinary background removal failed:", bgErr);
        onSpawnToast({
          message: "Background Removal Ignored",
          subText: "Retaining original background for preview."
        });
      } finally {
        setIsRemovingBg(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Synchronise active title and background changes into default Runway video generator prompt
  useEffect(() => {
    const cleanPrompt = `A premium commercial advertisement showing the product "${title || "Fresh Item"}" set against a photorealistic, high-end ${background || "Studio"} background scene in Zambia. Smooth cinematic slow zoom in, high commercial advertising style, realistic lighting with warm soft reflections, and subtle dynamic shadows. Keeps the product fully realistic, without rotating it, altering its shape, or warping it. Subtle natural breeze motion. Optimized for TikTok 9:16 vertical feed.`;
    setVideoPrompt(cleanPrompt);
  }, [title, background]);

  // Pipeline simulation timer
  useEffect(() => {
    let timer: any;
    if (step === 2) {
      setPipelineProgress(0);
      setActivePipelineIdx(0);
      
      const interval = setInterval(() => {
        setPipelineProgress(prev => {
          let nextVal = prev + 5;
          
          // If we are currently querying the real Gemini API, hold at 90% until it completes
          if (isAnalyzingRef.current && nextVal >= 90) {
            nextVal = 90;
          }
          
          // Speed up current steps
          const newIdx = Math.floor((nextVal / 100) * pipelineSteps.length);
          if (newIdx < pipelineSteps.length) {
            setActivePipelineIdx(newIdx);
          }

          if (nextVal >= 100) {
            clearInterval(interval);
            setTimeout(() => {
              setStep(3); // Auto-advance to Step 3 Template Picker
            }, 500);
            return 100;
          }
          return nextVal;
        });
      }, 150); // Fast simulation (~3 seconds)
      return () => clearInterval(interval);
    }
  }, [step]);

  // Audio manager syncer
  useEffect(() => {
    const isSunoTrack = soundTrack === "Suno AI Generation" || soundTrack.startsWith("Suno AI:");
    
    if (isAudioPlaying) {
      if (isSunoTrack && sunoAudioUrl) {
        audioSynth.stop();
        if (!sunoAudioRef.current) {
          sunoAudioRef.current = new Audio(sunoAudioUrl);
          sunoAudioRef.current.loop = true;
        } else if (sunoAudioRef.current.src !== sunoAudioUrl) {
          sunoAudioRef.current.pause();
          sunoAudioRef.current = new Audio(sunoAudioUrl);
          sunoAudioRef.current.loop = true;
        }
        sunoAudioRef.current.volume = soundVolume / 100;
        sunoAudioRef.current.play().catch(e => console.warn("Suno audio playback error:", e));
      } else {
        if (sunoAudioRef.current) {
          sunoAudioRef.current.pause();
        }
        audioSynth.startTrack(soundTrack, soundVolume);
      }
    } else {
      audioSynth.stop();
      if (sunoAudioRef.current) {
        sunoAudioRef.current.pause();
      }
    }
    return () => {
      audioSynth.stop();
      if (sunoAudioRef.current) {
        sunoAudioRef.current.pause();
      }
    };
  }, [soundTrack, isAudioPlaying, sunoAudioUrl]);

  // Adjust volume live
  const handleVolumeChange = (v: number) => {
    setSoundVolume(v);
    audioSynth.setVolume(v);
    if (sunoAudioRef.current) {
      sunoAudioRef.current.volume = v / 100;
    }
  };

  // Turn off sound when exit wizard
  useEffect(() => {
    return () => {
      audioSynth.stop();
      if (sunoAudioRef.current) {
        sunoAudioRef.current.pause();
      }
    };
  }, []);

  // Back button controller
  const goBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      onBack();
    }
  };

  const addCustomTag = () => {
    if (newTagVal.trim() && !tags.includes(newTagVal.trim())) {
      setTags([...tags, newTagVal.trim()]);
    }
    setNewTagVal("");
  };

  const removeTag = (indexToRemove: number) => {
    setTags(tags.filter((_, idx) => idx !== indexToRemove));
  };

  // Final Action Clicked
  const handlePublish = () => {
    // Compile Final Object
    const finalItemId = `lst-${Math.floor(1000 + Math.random() * 9000)}`;
    const finalItem: Listing = {
      listing_id: finalItemId,
      title: title,
      description: description,
      suggested_price: price,
      category: category,
      location: userRole === "AGENT" ? `${customZone} Ward, Lusaka` : "Chisamba, Lusaka Central",
      distance_km: Math.floor(Math.random() * 10) + 1,
      seller_id: userRole === "AGENT" ? selectedAgentSellerId : "sel-chipo",
      video_url: runwayVideoUrl || "https://assets.mixkit.co/videos/preview/mixkit-vegetables-on-a-market-stall-40502-large.mp4",
      thumbnail: cloudinaryPngUrl || selectedPreset.emoji,
      views: 0,
      likes: 0,
      shares: 0,
      provenance: userRole === "AGENT" ? "Agent Verified Hub" : "Selo AI Verified Storefront",
      status: "live",
      seo_tags: tags,
      image_url: cloudinaryPngUrl || undefined,
      narration_text: narrationText || undefined,
      narration_audio_url: narrationAudioUrl || undefined,
      bg_music_track: soundTrack || undefined,
      bg_music_url: (soundTrack && (soundTrack === "Suno AI Generation" || soundTrack.startsWith("Suno AI:"))) ? (sunoAudioUrl || undefined) : undefined,
      subtitles: subtitles.length > 0 ? subtitles : undefined,
      viral_score: viralScoreReport?.viralScore || undefined,
      viral_report: viralScoreReport || undefined
    };

    onPublishSuccess(finalItem);
    
    // Play sweet success trigger
    audioSynth.stop();
    setIsAudioPlaying(false);
    onSpawnToast({
      message: "Published Selo Advert! 🚀",
      subText: `"${title}" has been saved and is streaming across ${userRole === "AGENT" ? customZone : "Lusaka"} feeds!`
    });
  };

  // Render Background visual class helpers
  const getBgStyle = () => {
    switch (background) {
      case "Market Scene":
      case "Market":
        return "bg-gradient-to-tr from-emerald-800 to-amber-600";
      case "Sunny Outdoor":
      case "Sunny":
        return "bg-gradient-to-b from-sky-300 via-amber-200 to-yellow-500";
      case "Studio":
      case "Luxury Store":
        return "bg-gradient-to-r from-amber-900 via-amber-700 to-zinc-900";
      case "Tech Studio":
      case "Urban":
        return "bg-gradient-to-br from-indigo-900 via-slate-800 to-purple-900";
      case "Sunset Glow":
        return "bg-gradient-to-tr from-[#991b1b] via-[#ea580c] to-[#eab308]";
      case "Abstract":
        return "bg-gradient-to-r from-purple-600 via-pink-500 to-red-500";
      case "None":
      default:
        return "bg-zinc-900 border border-zinc-800 bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:16px_16px]";
    }
  };

  // Render current active background (curated/generated image or custom color gradient)
  const renderBackgroundLayer = () => {
    if (background === "None") {
      return (
        <div 
          className="absolute inset-x-0 inset-y-0 bg-zinc-900 bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:16px_16px]"
        />
      );
    }

    if (aiBackgroundImage) {
      return (
        <img 
          src={aiBackgroundImage} 
          alt="AI Generated Background"
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover transition-all duration-500"
          style={{ filter: `blur(${backgroundBlur / 5}px)` }}
        />
      );
    }

    return (
      <div 
        className={`absolute inset-x-0 inset-y-0 transition-all ${getBgStyle()}`}
        style={{ filter: `blur(${backgroundBlur / 5}px)` }}
      />
    );
  };

  const handleGenerateBg = async () => {
    setIsGeneratingBg(true);
    setGenerationLog(`Initializing ${aiEngine} background pipeline...`);
    
    try {
      setGenerationLog(`Sending prompt to ${aiEngine} [Location: Zambia, Country Context: African Retail]...`);
      const response = await fetch("/api/gemini/generate-background", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme: background, engine: aiEngine })
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const data = await response.json();
      if (data.imageUrl) {
        setAiBackgroundImage(data.imageUrl);
        setGenerationLog(`4K Scene generated: ${data.isMock ? "Mock fallback loaded successfully." : "Full prompt resolved."}`);
        
        onSpawnToast({
          message: `AI scene generated! ✨`,
          subText: `Created background using ${aiEngine} for theme "${background}".`
        });
      } else {
        throw new Error("No image URL returned by the server.");
      }
    } catch (error: any) {
      console.error("AI Scene Generation error:", error);
      setGenerationLog(`Error: ${error.message || "Failed generating image."}. Retaining standard layout.`);
      onSpawnToast({
        message: "AI Generation Error",
        subText: "Fell back to highly polished offline scene template."
      });
    } finally {
      setIsGeneratingBg(false);
    }
  };

  const handleGenerateVideo = async () => {
    setIsGeneratingVideo(true);
    setVideoLog("Initializing Runway Gen-4 image-to-video matrix...");
    
    // Choose the best available input image
    let sourceImageUrl = cloudinaryPngUrl || aiBackgroundImage || "https://upload.wikimedia.org/wikipedia/commons/8/85/Tour_Eiffel_Wikimedia_Commons_(cropped).jpg";
    
    // If the image is locally uploaded or fallback base64, we can pass a preset representative product URL
    if (sourceImageUrl.startsWith("data:")) {
      if (category?.toLowerCase().includes("produce") || title.toLowerCase().includes("onion")) {
        sourceImageUrl = "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80";
      } else if (title.toLowerCase().includes("honey")) {
        sourceImageUrl = "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=800&q=80";
      } else {
        sourceImageUrl = "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80";
      }
    }

    try {
      setVideoLog("Contacting Runway Gen-4.5 Orchestrator... (Sequence rendering takes about 8s)");
      
      const response = await fetch("/api/runway/animate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: sourceImageUrl,
          prompt: videoPrompt,
          duration: videoDuration
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const data = await response.json();
      if (data.videoUrl) {
        setRunwayVideoUrl(data.videoUrl);
        setVideoLog(`Success: Active task completed! ${data.isMock ? "Mock overlay pipeline mounted." : "Real Runway video loaded."}`);
        
        onSpawnToast({
          message: data.isMock ? "Cinematic Video Simulated! 🎬" : "Runway Advert Generated! 🚀",
          subText: `Created a gorgeously moving ${videoDuration}s TikTok-style sequence.`
        });
      } else {
        throw new Error("No video URL returned by Runway engine.");
      }
    } catch (error: any) {
      console.error("Runway video generation failed:", error);
      setVideoLog(`Failed: ${error.message || "Unknown error occurred"}`);
      onSpawnToast({
        message: "Video Animation Failed",
        subText: "Could not establish Runway connection. Review API key."
      });
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  // Replay entry animations triggered via key increment
  const handleReplayAnimation = () => {
    setAnimTriggerKey(prev => prev + 1);
  };

  return (
    <div className="w-full max-w-md mx-auto bg-[#050510] border border-zinc-900 rounded-3xl overflow-hidden shadow-2xl relative flex flex-col justify-between text-zinc-200 text-left min-h-[640px]">
      
      {/* HEADER SECTION */}
      <div className="p-4 border-b border-zinc-900 bg-[#090916] flex justify-between items-center shrink-0">
        <button
          onClick={goBack}
          className="flex items-center gap-1.5 text-zinc-400 hover:text-white text-xs font-bold font-mono outline-none cursor-pointer bg-transparent border-none py-1 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="text-center">
          <span className="text-[10px] text-purple-400 font-bold font-mono tracking-wider block">SELO AI CREATIVE</span>
          <span className="text-xs text-white font-heavy uppercase font-mono">
            {userRole === "AGENT" ? "Agent Agent-Post" : "Seller Creator"}
          </span>
        </div>

        <span className="bg-purple-500/10 border border-purple-500/30 text-purple-300 px-2 py-0.5 text-[9.5px] font-bold font-mono rounded-full">
          Step {step} of 9
        </span>
      </div>

      {/* COMPONENT BODY */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">

        {/* ------------------------------------- */}
        {/* SCREEN 1: UPLOAD & INTAKE PROTOCOL */}
        {/* ------------------------------------- */}
        {step === 1 && (
          <div className="space-y-4 animate-fadeIn">
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider">New listing</h3>
              <p className="text-xs text-zinc-400 mt-1">
                Upload a photo or video of your product — Selo AI will turn it into a professional, animated video advert.
              </p>
            </div>

            {/* Drag Area Box with Real File Upload Support */}
            <div 
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files?.[0];
                if (file) handleImageSelected(file);
              }}
              className="border-2 border-dashed border-zinc-805 hover:border-purple-500/50 rounded-2xl p-6 bg-[#0a0a14] space-y-4 text-center transition-all relative cursor-pointer group"
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                accept="image/*" 
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageSelected(file);
                }} 
                className="hidden" 
              />
              
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-3 animate-pulse group-hover:scale-105 group-hover:bg-purple-500/20 transition-all">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h4 className="text-xs font-extrabold text-zinc-200">Drop your product photo here</h4>
                <p className="text-[10px] text-zinc-500 mt-1">Or tap anywhere to select from your device</p>
                <div className="mt-3 bg-purple-500/15 border border-purple-500/30 px-2.5 py-1 rounded-lg inline-block">
                  <span className="text-[9px] font-black text-purple-300 uppercase font-mono tracking-wider">🤖 SELO AI ANALYST READY</span>
                </div>
              </div>

              {/* Action Source Pickers - Now map to real devices or file dialogs */}
              <div className="grid grid-cols-3 gap-2" onClick={(e) => e.stopPropagation()}>
                <button 
                  onClick={() => {
                    fileInputRef.current?.setAttribute("capture", "environment");
                    fileInputRef.current?.click();
                  }}
                  className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-850 flex flex-col items-center gap-1 hover:bg-zinc-850 cursor-pointer active:scale-97 transition-all"
                >
                  <Camera className="w-4 h-4 text-purple-400" />
                  <span className="text-[10px] font-bold">Camera</span>
                </button>

                <button 
                  onClick={() => {
                    fileInputRef.current?.removeAttribute("capture");
                    fileInputRef.current?.click();
                  }}
                  className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-850 flex flex-col items-center gap-1 hover:bg-zinc-850 cursor-pointer active:scale-97 transition-all"
                >
                  <ImageIcon className="w-4 h-4 text-emerald-400" />
                  <span className="text-[10px] font-bold">Gallery</span>
                </button>

                <button 
                  onClick={() => {
                    handleSelectPreset(STOCK_PRESETS[2]); // Tilapia Bream
                    onSpawnToast({ message: "WhatsApp Link Scraped", subText: "Downloading fresh fish image pack shared by supplier." });
                  }}
                  className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-850 flex flex-col items-center gap-1 hover:bg-zinc-850 cursor-pointer active:scale-97 transition-all"
                >
                  <MessageSquare className="w-4 h-4 text-emerald-500" />
                  <span className="text-[10px] font-bold">WhatsApp</span>
                </button>
              </div>
            </div>

            {/* Quick Demo Assist */}
            <div className="bg-[#0b0c16] border border-purple-900/30 p-3 rounded-xl space-y-2">
              <span className="text-[9px] font-bold text-purple-400 font-mono tracking-widest uppercase block">Select Demo Item to Process:</span>
              <div className="grid grid-cols-5 gap-1.5">
                {STOCK_PRESETS.map((p) => {
                  const active = selectedPreset.title === p.title;
                  return (
                    <button
                      key={p.title}
                      onClick={() => handleSelectPreset(p)}
                      title={p.title}
                      className={`h-11 rounded-lg text-lg flex items-center justify-center border transition-all cursor-pointer ${
                        active 
                          ? "bg-purple-500/20 border-purple-500 shadow-md shadow-purple-500/10 scale-105" 
                          : "bg-zinc-900 border-zinc-800 hover:bg-zinc-850"
                      }`}
                    >
                      {p.emoji}
                    </button>
                  );
                })}
              </div>
              <div className="text-[10px] text-zinc-300 font-mono leading-snug">
                Uploading: <strong className="text-zinc-100">{selectedPreset.emoji} {selectedPreset.title}</strong>
              </div>
            </div>

            {/* AGENT ONLY PARTNER SELECTOR */}
            {userRole === "AGENT" && (
              <div className="bg-[#0a0a14] border border-zinc-900 p-3.5 rounded-xl space-y-2">
                <span className="text-[9px] uppercase font-mono tracking-widest text-[#ffa500] font-bold block">🎩 Agent Publishing Mode</span>
                
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-400 font-bold font-mono block">CLIENT / PORTFOLIO SELLER</label>
                  <select
                    value={selectedAgentSellerId}
                    onChange={(e) => setSelectedAgentSellerId(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 px-2 py-1.5 text-xs text-white rounded-lg focus:outline-none focus:border-amber-500"
                  >
                    {portfolioSellers.map((s) => (
                      <option key={s.seller_id} value={s.seller_id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-400 font-bold font-mono block">DELIVERY DISPATCH TERRITORY</label>
                  <select
                    value={customZone}
                    onChange={(e) => setCustomZone(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 px-2 py-1.5 text-xs text-white rounded-lg focus:outline-none focus:border-amber-500"
                  >
                    {["Lusaka Central", "Munali Ward", "Kabulonga Wastes", "Chisamba Hub", "Manda Hill Central", "Avondale"].map(z => (
                      <option key={z} value={z}>{z}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Selo AI Promises Expectations Block */}
            <div className="bg-zinc-950/80 p-3 rounded-2xl border border-zinc-900 space-y-2.5">
              <h5 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">WHAT SELO AI WILL DO</h5>
              
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-zinc-900/40">
                  <span className="text-zinc-300">✦ Enhance and animate your media</span>
                  <span className="bg-purple-900/30 text-purple-300 text-[8.5px] px-2 py-0.5 rounded-md font-mono">Auto</span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-zinc-900/40">
                  <span className="text-zinc-300">✦ Apply templates, effects & sound</span>
                  <span className="bg-purple-900/30 text-purple-300 text-[8.5px] px-2 py-0.5 rounded-md font-mono">Auto</span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-zinc-900/40">
                  <span className="text-zinc-300">✦ Generate title, description, price</span>
                  <span className="bg-purple-900/30 text-purple-300 text-[8.5px] px-2 py-0.5 rounded-md font-mono">Auto</span>
                </div>

                <div className="flex justify-between items-center pt-1">
                  <span className="text-zinc-300">✦ You review and edit before posting</span>
                  <span className="bg-teal-900/30 text-teal-300 text-[8.5px] px-2 py-0.5 rounded-md font-bold font-mono">You control</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1 cursor-pointer transition-all active:scale-98 shadow-md shadow-purple-500/10"
            >
              <span>Upload & start</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ------------------------------------- */}
        {/* SCREEN 2: PROCESSING PIPELINE */}
        {/* ------------------------------------- */}
        {step === 2 && (
          <div className="space-y-4 animate-fadeIn">
            <div className="text-center p-3">
              <div className="relative inline-block">
                <div className="w-16 h-16 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mx-auto mb-2 animate-pulse">
                  <Sparkles className="w-8 h-8 animate-spin" style={{ animationDuration: "5s" }} />
                </div>
              </div>
              <h3 className="text-sm font-black text-white">Enhancing your media</h3>
              <p className="text-[11px] text-zinc-400 mt-1">Selo AI is building your advert automatically</p>
            </div>

            {/* Checklist with sequential done/running status */}
            <div className="space-y-2 bg-[#0a0a14] border border-zinc-900 p-3 rounded-2xl">
              {pipelineSteps.map((s, idx) => {
                const isDone = activePipelineIdx > idx;
                const isRunning = activePipelineIdx === idx;
                
                return (
                  <div 
                    key={s.label}
                    className={`flex items-start justify-between p-2.5 rounded-xl transition-all border ${
                      isDone 
                        ? "bg-emerald-500/5 border-emerald-500/20" 
                        : isRunning 
                          ? "bg-purple-500/5 border-purple-500/30 animate-pulse" 
                          : "bg-transparent border-transparent opacity-40"
                    }`}
                  >
                    <div className="flex gap-2.5 items-start">
                      <div className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center text-[10px] ${
                        isDone 
                          ? "bg-emerald-500 text-black font-bold" 
                          : isRunning 
                            ? "bg-purple-500 text-white font-mono shrink-0" 
                            : "bg-zinc-800 text-zinc-500"
                      }`}>
                        {isDone ? "✓" : isRunning ? "⏳" : ""}
                      </div>
                      <div>
                        <h5 className={`text-xs font-bold leading-none ${isDone ? "text-emerald-400" : isRunning ? "text-purple-300" : "text-zinc-500"}`}>
                          {s.label}
                        </h5>
                        <p className="text-[9px] text-zinc-500 mt-0.5 leading-snug">{s.desc}</p>
                      </div>
                    </div>

                    <span className={`text-[8.5px] font-mono font-bold uppercase rounded-md px-1.5 py-0.5 ${
                      isDone 
                        ? "bg-emerald-500/10 text-emerald-400" 
                        : isRunning 
                          ? "bg-purple-500/10 text-purple-400" 
                          : "bg-zinc-900 text-zinc-650"
                    }`}>
                      {isDone ? "Done" : isRunning ? "Running" : "Queued"}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Info Caution Alert + Live AI Status Monitors */}
            <div className="bg-[#0b0c16] border border-zinc-850 p-3 rounded-2xl space-y-2.5">
              <div className="flex gap-2 items-start opacity-75">
                <Info className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" style={{ color: "#ffa500" }} />
                <p className="text-[10px] text-zinc-400 leading-normal">
                  Our advanced AI pipeline is executing. You can refine all details and toggle background settings right before posting.
                </p>
              </div>
              <div className="h-[1px] bg-zinc-900 my-1.5" />
              <div className="space-y-1 text-[10px]">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500 font-mono text-[9px] uppercase tracking-wider font-bold">🤖 Gemini Product Intelligence:</span>
                  <span className={`font-mono text-[9.5px] font-bold px-1.5 py-0.5 rounded ${isAnalyzing ? "text-[#ffa500] bg-amber-400/5 animate-pulse" : "text-emerald-400 bg-emerald-400/5"}`}>
                    {isAnalyzing ? "🧠 ANALYSING PRODUCT..." : "✓ FAIR PRICING & COPY DONE"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500 font-mono text-[9px] uppercase tracking-wider font-bold">✨ Cloudinary AI Background Stripper:</span>
                  <span className={`font-mono text-[9.5px] font-bold px-1.5 py-0.5 rounded ${isRemovingBg ? "text-purple-400 bg-purple-500/5 animate-pulse" : bgRemoved ? "text-emerald-400 bg-emerald-400/5" : "text-emerald-400 bg-emerald-400/5"}`}>
                    {isRemovingBg ? "✨ EXTRACTING PNG MASK..." : bgRemoved ? "✓ TRANSPARENT PNG SAVED" : "✓ PNG STORE COMPLETED"}
                  </span>
                </div>
              </div>
            </div>

            {/* Progress Area */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[10.5px] text-zinc-400 font-mono">
                <span>Optimising visual matrices</span>
                <span>{pipelineProgress}% complete</span>
              </div>
              <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 transition-all duration-150" 
                  style={{ width: `${pipelineProgress}%` }}
                />
              </div>
            </div>

            {/* Assist Option for manual step forward */}
            <button
              onClick={() => setStep(3)}
              className="w-full py-1 text-center text-[10px] text-zinc-500 hover:text-zinc-300 underline font-mono cursor-pointer"
            >
              Skip simulation & proceed ➔
            </button>
          </div>
        )}

        {/* ------------------------------------- */}
        {/* SCREEN 3: TEMPLATE PICKER */}
        {/* ------------------------------------- */}
        {step === 3 && (
          <div className="space-y-4 animate-fadeIn">
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider">Choose template</h3>
              <p className="text-xs text-zinc-400 mt-1">
                Selo AI selected <strong className="text-purple-400 font-heavy">{template}</strong> for your product. Tap any template to preview it.
              </p>
            </div>

            {/* Templates Selector Grid */}
            <div className="grid grid-cols-2 gap-3 pb-2">
              {[
                { name: "Market fresh", desc: "Bright · clean · produce", badge: "AI Pick", emoji: "🥦", theme: "emerald" },
                { name: "Bold sale", desc: "High contrast · urgent", badge: "Hot", emoji: "🔥", theme: "red" },
                { name: "Golden glow", desc: "Warm · premium feel", badge: "Elegant", emoji: "✨", theme: "amber" },
                { name: "Tech clean", desc: "Minimal · electronics", badge: "Sleek", emoji: "📱", theme: "cyan" },
                { name: "Neon pop", desc: "Bold · fashion · youth", badge: "Hype", emoji: "⚡", theme: "fuchsia" },
                { name: "Home & living", desc: "Soft · earthy · calm", badge: "Cozy", emoji: "🏡", theme: "orange" }
              ].map((tmpl) => {
                const isSelected = template === tmpl.name;
                const isAiPick = selectedPreset.template === tmpl.name;
                
                return (
                  <button
                    key={tmpl.name}
                    onClick={() => {
                      setTemplate(tmpl.name);
                      onSpawnToast({ message: "Template Swapped", subText: `Previewing "${tmpl.name}" moodboard.` });
                    }}
                    className={`p-3.5 rounded-2xl flex flex-col justify-between text-left relative transition-all border cursor-pointer h-32 hover:scale-102 ${
                      isSelected 
                        ? "bg-[#090b1c] border-purple-500 shadow-lg shadow-purple-500/5 scale-103" 
                        : "bg-zinc-950/40 border-zinc-900 hover:border-zinc-800"
                    }`}
                  >
                    {/* Upper badges info */}
                    <div className="flex justify-between items-start w-full">
                      <span className="text-xl bg-zinc-900/80 p-1.5 rounded-lg">{tmpl.emoji}</span>
                      
                      {isAiPick && (
                        <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[8.5px] px-1.5 py-0.5 rounded-md font-bold font-mono">
                          ★ AI pick
                        </span>
                      )}
                    </div>

                    {/* Bottom Labels */}
                    <div className="mt-auto">
                      <h4 className={`text-xs font-black ${isSelected ? "text-purple-300" : "text-white"}`}>
                        {tmpl.name}
                      </h4>
                      <p className="text-[9.5px] text-zinc-550 mt-0.5">{tmpl.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => setStep(2)}
                className="flex-1 py-3 border border-zinc-800 hover:bg-zinc-900 text-zinc-400 font-bold rounded-xl text-xs cursor-pointer text-center"
              >
                Back
              </button>
              <button 
                onClick={() => setStep(4)}
                className="flex-1 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs cursor-pointer text-center flex items-center justify-center gap-1 shadow-md shadow-purple-500/10"
              >
                <span>Use template</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ------------------------------------- */}
        {/* SCREEN 4: CHOOSE BACKGROUND */}
        {/* ------------------------------------- */}
        {step === 4 && (
          <div className="space-y-4 animate-fadeIn">
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider">Choose background</h3>
              <p className="text-xs text-zinc-400 mt-1">
                Selo AI removed the original background. Choose a replacement from our preset library or keep it transparent.
              </p>
            </div>

            {/* Background Active Preview Wrapper with Live Blur state */}
            <div className="relative rounded-2xl overflow-hidden aspect-video border border-zinc-805 flex items-center justify-center bg-zinc-950">
              
              {/* Blur Background Layer */}
              {renderBackgroundLayer()}

              {/* Enhanced badge */}
              <div className="absolute top-2.5 right-2.5 bg-purple-500/20 backdrop-blur-md border border-purple-500/30 text-purple-300 text-[8px] font-bold tracking-widest font-mono uppercase px-2 py-0.5 rounded-full z-10">
                ✦ Selo enhanced
              </div>

              {/* Center product avatar */}
              <div className="relative z-10 flex flex-col items-center">
                {renderProductVisual("w-24 h-24 text-6xl")}
                <span className="text-[10px] bg-black/60 px-2.5 py-0.5 rounded-full font-bold uppercase font-mono text-white tracking-widest mt-2">
                  {category}
                </span>
              </div>
            </div>

            {/* Background Libraries list */}
            <div>
              <span className="text-[9.5px] font-bold text-zinc-550 uppercase tracking-widest font-mono block mb-2">
                BACKGROUND OPTIONS
              </span>

              {/* Horizontal Scroll bar selection */}
              <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none no-scrollbar">
                {[
                  { name: "None", icon: "▤", desc: "Transparent grid" },
                  { name: "Market Scene", icon: "🌿", desc: "Organic storefront" },
                  { name: "Sunny Outdoor", icon: "☀️", desc: "Golden open fields" },
                  { name: "Sunset Glow", icon: "🌅", desc: "Savanna atmospheric sunset" },
                  { name: "Luxury Store", icon: "⭐", desc: "Premium boutique shelving" },
                  { name: "Tech Studio", icon: "💻", desc: "Glowing violet workspace" }
                ].map((bg) => {
                  const isSelected = background === bg.name;
                  return (
                    <button
                      key={bg.name}
                      onClick={() => {
                        setBackground(bg.name);
                        if (CURATED_SCENES[bg.name]) {
                          setAiBackgroundImage(CURATED_SCENES[bg.name]);
                        } else {
                          setAiBackgroundImage(null);
                        }
                        onSpawnToast({ message: "Background Changed", subText: `Applied "${bg.name}" env filter.` });
                      }}
                      className={`px-3 py-2.5 rounded-xl border flex flex-col items-center justify-center text-center shrink-0 min-w-[76px] transition-all cursor-pointer ${
                        isSelected 
                          ? "bg-purple-500/10 border-purple-505 text-purple-300 font-bold" 
                          : "bg-zinc-950/40 border-zinc-900 text-zinc-400 hover:border-zinc-800"
                      }`}
                    >
                      <span className="text-sm block mb-1">{bg.icon}</span>
                      <span className="text-[10px] leading-none block">{bg.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Interactive AI Scene Builder */}
            {background !== "None" && (
              <div className="bg-[#0c0c16] border border-purple-500/20 rounded-xl p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
                    <span className="text-[11px] font-black tracking-wider text-purple-300 font-mono uppercase">AI REAL-TIME GENERATOR ENGINE</span>
                  </div>
                  <span className="text-[8px] bg-purple-500/10 text-purple-400 font-mono px-2 py-0.5 rounded-full border border-purple-500/20">
                    4K FILE PREPARED
                  </span>
                </div>

                <p className="text-[10px] text-zinc-400 leading-normal">
                  Create a professional marketplace advertisement background. Context: <span className="text-purple-300 underline font-semibold">Zambia, African retail environment</span>. Photorealistic, 4K quality, optimized for product placement, center area left empty.
                </p>

                {/* Engine choice selectors */}
                <div className="grid grid-cols-3 gap-2">
                  {["Gemini Image", "Imagen 4", "OpenAI Images"].map((eng) => {
                    const isSelected = aiEngine === eng;
                    return (
                      <button
                        key={eng}
                        type="button"
                        onClick={() => setAiEngine(eng)}
                        className={`py-1.5 px-2 rounded-lg border text-[9px] font-mono font-bold transition-all ${
                          isSelected 
                            ? "bg-purple-500/20 border-purple-500 text-white" 
                            : "bg-zinc-950/60 border-zinc-900 text-zinc-405 hover:border-zinc-800"
                        }`}
                      >
                        {eng}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={handleGenerateBg}
                  disabled={isGeneratingBg}
                  className={`w-full py-2.5 px-3 rounded-xl font-bold text-[10px] uppercase font-mono tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    isGeneratingBg 
                      ? "bg-purple-600/30 text-purple-400 border border-purple-500/30 cursor-not-allowed" 
                      : "bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 shadow-md shadow-purple-950/20"
                  }`}
                >
                  {isGeneratingBg ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-purple-300" />
                      <span>Generating 4K Retail Backdrop...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-purple-200" />
                      <span>Generate scene with {aiEngine}</span>
                    </>
                  )}
                </button>

                {generationLog && (
                  <div className="text-[8px] bg-zinc-950/80 border border-zinc-900 p-2 rounded-lg font-mono text-zinc-400 leading-normal max-h-16 overflow-y-auto">
                    <span className="text-purple-300 font-bold">Pipeline Status:</span> {generationLog}
                  </div>
                )}
              </div>
            )}

            {/* Background blur slider */}
            <div className="bg-[#0a0a14] border border-zinc-900 p-3 rounded-xl space-y-2">
              <div className="flex justify-between items-center text-[10.5px]">
                <span className="text-zinc-400 font-bold font-mono">BACKGROUND BLUR (DEPTH)</span>
                <span className="font-mono text-purple-400 font-extrabold">{backgroundBlur} px</span>
              </div>
              <input 
                type="range"
                min="0"
                max="50"
                value={backgroundBlur}
                onChange={(e) => setBackgroundBlur(Number(e.target.value))}
                className="w-full accent-purple-500 focus:outline-none cursor-ew-resize py-1"
              />
              <div className="flex justify-between text-[8px] text-zinc-600 font-mono">
                <span>SHARP FOCUS</span>
                <span>CINEMATIC SOFT BLUR</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => setStep(3)}
                className="flex-1 py-3 border border-zinc-800 hover:bg-zinc-900 text-zinc-400 font-bold rounded-xl text-xs cursor-pointer text-center"
              >
                Back
              </button>
              <button 
                onClick={() => setStep(5)}
                className="flex-1 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs cursor-pointer text-center flex items-center justify-center gap-1 shadow-md shadow-purple-500/10"
              >
                <span>Confirm background</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ------------------------------------- */}
        {/* SCREEN 5: ANIMATIONS & EFFECTS */}
        {/* ------------------------------------- */}
        {step === 5 && (
          <div className="space-y-4 animate-fadeIn">
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider">Animations & effects</h3>
              <p className="text-xs text-zinc-400 mt-1">
                Selo AI automatically configured optimal animation and badges. Combine layers or click play to preview.
              </p>
            </div>

            {/* Preview Active Screen executing selected animations */}
            <div className="relative rounded-2xl overflow-hidden aspect-video border border-zinc-850 flex items-center justify-center bg-zinc-950 p-4">
              
              {runwayVideoUrl ? (
                <>
                  <video
                    src={runwayVideoUrl}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover z-20"
                  />
                  <div className="absolute top-2 left-2 bg-purple-600 border border-purple-500/30 text-white text-[8px] font-bold font-mono uppercase px-2.5 py-0.5 rounded-full z-30 animate-pulse flex items-center gap-1 shadow-md">
                    <span>✦ Runway Gen-4.5</span>
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[7px] font-mono px-2 py-0.5 rounded-md z-30 pointer-events-none">
                    Muted Loop
                  </div>
                </>
              ) : (
                <>
                  {/* background */}
                  {renderBackgroundLayer()}

                  {/* Effects overlay renderer */}
                  <div className="absolute inset-0 pointer-events-none z-10">
                    {visualEffect === "Sparkle" && (
                      <div className="absolute inset-0 flex items-center justify-center animate-pulse">
                        <span className="absolute top-2 left-4 text-xs animate-ping">✨</span>
                        <span className="absolute bottom-4 right-6 text-xs animate-bounce" style={{ animationDelay: "1s" }}>✨</span>
                        <span className="absolute top-8 right-12 text-sm animate-ping" style={{ animationDelay: "0.5s" }}>✨</span>
                      </div>
                    )}
                    {visualEffect === "Stars" && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="absolute top-2 left-6 text-xs animate-spin" style={{ animationDuration: "3s" }}>⭐</span>
                        <span className="absolute bottom-3 right-8 text-xs animate-spin" style={{ animationDuration: "5s" }}>⭐</span>
                        <span className="absolute top-6 right-3 text-sm animate-spin" style={{ animationDuration: "4s" }}>⭐</span>
                      </div>
                    )}
                    {visualEffect === "Confetti" && (
                      <div className="absolute inset-0 overflow-hidden flex justify-around">
                        <div className="w-1 h-3 bg-rose-500 rounded animate-[bounce_1.5s_infinite]" />
                        <div className="w-1.5 h-2.5 bg-yellow-400 rounded animate-[bounce_2s_infinite]" style={{ animationDelay: "0.5s" }} />
                        <div className="w-1 h-4 bg-cyan-400 rounded animate-[bounce_1.8s_infinite]" style={{ animationDelay: "0.2s" }} />
                        <div className="w-1 h-2.5 bg-purple-500 rounded animate-[bounce_2.2s_infinite]" style={{ animationDelay: "0.9s" }} />
                      </div>
                    )}
                    {visualEffect === "Hot deal" && (
                      <div className="absolute top-2 left-2 bg-red-600/95 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-md shadow-red-500/20 z-20 animate-bounce">
                        🔥 HOT DEAL LIMIT
                      </div>
                    )}
                  </div>

                  {/* Product Animating Frame with dynamic entry class key trigger */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`${entryAnimation}-${animTriggerKey}`}
                      initial={
                        entryAnimation === "Zoom in" ? { scale: 0, rotate: -15, opacity: 0 } :
                        entryAnimation === "Rise up" ? { y: 60, opacity: 0 } :
                        entryAnimation === "Spin drop" ? { y: -80, rotate: 180, opacity: 0 } :
                        entryAnimation === "Slide in" ? { x: -100, opacity: 0 } :
                        { opacity: 0 } // default Fade
                      }
                      animate={
                        entryAnimation === "Zoom in" ? { scale: 1, rotate: 0, opacity: 1 } :
                        entryAnimation === "Rise up" ? { y: 0, opacity: 1 } :
                        entryAnimation === "Spin drop" ? { y: 0, rotate: 0, opacity: 1 } :
                        entryAnimation === "Slide in" ? { x: 0, opacity: 1 } :
                        { opacity: 1 } // default Fade
                      }
                      transition={{ 
                        type: "spring", 
                        stiffness: 110, 
                        damping: 12 
                      }}
                      className="z-10 flex flex-col items-center relative text-center"
                    >
                      {renderProductVisual("w-24 h-24 text-6xl")}
                      
                      {/* Text overlay renderers */}
                      {textOverlay === "Price pop" && (
                        <div className="absolute -top-3.5 -right-3 bg-yellow-500 border-2 border-white text-black px-2 py-0.5 text-[9px] font-black rounded-lg uppercase tracking-wider font-mono shadow-md animate-pulse">
                          K {price}
                        </div>
                      )}

                      {textOverlay === "Scroll banner" && (
                        <div className="absolute bottom-1 bg-black/8 w-24 overflow-hidden rounded py-0.5">
                          <div className="text-[6px] text-white whitespace-nowrap animate-marquee block">
                            AMAZING DEAL • BUY TODAY • {title} • 
                          </div>
                        </div>
                      )}

                      {textOverlay === "Title fade" && (
                        <p className="mt-2 text-[9px] text-white bg-black/40 backdrop-blur-md px-2 py-0.5 rounded font-bold">
                          {title}
                        </p>
                      )}
                    </motion.div>
                  </AnimatePresence>

                  {/* Bottom control preview bar */}
                  <div className="absolute bottom-2.5 inset-x-0 flex justify-center items-center gap-1.5 z-20">
                    <button 
                      onClick={handleReplayAnimation}
                      className="px-3 py-1 rounded-full bg-black/75 hover:bg-black/90 text-white text-[9.5px] font-bold font-mono uppercase flex items-center gap-1 cursor-pointer"
                    >
                      <Play className="w-3 h-3 fill-white" />
                      <span>Replay Animation</span>
                    </button>
                  </div>

                  <div className="absolute top-2 right-2 rounded bg-black/60 text-white text-[8px] font-bold uppercase font-mono px-1.5 py-0.2 animate-pulse">
                    Animating
                  </div>
                </>
              )}
            </div>

            {/* Interactive AI Runway Gen-4 Video Advert Generator */}
            <div className="bg-[#0c0c16] border border-purple-500/20 rounded-2xl p-4.5 space-y-3.5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-xl pointer-events-none" />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Video className="w-4 h-4 text-purple-400 animate-pulse" />
                  <span className="text-[11px] font-black tracking-wider text-purple-300 font-mono uppercase">
                    RUNWAY GEN-4 VIDEO SYNTHESIS
                  </span>
                </div>
                {runwayVideoUrl ? (
                  <span className="text-[8px] bg-emerald-500/20 text-emerald-400 font-mono px-2 py-0.5 rounded-full border border-emerald-500/30 font-bold">
                    REEL ACTIVE (15S)
                  </span>
                ) : (
                  <span className="text-[8px] bg-purple-500/10 text-purple-400 font-mono px-2 py-0.5 rounded-full border border-purple-500/20 font-bold">
                    TIKTOK READY
                  </span>
                )}
              </div>

              <p className="text-[10px] text-zinc-400 leading-normal">
                Synthesize a professional moving advertisement loop using the <span className="text-purple-300 font-semibold underline">Runway Gen-4 API</span>. Isolates shapes and sweeps the camera with dynamic shadows and soft highlights.
              </p>

              {/* Param Inputs */}
              <div className="grid grid-cols-2 gap-3 bg-zinc-950/60 p-2.5 rounded-xl border border-zinc-900">
                <div>
                  <span className="text-[8px] font-bold text-zinc-500 font-mono block mb-1">CAMERA MOTION</span>
                  <div className="text-[10px] text-purple-300 font-mono font-bold flex items-center gap-1">
                    <span className="text-zinc-400">🎥</span> Slow cinematic zoom
                  </div>
                </div>
                <div>
                  <span className="text-[8px] font-bold text-zinc-500 font-mono block mb-1">TARGET FEED</span>
                  <div className="text-[10px] text-purple-300 font-mono font-bold flex items-center gap-1">
                    <span className="text-zinc-400">📱</span> TikTok (9:16 vertical)
                  </div>
                </div>
              </div>

              {/* Selection for Duration and Engine Model */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[8.5px] font-bold text-zinc-500 font-mono block mb-1">DURATION</label>
                  <select
                    value={videoDuration}
                    onChange={(e) => setVideoDuration(Number(e.target.value))}
                    className="w-full bg-zinc-950 border border-zinc-900 rounded-lg p-1.5 text-[10px] font-mono text-zinc-350 font-bold focus:border-purple-500 outline-none"
                  >
                    <option value={5}>5 seconds (Fast)</option>
                    <option value={10}>10 seconds (Standard)</option>
                    <option value={15}>15 seconds (Premium Advert)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[8.5px] font-bold text-zinc-500 font-mono block mb-1">AI MODEL</label>
                  <select
                    value={videoEngine}
                    onChange={(e) => setVideoEngine(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-900 rounded-lg p-1.5 text-[10px] font-mono text-zinc-350 font-bold focus:border-purple-500 outline-none"
                  >
                    <option value="Gen-4.5">Gen-4.5 (Photorealistic)</option>
                    <option value="Gen-3 Alpha">Gen-3 Alpha Turbo</option>
                  </select>
                </div>
              </div>

              {/* Custom Prompt Text Area */}
              <div className="space-y-1">
                <span className="text-[8.5px] font-bold text-zinc-500 font-mono block">RUNWAY GENERATION PROMPT</span>
                <textarea
                  value={videoPrompt}
                  onChange={(e) => setVideoPrompt(e.target.value)}
                  placeholder="Describe commercial actions, lighting sweeps or material sweeps"
                  rows={3}
                  className="w-full bg-zinc-950 border border-zinc-900 rounded-xl p-2 text-[10px] text-zinc-300 leading-normal focus:border-purple-500/80 focus:ring-1 focus:ring-purple-500/30 outline-none font-mono"
                />
              </div>

              {/* Generate Trigger Button */}
              <button
                type="button"
                onClick={handleGenerateVideo}
                disabled={isGeneratingVideo}
                className={`w-full py-2.5 px-3 rounded-xl font-bold text-[10px] uppercase font-mono tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  isGeneratingVideo 
                    ? "bg-purple-600/30 text-purple-400 border border-purple-500/30 cursor-not-allowed" 
                    : "bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 shadow-md shadow-purple-950/20"
                }`}
              >
                {isGeneratingVideo ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-purple-300" />
                    <span>Executing Runway Gen-4 image-to-video...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-purple-205" />
                    <span>{runwayVideoUrl ? "Regenerate Runway Video" : "Generate Moving Advert Video"}</span>
                  </>
                )}
              </button>

              {/* Discard generated model */}
              {runwayVideoUrl && (
                <button
                  type="button"
                  onClick={() => {
                    setRunwayVideoUrl(null);
                    onSpawnToast({ message: "Runway video discarded", subText: "Reverted to reactive canvas presentation." });
                  }}
                  className="w-full py-1.5 px-3 border border-zinc-900 hover:bg-zinc-900 rounded-lg text-[9px] text-zinc-400 font-mono font-bold uppercase cursor-pointer"
                >
                  Discard Video & Reset to Canvas Preview
                </button>
              )}

              {videoLog && (
                <div className="text-[8px] bg-black/80 border border-zinc-900 p-2 rounded-lg font-mono text-zinc-400 leading-normal max-h-16 overflow-y-auto">
                  <span className="text-purple-300 font-bold">Orchestrator Status:</span> {videoLog}
                </div>
              )}
            </div>

            {/* THREE INDEPENDENT LISTS SELECTORS (Horizontal scrolling) */}
            <div className="space-y-3 pt-1">
              
              {/* Row 1: PRODUCT ENTRY */}
              <div>
                <span className="text-[9.5px] font-bold text-zinc-550 block font-mono uppercase mb-1.5">
                  1. PRODUCT ENTRY ANIMATION
                </span>
                <div className="flex gap-2.5 overflow-x-auto pb-1.5 scrollbar-none no-scrollbar">
                  {["Zoom in", "Rise up", "Spin drop", "Slide in", "Fade"].map((anim) => (
                    <button
                      key={anim}
                      onClick={() => {
                        setEntryAnimation(anim);
                        handleReplayAnimation();
                      }}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold shrink-0 cursor-pointer border ${
                        entryAnimation === anim
                          ? "bg-purple-500/10 border-purple-500 text-purple-300"
                          : "bg-zinc-950/40 border-zinc-900 text-zinc-400 hover:border-zinc-805"
                      }`}
                    >
                      {anim}
                    </button>
                  ))}
                </div>
              </div>

              {/* Row 2: EFFECTS OVERLAY */}
              <div>
                <span className="text-[9.5px] font-bold text-zinc-550 block font-mono uppercase mb-1.5">
                  2. VISUAL EFFECTS OVERLAY
                </span>
                <div className="flex gap-2.5 overflow-x-auto pb-1.5 scrollbar-none no-scrollbar">
                  {["Sparkle", "Stars", "Confetti", "Hot deal", "None"].map((eff) => (
                    <button
                      key={eff}
                      onClick={() => {
                        setVisualEffect(eff);
                        onSpawnToast({ message: "VFX Applied", subText: `Selected "${eff}" live rendering layer.` });
                      }}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold shrink-0 cursor-pointer border ${
                        visualEffect === eff
                          ? "bg-purple-500/10 border-purple-500 text-purple-300"
                          : "bg-zinc-950/40 border-zinc-900 text-zinc-400 hover:border-zinc-805"
                      }`}
                    >
                      {eff}
                    </button>
                  ))}
                </div>
              </div>

              {/* Row 3: TEXT OVERLAY STYLES */}
              <div>
                <span className="text-[9.5px] font-bold text-zinc-550 block font-mono uppercase mb-1.5">
                  3. TEXT OVERLAY & PRICE TAG
                </span>
                <div className="flex gap-2.5 overflow-x-auto pb-1.5 scrollbar-none no-scrollbar">
                  {["Price pop", "Scroll banner", "Title fade", "None"].map((txt) => (
                    <button
                      key={txt}
                      onClick={() => {
                        setTextOverlay(txt);
                        onSpawnToast({ message: "Text Graphic Modified", subText: `Active style: "${txt}".` });
                      }}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold shrink-0 cursor-pointer border ${
                        textOverlay === txt
                          ? "bg-purple-500/10 border-purple-500 text-purple-300"
                          : "bg-zinc-950/40 border-zinc-900 text-zinc-400 hover:border-zinc-805"
                      }`}
                    >
                      {txt}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => setStep(4)}
                className="flex-1 py-3 border border-zinc-800 hover:bg-zinc-900 text-zinc-400 font-bold rounded-xl text-xs cursor-pointer text-center"
              >
                Back
              </button>
              <button 
                onClick={() => setStep(6)}
                className="flex-1 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs cursor-pointer text-center flex items-center justify-center gap-1 shadow-md shadow-purple-500/10"
              >
                <span>Confirm effects</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ------------------------------------- */}
        {/* ------------------------------------- */}
        {/* SCREEN 6: BACKGROUND SOUND */}
        {/* ------------------------------------- */}
        {step === 6 && (
          <div className="space-y-4 animate-fadeIn">
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                <span>Background sound</span>
                <span className="text-[9px] bg-purple-500/20 text-purple-300 font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider font-mono">
                  Suno API Active
                </span>
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Selo AI automatically paired <strong className="text-purple-300">{soundTrack}</strong> to match the product vibe. Preview tracks with the play button.
              </p>
            </div>

            {/* SUNO AI PARTNER ACCESS ENGINE - REAL AI MUSIC */}
            <div className="bg-[#0e0c1f]/90 border border-purple-500/40 p-4 rounded-2xl space-y-4 relative overflow-hidden bg-gradient-to-br from-[#0c0a21] via-[#050414] to-[#010103] shadow-lg shadow-purple-950/20">
              <div className="absolute top-0 right-0 bg-purple-500/25 text-purple-300 text-[8.5px] font-black uppercase px-2.5 py-1 rounded-bl-xl tracking-widest border-l border-b border-purple-500/30 font-mono">
                🎙️ Suno AI Partner Access
              </div>

              <div>
                <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                  ✨ Real AI Music Custom Synthesis
                </h4>
                <p className="text-[10px] text-zinc-400 mt-1">
                  Draft exciting instrumental melodies with no vocals, engineered specifically to drive mobile conversions.
                </p>
              </div>

              {/* Dynamic Control Panel */}
              <div className="grid grid-cols-2 gap-2 text-[10.5px]">
                <div>
                  <label className="text-[8.5px] uppercase font-mono tracking-wider text-zinc-500 block mb-1">
                    Vibe Mood / Genre
                  </label>
                  <select 
                    value={sunoMood}
                    onChange={(e) => {
                      setSunoMood(e.target.value);
                      const fullP = `Generate instrumental background music. Mood: ${e.target.value}. Industry: ${sunoIndustry}. Duration: ${sunoDuration} seconds. No vocals. Optimised for mobile video ads.`;
                      setSunoPrompt(fullP);
                    }}
                    className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg p-2 text-xs focus:outline-none focus:border-purple-500/50 cursor-pointer"
                  >
                    <option value="Exciting">Exciting (Vibrant & Energetic)</option>
                    <option value="Upbeat Afrobeat">Upbeat Afrobeat (Local Festive)</option>
                    <option value="High-Speed Club">High-Speed Club (Modern Gadget)</option>
                    <option value="Joyful Acoustic">Joyful Acoustic (Freshly Farmed)</option>
                    <option value="Atmospheric Tech">Atmospheric Tech (Electronics)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[8.5px] uppercase font-mono tracking-wider text-zinc-500 block mb-1">
                    Duration & Vocals
                  </label>
                  <div className="bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-lg p-2 text-xs font-medium flex justify-between items-center h-9">
                    <span>{sunoDuration}s · Instrumental</span>
                    <span className="text-[9px] text-[#ffa500] font-black font-mono">NO VOCALS</span>
                  </div>
                </div>
              </div>

              {/* Editable Script Prompt */}
              <div>
                <label className="text-[8.5px] uppercase font-mono tracking-wider text-zinc-500 block mb-1.5 flex justify-between items-center">
                  <span>Suno Prompt Matrix</span>
                  <span className="text-[9px] text-purple-400 font-bold font-mono">AD-ENGAGEMENT MATCHED</span>
                </label>
                <textarea 
                  rows={2}
                  value={sunoPrompt}
                  onChange={(e) => setSunoPrompt(e.target.value)}
                  placeholder="Enter custom style prompt for Suno AI..."
                  className="w-full bg-black/50 border border-zinc-900 focus:border-purple-500/50 text-white rounded-lg p-2 text-[10px] leading-relaxed focus:outline-none resize-none font-mono"
                />
              </div>

              {/* Generate button inside a pretty action tray */}
              <div className="flex gap-2.5 items-center justify-between bg-black/20 p-1.5 rounded-xl border border-zinc-900">
                <div className="text-[9.5px] text-zinc-500 font-mono pl-1">
                  {isGeneratingSunoMusic ? (
                    <span className="text-[#ffa500] animate-pulse">⏳ Rendering Sound...</span>
                  ) : sunoAudioUrl ? (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <span>✓ Track Generated</span>
                    </span>
                  ) : (
                    <span>Ready for gateway</span>
                  )}
                </div>

                <button
                  type="button"
                  disabled={isGeneratingSunoMusic}
                  onClick={generateSunoMusicTrack}
                  className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-[11px] font-black px-4 py-2 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer select-none active:scale-95 transition-all shadow-md shadow-purple-900/40 border-0"
                >
                  {isGeneratingSunoMusic ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Synthesizing...</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Synthesize Suno Track 🎵</span>
                    </>
                  )}
                </button>
              </div>

              {/* Live Waveform Audio Player visualization of Suno generated track */}
              {sunoAudioUrl && (
                <div className="bg-[#ffa500]/5 border border-[#ffa500]/25 p-3 rounded-xl flex items-center justify-between gap-3 animate-fadeIn text-left">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-[#ffa500]/15 flex items-center justify-center text-[#ffa500] shrink-0">
                      <Volume2 className="w-4 h-4 text-[#ffa500] animate-pulse" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[8px] uppercase tracking-wider font-mono font-black text-[#ffa500] block">
                        Active Suno AI Track
                      </span>
                      <h5 className="text-[11px] font-mono font-extrabold text-white truncate">
                        {sunoTrackTitle || "Custom Advert Instrumental"}
                      </h5>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {isAudioPlaying && soundTrack.startsWith("Suno AI:") && (
                      <div className="flex items-end gap-0.5 h-3.5 text-[#ffa500]">
                        <div className="w-0.5 bg-[#ffa500] animate-pulse" style={{ height: "70%" }} />
                        <div className="w-0.5 bg-[#ffa500] animate-pulse" style={{ height: "40%", animationDelay: "0.15s" }} />
                        <div className="w-0.5 bg-[#ffa500] animate-pulse" style={{ height: "90%", animationDelay: "0.3s" }} />
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setSoundTrack(`Suno AI: ${sunoTrackTitle}`);
                        setIsAudioPlaying(!isAudioPlaying);
                      }}
                      className="text-[10px] font-extrabold text-black bg-[#ffa500] hover:bg-amber-500 px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer active:scale-95 transition-all shadow border-0"
                    >
                      {isAudioPlaying && soundTrack.startsWith("Suno AI:") ? (
                        <>
                          <Pause className="w-3 h-3 fill-black text-black" />
                          <span>Pause</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3 h-3 fill-black text-black" />
                          <span>Listen</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Standard Playback and Library Choice Section */}
            <div className="bg-[#0c0c1a] border border-purple-900/40 p-4 rounded-2xl flex justify-between items-center bg-gradient-to-r from-[#0d0d21] to-[#040411]">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0 ${
                  isAudioPlaying ? "bg-purple-500/20 border border-purple-500 animate-spin" : "bg-zinc-900 border border-zinc-800"
                }`} style={{ animationDuration: "6s" }}>
                  <Volume2 className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-white">{soundTrack}</h4>
                  <p className="text-[10px] text-zinc-400 mt-0.5">
                    {soundTrack === "No sound" ? "No audio track selected" : "Synthesized Beat • AI Connected"}
                  </p>
                </div>
              </div>

              {/* Main play button */}
              <button 
                onClick={() => setIsAudioPlaying(!isAudioPlaying)}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer border-0 ${
                  isAudioPlaying 
                    ? "bg-red-500/10 border border-red-500/30 text-red-400" 
                    : "bg-purple-600 hover:bg-purple-500 text-white"
                }`}
              >
                {isAudioPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
              </button>
            </div>

            {/* Audio Lib Choices */}
            <div className="space-y-2 bg-zinc-950/60 p-1 rounded-2xl border border-zinc-900">

              <span className="text-[9.5px] uppercase font-mono tracking-wider text-zinc-550 p-2 block">
                SOUND LIBRARY
              </span>

              {[
                { name: "Market vibes", tag: "Upbeat · produce", matches: "produce" },
                { name: "Street buzz", tag: "Lively · general", matches: "handicrafts" },
                { name: "Chill groove", tag: "Relaxed · fashion", matches: "chitenge" },
                { name: "Tech pulse", tag: "Electronic · gadgets", matches: "electronics" },
                { name: "No sound", tag: "Silent advert", matches: "silent" }
              ].map((trk) => {
                const isSelected = soundTrack === trk.name;
                return (
                  <div 
                    key={trk.name}
                    className={`flex justify-between items-center p-3 rounded-xl transition-all border ${
                      isSelected 
                        ? "bg-[#090b1c] border-purple-500/40 text-white" 
                        : "bg-transparent border-transparent hover:border-zinc-850"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <MusicIcon classname="w-4 h-4 text-zinc-500 shrink-0" />
                      <div>
                        <h5 className="text-xs font-bold leading-none">{trk.name}</h5>
                        <p className="text-[9.5px] text-zinc-500 mt-0.5">{trk.tag}</p>
                      </div>
                    </div>

                    <div className="flex gap-1.5 items-center">
                      {/* Play preview specific button */}
                      <button
                        onClick={() => {
                          if (soundTrack !== trk.name) {
                            setSoundTrack(trk.name);
                            setIsAudioPlaying(true);
                          } else {
                            setIsAudioPlaying(!isAudioPlaying);
                          }
                        }}
                        className="p-1.5 rounded-full hover:bg-zinc-900 border border-zinc-800 text-zinc-400 cursor-pointer active:scale-95"
                      >
                        {isSelected && isAudioPlaying ? (
                          <Pause className="w-3.5 h-3.5" />
                        ) : (
                          <Play className="w-3.5 h-3.5 fill-zinc-400 text-zinc-400" />
                        )}
                      </button>

                      {/* Select state */}
                      <button
                        onClick={() => {
                          setSoundTrack(trk.name);
                          onSpawnToast({ message: "Audio Swap Set", subText: `Music set to "${trk.name}".` });
                        }}
                        className={`text-[9.5px] font-bold px-2 py-1 rounded transition-all cursor-pointer ${
                          isSelected 
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-black" 
                            : "bg-zinc-900 text-zinc-300 border border-zinc-800"
                        }`}
                      >
                        {isSelected ? "Selected" : "Select"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Live Volume controller */}
            <div className="bg-[#0a0a14] border border-zinc-900 p-3 rounded-xl space-y-2">
              <div className="flex justify-between items-center text-[10.5px]">
                <div className="flex items-center gap-1.5 text-zinc-400 font-bold font-mono">
                  {soundVolume === 0 ? <VolumeX className="w-4 h-4 text-zinc-500" /> : <Volume2 className="w-4 h-4 text-purple-400" />}
                  <span>VOLUME ATTENUATION</span>
                </div>
                <span className="font-mono text-purple-400 font-extrabold">{soundVolume}%</span>
              </div>
              <input 
                type="range"
                min="0"
                max="100"
                value={soundVolume}
                onChange={(e) => handleVolumeChange(Number(e.target.value))}
                className="w-full accent-purple-500 focus:outline-none cursor-ew-resize py-1"
              />
            </div>

            {/* AI Sales Voiceover Section */}
            <div className="bg-[#0e0c1f]/80 border border-purple-500/30 p-4 rounded-2xl space-y-3 relative overflow-hidden bg-gradient-to-br from-[#0c0a1a] to-[#040411]">
              <div className="absolute top-0 right-0 bg-purple-500/10 text-purple-400 text-[8px] font-black uppercase px-2 py-0.5 rounded-bl-lg tracking-widest border-l border-b border-purple-500/20">
                ⚡ ElevenLabs AI
              </div>

              <div>
                <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                  🎙️ AI Sales Narration Voiceover
                </h4>
                <p className="text-[10px] text-zinc-400 mt-1">
                  Draft an energetic, persuasive 20-second marketplace narration script using Gemini, then synthesize it with custom ElevenLabs premium voices.
                </p>
              </div>

              {/* Voice selector */}
              <div className="grid grid-cols-2 gap-2 text-[10.5px]">
                <div>
                  <label className="text-[9px] uppercase font-mono tracking-wider text-zinc-500 block mb-1">
                    Select Voice Profile
                  </label>
                  <select 
                    value={selectedVoiceId}
                    onChange={(e) => setSelectedVoiceId(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg p-2 text-xs focus:outline-none focus:border-purple-500/50 cursor-pointer"
                  >
                    <option value="JBFqnCBsd6RMkjVDRZzb">Rachel (Friendly & Clean)</option>
                    <option value="21m00Tcm4TlvDq8ikWAM">Rachel - Classic (Energetic)</option>
                    <option value="AZnzlk1XvdvUeBnXmlld">Domi (Spirited & Clear)</option>
                    <option value="EXAVITQu4vr4xnSDxMaL">Bella (Intimate sales)</option>
                    <option value="ErXwobaYiN019vkySvjV">Antoni (Trustworthy & Bold)</option>
                  </select>
                </div>

                <div className="flex flex-col justify-end">
                  <button
                    type="button"
                    disabled={isGeneratingVoiceover}
                    onClick={generateVoiceoverNarration}
                    className="w-full h-9 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 cursor-pointer select-none active:scale-95 transition-all shadow-md text-center"
                  >
                    {isGeneratingVoiceover ? (
                      <>
                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>Generate Audio</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Script and Playback Preview */}
              {narrationText && (
                <div className="bg-black/40 border border-[#ffa500]/20 p-3 rounded-xl space-y-2 animate-fadeIn text-left">
                  <div className="flex justify-between items-center bg-zinc-900/30 px-1.5 py-1 rounded">
                    <span className="text-[9px] font-mono uppercase tracking-wider text-[#ffa500]">
                      Generated Sales Script
                    </span>
                    {narrationAudioUrl && (
                      <button
                        type="button"
                        onClick={playVoiceoverPreview}
                        className="text-[9px] font-extrabold text-white bg-[#ffa500] hover:bg-amber-500 px-2.5 py-1 rounded flex items-center gap-1 cursor-pointer active:scale-95 transition-all shadow"
                      >
                        <Play className="w-2.5 h-2.5 fill-white" />
                        <span>Play Audio</span>
                      </button>
                    )}
                  </div>
                  
                  <p className="text-[10px] leading-relaxed text-zinc-300 italic p-1 border-l-2 border-[#ffa500]/60 bg-[#ffa500]/5 rounded-r">
                    "{narrationText}"
                  </p>

                  <div className="flex justify-between items-center text-[8.5px] text-zinc-500 font-mono">
                    <span>⏱️ Approx. 20s script</span>
                    <span>🇿🇲 Local tone optimized</span>
                  </div>
                </div>
              )}
            </div>

            {/* Auto Transcribed Subtitles & Captions Burner Customizer */}
            <div className="bg-[#0e0c1f]/80 border border-[#ffa500]/30 p-4 rounded-2xl space-y-3 relative overflow-hidden bg-gradient-to-br from-[#0c0a1a] to-[#040411]">
              <div className="absolute top-0 right-0 bg-[#ffa500]/10 text-[#ffa500] text-[8.5px] font-black uppercase px-2 py-0.5 rounded-bl-lg tracking-widest border-l border-b border-[#ffa500]/20 font-mono">
                ⚡ Deepgram Nova-3
              </div>

              <div>
                <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                  💬 Auto Subtitles & Burn Captions
                </h4>
                <p className="text-[10px] text-zinc-400 mt-1">
                  Most African buyers watch muted. Selo automatically decodes speech to text. Style and verify captions below:
                </p>
              </div>

              {isGeneratingSubtitles ? (
                <div className="flex flex-col items-center justify-center py-4 space-y-2 bg-black/40 border border-zinc-900 rounded-xl">
                  <div className="w-5 h-5 border-2 border-[#ffa500] border-t-transparent rounded-full animate-spin" />
                  <span className="text-[9px] font-mono text-[#ffa500] animate-pulse">TRANSCRIBING VOICE WITH DEEPGRAM NOVA-3...</span>
                </div>
              ) : subtitles.length > 0 ? (
                <div className="space-y-3">
                  {/* Styling customizers */}
                  <div className="grid grid-cols-2 gap-3 text-[10.5px]">
                    <div>
                      <label className="text-[9px] uppercase font-mono tracking-wider text-zinc-500 block mb-1">
                        Caption Styling
                      </label>
                      <div className="grid grid-cols-2 gap-1 bg-black/25 p-1 rounded-lg">
                        {["Selo Neon 🔥", "Solar Yellow ☀️", "Cap Capsule 💬", "Power Impact 💥"].map(stl => (
                          <button
                            key={stl}
                            type="button"
                            onClick={() => setSubtitleStyle(stl)}
                            className={`p-1 rounded text-[8.5px] font-bold border transition-all cursor-pointer ${
                              subtitleStyle === stl 
                                ? "bg-purple-600/20 text-purple-300 border-purple-500 font-extrabold" 
                                : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white"
                            }`}
                          >
                            {stl.split(" ")[0]}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-[9px] uppercase font-mono tracking-wider text-zinc-500 block mb-1">
                        Layout Position
                      </label>
                      <div className="grid grid-cols-3 gap-1 bg-black/25 p-1 rounded-lg">
                        {(["Top", "Center", "Bottom"] as const).map(pos => (
                          <button
                            key={pos}
                            type="button"
                            onClick={() => setSubtitlePosition(pos)}
                            className={`p-1 rounded text-[8.5px] font-bold border transition-all cursor-pointer ${
                              subtitlePosition === pos 
                                ? "bg-[#ffa500]/20 text-[#ffa500] border-[#ffa500] font-extrabold" 
                                : "bg-zinc-900 text-[#8a8a9a] border-zinc-805 hover:text-white"
                            }`}
                          >
                            {pos}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Subtitle Word Editor */}
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase font-mono tracking-widest text-[#ffa500] block">
                      📝 Live Caption Editor (Timed Segments)
                    </span>
                    <div className="max-h-[110px] overflow-y-auto space-y-1.5 p-1.5 bg-black/50 rounded-xl border border-zinc-850">
                      {subtitles.map((sub, idx) => (
                        <div key={idx} className="flex gap-1 items-center text-[10px]">
                          <span className="text-[8px] font-mono font-bold text-zinc-400 bg-zinc-900 px-1 py-0.5 rounded text-center shrink-0 w-11">
                            {sub.start.toFixed(1)}s
                          </span>
                          <input 
                            type="text"
                            value={sub.text}
                            onChange={(e) => {
                              const updatedSubtitles = [...subtitles];
                              updatedSubtitles[idx].text = e.target.value;
                              setSubtitles(updatedSubtitles);
                            }}
                            className="flex-1 bg-zinc-900 border border-zinc-800 text-white rounded px-2 py-0.5 text-[10px] focus:outline-none focus:border-purple-500/50"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-black/30 border border-dashed border-zinc-800 p-3 rounded-xl text-center text-zinc-500 text-[10px]">
                  Generate an AI voiceover script above first to automatically trigger Deepgram caption transcription.
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => setStep(5)}
                className="flex-1 py-3 border border-zinc-800 hover:bg-zinc-900 text-zinc-400 font-bold rounded-xl text-xs cursor-pointer text-center"
              >
                Back
              </button>
              <button 
                onClick={() => setStep(7)}
                className="flex-1 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs cursor-pointer text-center flex items-center justify-center gap-1 shadow-md shadow-purple-500/10"
              >
                <span>Confirm sound</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ------------------------------------- */}
        {/* SCREEN 7: FULL COMBINED PREVIEW */}
        {/* ------------------------------------- */}
        {step === 7 && (
          <div className="space-y-4 animate-fadeIn">
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider">Preview advert</h3>
              <p className="text-xs text-zinc-400 mt-1">
                This is how your fully formulated Selo advert will look inside buyer feeds.
              </p>
            </div>

            {/* Complete composite feed simulation */}
            <div className="bg-[#0b0b18] border border-zinc-850 p-3 rounded-3xl space-y-3">
              
              {/* Layout canvas block */}
              <div className="relative aspect-square rounded-2xl overflow-hidden flex items-center justify-center z-10">
                
                {/* Background rendering */}
                {renderBackgroundLayer()}

                {/* Sparkling overlays */}
                <div className="absolute inset-0 pointer-events-none z-10">
                  {visualEffect === "Sparkle" && (
                    <div className="absolute inset-0 flex items-center justify-center animate-pulse">
                      <span className="absolute top-4 left-6 text-sm animate-ping">✨</span>
                      <span className="absolute bottom-6 right-10 text-xs animate-bounce" style={{ animationDelay: "1.2s" }}>✨</span>
                      <span className="absolute top-10 right-4 text-xs animate-ping">✨</span>
                    </div>
                  )}
                  {visualEffect === "Stars" && (
                    <div className="absolute inset-0 flex justify-around p-3">
                      <span className="text-xs animate-spin" style={{ animationDuration: "5s" }}>⭐</span>
                      <span className="text-sm animate-bounce">⭐</span>
                    </div>
                  )}
                  {visualEffect === "Confetti" && (
                    <div className="absolute inset-0 flex justify-around">
                      <div className="w-1 h-3 bg-rose-500 rounded animate-[bounce_1s_infinite]" />
                      <div className="w-1 h-2 bg-yellow-400 rounded animate-[bounce_1.4s_infinite]" style={{ animationDelay: "0.2s" }} />
                      <div className="w-1 h-3 bg-cyan-400 rounded animate-[bounce_1.2s_infinite]" style={{ animationDelay: "0.4s" }} />
                    </div>
                  )}
                </div>

                {/* Real-time styled burning subtitles layer inside preview canvas */}
                {isPlayingVoiceover && subtitles.length > 0 && (
                  (() => {
                    const activeSub = subtitles.find(
                      s => voiceoverTime >= s.start && voiceoverTime <= s.end
                    );
                    if (!activeSub) return null;

                    let styleClasses = "";
                    if (subtitleStyle === "Selo Neon 🔥") {
                      styleClasses = "bg-purple-950/95 border border-purple-500 text-purple-300 font-extrabold text-[12px] px-3 py-1.5 rounded-xl shadow-lg shadow-purple-500/30 text-center uppercase tracking-wide animate-pulse";
                    } else if (subtitleStyle === "Solar Yellow ☀️") {
                      styleClasses = "bg-black/90 border-2 border-[#ffa500]/70 text-[#ffa500] font-black italic text-[12.5px] px-3.5 py-1.5 rounded-lg shadow-2xl text-center transform -rotate-1 skew-x-1 uppercase scale-105";
                    } else if (subtitleStyle === "Cap Capsule 💬") {
                      styleClasses = "bg-zinc-900/95 border border-zinc-805 text-white font-medium text-[11px] px-3 py-1 rounded-full shadow-md text-center";
                    } else { // Power Impact 💥
                      styleClasses = "text-white font-black text-[14.5px] px-3 py-1 text-center tracking-wider uppercase drop-shadow-[0_2px_2px_rgba(0,0,0,1)] scale-110";
                    }

                    const posClass = subtitlePosition === "Top" ? "top-4" : subtitlePosition === "Bottom" ? "bottom-16" : "bottom-1/3";

                    return (
                      <div className={`absolute ${posClass} left-3 right-3 z-45 flex items-center justify-center pointer-events-none px-2`}>
                        <div className={`${styleClasses} w-fit max-w-[90%] break-words`}>
                          {activeSub.text}
                        </div>
                      </div>
                    );
                  })()
                )}

                {/* Animated content element */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${entryAnimation}-${animTriggerKey}`}
                    initial={
                      entryAnimation === "Zoom in" ? { scale: 0, rotate: -30, opacity: 0 } :
                      entryAnimation === "Rise up" ? { y: 100, opacity: 0 } :
                      entryAnimation === "Spin drop" ? { y: -100, rotate: 360, opacity: 0 } :
                      entryAnimation === "Slide in" ? { x: -120, opacity: 0 } :
                      { opacity: 0 }
                    }
                    animate={
                      entryAnimation === "Zoom in" ? { scale: 1, rotate: 0, opacity: 1 } :
                      entryAnimation === "Rise up" ? { y: 0, opacity: 1 } :
                      entryAnimation === "Spin drop" ? { y: 0, rotate: 0, opacity: 1 } :
                      entryAnimation === "Slide in" ? { x: 0, opacity: 1 } :
                      { opacity: 1 }
                    }
                    transition={{ type: "spring", stiffness: 100, damping: 12 }}
                    className="flex flex-col items-center relative z-10"
                  >
                    {renderProductVisual("w-28 h-28 text-7xl")}
                    
                    {/* Floating Price tags */}
                    {textOverlay === "Price pop" && (
                      <div className="absolute -top-4 -right-5 bg-gradient-to-r from-yellow-500 to-amber-500 border-2 border-white text-black text-xs font-black px-2.5 py-0.5 rounded-lg font-mono shadow-md animate-bounce">
                        ZMW {price}
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>

                {/* Bottom title display tag info */}
                <div className="absolute bottom-3 left-3 right-3 bg-black/60 backdrop-blur-md border border-zinc-800/40 p-2.5 rounded-xl text-left flex justify-between items-center z-20">
                  <div className="min-w-0">
                    <span className="text-[7.5px] uppercase font-mono tracking-wider bg-purple-500/20 text-purple-300 px-1.5 py-0.2 rounded inline-block mb-1">
                      Selo advert
                    </span>
                    <h5 className="text-[10.5px] text-white font-bold leading-tight truncate">{title}</h5>
                    <p className="text-[9.5px] text-emerald-400 font-extrabold font-mono mt-0.5">ZMW {price}</p>
                  </div>
                  
                  {isAudioPlaying && (
                    <div className="flex gap-0.5 items-end h-3 shrink-0">
                      <div className="w-0.5 h-2 bg-purple-400 animate-[bounce_0.6s_infinite]" />
                      <div className="w-0.5 h-3 bg-purple-400 animate-[bounce_0.8s_infinite_0.2s]" />
                      <div className="w-0.5 h-1.5 bg-purple-400 animate-[bounce_0.5s_infinite_0.4s]" />
                    </div>
                  )}
                </div>

                <div className="absolute top-3 left-3 bg-purple-500/20 backdrop-blur-md text-purple-300 text-[8px] font-bold px-2 py-0.5 rounded-md font-mono uppercase">
                  ✦ Selo advert
                </div>

                <div className="absolute top-3 right-3 bg-emerald-500/20 backdrop-blur-md text-emerald-400 text-[8px] font-bold px-2 py-0.5 rounded-md font-mono uppercase">
                  {template}
                </div>
              </div>

              {/* Feed simulation controller */}
              <div className="flex justify-between items-center">
                <button
                  type="button"
                  onClick={handleReplayAnimation}
                  className="px-3 py-1.5 rounded-lg hover:bg-zinc-900 border border-zinc-800 text-zinc-300 text-[10px] font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Replay advert</span>
                </button>

                <button
                  type="button"
                  onClick={() => onSpawnToast({ message: "Mock Link Copied", subText: "Share with buyers on WhatsApp or Facebook." })}
                  className="px-3 py-1.5 rounded-lg hover:bg-zinc-900 border border-zinc-800 text-zinc-300 text-[10px] font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Share preview</span>
                </button>
              </div>

              {/* Summary configuration specification card */}
              <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-900 text-left space-y-1.5">
                <span className="text-[8.5px] font-bold text-zinc-550 uppercase tracking-widest font-mono block">
                  ADVERT CREATIVE CHOICES SUMMARY
                </span>
                
                <table className="w-full text-[10px] font-mono leading-relaxed text-zinc-400">
                  <tbody>
                    <tr className="border-b border-zinc-900/40">
                      <td className="text-zinc-500 py-0.5">Template</td>
                      <td className="text-right text-zinc-200">{template}</td>
                    </tr>
                    <tr className="border-b border-zinc-900/40">
                      <td className="text-zinc-500 py-0.5">Background</td>
                      <td className="text-right text-zinc-200">{background} (Blur: {backgroundBlur}px)</td>
                    </tr>
                    <tr className="border-b border-zinc-900/40">
                      <td className="text-zinc-500 py-0.5">Animation</td>
                      <td className="text-right text-zinc-200">{entryAnimation}</td>
                    </tr>
                    <tr className="border-b border-zinc-900/40">
                      <td className="text-zinc-500 py-0.5">VFX Layer</td>
                      <td className="text-right text-zinc-200">{visualEffect} overlay</td>
                    </tr>
                    <tr className="border-b border-zinc-900/40">
                      <td className="text-zinc-500 py-0.5">Text Graphic</td>
                      <td className="text-right text-zinc-200">{textOverlay}</td>
                    </tr>
                    <tr className={narrationText ? "border-b border-zinc-900/40" : ""}>
                      <td className="text-zinc-500 py-0.5">Music</td>
                      <td className="text-right text-zinc-200">{soundTrack} · vol {soundVolume}%</td>
                    </tr>
                    {narrationText && (
                      <tr>
                        <td className="text-zinc-550 py-0.5">Voiceover</td>
                        <td className="text-right text-purple-400 font-black flex items-center justify-end gap-1 font-mono text-[9px]">
                          📢 GENERATED
                          <button
                            type="button"
                            onClick={playVoiceoverPreview}
                            className="bg-purple-500/20 border border-purple-550 text-purple-300 hover:bg-purple-500/45 text-[8.5px] font-extrabold px-1.5 py-0.5 rounded cursor-pointer ml-1 active:scale-95 transition-all"
                          >
                            Listen 🔊
                          </button>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* FFmpeg Video Renderer integration block */}
            <div className="bg-[#0c0d19] border border-amber-500/30 p-4 rounded-2xl space-y-3 relative overflow-hidden bg-gradient-to-br from-[#0c0a1a]/95 to-[#050511]">
              <div className="absolute top-0 right-0 bg-amber-500/10 text-amber-500 text-[8.5px] font-black uppercase px-2.5 py-0.5 rounded-bl-lg tracking-wider border-l border-b border-amber-500/20 font-mono">
                🎬 FFmpeg Engine
              </div>

              <div>
                <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                  ⚡ Bake Final Video Asset (1080x1920)
                </h4>
                <p className="text-[10px] text-zinc-400 mt-1">
                  Merge Product Image, AI Animation background, ElevenLabs voiceover, Suno audio, and Deepgram captions into a final high-performance MP4:
                </p>
              </div>

              {/* Show render logs or render button */}
              {isCompilingVideo ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2.5 bg-black/40 p-2.5 rounded-xl border border-zinc-900 animate-pulse">
                    <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin shrink-0" />
                    <span className="text-[9.5px] font-mono text-amber-500 uppercase tracking-widest font-black">
                      COMPILING VIDEO VIA CLOUD RUN REEL BUILDER...
                    </span>
                  </div>

                  {/* Terminal emulator style stream */}
                  <div className="bg-black text-[9px] font-mono p-3 rounded-xl border border-zinc-850 h-36 overflow-y-auto space-y-1 select-none leading-relaxed text-zinc-300">
                    {renderLogs.map((log, lIdx) => (
                      <div key={lIdx} className={log.includes("RENDER FAIL") ? "text-red-500 font-bold" : log.includes("Success") || log.includes("Output") ? "text-emerald-400 font-bold" : "text-zinc-300"}>
                        {log}
                      </div>
                    ))}
                    <div className="animate-pulse text-amber-500">_</div>
                  </div>
                </div>
              ) : renderSuccess ? (
                <div className="space-y-3">
                  <div className="bg-emerald-950/20 border border-emerald-500/30 p-3 rounded-xl flex items-center gap-3">
                    <span className="text-2xl">🎉</span>
                    <div className="min-w-0">
                      <span className="text-[8px] uppercase tracking-widest font-mono text-emerald-400 block font-black">
                        COMPILATION COMPLETED SUCCESSFULLY
                      </span>
                      <p className="text-[10px] text-zinc-200 font-bold">
                        Bake is ready: 1080x1920 MP4 Video Compiled!
                      </p>
                      <p className="text-[9px] text-zinc-400 mt-0.5">
                        High-fidelity MP4 is structured for TikTok, Instagram Reels, and Facebook Reels.
                      </p>
                    </div>
                  </div>

                  {/* Action buttons for rendered video */}
                  <div className="flex flex-wrap gap-2">
                    <a
                      href={compiledVideoUrl}
                      target="_blank"
                      rel="referrer"
                      className="bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-[10px] px-3.5 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-all active:scale-95 shadow shadow-emerald-500/20"
                    >
                      <span>Download Final MP4</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(compiledVideoUrl);
                        onSpawnToast({ message: "Link Copied! 📋", subText: "Compiled MP4 URL copied to clipboard." });
                      }}
                      className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 font-bold text-[10px] px-3.5 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-all"
                    >
                      <span>Copy link</span>
                    </button>
                    <button
                      type="button"
                      onClick={startFinalVideoCompilation}
                      className="bg-purple-950/40 hover:bg-purple-900/40 text-purple-300 font-bold text-[10.5px] px-3.5 py-1.5 rounded-lg border border-purple-500/30 cursor-pointer text-center ml-auto animate-pulse"
                    >
                      <span>Re-compile</span>
                    </button>
                  </div>

                  {/* Terminal output summary */}
                  <div className="bg-black/85 text-[8.5px] font-mono p-2.5 rounded-lg border border-zinc-900 max-h-[85px] overflow-y-auto space-y-0.5 text-zinc-400">
                    <div className="text-zinc-550 border-b border-zinc-900/60 pb-1 mb-1 font-bold uppercase tracking-wider">FFmpeg Export Trace:</div>
                    {renderLogs.slice(-4).map((log, lIdx) => (
                      <div key={lIdx} className="truncate">{log}</div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={startFinalVideoCompilation}
                    className="flex-1 py-2.5 bg-gradient-to-r from-[#ffa500]/95 to-amber-500 text-black font-black uppercase text-[10.5px] tracking-wider rounded-xl cursor-pointer hover:from-[#ffa500] hover:to-amber-400 flex items-center justify-center gap-1.5 shadow shadow-amber-500/10 active:scale-[0.98] transition-all"
                  >
                    <span>⚡ Compile & Render Final MP4 (FFmpeg Cloud)</span>
                  </button>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => setStep(6)}
                className="flex-1 py-3 border border-zinc-800 hover:bg-zinc-900 text-zinc-400 font-bold rounded-xl text-xs cursor-pointer text-center"
              >
                Back & edit
              </button>
              <button 
                onClick={() => setStep(8)}
                className="flex-1 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs cursor-pointer text-center flex items-center justify-center gap-1 shadow-md shadow-purple-500/10"
              >
                <span>Looks great</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ------------------------------------- */}
        {/* SCREEN 8: EDIT LISTING DETAILS */}
        {/* ------------------------------------- */}
        {step === 8 && (
          <div className="space-y-4 animate-fadeIn">
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider">Edit listing details</h3>
              <p className="text-xs text-zinc-400 mt-1">
                Selo AI compiled everything below. Correct any field or tag before publishing live.
              </p>
            </div>

            {/* AI Product Analyst Report Card */}
            {aiAnalysis && (
              <div className="bg-amber-500/5 border border-amber-500/20 p-4 rounded-2xl space-y-3 shadow-lg shadow-amber-500/2">
                <div className="flex items-center gap-2 border-b border-amber-500/20 pb-2">
                  <span className="text-lg">🤖</span>
                  <div>
                    <h4 className="text-[10.5px] font-black text-[#ffa500] uppercase tracking-wider font-mono">Selonachipa AI Product Analyst</h4>
                    <span className="text-[8.5px] text-zinc-550 font-mono tracking-widest block font-bold">ZAMBIAN MARKET DIAGNOSIS REPORT</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5 text-[10.5px]">
                  <div className="space-y-0.5 bg-zinc-950/65 p-2 rounded-xl border border-zinc-900">
                    <span className="text-[8px] text-zinc-550 font-bold uppercase font-mono block">Detected Condition</span>
                    <span className="text-zinc-200 font-black text-xs font-mono text-emerald-400">⚡ {aiAnalysis.condition || "Not Specified"}</span>
                  </div>

                  <div className="space-y-0.5 bg-zinc-950/65 p-2 rounded-xl border border-zinc-900">
                    <span className="text-[8px] text-zinc-550 font-bold uppercase font-mono block">Brand & Colour</span>
                    <span className="text-zinc-200 font-bold truncate block">{aiAnalysis.detectedBrandAndColour || "Not Specified"}</span>
                  </div>

                  <div className="space-y-0.5 bg-zinc-950/65 p-2 rounded-xl border border-zinc-900">
                    <span className="text-[8px] text-zinc-550 font-bold uppercase font-mono block">Category / Subcategory</span>
                    <span className="text-zinc-200 font-bold truncate block">{aiAnalysis.category} / {aiAnalysis.subcategory || "General"}</span>
                  </div>

                  <div className="space-y-0.5 bg-zinc-950/65 p-2 rounded-xl border border-zinc-900">
                    <span className="text-[8px] text-zinc-550 font-bold uppercase font-mono block">Est. Market Fair Price</span>
                    <span className="text-[#ffa500] font-black font-mono">ZMW {aiAnalysis.estimatedPriceZMW || price}</span>
                  </div>
                </div>

                {aiAnalysis.targetAudience && (
                  <div className="bg-zinc-950/65 p-2.5 rounded-xl border border-zinc-900 text-[10.5px] space-y-1">
                    <span className="text-[8px] text-[#ffa500] font-bold uppercase font-mono block">Target Buyer Demographic</span>
                    <p className="text-zinc-300 leading-snug">{aiAnalysis.targetAudience}</p>
                  </div>
                )}

                {aiAnalysis.sellingPoints && aiAnalysis.sellingPoints.length > 0 && (
                  <div className="bg-zinc-950/65 p-2.5 rounded-xl border border-zinc-900 text-[10.5px] space-y-1.5">
                    <span className="text-[8px] text-emerald-400 font-bold uppercase font-mono block">Zambian Selling Points</span>
                    <ul className="space-y-1 list-none pl-0">
                      {aiAnalysis.sellingPoints.map((pt: string, i: number) => (
                        <li key={i} className="text-zinc-300 flex items-start gap-1.5">
                          <span className="text-emerald-500 mt-0.5 font-bold">✓</span>
                          <span className="leading-snug">{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {aiAnalysis.warning && (
                  <div className="bg-zinc-900 p-2 rounded-lg text-[9px] text-[#ffa500] font-mono">
                    ⚠️ {aiAnalysis.warning}
                  </div>
                )}
              </div>
            )}

            {/* Editable Form container */}
            <div className="bg-[#0a0a14] border border-zinc-900 p-3.5 rounded-2xl space-y-3.5">
              
              {/* Product title */}
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-400 font-bold font-mono block">PRODUCT TITLE</label>
                <input 
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-purple-500 focus:outline-none px-3 py-2 text-xs rounded-xl font-bold text-white shrink-0"
                />
              </div>

              {/* Promo Script */}
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-400 font-bold font-mono block">SELO DESCRIPTION</label>
                <textarea 
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-purple-500 focus:outline-none px-3 py-2 text-xs rounded-xl leading-relaxed text-zinc-200"
                />
              </div>

              {/* Price (ZMW) */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-400 font-bold font-mono block">PRICE (ZMW)</label>
                  <input 
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-purple-500 focus:outline-none px-3 py-2 text-xs rounded-xl font-mono font-bold text-[#ffa500]"
                  />
                </div>

                {/* Category */}
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-400 font-bold font-mono block">CATEGORY</label>
                  <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-purple-500 focus:outline-none px-3 py-2 text-xs rounded-xl text-white font-semibold"
                  >
                    <option value="Fresh produce">Fresh produce</option>
                    <option value="Dried foodstuffs">Dried foodstuffs</option>
                    <option value="Handicrafts">Handicrafts</option>
                    <option value="Apparel & chitenge">Apparel & chitenge</option>
                    <option value="Local spices">Local spices</option>
                    <option value="Parcels">Parcels</option>
                    <option value="Fish & Seafood">Fish & Seafood</option>
                    <option value="Electronics">Electronics</option>
                  </select>
                </div>
              </div>

              {/* SEO TAGS */}
              <div className="space-y-1.5 pt-1">
                <label className="text-[10px] text-zinc-400 font-bold font-mono block">SEO TAGS (AUTO-GENERATED)</label>
                
                <div className="flex gap-2">
                  <input 
                    type="text"
                    placeholder="add custom tag..."
                    value={newTagVal}
                    onChange={(e) => setNewTagVal(e.target.value)}
                    className="flex-1 bg-zinc-950 border border-zinc-800 focus:border-purple-500 focus:outline-none px-3 py-1.5 text-xs rounded-xl text-zinc-100"
                  />
                  <button
                    type="button" 
                    onClick={addCustomTag}
                    className="px-3 bg-purple-600 hover:bg-purple-500 text-white font-heavy text-xs rounded-xl cursor-pointer"
                  >
                    + Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {tags.map((t, idx) => (
                    <span 
                      key={idx}
                      className="bg-[#ffa500]/10 border border-[#ffa500]/25 text-[#ffa500] text-[9.5px] font-mono font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shrink-0"
                    >
                      <span>#{t}</span>
                      <button 
                        type="button" 
                        onClick={() => removeTag(idx)}
                        className="hover:text-red-500 stroke-[3px] ml-1 shrink-0 bg-transparent border-none outline-none cursor-pointer"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => setStep(7)}
                className="flex-1 py-3 border border-zinc-800 hover:bg-zinc-900 text-zinc-400 font-bold rounded-xl text-xs cursor-pointer text-center"
              >
                Back
              </button>
              <button 
                onClick={() => setStep(9)}
                className="flex-1 py-3 bg-[#ffa500] hover:bg-[#e09100] text-black font-black uppercase rounded-xl text-xs cursor-pointer text-center flex items-center justify-center gap-1 shadow-md shadow-amber-500/10"
              >
                <span>Review & post</span>
                <ChevronRight className="w-4 h-4 text-black" />
              </button>
            </div>
          </div>
        )}

        {/* ------------------------------------- */}
        {/* SCREEN 9: CONFIRM AND PUBLISH */}
        {/* ------------------------------------- */}
        {step === 9 && (
          <div className="space-y-4 animate-fadeIn">
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider">Confirm & publish</h3>
              <p className="text-xs text-zinc-400 mt-1">
                Your Selo campaign is loaded and fully generated. Double-check details below before making it public.
              </p>
            </div>

            {/* Campaign Summary box */}
            <div className="bg-[#0a0a14] border border-zinc-900 p-3.5 rounded-2xl space-y-3">
              
              <div className="flex gap-3 items-center">
                {/* Micro Thumbnail */}
                <div className="w-12 h-12 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center overflow-hidden">
                  {renderProductVisual("w-11 h-11 text-2xl")}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-black text-white leading-tight truncate">{title}</h4>
                  <div className="flex gap-1.5 mt-1">
                    <span className="bg-purple-500/10 border border-purple-500/30 text-purple-300 text-[8.5px] px-1.5 py-0.2 rounded font-mono uppercase">
                      Local Advert
                    </span>
                    <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[8.5px] px-1.5 py-0.2 rounded font-mono uppercase">
                      {category}
                    </span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs font-bold text-zinc-550 block font-mono">Suggested</span>
                  <span className="text-xs font-black text-[#ffa500] font-mono">ZMW {price}</span>
                </div>
              </div>

              <hr className="border-zinc-900" />

              {/* Status checklist metrics */}
              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between items-center text-[10px] py-0.5 border-b border-zinc-900/50">
                  <span className="text-zinc-500">Animation style:</span>
                  <span className="text-zinc-200">{entryAnimation} + {visualEffect}</span>
                </div>

                <div className="flex justify-between items-center text-[10px] py-0.5 border-b border-zinc-900/50">
                  <span className="text-zinc-500">Soundtrack:</span>
                  <span className="text-zinc-200">{soundTrack} · {soundVolume}%</span>
                </div>

                <div className="flex justify-between items-center text-[10px] py-0.5 border-b border-zinc-900/50">
                  <span className="text-zinc-500">Target feeds:</span>
                  <span className="text-zinc-200">{userRole === "AGENT" ? customZone : "Lusaka Central"}</span>
                </div>

                <div className="flex justify-between items-center text-[10px] pt-0.5">
                  <span className="text-zinc-500">Escrow payments:</span>
                  <span className="bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 font-bold px-1.5 py-0.2 rounded text-[8.5px] flex items-center gap-1 uppercase">
                    <Shield className="w-2.5 h-2.5" />
                    <span>Active Protection</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Selonachipa Listing Quality AI scorecard */}
            <div className="bg-[#0b0c16] border border-purple-500/20 p-4 rounded-2xl space-y-3 relative overflow-hidden bg-gradient-to-br from-[#0c0a1a] to-[#040411]">
              <div className="absolute top-0 right-0 bg-purple-500/10 text-purple-400 text-[8.5px] font-black uppercase px-2.5 py-0.5 rounded-bl-lg tracking-widest border-l border-b border-purple-500/20 font-mono">
                🤖 Listing Quality AI
              </div>
              
              <div>
                <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                  📈 Viral Listing Score Assessment
                </h4>
                <p className="text-[10px] text-zinc-400 mt-1">
                  Let Selonachipa Listing Quality AI scan this advertisement for visual quality, sales potential, trustworthiness, and video pacing before publishing:
                </p>
              </div>

              {isAnalyzingViralScore ? (
                <div className="flex flex-col items-center justify-center py-5 space-y-2 bg-black/40 border border-zinc-900 rounded-xl animate-pulse">
                  <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-[9px] font-mono text-purple-400">ANALYSING YOUR MULTIMEDIA CAMPAIGN VIA GEMINI...</span>
                </div>
              ) : viralScoreReport ? (
                <div className="space-y-3">
                  {/* Score circle / bar indicator */}
                  <div className="flex items-center gap-4 bg-black/45 p-3 rounded-xl border border-zinc-900">
                    <div className="relative flex items-center justify-center shrink-0">
                      {/* Circle backdrop */}
                      <div className="w-14 h-14 rounded-full border-4 border-zinc-900 flex items-center justify-center">
                        <span className={`text-base font-black font-mono ${
                          viralScoreReport.viralScore >= 80 ? "text-emerald-400" :
                          viralScoreReport.viralScore >= 60 ? "text-amber-400" : "text-rose-500"
                        }`}>
                          {viralScoreReport.viralScore}
                        </span>
                      </div>
                      <div className={`absolute inset-0 rounded-full border-4 ${
                        viralScoreReport.viralScore >= 80 ? "border-emerald-500/40" :
                        viralScoreReport.viralScore >= 60 ? "border-amber-500/40" : "border-rose-500/40"
                      } animate-pulse`} />
                    </div>

                    <div className="text-left">
                      <span className="text-[8.5px] text-zinc-500 font-bold uppercase font-mono block tracking-widest">
                        ESTIMATED VIRAL CAPACITY
                      </span>
                      <h5 className={`text-xs font-black tracking-wide uppercase ${
                        viralScoreReport.viralScore >= 80 ? "text-emerald-400" :
                        viralScoreReport.viralScore >= 60 ? "text-amber-400" : "text-rose-500"
                      }`}>
                        {viralScoreReport.viralScore >= 80 ? "🔥 Hot Viral Material (Tap Match)" :
                         viralScoreReport.viralScore >= 60 ? "⚡ Optimised Reach (Steady Sales)" : "⚠️ Needs Refinement (Under-leveraged)"}
                      </h5>
                      <span className="text-[9px] text-zinc-500 block leading-tight mt-0.5">
                        High-fidelity indexing secures higher scroll retention metrics in local shopper feeds.
                      </span>
                    </div>
                  </div>

                  {/* Strengths & Weaknesses */}
                  <div className="space-y-2 text-left text-[10px]">
                    {viralScoreReport.strengths && viralScoreReport.strengths.length > 0 && (
                      <div className="bg-emerald-950/10 border border-emerald-500/15 p-2.5 rounded-xl space-y-1">
                        <span className="text-[8px] text-emerald-400 font-extrabold uppercase font-mono block tracking-wide">✓ KEY STRENGTHS</span>
                        <ul className="list-disc pl-3.5 space-y-0.5 text-zinc-300">
                          {viralScoreReport.strengths.map((str, sIdx) => <li key={sIdx}>{str}</li>)}
                        </ul>
                      </div>
                    )}

                    {viralScoreReport.weaknesses && viralScoreReport.weaknesses.length > 0 && (
                      <div className="bg-[#5c0d0d]/10 border border-red-500/15 p-2.5 rounded-xl space-y-1">
                        <span className="text-[8px] text-rose-400 font-extrabold uppercase font-mono block tracking-wide">⚠️ CRITICAL GAPS</span>
                        <ul className="list-disc pl-3.5 space-y-0.5 text-zinc-300">
                          {viralScoreReport.weaknesses.map((wk, wIdx) => <li key={wIdx}>{wk}</li>)}
                        </ul>
                      </div>
                    )}

                    {viralScoreReport.recommendations && viralScoreReport.recommendations.length > 0 && (
                      <div className="bg-purple-950/10 border border-purple-500/15 p-2.5 rounded-xl space-y-1">
                        <span className="text-[8px] text-purple-400 font-extrabold uppercase font-mono block tracking-wide">💡 LOCAL RECOMMENDATIONS</span>
                        <ul className="list-disc pl-3.5 space-y-0.5 text-zinc-300">
                          {viralScoreReport.recommendations.map((rec, rIdx) => <li key={rIdx}>{rec}</li>)}
                        </ul>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={analyzeViralListingScore}
                    className="w-full py-1.5 bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 text-[10px] font-bold rounded-lg cursor-pointer transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>🔄 Recalculate Score</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {viralScoreError && (
                    <p className="text-[10px] text-red-500 font-mono bg-red-500/5 p-2 rounded-lg border border-red-500/20">{viralScoreError}</p>
                  )}
                  <button
                    type="button"
                    onClick={analyzeViralListingScore}
                    className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-heavy uppercase text-[10.5px] tracking-wider rounded-xl cursor-pointer hover:from-purple-500 hover:to-indigo-500 flex items-center justify-center gap-1.5 shadow-md shadow-purple-500/10 active:scale-[0.98] transition-all"
                  >
                    <span>Scan with Selonachipa Listing AI 🤖</span>
                  </button>
                </div>
              )}
            </div>

            {/* Green confirmation alert box */}
            <div className="bg-teal-500/10 border border-teal-500/20 p-3.5 rounded-xl flex gap-3 text-left">
              <div className="w-5 h-5 rounded-full bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400 shrink-0 mt-0.5">
                <Check className="w-3.5 h-3.5 stroke-[3px]" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-teal-400">Everything is ready</p>
                <p className="text-[10px] text-zinc-400 mt-0.5 leading-relaxed">
                  Your Selo advert looks polished. Once published, it begins streaming inside buyer feeds immediately. You can pause, edit, or adjust pricing anytime after publishing.
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2">
              <button 
                onClick={() => setShowGuidelines(true)}
                className="flex-1 py-3 border border-zinc-800 hover:bg-zinc-900 text-zinc-300 font-bold rounded-xl text-xs cursor-pointer text-center"
              >
                Listing tips ↗
              </button>
              
              <button 
                onClick={handlePublish}
                className="flex-[1.5] py-3 bg-emerald-500 hover:bg-emerald-600 text-black font-black uppercase rounded-xl text-xs cursor-pointer text-center shadow-lg shadow-emerald-500/10"
              >
                Publish listing
              </button>
            </div>
          </div>
        )}

      </div>

      {/* GUIDELINES DIALOG POPUP */}
      <AnimatePresence>
        {showGuidelines && (
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0a0a14] border border-zinc-850 p-5 rounded-3xl max-w-sm w-full space-y-4 text-left"
            >
              <div className="flex justify-between items-center pb-2 border-b border-zinc-900">
                <h4 className="text-xs font-black text-white uppercase tracking-widest font-mono">SELA CREATOR AD GUIDE</h4>
                <button onClick={() => setShowGuidelines(false)} className="text-zinc-500 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs leading-relaxed text-zinc-400">
                <p>Follow these quick formulas to turn passive views into local buyer orders:</p>
                
                <div className="space-y-2">
                  <div className="p-2 bg-zinc-900/60 rounded-xl border border-zinc-850/40">
                    <span className="text-[#ffa500] font-black block text-[10px]">1. FIRST 3 SECONDS MATTER</span>
                    <span>Make sure your product entry animation stands out. Keep depth blur high to separate product clutter.</span>
                  </div>

                  <div className="p-2 bg-zinc-900/60 rounded-xl border border-zinc-850/40">
                    <span className="text-purple-400 font-black block text-[10px]">2. SET TRUTHFUL SUGGESTIONS</span>
                    <span>Set your price near predicted midpoint ratios to guarantee immediate match callbacks.</span>
                  </div>

                  <div className="p-2 bg-zinc-900/60 rounded-xl border border-zinc-850/40">
                    <span className="text-teal-400 font-black block text-[10px]">3. USE SAFE ESCROWS ALWAYS</span>
                    <span>We safeguard client balances within smart mobile lockers till delivery logistics clear.</span>
                  </div>
                </div>

                <p className="text-[10px] text-zinc-500 font-mono">Selonachipa Curation Protocol v4.8</p>
              </div>

              <button
                onClick={() => setShowGuidelines(false)}
                className="w-full py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Close tips
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Compact Music Icon SVG
function MusicIcon({ classname }: { classname?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={classname}
    >
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  );
}
