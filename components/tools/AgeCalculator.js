import React, { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import { Calendar, Clock, Heart, Star, Gift, Target, TrendingUp, Info } from 'lucide-react';
import AffiliateRecommendations from '../AffiliateRecommendations';
import { CalcLayout } from '../calculator/CalcLayout';
import Card from '../ui/Card';
import { cn } from '../ui/cn';

const fieldLabel = 'mb-1.5 flex items-center gap-1.5 text-sm font-medium text-ink-soft dark:text-slate-300';
const fieldInput =
  'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-[0.95rem] text-ink shadow-sm outline-none ' +
  'transition focus:border-brand-400 focus:ring-2 focus:ring-brand-500/30 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100';
const sectionHeading =
  'mb-6 flex items-center justify-center gap-2 text-center font-display text-xl font-bold text-ink sm:text-2xl dark:text-white';
const statCard =
  'rounded-xl border border-slate-200 bg-white p-4 text-center transition duration-200 ' +
  'hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-card ' +
  'dark:border-slate-700 dark:bg-slate-800/60 dark:hover:border-slate-600';

const FAQ = [
  { question: 'How do I calculate my exact age?', answer: 'Enter your birth date (and optionally a target date — it defaults to today). The calculator returns your age in completed years, months, and days, plus totals like days lived, hours, and minutes, alongside milestones and your zodiac sign.' },
  { question: 'How does the calculator handle months of different lengths?', answer: 'It counts completed calendar years and months first, then the leftover days against the actual month lengths involved — the same convention used for official purposes. Leap years are included, which is why total-days figures differ slightly from multiplying years by 365.' },
  { question: 'What is my age if I was born on 29 February?', answer: 'You age normally — one year per calendar year. In non-leap years, most legal systems treat 1 March as the day a leap-day birthday completes another year (some, like New Zealand, use 28 February). Celebrations are a matter of taste.' },
  { question: 'What is the difference between completed age and "running" age?', answer: 'Completed age is how many full years you have finished — the figure on forms and official documents. Running age, common in Indian usage, is the year you are currently in: someone aged 35 years 10 months is "running 36". This calculator shows completed age.' },
  { question: 'How accurate are fun facts like heartbeats and breaths?', answer: 'They are estimates from average resting rates (roughly 70 heartbeats and 12–16 breaths per minute) applied to your exact days lived. Individual rates vary with fitness, health, and age, so treat them as illustrations, not measurements.' },
  { question: 'Can I calculate age between two past dates?', answer: 'Yes — set the target date to any date you like. This is handy for working out age on a document date, an exam-eligibility cutoff, or how old someone was on a historical event.' }
];

const AgeCalculator = () => {
  const [activeTab, setActiveTab] = useState('age-calculator');
  
  // Age Calculator State
  const [ageParams, setAgeParams] = useState({
    birthDate: '1990-01-01',
    targetDate: new Date().toISOString().split('T')[0], // Today's date
    gender: 'neutral' // Default to neutral
  });

  // Life Events State
  const [lifeEventsParams, setLifeEventsParams] = useState({
    birthDate: '1990-01-01',
    retirementAge: 60,
    lifeExpectancy: 75
  });

  // Results
  const [ageResult, setAgeResult] = useState(null);
  const [lifeEventsResult, setLifeEventsResult] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Animation keyframes
  const animations = `
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    @keyframes scaleIn {
      from {
        opacity: 0;
        transform: scale(0.8);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }
    @keyframes countUp {
      from {
        opacity: 0;
        transform: translateY(20px) scale(0.8);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }
    @keyframes pulse {
      0%, 100% {
        transform: scale(1);
      }
      50% {
        transform: scale(1.05);
      }
    }
    @keyframes rainbow {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
    @keyframes heartbeat {
      0%, 100% { transform: scale(1); }
      14% { transform: scale(1.1); }
      28% { transform: scale(1); }
      42% { transform: scale(1.1); }
      70% { transform: scale(1); }
    }
    @keyframes faceTransform {
      0% { 
        transform: scale(0.8) rotate(-5deg);
        opacity: 0.7;
        filter: hue-rotate(0deg) brightness(1.1);
      }
      25% { 
        transform: scale(0.9) rotate(0deg);
        opacity: 0.85;
        filter: hue-rotate(90deg) brightness(1.05);
      }
      50% { 
        transform: scale(1) rotate(2deg);
        opacity: 1;
        filter: hue-rotate(180deg) brightness(1);
      }
      75% { 
        transform: scale(1.05) rotate(-1deg);
        opacity: 1;
        filter: hue-rotate(270deg) brightness(0.95);
      }
      100% { 
        transform: scale(1) rotate(0deg);
        opacity: 1;
        filter: hue-rotate(360deg) brightness(1);
      }
    }
    @keyframes ageTransition {
      0% { 
        transform: scale(0.5);
        opacity: 0;
      }
      50% { 
        transform: scale(1.2);
        opacity: 0.8;
      }
      100% { 
        transform: scale(1);
        opacity: 1;
      }
    }
    @keyframes glow {
      0%, 100% {
        box-shadow: 0 0 20px rgba(139, 92, 246, 0.3);
      }
      50% {
        box-shadow: 0 0 40px rgba(139, 92, 246, 0.6), 0 0 60px rgba(139, 92, 246, 0.3);
      }
    }
  `;

  // Calculate age with extreme precision
  const calculateAge = useCallback(async () => {
    setIsCalculating(true);
    
    // Simulate calculation for smooth UX
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const { birthDate, targetDate } = ageParams;
    
    if (!birthDate || !targetDate) {
      setIsCalculating(false);
      return;
    }

    const birth = new Date(birthDate);
    const target = new Date(targetDate);
    
    // Ensure target date is not before birth date
    if (target < birth) {
      setIsCalculating(false);
      return;
    }

    // Calculate exact age
    let years = target.getFullYear() - birth.getFullYear();
    let months = target.getMonth() - birth.getMonth();
    let days = target.getDate() - birth.getDate();

    // Adjust for negative days
    if (days < 0) {
      months--;
      const lastMonth = new Date(target.getFullYear(), target.getMonth(), 0);
      days += lastMonth.getDate();
    }

    // Adjust for negative months
    if (months < 0) {
      years--;
      months += 12;
    }

    // Calculate total days lived
    const totalDays = Math.floor((target - birth) / (1000 * 60 * 60 * 24));
    
    // Calculate total weeks
    const totalWeeks = Math.floor(totalDays / 7);
    
    // Calculate total months (approximate)
    const totalMonths = years * 12 + months;
    
    // Calculate total hours (approximate)
    const totalHours = totalDays * 24;
    
    // Calculate total minutes (approximate)
    const totalMinutes = totalHours * 60;
    
    // Calculate next birthday
    let nextBirthday = new Date(target.getFullYear(), birth.getMonth(), birth.getDate());
    if (nextBirthday <= target) {
      nextBirthday.setFullYear(nextBirthday.getFullYear() + 1);
    }
    const daysToNextBirthday = Math.ceil((nextBirthday - target) / (1000 * 60 * 60 * 24));
    
    // Calculate day of week born
    const dayOfWeekBorn = birth.toLocaleDateString('en-US', { weekday: 'long' });
    
    // Calculate zodiac sign
    const getZodiacSign = (date) => {
      const month = date.getMonth() + 1;
      const day = date.getDate();
      
      const signs = [
        { sign: 'Capricorn', start: [12, 22], end: [1, 19] },
        { sign: 'Aquarius', start: [1, 20], end: [2, 18] },
        { sign: 'Pisces', start: [2, 19], end: [3, 20] },
        { sign: 'Aries', start: [3, 21], end: [4, 19] },
        { sign: 'Taurus', start: [4, 20], end: [5, 20] },
        { sign: 'Gemini', start: [5, 21], end: [6, 20] },
        { sign: 'Cancer', start: [6, 21], end: [7, 22] },
        { sign: 'Leo', start: [7, 23], end: [8, 22] },
        { sign: 'Virgo', start: [8, 23], end: [9, 22] },
        { sign: 'Libra', start: [9, 23], end: [10, 22] },
        { sign: 'Scorpio', start: [10, 23], end: [11, 21] },
        { sign: 'Sagittarius', start: [11, 22], end: [12, 21] }
      ];
      
      for (let zodiac of signs) {
        const [startMonth, startDay] = zodiac.start;
        const [endMonth, endDay] = zodiac.end;
        
        if ((month === startMonth && day >= startDay) || 
            (month === endMonth && day <= endDay)) {
          return zodiac.sign;
        }
      }
      return 'Capricorn'; // Default fallback
    };

    const zodiacSign = getZodiacSign(birth);
    
    // Life stage calculation
    const getLifeStage = (ageInYears) => {
      if (ageInYears < 13) return { stage: 'Childhood', emoji: '👶', color: '#fbbf24' };
      if (ageInYears < 20) return { stage: 'Teenage', emoji: '🎒', color: '#34d399' };
      if (ageInYears < 30) return { stage: 'Young Adult', emoji: '🎓', color: '#60a5fa' };
      if (ageInYears < 45) return { stage: 'Adult', emoji: '💼', color: '#a78bfa' };
      if (ageInYears < 65) return { stage: 'Middle Age', emoji: '🏠', color: '#f87171' };
      return { stage: 'Senior', emoji: '👴', color: '#fbbf24' };
    };

    const lifeStage = getLifeStage(years);
    
    // Fun facts
    const funFacts = [
      `You've experienced approximately ${Math.floor(totalDays / 365.25 * 4)} seasons`,
      `Your heart has beaten approximately ${Math.floor(totalMinutes * 75).toLocaleString()} times`,
      `You've breathed approximately ${Math.floor(totalMinutes * 20).toLocaleString()} times`,
      `You've seen approximately ${Math.floor(years * 365.25)} sunrises and sunsets`,
      `You were born on a ${dayOfWeekBorn}`,
      `Your zodiac sign is ${zodiacSign} ✨`
    ];
    
    setAgeResult({
      years,
      months,
      days,
      totalDays,
      totalWeeks,
      totalMonths,
      totalHours,
      totalMinutes,
      daysToNextBirthday,
      nextBirthday,
      dayOfWeekBorn,
      zodiacSign,
      lifeStage,
      funFacts,
      birthDate: birth,
      targetDate: target
    });
    
    setIsCalculating(false);
  }, [ageParams]);

  // Calculate life events and milestones
  const calculateLifeEvents = useCallback(async () => {
    const { birthDate, retirementAge, lifeExpectancy } = lifeEventsParams;
    
    if (!birthDate) return;
    
    const birth = new Date(birthDate);
    const now = new Date();
    
    // Calculate current age
    const currentAge = now.getFullYear() - birth.getFullYear();
    
    // Calculate milestone dates
    const milestones = [
      { 
        age: 18, 
        event: 'Legal Adult', 
        emoji: '🎓',
        description: 'Can vote, drive, and make legal decisions'
      },
      { 
        age: 21, 
        event: 'Full Adult Rights', 
        emoji: '🍾',
        description: 'Full adult privileges in most countries'
      },
      { 
        age: 25, 
        event: 'Quarter Century', 
        emoji: '🎯',
        description: 'Peak physical and mental development'
      },
      { 
        age: 30, 
        event: 'Thirties Begin', 
        emoji: '💼',
        description: 'Career establishment phase'
      },
      { 
        age: 40, 
        event: 'Life Begins at 40', 
        emoji: '🌟',
        description: 'Wisdom and experience accumulation'
      },
      { 
        age: 50, 
        event: 'Half Century', 
        emoji: '🏆',
        description: 'Peak earning years typically'
      },
      { 
        age: retirementAge, 
        event: 'Retirement Age', 
        emoji: '🏖️',
        description: 'Time to enjoy the fruits of your labor'
      },
      { 
        age: lifeExpectancy, 
        event: 'Life Expectancy', 
        emoji: '💖',
        description: 'Celebrating a full life'
      }
    ];
    
    const processedMilestones = milestones.map(milestone => {
      const milestoneDate = new Date(birth);
      milestoneDate.setFullYear(birth.getFullYear() + milestone.age);
      
      const isPassed = currentAge >= milestone.age;
      const daysUntil = isPassed ? 0 : Math.ceil((milestoneDate - now) / (1000 * 60 * 60 * 24));
      const yearsUntil = Math.floor(daysUntil / 365.25);
      
      return {
        ...milestone,
        date: milestoneDate,
        isPassed,
        daysUntil,
        yearsUntil
      };
    });
    
    // Calculate life progress
    const lifeProgress = (currentAge / lifeExpectancy) * 100;
    const remainingYears = lifeExpectancy - currentAge;
    
    // Calculate seasons experienced
    const seasonsExperienced = Math.floor(currentAge * 4);
    
    setLifeEventsResult({
      currentAge,
      lifeExpectancy,
      lifeProgress,
      remainingYears,
      seasonsExperienced,
      milestones: processedMilestones
    });
  }, [lifeEventsParams]);

  // Auto-calculate when parameters change
  useEffect(() => {
    if (activeTab === 'age-calculator') {
      calculateAge();
    }
  }, [ageParams, activeTab, calculateAge]);

  useEffect(() => {
    if (activeTab === 'life-events') {
      calculateLifeEvents();
    }
  }, [lifeEventsParams, activeTab, calculateLifeEvents]);

  // Animated counter component
  const AnimatedCounter = ({ value, suffix = '', delay = 0, duration = 1.5 }) => {
    const [currentValue, setCurrentValue] = useState(0);
    
    useEffect(() => {
      const timer = setTimeout(() => {
        let start = 0;
        const end = value;
        const increment = end / (duration * 60); // 60fps
        
        const updateValue = () => {
          start += increment;
          if (start < end) {
            setCurrentValue(Math.floor(start));
            requestAnimationFrame(updateValue);
          } else {
            setCurrentValue(end);
          }
        };
        
        updateValue();
      }, delay * 1000);
      
      return () => clearTimeout(timer);
    }, [value, delay, duration]);
    
    return (
      <span style={{
        animation: `countUp 0.8s ease-out ${delay}s both`
      }}>
        {currentValue.toLocaleString()}{suffix}
      </span>
    );
  };

  // Progress circle component
  const ProgressCircle = ({ percentage, size = 120, strokeWidth = 8, delay = 0 }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDasharray = `${circumference} ${circumference}`;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;
    
    return (
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <svg
          width={size}
          height={size}
          style={{
            animation: `scaleIn 1s ease-out ${delay}s both`
          }}
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
            fill="none"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="url(#gradient)"
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{
              transition: 'stroke-dashoffset 2s ease-out',
              transitionDelay: `${delay}s`
            }}
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#1d4e89" />
              <stop offset="100%" stopColor="#0f766e" />
            </linearGradient>
          </defs>
        </svg>
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: `${size * 0.15}px`,
            fontWeight: '700',
            color: '#64748b',
            animation: `countUp 1s ease-out ${delay + 0.5}s both`
          }}>
            {percentage.toFixed(1)}%
          </div>
        </div>
      </div>
    );
  };

  // Face animation component
  const FaceAnimation = ({ currentAge, gender = 'neutral', delay = 0 }) => {
    const [currentStage, setCurrentStage] = useState(0);
    
    // Define face stages with emojis and ages for different genders
    const getFaceStages = (selectedGender) => {
      const stages = {
        male: [
          { age: 0, emoji: '👶', label: 'Baby', color: '#fbbf24' },
          { age: 5, emoji: '🧒', label: 'Child', color: '#34d399' },
          { age: 13, emoji: '👦', label: 'Teen Boy', color: '#60a5fa' },
          { age: 20, emoji: '🧑', label: 'Young Man', color: '#a78bfa' },
          { age: 30, emoji: '👨', label: 'Man', color: '#f87171' },
          { age: 45, emoji: '🧔', label: 'Middle Aged Man', color: '#fb923c' },
          { age: 65, emoji: '👴', label: 'Senior Man', color: '#94a3b8' }
        ],
        female: [
          { age: 0, emoji: '👶', label: 'Baby', color: '#fbbf24' },
          { age: 5, emoji: '🧒', label: 'Child', color: '#34d399' },
          { age: 13, emoji: '👧', label: 'Teen Girl', color: '#f472b6' },
          { age: 20, emoji: '👩', label: 'Young Woman', color: '#c084fc' },
          { age: 30, emoji: '👩‍💼', label: 'Woman', color: '#fb7185' },
          { age: 45, emoji: '👩‍🦳', label: 'Middle Aged Woman', color: '#fbbf24' },
          { age: 65, emoji: '👵', label: 'Senior Woman', color: '#a78bfa' }
        ],
        neutral: [
          { age: 0, emoji: '👶', label: 'Baby', color: '#fbbf24' },
          { age: 5, emoji: '🧒', label: 'Child', color: '#34d399' },
          { age: 13, emoji: '🧑‍🎓', label: 'Teen', color: '#60a5fa' },
          { age: 20, emoji: '🧑‍💼', label: 'Young Adult', color: '#a78bfa' },
          { age: 30, emoji: '🧑', label: 'Adult', color: '#f87171' },
          { age: 45, emoji: '🧑‍🏫', label: 'Middle Aged', color: '#fb923c' },
          { age: 65, emoji: '🧓', label: 'Senior', color: '#94a3b8' }
        ]
      };
      
      return stages[selectedGender] || stages.neutral;
    };

    const faceStages = getFaceStages(gender);
    
    // Find current stage based on age
    const getCurrentStage = (age) => {
      for (let i = faceStages.length - 1; i >= 0; i--) {
        if (age >= faceStages[i].age) {
          return i;
        }
      }
      return 0;
    };

    const targetStage = getCurrentStage(currentAge);

    useEffect(() => {
      const timer = setTimeout(() => {
        let stage = 0;
        const interval = setInterval(() => {
          setCurrentStage(stage);
          if (stage >= targetStage) {
            clearInterval(interval);
          } else {
            stage++;
          }
        }, 800); // Change face every 800ms

        return () => clearInterval(interval);
      }, delay * 1000);

      return () => clearTimeout(timer);
    }, [currentAge, targetStage, delay]);

    const currentFace = faceStages[currentStage] || faceStages[0];

    return (
      <div
        className="flex h-full w-full flex-col items-center gap-4 rounded-2xl border border-slate-200/70 bg-white p-8 text-center shadow-soft dark:border-slate-700/70 dark:bg-slate-800/70"
        style={{ animation: `scaleIn 1s ease-out ${delay}s both` }}
      >
        <div
          className="relative leading-none"
          style={{
            fontSize: '5rem',
            animation: currentStage <= targetStage ? 'ageTransition 0.8s ease-out' : 'none',
            filter: 'drop-shadow(0 4px 8px rgba(15, 42, 67, 0.12))'
          }}
        >
          {currentFace.emoji}
        </div>

        <div style={{ animation: `fadeInUp 0.5s ease-out ${delay + 0.5}s both` }}>
          <div className="font-display text-xl font-bold tracking-tight text-ink dark:text-white">
            {currentFace.label}
          </div>
          <div className="mt-1 text-sm font-medium text-ink-muted dark:text-slate-400">
            Age {currentAge} Years
          </div>
        </div>

        {/* Progress indicator */}
        <div className="mt-1 flex gap-2">
          {faceStages.map((stage, index) => (
            <div
              key={index}
              className={cn(
                'h-2.5 w-2.5 rounded-full transition-all duration-300',
                index <= currentStage ? 'bg-brand-500 dark:bg-brand-400' : 'bg-slate-200 dark:bg-slate-600'
              )}
              style={{ transform: index === currentStage ? 'scale(1.3)' : 'scale(1)' }}
              title={`${stage.label} (${stage.age}+ years)`}
            />
          ))}
        </div>

        {/* Life stage description */}
        <div
          className="mt-1 max-w-[300px] rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/60"
          style={{ animation: `fadeInUp 0.5s ease-out ${delay + 1}s both` }}
        >
          <div className="text-sm leading-relaxed text-ink-soft dark:text-slate-300">
            {getLifeStageDescription(currentAge, currentFace.label, gender)}
          </div>
        </div>
      </div>
    );
  };

  // Helper function for life stage descriptions
  const getLifeStageDescription = (age, stage, gender = 'neutral') => {
    const descriptions = {
      male: {
        'Baby': `At ${age} ${age === 1 ? 'year' : 'years'} old, you're in the precious early years of discovery and growth. Every day brings new milestones! 🍼`,
        'Child': `At ${age} years old, you're in the wonderful phase of curiosity and learning. The world is full of adventures waiting to be explored! 🌟`,
        'Teen Boy': `At ${age} years old, you're navigating the exciting teenage years. It's a time of self-discovery, friendships, and preparing for the future! 🚀`,
        'Young Man': `At ${age} years old, you're in your prime! This is typically the time for career building, relationships, and making important life decisions. 💪`,
        'Man': `At ${age} years old, you're likely in your peak productive years. Many men at this stage are establishing careers, families, and building their legacy. 🏆`,
        'Middle Aged Man': `At ${age} years old, you've gained significant life experience and wisdom. This is often a time of reflection and enjoying the fruits of your labor. 🌺`,
        'Senior Man': `At ${age} years old, you're in the golden years of life! You've seen so much and have incredible stories and wisdom to share. 🌅`
      },
      female: {
        'Baby': `At ${age} ${age === 1 ? 'year' : 'years'} old, you're in the precious early years of discovery and growth. Every day brings new milestones! 🍼`,
        'Child': `At ${age} years old, you're in the wonderful phase of curiosity and learning. The world is full of adventures waiting to be explored! 🌟`,
        'Teen Girl': `At ${age} years old, you're navigating the exciting teenage years. It's a time of self-discovery, friendships, and preparing for amazing opportunities ahead! ✨`,
        'Young Woman': `At ${age} years old, you're in your prime! This is typically the time for career building, relationships, and making important life decisions. 💫`,
        'Woman': `At ${age} years old, you're likely in your peak productive years. Many women at this stage are excelling in careers, nurturing families, and creating their legacy. 👑`,
        'Middle Aged Woman': `At ${age} years old, you've gained significant life experience and wisdom. This is often a time of empowerment and enjoying your accomplishments. 🌸`,
        'Senior Woman': `At ${age} years old, you're in the golden years of life! You've achieved so much and have incredible stories and wisdom to share. 🌅`
      },
      neutral: {
        'Baby': `At ${age} ${age === 1 ? 'year' : 'years'} old, you're in the precious early years of discovery and growth. Every day brings new milestones! 🍼`,
        'Child': `At ${age} years old, you're in the wonderful phase of curiosity and learning. The world is full of adventures waiting to be explored! 🌟`,
        'Teen': `At ${age} years old, you're navigating the exciting teenage years. It's a time of self-discovery, friendships, and preparing for the future! 🚀`,
        'Young Adult': `At ${age} years old, you're in your prime! This is typically the time for career building, relationships, and making important life decisions. 💪`,
        'Adult': `At ${age} years old, you're likely in your peak productive years. Many people at this stage are establishing careers, families, and building their legacy. 🏆`,
        'Middle Aged': `At ${age} years old, you've gained significant life experience and wisdom. This is often a time of reflection and enjoying the fruits of your labor. 🌺`,
        'Senior': `At ${age} years old, you're in the golden years of life! You've seen so much and have incredible stories and wisdom to share. 🌅`
      }
    };
    
    const genderDescriptions = descriptions[gender] || descriptions.neutral;
    return genderDescriptions[stage] || `At ${age} years old, you're on a unique life journey filled with experiences and growth!`;
  };

  return (
    <>
      <style>{animations}</style>

      <Head>
        <title>Age Calculator | Free Age Calculator India | Years Months Days | Upaman</title>
        <meta name="description" content="Free Age Calculator India. Calculate exact age in years, months, days with life milestones, zodiac sign, next birthday countdown. Unique face animation by Upaman." />
        <meta name="keywords" content="age calculator India, age calculator upaman, exact age calculator, age in days calculator, birthday calculator, life milestones calculator, zodiac calculator upaman" />
        <link rel="canonical" href="https://upaman.com/age-calculator" />
        
        {/* Open Graph Tags */}
        <meta property="og:title" content="Age Calculator | Free Age Calculator India | Upaman" />
        <meta property="og:description" content="Calculate exact age with life milestones and face animation. Free age calculator by Upaman." />
        <meta property="og:url" content="https://upaman.com/age-calculator" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Upaman" />
        
        {/* Twitter Cards */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Age Calculator | Free Age Calculator | Upaman" />
        <meta name="twitter:description" content="Calculate exact age with life milestones and zodiac sign. Free age calculator by Upaman." />
        
        {/* Schema Markup */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Age Calculator India",
            "url": "https://upaman.com/age-calculator",
            "description": "Free age calculator with exact age calculation, life milestones, and zodiac sign detection by Upaman",
            "applicationCategory": "UtilityApplication",
            "operatingSystem": "Web Browser",
            "author": {
              "@type": "Organization",
              "name": "Upaman",
              "url": "https://upaman.com"
            },
            "publisher": {
              "@type": "Organization",
              "name": "Upaman",
              "url": "https://upaman.com"
            },
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "INR"
            },
            "featureList": [
              "Exact Age Calculator",
              "Life Milestones Timeline", 
              "Zodiac Sign Calculator",
              "Birthday Countdown",
              "Face Animation"
            ]
          })
        }} />
        
        {/* FAQ Schema — built from the same FAQ list rendered on the page */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": FAQ.map(({ question, answer }) => ({
              "@type": "Question",
              "name": question,
              "acceptedAnswer": { "@type": "Answer", "text": answer }
            }))
          })
        }} />
        
        {/* HowTo Schema */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "HowTo",
            "name": "How to Use Age Calculator",
            "description": "Step-by-step guide to calculate your exact age and explore life milestones",
            "image": "https://upaman.com/images/age-calculator-howto.jpg",
            "totalTime": "PT2M",
            "supply": [
              {
                "@type": "HowToSupply",
                "name": "Birth Date"
              },
              {
                "@type": "HowToSupply", 
                "name": "Target Date (optional)"
              }
            ],
            "step": [
              {
                "@type": "HowToStep",
                "name": "Enter Birth Date",
                "text": "Select your birth date from the date picker",
                "image": "https://upaman.com/images/step1-birth-date.jpg"
              },
              {
                "@type": "HowToStep",
                "name": "Choose Gender (Optional)",
                "text": "Select your gender for personalized face animation",
                "image": "https://upaman.com/images/step2-gender.jpg"
              },
              {
                "@type": "HowToStep",
                "name": "View Results",
                "text": "See your exact age, face animation, and life milestones",
                "image": "https://upaman.com/images/step3-results.jpg"
              }
            ]
          })
        }} />
      </Head>

      <CalcLayout
        eyebrow="Everyday Tools"
        title="Age Calculator & Life Timeline"
        subtitle="Calculate your exact age in years, months and days — with life milestones, zodiac sign, and a birthday countdown."
      >
        <div className="mb-6 inline-flex flex-wrap gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-800/60" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'age-calculator'}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-sm font-medium transition ${activeTab === 'age-calculator' ? 'bg-white text-brand-700 shadow-sm dark:bg-slate-700 dark:text-white' : 'text-ink-muted hover:text-ink dark:text-slate-400'}`}
            onClick={() => setActiveTab('age-calculator')}
          >
            <Clock size={16} />
            Age Calculator
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'life-events'}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-sm font-medium transition ${activeTab === 'life-events' ? 'bg-white text-brand-700 shadow-sm dark:bg-slate-700 dark:text-white' : 'text-ink-muted hover:text-ink dark:text-slate-400'}`}
            onClick={() => setActiveTab('life-events')}
          >
            <Target size={16} />
            Life Milestones
          </button>
        </div>

        <div>
          {/* Age Calculator Tab */}
          {activeTab === 'age-calculator' && (
            <div style={{ animation: 'fadeInUp 0.4s ease-out' }}>
              <h2 className={sectionHeading}>
                <Heart size={22} className="text-brand-600 dark:text-brand-300" />
                Exact Age Calculator
              </h2>

              {/* Input Section */}
              <Card className="mb-8 p-5">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label className={fieldLabel}>
                      <Gift size={16} className="text-brand-600 dark:text-brand-300" />
                      Birth Date
                    </label>
                    <input
                      type="date"
                      value={ageParams.birthDate}
                      onChange={(e) => setAgeParams(prev => ({...prev, birthDate: e.target.value}))}
                      className={fieldInput}
                    />
                  </div>

                  <div>
                    <label className={fieldLabel}>
                      <Calendar size={16} className="text-brand-600 dark:text-brand-300" />
                      Calculate Age On
                    </label>
                    <input
                      type="date"
                      value={ageParams.targetDate}
                      onChange={(e) => setAgeParams(prev => ({...prev, targetDate: e.target.value}))}
                      className={fieldInput}
                    />
                  </div>

                  <div>
                    <label className={fieldLabel}>
                      <Star size={16} className="text-brand-600 dark:text-brand-300" />
                      Gender (Optional)
                    </label>
                    <select
                      value={ageParams.gender}
                      onChange={(e) => setAgeParams(prev => ({...prev, gender: e.target.value}))}
                      className={fieldInput}
                    >
                      <option value="neutral">👤 Neutral</option>
                      <option value="male">👨 Male</option>
                      <option value="female">👩 Female</option>
                    </select>
                  </div>
                </div>
              </Card>

              {/* Results Section */}
              {(ageResult || isCalculating) && (
                <div style={{
                  animation: 'fadeInUp 0.6s ease-out 0.2s both'
                }}>
                  {isCalculating ? (
                    <Card className="mb-8 flex flex-col items-center p-12">
                      <div style={{
                        width: '56px',
                        height: '56px',
                        border: '4px solid #e2e8f0',
                        borderTopColor: '#1d4e89',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        marginBottom: '1rem'
                      }} />
                      <style>
                        {`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}
                      </style>
                      <p className="text-center text-base font-medium text-ink-muted dark:text-slate-400">
                        Calculating your life journey...
                      </p>
                    </Card>
                  ) : ageResult && (
                    <>
                      {/* Face Animation & Age Display */}
                      <div className="mb-6 grid items-stretch gap-5 lg:grid-cols-2">
                        <div className="flex items-center justify-center">
                          <FaceAnimation currentAge={ageResult.years} gender={ageParams.gender} delay={0.5} />
                        </div>

                        <Card className="flex flex-col justify-center p-8 text-center">
                          <div className="font-display text-5xl font-extrabold tracking-tight text-ink sm:text-6xl dark:text-white">
                            <AnimatedCounter value={ageResult.years} delay={1.0} /> Years
                          </div>
                          <div className="mt-2 text-xl font-semibold text-ink-soft sm:text-2xl dark:text-slate-300">
                            <AnimatedCounter value={ageResult.months} delay={1.2} /> Months, {' '}
                            <AnimatedCounter value={ageResult.days} delay={1.4} /> Days
                          </div>

                          {/* Zodiac and Birth Info */}
                          <div className="mx-auto mt-5 inline-flex flex-wrap items-center justify-center gap-x-4 gap-y-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 dark:border-slate-700 dark:bg-slate-800/60">
                            <span className="text-base font-semibold text-ink dark:text-white">🌟 {ageResult.zodiacSign}</span>
                            <span className="text-sm text-ink-muted dark:text-slate-400">Born on a {ageResult.dayOfWeekBorn}</span>
                          </div>
                        </Card>
                      </div>

                      {/* Statistics Grid */}
                      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
                        {[
                          { label: 'Total Days', value: ageResult.totalDays, icon: '📅', delay: 0.1 },
                          { label: 'Total Weeks', value: ageResult.totalWeeks, icon: '🗓️', delay: 0.2 },
                          { label: 'Total Hours', value: ageResult.totalHours, suffix: '+', icon: '⏰', delay: 0.3 },
                          { label: 'Total Minutes', value: ageResult.totalMinutes, suffix: '+', icon: '⏱️', delay: 0.4 }
                        ].map((stat) => (
                          <div key={stat.label} className={statCard}>
                            <div className="mb-1 text-2xl">{stat.icon}</div>
                            <div className="font-display text-xl font-bold tracking-tight text-ink sm:text-2xl dark:text-white">
                              <AnimatedCounter
                                value={stat.value}
                                suffix={stat.suffix || ''}
                                delay={stat.delay + 0.5}
                              />
                            </div>
                            <div className="mt-0.5 text-xs font-medium uppercase tracking-wide text-ink-muted dark:text-slate-400">
                              {stat.label}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Next Birthday Countdown */}
                      <Card className="mb-6 border-brand-200 bg-brand-50/60 p-6 text-center dark:border-brand-800/60 dark:bg-brand-900/20">
                        <div className="mb-1 text-3xl">🎂</div>
                        <h3 className="text-lg font-semibold text-ink dark:text-white">Next Birthday Countdown</h3>
                        <div className="mt-1 font-display text-2xl font-bold text-brand-700 dark:text-brand-300">
                          <AnimatedCounter value={ageResult.daysToNextBirthday} delay={1.0} /> Days to Go!
                        </div>
                        <div className="mt-1 text-sm text-ink-muted dark:text-slate-400">
                          {ageResult.nextBirthday.toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                      </Card>

                      {/* Fun Facts Section */}
                      <Card className="p-6">
                        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-ink dark:text-white">
                          <Star size={20} className="text-amber-500" />
                          Fun Facts About You
                        </h3>

                        <div className="grid gap-2.5">
                          {ageResult.funFacts.map((fact, index) => (
                            <div
                              key={index}
                              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-ink-soft dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300"
                              style={{ animation: 'fadeInUp 0.4s ease-out both', animationDelay: `${index * 60}ms` }}
                            >
                              ✨ {fact}
                            </div>
                          ))}
                        </div>
                      </Card>

                      {/* Affiliate Recommendations */}
                      <div className="mt-6">
                        <AffiliateRecommendations
                          calculatorType="age"
                          result={ageResult}
                          isDarkMode={false}
                        />
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Life Events Tab */}
          {activeTab === 'life-events' && (
            <div style={{ animation: 'fadeInUp 0.4s ease-out' }}>
              <h2 className={sectionHeading}>
                <TrendingUp size={22} className="text-brand-600 dark:text-brand-300" />
                Life Milestones &amp; Timeline
              </h2>

              {/* Input Section */}
              <Card className="mb-8 p-5">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label className={fieldLabel}>
                      <Gift size={16} className="text-brand-600 dark:text-brand-300" />
                      Birth Date
                    </label>
                    <input
                      type="date"
                      value={lifeEventsParams.birthDate}
                      onChange={(e) => setLifeEventsParams(prev => ({...prev, birthDate: e.target.value}))}
                      className={fieldInput}
                    />
                  </div>

                  <div>
                    <label className={fieldLabel}>
                      <Target size={16} className="text-brand-600 dark:text-brand-300" />
                      Retirement Age
                    </label>
                    <input
                      type="number"
                      value={lifeEventsParams.retirementAge}
                      onChange={(e) => setLifeEventsParams(prev => ({...prev, retirementAge: parseInt(e.target.value) || 60}))}
                      className={fieldInput}
                      min="50"
                      max="80"
                    />
                  </div>

                  <div>
                    <label className={fieldLabel}>
                      <Heart size={16} className="text-brand-600 dark:text-brand-300" />
                      Life Expectancy
                    </label>
                    <input
                      type="number"
                      value={lifeEventsParams.lifeExpectancy}
                      onChange={(e) => setLifeEventsParams(prev => ({...prev, lifeExpectancy: parseInt(e.target.value) || 75}))}
                      className={fieldInput}
                      min="60"
                      max="100"
                    />
                  </div>
                </div>
              </Card>

              {/* Life Progress */}
              {lifeEventsResult && (
                <div>
                  <Card className="mb-6 p-8 text-center">
                    <h3 className="mb-6 font-display text-xl font-bold text-ink dark:text-white">
                      Your Life Journey Progress
                    </h3>

                    <div className="flex flex-wrap items-center justify-center gap-8">
                      <ProgressCircle
                        percentage={lifeEventsResult.lifeProgress}
                        size={150}
                        delay={0.5}
                      />
                      <div className="text-left">
                        <div className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl dark:text-white">
                          <AnimatedCounter value={lifeEventsResult.currentAge} delay={1} /> Years Old
                        </div>
                        <div className="mt-1 text-base text-brand-700 dark:text-brand-300">
                          <AnimatedCounter value={lifeEventsResult.remainingYears} delay={1.2} /> Years Remaining
                        </div>
                        <div className="mt-0.5 text-sm text-ink-muted dark:text-slate-400">
                          <AnimatedCounter value={lifeEventsResult.seasonsExperienced} delay={1.4} /> Seasons Experienced
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Milestones Timeline */}
                  <Card className="p-6">
                    <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-ink dark:text-white">
                      <Info size={20} className="text-brand-600 dark:text-brand-300" />
                      Life Milestones Timeline
                    </h3>

                    <div className="grid gap-3">
                      {lifeEventsResult.milestones.map((milestone, index) => (
                        <div
                          key={milestone.age}
                          className={cn(
                            'relative rounded-xl border p-4',
                            milestone.isPassed
                              ? 'border-emerald-200 bg-emerald-50/70 dark:border-emerald-800/50 dark:bg-emerald-900/15'
                              : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800/60'
                          )}
                          style={{ animation: 'fadeInUp 0.4s ease-out both', animationDelay: `${index * 60}ms` }}
                        >
                          {milestone.isPassed && (
                            <div className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-xs text-white">
                              ✓
                            </div>
                          )}

                          <div className="flex flex-wrap items-center gap-4">
                            <div className="text-3xl">{milestone.emoji}</div>
                            <div className="min-w-[200px] flex-1">
                              <div className={cn(
                                'text-base font-semibold',
                                milestone.isPassed ? 'text-emerald-700 dark:text-emerald-400' : 'text-ink dark:text-white'
                              )}>
                                Age {milestone.age}: {milestone.event}
                              </div>
                              <div className={cn(
                                'text-sm',
                                milestone.isPassed ? 'text-emerald-800/80 dark:text-emerald-300/80' : 'text-ink-muted dark:text-slate-400'
                              )}>
                                {milestone.description}
                              </div>
                              <div className={cn(
                                'mt-1 text-sm font-medium',
                                milestone.isPassed ? 'text-teal-700 dark:text-teal-400' : 'text-brand-700 dark:text-brand-300'
                              )}>
                                {milestone.isPassed
                                  ? `✅ Completed on ${milestone.date.toLocaleDateString()}`
                                  : milestone.yearsUntil > 0
                                    ? `🎯 In ${milestone.yearsUntil} years (${milestone.daysUntil.toLocaleString()} days)`
                                    : `🎯 This year! (${milestone.daysUntil} days)`
                                }
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-12 max-w-3xl text-[0.95rem] leading-relaxed text-ink-soft dark:text-slate-300">
          <h2 className="font-display text-xl font-bold text-ink dark:text-white">Why &ldquo;how old am I?&rdquo; is a genuinely tricky question</h2>
          <p className="mt-3">
            Age feels like the simplest calculation there is, until you try to do it precisely. Months have four
            different lengths, leap years insert a day every four years (except three times every four hundred),
            and calendars — not arithmetic — define what a &ldquo;year older&rdquo; means. Take someone born on
            15 August 1990 asking their age on 5 July 2026. The calculator answers{' '}
            <strong className="text-ink dark:text-white">35 years, 10 months, 20 days</strong>: 35 complete
            calendar years on 15 August 2025, ten further complete months to 15 June 2026, and then 20 leftover
            days counted against June&rsquo;s actual length. The same span expressed as totals
            is 13,108 days or 1,872 weeks — figures you cannot get by multiplying 35 by 365, because nine leap
            days sit inside them. Counting completed calendar units first and leftover days last is the
            convention used by governments, schools, and courts, and it is the one used here.
          </p>

          <h3 className="mt-8 font-display text-lg font-semibold text-ink dark:text-white">Completed age vs running age</h3>
          <p className="mt-3">
            A frequent source of confusion in India: the person above is 35 by every official measure, but in
            everyday Indian usage they are &ldquo;running 36&rdquo; — in their 36th year of life, which begins
            the moment the 35th birthday passes. Insurance premiums are sometimes quoted on &ldquo;age next
            birthday&rdquo;, school cutoffs on &ldquo;age as on&rdquo; a specific date, and traditional East
            Asian reckonings once started everyone at one. When a form asks for age, it means completed years —
            the headline number this calculator shows. When a relative says the baby is &ldquo;running
            two&rdquo;, the child is one. Knowing which system a question uses matters more than the arithmetic.
          </p>

          <h3 className="mt-8 font-display text-lg font-semibold text-ink dark:text-white">Leap-day birthdays and other calendar corner cases</h3>
          <p className="mt-3">
            Roughly one in 1,461 people is born on 29 February and legally ages like everyone else — one year
            per calendar year — with jurisdictions differing only on <em>which day</em> the year completes when
            there is no 29th: most treat 1 March as the birthday in common years (New Zealand notably uses 28
            February). Month-end birthdays produce a similar wrinkle: someone born 31 January turns a month
            older on 28 or 29 February, because the &ldquo;same day next month&rdquo; does not exist. And ages
            measured <em>between two past dates</em> — for an exam-eligibility cutoff or a document — work
            exactly the same way; set the target date rather than using today. These edge cases are precisely
            why doing the calculation by calendar rules, rather than dividing days by 365.25, is worth a
            calculator at all.
          </p>

          <h3 className="mt-8 font-display text-lg font-semibold text-ink dark:text-white">What the fun facts are really telling you</h3>
          <p className="mt-3">
            The heartbeats, breaths, and sunrise counts are estimates built on averages — a resting heart rate
            near 70 beats a minute puts our 35-year-old around 1.3 billion heartbeats — and their point is
            perspective, not precision. The milestones tab does the same job more seriously: laying a life out
            against ages 18, 25, 60, and a chosen life expectancy turns an abstract number into elapsed and
            remaining time, which is often the nudge that makes long-horizon planning feel urgent. If the
            milestone that catches your eye is the financial one, that instinct has a natural next step — a
            35-year-old with 25 years to a retirement at 60 has exactly the input the{' '}
            <a href="/sip-calculator" className="font-medium text-brand-600 underline underline-offset-2 hover:text-brand-700 dark:text-brand-300">SIP calculator</a>{' '}
            needs, and the{' '}
            <a href="/compound-interest-calculator" className="font-medium text-brand-600 underline underline-offset-2 hover:text-brand-700 dark:text-brand-300">compound interest calculator</a>{' '}
            shows why the years-remaining number matters more than any contribution amount. Time, as both
            calculators demonstrate, is the one input you cannot raise later.
          </p>
        </div>

        <div className="mt-10">
          <h2 className="font-display text-xl font-bold text-ink dark:text-white">Age Calculator FAQ</h2>
          <div className="mt-4 grid gap-3">
            {FAQ.map(({ question, answer }) => (
              <details key={question} className="group rounded-xl border border-slate-200/70 bg-white p-4 dark:border-slate-700/70 dark:bg-slate-800/70">
                <summary className="cursor-pointer list-none font-semibold text-ink marker:hidden dark:text-white">{question}</summary>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted dark:text-slate-400">{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </CalcLayout>
    </>
  );
};

export default AgeCalculator;
