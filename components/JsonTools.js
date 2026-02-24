import React, { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import CalculatorInfoPanel from './CalculatorInfoPanel';
import HomeButton from './HomeButton';
import ResultActions from './ResultActions';

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
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('theme') === 'dark';
  });
  const [inputText, setInputText] = useState(SAMPLE_SNIPPETS.portfolio);
  const [targetText, setTargetText] = useState(SAMPLE_SNIPPETS.portfolioTarget);
  const [outputText, setOutputText] = useState('');
  const [indentSize, setIndentSize] = useState(2);
  const [activeAction, setActiveAction] = useState('validate');
  const [viewportWidth, setViewportWidth] = useState(() => {
    if (typeof window === 'undefined') return 1280;
    return window.innerWidth;
  });
  const [isWorking, setIsWorking] = useState(false);
  const [status, setStatus] = useState({
    type: 'info',
    message: 'Pick an operation and run it. Processing stays in your browser.'
  });
  const isCompactLayout = viewportWidth <= 768;
  const isTabletLayout = viewportWidth > 768 && viewportWidth <= 1100;

  useEffect(() => {
    document.body.classList.toggle('dark-theme', isDarkMode);
  }, [isDarkMode]);

  useEffect(() => {
    const syncTheme = () => {
      const savedTheme = localStorage.getItem('theme');
      setIsDarkMode(savedTheme === 'dark');
    };

    window.addEventListener('upaman-theme-change', syncTheme);
    window.addEventListener('storage', syncTheme);
    return () => {
      window.removeEventListener('upaman-theme-change', syncTheme);
      window.removeEventListener('storage', syncTheme);
    };
  }, []);

  useEffect(() => {
    const syncLayout = () => {
      setViewportWidth(window.innerWidth);
    };

    window.addEventListener('resize', syncLayout);
    return () => {
      window.removeEventListener('resize', syncLayout);
    };
  }, []);

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

  const statusColor = useMemo(() => {
    if (status.type === 'success') return { bg: '#dcfce7', border: '#86efac', text: '#166534' };
    if (status.type === 'warning') return { bg: '#fef9c3', border: '#fde047', text: '#854d0e' };
    if (status.type === 'error') return { bg: '#fee2e2', border: '#fca5a5', text: '#991b1b' };
    return { bg: '#e0f2fe', border: '#7dd3fc', text: '#0c4a6e' };
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

  const actionGridColumns = isCompactLayout
    ? '1fr'
    : isTabletLayout
      ? 'repeat(2, minmax(0, 1fr))'
      : 'repeat(auto-fit, minmax(280px, 1fr))';
  const editorGridColumns = (isCompactLayout || (isTabletLayout && activeAction === 'jsonPatchDiff'))
    ? '1fr'
    : isTabletLayout
      ? '1fr 1fr'
      : 'repeat(auto-fit, minmax(320px, 1fr))';
  const editorMinHeight = isCompactLayout ? '270px' : isTabletLayout ? '320px' : '410px';
  const editorPadding = isCompactLayout ? '0.78rem' : '0.9rem';
  const editorFontSize = isCompactLayout ? '0.78rem' : '0.82rem';
  const utilityButtonStyle = isCompactLayout
    ? { minHeight: '2.2rem', padding: '0 0.72rem', fontSize: '0.75rem' }
    : isTabletLayout
      ? { minHeight: '2.15rem', padding: '0 0.7rem', fontSize: '0.76rem' }
      : { minHeight: '2rem' };

  return (
    <div
      className="calculator-container"
      style={{
        background: isDarkMode
          ? 'radial-gradient(circle at 12% 10%, rgba(15, 118, 110, 0.28), transparent 36%), radial-gradient(circle at 85% 85%, rgba(180, 83, 9, 0.2), transparent 30%), linear-gradient(135deg, #081424 0%, #0f2133 100%)'
          : 'radial-gradient(circle at 12% 10%, rgba(15, 118, 110, 0.18), transparent 40%), radial-gradient(circle at 85% 85%, rgba(180, 83, 9, 0.16), transparent 34%), linear-gradient(135deg, #f5f4ef 0%, #e6edf5 100%)',
        paddingTop: isCompactLayout ? '1rem' : isTabletLayout ? '1.2rem' : '1.5rem'
      }}
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
      </Head>

      <style>{`
        @keyframes jsonPulse {
          0%, 100% { transform: scale(1); opacity: 0.95; }
          50% { transform: scale(1.04); opacity: 1; }
        }
        @keyframes jsonShimmer {
          0% { background-position: -140% 0; }
          100% { background-position: 140% 0; }
        }
        @keyframes jsonFadeUp {
          0% { opacity: 0; transform: translateY(8px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          * {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>

      <HomeButton />

      <div style={{ maxWidth: '1260px', margin: '0 auto', padding: isCompactLayout ? '0 0.55rem 1.7rem' : isTabletLayout ? '0 0.7rem 2rem' : '0 0.8rem 2.4rem' }}>
        <div
          style={{
            borderRadius: '1.2rem',
            border: `1px solid ${isDarkMode ? '#33516f' : '#d3dee9'}`,
            background: isDarkMode ? 'rgba(17, 33, 50, 0.85)' : 'rgba(255, 255, 255, 0.9)',
            boxShadow: isDarkMode
              ? '0 18px 40px rgba(0,0,0,0.44)'
              : '0 16px 34px rgba(9, 30, 66, 0.18)',
            overflow: 'hidden'
          }}
        >
          <div
            style={{
              padding: isCompactLayout ? '1.15rem 0.9rem 1rem' : isTabletLayout ? '1.35rem 1rem 1.15rem' : '1.6rem 1.2rem 1.3rem',
              background: isDarkMode
                ? 'linear-gradient(135deg, #0f2a43 0%, #115e59 100%)'
                : 'linear-gradient(135deg, #0f2a43 0%, #1d4e89 70%, #0f766e 100%)',
              color: '#f8fafc'
            }}
          >
            <h1 style={{ margin: 0, fontSize: 'clamp(1.4rem, 3.2vw, 2rem)', letterSpacing: '0.01em' }}>
              JSON Tools Studio
            </h1>
            <p style={{ margin: '0.55rem 0 0', opacity: 0.92, lineHeight: 1.55 }}>
              Format, validate, convert, and diff structured data in one workspace. Built for fast API debugging and reliable payload cleanup.
            </p>
            <div
              style={{
                marginTop: '0.9rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                borderRadius: '999px',
                border: '1px solid rgba(255,255,255,0.35)',
                background: 'rgba(255,255,255,0.12)',
                padding: '0.3rem 0.7rem',
                fontSize: '0.78rem',
                fontWeight: 600,
                animation: 'jsonPulse 2s ease-in-out infinite'
              }}
            >
              ⚡ 100% browser-side processing
            </div>
          </div>

          <div style={{ padding: isCompactLayout ? '0.8rem 0.75rem 1.05rem' : isTabletLayout ? '0.9rem 0.9rem 1.1rem' : '1rem 1rem 1.25rem' }}>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: isCompactLayout ? '0.45rem' : isTabletLayout ? '0.5rem' : '0.55rem',
                marginBottom: isCompactLayout ? '0.75rem' : '0.9rem'
              }}
            >
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: isDarkMode ? '#cbd5e1' : '#334155' }}>
                Indent:
                <select
                  value={indentSize}
                  onChange={(e) => setIndentSize(Number(e.target.value))}
                  style={{
                    marginLeft: '0.4rem',
                    borderRadius: '0.45rem',
                    border: `1px solid ${isDarkMode ? '#4b6480' : '#cbd5e1'}`,
                    background: isDarkMode ? '#16283c' : '#ffffff',
                    color: isDarkMode ? '#e2e8f0' : '#1e293b',
                    padding: '0.35rem 0.5rem'
                  }}
                >
                  <option value={2}>2 spaces</option>
                  <option value={4}>4 spaces</option>
                </select>
              </label>
              <button
                type="button"
                onClick={runSelectedAction}
                className="result-action-button"
                style={utilityButtonStyle}
                title="Run currently selected action (Ctrl/Cmd + Enter)"
                aria-label="Run selected action"
              >
                Run selected action
              </button>

              <button
                type="button"
                onClick={() => setInputText(SAMPLE_SNIPPETS.portfolio)}
                className="result-action-button"
                style={utilityButtonStyle}
                title="Load portfolio JSON sample data"
              >
                Sample: Portfolio JSON
              </button>
              <button
                type="button"
                onClick={() => setInputText(SAMPLE_SNIPPETS.flat)}
                className="result-action-button"
                style={utilityButtonStyle}
                title="Load flattened JSON sample"
              >
                Sample: Flat Paths
              </button>
              <button
                type="button"
                onClick={() => setInputText(SAMPLE_SNIPPETS.csv)}
                className="result-action-button"
                style={utilityButtonStyle}
                title="Load CSV sample input"
              >
                Sample: CSV
              </button>
              <button
                type="button"
                onClick={() => setInputText(SAMPLE_SNIPPETS.yaml)}
                className="result-action-button"
                style={utilityButtonStyle}
                title="Load YAML sample input"
              >
                Sample: YAML
              </button>
              <button
                type="button"
                onClick={() => setTargetText(SAMPLE_SNIPPETS.portfolioTarget)}
                className="result-action-button"
                style={utilityButtonStyle}
                title="Load target JSON sample for patch diff"
              >
                Sample: Diff Target
              </button>
              <button type="button" onClick={useOutputAsInput} className="result-action-button" style={utilityButtonStyle} title="Move output into input for chained transforms">
                Use output as input
              </button>
              <button type="button" onClick={copyOutput} className="result-action-button" style={utilityButtonStyle} title="Copy output to clipboard">
                Copy output
              </button>
              <button type="button" onClick={clearAll} className="result-action-button" style={utilityButtonStyle} title="Clear input, target, and output">
                Clear
              </button>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: actionGridColumns,
                gap: isCompactLayout ? '0.55rem' : '0.85rem',
                marginBottom: isCompactLayout ? '0.8rem' : '0.95rem'
              }}
            >
              {ACTIONS.map((action, index) => (
                <button
                  key={action.id}
                  type="button"
                  onClick={() => runAction(action.id)}
                  aria-pressed={activeAction === action.id}
                  aria-label={`${action.label}. ${action.hint}`}
                  title={action.hint}
                  style={{
                    textAlign: 'left',
                    borderRadius: '0.8rem',
                    border: `1px solid ${
                      activeAction === action.id
                        ? (isDarkMode ? '#4fd1c5' : '#0f766e')
                        : (isDarkMode ? '#30485f' : '#d7e1eb')
                    }`,
                    background: activeAction === action.id
                      ? (isDarkMode ? 'linear-gradient(135deg, rgba(15, 118, 110, 0.24), rgba(29, 78, 137, 0.28))' : 'linear-gradient(135deg, rgba(15, 118, 110, 0.11), rgba(29, 78, 137, 0.12))')
                      : (isDarkMode ? 'rgba(17, 33, 50, 0.78)' : 'rgba(255, 255, 255, 0.82)'),
                    color: isDarkMode ? '#e2e8f0' : '#1e293b',
                    padding: isCompactLayout ? '0.62rem 0.72rem' : '0.72rem 0.82rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: activeAction === action.id
                      ? (isDarkMode ? '0 10px 18px rgba(15, 118, 110, 0.2)' : '0 8px 16px rgba(15, 118, 110, 0.14)')
                      : 'none',
                    animation: `jsonFadeUp 0.3s ease ${index * 20}ms both`
                  }}
                >
                  <div style={{ fontSize: isCompactLayout ? '0.84rem' : '0.88rem', fontWeight: 700 }}>
                    {action.emoji} {action.label}
                  </div>
                  <div style={{ fontSize: isCompactLayout ? '0.72rem' : '0.74rem', marginTop: '0.18rem', opacity: 0.86 }}>
                    {action.hint}
                  </div>
                </button>
              ))}
            </div>
            <p style={{ margin: isCompactLayout ? '-0.1rem 0 0.65rem' : '-0.1rem 0 0.8rem', fontSize: '0.78rem', color: isDarkMode ? '#93a6bb' : '#526377' }}>
              {modeGuide}
            </p>
            <p style={{ margin: '-0.25rem 0 0.72rem', fontSize: '0.75rem', color: isDarkMode ? '#8fa4bb' : '#5f7389' }}>
              Shortcut: <strong>Ctrl/Cmd + Enter</strong> runs the selected action from any editor panel.
            </p>

            <div
              role="status"
              aria-live={status.type === 'error' ? 'assertive' : 'polite'}
              aria-atomic="true"
              aria-busy={isWorking}
              style={{
                borderRadius: '0.8rem',
                border: `1px solid ${statusColor.border}`,
                background: statusColor.bg,
                color: statusColor.text,
                padding: '0.68rem 0.8rem',
                fontSize: '0.84rem',
                fontWeight: 600,
                marginBottom: isCompactLayout ? '0.75rem' : '0.95rem',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {isWorking && (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                    backgroundSize: '200% 100%',
                    animation: 'jsonShimmer 1.2s linear infinite'
                  }}
                />
              )}
              <span style={{ position: 'relative' }}>{status.message}</span>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: editorGridColumns,
                gap: isCompactLayout ? '0.75rem' : '0.9rem'
              }}
            >
              <div>
                <label
                  htmlFor="json-tools-input"
                  style={{
                    display: 'block',
                    marginBottom: '0.45rem',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    color: isDarkMode ? '#94a3b8' : '#475569',
                    textTransform: 'uppercase',
                    letterSpacing: '0.03em'
                  }}
                >
                  {inputLabel}
                </label>
                <textarea
                  id="json-tools-input"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleEditorKeyDown}
                  spellCheck={false}
                  aria-label={inputLabel}
                  style={{
                    width: '100%',
                    minHeight: editorMinHeight,
                    borderRadius: '0.8rem',
                    border: `1px solid ${isDarkMode ? '#35506b' : '#cbd5e1'}`,
                    background: isDarkMode ? '#0f1f31' : '#ffffff',
                    color: isDarkMode ? '#e2e8f0' : '#1e293b',
                    padding: editorPadding,
                    fontFamily: '\'IBM Plex Mono\', \'SFMono-Regular\', Menlo, Consolas, monospace',
                    fontSize: editorFontSize,
                    lineHeight: 1.5,
                    resize: 'vertical'
                  }}
                  placeholder={inputPlaceholder}
                />
              </div>

              {activeAction === 'jsonPatchDiff' && (
                <div>
                  <label
                    htmlFor="json-tools-target"
                    style={{
                      display: 'block',
                      marginBottom: '0.45rem',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      color: isDarkMode ? '#94a3b8' : '#475569',
                      textTransform: 'uppercase',
                      letterSpacing: '0.03em'
                    }}
                  >
                    Target JSON
                  </label>
                  <textarea
                    id="json-tools-target"
                    value={targetText}
                    onChange={(e) => setTargetText(e.target.value)}
                    onKeyDown={handleEditorKeyDown}
                    spellCheck={false}
                    aria-label="Target JSON"
                    style={{
                      width: '100%',
                      minHeight: editorMinHeight,
                      borderRadius: '0.8rem',
                      border: `1px solid ${isDarkMode ? '#35506b' : '#cbd5e1'}`,
                      background: isDarkMode ? '#0f1f31' : '#ffffff',
                      color: isDarkMode ? '#e2e8f0' : '#1e293b',
                      padding: editorPadding,
                      fontFamily: '\'IBM Plex Mono\', \'SFMono-Regular\', Menlo, Consolas, monospace',
                      fontSize: editorFontSize,
                      lineHeight: 1.5,
                      resize: 'vertical'
                    }}
                    placeholder="Paste target JSON for patch generation..."
                  />
                </div>
              )}

              <div>
                <label
                  htmlFor="json-tools-output"
                  style={{
                    display: 'block',
                    marginBottom: '0.45rem',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    color: isDarkMode ? '#94a3b8' : '#475569',
                    textTransform: 'uppercase',
                    letterSpacing: '0.03em'
                  }}
                >
                  {outputLabel}
                </label>
                <textarea
                  id="json-tools-output"
                  value={outputText}
                  onChange={(e) => setOutputText(e.target.value)}
                  onKeyDown={handleEditorKeyDown}
                  spellCheck={false}
                  aria-label={outputLabel}
                  style={{
                    width: '100%',
                    minHeight: editorMinHeight,
                    borderRadius: '0.8rem',
                    border: `1px solid ${isDarkMode ? '#35506b' : '#cbd5e1'}`,
                    background: isDarkMode ? '#0f1f31' : '#ffffff',
                    color: isDarkMode ? '#e2e8f0' : '#1e293b',
                    padding: editorPadding,
                    fontFamily: '\'IBM Plex Mono\', \'SFMono-Regular\', Menlo, Consolas, monospace',
                    fontSize: editorFontSize,
                    lineHeight: 1.5,
                    resize: 'vertical'
                  }}
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default JsonTools;
