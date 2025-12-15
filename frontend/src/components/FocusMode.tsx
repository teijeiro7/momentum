import { useState, useEffect, useRef } from "react";

type Strategy = "pomodoro" | "52-17" | "deepWork" | "custom";
type TimerMode = "work" | "break";

const STRATEGIES = {
  pomodoro: {
    name: "Pomodoro",
    icon: "🍅",
    description: "25 min work, 5 min break",
    work: 25 * 60,
    break: 5 * 60,
    longBreak: 15 * 60,
    cyclesBeforeLongBreak: 4,
  },
  "52-17": {
    name: "52-17",
    icon: "⚡",
    description: "52 min work, 17 min break",
    work: 52 * 60,
    break: 17 * 60,
    longBreak: 17 * 60,
    cyclesBeforeLongBreak: 1,
  },
  deepWork: {
    name: "Deep Work",
    icon: "🎯",
    description: "90 min work, 20 min break",
    work: 90 * 60,
    break: 20 * 60,
    longBreak: 30 * 60,
    cyclesBeforeLongBreak: 2,
  },
  custom: {
    name: "Custom",
    icon: "⚙️",
    description: "Set your own times",
    work: 45 * 60,
    break: 15 * 60,
    longBreak: 30 * 60,
    cyclesBeforeLongBreak: 3,
  },
};

export default function FocusMode() {
  const [strategy, setStrategy] = useState<Strategy>("pomodoro");
  const [mode, setMode] = useState<TimerMode>("work");
  const [timeLeft, setTimeLeft] = useState(STRATEGIES.pomodoro.work);
  const [isRunning, setIsRunning] = useState(false);
  const [completedCycles, setCompletedCycles] = useState(0);
  const [customWork, setCustomWork] = useState(45);
  const [customBreak, setCustomBreak] = useState(15);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft]);

  const handleTimerComplete = () => {
    setIsRunning(false);

    if (mode === "work") {
      const newCount = completedCycles + 1;
      setCompletedCycles(newCount);

      const currentStrategy = STRATEGIES[strategy];
      if (newCount % currentStrategy.cyclesBeforeLongBreak === 0) {
        setMode("break");
        setTimeLeft(currentStrategy.longBreak);
      } else {
        setMode("break");
        setTimeLeft(currentStrategy.break);
      }
    } else {
      setMode("work");
      setTimeLeft(STRATEGIES[strategy].work);
    }

    playNotificationSound();
  };

  const playNotificationSound = () => {
    try {
      const audio = new Audio(
        "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZURE"
      );
      audio.play();
    } catch (err) {
      console.log("Audio playback failed");
    }
  };

  const switchStrategy = (newStrategy: Strategy) => {
    setStrategy(newStrategy);
    setMode("work");
    if (newStrategy === "custom") {
      setTimeLeft(customWork * 60);
    } else {
      setTimeLeft(STRATEGIES[newStrategy].work);
    }
    setIsRunning(false);
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setMode("work");
    if (strategy === "custom") {
      setTimeLeft(customWork * 60);
    } else {
      setTimeLeft(STRATEGIES[strategy].work);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const getCurrentDuration = () => {
    if (strategy === "custom") {
      return mode === "work" ? customWork * 60 : customBreak * 60;
    }
    return mode === "work"
      ? STRATEGIES[strategy].work
      : STRATEGIES[strategy].break;
  };

  const progress =
    ((getCurrentDuration() - timeLeft) / getCurrentDuration()) * 100;
  const totalFocusTime =
    completedCycles *
    (strategy === "custom" ? customWork : STRATEGIES[strategy].work / 60);

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2 gradient-text">
          🧠 Deep Work Timer
        </h1>
        <p style={{ color: "var(--text-muted)" }}>
          Choose your focus strategy and maximize productivity
        </p>
      </div>

      {/* Strategy Selector */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {(Object.keys(STRATEGIES) as Strategy[]).map((key) => {
          const strat = STRATEGIES[key];
          return (
            <button
              key={key}
              onClick={() => switchStrategy(key)}
              className="p-4 rounded-xl transition-all duration-200 hover-lift text-left"
              style={{
                background:
                  strategy === key ? "var(--accent-glow)" : "var(--bg-card)",
                border:
                  strategy === key
                    ? "2px solid var(--accent-neon)"
                    : "2px solid var(--border)",
              }}
            >
              <div className="text-2xl mb-1">{strat.icon}</div>
              <div
                className="font-semibold mb-1"
                style={{
                  color:
                    strategy === key
                      ? "var(--accent-neon)"
                      : "var(--text-primary)",
                }}
              >
                {strat.name}
              </div>
              <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                {strat.description}
              </div>
            </button>
          );
        })}
      </div>

      {/* Custom Settings */}
      {strategy === "custom" && (
        <div
          className="rounded-xl p-6 mb-8"
          style={{
            background: "var(--bg-card)",
            border: "2px solid var(--border)",
          }}
        >
          <h3
            className="font-semibold mb-4"
            style={{ color: "var(--text-primary)" }}
          >
            ⚙️ Custom Settings
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                className="block text-sm mb-2"
                style={{ color: "var(--text-secondary)" }}
              >
                Work Duration (minutes)
              </label>
              <input
                type="number"
                value={customWork}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 1;
                  setCustomWork(val);
                  if (mode === "work" && !isRunning) {
                    setTimeLeft(val * 60);
                  }
                }}
                className="w-full px-4 py-2 rounded-lg"
                style={{
                  background: "var(--bg-tertiary)",
                  border: "1px solid var(--border)",
                  color: "var(--text-primary)",
                }}
                min="1"
                max="180"
              />
            </div>
            <div>
              <label
                className="block text-sm mb-2"
                style={{ color: "var(--text-secondary)" }}
              >
                Break Duration (minutes)
              </label>
              <input
                type="number"
                value={customBreak}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 1;
                  setCustomBreak(val);
                  if (mode === "break" && !isRunning) {
                    setTimeLeft(val * 60);
                  }
                }}
                className="w-full px-4 py-2 rounded-lg"
                style={{
                  background: "var(--bg-tertiary)",
                  border: "1px solid var(--border)",
                  color: "var(--text-primary)",
                }}
                min="1"
                max="60"
              />
            </div>
          </div>
        </div>
      )}

      {/* Timer Display */}
      <div
        className="rounded-2xl p-12 mb-8"
        style={{
          background: "var(--gradient-card)",
          border: "2px solid var(--border)",
        }}
      >
        <div className="flex justify-center mb-8" style={{ padding: "1rem" }}>
          <div className="relative" style={{ width: "240px", height: "240px" }}>
            <svg width="240" height="240" style={{ overflow: "visible" }}>
              <circle
                cx="120"
                cy="120"
                r="110"
                stroke="var(--inactive)"
                strokeWidth="12"
                fill="none"
              />
              <circle
                cx="120"
                cy="120"
                r="110"
                stroke={
                  mode === "work"
                    ? "var(--accent-neon)"
                    : "var(--accent-growth)"
                }
                strokeWidth="12"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 110}`}
                strokeDashoffset={`${2 * Math.PI * 110 * (1 - progress / 100)}`}
                className="transition-all duration-1000"
                style={{
                  filter: `drop-shadow(0 0 12px ${
                    mode === "work"
                      ? "var(--accent-neon)"
                      : "var(--accent-growth)"
                  })`,
                  transform: "rotate(-90deg)",
                  transformOrigin: "center",
                }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-6xl font-bold gradient-text mb-2">
                {formatTime(timeLeft)}
              </span>
              <span
                className="text-sm mb-1"
                style={{ color: "var(--text-muted)" }}
              >
                {mode === "work" ? "🎯 Focus Time" : "☕ Break Time"}
              </span>
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                {STRATEGIES[strategy].name}
              </span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={toggleTimer}
            className="px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 hover-lift hover-glow"
            style={{
              background: "var(--gradient-primary)",
              color: "var(--bg-primary)",
            }}
          >
            {isRunning ? "⏸ Pause" : "▶ Start"}
          </button>
          <button
            onClick={resetTimer}
            className="px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 hover-lift"
            style={{
              background: "var(--bg-card)",
              border: "2px solid var(--border)",
              color: "var(--text-primary)",
            }}
          >
            🔄 Reset
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div
          className="rounded-xl p-6 text-center"
          style={{
            background: "var(--gradient-card)",
            border: "2px solid var(--border)",
          }}
        >
          <div className="text-3xl mb-2">🎯</div>
          <p className="text-3xl font-bold gradient-text">{completedCycles}</p>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            Sessions Today
          </p>
        </div>
        <div
          className="rounded-xl p-6 text-center"
          style={{
            background: "var(--gradient-card)",
            border: "2px solid var(--border)",
          }}
        >
          <div className="text-3xl mb-2">⏱️</div>
          <p
            className="text-3xl font-bold"
            style={{ color: "var(--accent-neon)" }}
          >
            {Math.floor(totalFocusTime / 60)}h {Math.floor(totalFocusTime % 60)}
            m
          </p>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            Total Focus
          </p>
        </div>
      </div>

      {/* Strategy Info */}
      <div
        className="rounded-xl p-6"
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
        }}
      >
        <h3
          className="font-semibold mb-3"
          style={{ color: "var(--text-primary)" }}
        >
          💡 About {STRATEGIES[strategy].name}
        </h3>
        <div
          className="space-y-2 text-sm"
          style={{ color: "var(--text-secondary)" }}
        >
          {strategy === "pomodoro" && (
            <>
              <p>• Classic time management technique by Francesco Cirillo</p>
              <p>• Work in focused 25-minute intervals</p>
              <p>• Short breaks prevent burnout</p>
              <p>• Long break after 4 sessions for recovery</p>
            </>
          )}
          {strategy === "52-17" && (
            <>
              <p>• Based on DeskTime productivity research</p>
              <p>• 52 minutes is the optimal focus duration</p>
              <p>• 17-minute breaks maximize recovery</p>
              <p>• Perfect for sustained deep work sessions</p>
            </>
          )}
          {strategy === "deepWork" && (
            <>
              <p>• Inspired by Cal Newport's Deep Work methodology</p>
              <p>• 90-minute sessions align with ultradian rhythms</p>
              <p>• Longer breaks for mental recovery</p>
              <p>• Ideal for complex, cognitively demanding tasks</p>
            </>
          )}
          {strategy === "custom" && (
            <>
              <p>• Customize work and break durations to fit your needs</p>
              <p>• Experiment to find your optimal rhythm</p>
              <p>• Adjust based on task complexity and energy levels</p>
              <p>• Track what works best for you</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
