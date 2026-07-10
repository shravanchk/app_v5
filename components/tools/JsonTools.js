import React, { useMemo, useState } from 'react';
import Head from 'next/head';
import CalculatorInfoPanel from '../CalculatorInfoPanel';
import ResultActions from '../ResultActions';
import HowToSection from '../calculator/HowToSection';
import { CalcLayout } from '../calculator/CalcLayout';
import Card from '../ui/Card';
import { cn } from '../ui/cn';
import { buildFaqSchema } from '../../utils/faqSchema';

const FAQ = [
  { question: 'Is my JSON data sent to a server?', answer: 'No. Every action — validate, format, convert, diff — runs entirely in your browser with JavaScript. Nothing is uploaded, logged, or stored, so it is safe to paste API payloads, tokens, or private data.' },
  { question: 'What is the difference between Format, Minify, and Validate?', answer: 'Validate checks that your JSON parses and reports the exact line and column of any syntax error. Format (pretty-print) re-indents valid JSON with 2 or 4 spaces for readability. Minify strips all optional whitespace to produce the smallest possible single-line JSON for transport.' },
  { question: 'How do Flatten and Unflatten paths work?', answer: 'Flatten converts nested JSON into a single-level object using dot notation for keys and [index] for array elements — for example user.goals[0].name. Unflatten reverses that, rebuilding the nested object or array structure from those flat path keys.' },
  { question: 'What is a JSON Patch diff?', answer: 'JSON Patch Diff compares your Base JSON against the Target panel and outputs a list of add, remove, and replace operations that transform one into the other. The output follows RFC 6902, so you can apply it with any standard JSON Patch library.' },
  { question: 'Can it convert between JSON, CSV, and YAML?', answer: 'Yes. JSON→CSV flattens an array of objects into rows, CSV→JSON maps a header row into keys and infers primitive types, and JSON↔YAML converts between the two formats. Use "Use output as input" to chain conversions.' },
  { question: 'Is there a size limit?', answer: 'There is no hard limit, but because processing happens on your device, very large payloads (several megabytes) may be slower on low-memory devices. The tool shows the input size in KB after each run.' },
  { question: 'Does it work offline?', answer: 'Once the page has loaded, all transformations run locally, so the tools keep working even without an active network connection.' }
];

const utilityBtn =
  'inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold ' +
  'text-ink-soft transition hover:border-slate-300 hover:bg-slate-50 ' +
  'dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:border-slate-600';

const editorLabel = 'mb-1.5 block text-xs font-bold uppercase tracking-[0.03em] text-ink-muted dark:text-slate-400';

const editorArea =
  'min-h-[320px] w-full resize-y rounded-xl border border-slate-200 bg-white p-3 font-mono text-[0.82rem] ' +
  'leading-relaxed text-ink outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-500/30 ' +
  'dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100';

const SAMPLE_SNIPPETS = {
  portfolio: `{
  "user": {
    "name": "Aarav",
    "country": "IN"
  },
  "goals": [
    { "name": "Emergency Fund", "target": 300000, "progress": 180000 },
    { "name": "Home Down Payment", "target": 2500000, "progress": 950000 }
  ],
  "settings": {
    "currency": "INR",
    "notifications": true
  }
}`,
  flat: `{
  "user.name": "Aarav",
  "user.country": "IN",
  "goals[0].name": "Emergency Fund",
  "goals[0].target": 300000,
  "goals[1].name": "Home Down Payment",
  "goals[1].target": 2500000
}`,
  csv: `month,investment,returns
Jan,5000,300
Feb,5000,420
Mar,5000,510`,
  yaml: `user:
  name: "Aarav"
  country: "IN"
goals:
  - name: "Emergency Fund"
    target: 300000
  - name: "Home Down Payment"
    target: 2500000
settings:
  currency: "INR"
  notifications: true`,
  portfolioTarget: `{
  "user": {
    "name": "Aarav",
    "country": "IN",
    "segment": "Growth"
  },
  "goals": [
    { "name": "Emergency Fund", "target": 350000, "progress": 220000 },
    { "name": "Home Down Payment", "target": 2500000, "progress": 1120000 },
    { "name": "Retirement", "target": 15000000, "progress": 1200000 }
  ],
  "settings": {
    "currency": "INR",
    "notifications": false
  }
}`
};

const ACTIONS = [
  { id: 'validate', label: 'Validate', hint: 'Check syntax and show exact parse errors', emoji: '✅' },
  { id: 'format', label: 'Format', hint: 'Pretty-print JSON with stable indentation', emoji: '✨' },
  { id: 'minify', label: 'Minify', hint: 'Compress JSON by removing extra whitespace', emoji: '🗜️' },
  { id: 'sort', label: 'Sort Keys', hint: 'Recursively sort object keys A→Z', emoji: '🧭' },
  { id: 'flatten', label: 'Flatten', hint: 'Convert nested JSON to dot/bracket paths', emoji: '📉' },
  { id: 'unflatten', label: 'Unflatten', hint: 'Rebuild nested JSON from flat paths', emoji: '📈' },
  { id: 'escape', label: 'Escape String', hint: 'Escape special characters for safe JSON strings', emoji: '🔐' },
  { id: 'unescape', label: 'Unescape String', hint: 'Decode escaped JSON string content', emoji: '🔓' },
  { id: 'jsonToCsv', label: 'JSON → CSV', hint: 'Convert JSON objects into CSV rows', emoji: '📋' },
  { id: 'csvToJson', label: 'CSV → JSON', hint: 'Map CSV rows into JSON objects', emoji: '🔁' },
  { id: 'jsonToYaml', label: 'JSON → YAML', hint: 'Render JSON as readable YAML', emoji: '🌿' },
  { id: 'yamlToJson', label: 'YAML → JSON', hint: 'Parse YAML input and output JSON', emoji: '🧪' },
  { id: 'jsonPatchDiff', label: 'JSON Patch Diff', hint: 'Generate RFC 6902 operations from base → target', emoji: '🩹' }
];

const tokenizePath = (path) => {
  const tokens = [];
  const regex = /([^[.\]]+)|\[(\d+)\]/g;
  let match = regex.exec(path);
  while (match) {
    if (typeof match[2] !== 'undefined') {
      tokens.push(Number(match[2]));
    } else {
      tokens.push(match[1]);
    }
    match = regex.exec(path);
  }
  return tokens;
};

const deepSortKeys = (value) => {
  if (Array.isArray(value)) return value.map(deepSortKeys);
  if (!value || typeof value !== 'object') return value;

  return Object.keys(value)
    .sort((a, b) => a.localeCompare(b))
    .reduce((acc, key) => {
      acc[key] = deepSortKeys(value[key]);
      return acc;
    }, {});
};

const flattenObject = (value) => {
  const output = {};

  const walk = (node, path) => {
    const isObject = node && typeof node === 'object' && !Array.isArray(node);
    if (Array.isArray(node)) {
      if (!node.length && path) output[path] = [];
      node.forEach((item, index) => {
        const nextPath = path ? `${path}[${index}]` : `[${index}]`;
        walk(item, nextPath);
      });
      return;
    }

    if (isObject) {
      const keys = Object.keys(node);
      if (!keys.length && path) output[path] = {};
      keys.forEach((key) => {
        const nextPath = path ? `${path}.${key}` : key;
        walk(node[key], nextPath);
      });
      return;
    }

    output[path || 'root'] = node;
  };

  walk(value, '');
  return output;
};

const unflattenObject = (flatInput) => {
  const entries = Object.entries(flatInput || {});
  if (!entries.length) return {};

  const firstTokens = tokenizePath(entries[0][0]);
  const root = typeof firstTokens[0] === 'number' ? [] : {};

  entries.forEach(([path, value]) => {
    const tokens = tokenizePath(path);
    if (!tokens.length) return;

    let cursor = root;
    tokens.forEach((token, index) => {
      const isLast = index === tokens.length - 1;
      const nextToken = tokens[index + 1];
      const needsArray = typeof nextToken === 'number';

      if (isLast) {
        cursor[token] = value;
        return;
      }

      if (typeof cursor[token] === 'undefined') {
        cursor[token] = needsArray ? [] : {};
      }
      cursor = cursor[token];
    });
  });

  return root;
};

const parseCsvRows = (csvText) => {
  const rows = [];
  let field = '';
  let row = [];
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i += 1) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (char === '\r') continue;

    if (inQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          field += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
      continue;
    }

    if (char === ',') {
      row.push(field);
      field = '';
      continue;
    }

    if (char === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
      continue;
    }

    field += char;
  }

  if (field.length || row.length) {
    row.push(field);
    rows.push(row);
  }

  return rows.filter((currentRow) => currentRow.some((value) => value !== ''));
};

const formatCsvCell = (value) => {
  if (value === null || typeof value === 'undefined') return '';
  const raw = typeof value === 'object' ? JSON.stringify(value) : String(value);
  if (/[",\n]/.test(raw)) return `"${raw.replace(/"/g, '""')}"`;
  return raw;
};

const inferCsvValueType = (value) => {
  const trimmed = value.trim();
  if (trimmed === '') return '';
  if (trimmed === 'true') return true;
  if (trimmed === 'false') return false;
  if (trimmed === 'null') return null;
  if (!Number.isNaN(Number(trimmed)) && trimmed !== '') return Number(trimmed);
  if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
    try {
      return JSON.parse(trimmed);
    } catch (error) {
      return value;
    }
  }
  return value;
};

const parseJsonWithDetails = (text) => {
  try {
    return { value: JSON.parse(text) };
  } catch (error) {
    const message = error?.message || 'Invalid JSON';
    const positionMatch = /position (\d+)/i.exec(message);
    if (!positionMatch) {
      return {
        error: {
          message,
          line: null,
          column: null
        }
      };
    }

    const position = Number(positionMatch[1]);
    const before = text.slice(0, position);
    const line = before.split('\n').length;
    const lastBreak = before.lastIndexOf('\n');
    const column = position - lastBreak;

    return {
      error: {
        message,
        line,
        column
      }
    };
  }
};

const yamlKeyToString = (key) => {
  const trimmed = key.trim();
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
};

const parseYamlScalar = (rawValue) => {
  const value = rawValue.trim();
  if (value === '') return '';
  if (value === 'null' || value === '~') return null;
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (value === '[]') return [];
  if (value === '{}') return {};
  if (/^-?\d+(\.\d+)?([eE][+-]?\d+)?$/.test(value)) return Number(value);

  if (value.startsWith('"') && value.endsWith('"')) {
    try {
      return JSON.parse(value);
    } catch (error) {
      return value.slice(1, -1);
    }
  }
  if (value.startsWith("'") && value.endsWith("'")) {
    return value.slice(1, -1).replace(/''/g, "'");
  }
  return value;
};

const parseYamlSubset = (yamlText) => {
  const lines = yamlText.replace(/\t/g, '  ').split('\n');
  const meaningful = (line) => {
    const trimmed = line.trim();
    return trimmed && !trimmed.startsWith('#');
  };
  const getIndent = (line) => line.match(/^ */)[0].length;

  const parseBlock = (startIndex, baseIndent) => {
    let index = startIndex;
    while (index < lines.length && !meaningful(lines[index])) index += 1;
    if (index >= lines.length) return { value: null, index };

    const firstLine = lines[index];
    const currentIndent = getIndent(firstLine);
    if (currentIndent < baseIndent) return { value: null, index };

    const firstTrim = firstLine.trim();
    const isArray = firstTrim.startsWith('-');

    if (isArray) {
      const arr = [];
      while (index < lines.length) {
        if (!meaningful(lines[index])) {
          index += 1;
          continue;
        }
        const line = lines[index];
        const indent = getIndent(line);
        if (indent < baseIndent) break;
        if (indent !== baseIndent || !line.trim().startsWith('-')) {
          throw new Error(`YAML parse error at line ${index + 1}: invalid list indentation`);
        }

        const content = line.trim().slice(1).trim();
        if (content === '') {
          const child = parseBlock(index + 1, baseIndent + 2);
          arr.push(child.value);
          index = child.index;
          continue;
        }

        const colonIndex = content.indexOf(':');
        if (colonIndex > 0) {
          const key = yamlKeyToString(content.slice(0, colonIndex));
          const rest = content.slice(colonIndex + 1).trim();
          const obj = {};
          if (rest) {
            obj[key] = parseYamlScalar(rest);
            index += 1;
          } else {
            const child = parseBlock(index + 1, baseIndent + 2);
            obj[key] = child.value;
            index = child.index;
          }

          while (index < lines.length) {
            if (!meaningful(lines[index])) {
              index += 1;
              continue;
            }
            const propLine = lines[index];
            const propIndent = getIndent(propLine);
            if (propIndent < baseIndent + 2) break;
            if (propIndent > baseIndent + 2) {
              throw new Error(`YAML parse error at line ${index + 1}: unsupported nested indentation`);
            }
            const propTrim = propLine.trim();
            if (propTrim.startsWith('-')) break;
            const splitAt = propTrim.indexOf(':');
            if (splitAt < 0) {
              throw new Error(`YAML parse error at line ${index + 1}: expected key:value`);
            }
            const propKey = yamlKeyToString(propTrim.slice(0, splitAt));
            const propRest = propTrim.slice(splitAt + 1).trim();
            if (propRest) {
              obj[propKey] = parseYamlScalar(propRest);
              index += 1;
            } else {
              const child = parseBlock(index + 1, propIndent + 2);
              obj[propKey] = child.value;
              index = child.index;
            }
          }

          arr.push(obj);
          continue;
        }

        arr.push(parseYamlScalar(content));
        index += 1;
      }

      return { value: arr, index };
    }

    const obj = {};
    while (index < lines.length) {
      if (!meaningful(lines[index])) {
        index += 1;
        continue;
      }
      const line = lines[index];
      const indent = getIndent(line);
      if (indent < baseIndent) break;
      if (indent !== baseIndent) {
        throw new Error(`YAML parse error at line ${index + 1}: invalid object indentation`);
      }
      const trimmed = line.trim();
      if (trimmed.startsWith('-')) break;
      const splitAt = trimmed.indexOf(':');
      if (splitAt < 0) {
        throw new Error(`YAML parse error at line ${index + 1}: expected key:value`);
      }
      const key = yamlKeyToString(trimmed.slice(0, splitAt));
      const rest = trimmed.slice(splitAt + 1).trim();
      if (rest) {
        obj[key] = parseYamlScalar(rest);
        index += 1;
      } else {
        const child = parseBlock(index + 1, baseIndent + 2);
        obj[key] = child.value;
        index = child.index;
      }
    }
    return { value: obj, index };
  };

  const firstContentLine = lines.findIndex((line) => meaningful(line));
  if (firstContentLine === -1) return null;
  const initialIndent = getIndent(lines[firstContentLine]);
  return parseBlock(firstContentLine, initialIndent).value;
};

const yamlStringifyScalar = (value) => {
  if (value === null) return 'null';
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (typeof value === 'string') return JSON.stringify(value);
  return JSON.stringify(value);
};

const stringifyYaml = (value, indent = 0) => {
  const space = ' '.repeat(indent);

  if (Array.isArray(value)) {
    if (!value.length) return `${space}[]`;
    return value
      .map((item) => {
        const scalar = item === null || ['string', 'number', 'boolean'].includes(typeof item);
        if (scalar) return `${space}- ${yamlStringifyScalar(item)}`;
        return `${space}-\n${stringifyYaml(item, indent + 2)}`;
      })
      .join('\n');
  }

  if (value && typeof value === 'object') {
    const keys = Object.keys(value);
    if (!keys.length) return `${space}{}`;
    return keys
      .map((key) => {
        const serializedKey = /^[A-Za-z0-9_-]+$/.test(key) ? key : JSON.stringify(key);
        const item = value[key];
        const scalar = item === null || ['string', 'number', 'boolean'].includes(typeof item);
        if (scalar) return `${space}${serializedKey}: ${yamlStringifyScalar(item)}`;
        return `${space}${serializedKey}:\n${stringifyYaml(item, indent + 2)}`;
      })
      .join('\n');
  }

  return `${space}${yamlStringifyScalar(value)}`;
};

const escapeJsonPointer = (segment) => segment.replace(/~/g, '~0').replace(/\//g, '~1');

const areDeepEqual = (left, right) => {
  try {
    return JSON.stringify(left) === JSON.stringify(right);
  } catch (error) {
    return left === right;
  }
};

const createJsonPatch = (source, target, currentPath = '') => {
  if (areDeepEqual(source, target)) return [];

  const sourceIsArray = Array.isArray(source);
  const targetIsArray = Array.isArray(target);
  const sourceIsObject = source && typeof source === 'object' && !sourceIsArray;
  const targetIsObject = target && typeof target === 'object' && !targetIsArray;

  if (sourceIsArray && targetIsArray) {
    const ops = [];
    const minLength = Math.min(source.length, target.length);
    for (let index = 0; index < minLength; index += 1) {
      ops.push(...createJsonPatch(source[index], target[index], `${currentPath}/${index}`));
    }
    for (let index = source.length - 1; index >= target.length; index -= 1) {
      ops.push({ op: 'remove', path: `${currentPath}/${index}` });
    }
    for (let index = source.length; index < target.length; index += 1) {
      ops.push({ op: 'add', path: `${currentPath}/${index}`, value: target[index] });
    }
    return ops;
  }

  if (sourceIsObject && targetIsObject) {
    const ops = [];
    const sourceKeys = Object.keys(source).sort();
    const targetKeys = Object.keys(target).sort();

    sourceKeys.forEach((key) => {
      if (!(key in target)) {
        ops.push({ op: 'remove', path: `${currentPath}/${escapeJsonPointer(key)}` });
      }
    });

    sourceKeys.forEach((key) => {
      if (key in target) {
        ops.push(...createJsonPatch(source[key], target[key], `${currentPath}/${escapeJsonPointer(key)}`));
      }
    });

    targetKeys.forEach((key) => {
      if (!(key in source)) {
        ops.push({ op: 'add', path: `${currentPath}/${escapeJsonPointer(key)}`, value: target[key] });
      }
    });

    return ops;
  }

  return [{ op: 'replace', path: currentPath || '', value: target }];
};

const JsonTools = () => {
  const [inputText, setInputText] = useState(SAMPLE_SNIPPETS.portfolio);
  const [targetText, setTargetText] = useState(SAMPLE_SNIPPETS.portfolioTarget);
  const [outputText, setOutputText] = useState('');
  const [indentSize, setIndentSize] = useState(2);
  const [activeAction, setActiveAction] = useState('validate');
  const [isWorking, setIsWorking] = useState(false);
  const [status, setStatus] = useState({
    type: 'info',
    message: 'Pick an operation and run it. Processing stays in your browser.'
  });

  const runAction = (actionId) => {
    setActiveAction(actionId);
    setIsWorking(true);

    window.setTimeout(() => {
      try {
        if (!inputText.trim()) {
          setStatus({ type: 'warning', message: 'Input is empty. Paste JSON or CSV first.' });
          setOutputText('');
          return;
        }

        if (actionId === 'validate') {
          const parsed = parseJsonWithDetails(inputText);
          if (parsed.error) {
            const location = parsed.error.line ? ` (line ${parsed.error.line}, column ${parsed.error.column})` : '';
            setStatus({
              type: 'error',
              message: `Invalid JSON${location}: ${parsed.error.message}`
            });
            setOutputText('');
          } else {
            const topLevelType = Array.isArray(parsed.value) ? 'array' : typeof parsed.value;
            const sizeKb = (new Blob([inputText]).size / 1024).toFixed(2);
            setStatus({
              type: 'success',
              message: `Valid JSON detected (${topLevelType}, ${sizeKb} KB).`
            });
            setOutputText(JSON.stringify(parsed.value, null, indentSize));
          }
          return;
        }

        if (actionId === 'escape') {
          const escaped = JSON.stringify(inputText).slice(1, -1);
          setOutputText(escaped);
          setStatus({ type: 'success', message: 'String escaped for JSON usage.' });
          return;
        }

        if (actionId === 'unescape') {
          const trimmed = inputText.trim();
          const wrapped = (trimmed.startsWith('"') && trimmed.endsWith('"'))
            ? trimmed
            : `"${trimmed.replace(/"/g, '\\"')}"`;
          const decoded = JSON.parse(wrapped);
          setOutputText(decoded);
          setStatus({ type: 'success', message: 'Escaped string decoded successfully.' });
          return;
        }

        if (actionId === 'csvToJson') {
          const rows = parseCsvRows(inputText);
          if (rows.length < 2) {
            setStatus({ type: 'warning', message: 'CSV requires a header row and at least one data row.' });
            setOutputText('');
            return;
          }
          const headers = rows[0].map((header, index) => header.trim() || `column_${index + 1}`);
          const data = rows.slice(1).map((row) => {
            const item = {};
            headers.forEach((header, index) => {
              item[header] = inferCsvValueType(row[index] || '');
            });
            return item;
          });
          setOutputText(JSON.stringify(data, null, indentSize));
          setStatus({ type: 'success', message: `CSV converted to JSON (${data.length} row${data.length === 1 ? '' : 's'}).` });
          return;
        }

        if (actionId === 'yamlToJson') {
          const data = parseYamlSubset(inputText);
          setOutputText(JSON.stringify(data, null, indentSize));
          setStatus({ type: 'success', message: 'YAML converted to JSON successfully.' });
          return;
        }

        const parsed = parseJsonWithDetails(inputText);
        if (parsed.error) {
          const location = parsed.error.line ? `line ${parsed.error.line}, column ${parsed.error.column}` : 'invalid syntax';
          setStatus({
            type: 'error',
            message: `Action failed. Fix JSON first (${location}).`
          });
          setOutputText('');
          return;
        }

        const data = parsed.value;

        if (actionId === 'format') {
          setOutputText(JSON.stringify(data, null, indentSize));
          setStatus({ type: 'success', message: `Formatted JSON with ${indentSize}-space indentation.` });
          return;
        }

        if (actionId === 'minify') {
          setOutputText(JSON.stringify(data));
          setStatus({ type: 'success', message: 'JSON minified successfully.' });
          return;
        }

        if (actionId === 'sort') {
          setOutputText(JSON.stringify(deepSortKeys(data), null, indentSize));
          setStatus({ type: 'success', message: 'Keys sorted recursively in ascending order.' });
          return;
        }

        if (actionId === 'flatten') {
          setOutputText(JSON.stringify(flattenObject(data), null, indentSize));
          setStatus({ type: 'success', message: 'Nested JSON flattened into dot-path keys.' });
          return;
        }

        if (actionId === 'unflatten') {
          if (!data || typeof data !== 'object' || Array.isArray(data)) {
            setStatus({ type: 'warning', message: 'Unflatten expects a JSON object with flat keys.' });
            setOutputText('');
            return;
          }
          setOutputText(JSON.stringify(unflattenObject(data), null, indentSize));
          setStatus({ type: 'success', message: 'Flat keys expanded into nested JSON.' });
          return;
        }

        if (actionId === 'jsonToCsv') {
          const rows = Array.isArray(data) ? data : [data];
          if (!rows.length) {
            setStatus({ type: 'warning', message: 'No rows found to convert.' });
            setOutputText('');
            return;
          }

          const normalizedRows = rows.map((row) => (row && typeof row === 'object' && !Array.isArray(row) ? row : { value: row }));
          const headers = Array.from(
            normalizedRows.reduce((set, row) => {
              Object.keys(row).forEach((key) => set.add(key));
              return set;
            }, new Set())
          );

          const csvLines = [
            headers.map(formatCsvCell).join(','),
            ...normalizedRows.map((row) => headers.map((header) => formatCsvCell(row[header])).join(','))
          ];

          setOutputText(csvLines.join('\n'));
          setStatus({ type: 'success', message: `JSON converted to CSV with ${normalizedRows.length} row${normalizedRows.length === 1 ? '' : 's'}.` });
          return;
        }

        if (actionId === 'jsonToYaml') {
          const yamlText = stringifyYaml(data);
          setOutputText(yamlText);
          setStatus({ type: 'success', message: 'JSON converted to YAML successfully.' });
          return;
        }

        if (actionId === 'jsonPatchDiff') {
          const targetParsed = parseJsonWithDetails(targetText);
          if (targetParsed.error) {
            const location = targetParsed.error.line
              ? `line ${targetParsed.error.line}, column ${targetParsed.error.column}`
              : 'invalid syntax';
            setStatus({ type: 'error', message: `Target JSON is invalid (${location}).` });
            setOutputText('');
            return;
          }
          const patch = createJsonPatch(data, targetParsed.value);
          setOutputText(JSON.stringify(patch, null, indentSize));
          setStatus({
            type: 'success',
            message: patch.length
              ? `JSON Patch generated with ${patch.length} operation${patch.length === 1 ? '' : 's'}.`
              : 'No differences detected. Source and target are equivalent.'
          });
        }
      } catch (error) {
        setStatus({
          type: 'error',
          message: `Operation failed: ${error.message || 'Unknown error'}`
        });
        setOutputText('');
      } finally {
        setIsWorking(false);
      }
    }, 180);
  };

  const copyOutput = async () => {
    if (!outputText) return;
    try {
      await navigator.clipboard.writeText(outputText);
      setStatus({ type: 'success', message: 'Output copied to clipboard.' });
    } catch (error) {
      setStatus({ type: 'error', message: 'Clipboard access failed. Use manual copy.' });
    }
  };

  const useOutputAsInput = () => {
    if (!outputText) return;
    setInputText(outputText);
    setStatus({ type: 'info', message: 'Output moved to input. You can run another action now.' });
  };

  const clearAll = () => {
    setInputText('');
    setTargetText('');
    setOutputText('');
    setStatus({ type: 'info', message: 'Cleared input and output.' });
  };

  const runSelectedAction = () => {
    runAction(activeAction);
  };

  const handleEditorKeyDown = (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      event.preventDefault();
      runSelectedAction();
    }
  };

  const statusClasses = useMemo(() => {
    if (status.type === 'success') return 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800/60 dark:bg-emerald-900/25 dark:text-emerald-300';
    if (status.type === 'warning') return 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800/60 dark:bg-amber-900/25 dark:text-amber-300';
    if (status.type === 'error') return 'border-red-200 bg-red-50 text-red-800 dark:border-red-800/60 dark:bg-red-900/25 dark:text-red-300';
    return 'border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-800/60 dark:bg-sky-900/25 dark:text-sky-300';
  }, [status.type]);

  const summaryLines = useMemo(() => {
    if (!outputText) return [];
    const action = ACTIONS.find((item) => item.id === activeAction)?.label || 'Transform';
    const inputSize = new Blob([inputText || '']).size;
    const targetSize = new Blob([targetText || '']).size;
    const outputSize = new Blob([outputText || '']).size;
    const lines = [
      `Action: ${action}`,
      `Input size: ${(inputSize / 1024).toFixed(2)} KB`,
      `Output size: ${(outputSize / 1024).toFixed(2)} KB`
    ];
    if (activeAction === 'jsonPatchDiff') {
      lines.push(`Target size: ${(targetSize / 1024).toFixed(2)} KB`);
    }
    lines.push(`Characters in output: ${outputText.length}`);
    return lines;
  }, [activeAction, inputText, outputText, targetText]);

  const modeGuide = useMemo(() => {
    if (activeAction === 'yamlToJson') return 'Paste YAML in the input panel and convert to JSON output.';
    if (activeAction === 'csvToJson') return 'Paste CSV with a header row. Columns become JSON keys.';
    if (activeAction === 'jsonToCsv') return 'Input JSON array/object and export rows as CSV.';
    if (activeAction === 'jsonPatchDiff') return 'Input is Base JSON. Target panel is compared to generate RFC 6902 patch ops.';
    if (activeAction === 'escape' || activeAction === 'unescape') return 'Use plain text input for string escape/unescape actions.';
    return 'Paste JSON in input, run an action, then reuse output for chained transforms.';
  }, [activeAction]);

  const inputLabel = activeAction === 'yamlToJson'
    ? 'YAML Input'
    : activeAction === 'csvToJson'
      ? 'CSV Input'
      : activeAction === 'jsonPatchDiff'
        ? 'Base JSON'
        : 'Input';

  const inputPlaceholder = activeAction === 'yamlToJson'
    ? 'Paste YAML here...'
    : activeAction === 'csvToJson'
      ? 'Paste CSV (header row required)...'
      : activeAction === 'escape' || activeAction === 'unescape'
        ? 'Paste plain text or escaped JSON string...'
        : 'Paste JSON here...';

  const outputLabel = activeAction === 'jsonPatchDiff'
    ? 'RFC 6902 Patch Output'
    : activeAction === 'jsonToYaml'
      ? 'YAML Output'
      : activeAction === 'jsonToCsv'
        ? 'CSV Output'
        : 'Output';

  return (
    <CalcLayout
      eyebrow="Developer Tools"
      title="JSON Tools Studio"
      subtitle="Format, validate, convert, and diff structured data in one workspace — built for fast API debugging and reliable payload cleanup."
    >
      <Head>
        <title>JSON Formatter, Validator and Transformer | Upaman JSON Tools</title>
        <meta
          name="description"
          content="Free JSON formatter and validator with JSON↔CSV, JSON↔YAML, flatten/unflatten, minify, sort keys, and JSON Patch diff."
        />
        <meta
          name="keywords"
          content="json formatter, json validator, json patch diff, json to yaml, yaml to json, json minify, flatten json, json to csv"
        />
        <link rel="canonical" href="https://upaman.com/json-tools" />
        <meta property="og:title" content="JSON Formatter and Validator | Upaman JSON Tools" />
        <meta
          property="og:description"
          content="Format, validate and transform JSON with JSON↔CSV, JSON↔YAML, flatten/unflatten, and RFC 6902 patch diff."
        />
        <meta property="og:url" content="https://upaman.com/json-tools" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="JSON Formatter and Validator | Upaman JSON Tools" />
        <meta
          name="twitter:description"
          content="Format, validate, convert JSON↔CSV/YAML, and generate JSON Patch diffs in one browser-based tool."
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'SoftwareApplication',
              name: 'JSON Tools Studio',
              applicationCategory: 'DeveloperApplication',
              operatingSystem: 'Web',
              url: 'https://upaman.com/json-tools',
              description: 'Browser-based JSON formatter, validator, converter (CSV/YAML), and JSON Patch diff generator.',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD'
              }
            })
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(buildFaqSchema(FAQ)) }}
        />
      </Head>

      <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 dark:border-brand-800/60 dark:bg-brand-900/20 dark:text-brand-300">
        <span aria-hidden="true">⚡</span> 100% browser-side processing
      </div>

      <div className="space-y-5">
        <Card className="p-4 sm:p-5">
          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-ink-soft dark:text-slate-300">
              Indent:
              <select
                value={indentSize}
                onChange={(e) => setIndentSize(Number(e.target.value))}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-ink outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/30 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              >
                <option value={2}>2 spaces</option>
                <option value={4}>4 spaces</option>
              </select>
            </label>
            <button type="button" onClick={runSelectedAction} className={utilityBtn} title="Run currently selected action (Ctrl/Cmd + Enter)" aria-label="Run selected action">
              Run selected action
            </button>
            <button type="button" onClick={() => setInputText(SAMPLE_SNIPPETS.portfolio)} className={utilityBtn} title="Load portfolio JSON sample data">
              Sample: Portfolio JSON
            </button>
            <button type="button" onClick={() => setInputText(SAMPLE_SNIPPETS.flat)} className={utilityBtn} title="Load flattened JSON sample">
              Sample: Flat Paths
            </button>
            <button type="button" onClick={() => setInputText(SAMPLE_SNIPPETS.csv)} className={utilityBtn} title="Load CSV sample input">
              Sample: CSV
            </button>
            <button type="button" onClick={() => setInputText(SAMPLE_SNIPPETS.yaml)} className={utilityBtn} title="Load YAML sample input">
              Sample: YAML
            </button>
            <button type="button" onClick={() => setTargetText(SAMPLE_SNIPPETS.portfolioTarget)} className={utilityBtn} title="Load target JSON sample for patch diff">
              Sample: Diff Target
            </button>
            <button type="button" onClick={useOutputAsInput} className={utilityBtn} title="Move output into input for chained transforms">
              Use output as input
            </button>
            <button type="button" onClick={copyOutput} className={utilityBtn} title="Copy output to clipboard">
              Copy output
            </button>
            <button type="button" onClick={clearAll} className={utilityBtn} title="Clear input, target, and output">
              Clear
            </button>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {ACTIONS.map((action) => {
              const active = activeAction === action.id;
              return (
                <button
                  key={action.id}
                  type="button"
                  onClick={() => runAction(action.id)}
                  aria-pressed={active}
                  aria-label={`${action.label}. ${action.hint}`}
                  title={action.hint}
                  className={cn(
                    'rounded-xl border p-3 text-left transition',
                    active
                      ? 'border-brand-400 bg-brand-50/70 shadow-sm dark:border-brand-500/70 dark:bg-brand-900/20'
                      : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800/60 dark:hover:border-slate-600'
                  )}
                >
                  <div className="text-sm font-bold text-ink dark:text-white">{action.emoji} {action.label}</div>
                  <div className="mt-0.5 text-xs text-ink-muted dark:text-slate-400">{action.hint}</div>
                </button>
              );
            })}
          </div>

          <p className="mt-4 text-sm text-ink-muted dark:text-slate-400">{modeGuide}</p>
          <p className="mt-1 text-xs text-ink-muted dark:text-slate-500">
            Shortcut: <strong className="font-semibold text-ink-soft dark:text-slate-300">Ctrl/Cmd + Enter</strong> runs the selected action from any editor panel.
          </p>

          <div
            role="status"
            aria-live={status.type === 'error' ? 'assertive' : 'polite'}
            aria-atomic="true"
            aria-busy={isWorking}
            className={cn('mt-4 rounded-xl border px-3.5 py-2.5 text-sm font-semibold', statusClasses)}
          >
            {status.message}
          </div>
        </Card>

        <div className={cn('grid gap-4', activeAction === 'jsonPatchDiff' ? 'lg:grid-cols-3' : 'lg:grid-cols-2')}>
          <div>
            <label htmlFor="json-tools-input" className={editorLabel}>{inputLabel}</label>
            <textarea
              id="json-tools-input"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleEditorKeyDown}
              spellCheck={false}
              aria-label={inputLabel}
              className={editorArea}
              placeholder={inputPlaceholder}
            />
          </div>

          {activeAction === 'jsonPatchDiff' && (
            <div>
              <label htmlFor="json-tools-target" className={editorLabel}>Target JSON</label>
              <textarea
                id="json-tools-target"
                value={targetText}
                onChange={(e) => setTargetText(e.target.value)}
                onKeyDown={handleEditorKeyDown}
                spellCheck={false}
                aria-label="Target JSON"
                className={editorArea}
                placeholder="Paste target JSON for patch generation..."
              />
            </div>
          )}

          <div>
            <label htmlFor="json-tools-output" className={editorLabel}>{outputLabel}</label>
            <textarea
              id="json-tools-output"
              value={outputText}
              onChange={(e) => setOutputText(e.target.value)}
              onKeyDown={handleEditorKeyDown}
              spellCheck={false}
              aria-label={outputLabel}
              className={editorArea}
              placeholder="Transformed output appears here..."
            />
          </div>
        </div>

        <ResultActions
          title="JSON tools summary"
          summaryLines={summaryLines}
          fileName="upaman-json-tools-summary.txt"
        />

        <CalculatorInfoPanel
          title="Methodology, assumptions, and source references"
          credibilityScope="This developer utility processes data entirely in your browser; output depends only on the input you provide and the documented transformation rules below."
          inputs={[
            'Input accepts JSON, CSV, and YAML (for YAML→JSON action)',
            'JSON Patch Diff compares source JSON against target JSON panel',
            'Conversion actions infer primitive value types where possible'
          ]}
          formulas={[
            'Validation uses strict JSON.parse behavior',
            'Sort keys uses recursive lexicographic ordering',
            'Flatten/unflatten use dot notation with [index] for arrays',
            'JSON Patch Diff outputs add/remove/replace operations compatible with RFC6902'
          ]}
          assumptions={[
            'CSV parser assumes first row is header',
            'YAML parser supports common indentation-based YAML structures',
            'Unflatten expects object keys in dot/bracket path format',
            'Large payloads may be slower on low-memory devices'
          ]}
          sources={[
            { label: 'RFC 8259 - The JSON Data Interchange Format', url: 'https://www.rfc-editor.org/rfc/rfc8259' },
            { label: 'ECMA-404 JSON specification', url: 'https://www.ecma-international.org/publications-and-standards/standards/ecma-404/' },
            { label: 'RFC 6902 - JSON Patch', url: 'https://www.rfc-editor.org/rfc/rfc6902' }
          ]}
        />

        <HowToSection
          heading="How to use JSON Tools Studio"
          name="How to format and validate JSON with Upaman JSON Tools"
          description="Format, validate, convert, and diff JSON entirely in your browser."
          steps={[
            { name: 'Paste your data', text: 'Drop JSON (or CSV/YAML for conversion actions) into the Input panel.' },
            { name: 'Pick an action', text: 'Choose Validate, Format, Minify, convert, or JSON Patch Diff from the action grid.' },
            { name: 'Run it', text: 'Click the action or press Ctrl/Cmd + Enter to process instantly on your device.' },
            { name: 'Reuse or copy', text: 'Copy the output, or use it as the next input to chain multiple transforms.' }
          ]}
        />

        <article className="mt-10 space-y-8 text-sm leading-relaxed text-ink-soft dark:text-slate-300">
          <section>
            <h2 className="font-display text-xl font-bold text-ink dark:text-white">The errors Validate catches most often</h2>
            <p className="mt-3">
              JSON is stricter than the JavaScript object syntax it resembles, and nearly every &ldquo;invalid
              JSON&rdquo; moment traces to one of a handful of habits. Trailing commas after the last item are legal in
              modern JavaScript but not in JSON. Keys must be double-quoted — <span className="font-mono">name:</span>{' '}
              fails where <span className="font-mono">&quot;name&quot;:</span> parses. Single-quoted strings, comments,{' '}
              <span className="font-mono">undefined</span>, and <span className="font-mono">NaN</span> are all fine in a
              JS console and all rejected here, because the JSON specification simply does not include them. When
              Validate reports a line and column, look one character <em>earlier</em> than the position it names —
              parsers typically fail on the first character that no longer fits, which sits just after the actual
              mistake.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-ink dark:text-white">Chaining transforms is the real workflow</h2>
            <p className="mt-3">
              The individual actions are ordinary; the &ldquo;use output as input&rdquo; button is what makes this a
              studio. A CSV export from a spreadsheet becomes structured JSON in one step, flattens to dot-notation
              paths in a second so you can grep a single field, and un-flattens back after editing. An API response
              formats for reading, then minifies for pasting into a curl command. And when a deploy changes a config,
              JSON Patch Diff against the old version produces an RFC 6902 operation list — a precise, machine-applicable
              statement of <em>what changed</em>, which is often more useful in a pull request or incident note than two
              full files side by side.
            </p>
            <p className="mt-3">
              Everything runs locally in your browser, which is not just a privacy nicety — it changes what you can
              safely paste. Payloads with bearer tokens, personally identifiable data, or internal URLs never leave your
              machine, so the tool is usable for exactly the debugging sessions where an online formatter would be a
              policy violation. It also means the page keeps working when your connection does not.
            </p>
          </section>
        </article>

        <section className="mt-10" aria-label="JSON Tools frequently asked questions">
          <h2 className="font-display text-xl font-bold text-ink dark:text-white">JSON Tools FAQ</h2>
          <div className="mt-4 grid gap-3">
            {FAQ.map(({ question, answer }) => (
              <details key={question} className="group rounded-xl border border-slate-200/70 bg-white p-4 dark:border-slate-700/70 dark:bg-slate-800/70">
                <summary className="cursor-pointer list-none font-semibold text-ink marker:hidden dark:text-white">{question}</summary>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted dark:text-slate-400">{answer}</p>
              </details>
            ))}
          </div>
        </section>
      </div>
    </CalcLayout>
  );
};

export default JsonTools;
