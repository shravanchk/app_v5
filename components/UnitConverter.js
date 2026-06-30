import React, { useMemo, useState } from 'react';
import Head from 'next/head';
import { ArrowRightLeft } from 'lucide-react';
import { CalcLayout } from './calculator/CalcLayout';
import HowToSection from './calculator/HowToSection';
import { NumberField, SelectField } from './ui/Field';
import Card from './ui/Card';
import { cn } from './ui/cn';

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

  const unitOptions = availableUnits.map((unitKey) => ({
    value: unitKey,
    label: CATEGORIES[categoryKey].units[unitKey].label
  }));

  return (
    <>
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

      <CalcLayout
        eyebrow="Everyday tool"
        title="Engineering Unit Converter"
        subtitle="Convert practical units for math, science, and engineering workflows without leaving the page."
      >
        <div className="max-w-3xl space-y-5">
          <Card className="p-5">
            <h2 className="mb-3 font-display text-base font-bold text-ink dark:text-white">Converter setup</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <SelectField
                id="unit-category"
                label="Category"
                value={categoryKey}
                onChange={handleCategoryChange}
                options={categoryKeys.map((key) => ({ value: key, label: CATEGORIES[key].label }))}
              />
              <NumberField id="unit-value" label="Value" value={inputValue} onChange={setInputValue} />
            </div>

            <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-end gap-3">
              <div className="min-w-0">
                <SelectField id="from-unit" label="From" value={fromUnit} onChange={setFromUnit} options={unitOptions} />
              </div>
              <button
                type="button"
                onClick={swapUnits}
                title="Swap units"
                aria-label="Swap from and to units"
                className="grid h-[46px] w-11 place-items-center rounded-xl border border-slate-200 bg-white text-ink-soft transition hover:border-slate-300 hover:text-brand-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              >
                <ArrowRightLeft size={16} />
              </button>
              <div className="min-w-0">
                <SelectField id="to-unit" label="To" value={toUnit} onChange={setToUnit} options={unitOptions} />
              </div>
            </div>
          </Card>

          <Card className="border-brand-200/70 bg-brand-50/40 p-5 dark:border-brand-800/60 dark:bg-brand-900/15">
            <h2 className="font-display text-base font-bold text-ink dark:text-white">Conversion result</h2>
            <p className="mt-1.5 break-words font-display text-xl font-bold text-emerald-600 dark:text-emerald-400">
              {conversion
                ? `${formatNumber(conversion.parsedValue)} ${fromUnit} = ${formatNumber(conversion.converted)} ${toUnit}`
                : 'Enter a valid numeric value'}
            </p>
            <p className="mt-2 font-mono text-xs text-ink-muted dark:text-slate-400">
              {conversion ? conversion.formula : 'Formula will appear after valid input'}
            </p>
          </Card>

          <Card className="p-5">
            <h2 className="mb-3 font-display text-base font-bold text-ink dark:text-white">Category coverage</h2>
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
              {categoryKeys.map((key) => (
                <div
                  key={key}
                  className={cn(
                    'rounded-xl border p-3',
                    key === categoryKey
                      ? 'border-emerald-300 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-900/20'
                      : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800/60'
                  )}
                >
                  <strong className="text-sm text-ink dark:text-slate-100">{CATEGORIES[key].label}</strong>
                  <div className="mt-0.5 text-xs text-ink-muted dark:text-slate-400">
                    {Object.keys(CATEGORIES[key].units).length} units
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="font-display text-base font-bold text-ink dark:text-white">Use cases</h2>
            <div className="mt-1.5 space-y-2 text-sm leading-relaxed text-ink-soft dark:text-slate-300">
              <p>
                Convert speed between mph and km/h for travel planning, switch pressure between psi and bar for mechanical
                systems, or move between bytes and GB when planning storage.
              </p>
              <p>The tool keeps formula transparency so you can verify unit factors for assignments, specs, and reports.</p>
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="font-display text-base font-bold text-ink dark:text-white">FAQ</h2>
            <div className="mt-1.5 space-y-2 text-sm leading-relaxed text-ink-soft dark:text-slate-300">
              <p>
                <strong className="font-semibold text-ink dark:text-white">How are temperature conversions handled?</strong>{' '}
                Temperature uses dedicated equations, not a single multiplication factor.
              </p>
              <p>
                <strong className="font-semibold text-ink dark:text-white">Why does a value show scientific notation?</strong>{' '}
                Very small or very large values are displayed in exponential format for readability.
              </p>
            </div>
          </Card>
        </div>
      
        <HowToSection
          name="How to use the Unit Converter"
          description="Convert between units across many measurement categories."
          steps={[
            { name: "Choose a category", text: "Select length, weight, temperature, or another category." },
            { name: "Enter a value", text: "Type the number you want to convert." },
            { name: "Pick the units", text: "Choose the unit to convert from and the unit to convert to." },
            { name: "Read the result", text: "See the converted value instantly." }
          ]}
        />

      </CalcLayout>
    </>
  );
};

export default UnitConverter;
