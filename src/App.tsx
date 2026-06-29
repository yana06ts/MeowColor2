import React, { useState, useEffect } from "react";
import { PUZZLE_TEMPLATES, createInitialProgress, PuzzleTemplate, CellProgress, GACHA_EXCLUSIVE_PUZZLES, LEVEL_SEQUENCE } from "./data/puzzles";
import { PixelGrid } from "./components/PixelGrid";
import { CatRoom } from "./components/CatRoom";
import SOUNDS from "./utils/sound";
import {
  Sparkles,
  Cat,
  Heart,
  Palette,
  Volume2,
  VolumeX,
  PlusCircle,
  ArrowLeft,
  CheckCircle,
  HelpCircle,
  Flame,
  Star,
  Award,
  Trash2,
  Lock,
  Gift,
  ShoppingBag,
  Grid,
  MapPin,
  Pencil,
  Settings,
  Trophy,
  Ticket,
  Crown,
  Play,
  LogOut
} from "lucide-react";

const startBg = new URL("./assets/images/meow_start_bg_1782757170611.jpg", import.meta.url).href;

export default function App() {

  // 1. Core user states
  const [completedPuzzles, setCompletedPuzzles] = useState<string[]>([]);
  const [yarnCount, setYarnCount] = useState<number>(0); 
  const [powerups, setPowerups] = useState({ wand: 3, bomb: 3, magnifier: 3 });
  const [customPuzzles, setCustomPuzzles] = useState<PuzzleTemplate[]>([]);

  // Premium progress/reward states
  const [goldYarnCount, setGoldYarnCount] = useState<number>(0); 
  const [gachaTickets, setGachaTickets] = useState<number>(0); 
  const [catLevels, setCatLevels] = useState<Record<string, number>>({});
  const [equippedSkins, setEquippedSkins] = useState<Record<string, string>>({});
  const [unlockedSkins, setUnlockedSkins] = useState<string[]>([]);
  const [claimedAchievements, setClaimedAchievements] = useState<string[]>([]);
  const [gachaUnlockedCats, setGachaUnlockedCats] = useState<string[]>([]);
  const [catDuplicates, setCatDuplicates] = useState<Record<string, number>>({});
  const [unlockedGachaPuzzleIds, setUnlockedGachaPuzzleIds] = useState<string[]>([]);

  // Linear Level progression states
  const [currentLevelIndex, setCurrentLevelIndex] = useState<number>(() => {
    const saved = localStorage.getItem("meowcolor_level_index");
    return saved ? parseInt(saved, 10) : 0;
  });
  const [hasAutoStarted, setHasAutoStarted] = useState<boolean>(false);

  // 2. Navigation states
  const [activeTab, setActiveTab] = useState<"room">("room");
  const [selectedPuzzle, setSelectedPuzzle] = useState<PuzzleTemplate | null>(null);
  const [currentProgress, setCurrentProgress] = useState<CellProgress[]>([]);
  const [selectedColorNumber, setSelectedColorNumber] = useState<number>(1);

  // 3. Audio & UI options
  const [soundOn, setSoundOn] = useState<boolean>(true);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [showTutorial, setShowTutorial] = useState<boolean>(false);
  const [showShopModal, setShowShopModal] = useState<boolean>(false);
  const [showAchievementsModal, setShowAchievementsModal] = useState<boolean>(false);
  const [levelCompleteModal, setLevelCompleteModal] = useState<{ active: boolean; yarnEarned: number } | null>(null);
  const [showSuperCatIntro, setShowSuperCatIntro] = useState<{ active: boolean; puzzle: PuzzleTemplate; nextIndex: number } | null>(null);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [showExitConfirm, setShowExitConfirm] = useState<boolean>(false);
  const [showExitScreen, setShowExitScreen] = useState<boolean>(false);

  // Load state on mount
  useEffect(() => {
    // completed puzzles
    const savedCompleted = localStorage.getItem("meowcolor_completed");
    if (savedCompleted) {
      try {
        setCompletedPuzzles(JSON.parse(savedCompleted));
      } catch (e) {
        console.error(e);
      }
    }

    // Yarn points
    const savedYarn = localStorage.getItem("meowcolor_yarn");
    if (savedYarn) {
      setYarnCount(parseInt(savedYarn, 10));
    }

    // Powerups Count
    const savedPowerups = localStorage.getItem("meowcolor_powerups");
    if (savedPowerups) {
      try {
        setPowerups(JSON.parse(savedPowerups));
      } catch (e) {
        console.error(e);
      }
    }

    // Custom creations puzzles
    const savedCustom = localStorage.getItem("meowcolor_custom_puzzles");
    if (savedCustom) {
      try {
        setCustomPuzzles(JSON.parse(savedCustom));
      } catch (e) {
        console.error(e);
      }
    }

    // Load premium states
    const savedGold = localStorage.getItem("meowcolor_gold_yarn");
    if (savedGold) {
      setGoldYarnCount(parseInt(savedGold, 10));
    }

    const savedTickets = localStorage.getItem("meowcolor_gacha_tickets");
    if (savedTickets) {
      setGachaTickets(parseInt(savedTickets, 10));
    }

    const savedLevels = localStorage.getItem("meowcolor_cat_levels");
    if (savedLevels) {
      try {
        setCatLevels(JSON.parse(savedLevels));
      } catch (e) {}
    }

    const savedSkins = localStorage.getItem("meowcolor_equipped_skins");
    if (savedSkins) {
      try {
        setEquippedSkins(JSON.parse(savedSkins));
      } catch (e) {}
    }

    const savedUnlockedSkins = localStorage.getItem("meowcolor_unlocked_skins");
    if (savedUnlockedSkins) {
      try {
        setUnlockedSkins(JSON.parse(savedUnlockedSkins));
      } catch (e) {}
    }

    const savedClaimedAchievements = localStorage.getItem("meowcolor_claimed_achievements");
    if (savedClaimedAchievements) {
      try {
        setClaimedAchievements(JSON.parse(savedClaimedAchievements));
      } catch (e) {}
    }

    const savedGachaUnlocked = localStorage.getItem("meowcolor_gacha_unlocked");
    if (savedGachaUnlocked) {
      try {
        setGachaUnlockedCats(JSON.parse(savedGachaUnlocked));
      } catch (e) {}
    }

    const savedDuplicates = localStorage.getItem("meowcolor_cat_duplicates");
    if (savedDuplicates) {
      try {
        setCatDuplicates(JSON.parse(savedDuplicates));
      } catch (e) {}
    }

    const savedGachaPuzzles = localStorage.getItem("meowcolor_unlocked_gacha_puzzles");
    if (savedGachaPuzzles) {
      try {
        setUnlockedGachaPuzzleIds(JSON.parse(savedGachaPuzzles));
      } catch (e) {}
    }

    // Sound prefer
    const savedSound = localStorage.getItem("meowcolor_sound_on");
    if (savedSound !== null) {
      const isSound = savedSound === "true";
      setSoundOn(isSound);
      SOUNDS.toggle(isSound);
    }
  }, []);

  // Auto-load current level on startup
  useEffect(() => {
    if (!hasAutoStarted && LEVEL_SEQUENCE.length > 0 && !selectedPuzzle) {
      const currentLvl = LEVEL_SEQUENCE[currentLevelIndex];
      if (currentLvl) {
        // Find puzzle template
        const puzzle = PUZZLE_TEMPLATES.find(p => p.id === currentLvl.puzzleId) || GACHA_EXCLUSIVE_PUZZLES.find(p => p.id === currentLvl.puzzleId);
        if (puzzle && !completedPuzzles.includes(puzzle.id)) {
          handleSelectPuzzle(puzzle);
        }
      }
      setHasAutoStarted(true);
    }
  }, [completedPuzzles, currentLevelIndex, hasAutoStarted, selectedPuzzle]);

  // Save updates helper
  const updateYarn = (newVal: number) => {
    setYarnCount(newVal);
    localStorage.setItem("meowcolor_yarn", newVal.toString());
  };

  const updateGoldYarn = (newVal: number) => {
    setGoldYarnCount(newVal);
    localStorage.setItem("meowcolor_gold_yarn", newVal.toString());
  };

  const updateGachaTickets = (newVal: number) => {
    setGachaTickets(newVal);
    localStorage.setItem("meowcolor_gacha_tickets", newVal.toString());
  };

  const updateCatLevels = (newVal: Record<string, number>) => {
    setCatLevels(newVal);
    localStorage.setItem("meowcolor_cat_levels", JSON.stringify(newVal));
  };

  const updateGachaUnlockedCats = (newVal: string[]) => {
    setGachaUnlockedCats(newVal);
    localStorage.setItem("meowcolor_gacha_unlocked", JSON.stringify(newVal));
  };

  const updateCatDuplicates = (newVal: Record<string, number>) => {
    setCatDuplicates(newVal);
    localStorage.setItem("meowcolor_cat_duplicates", JSON.stringify(newVal));
  };

  const updateUnlockedGachaPuzzleIds = (newVal: string[]) => {
    setUnlockedGachaPuzzleIds(newVal);
    localStorage.setItem("meowcolor_unlocked_gacha_puzzles", JSON.stringify(newVal));
  };

  const updateEquippedSkins = (newVal: Record<string, string>) => {
    setEquippedSkins(newVal);
    localStorage.setItem("meowcolor_equipped_skins", JSON.stringify(newVal));
  };

  const updateUnlockedSkins = (newVal: string[]) => {
    setUnlockedSkins(newVal);
    localStorage.setItem("meowcolor_unlocked_skins", JSON.stringify(newVal));
  };

  const updateClaimedAchievements = (newVal: string[]) => {
    setClaimedAchievements(newVal);
    localStorage.setItem("meowcolor_claimed_achievements", JSON.stringify(newVal));
  };

  const updatePowerupsVal = (newPowerups: typeof powerups) => {
    setPowerups(newPowerups);
    localStorage.setItem("meowcolor_powerups", JSON.stringify(newPowerups));
  };

  const handleToggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    SOUNDS.toggle(next);
    localStorage.setItem("meowcolor_sound_on", next.toString());
    SOUNDS.playPop(1.2);
  };

  // Select puzzle and resume progress or start fresh
  const handleSelectPuzzle = (puzzle: PuzzleTemplate) => {
    setSelectedPuzzle(puzzle);
    
    // Check if we have partial progress saved
    const savedProgress = localStorage.getItem(`meowcolor_progress_${puzzle.id}`);
    if (savedProgress) {
      try {
        setCurrentProgress(JSON.parse(savedProgress));
      } catch (e) {
        setCurrentProgress(createInitialProgress(puzzle));
      }
    } else {
      setCurrentProgress(createInitialProgress(puzzle));
    }

    // Select the first valid non-empty color option listed in the puzzle colors info
    if (puzzle.colors.length > 0) {
      setSelectedColorNumber(puzzle.colors[0].number);
    }
    SOUNDS.playPop(1.1);
  };

  // Pixel grid callback when pixel(s) colored successfully
  const handlePixelColored = (index: number | number[]) => {
    const updated = [...currentProgress];
    const indices = Array.isArray(index) ? index : [index];
    indices.forEach((idx) => {
      if (updated[idx]) {
        updated[idx] = { ...updated[idx], filled: true, correct: true };
      }
    });
    setCurrentProgress(updated);

    // Save temporary progress
    localStorage.setItem(`meowcolor_progress_${selectedPuzzle!.id}`, JSON.stringify(updated));

    // Check if entire puzzle solved (ignoring spacing zeros)
    const isPuzzleFinished = updated.every(
      (cell) => cell.number === 0 || cell.filled
    );

    if (isPuzzleFinished) {
      // Complete!
      const puzzleId = selectedPuzzle!.id;
      const isFirstTime = !completedPuzzles.includes(puzzleId);
      
      const newCompleted = isFirstTime ? [...completedPuzzles, puzzleId] : completedPuzzles;
      if (isFirstTime) {
        setCompletedPuzzles(newCompleted);
        localStorage.setItem("meowcolor_completed", JSON.stringify(newCompleted));
      }

      // Add yarn rewards balances
      const originalReward = selectedPuzzle!.yarnReward;
      const finalReward = isFirstTime 
        ? originalReward 
        : Math.max(5, Math.floor(originalReward * 0.15));
      
      // Give standard reward
      let finalGoldYarnReward = 0;

      // If it was a Super Cat level, unlock it inside the shelter!
      const currentLvl = LEVEL_SEQUENCE[currentLevelIndex];
      if (currentLvl && currentLvl.isSuper) {
        // Unlock this cat for the shelter list
        if (!gachaUnlockedCats.includes(currentLvl.puzzleId)) {
          const nextUnlocked = [...gachaUnlockedCats, currentLvl.puzzleId];
          setGachaUnlockedCats(nextUnlocked);
          localStorage.setItem("meowcolor_gacha_unlocked", JSON.stringify(nextUnlocked));
        }
        // Give bonus premium crystals for unlocking a Super Cat!
        finalGoldYarnReward = 8;
        updateGoldYarn(goldYarnCount + 8);
      } else {
        // Regular levels give +1 premium crystal as milestone
        finalGoldYarnReward = 1;
        updateGoldYarn(goldYarnCount + 1);
      }

      updateYarn(yarnCount + finalReward);

      // Clear partial progress state storage
      localStorage.removeItem(`meowcolor_progress_${puzzleId}`);

      // Synthesize level completeness sound
      setTimeout(() => {
        SOUNDS.playCompleteLevel();
      }, 300);

      // Open reward visual dialog
      setLevelCompleteModal({
        active: true,
        yarnEarned: finalReward,
      });
    }
  };

  // Exit puzzle active mode
  const handleExitPuzzle = () => {
    setSelectedPuzzle(null);
    setCurrentProgress([]);
    SOUNDS.playPop(0.85);
  };

  // Buy powerup skills from Store Shop
  const handleBuyPowerup = (type: "wand" | "bomb" | "magnifier", price: number) => {
    if (yarnCount < price) {
      SOUNDS.playError();
      return;
    }
    updateYarn(yarnCount - price);
    const updated = { ...powerups, [type]: powerups[type] + 1 };
    updatePowerupsVal(updated);
    SOUNDS.playSuccessColor();
  };

  // Use powerup deduction inside PixelGrid
  const handleUsePowerupDeduction = (type: "wand" | "bomb" | "magnifier") => {
    if (powerups[type] > 0) {
      updatePowerupsVal({ ...powerups, [type]: powerups[type] - 1 });
    }
  };

  // Clear completion progress to replay the game
  const handleResetApplicationData = () => {
    if (confirm("Вы уверены, что хотите сбросить прогресс? Это очистит ваших котиков и раскраски.")) {
      localStorage.clear();
      setCompletedPuzzles([]);
      setYarnCount(0); 
      setGoldYarnCount(0); 
      setGachaTickets(0); 
      setCatLevels({});
      setGachaUnlockedCats([]);
      setCatDuplicates({});
      setEquippedSkins({});
      setUnlockedSkins([]);
      setClaimedAchievements([]);
      setCurrentLevelIndex(0);
      setPowerups({ wand: 3, bomb: 3, magnifier: 3 });
      setCustomPuzzles([]);
      setSelectedPuzzle(null);
      SOUNDS.playPop(0.5);
    }
  };

  const allAvailablePuzzles = [
    ...customPuzzles,
    ...PUZZLE_TEMPLATES,
    ...GACHA_EXCLUSIVE_PUZZLES
  ];

  return (
    <div className="h-[100dvh] w-screen bg-[#F0E6D2] font-sans antialiased text-slate-800 flex justify-center items-center overflow-hidden">
      {/* Phone visual Mockup frame container */}
      <div className="w-full h-full max-w-md bg-white shadow-2xl flex flex-col relative overflow-hidden border-rose-300/40 md:h-[94vh] md:max-h-[850px] md:rounded-[36px] md:border-8">
        
        {!gameStarted ? (
          /* Start Screen with full height & beautiful background image */
          <div 
            className="flex-1 relative flex flex-col justify-between p-6 select-none bg-cover bg-center text-white overflow-hidden animate-fade-in"
            style={{ backgroundImage: `url(${startBg})` }}
          >
            {/* Dark blur/overlay overlay for elegant text contrast */}
            <div className="absolute inset-0 bg-slate-950/40 z-0" />
            
            {/* Top section: sound controls & brand styling */}
            <div className="relative z-10 flex justify-end items-center w-full">
              <button
                onClick={handleToggleSound}
                className="p-2 bg-white/20 hover:bg-white/35 backdrop-blur-md text-white rounded-full transition-all border border-white/25 shadow-xs cursor-pointer active:scale-90"
              >
                {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
            </div>

            {/* Middle Section: Big, colorful, styled title */}
            <div className="relative z-10 flex flex-col items-center justify-center text-center my-auto px-2">
              <h1 className="text-4xl font-pixel tracking-tight text-white font-extrabold select-none drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] filter">
                МЯУ-ДОКУ
              </h1>
              <p className="text-xs font-semibold tracking-wider text-rose-100 uppercase mt-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                Яркая Кошачья Раскраска
              </p>
            </div>

            {/* Bottom section: Play & Exit Buttons */}
            <div className="relative z-10 flex flex-col gap-3.5 w-full max-w-[280px] mx-auto pb-4 shrink-0">
              <button
                onClick={() => {
                  setGameStarted(true);
                  SOUNDS.playCompleteLevel(); // Воспроизведение звука запуска
                }}
                className="w-full bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-300 hover:to-teal-400 text-slate-950 font-bold p-4 rounded-2xl flex items-center justify-center gap-2 shadow-[0_4px_14px_rgba(16,185,129,0.4)] border border-emerald-300/30 hover:shadow-lg transition-all duration-200 active:scale-95 cursor-pointer font-pixel text-xs tracking-wider uppercase animate-pulse"
              >
                <Play className="w-4 h-4 fill-slate-950 text-slate-950" />
                Играть 🐾
              </button>

              <button
                onClick={() => {
                  setShowExitConfirm(true);
                  SOUNDS.playPop(0.9);
                }}
                className="w-full bg-white/15 hover:bg-white/25 backdrop-blur-md text-white border border-white/25 p-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-xs transition-all duration-200 active:scale-95 cursor-pointer text-xs font-semibold"
              >
                <LogOut className="w-3.5 h-3.5" />
                Выход
              </button>
            </div>

            {/* Exit confirmation overlay */}
            {showExitConfirm && (
              <div className="absolute inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex flex-col justify-center items-center p-6 text-center animate-fade-in">
                <div className="bg-slate-900/90 border border-rose-300/20 rounded-3xl p-6 max-w-[280px] shadow-2xl">
                  <span className="text-4xl block mb-3 animate-bounce">🐾😿</span>
                  <h3 className="text-xs font-pixel text-rose-300 uppercase leading-snug">
                    Уже уходишь?
                  </h3>
                  <p className="text-[10px] text-slate-300 mt-2 leading-relaxed font-semibold">
                    Котики будут очень скучать без твоего внимания и ярких красок! Останься ещё ненадолго. ❤️
                  </p>
                  
                  <div className="flex flex-col gap-2 mt-5">
                    <button
                      onClick={() => {
                        setShowExitConfirm(false);
                        SOUNDS.playPop(1.1);
                      }}
                      className="w-full bg-rose-500 hover:bg-rose-400 text-white font-bold p-2.5 rounded-xl text-xs transition-colors cursor-pointer font-semibold"
                    >
                      Остаться с котиками 🐱
                    </button>
                    <button
                      onClick={() => {
                        setShowExitConfirm(false);
                        setShowExitScreen(true);
                        SOUNDS.playPop(0.7);
                      }}
                      className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 p-2 rounded-xl text-xs transition-colors cursor-pointer border border-slate-700 font-semibold"
                    >
                      Да, выйти 🚪
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Exit Farewell Screen */}
            {showExitScreen && (
              <div 
                className="absolute inset-0 z-50 bg-slate-950 flex flex-col justify-center items-center p-6 text-center animate-fade-in bg-cover bg-center" 
                style={{ backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.95)), url(${startBg})` }}
              >
                <div className="max-w-[280px] flex flex-col items-center">
                  <div className="w-20 h-20 bg-rose-500/10 rounded-full border border-rose-500/30 flex items-center justify-center mb-4 text-3xl animate-pulse">
                    😻💤
                  </div>
                  <h2 className="text-sm font-pixel text-white uppercase leading-snug">
                    Спасибо за игру!
                  </h2>
                  <p className="text-[10px] text-rose-100/70 mt-3 leading-relaxed font-semibold">
                    Котики уснули сладким сном в ожидании твоего возвращения. Твой прогресс надёжно сохранён на этом устройстве!
                  </p>
                  
                  <button
                    onClick={() => {
                      setShowExitScreen(false);
                      SOUNDS.playCompleteLevel();
                    }}
                    className="mt-8 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold px-6 py-3 rounded-2xl text-xs tracking-wider uppercase shadow-md active:scale-95 transition-all cursor-pointer font-pixel"
                  >
                    Вернуться к меню
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* 1. Header Area */}
            <header className="bg-rose-400 text-white px-4 py-3 shrink-0 flex flex-col shadow-xs select-none">
          <div className="flex justify-between items-center">
            
            {/* Title / Brand */}
            <div className="flex items-center gap-1.5 cursor-pointer" onClick={handleExitPuzzle}>
              <div className="bg-white p-1 rounded-lg">
                <Cat className="w-5 h-5 text-rose-500" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-xs font-pixel tracking-wider scale-90 origin-left">MEOWCOLOR</span>
              </div>
            </div>

            {/* Yarn Stash and Stats */}
            <div className="flex items-center gap-1.5 select-none">
              {/* Settings Toggle */}
              <button
                id="header-settings-btn"
                onClick={() => {
                  setShowSettingsModal(true);
                  SOUNDS.playPop(1.1);
                }}
                className="p-1 px-1.5 hover:bg-rose-500 text-rose-100 rounded-lg transition-colors cursor-pointer flex items-center justify-center scale-90"
                title="Настройки ⚙️"
              >
                <Settings className="w-3.5 h-3.5" />
              </button>

              {/* Regular Yarn score bubble (Static) */}
              <div
                className="flex items-center gap-0.5 bg-amber-400 border border-amber-500 px-2 py-0.5 rounded-full text-[10px] font-pixel shadow-xs scale-90 text-slate-950 font-bold"
                title="Баланс пряжи 🧶"
              >
                <span>🧶</span>
                <span>{yarnCount}</span>
              </div>
            </div>
          </div>
        </header>

        {/* 2. MAIN ACTIVE VIEWER VIEWPORT */}
        <main className="flex-1 overflow-hidden relative flex flex-col bg-slate-50">
          
          {/* Active drawing stage overlay if selectedPuzzle exists */}
          {selectedPuzzle ? (
            <div className="absolute inset-0 z-40 bg-white flex flex-col">
              {/* Back Header panel */}
              <div className="flex items-center justify-between px-3 py-2 bg-rose-50 border-b border-rose-100">
                <button
                  id="canvas-back-btn"
                  onClick={handleExitPuzzle}
                  className="flex items-center gap-1 text-xs font-semibold text-rose-600 hover:bg-rose-100 px-2 py-1 rounded-lg active:scale-95 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  В домик 🏠
                </button>
                <div className="text-right">
                  <h3 className="text-xs font-pixel text-slate-800 scale-90 truncate max-w-[140px]">
                    {selectedPuzzle.name}
                  </h3>
                  <span className="text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-full font-bold ml-1">
                    +{completedPuzzles.includes(selectedPuzzle.id) ? Math.max(5, Math.floor(selectedPuzzle.yarnReward * 0.15)) : selectedPuzzle.yarnReward} 🧶
                  </span>
                </div>
              </div>

              {/* Active Drawing canvas engine wrapper */}
              <div className="flex-1 overflow-hidden">
                <PixelGrid
                  puzzle={selectedPuzzle}
                  progress={currentProgress}
                  selectedColorNumber={selectedColorNumber}
                  onPixelColored={handlePixelColored}
                  onUsePowerup={handleUsePowerupDeduction}
                  powerupCounts={powerups}
                />
              </div>

              {/* Dynamic Footer color selection palette picker */}
              <div className="bg-white border-t border-rose-100 p-3 flex flex-col gap-2 shrink-0 select-none">
                <span className="text-[10px] font-pixel text-slate-400 text-center">
                  ВЫБЕРИ ЦВЕТ И КЛИКАЙ НА ПОДХОДЯЩИЕ ЦИФРЫ:
                </span>
                
                <div className="flex gap-2.5 overflow-x-auto pb-1 px-1 justify-center no-scrollbar">
                  {selectedPuzzle.colors.map((color) => {
                    const isSelected = color.number === selectedColorNumber;
                    
                    const totalTarget = currentProgress.filter((c) => c.number === color.number).length;
                    const filledCount = currentProgress.filter((c) => c.number === color.number && c.filled).length;
                    const remainder = totalTarget - filledCount;
                    const isDone = remainder === 0;

                    return (
                      <button
                        key={color.number}
                        id={`palette-color-btn-${color.number}`}
                        onClick={() => {
                          if (!isDone) {
                            setSelectedColorNumber(color.number);
                            SOUNDS.playPop(1.0 + color.number * 0.1);
                          }
                        }}
                        className={`relative w-11 h-11 rounded-full flex flex-col items-center justify-center transition-all ${
                          isSelected ? "scale-115 ring-4 ring-rose-400 ring-offset-1" : "hover:scale-105"
                        } ${isDone ? "opacity-35 cursor-not-allowed scale-90" : "cursor-pointer"}`}
                        style={{ backgroundColor: color.hex }}
                        title={color.name}
                      >
                        {!isDone ? (
                          <span
                            className="font-pixel text-[10px] font-bold drop-shadow-md text-white"
                            style={{
                              color: ["#FFFFFF", "#FFF4E0", "#FFF7D6"].includes(color.hex.toUpperCase())
                                ? "#333333"
                                : "#FFFFFF",
                            }}
                          >
                            {color.number}
                          </span>
                        ) : (
                          <span className="text-white drop-shadow-md text-xs font-bold">✓</span>
                        )}

                        {!isDone && (
                          <span className="absolute -bottom-1 -right-1 bg-slate-800 text-white text-[7px] font-pixel px-1.5 rounded-full min-w-4 text-center line-clamp-1 border border-white">
                            {remainder}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : null}

          {/* Interactive cozy cat room (Primary screen) */}
          <div className="flex-1 overflow-hidden relative flex flex-col h-full">
            <CatRoom
              completedPuzzles={completedPuzzles}
              puzzleTemplates={allAvailablePuzzles}
              yarnCount={yarnCount}
              updateYarn={updateYarn}
              goldYarnCount={goldYarnCount}
              updateGoldYarn={updateGoldYarn}
              gachaTickets={gachaTickets}
              updateGachaTickets={updateGachaTickets}
              catLevels={catLevels}
              updateCatLevels={updateCatLevels}
              equippedSkins={equippedSkins}
              updateEquippedSkins={updateEquippedSkins}
              unlockedSkins={unlockedSkins}
              updateUnlockedSkins={updateUnlockedSkins}
              gachaUnlockedCats={gachaUnlockedCats}
              updateGachaUnlockedCats={updateGachaUnlockedCats}
              catDuplicates={catDuplicates}
              updateCatDuplicates={updateCatDuplicates}
              currentLevelIndex={currentLevelIndex}
              onPlayLevel={() => {
                const currentLvl = LEVEL_SEQUENCE[currentLevelIndex] || LEVEL_SEQUENCE[0];
                const puzzle = PUZZLE_TEMPLATES.find(p => p.id === currentLvl.puzzleId) || GACHA_EXCLUSIVE_PUZZLES.find(p => p.id === currentLvl.puzzleId);
                if (puzzle) {
                  if (currentLvl.isSuper) {
                    setShowSuperCatIntro({
                      active: true,
                      puzzle: puzzle,
                      nextIndex: currentLevelIndex
                    });
                    SOUNDS.playCompleteLevel();
                  } else {
                    handleSelectPuzzle(puzzle);
                  }
                }
              }}
            />
          </div>
        </main>

        {/* 4. MODALS AND FLOATING PANELS */}

        {/* Level Complete visual Modal */}
        {levelCompleteModal?.active && (
          <div className="absolute inset-0 z-50 bg-[#00000085] backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-5.5 shadow-2xl border-4 border-amber-400 max-w-sm w-full text-center relative select-none animate-fade-in">
              <div className="absolute top-2 left-6 text-xl animate-pulse">✨</div>
              <div className="absolute top-4 right-8 text-xl animate-ping">🌸</div>

              <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3 border border-amber-300 shadow-3xs">
                <CheckCircle className="w-8 h-8 text-amber-500" />
              </div>

              <h2 className="text-xs font-pixel text-amber-900 uppercase mb-3 leading-tight">
                Картина Завершена! 🎉
              </h2>

              {/* Finished drawing preview container */}
              {selectedPuzzle && (
                <div className="w-40 h-40 mx-auto mb-4 bg-[linear-gradient(135deg,#FFF9E6_0%,#FFF5D6_100%)] rounded-2xl p-2.5 border-4 border-amber-300 shadow-inner flex items-center justify-center relative overflow-hidden">
                  <div
                    className="grid gap-[1px]"
                    style={{
                      gridTemplateColumns: `repeat(${selectedPuzzle.width}, minmax(0, 1fr))`,
                      width: "100%",
                      height: "100%",
                    }}
                  >
                    {selectedPuzzle.rows.flatMap((rowStr) =>
                      rowStr.split("").map((c, i) => {
                        const num = c === "." ? 0 : parseInt(c, 10);
                        const color = selectedPuzzle.colors.find((col) => col.number === num);
                        return (
                          <div
                            key={i}
                            className="rounded-xs"
                            style={{
                              backgroundColor: num === 0 ? "transparent" : color?.hex,
                            }}
                          />
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {/* Progress towards Super Cat */}
              {(() => {
                const currentLvl = LEVEL_SEQUENCE[currentLevelIndex];
                if (!currentLvl) return null;
                
                const cycleLevels = LEVEL_SEQUENCE.filter((item) => item.cycleNumber === currentLvl.cycleNumber);
                const completedInCycle = cycleLevels.filter((item) => completedPuzzles.includes(item.puzzleId) || item.puzzleId === currentLvl.puzzleId).length;
                const isSuper = currentLvl.isSuper;
                const levelsRemaining = cycleLevels.length - completedInCycle;
                const percent = Math.min(100, Math.floor((completedInCycle / cycleLevels.length) * 100));

                if (isSuper) {
                  return (
                    <div className="bg-amber-50 rounded-2xl p-3 border border-amber-200/60 mb-4 text-center">
                      <span className="text-[14px]">👑🐱🐾</span>
                      <h4 className="text-[10px] font-pixel text-amber-800 uppercase mt-1 leading-tight font-black">
                        СУПЕР-КОТ РАЗБЛОКИРОВАН!
                      </h4>
                      <p className="text-[8.5px] text-amber-600 font-semibold mt-1 leading-normal">
                        Потрясающе! Ты завершил цикл и получил легендарного котика! Размести его в комнате!
                      </p>
                    </div>
                  );
                }

                return (
                  <div className="bg-rose-50/55 rounded-2xl p-3 border border-rose-100 mb-4 text-left">
                    <div className="flex justify-between items-center text-[8.5px] font-pixel text-rose-800 font-bold">
                      <span>ДО СУПЕР-КОТА:</span>
                      <span>ОСТАЛОСЬ: {levelsRemaining}</span>
                    </div>
                    
                    <div className="w-full bg-slate-200 h-2 rounded-full mt-1.5 overflow-hidden border border-rose-100/10">
                      <div
                        className="bg-gradient-to-r from-rose-400 to-amber-400 h-full rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <div className="text-[7.5px] text-rose-500 font-bold mt-1 text-right font-pixel">
                      Цикл завершён на {percent}% 🐾
                    </div>
                  </div>
                );
              })()}

              <button
                id="claim-reward-modal-btn"
                onClick={() => {
                  const isSuper = LEVEL_SEQUENCE[currentLevelIndex]?.isSuper;
                  const nextIndex = (currentLevelIndex + 1) % LEVEL_SEQUENCE.length;
                  const nextLvlItem = LEVEL_SEQUENCE[nextIndex];

                  setLevelCompleteModal(null);

                  if (isSuper) {
                    // Just completed the super level, return to the room
                    setCurrentLevelIndex(nextIndex);
                    localStorage.setItem("meowcolor_level_index", nextIndex.toString());
                    setSelectedPuzzle(null);
                  } else {
                    // Finished regular level. Check if the next one is a Super Cat level!
                    if (nextLvlItem?.isSuper) {
                      const nextPuzzle = PUZZLE_TEMPLATES.find(p => p.id === nextLvlItem.puzzleId) || GACHA_EXCLUSIVE_PUZZLES.find(p => p.id === nextLvlItem.puzzleId);
                      if (nextPuzzle) {
                        setShowSuperCatIntro({
                          active: true,
                          puzzle: nextPuzzle,
                          nextIndex: nextIndex
                        });
                        SOUNDS.playCompleteLevel();
                        return;
                      }
                    }

                    // Otherwise normally go to the next level
                    setCurrentLevelIndex(nextIndex);
                    localStorage.setItem("meowcolor_level_index", nextIndex.toString());
                    const nextPuzzle = PUZZLE_TEMPLATES.find(p => p.id === nextLvlItem.puzzleId) || GACHA_EXCLUSIVE_PUZZLES.find(p => p.id === nextLvlItem.puzzleId);
                    if (nextPuzzle) {
                      handleSelectPuzzle(nextPuzzle);
                    } else {
                      setSelectedPuzzle(null);
                    }
                  }
                  SOUNDS.playPop(1.1);
                }}
                className="w-full bg-gradient-to-r from-amber-400 to-amber-500 border-2 border-amber-500 p-2.5 font-pixel text-[9px] text-slate-950 rounded-2xl shadow-sm hover:bg-amber-300 active:scale-95 duration-100 cursor-pointer uppercase font-extrabold"
              >
                {LEVEL_SEQUENCE[currentLevelIndex]?.isSuper ? (
                  "ЗАБРАТЬ КОТИКА И ИДТИ В ДОМИК! 🏠🐾"
                ) : (
                  "СЛЕДУЮЩИЙ УРОВЕНЬ ▶"
                )}
              </button>
            </div>
          </div>
        )}

        {/* Super Cat Intro Alert/Modal */}
        {showSuperCatIntro?.active && (
          <div className="absolute inset-0 z-50 bg-[#00000095] backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-gradient-to-b from-slate-900 to-slate-950 rounded-3xl p-6 shadow-2xl border-4 border-amber-400 max-w-sm w-full text-center relative select-none animate-fade-in text-white">
              <div className="absolute top-2 left-6 text-xl animate-pulse">👑</div>
              <div className="absolute top-4 right-8 text-xl animate-ping">✨</div>

              <div className="w-16 h-16 bg-gradient-to-tr from-amber-400 to-rose-400 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-amber-300 shadow-lg animate-bounce">
                <Crown className="w-9 h-9 text-slate-900" />
              </div>

              <h2 className="text-sm font-pixel text-amber-400 uppercase mb-2 leading-tight tracking-wide">
                👑 СУПЕР-УРОВЕНЬ! 👑
              </h2>
              <h3 className="text-lg font-pixel text-white font-black uppercase mb-3 truncate">
                {showSuperCatIntro.puzzle.name}
              </h3>

              <div className="bg-slate-800/80 rounded-2xl p-4 border border-amber-400/30 mb-5 text-left">
                <p className="text-[9.5px] text-amber-100 font-semibold leading-normal font-pixel">
                  Вы прошли все обычные уровни главы! Настало время для финального испытания.
                </p>
                <p className="text-[9.5px] text-rose-300 font-bold mt-2 leading-normal flex items-start gap-1 font-pixel">
                  <span>🐾</span>
                  <span>Нарисуйте этого легендарного Супер-Котика, чтобы он навсегда поселился в вашем домике и приносил больше пряжи!</span>
                </p>
              </div>

              <button
                onClick={() => {
                  setCurrentLevelIndex(showSuperCatIntro.nextIndex);
                  localStorage.setItem("meowcolor_level_index", showSuperCatIntro.nextIndex.toString());
                  handleSelectPuzzle(showSuperCatIntro.puzzle);
                  setShowSuperCatIntro(null);
                  SOUNDS.playPop(1.15);
                }}
                className="w-full bg-gradient-to-r from-amber-400 via-amber-500 to-rose-400 border-2 border-amber-300 p-3 font-pixel text-[10px] text-slate-950 rounded-2xl shadow-lg hover:brightness-110 active:scale-95 duration-100 cursor-pointer uppercase font-extrabold flex items-center justify-center gap-2"
              >
                <span>НАЧАТЬ РИСОВАТЬ!</span>
                <span>🎨🐾</span>
              </button>
            </div>
          </div>
        )}

        {/* Booster Shop Modal (Buy Powerups) */}
        {showShopModal && (
          <div className="absolute inset-0 z-50 bg-[#00000075] backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-5 shadow-2xl border-2 border-rose-100 max-w-sm w-full relative select-none">
              
              <button
                id="shop-close-btn"
                onClick={() => {
                  setShowShopModal(false);
                  SOUNDS.playPop(0.9);
                }}
                className="absolute top-4 right-4 text-xs font-pixel text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✖
              </button>

              <div className="flex items-center gap-1.5 border-b border-slate-100 pb-3 mb-4">
                <ShoppingBag className="w-5 h-5 text-rose-500" />
                <h3 className="text-xs font-pixel text-rose-700 uppercase">
                  Лавка Бустеров 🧶
                </h3>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-rose-100/20">
                  <div className="flex-1">
                    <span className="text-xs font-pixel text-indigo-700">🪄 Палочка</span>
                    <p className="text-[10px] text-slate-500 leading-tight">
                      Красит соприкасающуюся область одного цвета сразу!
                    </p>
                  </div>
                  <button
                    id="shop-buy-wand-btn"
                    onClick={() => handleBuyPowerup("wand", 50)}
                    disabled={yarnCount < 50}
                    className={`px-3 py-1.5 rounded-xl font-pixel text-[10px] border shadow-xs transition-transform transform active:scale-95 cursor-pointer ${
                      yarnCount >= 50
                        ? "bg-amber-400 text-slate-950 border-amber-500 hover:bg-amber-300"
                        : "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                    }`}
                  >
                    50 🧶
                  </button>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-rose-100/20">
                  <div className="flex-1">
                    <span className="text-xs font-pixel text-amber-700">💣 Бомбочка</span>
                    <p className="text-[10px] text-slate-500 leading-tight">
                      Взрывает и убирает область 3х3 выбранного вами цвета!
                    </p>
                  </div>
                  <button
                    id="shop-buy-bomb-btn"
                    onClick={() => handleBuyPowerup("bomb", 45)}
                    disabled={yarnCount < 45}
                    className={`px-3 py-1.5 rounded-xl font-pixel text-[10px] border shadow-xs transition-transform transform active:scale-95 cursor-pointer ${
                      yarnCount >= 45
                        ? "bg-amber-400 text-slate-950 border-amber-500 hover:bg-amber-300"
                        : "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                    }`}
                  >
                    45 🧶
                  </button>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex flex-col gap-2">
                <div className="text-center">
                  <span className="text-[10px] text-slate-500 font-semibold">
                    Твой баланс: {yarnCount} 🧶
                  </span>
                </div>
                <button
                  id="shop-done-close-btn"
                  onClick={() => {
                    setShowShopModal(false);
                    SOUNDS.playPop(1.1);
                  }}
                  className="w-full mt-2 bg-rose-400 text-white font-pixel text-xs p-2.5 rounded-2xl hover:bg-rose-500 shadow-sm transition-colors cursor-pointer uppercase font-bold text-center"
                >
                  Закрыть 🐾
                </button>
              </div>

            </div>
          </div>
        )}

        {/* Settings Modal */}
        {showSettingsModal && (
          <div className="absolute inset-0 z-50 bg-[#00000075] backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-5 shadow-2xl border-2 border-rose-100 max-w-sm w-full relative select-none animate-fade-in">
              
              <button
                id="settings-close-btn"
                onClick={() => {
                  setShowSettingsModal(false);
                  SOUNDS.playPop(0.9);
                }}
                className="absolute top-4 right-4 text-xs font-pixel text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✖
              </button>

              <div className="flex items-center gap-1.5 border-b border-rose-100 pb-3 mb-4">
                <h3 className="text-xs font-pixel text-rose-700 uppercase">
                  Настройки Игры
                </h3>
              </div>

              <div className="space-y-4">
                <div className="bg-rose-50/50 rounded-2xl p-4 border border-rose-100/40">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-rose-100 rounded-lg text-rose-600">
                        {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-slate-700">Звук</span>
                      </div>
                    </div>
                    <button
                      id="toggle-sound-settings-switch"
                      onClick={handleToggleSound}
                      className={`w-12 h-6.5 rounded-full p-0.5 transition-colors duration-200 focus:outline-hidden relative cursor-pointer ${
                        soundOn ? "bg-rose-400" : "bg-slate-300"
                      }`}
                    >
                      <div
                        className={`w-5.5 h-5.5 bg-white rounded-full shadow-md transform duration-200 flex items-center justify-center text-[10px] ${
                          soundOn ? "translate-x-5.5" : "translate-x-0"
                        }`}
                      >
                        🐱
                      </div>
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <span className="text-[9px] font-pixel text-rose-400/80 uppercase block tracking-wider mb-1.5 ml-1">
                    Сброс Данных
                  </span>
                  <button
                    id="settings-reset-data-btn"
                    onClick={() => {
                      handleResetApplicationData();
                      setShowSettingsModal(false);
                    }}
                    className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 bg-red-50 hover:bg-red-100/50 text-red-500 border border-red-200/50 rounded-2xl text-[10px] font-pixel cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Очистить Прогресс и Сбросить Игру
                  </button>
                </div>
              </div>

              <button
                id="settings-save-button"
                onClick={() => {
                  setShowSettingsModal(false);
                  SOUNDS.playPop(1.1);
                }}
                className="w-full mt-4 bg-rose-400 text-white font-pixel text-xs p-3 rounded-2xl hover:bg-rose-500 shadow-sm transition-colors cursor-pointer uppercase font-bold"
              >
                ГОТОВО! 🐾
              </button>
            </div>
          </div>
        )}

        {/* Achievements Modal */}
        {showAchievementsModal && (
          <div className="absolute inset-0 z-50 bg-[#00000075] backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-5 shadow-2xl border-2 border-amber-300 max-w-sm w-full relative select-none animate-fade-in flex flex-col max-h-[82%]">
              
              <button
                id="achievements-close-btn"
                onClick={() => {
                  setShowAchievementsModal(false);
                  SOUNDS.playPop(0.9);
                }}
                className="absolute top-4 right-4 text-xs font-pixel text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>

              <div className="flex items-center gap-2 border-b border-rose-100 pb-3 mb-4 shrink-0 col-span-2">
                <Trophy className="w-5 h-5 text-amber-500 animate-bounce" />
                <h3 className="text-xs font-pixel text-slate-800 uppercase tracking-tight">
                  Кошачьи Достижения 🏆
                </h3>
              </div>

              {/* Achievements list */}
              <div className="flex-1 overflow-y-auto pr-1 no-scrollbar space-y-3 pb-3">
                {([
                  {
                    id: "first_cat",
                    title: "Первый Мурка 🐱",
                    desc: "Раскрась первого котика по номерам.",
                    gYarnReward: 5,
                    check: () => {
                      return completedPuzzles.some(pId => {
                        const templ = allAvailablePuzzles.find(t => t.id === pId);
                        return templ && templ.category === "cats";
                      });
                    }
                  },
                  {
                    id: "cat_level_2",
                    title: "Заботливый Опекун ⭐",
                    desc: "Прокачай любого котика до 2-го уровня или выше.",
                    gYarnReward: 8,
                    check: () => {
                      return Object.values(catLevels).some(lvl => (lvl as number) >= 2);
                    }
                  },
                  {
                    id: "cat_level_5",
                    title: "Кошачий Владыка 👑",
                    desc: "Достигни максимального 5-го уровня на котике.",
                    gYarnReward: 15,
                    check: () => {
                      return Object.values(catLevels).some(lvl => (lvl as number) >= 5);
                    }
                  },
                  {
                    id: "furniture_buy",
                    title: "Уютный Дизайнер 🛋️",
                    desc: "Поставь мебель или игрушку в Кошачий Кото-Дом.",
                    gYarnReward: 8,
                    check: () => {
                      const placedCatsVal = localStorage.getItem("meowcolor_placed_cats");
                      if (placedCatsVal) {
                        try {
                          const parsed = JSON.parse(placedCatsVal);
                          return parsed.some((item: any) => item.shopId || (item.puzzleId && item.puzzleId.startsWith("toy_")));
                        } catch (e) {}
                      }
                      return false;
                    }
                  },
                  {
                    id: "high_yarn",
                    title: "Зажиточный Клубок 🧶",
                    desc: "Накопи 1000 или более обычной пряжи одновременно.",
                    gYarnReward: 10,
                    check: () => yarnCount >= 1000
                  },
                  {
                    id: "three_cats",
                    title: "Кошачий Приют 🐈‍⬛",
                    desc: "Собери коллекцию из 3 завершённых картин с котиками.",
                    gYarnReward: 10,
                    check: () => {
                      return completedPuzzles.filter(pId => {
                        const templ = allAvailablePuzzles.find(t => t.id === pId);
                        return templ && templ.category === "cats";
                      }).length >= 3;
                    }
                  }
                ]).map((acc) => {
                  const isCompleted = acc.check();
                  const isClaimed = claimedAchievements.includes(acc.id);

                  return (
                    <div
                      key={acc.id}
                      className={`p-3 rounded-2xl border flex flex-col justify-between gap-2.5 transition-all ${
                        isClaimed
                          ? "bg-slate-50 border-slate-200 opacity-65 font-medium"
                          : isCompleted
                          ? "bg-amber-500/5 border-amber-300 shadow-xs"
                          : "bg-white border-slate-100"
                      }`}
                    >
                      <div className="flex justify-between items-start gap-1">
                        <div>
                          <h4 className="text-[11px] font-bold text-slate-800 leading-tight uppercase font-pixel tracking-tight">
                            {acc.title}
                          </h4>
                          <p className="text-[9px] text-slate-500 leading-normal mt-0.5 font-semibold">
                            {acc.desc}
                          </p>
                        </div>
                        <span className="text-[9px] font-pixel bg-sky-200 text-sky-900 border border-sky-300 px-1.5 py-0.5 rounded-full shrink-0 font-bold">
                          +{acc.gYarnReward} 💎
                        </span>
                      </div>

                      <div className="w-full">
                        {isClaimed ? (
                          <span className="text-[8px] font-pixel text-slate-400 flex items-center justify-center gap-0.5 font-bold uppercase">
                            ✓ НАГРАДА ПОЛУЧЕНА
                          </span>
                        ) : isCompleted ? (
                          <button
                            onClick={() => {
                              updateGoldYarn(goldYarnCount + acc.gYarnReward);
                              updateClaimedAchievements([...claimedAchievements, acc.id]);
                              SOUNDS.playSuccessColor();
                            }}
                            className="w-full text-center bg-sky-500 hover:bg-sky-600 text-white font-black py-1 rounded-lg text-[8px] font-pixel cursor-pointer tracking-wider animate-bounce uppercase shadow-xs duration-150"
                          >
                            Забрать Награду! 💎
                          </button>
                        ) : (
                          <span className="text-[8px] font-pixel text-slate-400 flex items-center justify-center gap-0.5 font-bold uppercase">
                            🔒 В ПРОЦЕССЕ ВЫПОЛНЕНИЯ
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                id="achievements-close-bottom-btn"
                onClick={() => {
                  setShowAchievementsModal(false);
                  SOUNDS.playPop(1.1);
                }}
                className="w-full shrink-0 mt-2 bg-amber-500 text-slate-950 font-pixel text-xs p-2.5 rounded-2xl hover:bg-amber-400 shadow-sm transition-colors cursor-pointer uppercase font-bold text-center"
              >
                Закрыть 🐾
              </button>
            </div>
          </div>
        )}

          </>
        )}

      </div>
    </div>
  );
}
