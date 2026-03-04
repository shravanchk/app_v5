import React, { useMemo, useState } from 'react';
import Head from 'next/head';
import { ArrowRightLeft, Ruler } from 'lucide-react';
import HomeButton from './HomeButton';

const CATEGORIES = {
  length: {
    label: 'Length',
    units: {
      m: { label: 'Meter (m)', factor: 1 },
      km: { label: 'Kilometer (km)', factor: 1000 },
      cm: { label: 'Centimeter (cm)', factor: 0.01 },
      mm: { label: 'Millimeter (mm)', factor: 0.001 },
      in: { label: 'Inch (in)', factor: 0.0254 },
      ft: { label: 'Foot (ft)', factor: 0.3048 },
      yd: { label: 'Yard (yd)', factor: 0.9144 },
      mi: { label: 'Mile (mi)', factor: 1609.344 }
    }
  },
  area: {
    label: 'Area',
    units: {
      sqm: { label: 'Square meter (m²)', factor: 1 },
      sqkm: { label: 'Square kilometer (km²)', factor: 1000000 },
      sqcm: { label: 'Square centimeter (cm²)', factor: 0.0001 },
      sqft: { label: 'Square foot (ft²)', factor: 0.09290304 },
      acre: { label: 'Acre', factor: 4046.8564224 },
      hectare: { label: 'Hectare (ha)', factor: 10000 }
    }
  },
  volume: {
    label: 'Volume',
    units: {
      l: { label: 'Liter (L)', factor: 1 },
      ml: { label: 'Milliliter (mL)', factor: 0.001 },
      cu_m: { label: 'Cubic meter (m³)', factor: 1000 },
      tsp: { label: 'Teaspoon (US)', factor: 0.00492892 },
      tbsp: { label: 'Tablespoon (US)', factor: 0.0147868 },
      cup: { label: 'Cup (US)', factor: 0.236588 },
      pint: { label: 'Pint (US)', factor: 0.473176 },
      gallon: { label: 'Gallon (US)', factor: 3.78541 }
    }
  },
  mass: {
    label: 'Mass',
    units: {
      kg: { label: 'Kilogram (kg)', factor: 1 },
      g: { label: 'Gram (g)', factor: 0.001 },
      mg: { label: 'Milligram (mg)', factor: 0.000001 },
      lb: { label: 'Pound (lb)', factor: 0.45359237 },
      oz: { label: 'Ounce (oz)', factor: 0.0283495231 },
      ton: { label: 'Metric ton (t)', factor: 1000 }
    }
  },
  temperature: {
    label: 'Temperature',
    units: {
      c: { label: 'Celsius (°C)' },
      f: { label: 'Fahrenheit (°F)' },
      k: { label: 'Kelvin (K)' }
    }
  },
  speed: {
    label: 'Speed',
    units: {
      mps: { label: 'Meter/second (m/s)', factor: 1 },
      kmph: { label: 'Kilometer/hour (km/h)', factor: 0.2777777778 },
      mph: { label: 'Mile/hour (mph)', factor: 0.44704 },
      knot: { label: 'Knot (kn)', factor: 0.514444 }
    }
  },
  pressure: {
    label: 'Pressure',
    units: {
      pa: { label: 'Pascal (Pa)', factor: 1 },
      kpa: { label: 'Kilopascal (kPa)', factor: 1000 },
      bar: { label: 'Bar', factor: 100000 },
      atm: { label: 'Atmosphere (atm)', factor: 101325 },
      psi: { label: 'Pound/sq inch (psi)', factor: 6894.757293 }
    }
  },
  energy: {
    label: 'Energy',
    units: {
      j: { label: 'Joule (J)', factor: 1 },
      kj: { label: 'Kilojoule (kJ)', factor: 1000 },
      cal: { label: 'Calorie (cal)', factor: 4.184 },
      kcal: { label: 'Kilocalorie (kcal)', factor: 4184 },
      wh: { label: 'Watt-hour (Wh)', factor: 3600 },
      kwh: { label: 'Kilowatt-hour (kWh)', factor: 3600000 }
    }
  },
  power: {
    label: 'Power',
    units: {
      w: { label: 'Watt (W)', factor: 1 },
      kw: { label: 'Kilowatt (kW)', factor: 1000 },
      hp: { label: 'Horsepower (hp)', factor: 745.699872 }
    }
  },
  data: {
    label: 'Data Size',
    units: {
      byte: { label: 'Byte (B)', factor: 1 },
      kb: { label: 'Kilobyte (KB)', factor: 1024 },
      mb: { label: 'Megabyte (MB)', factor: 1048576 },
      gb: { label: 'Gigabyte (GB)', factor: 1073741824 },
      tb: { label: 'Terabyte (TB)', factor: 1099511627776 },
      bit: { label: 'Bit (b)', factor: 0.125 }
    }
  }
};

const formatNumber = (value) => {
  if (!Number.isFinite(value)) return 'Invalid';
  const abs = Math.abs(value);
  if (abs > 0 && (abs >= 1e9 || abs < 1e-6)) {
    return value.toExponential(8);
  }
  return value.toLocaleString(undefined, { maximumFractionDigits: 10 });
};

const toCelsius = (value, unit) => {
  if (unit === 'c') return value;
  if (unit === 'f') return (value - 32) * (5 / 9);
  return value - 273.15;
};

const fromCelsius = (value, unit) => {
  if (unit === 'c') return value;
  if (unit === 'f') return value * (9 / 5) + 32;
  return value + 273.15;
};

const UnitConverter = () => {
  const categoryKeys = Object.keys(CATEGORIES);
  const [categoryKey, setCategoryKey] = useState('length');

  const availableUnits = Object.keys(CATEGORIES[categoryKey].units);
  const [fromUnit, setFromUnit] = useState(availableUnits[0]);
  const [toUnit, setToUnit] = useState(availableUnits[1] || availableUnits[0]);
  const [inputValue, setInputValue] = useState('1');

  const conversion = useMemo(() => {
    const parsedValue = Number(inputValue);
    if (!Number.isFinite(parsedValue)) return null;

    const category = CATEGORIES[categoryKey];
    if (categoryKey === 'temperature') {
      const baseCelsius = toCelsius(parsedValue, fromUnit);
      const converted = fromCelsius(baseCelsius, toUnit);
      return {
        parsedValue,
        converted,
        formula: '°C = (°F - 32) × 5/9;  K = °C + 273.15'
      };
    }

    const fromFactor = category.units[fromUnit].factor;
    const toFactor = category.units[toUnit].factor;
    const baseValue = parsedValue * fromFactor;
    const converted = baseValue / toFactor;

    return {
      parsedValue,
      converted,
      formula: `Converted = input × ${fromFactor} / ${toFactor}`
    };
  }, [categoryKey, fromUnit, toUnit, inputValue]);

  const handleCategoryChange = (nextCategory) => {
    setCategoryKey(nextCategory);
    const nextUnits = Object.keys(CATEGORIES[nextCategory].units);
    setFromUnit(nextUnits[0]);
    setToUnit(nextUnits[1] || nextUnits[0]);
  };

  const swapUnits = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
  };

  return (
    <div className="calculator-container" style={{ background: 'linear-gradient(135deg, #f6f4ef 0%, #e7edf4 100%)' }}>
      <Head>
        <title>Unit Converter Online | Length, Area, Volume, Mass, Temp, Data | Upaman</title>
        <meta
          name="description"
          content="Free engineering unit converter for length, area, volume, mass, temperature, pressure, energy, power, speed, and data size."
        />
        <meta
          name="keywords"
          content="unit converter online, engineering unit converter, length converter, temperature converter, pressure converter, data size converter"
        />
        <link rel="canonical" href="https://upaman.com/unit-converter" />
        <meta property="og:title" content="Unit Converter Online | Upaman" />
        <meta
          property="og:description"
          content="Convert units across science and engineering categories with formula transparency and instant output."
        />
        <meta property="og:url" content="https://upaman.com/unit-converter" />
        <meta property="og:type" content="website" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'SoftwareApplication',
              name: 'Unit Converter',
              applicationCategory: 'UtilitiesApplication',
              operatingSystem: 'Web Browser',
              url: 'https://upaman.com/unit-converter',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD'
              }
            })
          }}
        />
      </Head>

      <div className="calculator-card">
        <div className="calculator-header emi-header">
          <div className="header-nav">
            <HomeButton style={{ position: 'static', top: 'auto', left: 'auto', zIndex: 'auto' }} />
            <div className="flex-spacer" />
          </div>
          <div className="header-title-container">
            <Ruler size={32} color="#67e8f9" aria-hidden="true" />
            <h1 className="header-title">Engineering Unit Converter</h1>
          </div>
          <p style={{ margin: 0, opacity: 0.92, fontSize: '0.95rem' }}>
            Convert practical units for math, science, and engineering workflows without leaving the page.
          </p>
        </div>

        <div className="mobile-card-content">
          <section
            style={{
              marginBottom: '1.2rem',
              border: '1px solid #dbe2eb',
              borderRadius: '0.9rem',
              background: '#f8fafc',
              padding: '1rem'
            }}
          >
            <h2 style={{ marginTop: 0, marginBottom: '0.55rem', color: '#0f2a43', fontSize: '1.05rem' }}>Converter setup</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.7rem' }}>
              <div>
                <label htmlFor="unit-category" style={{ display: 'block', marginBottom: '0.28rem', fontSize: '0.82rem', color: '#64748b' }}>
                  Category
                </label>
                <select
                  id="unit-category"
                  value={categoryKey}
                  onChange={(event) => handleCategoryChange(event.target.value)}
                  style={{ width: '100%', borderRadius: '0.6rem', border: '1px solid #cbd5e1', padding: '0.5rem' }}
                >
                  {categoryKeys.map((key) => (
                    <option key={key} value={key}>
                      {CATEGORIES[key].label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="unit-value" style={{ display: 'block', marginBottom: '0.28rem', fontSize: '0.82rem', color: '#64748b' }}>
                  Value
                </label>
                <input
                  id="unit-value"
                  type="number"
                  value={inputValue}
                  onChange={(event) => setInputValue(event.target.value)}
                  style={{ width: '100%', borderRadius: '0.6rem', border: '1px solid #cbd5e1', padding: '0.5rem' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '0.6rem', alignItems: 'end', marginTop: '0.7rem' }}>
              <div>
                <label htmlFor="from-unit" style={{ display: 'block', marginBottom: '0.28rem', fontSize: '0.82rem', color: '#64748b' }}>
                  From
                </label>
                <select
                  id="from-unit"
                  value={fromUnit}
                  onChange={(event) => setFromUnit(event.target.value)}
                  style={{ width: '100%', borderRadius: '0.6rem', border: '1px solid #cbd5e1', padding: '0.5rem' }}
                >
                  {availableUnits.map((unitKey) => (
                    <option key={unitKey} value={unitKey}>
                      {CATEGORIES[categoryKey].units[unitKey].label}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={swapUnits}
                style={{
                  borderRadius: '0.65rem',
                  border: '1px solid #94a3b8',
                  background: '#ffffff',
                  color: '#1e293b',
                  padding: '0.48rem 0.7rem',
                  cursor: 'pointer',
                  minHeight: '40px'
                }}
                title="Swap units"
                aria-label="Swap from and to units"
              >
                <ArrowRightLeft size={16} />
              </button>

              <div>
                <label htmlFor="to-unit" style={{ display: 'block', marginBottom: '0.28rem', fontSize: '0.82rem', color: '#64748b' }}>
                  To
                </label>
                <select
                  id="to-unit"
                  value={toUnit}
                  onChange={(event) => setToUnit(event.target.value)}
                  style={{ width: '100%', borderRadius: '0.6rem', border: '1px solid #cbd5e1', padding: '0.5rem' }}
                >
                  {availableUnits.map((unitKey) => (
                    <option key={unitKey} value={unitKey}>
                      {CATEGORIES[categoryKey].units[unitKey].label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          <section
            style={{
              marginBottom: '1rem',
              border: '1px solid #dbe2eb',
              borderRadius: '0.9rem',
              background: '#ffffff',
              padding: '1rem'
            }}
          >
            <h2 style={{ marginTop: 0, marginBottom: '0.45rem', color: '#0f2a43', fontSize: '1.05rem' }}>Conversion result</h2>
            <p style={{ margin: 0, color: '#0f766e', fontSize: '1.1rem', fontWeight: 700, wordBreak: 'break-word' }}>
              {conversion
                ? `${formatNumber(conversion.parsedValue)} ${fromUnit} = ${formatNumber(conversion.converted)} ${toUnit}`
                : 'Enter a valid numeric value'}
            </p>
            <p style={{ margin: '0.6rem 0 0', color: '#64748b', fontSize: '0.84rem' }}>
              {conversion ? conversion.formula : 'Formula will appear after valid input'}
            </p>
          </section>

          <section
            style={{
              marginBottom: '1rem',
              border: '1px solid #dbe2eb',
              borderRadius: '0.9rem',
              background: '#f8fafc',
              padding: '1rem'
            }}
          >
            <h2 style={{ marginTop: 0, marginBottom: '0.55rem', color: '#0f2a43', fontSize: '1.05rem' }}>Category coverage</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '0.5rem', color: '#334155', fontSize: '0.88rem' }}>
              {categoryKeys.map((key) => (
                <div
                  key={key}
                  style={{
                    borderRadius: '0.7rem',
                    border: key === categoryKey ? '1px solid #0f766e' : '1px solid #cbd5e1',
                    background: key === categoryKey ? '#ecfdf5' : '#fff',
                    padding: '0.55rem 0.65rem'
                  }}
                >
                  <strong>{CATEGORIES[key].label}</strong>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.2rem' }}>
                    {Object.keys(CATEGORIES[key].units).length} units
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section style={{ marginBottom: '1rem' }}>
            <h2 style={{ margin: '0 0 0.55rem', color: '#0f2a43', fontSize: '1.05rem' }}>Use cases</h2>
            <div style={{ color: '#475569', fontSize: '0.9rem', lineHeight: 1.65 }}>
              <p style={{ marginTop: 0 }}>
                Convert speed between mph and km/h for travel planning, switch pressure between psi and bar for
                mechanical systems, or move between bytes and GB when planning storage.
              </p>
              <p style={{ marginBottom: 0 }}>
                The tool keeps formula transparency so you can verify unit factors for assignments, specs, and reports.
              </p>
            </div>
          </section>

          <section style={{ marginBottom: '0.25rem' }}>
            <h2 style={{ margin: '0 0 0.55rem', color: '#0f2a43', fontSize: '1.05rem' }}>FAQ</h2>
            <div style={{ color: '#475569', fontSize: '0.9rem', lineHeight: 1.65 }}>
              <p style={{ marginTop: 0 }}>
                <strong>How are temperature conversions handled?</strong> Temperature uses dedicated equations, not a
                single multiplication factor.
              </p>
              <p style={{ marginBottom: 0 }}>
                <strong>Why does a value show scientific notation?</strong> Very small or very large values are
                displayed in exponential format for readability.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default UnitConverter;
