// Quick-win calculator engines: compound interest, percentage, tip, US inflation.
// All pure functions — safe for getStaticProps and client use.

// ---------------------------------------------------------------------------
// Compound interest
// ---------------------------------------------------------------------------

const COMPOUND_FREQUENCIES = [
  { value: 'annually', label: 'Annually', n: 1 },
  { value: 'semiannually', label: 'Semi-annually', n: 2 },
  { value: 'quarterly', label: 'Quarterly', n: 4 },
  { value: 'monthly', label: 'Monthly', n: 12 },
  { value: 'daily', label: 'Daily', n: 365 }
];

/**
 * Month-by-month simulation so any compounding frequency works with monthly
 * contributions (added at the end of each month).
 */
function computeCompoundGrowth({ principal = 0, monthlyContribution = 0, annualRatePct = 0, years = 0, frequency = 'monthly' }) {
  const freq = COMPOUND_FREQUENCIES.find((f) => f.value === frequency) || COMPOUND_FREQUENCIES[3];
  const rate = Math.max(annualRatePct, 0) / 100;
  const months = Math.max(0, Math.round(years * 12));
  // Effective monthly rate equivalent to compounding `n` times per year.
  const monthlyRate = Math.pow(1 + rate / freq.n, freq.n / 12) - 1;

  let balance = principal;
  const yearly = [];
  for (let m = 1; m <= months; m += 1) {
    balance = balance * (1 + monthlyRate) + monthlyContribution;
    if (m % 12 === 0 || m === months) {
      const contributed = monthlyContribution * m;
      yearly.push({
        year: Math.ceil(m / 12),
        balance,
        principal,
        contributed,
        interest: balance - principal - contributed
      });
    }
  }

  const totalContributions = monthlyContribution * months;
  const totalInterest = balance - principal - totalContributions;
  return {
    finalBalance: balance,
    principal,
    totalContributions,
    totalInterest,
    yearly
  };
}

// ---------------------------------------------------------------------------
// Percentage
// ---------------------------------------------------------------------------

/** What is `pct`% of `base`? */
const percentOf = (pct, base) => (pct / 100) * base;

/** `part` is what percent of `whole`? Returns null when whole is 0. */
const whatPercent = (part, whole) => (whole === 0 ? null : (part / whole) * 100);

/** Percent change from `from` to `to`. Returns null when from is 0. */
const percentChange = (from, to) => (from === 0 ? null : ((to - from) / from) * 100);

/** Increase (dir=1) or decrease (dir=-1) `base` by `pct`%. */
const applyPercent = (base, pct, dir = 1) => base * (1 + (dir * pct) / 100);

// ---------------------------------------------------------------------------
// Tip
// ---------------------------------------------------------------------------

function computeTip({ bill = 0, tipPct = 0, people = 1, roundUpPerPerson = false }) {
  const n = Math.max(1, Math.floor(people));
  const tip = (tipPct / 100) * bill;
  let total = bill + tip;
  let perPerson = total / n;
  let roundingAdded = 0;
  if (roundUpPerPerson) {
    const rounded = Math.ceil(perPerson);
    roundingAdded = rounded * n - total;
    perPerson = rounded;
    total = rounded * n;
  }
  return {
    tip,
    total,
    perPerson,
    perPersonTip: tip / n,
    perPersonBill: bill / n,
    roundingAdded,
    effectiveTipPct: bill > 0 ? ((total - bill) / bill) * 100 : 0
  };
}

// ---------------------------------------------------------------------------
// US inflation — CPI-U annual averages (all items, U.S. city average, BLS).
// 2025 is the latest published annual average; revisit each January.
// ---------------------------------------------------------------------------

const CPI_U_ANNUAL = {
  1913: 9.9, 1914: 10.0, 1915: 10.1, 1916: 10.9, 1917: 12.8, 1918: 15.1, 1919: 17.3,
  1920: 20.0, 1921: 17.9, 1922: 16.8, 1923: 17.1, 1924: 17.1, 1925: 17.5, 1926: 17.7,
  1927: 17.4, 1928: 17.1, 1929: 17.1, 1930: 16.7, 1931: 15.2, 1932: 13.7, 1933: 13.0,
  1934: 13.4, 1935: 13.7, 1936: 13.9, 1937: 14.4, 1938: 14.1, 1939: 13.9, 1940: 14.0,
  1941: 14.7, 1942: 16.3, 1943: 17.3, 1944: 17.6, 1945: 18.0, 1946: 19.5, 1947: 22.3,
  1948: 24.1, 1949: 23.8, 1950: 24.1, 1951: 26.0, 1952: 26.5, 1953: 26.7, 1954: 26.9,
  1955: 26.8, 1956: 27.2, 1957: 28.1, 1958: 28.9, 1959: 29.1, 1960: 29.6, 1961: 29.9,
  1962: 30.2, 1963: 30.6, 1964: 31.0, 1965: 31.5, 1966: 32.4, 1967: 33.4, 1968: 34.8,
  1969: 36.7, 1970: 38.8, 1971: 40.5, 1972: 41.8, 1973: 44.4, 1974: 49.3, 1975: 53.8,
  1976: 56.9, 1977: 60.6, 1978: 65.2, 1979: 72.6, 1980: 82.4, 1981: 90.9, 1982: 96.5,
  1983: 99.6, 1984: 103.9, 1985: 107.6, 1986: 109.6, 1987: 113.6, 1988: 118.3, 1989: 124.0,
  1990: 130.7, 1991: 136.2, 1992: 140.3, 1993: 144.5, 1994: 148.2, 1995: 152.4, 1996: 156.9,
  1997: 160.5, 1998: 163.0, 1999: 166.6, 2000: 172.2, 2001: 177.1, 2002: 179.9, 2003: 184.0,
  2004: 188.9, 2005: 195.3, 2006: 201.6, 2007: 207.3, 2008: 215.3, 2009: 214.5, 2010: 218.1,
  2011: 224.9, 2012: 229.6, 2013: 233.0, 2014: 236.7, 2015: 237.0, 2016: 240.0, 2017: 245.1,
  2018: 251.1, 2019: 255.7, 2020: 258.8, 2021: 271.0, 2022: 292.7, 2023: 304.7, 2024: 313.7,
  2025: 322.3
};

const CPI_YEARS = Object.keys(CPI_U_ANNUAL).map(Number).sort((a, b) => a - b);
const CPI_FIRST_YEAR = CPI_YEARS[0];
const CPI_LATEST_YEAR = CPI_YEARS[CPI_YEARS.length - 1];

/**
 * Adjust `amount` from `fromYear` dollars to `toYear` dollars using CPI-U
 * annual averages. Works in both directions.
 */
function adjustForInflation({ amount = 0, fromYear, toYear }) {
  const from = CPI_U_ANNUAL[fromYear];
  const to = CPI_U_ANNUAL[toYear];
  if (!from || !to) return null;
  const adjusted = amount * (to / from);
  const totalChangePct = (to / from - 1) * 100;
  const span = Math.abs(toYear - fromYear);
  const avgAnnualPct = span === 0 ? 0 : (Math.pow(to / from, 1 / (toYear - fromYear)) - 1) * 100;
  return {
    adjusted,
    totalChangePct,
    avgAnnualPct,
    // $1 of fromYear money buys this many fromYear-dollars' worth in toYear.
    buyingPowerRatio: from / to
  };
}

module.exports = {
  COMPOUND_FREQUENCIES,
  computeCompoundGrowth,
  percentOf,
  whatPercent,
  percentChange,
  applyPercent,
  computeTip,
  CPI_U_ANNUAL,
  CPI_YEARS,
  CPI_FIRST_YEAR,
  CPI_LATEST_YEAR,
  adjustForInflation
};
