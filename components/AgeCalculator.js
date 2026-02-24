import React, { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import { Calendar, Clock, Heart, Star, Gift, Target, TrendingUp, Info } from 'lucide-react';
import AffiliateRecommendations from './AffiliateRecommendations';
import HomeButton from './HomeButton';

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
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#06b6d4" />
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
            color: '#374151',
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
          { age: 30, emoji: '🧑‍�', label: 'Adult', color: '#f87171' },
          { age: 45, emoji: '�‍🏫', label: 'Middle Aged', color: '#fb923c' },
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
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1rem',
        padding: '2rem',
        background: `linear-gradient(135deg, ${currentFace.color}20, ${currentFace.color}10)`,
        borderRadius: '2rem',
        border: `3px solid ${currentFace.color}40`,
        animation: `scaleIn 1s ease-out ${delay}s both`
      }}>
        <div style={{
          fontSize: '5rem',
          animation: currentStage <= targetStage ? 'ageTransition 0.8s ease-out' : 'none',
          transform: 'scale(1)',
          filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1))',
          position: 'relative'
        }}>
          {currentFace.emoji}
          
          {/* Glow effect for current stage */}
          {currentStage === targetStage && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              animation: 'glow 2s ease-in-out infinite',
              zIndex: -1
            }} />
          )}
        </div>
        
        <div style={{
          textAlign: 'center',
          animation: `fadeInUp 0.5s ease-out ${delay + 0.5}s both`
        }}>
          <div style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            color: currentFace.color,
            marginBottom: '0.5rem'
          }}>
            {currentFace.label}
          </div>
          <div style={{
            fontSize: '1rem',
            color: '#6b7280',
            fontWeight: '500'
          }}>
            Age {currentAge} Years
          </div>
        </div>

        {/* Progress indicator */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          marginTop: '1rem'
        }}>
          {faceStages.map((stage, index) => (
            <div
              key={index}
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: index <= currentStage 
                  ? `linear-gradient(135deg, ${stage.color}, ${stage.color}80)`
                  : '#e5e7eb',
                transition: 'all 0.3s ease',
                transform: index === currentStage ? 'scale(1.3)' : 'scale(1)',
                boxShadow: index === currentStage ? `0 0 10px ${stage.color}60` : 'none'
              }}
              title={`${stage.label} (${stage.age}+ years)`}
            />
          ))}
        </div>

        {/* Life stage description */}
        <div style={{
          marginTop: '1rem',
          padding: '1rem',
          background: 'rgba(255, 255, 255, 0.8)',
          borderRadius: '1rem',
          textAlign: 'center',
          maxWidth: '300px',
          animation: `fadeInUp 0.5s ease-out ${delay + 1}s both`
        }}>
          <div style={{
            fontSize: '0.9rem',
            color: '#374151',
            lineHeight: '1.4'
          }}>
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
    <div className="calculator-container age-container">
      <style>{animations}</style>
      
      <Head>
        <title>Age Calculator 2025 | Free Age Calculator India | Years Months Days | Upaman</title>
        <meta name="description" content="Free Age Calculator India 2025. Calculate exact age in years, months, days with life milestones, zodiac sign, next birthday countdown. Unique face animation by Upaman." />
        <meta name="keywords" content="age calculator India 2025, age calculator upaman, exact age calculator, age in days calculator, birthday calculator, life milestones calculator, zodiac calculator upaman" />
        <link rel="canonical" href="https://upaman.com/age-calculator" />
        
        {/* Open Graph Tags */}
        <meta property="og:title" content="Age Calculator 2025 | Free Age Calculator India | Upaman" />
        <meta property="og:description" content="Calculate exact age with life milestones and face animation. Free age calculator by Upaman." />
        <meta property="og:url" content="https://upaman.com/age-calculator" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://upaman.com/upaman-elephant-logo.svg" />
        <meta property="og:image:alt" content="Age Calculator - Upaman" />
        <meta property="og:site_name" content="Upaman" />
        
        {/* Twitter Cards */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Age Calculator 2025 | Free Age Calculator | Upaman" />
        <meta name="twitter:description" content="Calculate exact age with life milestones and zodiac sign. Free age calculator by Upaman." />
        <meta name="twitter:image" content="https://upaman.com/upaman-elephant-logo.svg" />
        <meta name="twitter:image:alt" content="Age Calculator - Upaman" />
        
        {/* Schema Markup */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Age Calculator 2025 India",
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
        
        {/* FAQ Schema */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "How do I calculate my exact age?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "To calculate exact age, enter your birth date and the date you want to calculate age for (usually today). Our calculator shows your age in years, months, days, plus total days lived, hours, and minutes. It also includes fun facts and life milestones."
                }
              },
              {
                "@type": "Question",
                "name": "What is the face animation feature?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Our unique face animation shows your life journey from baby to your current age stage. You can select your gender (male, female, or neutral) and watch as the emoji face transforms through different life stages - from baby 👶 to child 🧒 to teenager to adult and beyond."
                }
              },
              {
                "@type": "Question",
                "name": "How accurate is this age calculator?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Our age calculator is highly accurate, calculating exact age down to the day. It accounts for leap years and provides precise calculations for days lived, weeks, months, and even hours and minutes."
                }
              },
              {
                "@type": "Question",
                "name": "Can I see my life milestones?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes! Our calculator shows major life milestones like legal adulthood (18), quarter-century (25), retirement age (60), and life expectancy. It shows which milestones you've passed and when upcoming ones will occur."
                }
              },
              {
                "@type": "Question",
                "name": "What fun facts does the calculator show?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "The calculator shows interesting facts like total heartbeats, breaths taken, sunrises/sunsets witnessed, seasons experienced, zodiac sign, and the day of the week you were born on."
                }
              },
              {
                "@type": "Question",
                "name": "Is this age calculator free to use?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes, our age calculator is completely free to use with no registration required. It works on all devices - mobile, tablet, and desktop - with a responsive design."
                }
              }
            ]
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

      <div className="calculator-card" style={{
        animation: 'fadeInUp 0.6s ease-out'
      }}>
        <div className="calculator-header age-header">
          <div className="header-nav">
            <HomeButton />
            <div className="flex-spacer"></div>
          </div>
          
          <h1 className="header-title" style={{
            background: 'linear-gradient(135deg, #0f2a43, #1d4e89, #0f766e)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            <Calendar size={28} style={{ color: '#0f766e' }} />
            Age Calculator & Life Timeline
          </h1>
          
          <div className="mobile-tabs">
            <button
              className={`mobile-tab-button ${activeTab === 'age-calculator' ? 'active' : ''}`}
              onClick={() => setActiveTab('age-calculator')}
            >
              <Clock size={16} />
              Age Calculator
            </button>
            <button
              className={`mobile-tab-button ${activeTab === 'life-events' ? 'active' : ''}`}
              onClick={() => setActiveTab('life-events')}
            >
              <Target size={16} />
              Life Milestones
            </button>
          </div>
        </div>

        <div className="mobile-card-content">
          {/* Age Calculator Tab */}
          {activeTab === 'age-calculator' && (
            <div style={{ animation: 'fadeInUp 0.4s ease-out' }}>
              <h2 style={{
                fontSize: 'clamp(1.25rem, 3vw, 1.75rem)',
                fontWeight: '700',
                color: '#1e293b',
                textAlign: 'center',
                marginBottom: '2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}>
                <Heart 
                  size={24} 
                  style={{ 
                    color: '#0f766e',
                    animation: 'heartbeat 2s ease-in-out infinite' 
                  }} 
                />
                Exact Age Calculator
              </h2>

              {/* Input Section */}
              <div style={{
                background: 'linear-gradient(135deg, #eef9f8, #dff3f1)',
                padding: 'clamp(1rem, 4vw, 2rem)',
                borderRadius: '1.25rem',
                marginBottom: '2rem',
                border: '1px solid #b8e2dc'
              }}>
                <div className="responsive-grid">
                  <div>
                    <label className="input-label">
                      <Gift size={16} style={{ color: '#0f766e', marginRight: '0.25rem' }} />
                      Birth Date
                    </label>
                    <input
                      type="date"
                      value={ageParams.birthDate}
                      onChange={(e) => setAgeParams(prev => ({...prev, birthDate: e.target.value}))}
                      className="calculator-input mobile-input"
                      style={{
                        border: '2px solid #0f766e',
                        borderRadius: '0.75rem'
                      }}
                    />
                  </div>
                  
                  <div>
                    <label className="input-label">
                      <Calendar size={16} style={{ color: '#0f766e', marginRight: '0.25rem' }} />
                      Calculate Age On
                    </label>
                    <input
                      type="date"
                      value={ageParams.targetDate}
                      onChange={(e) => setAgeParams(prev => ({...prev, targetDate: e.target.value}))}
                      className="calculator-input mobile-input"
                      style={{
                        border: '2px solid #0f766e',
                        borderRadius: '0.75rem'
                      }}
                    />
                  </div>

                  <div>
                    <label className="input-label">
                      <Star size={16} style={{ color: '#0f766e', marginRight: '0.25rem' }} />
                      Gender (Optional)
                    </label>
                    <select
                      value={ageParams.gender}
                      onChange={(e) => setAgeParams(prev => ({...prev, gender: e.target.value}))}
                      className="calculator-input mobile-input"
                      style={{
                        border: '2px solid #0f766e',
                        borderRadius: '0.75rem',
                        backgroundColor: 'white'
                      }}
                    >
                      <option value="neutral">👤 Neutral</option>
                      <option value="male">👨 Male</option>
                      <option value="female">👩 Female</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Results Section */}
              {(ageResult || isCalculating) && (
                <div style={{
                  animation: 'fadeInUp 0.6s ease-out 0.2s both'
                }}>
                  {isCalculating ? (
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      padding: '3rem',
                      background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)',
                      borderRadius: '1rem',
                      marginBottom: '2rem'
                    }}>
                      <div style={{
                        width: '60px',
                        height: '60px',
                        border: '4px solid transparent',
                        borderTop: '4px solid #0f2a43',
                        borderRight: '4px solid #1d4e89',
                        borderBottom: '4px solid #0f766e',
                        borderLeft: '4px solid #b45309',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        marginBottom: '1rem'
                      }} />
                      <style>
                        {`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}
                      </style>
                      <p style={{ 
                        fontSize: '1.1rem', 
                        fontWeight: '500', 
                        color: '#374151',
                        textAlign: 'center'
                      }}>
                        Calculating your life journey...
                      </p>
                    </div>
                  ) : ageResult && (
                    <>
                      {/* Face Animation & Age Display */}
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                        gap: '2rem',
                        marginBottom: '2rem',
                        animation: 'fadeInUp 0.6s ease-out 0.2s both'
                      }}>
                        {/* Face Animation */}
                        <div style={{
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center'
                        }}>
                          <FaceAnimation currentAge={ageResult.years} gender={ageParams.gender} delay={0.5} />
                        </div>

                        {/* Age Statistics */}
                        <div style={{
                          background: `linear-gradient(135deg, ${ageResult.lifeStage.color}20, ${ageResult.lifeStage.color}10)`,
                          padding: '2rem',
                          borderRadius: '1.5rem',
                          textAlign: 'center',
                          border: `2px solid ${ageResult.lifeStage.color}40`,
                          animation: 'scaleIn 0.8s ease-out 0.8s both',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                          alignItems: 'center'
                        }}>
                          <h3 style={{
                            fontSize: 'clamp(2.5rem, 6vw, 4rem)',
                            fontWeight: '800',
                            color: ageResult.lifeStage.color,
                            marginBottom: '1rem',
                            textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                          }}>
                            <AnimatedCounter value={ageResult.years} delay={1.0} /> Years
                          </h3>
                          <div style={{
                            fontSize: 'clamp(1.25rem, 3vw, 1.75rem)',
                            fontWeight: '600',
                            color: '#374151',
                            marginBottom: '1rem'
                          }}>
                            <AnimatedCounter value={ageResult.months} delay={1.2} /> Months, {' '}
                            <AnimatedCounter value={ageResult.days} delay={1.4} /> Days
                          </div>
                          
                          {/* Zodiac and Birth Info */}
                          <div style={{
                            background: 'rgba(255, 255, 255, 0.7)',
                            padding: '1rem',
                            borderRadius: '1rem',
                            marginTop: '1rem',
                            width: '100%',
                            animation: `fadeInUp 0.5s ease-out 1.6s both`
                          }}>
                            <div style={{
                              fontSize: '1.1rem',
                              fontWeight: '600',
                              color: '#374151',
                              marginBottom: '0.5rem'
                            }}>
                              🌟 {ageResult.zodiacSign}
                            </div>
                            <div style={{
                              fontSize: '0.95rem',
                              color: '#6b7280'
                            }}>
                              Born on a {ageResult.dayOfWeekBorn}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Statistics Grid */}
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                        gap: '1rem',
                        marginBottom: '2rem'
                      }}>
                        {[
                          { 
                            label: 'Total Days', 
                            value: ageResult.totalDays, 
                            icon: '📅', 
                            color: '#3b82f6',
                            delay: 0.1
                          },
                          { 
                            label: 'Total Weeks', 
                            value: ageResult.totalWeeks, 
                            icon: '🗓️', 
                            color: '#10b981',
                            delay: 0.2
                          },
                          { 
                            label: 'Total Hours', 
                            value: ageResult.totalHours, 
                            suffix: '+',
                            icon: '⏰', 
                            color: '#f59e0b',
                            delay: 0.3
                          },
                          { 
                            label: 'Total Minutes', 
                            value: ageResult.totalMinutes, 
                            suffix: '+',
                            icon: '⏱️', 
                            color: '#ef4444',
                            delay: 0.4
                          }
                        ].map((stat) => (
                          <div
                            key={stat.label}
                            style={{
                              background: `linear-gradient(135deg, ${stat.color}15, ${stat.color}05)`,
                              border: `2px solid ${stat.color}30`,
                              borderRadius: '1rem',
                              padding: '1.5rem 1rem',
                              textAlign: 'center',
                              animation: `fadeInUp 0.6s ease-out ${stat.delay}s both`,
                              cursor: 'pointer',
                              transition: 'transform 0.3s ease'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                          >
                            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                              {stat.icon}
                            </div>
                            <div style={{
                              fontSize: 'clamp(1.25rem, 3vw, 1.5rem)',
                              fontWeight: '700',
                              color: stat.color,
                              marginBottom: '0.25rem'
                            }}>
                              <AnimatedCounter 
                                value={stat.value} 
                                suffix={stat.suffix || ''}
                                delay={stat.delay + 0.5} 
                              />
                            </div>
                            <div style={{
                              fontSize: '0.85rem',
                              color: '#6b7280',
                              fontWeight: '500'
                            }}>
                              {stat.label}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Next Birthday Countdown */}
                      <div style={{
                        background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
                        padding: '1.5rem',
                        borderRadius: '1rem',
                        marginBottom: '2rem',
                        textAlign: 'center',
                        animation: 'fadeInUp 0.6s ease-out 0.8s both'
                      }}>
                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎂</div>
                        <h3 style={{
                          fontSize: '1.25rem',
                          fontWeight: '600',
                          color: '#92400e',
                          marginBottom: '0.5rem'
                        }}>
                          Next Birthday Countdown
                        </h3>
                        <div style={{
                          fontSize: '1.5rem',
                          fontWeight: '700',
                          color: '#d97706'
                        }}>
                          <AnimatedCounter value={ageResult.daysToNextBirthday} delay={1.0} /> Days to Go!
                        </div>
                        <div style={{
                          fontSize: '0.9rem',
                          color: '#92400e',
                          marginTop: '0.5rem'
                        }}>
                          {ageResult.nextBirthday.toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </div>
                      </div>

                      {/* Fun Facts Section */}
                      <div style={{
                        background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)',
                        borderRadius: '1rem',
                        padding: '1.5rem',
                        animation: 'fadeInUp 0.6s ease-out 1.0s both'
                      }}>
                        <h3 style={{
                          fontSize: '1.25rem',
                          fontWeight: '600',
                          marginBottom: '1.5rem',
                          color: '#374151',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}>
                          <Star size={20} style={{ color: '#fbbf24' }} />
                          Fun Facts About You
                        </h3>

                        <div style={{
                          display: 'grid',
                          gap: '0.75rem'
                        }}>
                          {ageResult.funFacts.map((fact, index) => (
                            <div
                              key={index}
                              style={{
                                background: 'white',
                                padding: '1rem',
                                borderRadius: '0.75rem',
                                border: '1px solid #e5e7eb',
                                animation: `fadeInUp 0.4s ease-out ${1.2 + index * 0.1}s both`,
                                fontSize: '0.95rem',
                                color: '#374151'
                              }}
                            >
                              ✨ {fact}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Affiliate Recommendations */}
                      <div style={{ animation: 'fadeInUp 0.6s ease-out 1.8s both' }}>
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
              <h2 style={{
                fontSize: 'clamp(1.25rem, 3vw, 1.75rem)',
                fontWeight: '700',
                color: '#1e293b',
                textAlign: 'center',
                marginBottom: '2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}>
                <TrendingUp size={24} style={{ color: '#1d4e89' }} />
                Life Milestones & Timeline
              </h2>

              {/* Input Section */}
              <div style={{
                background: 'linear-gradient(135deg, #eef2fb, #e4ebf7)',
                padding: 'clamp(1rem, 4vw, 2rem)',
                borderRadius: '1.25rem',
                marginBottom: '2rem',
                border: '1px solid #c8d7ec'
              }}>
                <div className="responsive-grid">
                  <div>
                    <label className="input-label">
                      <Gift size={16} style={{ color: '#1d4e89', marginRight: '0.25rem' }} />
                      Birth Date
                    </label>
                    <input
                      type="date"
                      value={lifeEventsParams.birthDate}
                      onChange={(e) => setLifeEventsParams(prev => ({...prev, birthDate: e.target.value}))}
                      className="calculator-input mobile-input"
                      style={{
                        border: '2px solid #1d4e89',
                        borderRadius: '0.75rem'
                      }}
                    />
                  </div>
                  
                  <div>
                    <label className="input-label">
                      <Target size={16} style={{ color: '#1d4e89', marginRight: '0.25rem' }} />
                      Retirement Age
                    </label>
                    <input
                      type="number"
                      value={lifeEventsParams.retirementAge}
                      onChange={(e) => setLifeEventsParams(prev => ({...prev, retirementAge: parseInt(e.target.value) || 60}))}
                      className="calculator-input mobile-input"
                      min="50"
                      max="80"
                      style={{
                        border: '2px solid #1d4e89',
                        borderRadius: '0.75rem'
                      }}
                    />
                  </div>

                  <div>
                    <label className="input-label">
                      <Heart size={16} style={{ color: '#1d4e89', marginRight: '0.25rem' }} />
                      Life Expectancy
                    </label>
                    <input
                      type="number"
                      value={lifeEventsParams.lifeExpectancy}
                      onChange={(e) => setLifeEventsParams(prev => ({...prev, lifeExpectancy: parseInt(e.target.value) || 75}))}
                      className="calculator-input mobile-input"
                      min="60"
                      max="100"
                      style={{
                        border: '2px solid #1d4e89',
                        borderRadius: '0.75rem'
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Life Progress */}
              {lifeEventsResult && (
                <div style={{
                  animation: 'fadeInUp 0.6s ease-out 0.2s both'
                }}>
                  <div style={{
                    background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)',
                    padding: '2rem',
                    borderRadius: '1.5rem',
                    textAlign: 'center',
                    marginBottom: '2rem'
                  }}>
                    <h3 style={{
                      fontSize: '1.5rem',
                      fontWeight: '600',
                      color: '#0f2a43',
                      marginBottom: '1.5rem'
                    }}>
                      Your Life Journey Progress
                    </h3>
                    
                    <div style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      gap: '2rem',
                      flexWrap: 'wrap'
                    }}>
                      <ProgressCircle 
                        percentage={lifeEventsResult.lifeProgress} 
                        size={150} 
                        delay={0.5}
                      />
                      <div style={{ textAlign: 'left' }}>
                        <div style={{
                          fontSize: 'clamp(1.5rem, 4vw, 2rem)',
                          fontWeight: '700',
                          color: '#0f2a43',
                          marginBottom: '0.5rem'
                        }}>
                          <AnimatedCounter value={lifeEventsResult.currentAge} delay={1} /> Years Old
                        </div>
                        <div style={{
                          fontSize: '1.1rem',
                          color: '#1d4e89',
                          marginBottom: '0.25rem'
                        }}>
                          <AnimatedCounter value={lifeEventsResult.remainingYears} delay={1.2} /> Years Remaining
                        </div>
                        <div style={{
                          fontSize: '0.95rem',
                          color: '#334155'
                        }}>
                          <AnimatedCounter value={lifeEventsResult.seasonsExperienced} delay={1.4} /> Seasons Experienced
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Milestones Timeline */}
                  <div style={{
                    background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)',
                    borderRadius: '1rem',
                    padding: '1.5rem'
                  }}>
                    <h3 style={{
                      fontSize: '1.25rem',
                      fontWeight: '600',
                      marginBottom: '1.5rem',
                      color: '#374151',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <Info size={20} style={{ color: '#06b6d4' }} />
                      Life Milestones Timeline
                    </h3>

                    <div style={{
                      display: 'grid',
                      gap: '1rem'
                    }}>
                      {lifeEventsResult.milestones.map((milestone, index) => (
                        <div
                          key={milestone.age}
                          style={{
                            background: milestone.isPassed ? '#f0fdf4' : 'white',
                            border: `2px solid ${milestone.isPassed ? '#10b981' : '#e5e7eb'}`,
                            borderRadius: '0.75rem',
                            padding: '1rem',
                            animation: `fadeInUp 0.4s ease-out ${0.4 + index * 0.1}s both`,
                            position: 'relative',
                            opacity: milestone.isPassed ? 0.8 : 1
                          }}
                        >
                          {milestone.isPassed && (
                            <div style={{
                              position: 'absolute',
                              top: '0.5rem',
                              right: '0.5rem',
                              background: '#10b981',
                              color: 'white',
                              borderRadius: '50%',
                              width: '24px',
                              height: '24px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.8rem'
                            }}>
                              ✓
                            </div>
                          )}
                          
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            flexWrap: 'wrap'
                          }}>
                            <div style={{ fontSize: '2rem' }}>
                              {milestone.emoji}
                            </div>
                            <div style={{ flex: 1, minWidth: '200px' }}>
                              <div style={{
                                fontSize: '1.1rem',
                                fontWeight: '600',
                                color: milestone.isPassed ? '#059669' : '#374151',
                                marginBottom: '0.25rem'
                              }}>
                                Age {milestone.age}: {milestone.event}
                              </div>
                              <div style={{
                                fontSize: '0.9rem',
                                color: milestone.isPassed ? '#065f46' : '#6b7280',
                                marginBottom: '0.5rem'
                              }}>
                                {milestone.description}
                              </div>
                              <div style={{
                                fontSize: '0.85rem',
                                color: milestone.isPassed ? '#0f766e' : '#1d4e89',
                                fontWeight: '500'
                              }}>
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
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AgeCalculator;
