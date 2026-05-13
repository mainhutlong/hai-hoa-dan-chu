/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, ReactNode, ChangeEvent } from "react";
import {
  Users,
  Flower,
  Trophy,
  Settings,
  Play,
  Volume2,
  Maximize2,
  Clock,
  Calendar,
  Plus,
  Trash2,
  Edit2,
  Save,
  Download,
  Upload,
  RotateCcw,
  PlusCircle,
  FileText,
  Layout,
  MapPin,
  Image as ImageIcon
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const INITIAL_FLOWERS = [
  { id: 1, name: "HOA HỒNG", color: "#EF4444", icon: "🌹", x: "50%", y: "12%" },
  { id: 2, name: "HOA HƯỚNG DƯƠNG", color: "#FBBF24", icon: "🌻", x: "32%", y: "22%" },
  { id: 3, name: "HOA SEN", color: "#FDF4FF", icon: "🪷", x: "68%", y: "22%" },
  { id: 4, name: "HOA LAN", color: "#A855F7", icon: "🌸", x: "18%", y: "45%" },
  { id: 5, name: "HOA MẪU ĐƠN", color: "#EC4899", icon: "🌺", x: "50%", y: "40%" },
  { id: 6, name: "HOA CẨM TÚ CẦU", color: "#3B82F6", icon: "💠", x: "82%", y: "45%" },
  { id: 7, name: "HOA LY", color: "#F97316", icon: "💐", x: "28%", y: "68%" },
  { id: 8, name: "HOA TULIP", color: "#FFFFFF", icon: "🌷", x: "50%", y: "72%" },
  { id: 9, name: "HOA ĐỒNG TIỀN", color: "#FF4D4D", icon: "🏵️", x: "72%", y: "68%" },
];

// Helper Component for Flower Icons (Emoji or Image)
function FlowerIconDisplay({ icon, className = "", size = "md" }: { icon: string, className?: string, size?: 'sm' | 'md' | 'lg' | 'xl' }) {
  const isImage = icon.startsWith('data:image') || icon.startsWith('http');
  const sizeClasses = {
    sm: "w-10 h-10 text-2xl",
    md: "w-24 h-24 text-6xl",
    lg: "w-44 h-44 text-9xl",
    xl: "w-64 h-64 text-[10rem]"
  };

  return (
    <div className={`${sizeClasses[size]} flex items-center justify-center overflow-hidden rounded-[25%] relative group shadow-inner ${className}`}>
      {isImage ? (
        <img src={icon} className="max-w-[90%] max-h-[90%] object-contain" referrerPolicy="no-referrer" />
      ) : (
        <span className="drop-shadow-2xl">{icon}</span>
      )}
    </div>
  );
}

const INITIAL_TEAMS = Array.from({ length: 9 }, (_, i) => `Chi bộ ${i + 1}`);

const INITIAL_QUESTIONS: Record<number, { mcqs: any[], essays: string[] }> = Object.fromEntries(INITIAL_FLOWERS.map(f => [f.id, {
  mcqs: [
    { q: "Nội dung học tập và làm theo tư tưởng, đạo đức, phong cách Hồ Chí Minh năm 2026 là gì?", a: ["Phát triển kinh tế", "Xây dựng Đảng bản lĩnh", "Đổi mới sáng tạo", "Cả 3 phương án"], correct: 3 },
    { q: "Hội thi được tổ chức lần thứ mấy?", a: ["Lần 1", "Lần 2", "Lần 3", "Lần 4"], correct: 1 },
    { q: "Tiêu chí 'Bản lĩnh' thể hiện ở điều nào?", a: ["Kiên định mục tiêu", "Dám nghĩ dám làm", "Vượt qua thử thách", "Tất cả phương án"], correct: 3 },
    { q: "Hồ Chí Minh là tấm gương sáng về?", a: ["Tiết kiệm", "Cần cù", "Yêu nước", "Tất cả phương án"], correct: 3 },
    { q: "Đảng bộ trường chúng ta có bao nhiêu chi bộ tham gia hội thi này?", a: ["7 chi bộ", "8 chi bộ", "9 chi bộ", "10 chi bộ"], correct: 2 },
  ],
  essays: [`Dựa vào tư tưởng Hồ Chí Minh về xây dựng Đảng, đồng chí hãy bình luận về vai trò của chuyển đổi số trong công tác Đảng tại đơn vị hiện nay.`]
}]));

export default function App() {
  const [time, setTime] = useState(new Date());
  const [screen, setScreen] = useState<'home' | 'game'>('home');

  // Dynamic Configuration State
  const [flowers, setFlowers] = useState<typeof INITIAL_FLOWERS>(() => {
    const saved = localStorage.getItem('flowers');
    return saved ? JSON.parse(saved) : INITIAL_FLOWERS;
  });

  const [teams, setTeams] = useState<string[]>(() => {
    const saved = localStorage.getItem('teams');
    return saved ? JSON.parse(saved) : INITIAL_TEAMS;
  });

  const [questionsDb, setQuestionsDb] = useState<Record<number, { mcqs: any[], essays: string[] }>>(() => {
    const saved = localStorage.getItem('questionsDb');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Migration: convert old 'essay' to 'essays' array if needed
      Object.keys(parsed).forEach(key => {
        if (parsed[key].essay && !parsed[key].essays) {
          parsed[key].essays = [parsed[key].essay];
          delete parsed[key].essay;
        }
      });
      return parsed;
    }
    return INITIAL_QUESTIONS;
  });

  const [selectedFlower, setSelectedFlower] = useState<typeof INITIAL_FLOWERS[0] | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [teamScores, setTeamScores] = useState<Record<string, { points: number, time: number }>>(() => {
    const saved = localStorage.getItem('teamScores');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse scores", e);
      }
    }
    return Object.fromEntries(INITIAL_TEAMS.map(team => [team, { points: 0, time: 0 }]));
  });

  const [showTeamModal, setShowTeamModal] = useState(false);
  const [showScoringModal, setShowScoringModal] = useState(false);
  const [showPodiumModal, setShowPodiumModal] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);

  const [scoringTeam, setScoringTeam] = useState<string | null>(null);
  const [essayScoreInput, setEssayScoreInput] = useState<string>("0");
  const [essayTimeRemaining, setEssayTimeRemaining] = useState(180);
  const [completedFlowerIds, setCompletedFlowerIds] = useState<number[]>(() => {
    const saved = localStorage.getItem('completedFlowerIds');
    return saved ? JSON.parse(saved) : [];
  });

  // Persistence
  useEffect(() => { localStorage.setItem('flowers', JSON.stringify(flowers)); }, [flowers]);
  useEffect(() => { localStorage.setItem('teams', JSON.stringify(teams)); }, [teams]);
  useEffect(() => { localStorage.setItem('questionsDb', JSON.stringify(questionsDb)); }, [questionsDb]);
  useEffect(() => { localStorage.setItem('teamScores', JSON.stringify(teamScores)); }, [teamScores]);
  useEffect(() => { localStorage.setItem('completedFlowerIds', JSON.stringify(completedFlowerIds)); }, [completedFlowerIds]);

  // Quiz State
  const [quizActive, setQuizActive] = useState(false);
  const [quizStep, setQuizStep] = useState<'quiz' | 'summary' | 'essay'>('quiz');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0); // 0-4 mcq
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>(new Array(5).fill(null));
  const [showDetailResults, setShowDetailResults] = useState(false);
  const [quizStartTime, setQuizStartTime] = useState<number | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (quizActive && quizStep === 'essay' && essayTimeRemaining > 0) {
      interval = setInterval(() => {
        setEssayTimeRemaining(prev => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [quizActive, quizStep, essayTimeRemaining]);

  const formatTime = (date: Date) => date.toTimeString().split(' ')[0];
  const formatDate = (date: Date) => {
    const d = date.getDate().toString().padStart(2, '0');
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const y = date.getFullYear();
    return `${d}/${m}/${y}`;
  };

  const startQuiz = () => {
    if (!selectedFlower) return;
    const numQuestions = questionsDb[selectedFlower.id]?.mcqs.length || 0;
    setQuizActive(true);
    setQuizStep('quiz');
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setUserAnswers(new Array(numQuestions).fill(null));
    setShowDetailResults(false);
    setEssayScoreInput("0");
    setQuizStartTime(Date.now());
  };

  const calculateScore = () => {
    if (!selectedFlower) return 0;
    const questions = questionsDb[selectedFlower.id]?.mcqs || [];
    return userAnswers.reduce((total, ans, idx) => {
      return total + (ans === questions[idx]?.correct ? 1 : 0);
    }, 0);
  };

  const nextQuestion = () => {
    if (!selectedFlower) return;
    const mcqs = questionsDb[selectedFlower.id]?.mcqs || [];

    if (quizStep === 'quiz') {
      const newUserAnswers = [...userAnswers];
      newUserAnswers[currentQuestionIndex] = selectedAnswer;
      setUserAnswers(newUserAnswers);

      if (currentQuestionIndex < mcqs.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setSelectedAnswer(null);
      } else {
        setQuizStep('summary');
      }
    } else if (quizStep === 'summary') {
      setQuizStep('essay');
      setEssayTimeRemaining(180);
    } else {
      // Finish Essay & Save everything
      if (selectedFlower && selectedTeam && quizStartTime) {
        const mcqs = questionsDb[selectedFlower.id]?.mcqs || [];
        const mcqPoints = userAnswers.reduce((total, ans, idx) => {
          return total + (ans === mcqs[idx]?.correct ? 1 : 0);
        }, 0);
        const essayPoints = parseFloat(essayScoreInput) || 0;
        const totalDuration = Math.floor((Date.now() - quizStartTime) / 1000);

        setTeamScores(prev => ({
          ...prev,
          [selectedTeam]: {
            points: prev[selectedTeam].points + mcqPoints + essayPoints,
            time: prev[selectedTeam].time + totalDuration
          }
        }));
        setCompletedFlowerIds(prev => [...prev, selectedFlower.id]);
      }
      setQuizActive(false);
      setSelectedFlower(null);
      setSelectedAnswer(null);
    }
  };

  const exitQuiz = () => {
    setQuizActive(false);
    setSelectedFlower(null);
    setSelectedAnswer(null);
  };

  const handleSaveScoring = () => {
    if (scoringTeam && !isNaN(parseFloat(essayScoreInput))) {
      setTeamScores(prev => ({
        ...prev,
        [scoringTeam]: {
          ...prev[scoringTeam] || { points: 0, time: 0 },
          points: (prev[scoringTeam]?.points || 0) + parseFloat(essayScoreInput)
        }
      }));
      setShowScoringModal(false);
      setScoringTeam(null);
      setEssayScoreInput("0");
    }
  };

  const resetAllScores = () => {
    if (confirm("Bạn có chắc chắn muốn reset toàn bộ điểm số về 0?")) {
      setTeamScores(Object.fromEntries(teams.map(team => [team, { points: 0, time: 0 }])));
      setCompletedFlowerIds([]);
    }
  };

  const renderGameScreen = () => (
    <div className="relative w-full h-screen overflow-hidden bg-emerald-950 font-sans text-white">
      {/* Background Layer */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-700 opacity-20"
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?q=80&w=2674&auto=format&fit=crop')` }}
      />
      <div className="absolute inset-0 bg-linear-to-b from-black/60 via-transparent to-black/90 pointer-events-none" />

      {/* Header Info */}
      <div className="absolute top-10 left-12 z-50 flex flex-col items-start translate-y-[-10px]">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="modern-title text-6xl md:text-7xl font-extrabold italic">
            HÁI HOA DÂN CHỦ
          </h1>
          <div className="title-accent w-64 mt-3" />
          <div className="flex gap-4 mt-6">
            <button
              onClick={() => setScreen('home')}
              className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-200/50 hover:text-amber-200 transition-all border border-amber-500/20 px-6 py-2 rounded-full"
            >
              TRANG CHỦ
            </button>
            {selectedTeam && (
              <div className="glass-panel px-6 py-2 rounded-full border-emerald-500/30 flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-black tracking-widest text-emerald-400 uppercase italic">
                  ĐANG THI: {selectedTeam}
                </span>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* The Central Tree Interface */}
      <main className="relative w-full h-full flex flex-col items-center justify-center pt-24">
        <div className="relative w-full max-w-7xl aspect-video flex items-center justify-center">

          {/* Main Tree Visualization Background */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1.05 }}
            transition={{ duration: 2, ease: "easeOut" }}
            className={`absolute inset-0 bg-contain bg-bottom bg-no-repeat z-0 brightness-75 scale-110 transition-all duration-700 ${!selectedTeam ? 'grayscale-50 opacity-40' : ''}`}
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=2626&auto=format&fit=crop')`,
              maskImage: 'radial-gradient(circle at center, black 60%, transparent 100%)',
              WebkitMaskImage: 'radial-gradient(circle at center, black 60%, transparent 100%)',
            }}
          />

          {/* SVG Branches */}
          <svg className={`absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible transition-opacity duration-700 ${!selectedTeam ? 'opacity-10' : 'opacity-100'}`}>
            <defs>
              <linearGradient id="branchGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3f2b1c" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#1a0f0a" stopOpacity="0.4" />
              </linearGradient>
            </defs>
            {flowers.map((flower) => (
              <motion.path
                key={`branch-${flower.id}`}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1.5, delay: 0.5 + flower.id * 0.1 }}
                d={`M 50% 95% Q 50% 60%, ${flower.x} ${flower.y}`}
                stroke="url(#branchGradient)"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                className="opacity-30"
              />
            ))}
          </svg>

          {/* Flowers Grid */}
          <div className="relative w-full h-full max-w-6xl z-20">
            {flowers.map((flower) => {
              const isCompleted = completedFlowerIds.includes(flower.id);
              return (
                <motion.div
                  key={flower.id}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ delay: 0.3 + flower.id * 0.08, type: 'spring', damping: 14 }}
                  whileHover={selectedTeam && !isCompleted ? { scale: 1.15, zIndex: 100 } : {}}
                  onClick={() => {
                    if (isCompleted) return;
                    if (selectedTeam) {
                      setSelectedFlower(flower);
                    } else {
                      setShowTeamModal(true);
                    }
                  }}
                  className={`absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group transition-all duration-500 ${!selectedTeam ? 'opacity-60' : 'opacity-100'} ${isCompleted ? 'grayscale opacity-30 cursor-not-allowed pointer-events-none' : 'cursor-pointer'}`}
                  style={{ left: flower.x, top: flower.y }}
                >
                  <div className="relative">
                    <div className="animate-float" style={{ animationDelay: `${flower.id * 0.5}s` }}>
                      <div className="absolute inset-0 bg-amber-400 blur-3xl rounded-full opacity-0 group-hover:opacity-60 transition-all duration-500 scale-150" />
                      <div className="relative w-28 h-28 md:w-44 md:h-44 flex items-center justify-center">
                        <motion.div
                          animate={{ rotate: [0, 5, 0, -5, 0] }}
                          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                          className={`absolute inset-0 bg-emerald-900/30 backdrop-blur-md rounded-[40%_60%_70%_30%/40%_50%_60%_50%] border-2 group-hover:border-amber-400/50 group-hover:bg-amber-900/40 transition-colors shadow-2xl ${isCompleted ? 'border-white/10' : 'border-emerald-500/20'}`}
                        />
                        <div className={`transition-transform duration-500 relative z-10 ${!isCompleted ? 'group-hover:scale-110' : ''}`}>
                          <FlowerIconDisplay
                            icon={flower.icon}
                            size="lg"
                            className="drop-shadow-[0_20px_20px_rgba(0,0,0,0.8)]"
                          />
                        </div>
                      </div>
                      <div className={`absolute -top-4 -right-1 bg-linear-to-b rounded-full w-14 h-14 flex items-center justify-center border-4 shadow-2xl z-30 transition-transform ${isCompleted ? 'from-gray-400 to-gray-600 border-gray-800' : 'from-amber-50 via-amber-400 to-amber-700 border-amber-950/40 group-hover:scale-110'}`}>
                        <span className={`font-black text-xl italic tracking-tighter ${isCompleted ? 'text-white' : 'text-black'}`}>{flower.id.toString().padStart(2, '0')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 opacity-0 group-hover:opacity-100 translate-y-6 group-hover:translate-y-0 transition-all duration-700 pointer-events-none">
                    <div className="bg-linear-to-b from-amber-800 via-amber-950 to-black px-12 py-3 rounded-full border-2 border-amber-400/50 shadow-[0_20px_50px_rgba(0,0,0,0.9)] backdrop-blur-xl">
                      <span className="text-lg font-black text-amber-50 tracking-[0.3em] whitespace-nowrap uppercase italic drop-shadow-md">
                        {flower.name}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Control Panels Sidebars */}
      <div className="absolute left-10 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-6">
        <motion.button
          whileHover={{ scale: 1.05, x: 10 }}
          onClick={() => setShowTeamModal(true)}
          className={`flex flex-col items-center gap-3 p-6 glass-panel rounded-3xl border-2 transition-all group ${selectedTeam ? 'border-emerald-500/50 hover:border-emerald-400' : 'border-amber-500/50 hover:border-amber-400 animate-pulse'}`}
        >
          <div className={`p-4 rounded-2xl ${selectedTeam ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-500'} shadow-inner group-hover:scale-110 transition-transform`}>
            <Users size={32} />
          </div>
          <span className="text-[10px] font-black tracking-[0.3em] uppercase italic text-center leading-tight">
            {selectedTeam ? 'THÀNH VIÊN ĐANG THI' : 'CHỌN THÀNH VIÊN'}
          </span>
          {selectedTeam && (
            <span className="text-yellow-400 font-black text-sm tracking-widest">{selectedTeam}</span>
          )}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05, x: 10 }}
          onClick={() => {
            setScoringTeam(selectedTeam || teams[0]);
            setShowScoringModal(true);
          }}
          className="flex flex-col items-center gap-3 p-6 glass-panel rounded-3xl border-2 border-amber-500/20 hover:border-amber-400/50 transition-all group"
        >
          <div className="p-4 rounded-2xl bg-amber-500/20 text-amber-500 shadow-inner group-hover:scale-110 transition-transform">
            <Settings size={32} />
          </div>
          <span className="text-[10px] font-black tracking-[0.3em] uppercase italic text-center leading-tight">
            CHẤM ĐIỂM HÙNG BIỆN
          </span>
        </motion.button>
      </div>

      {/* Ranking List Panel - ON THE RIGHT */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-4">
        <div className="glass-panel p-6 rounded-[2rem] border-white/10 w-72 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Trophy size={18} className="text-amber-500" />
              <span className="text-xs font-black tracking-[0.2em] uppercase italic text-amber-200/80">Bảng Xếp Hạng</span>
            </div>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {(Object.entries(teamScores) as [string, { points: number, time: number }][])
              .sort((a, b) => {
                if (b[1].points !== a[1].points) return b[1].points - a[1].points;
                return a[1].time - b[1].time; // Lower time is better for same points
              })
              .map(([name, data], idx) => (
                <div key={name} className={`flex items-center justify-between p-3 rounded-xl border border-white/5 bg-white/5 group hover:bg-white/10 transition-colors ${idx === 0 ? 'bg-amber-500/10 border-amber-500/20' : ''}`}>
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] font-black w-5 h-5 rounded-md flex items-center justify-center italic ${idx === 0 ? 'bg-amber-500 text-black' : 'bg-white/10 text-white/40'}`}>
                      {idx + 1}
                    </span>
                    <div className="flex flex-col">
                      <span className="text-[11px] font-bold text-white/70 group-hover:text-white transition-colors">{name}</span>
                      <span className="text-[8px] text-white/30 font-black uppercase tracking-widest">{data.time}s</span>
                    </div>
                  </div>
                  <span className="text-xs font-black italic text-amber-400">{data.points} đ</span>
                </div>
              ))}
          </div>

          <div className="mt-6 flex flex-col gap-2">
            <button
              onClick={() => setShowPodiumModal(true)}
              className="w-full py-4 rounded-2xl bg-linear-to-r from-amber-500 to-amber-700 text-black font-black text-sm uppercase tracking-[0.2em] transform transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-amber-900/20"
            >
              TỔNG KẾT
            </button>
            <button
              onClick={resetAllScores}
              className="w-full py-2 rounded-xl border border-white/5 bg-white/5 hover:bg-red-500/10 hover:text-red-400 text-[9px] font-black uppercase tracking-[0.2em] text-white/20 transition-all"
            >
              Đặt lại điểm số
            </button>
          </div>
        </div>
      </div>

      {/* Flower Modal & Quiz */}
      <AnimatePresence mode="wait">
        {selectedFlower && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-xl p-8"
          >
            <motion.div
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 30 }}
              className="relative w-full max-w-5xl bg-white rounded-[3.5rem] shadow-[0_50px_100px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col min-h-[700px] border border-amber-200"
              onClick={e => e.stopPropagation()}
            >
              {/* Premium Header Decoration */}
              <div className="h-2 w-full bg-linear-to-r from-amber-300 via-amber-600 to-amber-300" />

              {!quizActive ? (
                /* Pre-Quiz Intro Screen */
                <div className="flex-1 flex flex-col items-center justify-center p-20 text-center">
                  <div className="mb-10 relative">
                    <div className="absolute inset-0 bg-amber-500/20 blur-3xl rounded-full scale-150 animate-pulse" />
                    <div className="animate-float relative z-10 flex justify-center">
                      <FlowerIconDisplay icon={selectedFlower.icon} size="xl" className="drop-shadow-2xl" />
                    </div>
                  </div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <h2 className="text-7xl font-black text-amber-950 mb-6 uppercase tracking-tight italic">
                      {selectedFlower.name}
                    </h2>
                    <div className="flex items-center justify-center gap-4 mb-10">
                      <div className="h-px w-12 bg-amber-200" />
                      <p className="text-amber-800/60 text-xl font-bold tracking-[0.2em] uppercase italic">
                        Bộ câu hỏi dành cho {selectedTeam}
                      </p>
                      <div className="h-px w-12 bg-amber-200" />
                    </div>

                    <div className="flex flex-col gap-6 w-full max-w-lg mx-auto">
                      <button
                        onClick={startQuiz}
                        className="bg-amber-600 hover:bg-amber-500 text-white px-16 py-7 rounded-[2rem] font-black text-3xl uppercase tracking-tighter shadow-2xl shadow-amber-900/20 transition-all hover:scale-105 active:scale-95 group"
                      >
                        BẮT ĐẦU PHẦN THI
                      </button>
                      <button
                        onClick={() => setSelectedFlower(null)}
                        className="text-amber-900/30 hover:text-amber-900 font-black text-sm uppercase tracking-[0.5em] transition-colors py-4"
                      >
                        QUAY LẠI CHỌN HOA
                      </button>
                    </div>
                  </motion.div>
                </div>
              ) : (
                /* Active Quiz Screen */
                <>
                  {/* Dashboard Header */}
                  <header className="px-6 md:px-12 py-6 md:py-8 bg-linear-to-b from-amber-50/50 to-transparent border-b border-amber-100 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-8">
                      <div className="w-20 h-20 flex items-center justify-center">
                        <FlowerIconDisplay icon={selectedFlower.icon} size="md" className="bg-white rounded-3xl shadow-lg border border-amber-100" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                          <span className="text-amber-700 font-black text-xs tracking-[0.4em] uppercase opacity-60">PHẦN THI TRỰC TUYẾN</span>
                        </div>
                        <h4 className="text-4xl font-black italic text-amber-950 leading-none">
                          {quizStep === 'quiz' ? (
                            <>CÂU TRẮC NGHIỆM <span className="text-amber-600">0{currentQuestionIndex + 1}</span></>
                          ) : quizStep === 'summary' ? (
                            "KẾT QUẢ TRẮC NGHIỆM"
                          ) : (
                            "TỰ LUẬN HÙNG BIỆN"
                          )}
                        </h4>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      {/* Status indicators */}
                      <div className="flex flex-col items-end gap-1 px-8 py-3 bg-white rounded-2xl shadow-sm border border-amber-100">
                        <span className="text-amber-900/30 font-black text-[10px] tracking-widest uppercase">Thời gian thực tế</span>
                        <span className="text-3xl font-mono font-black text-amber-600 tabular-nums">
                          {quizStartTime ? Math.floor((Date.now() - quizStartTime) / 1000) : 0}s
                        </span>
                      </div>
                      <button
                        onClick={exitQuiz}
                        className="w-14 h-14 rounded-2xl bg-white border border-red-100 text-red-400 hover:bg-red-500 hover:text-white hover:border-red-600 transition-all shadow-sm flex items-center justify-center font-bold"
                      >
                        ✕
                      </button>
                    </div>
                  </header>

                  {/* Main Content Area */}
                  <main className="flex-1 p-4 md:p-12 flex flex-col overflow-y-auto custom-scrollbar">
                    <div className="flex-1 max-w-4xl mx-auto w-full flex flex-col">
                      {quizStep === 'quiz' ? (
                        <div className="space-y-16 flex-1 flex flex-col justify-center">
                          {/* Question Text */}
                          <div className="relative">
                            <div className="absolute -left-6 -top-6 text-9xl opacity-5 text-amber-500 font-black italic select-none">Q</div>
                            <p className="text-5xl font-black text-amber-950 leading-[1.2] italic tracking-tight drop-shadow-sm">
                              {questionsDb[selectedFlower.id].mcqs[currentQuestionIndex].q}
                            </p>
                          </div>

                          {/* Answer Grid */}
                          <div className="grid grid-cols-2 gap-8 pt-6">
                            {questionsDb[selectedFlower.id].mcqs[currentQuestionIndex].a.map((opt: string, i: number) => (
                              <button
                                key={i}
                                onClick={() => setSelectedAnswer(i)}
                                className={`text-left p-10 rounded-[2.5rem] border-2 transition-all group relative overflow-hidden flex items-center gap-8 ${selectedAnswer === i
                                  ? 'bg-amber-600 border-amber-700 shadow-2xl shadow-amber-900/20 translate-y-[-4px]'
                                  : 'bg-white border-amber-100 hover:border-amber-300 hover:bg-amber-50/50 hover:shadow-xl'
                                  }`}
                              >
                                <div className={`w-16 h-16 min-w-[4rem] rounded-2xl flex items-center justify-center font-black italic border-2 transition-all text-3xl ${selectedAnswer === i
                                  ? 'bg-white border-amber-300 text-amber-950 scale-110'
                                  : 'bg-amber-50 border-amber-100 text-amber-600 group-hover:bg-amber-100'
                                  }`}>
                                  {String.fromCharCode(65 + i)}
                                </div>
                                <span className={`text-3xl font-black transition-colors leading-snug ${selectedAnswer === i ? 'text-white' : 'text-amber-900/80 group-hover:text-amber-950'
                                  }`}>
                                  {opt}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : quizStep === 'summary' ? (
                        <div className="flex flex-col items-center pt-4 pb-20">
                          <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="text-center"
                          >
                            <div className="inline-block p-1 bg-linear-to-b from-amber-400 to-amber-600 rounded-[3rem] shadow-2xl mb-10">
                              <div className="bg-white px-20 py-12 rounded-[2.8rem] flex flex-col items-center">
                                <span className="text-amber-800/40 font-black text-sm tracking-[0.5em] uppercase mb-4 italic">Điểm số trắc nghiệm</span>
                                <div className="flex items-baseline gap-2">
                                  <span className="text-[10rem] font-black text-amber-600 leading-none tracking-tighter italic">{calculateScore()}</span>
                                  <span className="text-5xl font-black text-amber-200">/ {questionsDb[selectedFlower.id].mcqs.length}</span>
                                </div>
                                <p className="mt-8 text-2xl font-bold text-amber-950 italic">Chúc mừng {selectedTeam} đã hoàn thành!</p>
                              </div>
                            </div>

                            <div className="flex flex-col items-center gap-6 w-full max-w-2xl px-6">
                              <button
                                onClick={() => setShowDetailResults(!showDetailResults)}
                                className="text-amber-600 font-black text-sm uppercase tracking-[0.4em] px-10 py-4 rounded-full border-2 border-amber-500/20 hover:bg-amber-50 transition-all"
                              >
                                {showDetailResults ? "Đóng chi tiết" : "Xem chi tiết đáp án"}
                              </button>

                              <AnimatePresence>
                                {showDetailResults && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="w-full space-y-4 pt-4 pb-24 overflow-hidden"
                                  >
                                    <div className="max-h-[350px] overflow-y-auto pr-2 custom-scrollbar space-y-4">
                                      {questionsDb[selectedFlower.id].mcqs.map((q, idx) => (
                                        <div key={idx} className={`p-6 rounded-2xl border-2 flex items-start gap-5 text-left ${userAnswers[idx] === q.correct ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
                                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs shrink-0 ${userAnswers[idx] === q.correct ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
                                            {idx + 1}
                                          </div>
                                          <div>
                                            <p className="font-bold text-amber-950 mb-2 truncate max-w-[500px]">{q.q}</p>
                                            <div className="flex gap-4 text-xs font-black uppercase tracking-widest leading-none">
                                              <span className={userAnswers[idx] === q.correct ? 'text-emerald-600' : 'text-red-500 line-through opacity-60'}>BẠN CHỌN: {userAnswers[idx] !== null ? String.fromCharCode(65 + (userAnswers[idx] as number)) : 'N/A'}</span>
                                              <span className="text-amber-600">ĐÁP ÁN ĐÚNG: {String.fromCharCode(65 + q.correct)}</span>
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          </motion.div>
                        </div>
                      ) : (
                        <div className="flex-1 flex flex-col gap-6 py-4 sm:py-6">
                          <div className="relative group w-full shrink-0 px-4">
                            <div className="absolute inset-0 bg-amber-600/5 blur-[50px] rounded-full scale-125" />
                            <div className="bg-linear-to-br from-amber-600 to-amber-800 p-8 md:p-12 rounded-[3.5rem] shadow-2xl relative border-4 border-white/20">
                              <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-amber-950 px-12 py-3 rounded-full text-xs font-black text-amber-400 tracking-[0.5em] uppercase shadow-2xl border-2 border-white/10 z-20">
                                CHỦ ĐỀ HÙNG BIỆN
                              </div>
                              <div className="max-h-[40vh] overflow-y-auto custom-scrollbar px-2 space-y-10 py-2">
                                {questionsDb[selectedFlower.id].essays.map((essay, idx) => (
                                  <div key={idx} className="relative">
                                    {questionsDb[selectedFlower.id].essays.length > 1 && (
                                      <span className="text-[10px] font-black text-amber-200/30 uppercase tracking-[0.4em] block text-center mb-4">CHỦ ĐỀ {idx + 1}</span>
                                    )}
                                    <p className="text-2xl sm:text-3xl md:text-[2.4rem] font-black text-white leading-tight italic text-center drop-shadow-xl relative z-10 px-4">
                                      "{essay}"
                                    </p>
                                  </div>
                                ))}
                              </div>
                              {/* Decorative corner icon */}
                              <div className="absolute bottom-6 right-8 text-white/5 text-[8rem] rotate-12 select-none">🪶</div>
                            </div>
                          </div>

                          <div className="flex flex-col items-center gap-6 w-full px-4">
                            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 w-full">
                              <div className="glass-panel p-4 sm:p-6 rounded-3xl border-amber-200/50 w-full max-w-[220px] sm:max-w-xs flex flex-col items-center gap-2 sm:gap-3 shrink-0">
                                <span className="text-[10px] font-black text-amber-900/60 uppercase tracking-[0.4em]">ĐIỂM HÙNG BIỆN</span>
                                <input
                                  type="number"
                                  value={essayScoreInput}
                                  onChange={(e) => setEssayScoreInput(e.target.value)}
                                  className="w-full bg-amber-50 border-2 border-amber-200 rounded-2xl px-4 py-2 sm:py-3 text-amber-950 text-3xl sm:text-4xl font-black italic text-center outline-hidden focus:border-amber-500 transition-colors"
                                  placeholder="0"
                                />
                              </div>

                              <div className="flex flex-col items-center gap-2 sm:gap-4 bg-amber-50 px-6 sm:px-8 py-3 sm:py-5 rounded-3xl border border-amber-100 shadow-sm min-w-[200px] sm:min-w-[300px] shrink-0">
                                <div className="flex items-center gap-3">
                                  <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full animate-pulse ${essayTimeRemaining > 0 ? 'bg-amber-500' : 'bg-red-500'}`} />
                                  <p className="text-amber-900 font-black text-[9px] sm:text-xs tracking-[0.4em] uppercase italic">
                                    THỜI GIAN CHUẨN BỊ
                                  </p>
                                </div>
                                <span className="text-4xl sm:text-5xl font-mono font-black text-amber-600 tabular-nums">
                                  {Math.floor(essayTimeRemaining / 60).toString().padStart(2, '0')}:{(essayTimeRemaining % 60).toString().padStart(2, '0')}
                                </span>
                              </div>
                            </div>

                            <div className="w-full max-w-2xl flex flex-col items-center gap-6 sm:gap-10">
                              <div className="w-full h-4 bg-amber-900/5 rounded-full overflow-hidden border-2 border-white shadow-inner relative">
                                <motion.div
                                  initial={{ scaleX: 1 }}
                                  animate={{ scaleX: 0 }}
                                  transition={{ duration: 180, ease: "linear" }}
                                  className="absolute inset-0 w-full h-full bg-linear-to-r from-amber-600 to-amber-400 origin-right shadow-[0_0_20px_rgba(217,119,6,0.4)]"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </main>

                  {/* Elegant Footer Panel */}
                  <footer className="px-6 md:px-12 py-6 md:py-8 bg-amber-50/50 border-t border-amber-100 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-4">
                      <div className="flex -space-x-4">
                        {selectedFlower && questionsDb[selectedFlower.id].mcqs.map((_: any, s: number) => (
                          <div
                            key={s}
                            className={`w-4 h-4 rounded-full border-2 border-white ring-4 ring-transparent shadow-sm ${s <= currentQuestionIndex ? 'bg-amber-500' : 'bg-amber-200'
                              }`}
                          />
                        ))}
                      </div>
                      <span className="text-amber-900/30 text-sm font-black tracking-widest uppercase italic ml-4">
                        Hội thi lần thứ II • Học tập và làm theo Bác
                      </span>
                    </div>

                    {quizStep === 'essay' ? (
                      <button
                        onClick={nextQuestion}
                        className="px-16 py-7 rounded-[2rem] font-black text-3xl italic tracking-tighter flex items-center gap-6 transition-all shadow-2xl relative overflow-hidden group bg-red-600 text-white hover:bg-red-700 active:scale-95 shadow-red-900/30"
                      >
                        <span className="relative z-10 uppercase font-black">
                          KẾT THÚC
                        </span>
                        <motion.span
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ repeat: Infinity, duration: 1.5 }}
                          className="text-4xl"
                        >
                          ✓
                        </motion.span>
                      </button>
                    ) : (
                      <button
                        onClick={nextQuestion}
                        disabled={quizStep === 'quiz' && selectedAnswer === null}
                        className={`px-16 py-7 rounded-[2rem] font-black text-3xl italic tracking-tighter flex items-center gap-6 transition-all shadow-2xl relative overflow-hidden group ${quizStep === 'quiz' && selectedAnswer === null
                          ? 'bg-gray-100 text-gray-300 cursor-not-allowed border border-gray-200 opacity-50'
                          : 'bg-amber-950 text-amber-400 hover:bg-black active:scale-95 shadow-amber-900/30'
                          }`}
                      >
                        <span className="relative z-10 uppercase">
                          {quizStep === 'quiz' ? 'TIẾP THEO' : 'SANG CÂU TỰ LUẬN'}
                        </span>
                        <motion.span
                          animate={quizStep !== 'essay' && (quizStep !== 'quiz' || selectedAnswer !== null) ? { x: [0, 8, 0] } : {}}
                          transition={{ repeat: Infinity, duration: 1.2 }}
                          className="text-4xl"
                        >
                          →
                        </motion.span>
                      </button>
                    )}
                  </footer>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game Screen Footer */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-10 opacity-40">
        <div className="flex items-center gap-3 text-sm font-black tracking-[0.2em]">{formatTime(time)}</div>
        <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
        <div className="flex items-center gap-3 text-sm font-black tracking-[0.2em]">{formatDate(time)}</div>
      </div>
    </div>
  );

  const renderHomeScreen = () => (
    <div className="relative w-full h-screen overflow-hidden bg-red-950 font-sans text-white text-selection-yellow">
      {/* Background Layer: Softened with more atmosphere */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000 scale-110"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1596435308235-950e303f2780?q=80&w=2000&auto=format&fit=crop')`,
          filter: 'brightness(0.25) contrast(1.1) saturate(0.3)'
        }}
      />

      {/* Soft Layered Gradient Overlays */}
      <div className="absolute inset-0 bg-linear-to-b from-red-950/40 via-transparent to-black/95 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(185,28,28,0.25),transparent_75%)] pointer-events-none" />

      {/* Main Home Content */}
      <main className="relative w-full h-full flex flex-col items-center justify-center pt-6 px-10">

        {/* Symbolic LOTUS background center */}
        <motion.div
          initial={{ opacity: 0, scale: 1.2 }}
          animate={{ opacity: 0.12, scale: 1 }}
          transition={{ duration: 4 }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
        >
          <div className="text-[45rem] select-none">🪷</div>
        </motion.div>

        <div className="flex flex-col items-center z-10 text-center space-y-6 max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="flex flex-col items-center"
          >
            <div className="mb-6 bg-amber-500/5 border border-amber-500/20 px-8 py-2 rounded-full backdrop-blur-xl">
              <span className="text-amber-300/60 font-black text-[30px] tracking-[0.6em] uppercase">Đảng Ủy Trường Đại Học</span>
            </div>

            <h1 className="flex flex-col items-center">
              <span className="modern-title text-8xl md:text-9xl lg:text-[11rem] drop-shadow-[0_20px_50px_rgba(0,0,0,0.8)]">HÁI HOA</span>
              <div className="flex items-center justify-center gap-12 w-full my-6">
                <div className="title-accent flex-1" />
                <div className="w-5 h-5 rotate-45 border-4 border-amber-500/40 animate-pulse" />
                <div className="title-accent flex-1" />
              </div>
              <span className="modern-title text-8xl md:text-9xl lg:text-[11rem] drop-shadow-[0_20px_50px_rgba(0,0,0,0.8)]">DÂN CHỦ</span>
            </h1>

            <div className="mt-12 relative flex flex-col items-center gap-8">
              <div className="bg-linear-to-r from-red-950/80 via-red-900/80 to-red-950/80 px-14 py-6 rounded-[2rem] shadow-[0_40px_80px_rgba(0,0,0,0.9)] border border-amber-500/20 group relative overflow-hidden transition-all hover:border-amber-500/40">
                <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/5 to-transparent animate-shine -skew-x-12" />
                <span className="text-2xl md:text-3xl font-black text-white/90 italic drop-shadow-md block mb-3 tracking-normal">
                  Học tập và làm theo tư tưởng, đạo đức, phong cách Hồ Chí Minh
                </span>
                <div className="flex items-center justify-center gap-6">
                  <div className="h-px flex-1 bg-amber-500/20" />
                  <span className="text-xs font-black text-amber-500/80 text-[20px] tracking-[0.5em] uppercase">
                    LẦN THỨ II — NĂM 2026
                  </span>
                  <div className="h-px flex-1 bg-amber-500/20" />
                </div>
              </div>

              <div className="flex items-center gap-8 text-amber-600/40 font-black text-[10px] tracking-[0.4em] uppercase italic">
                <span>BẢN LĨNH</span>
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500/20" />
                <span>TRÍ TUỆ</span>
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500/20" />
                <span>TÂM HUYẾT</span>
              </div>
            </div>
          </motion.div>

          <div className="pt-4 flex flex-col items-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setScreen('game');
              }}
              className="group relative"
            >
              <div className="absolute -inset-10 bg-amber-500 rounded-full blur-3xl opacity-5 group-hover:opacity-15 transition-all duration-1000" />
              <div className="relative bg-linear-to-b from-amber-200 via-amber-500 to-amber-800 px-32 py-8 rounded-full border border-white/20 shadow-[0_30px_60px_rgba(0,0,0,0.8)] flex flex-col items-center min-w-[450px] transition-all group-hover:shadow-amber-500/10">
                <span className="text-5xl font-black text-amber-950 tracking-tighter uppercase italic drop-shadow-md">BẮT ĐẦU THI</span>
                <div className="mt-2 w-[80%] h-px bg-amber-950/10" />
                <span className="text-[12px] font-black text-amber-950/40 tracking-[0.7em] uppercase mt-1.5">Tiếp bước cha ông</span>
              </div>
            </motion.button>
          </div>
        </div>
      </main>

      {/* Global Footer */}
      <footer className="absolute bottom-0 left-0 w-full z-50 px-8 py-3 bg-black/60 backdrop-blur-3xl border-t border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-10">
          <div className="flex items-center gap-6 font-black text-[10px] tracking-widest text-yellow-500/60 uppercase italic">
            <span>{formatTime(time)}</span>
            <div className="w-1 h-1 rounded-full bg-white/10" />
            <span>{formatDate(time)}</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowConfigModal(true)}
            className="flex items-center gap-3 px-6 py-2 rounded-full bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-all cursor-pointer group"
          >
            <Settings size={14} className="text-amber-500 group-hover:rotate-90 transition-transform duration-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-500">Cấu hình</span>
          </button>
          <Volume2 size={16} className="text-white/20" />
          <button className="flex items-center gap-3 px-6 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-all cursor-pointer">
            <Maximize2 size={12} className="text-white/60" />
            <span className="text-[9px] font-black uppercase tracking-widest text-white/40">Giao diện Toàn màn hình</span>
          </button>
        </div>
      </footer>
    </div>
  );

  return (
    <>
      {screen === 'home' ? renderHomeScreen() : renderGameScreen()}

      {/* GLOBAL MODALS */}
      {/* Configuration Modal */}
      <AnimatePresence>
        {showConfigModal && (
          <ConfigModal
            onClose={() => setShowConfigModal(false)}
            teams={teams}
            setTeams={setTeams}
            flowers={flowers}
            setFlowers={setFlowers}
            questionsDb={questionsDb}
            setQuestionsDb={setQuestionsDb}
            teamScores={teamScores}
            setTeamScores={setTeamScores}
            setCompletedFlowerIds={setCompletedFlowerIds}
          />
        )}
      </AnimatePresence>

      {/* Team Selection Overlay */}
      <AnimatePresence>
        {showTeamModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-xl p-10"
          >
            <div className="max-w-4xl w-full">
              <h2 className="text-4xl font-black gold-text mb-12 text-center tracking-[0.2em] italic uppercase">Danh sách Thành viên tham gia</h2>
              <div className="grid grid-cols-3 gap-6">
                {teams.map((team, idx) => (
                  <motion.button
                    key={idx}
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setSelectedTeam(team);
                      setShowTeamModal(false);
                    }}
                    className={`p-10 rounded-[2rem] border-2 transition-all text-center ${selectedTeam === team ? 'bg-emerald-600/40 border-emerald-400 shadow-[0_0_40px_rgba(34,197,94,0.3)]' : 'bg-white/5 border-white/10 hover:border-amber-400/50 hover:bg-white/10'}`}
                  >
                    <span className={`text-2xl font-black italic tracking-widest ${selectedTeam === team ? 'text-white' : 'text-white/60'}`}>{team}</span>
                  </motion.button>
                ))}
              </div>
              <div className="mt-12 text-center">
                <button onClick={() => setShowTeamModal(false)} className="text-white/30 hover:text-white/60 font-black uppercase tracking-[0.4em] text-xs transition-colors">Đóng danh sách</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scoring Modal */}
      <AnimatePresence>
        {showScoringModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[250] flex items-center justify-center bg-black/90 backdrop-blur-3xl p-10"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="max-w-md w-full glass-panel p-10 rounded-[3rem] border-amber-500/30"
            >
              <h3 className="text-3xl font-black text-amber-500 mb-8 italic uppercase tracking-tighter text-center">Chấm điểm Hùng biện</h3>

              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-amber-200/40 uppercase tracking-[0.3em] mb-3 ml-2">Chọn Thành Viên</label>
                  <select
                    value={scoringTeam || ""}
                    onChange={(e) => setScoringTeam(e.target.value)}
                    className="w-full bg-white/5 border-2 border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-hidden focus:border-amber-500 transition-colors cursor-pointer appearance-none"
                  >
                    {teams.map(team => (
                      <option key={team} value={team} className="bg-black">{team}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-amber-200/40 uppercase tracking-[0.3em] mb-3 ml-2">Nhập số điểm</label>
                  <input
                    type="number"
                    value={essayScoreInput}
                    onChange={(e) => setEssayScoreInput(e.target.value)}
                    className="w-full bg-white/5 border-2 border-white/10 rounded-2xl px-6 py-4 text-white text-3xl font-black italic outline-hidden focus:border-amber-500 transition-colors"
                    placeholder="0"
                  />
                </div>

                <div className="flex gap-4 pt-6">
                  <button
                    onClick={() => setShowScoringModal(false)}
                    className="flex-1 py-4 rounded-2xl border border-white/10 bg-white/5 text-white/40 font-black uppercase text-xs tracking-widest hover:bg-white/10 transition-colors"
                  >
                    HỦY
                  </button>
                  <button
                    onClick={handleSaveScoring}
                    className="flex-1 py-4 rounded-2xl bg-amber-500 text-black font-black uppercase text-xs tracking-widest hover:bg-amber-400 transition-colors shadow-xl shadow-amber-500/20"
                  >
                    LƯU ĐIỂM
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Podium / Award Modal */}
      <AnimatePresence>
        {showPodiumModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] flex items-center justify-center bg-black/95 backdrop-blur-3xl overflow-y-auto pt-20 pb-40"
          >
            <button
              onClick={() => setShowPodiumModal(false)}
              className="absolute top-10 right-10 text-white/20 hover:text-white font-black text-5xl transition-colors cursor-pointer"
            >
              ✕
            </button>

            <div className="max-w-7xl w-full flex flex-col items-center relative pt-10">
              <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-center mb-60 relative z-50 pt-20"
              >
                <div className="inline-block px-10 py-3 bg-amber-500/10 border border-amber-500/20 rounded-full mb-4">
                  <span className="text-amber-500 font-black text-xs tracking-[0.5em] uppercase italic">LỄ TỔNG KẾT & TRAO GIẢI</span>
                </div>
                <h2 className="modern-title text-7xl md:text-8xl drop-shadow-[0_20px_50px_rgba(245,158,11,0.3)]">VINH DANH</h2>
              </motion.div>

              {/* The Podium */}
              <div className="flex items-end justify-center h-40 gap-8 w-full px-10 relative mt-32">
                {/* Fireworks effect container */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none -translate-y-60 scale-150">
                  {[...Array(20)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0, opacity: 0, x: (Math.random() - 0.5) * 800, y: Math.random() * 400 }}
                      animate={{
                        scale: [0, 1.2, 0.6],
                        opacity: [0, 1, 0],
                        x: (Math.random() - 0.5) * 1200,
                        y: Math.random() * -800
                      }}
                      transition={{
                        duration: 1.5 + Math.random() * 2,
                        repeat: Infinity,
                        delay: Math.random() * 3,
                        ease: "easeOut"
                      }}
                      className="absolute left-1/2 top-1/2 w-4 h-4 rounded-full blur-[1px]"
                      style={{
                        backgroundColor: ['#FBBF24', '#EF4444', '#F472B6', '#3B82F6', '#10B981', '#A78BFA'][i % 6],
                        boxShadow: '0 0 15px currentColor'
                      }}
                    />
                  ))}
                </div>

                {(() => {
                  const sorted = (Object.entries(teamScores) as [string, { points: number, time: number }][])
                    .sort((a, b) => {
                      if (b[1].points !== a[1].points) return b[1].points - a[1].points;
                      return a[1].time - b[1].time;
                    });
                  const top3 = [sorted[1], sorted[0], sorted[2]]; // 2nd, 1st, 3rd for visual order
                  const podiumHeights = ["h-[70%]", "h-[100%]", "h-[50%]"];
                  const podiumColors = ["bg-slate-400", "bg-amber-500", "bg-orange-700"];
                  const podiumLabels = ["GIẢI NHÌ", "GIẢI NHẤT", "GIẢI BA"];

                  return top3.map((team, i) => {
                    if (!team) return <div key={i} className="flex-1" />;
                    const is1st = i === 1;
                    return (
                      <motion.div
                        key={team[0]}
                        initial={{ y: 200, opacity: 0, scale: 0.8 }}
                        animate={{ y: 0, opacity: 1, scale: 1 }}
                        transition={{
                          delay: 0.8 + (i * 0.2),
                          type: 'spring',
                          damping: 12,
                          stiffness: 100
                        }}
                        className={`relative flex-1 flex flex-col items-center group/winner ${podiumHeights[i]}`}
                      >
                        {/* Score Info above Podium */}
                        <div className={`absolute ${is1st ? '-top-64' : '-top-52'} flex flex-col items-center text-center w-full px-4 z-50`}>
                          <motion.div
                            animate={is1st ? { y: [0, -20, 0], scale: [1, 1.1, 1] } : {}}
                            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                            className={`p-6 rounded-[2.5rem] bg-white/10 border-2 border-white/20 backdrop-blur-3xl mb-8 flex items-center justify-center ${is1st ? 'ring-8 ring-amber-500 shadow-[0_0_120px_rgba(245,158,11,0.9)] scale-150' : 'scale-110'}`}
                          >
                            <Trophy size={is1st ? 56 : 32} className={i === 0 ? 'text-slate-200' : is1st ? 'text-amber-400' : 'text-orange-400'} />
                          </motion.div>
                          <h4 className={`font-black italic tracking-tighter text-white mb-2 drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] leading-none ${is1st ? 'text-4xl md:text-6xl uppercase' : 'text-2xl md:text-3xl'}`}>
                            {team[0]}
                          </h4>
                          <div className="flex flex-col items-center">
                            <span className={`font-black text-amber-500 italic drop-shadow-lg ${is1st ? 'text-2xl md:text-3xl' : 'text-xl md:text-2xl'}`}>{team[1].points} ĐIỂM</span>
                            <span className="text-[10px] font-bold text-white/40 italic uppercase mt-1 tracking-widest bg-black/40 px-3 py-1 rounded-full border border-white/10">THỜI GIAN: {team[1].time}s</span>
                          </div>
                        </div>

                        {/* The Base */}
                        <div className={`w-full flex-1 rounded-t-[2.5rem] ${podiumColors[i]} shadow-[0_20px_100px_rgba(0,0,0,0.5)] relative overflow-hidden group border-x-4 border-t-8 border-white/25`}>
                          <div className="absolute inset-x-0 top-0 h-6 bg-white/30" />
                          <div className="absolute inset-0 bg-linear-to-b from-white/30 via-transparent to-black/40" />
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <span className="text-[10rem] md:text-[14rem] font-black text-black/10 italic -rotate-12 translate-y-12">{i === 1 ? '1' : i === 0 ? '2' : '3'}</span>
                          </div>
                          <div className="absolute bottom-10 inset-x-0 text-center">
                            <span className="text-black font-black text-xl md:text-2xl tracking-[0.5em] italic drop-shadow-[0_2px_4px_rgba(255,255,255,0.4)]">{podiumLabels[i]}</span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  });
                })()}
              </div>

              {/* Consolation Prizes */}
              <div className="mt-20 w-full px-20">
                <div className="flex items-center gap-6 mb-12">
                  <div className="h-px flex-1 bg-white/5" />
                  <span className="text-[10px] font-black text-white/30 tracking-[0.5em] uppercase italic">GIẢI KHUYẾN KHÍCH</span>
                  <div className="h-px flex-1 bg-white/5" />
                </div>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                  {(() => {
                    const sorted = (Object.entries(teamScores) as [string, { points: number, time: number }][])
                      .sort((a, b) => {
                        if (b[1].points !== a[1].points) return b[1].points - a[1].points;
                        return a[1].time - b[1].time;
                      });
                    const others = sorted.slice(3);
                    return others.map((team, i) => (
                      <motion.div
                        key={team[0]}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 1.5 + (i * 0.1) }}
                        className="bg-white/5 border border-white/5 rounded-2xl p-6 flex flex-col items-center text-center hover:bg-white/10 transition-all group"
                      >
                        <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-500 text-xs font-black mb-4 group-hover:scale-110 transition-transform">
                          🎗️
                        </div>
                        <span className="text-white/60 font-black text-sm mb-1 italic truncate w-full">{team[0]}</span>
                        <span className="text-amber-500/50 font-black text-xs italic">{team[1].points} đ</span>
                      </motion.div>
                    ));
                  })()}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function SidebarButton({ icon, text, color }: { icon: ReactNode, text: string, color: string }) {
  return (
    <motion.button
      whileHover={{ scale: 1.05, x: 10 }}
      className={`flex items-center gap-5 px-6 py-3 bg-linear-to-r ${color} rounded-2xl border border-white/10 shadow-2xl min-w-[240px] text-left group transition-all cursor-pointer`}
    >
      <div className="bg-black/30 p-2.5 rounded-xl group-hover:scale-110 transition-transform shadow-inner">
        {icon}
      </div>
      <span className="font-black text-xs md:text-sm tracking-[0.15em] text-white/90 drop-shadow-md">{text}</span>
    </motion.button>
  );
}

function ConfigModal({
  onClose,
  teams, setTeams,
  flowers, setFlowers,
  questionsDb, setQuestionsDb,
  teamScores, setTeamScores,
  setCompletedFlowerIds
}: {
  onClose: () => void,
  teams: string[], setTeams: any,
  flowers: any[], setFlowers: any,
  questionsDb: any, setQuestionsDb: any,
  teamScores: any, setTeamScores: any,
  setCompletedFlowerIds: any
}) {
  const [activeTab, setActiveTab] = useState<'teams' | 'flowers' | 'questions' | 'data'>('teams');

  // Specific state for Member/Team editing
  const [editingTeamIdx, setEditingTeamIdx] = useState<number | null>(null);
  const [deletingTeamIdx, setDeletingTeamIdx] = useState<number | null>(null);
  const [isAddingTeam, setIsAddingTeam] = useState(false);
  const [tempName, setTempName] = useState("");

  // Specific state for Question editing
  const [selectedFlowerId, setSelectedFlowerId] = useState<number>(0);
  const [deletingFlowerId, setDeletingFlowerId] = useState<number | null>(null);
  const [editingFlowerId, setEditingFlowerId] = useState<number | null>(null);
  const [deletingMcqIdx, setDeletingMcqIdx] = useState<number | null>(null);
  const [deletingEssayIdx, setDeletingEssayIdx] = useState<number | null>(null);
  const [isAddingFlower, setIsAddingFlower] = useState(false);
  const [newFlowerForm, setNewFlowerForm] = useState({
    name: "",
    icon: "🌸",
    x: "50%",
    y: "50%",
    numQuestions: 5,
    numEssays: 1
  });

  const handleImageUpload = (file: File, callback: (dataUrl: string) => void) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const maxDim = 400;
        let w = img.width;
        let h = img.height;
        if (w > maxDim || h > maxDim) {
          if (w > h) { h = (h / w) * maxDim; w = maxDim; }
          else { w = (w / h) * maxDim; h = maxDim; }
        }

        canvas.width = w;
        canvas.height = h;
        ctx.drawImage(img, 0, 0, w, h);

        const imageData = ctx.getImageData(0, 0, w, h);
        const data = imageData.data;
        const br = data[0], bg = data[1], bb = data[2];

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i], g = data[i + 1], b = data[i + 2];
          const isWhite = r > 240 && g > 240 && b > 240;
          const isBlack = r < 20 && g < 20 && b < 20;
          const isBg = Math.abs(r - br) < 30 && Math.abs(g - bg) < 30 && Math.abs(b - bb) < 30;
          if (isWhite || isBlack || isBg) data[i + 3] = 0;
        }

        ctx.putImageData(imageData, 0, 0);
        callback(canvas.toDataURL('image/png'));
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (!selectedFlowerId && flowers.length > 0) {
      setSelectedFlowerId(flowers[0].id);
    } else if (selectedFlowerId && !flowers.find(f => f.id === selectedFlowerId)) {
      setSelectedFlowerId(flowers[0]?.id || 0);
    }
  }, [flowers, selectedFlowerId]);

  const exportData = () => {
    const data = { teams, flowers, questionsDb, teamScores };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hhd-config-${new Date().getTime()}.json`;
    a.click();
  };

  const importData = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.teams) setTeams(data.teams);
        if (data.flowers) setFlowers(data.flowers);
        if (data.questionsDb) setQuestionsDb(data.questionsDb);
        if (data.teamScores) setTeamScores(data.teamScores);
        alert("Nhập dữ liệu thành công!");
      } catch (err) {
        alert("Lỗi nhập dữ liệu: File không đúng định dạng");
      }
    };
    reader.readAsText(file);
  };

  const resetAll = () => {
    if (confirm("Reset toàn bộ lời thi và điểm số? (Cấu hình bộ câu hỏi vẫn giữ nguyên)")) {
      setTeamScores(Object.fromEntries(teams.map(t => [t, { points: 0, time: 0 }])));
      setCompletedFlowerIds([]);
      alert("Đã reset!");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[500] flex items-center justify-center bg-black/95 backdrop-blur-xl p-6 md:p-12 overflow-hidden"
    >
      <div className="max-w-6xl w-full h-full bg-white/5 border border-white/10 rounded-[3rem] overflow-hidden flex flex-col shadow-2xl shadow-black">
        <header className="p-8 border-b border-white/5 flex items-center justify-between bg-black/20">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-500/20 rounded-2xl text-amber-500">
              <Settings size={28} />
            </div>
            <div>
              <h2 className="text-3xl font-black italic tracking-tighter text-white uppercase leading-none">Cấu hình Hệ thống</h2>
              <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mt-2 block">Quản trị viên cuộc thi</span>
            </div>
          </div>
          <button onClick={onClose} className="w-14 h-14 rounded-2xl bg-white/5 hover:bg-white/10 transition-all text-white/40 hover:text-white flex items-center justify-center text-2xl font-bold">✕</button>
        </header>

        <div className="flex-1 flex overflow-hidden">
          {/* Tabs Sidebar */}
          <aside className="w-72 border-r border-white/5 p-8 flex flex-col gap-3 bg-black/10">
            {[
              { id: 'teams', label: 'Thành viên', icon: <Users size={20} /> },
              { id: 'flowers', label: 'Các bông hoa', icon: <Flower size={20} /> },
              { id: 'questions', label: 'Bộ câu hỏi', icon: <FileText size={20} /> },
              { id: 'data', label: 'Dữ liệu & Reset', icon: <Save size={20} /> },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-4 px-6 py-5 rounded-[1.5rem] font-black italic text-sm transition-all text-left uppercase tracking-widest ${activeTab === tab.id ? 'bg-amber-500 text-black shadow-2xl shadow-amber-500/20 scale-[1.02]' : 'text-white/20 hover:bg-white/5 hover:text-white'}`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}

            <div className="mt-auto p-6 rounded-3xl bg-white/5 border border-white/5">
              <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em] leading-relaxed">
                Hệ thống quản lý dữ liệu trực tiếp. <br />
                Mọi thay đổi sẽ được lưu tự động.
              </p>
              <div className="mt-4 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Đang kết nối & Đồng bộ</span>
              </div>
            </div>

            <div className="mt-4">
              <button
                onClick={onClose}
                className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-emerald-900/40 transition-all flex items-center justify-center gap-3"
              >
                <Save size={18} /> LƯU & HOÀN TẤT
              </button>
            </div>
          </aside>

          {/* Content Area */}
          <main className="flex-1 p-12 overflow-y-auto custom-scrollbar bg-black/5">
            {activeTab === 'teams' && (
              <div className="space-y-8 animate-in fade-in duration-500">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-black italic text-amber-500 uppercase tracking-tighter">Quản lý Thành viên</h3>
                    <p className="text-white/30 text-xs mt-1">Danh sách các đơn vị tham gia hội thi ({teams.length})</p>
                  </div>
                  {!isAddingTeam && (
                    <button
                      onClick={() => {
                        setIsAddingTeam(true);
                        setTempName("");
                      }}
                      className="flex items-center gap-3 bg-amber-500 text-black px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-amber-500/20"
                    >
                      <PlusCircle size={18} /> Thêm thành viên
                    </button>
                  )}
                </div>

                {isAddingTeam && (
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="p-10 bg-amber-500/10 rounded-[3rem] border-2 border-amber-500/20 space-y-6"
                  >
                    <div className="flex items-center gap-4 mb-2">
                      <div className="p-3 bg-amber-500 rounded-2xl text-black"><Users size={24} /></div>
                      <h4 className="text-xl font-black text-white italic uppercase tracking-widest">Thêm Thành Viên Mới</h4>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-amber-500/60 uppercase tracking-[0.4em] ml-2">Tên Đơn vị / Thành viên:</label>
                      <input
                        autoFocus
                        value={tempName}
                        onChange={(e) => setTempName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && tempName) {
                            setTeams([...teams, tempName]);
                            setTeamScores((prev: any) => ({ ...prev, [tempName]: { points: 0, time: 0 } }));
                            setIsAddingTeam(false);
                          }
                        }}
                        className="w-full bg-black/40 border-2 border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-hidden focus:border-amber-500 transition-all text-xl"
                        placeholder="Nhập tên đơn vị..."
                      />
                    </div>
                    <div className="flex gap-4">
                      <button
                        onClick={() => {
                          if (tempName) {
                            setTeams([...teams, tempName]);
                            setTeamScores((prev: any) => ({ ...prev, [tempName]: { points: 0, time: 0 } }));
                            setIsAddingTeam(false);
                          }
                        }}
                        className="flex-1 bg-amber-500 text-black py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-amber-500/20"
                      >Xác nhận</button>
                      <button
                        onClick={() => setIsAddingTeam(false)}
                        className="flex-1 bg-white/5 text-white/40 py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-white/10 transition-all"
                      >Hủy</button>
                    </div>
                  </motion.div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  {teams.map((team, idx) => (
                    <div key={idx} className="bg-white/5 p-6 rounded-[2rem] flex items-center justify-between group border border-white/5 hover:border-amber-500/30 hover:bg-white/10 transition-all">
                      <div className="flex items-center gap-4 flex-1">
                        <span className="text-[10px] font-black text-white/20 italic">{idx + 1}</span>
                        {editingTeamIdx === idx ? (
                          <input
                            autoFocus
                            value={tempName}
                            onChange={(e) => setTempName(e.target.value)}
                            onBlur={() => {
                              if (tempName && tempName !== team) {
                                const newTeams = [...teams];
                                newTeams[idx] = tempName;
                                setTeams(newTeams);
                                setTeamScores((prev: any) => {
                                  const next = { ...prev };
                                  next[tempName] = next[team];
                                  delete next[team];
                                  return next;
                                });
                              }
                              setEditingTeamIdx(null);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') e.currentTarget.blur();
                            }}
                            className="bg-black/40 border border-amber-500 text-white px-3 py-1 rounded-lg font-bold outline-hidden w-full max-w-[200px]"
                          />
                        ) : (
                          <span className="font-black italic text-white/80 group-hover:text-amber-500 transition-colors uppercase tracking-widest text-sm">{team}</span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {deletingTeamIdx === idx ? (
                          <div className="flex items-center gap-2 animate-in fade-in zoom-in duration-300">
                            <span className="text-[9px] font-black text-red-500 uppercase tracking-widest mr-2">Xóa?</span>
                            <button
                              onClick={() => {
                                setTeams(teams.filter(t => t !== team));
                                setTeamScores((prev: any) => {
                                  const next = { ...prev };
                                  delete next[team];
                                  return next;
                                });
                                setDeletingTeamIdx(null);
                              }}
                              className="px-4 py-2 bg-red-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shadow-lg shadow-red-900/40"
                            >XÓA</button>
                            <button
                              onClick={() => setDeletingTeamIdx(null)}
                              className="px-4 py-2 bg-white/10 text-white/40 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-white/20 transition-all"
                            >HỦY</button>
                          </div>
                        ) : (
                          <>
                            <button
                              onClick={() => {
                                const points = prompt("Sửa điểm:", (teamScores[team]?.points || 0).toString());
                                const time = prompt("Sửa thời gian (giây):", (teamScores[team]?.time || 0).toString());
                                if (points !== null || time !== null) {
                                  setTeamScores((prev: any) => ({
                                    ...prev,
                                    [team]: {
                                      points: points !== null ? parseFloat(points) : (prev[team]?.points || 0),
                                      time: time !== null ? parseInt(time) : (prev[team]?.time || 0)
                                    }
                                  }));
                                }
                              }}
                              className="px-4 py-2 bg-amber-500/10 hover:bg-amber-500 text-amber-500 hover:text-black rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border border-amber-500/20"
                              title="Thiết lập điểm BGK"
                            >BGK</button>
                            <button
                              onClick={() => {
                                setEditingTeamIdx(idx);
                                setTempName(team);
                              }}
                              className="w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-blue-500/20 text-white/30 hover:text-blue-400 rounded-xl transition-all"
                            ><Edit2 size={16} /></button>
                            <button
                              onClick={() => setDeletingTeamIdx(idx)}
                              className="w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-red-500/20 text-white/30 hover:text-red-400 rounded-xl transition-all"
                            ><Trash2 size={16} /></button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'flowers' && (
              <div className="space-y-8 animate-in fade-in duration-500">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-black italic text-amber-500 uppercase tracking-tighter">Quản lý Bông hoa</h3>
                    <p className="text-white/30 text-xs mt-1">Các bông hoa trên cây hái hoa ({flowers.length})</p>
                  </div>
                  {!isAddingFlower && (
                    <button
                      onClick={() => {
                        setIsAddingFlower(true);
                        setNewFlowerForm({
                          name: "",
                          icon: "🌸",
                          x: `${Math.floor(Math.random() * 60 + 20)}%`,
                          y: `${Math.floor(Math.random() * 60 + 20)}%`,
                          numQuestions: 5,
                          numEssays: 1
                        });
                      }}
                      className="flex items-center gap-3 bg-amber-500 text-black px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-amber-500/20"
                    >
                      <PlusCircle size={18} /> Thêm hoa mới
                    </button>
                  )}
                </div>

                {isAddingFlower && (
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="p-8 bg-amber-500/10 rounded-[2.5rem] border-2 border-amber-500/20 space-y-6"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-500 rounded-xl text-black"><PlusCircle size={20} /></div>
                        <h4 className="text-lg font-black text-white italic uppercase tracking-widest">Thêm Bông Hoa Mới</h4>
                      </div>
                      <button
                        onClick={() => setIsAddingFlower(false)}
                        className="text-white/20 hover:text-white transition-colors"
                      >
                        Đóng
                      </button>
                    </div>

                    <div className="flex gap-8">
                      <div className="relative group shrink-0">
                        <FlowerIconDisplay
                          icon={newFlowerForm.icon}
                          size="md"
                          className="border-3 border-amber-500/30 bg-black/60 shadow-xl"
                        />
                        <label className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-[25%] border-2 border-dashed border-amber-500">
                          <Upload size={24} className="text-amber-500" />
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleImageUpload(file, (dataUrl) => setNewFlowerForm({ ...newFlowerForm, icon: dataUrl }));
                            }}
                          />
                        </label>
                      </div>

                      <div className="flex-1 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[9px] font-black text-amber-500/50 uppercase tracking-widest ml-1">Tên Bông Hoa</label>
                            <input
                              autoFocus
                              value={newFlowerForm.name}
                              onChange={(e) => setNewFlowerForm({ ...newFlowerForm, name: e.target.value })}
                              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white font-bold outline-hidden focus:border-amber-500 transition-all text-sm"
                              placeholder="Vd: Hoa Hồng..."
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[9px] font-black text-amber-500/50 uppercase tracking-widest ml-1">Emoji / Icon</label>
                            <input
                              value={newFlowerForm.icon}
                              onChange={(e) => setNewFlowerForm({ ...newFlowerForm, icon: e.target.value })}
                              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white font-bold outline-hidden focus:border-amber-500 transition-all text-sm"
                              placeholder="🌸, 🏵️..."
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-4 gap-3">
                          <div className="col-span-2 space-y-1.5">
                            <label className="text-[8px] font-black text-amber-500/40 uppercase tracking-widest ml-1">Vị trí trực quan (Bấm để chọn)</label>
                            <div
                              className="h-24 bg-black/60 rounded-xl border border-white/10 relative cursor-crosshair overflow-hidden group/map"
                              onClick={(e) => {
                                const rect = e.currentTarget.getBoundingClientRect();
                                const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
                                const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
                                setNewFlowerForm({ ...newFlowerForm, x: `${x}%`, y: `${y}%` });
                              }}
                            >
                              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(16,185,129,0.1),transparent)]" />
                              {/* Preview Dot */}
                              <motion.div
                                animate={{
                                  left: newFlowerForm.x,
                                  top: newFlowerForm.y
                                }}
                                className="absolute w-3 h-3 bg-amber-500 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)] -translate-x-1/2 -translate-y-1/2 z-10"
                              />
                              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/map:opacity-100 transition-opacity pointer-events-none">
                                <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Bố cục cây hái hoa</span>
                              </div>
                            </div>
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[8px] font-black text-amber-500/40 uppercase tracking-widest ml-1">Vị trí X</label>
                            <input
                              value={newFlowerForm.x}
                              onChange={(e) => setNewFlowerForm({ ...newFlowerForm, x: e.target.value })}
                              className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white font-bold outline-hidden focus:border-amber-500 transition-all text-xs text-center"
                              placeholder="50%"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[8px] font-black text-amber-500/40 uppercase tracking-widest ml-1">Vị trí Y</label>
                            <input
                              value={newFlowerForm.y}
                              onChange={(e) => setNewFlowerForm({ ...newFlowerForm, y: e.target.value })}
                              className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white font-bold outline-hidden focus:border-amber-500 transition-all text-xs text-center"
                              placeholder="50%"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[8px] font-black text-amber-500/40 uppercase tracking-widest ml-1">Số Trắc nghiệm</label>
                            <input
                              type="number"
                              value={newFlowerForm.numQuestions}
                              onChange={(e) => setNewFlowerForm({ ...newFlowerForm, numQuestions: parseInt(e.target.value) || 0 })}
                              className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white font-bold outline-hidden focus:border-amber-500 transition-all text-xs text-center"
                              min="1"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[8px] font-black text-amber-500/40 uppercase tracking-widest ml-1">Số Tự luận</label>
                            <input
                              type="number"
                              value={newFlowerForm.numEssays}
                              onChange={(e) => setNewFlowerForm({ ...newFlowerForm, numEssays: parseInt(e.target.value) || 0 })}
                              className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white font-bold outline-hidden focus:border-amber-500 transition-all text-xs text-center"
                              min="1"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          if (newFlowerForm.name && newFlowerForm.icon) {
                            const id = flowers.length > 0 ? Math.max(...flowers.map(f => f.id)) + 1 : 1;
                            const newFlower = {
                              id,
                              name: newFlowerForm.name,
                              icon: newFlowerForm.icon,
                              color: "#FFFFFF",
                              x: newFlowerForm.x.includes('%') ? newFlowerForm.x : `${newFlowerForm.x}%`,
                              y: newFlowerForm.y.includes('%') ? newFlowerForm.y : `${newFlowerForm.y}%`
                            };
                            setFlowers([...flowers, newFlower]);
                            setQuestionsDb((prev: any) => ({
                              ...prev,
                              [id]: {
                                mcqs: Array(newFlowerForm.numQuestions).fill(null).map(() => ({
                                  q: "Câu hỏi mới",
                                  a: ["Phương án A", "Phương án B", "Phương án C", "Phương án D"],
                                  correct: 0
                                })),
                                essays: Array(newFlowerForm.numEssays).fill("Chủ đề tự luận mới")
                              }
                            }));
                            setSelectedFlowerId(id);
                            setIsAddingFlower(false);
                            setActiveTab('questions');
                          }
                        }}
                        className="flex-1 bg-amber-500 text-black py-3 rounded-xl font-black uppercase tracking-widest text-xs hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-amber-500/20"
                      >Tạo Bông Hoa Mới</button>
                      <button
                        onClick={() => setIsAddingFlower(false)}
                        className="px-6 bg-white/5 text-white/40 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-white/10 transition-all border border-white/5"
                      >Hủy</button>
                    </div>
                  </motion.div>
                )}
                <div className="grid grid-cols-1 gap-4">
                  {flowers.map((flower) => (
                    <div key={flower.id} className="bg-white/5 p-6 rounded-[2.5rem] border border-white/5 hover:border-amber-500/30 transition-all group">
                      <div className="flex items-center gap-6 mb-6">
                        <FlowerIconDisplay
                          icon={flower.icon}
                          size="md"
                          className="bg-black/40 shadow-inner"
                        />
                        <div className="flex-1 cursor-pointer" onClick={() => {
                          setSelectedFlowerId(flower.id);
                          setActiveTab('questions');
                        }}>
                          <div className="flex items-center gap-3 mb-1">
                            <h4 className="text-xl font-black text-white italic uppercase tracking-widest">{flower.name}</h4>
                            <span className="text-[10px] font-black text-amber-500/40 uppercase tracking-widest px-2 py-0.5 border border-amber-500/20 rounded-full">ID: {flower.id}</span>
                          </div>
                          <div className="flex gap-4">
                            <div className="text-[10px] font-black text-white/20 uppercase tracking-widest flex items-center gap-1">
                              <Layout size={10} /> X: {flower.x} Y: {flower.y}
                            </div>
                            <div className="text-[10px] font-black text-white/20 uppercase tracking-widest flex items-center gap-1">
                              <FileText size={10} /> {questionsDb[flower.id]?.mcqs.length || 0} câu hỏi
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          {deletingFlowerId === flower.id ? (
                            <div className="flex items-center gap-2 animate-in fade-in zoom-in duration-300">
                              <span className="text-[10px] font-black text-red-500 uppercase tracking-widest mr-2">Xác nhận xóa?</span>
                              <button
                                onClick={() => {
                                  setFlowers(flowers.filter(f => f.id !== flower.id));
                                  setQuestionsDb((prev: any) => {
                                    const next = { ...prev };
                                    delete next[flower.id];
                                    return next;
                                  });
                                  setDeletingFlowerId(null);
                                }}
                                className="px-6 py-3 bg-red-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-red-900/40"
                              >XÓA</button>
                              <button
                                onClick={() => setDeletingFlowerId(null)}
                                className="px-6 py-3 bg-white/10 text-white/40 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/20 transition-all"
                              >HỦY</button>
                            </div>
                          ) : editingFlowerId === flower.id ? (
                            <button
                              onClick={() => setEditingFlowerId(null)}
                              className="px-4 py-3 bg-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-widest"
                            >ĐÓNG</button>
                          ) : (
                            <>
                              <div className="relative group/pos flex flex-col items-center">
                                <div
                                  className="w-24 h-12 bg-black/60 rounded-xl border border-white/10 relative cursor-crosshair overflow-hidden hover:border-amber-500/50 transition-colors"
                                  title="Bấm để đổi vị trí nhanh"
                                  onClick={(e) => {
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    const nx = Math.round(((e.clientX - rect.left) / rect.width) * 100);
                                    const ny = Math.round(((e.clientY - rect.top) / rect.height) * 100);
                                    setFlowers((prev: any) => prev.map((f: any) => f.id === flower.id ? { ...f, x: `${nx}%`, y: `${ny}%` } : f));
                                  }}
                                >
                                  <div className="absolute w-2 h-2 bg-amber-500 rounded-full -translate-x-1/2 -translate-y-1/2 shadow-lg" style={{ left: flower.x, top: flower.y }} />
                                </div>
                                <span className="text-[8px] font-black text-white/20 uppercase tracking-widest mt-1">ĐỔI VỊ TRÍ</span>
                              </div>

                              <button
                                onClick={() => setEditingFlowerId(flower.id)}
                                className="px-4 py-3 bg-white/5 hover:bg-blue-500 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] text-white/40 transition-all border border-white/10 hover:border-blue-500 self-center"
                              >SỬA</button>
                              <button
                                onClick={() => setDeletingFlowerId(flower.id)}
                                className="w-12 h-12 flex items-center justify-center bg-white/5 hover:bg-red-500 text-white/20 hover:text-white rounded-2xl transition-all border border-white/10 hover:border-red-600 self-center"
                              ><Trash2 size={20} /></button>
                            </>
                          )}
                        </div>
                      </div>

                      {editingFlowerId === flower.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          className="border-t border-white/10 pt-6 mt-2 space-y-6 overflow-hidden"
                        >
                          <div className="flex gap-8">
                            <div className="relative group shrink-0">
                              <FlowerIconDisplay
                                icon={flower.icon}
                                size="md"
                                className="border-3 border-blue-500/30 bg-black/60 shadow-xl"
                              />
                              <label className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-[25%] border-2 border-dashed border-blue-500">
                                <Upload size={24} className="text-blue-500" />
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleImageUpload(file, (dataUrl) => {
                                      setFlowers(prev => prev.map(f => f.id === flower.id ? { ...f, icon: dataUrl } : f));
                                    });
                                  }}
                                />
                              </label>
                            </div>

                            <div className="flex-1 space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                  <label className="text-[9px] font-black text-blue-500/50 uppercase tracking-widest ml-1">Tên Bông Hoa</label>
                                  <input
                                    value={flower.name}
                                    onChange={(e) => setFlowers(prev => prev.map(f => f.id === flower.id ? { ...f, name: e.target.value } : f))}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white font-bold outline-hidden focus:border-blue-500 transition-all text-sm"
                                  />
                                </div>
                                <div className="space-y-1.5">
                                  <label className="text-[9px] font-black text-blue-500/50 uppercase tracking-widest ml-1">Emoji / Icon</label>
                                  <input
                                    value={flower.icon}
                                    onChange={(e) => setFlowers(prev => prev.map(f => f.id === flower.id ? { ...f, icon: e.target.value } : f))}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white font-bold outline-hidden focus:border-blue-500 transition-all text-sm"
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-4 gap-3">
                                <div className="col-span-2 space-y-1.5">
                                  <label className="text-[8px] font-black text-blue-500/40 uppercase tracking-widest ml-1">Vị trí trực quan (Bấm để chọn)</label>
                                  <div
                                    className="h-24 bg-black/60 rounded-xl border border-white/10 relative cursor-crosshair overflow-hidden group/map"
                                    onClick={(e) => {
                                      const rect = e.currentTarget.getBoundingClientRect();
                                      const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
                                      const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
                                      setFlowers(prev => prev.map(f => f.id === flower.id ? { ...f, x: `${x}%`, y: `${y}%` } : f));
                                    }}
                                  >
                                    <div className="absolute w-3 h-3 bg-blue-500 rounded-full shadow-lg -translate-x-1/2 -translate-y-1/2" style={{ left: flower.x, top: flower.y }} />
                                  </div>
                                </div>
                                <div className="space-y-1.5">
                                  <label className="text-[8px] font-black text-blue-500/40 uppercase tracking-widest ml-1">Vị trí X</label>
                                  <input
                                    value={flower.x}
                                    onChange={(e) => setFlowers(prev => prev.map(f => f.id === flower.id ? { ...f, x: e.target.value } : f))}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white font-bold outline-hidden focus:border-blue-500 transition-all text-xs text-center"
                                  />
                                </div>
                                <div className="space-y-1.5">
                                  <label className="text-[8px] font-black text-blue-500/40 uppercase tracking-widest ml-1">Vị trí Y</label>
                                  <input
                                    value={flower.y}
                                    onChange={(e) => setFlowers(prev => prev.map(f => f.id === flower.id ? { ...f, y: e.target.value } : f))}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white font-bold outline-hidden focus:border-blue-500 transition-all text-xs text-center"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'questions' && (
              <div className="space-y-8 animate-in fade-in duration-500">
                <div>
                  <h3 className="text-2xl font-black italic text-amber-500 uppercase tracking-tighter">Ngân hàng Câu hỏi</h3>
                  <p className="text-white/30 text-xs mt-1">Thiết lập câu hỏi Trắc nghiệm và Tự luận cho từng bông hoa</p>
                </div>

                <div className="flex flex-col gap-4">
                  <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] ml-2">Chọn Bông Hoa:</label>
                  <div className="flex flex-wrap gap-3">
                    {flowers.map(f => (
                      <button
                        key={f.id}
                        onClick={() => setSelectedFlowerId(f.id)}
                        className={`flex items-center gap-3 px-4 py-2 rounded-2xl font-black italic text-xs transition-all uppercase tracking-widest border ${selectedFlowerId === f.id ? 'bg-amber-500 text-black border-amber-400 shadow-xl shadow-amber-500/20' : 'bg-white/5 text-white/40 border-white/5 hover:bg-white/10'}`}
                      >
                        <FlowerIconDisplay icon={f.icon} size="sm" className="rounded-lg shadow-sm" />
                        <span>{f.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {selectedFlowerId && questionsDb[selectedFlowerId] ? (
                  <div className="space-y-8 animate-in slide-in-from-bottom-8 duration-700 pb-20">
                    <div className="p-10 bg-white/5 rounded-[3rem] border-2 border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
                      <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                          <FileText className="text-amber-500" size={24} />
                          <h4 className="text-lg font-black text-amber-500 uppercase tracking-[0.3em] italic">Chủ đề Hùng biện ({questionsDb[selectedFlowerId].essays.length})</h4>
                        </div>
                        <button
                          onClick={() => {
                            setQuestionsDb((prev: any) => ({
                              ...prev,
                              [selectedFlowerId]: {
                                ...prev[selectedFlowerId],
                                essays: [...prev[selectedFlowerId].essays, "Chủ đề tự luận mới"]
                              }
                            }));
                          }}
                          className="bg-amber-500/10 hover:bg-amber-500 text-amber-500 hover:text-black px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2"
                        >
                          <Plus size={14} /> Thêm chủ đề
                        </button>
                      </div>
                      <div className="space-y-4">
                        {questionsDb[selectedFlowerId].essays.map((essay: string, eIdx: number) => (
                          <div key={eIdx} className="relative group">
                            {deletingEssayIdx === eIdx ? (
                              <div className="absolute inset-0 bg-red-500/10 backdrop-blur-sm rounded-[2rem] z-20 flex items-center justify-center gap-4 animate-in fade-in duration-300">
                                <span className="text-white font-black text-sm uppercase tracking-widest">Xóa chủ đề này?</span>
                                <button
                                  onClick={() => {
                                    setQuestionsDb((prev: any) => {
                                      const newEssays = [...prev[selectedFlowerId].essays];
                                      newEssays.splice(eIdx, 1);
                                      return {
                                        ...prev,
                                        [selectedFlowerId]: {
                                          ...prev[selectedFlowerId],
                                          essays: newEssays
                                        }
                                      };
                                    });
                                    setDeletingEssayIdx(null);
                                  }}
                                  className="bg-red-500 text-white px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest"
                                >XÓA</button>
                                <button
                                  onClick={() => setDeletingEssayIdx(null)}
                                  className="bg-white/10 text-white/60 px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest"
                                >HỦY</button>
                              </div>
                            ) : null}
                            <textarea
                              value={essay}
                              onChange={(e) => {
                                setQuestionsDb((prev: any) => {
                                  const newEssays = [...prev[selectedFlowerId].essays];
                                  newEssays[eIdx] = e.target.value;
                                  return {
                                    ...prev,
                                    [selectedFlowerId]: {
                                      ...prev[selectedFlowerId],
                                      essays: newEssays
                                    }
                                  };
                                });
                              }}
                              className="w-full bg-black/40 border-2 border-white/5 rounded-[2rem] p-8 text-white text-xl font-black italic outline-hidden focus:border-amber-500 min-h-[120px] shadow-inner transition-all focus:bg-black/60 pr-16"
                              placeholder={`Nội dung câu hỏi hùng biện ${eIdx + 1}...`}
                            />
                            {questionsDb[selectedFlowerId].essays.length > 1 && (
                              <button
                                onClick={() => setDeletingEssayIdx(eIdx)}
                                className="absolute top-6 right-6 p-2 text-white/10 hover:text-red-500 transition-colors"
                              >
                                <Trash2 size={20} />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-6 pt-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-amber-500/20 rounded-xl text-amber-500"><Settings size={18} /></div>
                          <h4 className="text-lg font-black text-amber-500 uppercase tracking-[0.3em] italic">Bộ câu hỏi trắc nghiệm ({questionsDb[selectedFlowerId].mcqs.length})</h4>
                        </div>
                        <button
                          onClick={() => {
                            setQuestionsDb((prev: any) => ({
                              ...prev,
                              [selectedFlowerId]: {
                                ...prev[selectedFlowerId],
                                mcqs: [...prev[selectedFlowerId].mcqs, {
                                  q: "Câu hỏi mới",
                                  a: ["Phương án A", "Phương án B", "Phương án C", "Phương án D"],
                                  correct: 0
                                }]
                              }
                            }));
                          }}
                          className="bg-amber-500 text-black px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-amber-500/20 flex items-center gap-2"
                        >
                          <Plus size={16} /> Thêm câu hỏi
                        </button>
                      </div>

                      {questionsDb[selectedFlowerId].mcqs.map((q: any, qIdx: number) => (
                        <div key={qIdx} className="p-10 bg-black/30 rounded-[3rem] border-2 border-white/5 space-y-8 group hover:border-amber-500/20 transition-all relative">
                          {deletingMcqIdx === qIdx ? (
                            <div className="absolute inset-0 bg-red-500/10 backdrop-blur-sm rounded-[3rem] z-20 flex items-center justify-center gap-4 animate-in fade-in duration-300">
                              <span className="text-white font-black text-sm uppercase tracking-widest">Xóa câu hỏi {qIdx + 1}?</span>
                              <button
                                onClick={() => {
                                  setQuestionsDb((prev: any) => {
                                    const newMcqs = [...prev[selectedFlowerId].mcqs];
                                    newMcqs.splice(qIdx, 1);
                                    return {
                                      ...prev,
                                      [selectedFlowerId]: {
                                        ...prev[selectedFlowerId],
                                        mcqs: newMcqs
                                      }
                                    };
                                  });
                                  setDeletingMcqIdx(null);
                                }}
                                className="bg-red-500 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-red-500/20"
                              >XÓA VĨNH VIỄN</button>
                              <button
                                onClick={() => setDeletingMcqIdx(null)}
                                className="bg-white/10 text-white/60 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest"
                              >HỦY</button>
                            </div>
                          ) : null}
                          <button
                            onClick={() => setDeletingMcqIdx(qIdx)}
                            className="absolute top-8 right-8 text-white/10 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={24} />
                          </button>
                          <div className="flex items-start gap-6">
                            <span className="w-12 h-12 min-w-[3rem] rounded-2xl bg-amber-500 text-black flex items-center justify-center font-black italic text-xl shadow-xl shadow-amber-500/20">0{qIdx + 1}</span>
                            <textarea
                              value={q.q}
                              onChange={(e) => {
                                setQuestionsDb((prev: any) => {
                                  const newMcqs = [...prev[selectedFlowerId].mcqs];
                                  newMcqs[qIdx] = { ...newMcqs[qIdx], q: e.target.value };
                                  return {
                                    ...prev,
                                    [selectedFlowerId]: {
                                      ...prev[selectedFlowerId],
                                      mcqs: newMcqs
                                    }
                                  };
                                });
                              }}
                              className="flex-1 bg-transparent border-b-2 border-white/5 py-2 text-white font-black text-2xl italic outline-hidden focus:border-amber-500 transition-all min-h-[80px]"
                              placeholder="Nội dung câu hỏi..."
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-6">
                            {q.a.map((opt: string, aIdx: number) => (
                              <div key={aIdx} className="flex flex-col gap-2">
                                <div className="flex items-center justify-between px-2">
                                  <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Phương án {String.fromCharCode(65 + aIdx)}</span>
                                  <button
                                    onClick={() => {
                                      setQuestionsDb((prev: any) => {
                                        const newMcqs = [...prev[selectedFlowerId].mcqs];
                                        newMcqs[qIdx] = { ...newMcqs[qIdx], correct: aIdx };
                                        return {
                                          ...prev,
                                          [selectedFlowerId]: {
                                            ...prev[selectedFlowerId],
                                            mcqs: newMcqs
                                          }
                                        };
                                      });
                                    }}
                                    className={`px-3 py-1 rounded-lg font-black text-[9px] uppercase tracking-widest border transition-all ${q.correct === aIdx ? 'bg-emerald-500 border-emerald-400 text-white' : 'bg-white/5 border-white/10 text-white/20 hover:text-white'}`}
                                  >
                                    {q.correct === aIdx ? 'ĐÁP ÁN ĐÚNG' : 'CHẾ ĐỘ ĐÁP ÁN'}
                                  </button>
                                </div>
                                <input
                                  value={opt}
                                  onChange={(e) => {
                                    setQuestionsDb((prev: any) => {
                                      const newMcqs = [...prev[selectedFlowerId].mcqs];
                                      const newA = [...newMcqs[qIdx].a];
                                      newA[aIdx] = e.target.value;
                                      newMcqs[qIdx] = { ...newMcqs[qIdx], a: newA };
                                      return {
                                        ...prev,
                                        [selectedFlowerId]: {
                                          ...prev[selectedFlowerId],
                                          mcqs: newMcqs
                                        }
                                      };
                                    });
                                  }}
                                  className="w-full bg-white/5 border-2 border-white/5 rounded-2xl px-6 py-4 text-sm font-bold text-white/70 outline-hidden focus:border-amber-500 focus:bg-black/40 transition-all"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : selectedFlowerId ? (
                  <div className="flex flex-col items-center justify-center py-32 bg-white/5 rounded-[3rem] border-2 border-dashed border-white/10 gap-8">
                    <div className="p-8 bg-amber-500/10 rounded-full text-amber-500">
                      <FileText size={48} />
                    </div>
                    <div className="text-center">
                      <h4 className="text-2xl font-black text-white italic uppercase tracking-widest mb-2">Chưa có bộ câu hỏi</h4>
                      <p className="text-white/30 text-xs uppercase tracking-widest font-black">Bông hoa này chưa được thiết lập ngân hàng câu hỏi</p>
                    </div>
                    <button
                      onClick={() => {
                        setQuestionsDb((prev: any) => ({
                          ...prev,
                          [selectedFlowerId]: {
                            mcqs: Array(5).fill(null).map(() => ({
                              q: "Câu hỏi mới",
                              a: ["Phương án A", "Phương án B", "Phương án C", "Phương án D"],
                              correct: 0
                            })),
                            essays: ["Chủ đề tự luận mới"]
                          }
                        }));
                      }}
                      className="bg-amber-500 text-black px-12 py-5 rounded-2xl font-black uppercase text-sm tracking-widest shadow-2xl shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all"
                    >
                      KHỞI TẠO NGAY
                    </button>
                  </div>
                ) : null}
              </div>
            )}

            {activeTab === 'data' && (
              <div className="grid grid-cols-2 gap-6 animate-in zoom-in-95 duration-500">
                <div className="bg-white/5 p-12 rounded-[3.5rem] border border-white/10 flex flex-col items-center text-center gap-8 group hover:bg-white/10 transition-all">
                  <div className="p-8 bg-blue-500/20 rounded-[2.5rem] text-blue-400 group-hover:scale-110 transition-transform">
                    <Download size={48} />
                  </div>
                  <div>
                    <h4 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-3">Xuất dữ liệu</h4>
                    <p className="text-white/30 text-xs px-10 leading-relaxed uppercase tracking-widest font-black">Lưu trữ cấu hình cuộc thi (JSON) về thiết bị cá nhân</p>
                  </div>
                  <button onClick={exportData} className="w-full py-6 rounded-3xl bg-blue-600 text-white font-black uppercase text-xs tracking-[0.3em] hover:bg-blue-500 transition-all shadow-2xl shadow-blue-950">DOWNLOAD JSON</button>
                </div>

                <div className="bg-white/5 p-12 rounded-[3.5rem] border border-white/10 flex flex-col items-center text-center gap-8 group hover:bg-white/10 transition-all">
                  <div className="p-8 bg-emerald-500/20 rounded-[2.5rem] text-emerald-400 group-hover:scale-110 transition-transform">
                    <Upload size={48} />
                  </div>
                  <div>
                    <h4 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-3">Nhập dữ liệu</h4>
                    <p className="text-white/30 text-xs px-10 leading-relaxed uppercase tracking-widest font-black">Khôi phục cấu hình từ file JSON đã có </p>
                  </div>
                  <label className="w-full py-6 rounded-3xl bg-emerald-600 text-white font-black uppercase text-xs tracking-[0.3em] hover:bg-emerald-500 transition-all cursor-pointer shadow-2xl shadow-emerald-950 text-center">
                    UPLOAD FILE
                    <input type="file" accept=".json" onChange={importData} className="hidden" />
                  </label>
                </div>

                <div className="col-span-2 bg-red-500/5 p-12 rounded-[3.5rem] border-2 border-red-500/20 flex flex-col items-center text-center gap-8 mt-6">
                  <div className="p-8 bg-red-500/20 rounded-[2.5rem] text-red-500">
                    <RotateCcw size={48} />
                  </div>
                  <div>
                    <h4 className="text-3xl font-black text-red-500 italic uppercase tracking-tighter mb-3">Xóa dữ liệu thi</h4>
                    <p className="text-white/30 text-xs px-20 leading-relaxed uppercase tracking-widest font-black">Hành động này sẽ xóa toàn bộ điểm số và reset trạng thái hoa. <br /> dữ liệu câu hỏi và thành viên sẽ được giữ lại.</p>
                  </div>
                  <button onClick={resetAll} className="px-20 py-6 rounded-3xl bg-red-600 text-white font-black uppercase text-xs tracking-[0.3em] hover:bg-red-500 transition-all shadow-2xl shadow-red-950">XÁC NHẬN RESET</button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </motion.div>
  );
}




