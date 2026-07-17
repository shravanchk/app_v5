// Pure data-transformation logic for the JSON tools pages. No React, no DOM —
// everything here is unit-testable under node --test. YAML support is loaded
// on demand via dynamic import so js-yaml stays out of the shared bundle.

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

const csvToJson = (csvText) => {
  const rows = parseCsvRows(csvText);
  if (rows.length < 2) {
    throw new Error('CSV requires a header row and at least one data row.');
  }
  const headers = rows[0].map((header, index) => header.trim() || `column_${index + 1}`);
  return rows.slice(1).map((row) => {
    const item = {};
    headers.forEach((header, index) => {
      item[header] = inferCsvValueType(row[index] || '');
    });
    return item;
  });
};

const jsonToCsv = (data) => {
  const rows = Array.isArray(data) ? data : [data];
  if (!rows.length) {
    throw new Error('No rows found to convert.');
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

  return { csv: csvLines.join('\n'), rowCount: normalizedRows.length };
};

// Minimal recursive-descent JSON scanner used only to locate WHERE parsing
// fails. Engines word their JSON.parse errors differently (newer V8 omits the
// position entirely), so we find the offending index ourselves.
const findJsonErrorPosition = (text) => {
  let i = 0;
  const fail = () => {
    const err = new Error('scan failed');
    err.pos = Math.min(i, Math.max(0, text.length - 1));
    throw err;
  };
  const skipWs = () => {
    while (i < text.length && (text[i] === ' ' || text[i] === '\t' || text[i] === '\n' || text[i] === '\r')) i += 1;
  };
  const parseString = () => {
    i += 1; // opening quote
    while (i < text.length) {
      const char = text[i];
      if (char === '"') {
        i += 1;
        return;
      }
      if (char.charCodeAt(0) < 0x20) fail();
      if (char === '\\') {
        const escape = text[i + 1];
        if (escape === 'u') {
          if (!/^[0-9a-fA-F]{4}$/.test(text.slice(i + 2, i + 6))) {
            i += 1;
            fail();
          }
          i += 6;
        } else if ('"\\/bfnrt'.includes(escape)) {
          i += 2;
        } else {
          i += 1;
          fail();
        }
      } else {
        i += 1;
      }
    }
    fail(); // unterminated string
  };
  const parseValue = () => {
    skipWs();
    if (i >= text.length) fail();
    const char = text[i];
    if (char === '{') {
      i += 1;
      skipWs();
      if (text[i] === '}') {
        i += 1;
        return;
      }
      for (;;) {
        skipWs();
        if (text[i] !== '"') fail();
        parseString();
        skipWs();
        if (text[i] !== ':') fail();
        i += 1;
        parseValue();
        skipWs();
        if (text[i] === ',') {
          i += 1;
          continue;
        }
        if (text[i] === '}') {
          i += 1;
          return;
        }
        fail();
      }
    }
    if (char === '[') {
      i += 1;
      skipWs();
      if (text[i] === ']') {
        i += 1;
        return;
      }
      for (;;) {
        parseValue();
        skipWs();
        if (text[i] === ',') {
          i += 1;
          continue;
        }
        if (text[i] === ']') {
          i += 1;
          return;
        }
        fail();
      }
    }
    if (char === '"') {
      parseString();
      return;
    }
    const numberMatch = /^-?(0|[1-9]\d*)(\.\d+)?([eE][+-]?\d+)?/.exec(text.slice(i));
    if (numberMatch && numberMatch[0].length) {
      i += numberMatch[0].length;
      return;
    }
    if (text.startsWith('true', i)) {
      i += 4;
      return;
    }
    if (text.startsWith('false', i)) {
      i += 5;
      return;
    }
    if (text.startsWith('null', i)) {
      i += 4;
      return;
    }
    fail();
  };

  try {
    parseValue();
    skipWs();
    if (i < text.length) fail(); // trailing content
    return null;
  } catch (error) {
    return typeof error.pos === 'number' ? error.pos : null;
  }
};

// Returns { value } on success or { error: { message, line, column } } on failure.
const parseJsonWithDetails = (text) => {
  try {
    return { value: JSON.parse(text) };
  } catch (error) {
    const message = error?.message || 'Invalid JSON';

    // Firefox/Safari embed "line L column C" directly in the message.
    const lineColumnMatch = /line (\d+) column (\d+)/i.exec(message);
    if (lineColumnMatch) {
      return { error: { message, line: Number(lineColumnMatch[1]), column: Number(lineColumnMatch[2]) } };
    }

    // Older V8 reports "position N"; newer V8 reports neither, so scan for it.
    const positionMatch = /position (\d+)/i.exec(message);
    const position = positionMatch ? Number(positionMatch[1]) : findJsonErrorPosition(text);
    if (position === null) {
      return { error: { message, line: null, column: null } };
    }

    const before = text.slice(0, position);
    const line = before.split('\n').length;
    const lastBreak = before.lastIndexOf('\n');
    const column = position - lastBreak;

    return { error: { message, line, column } };
  }
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

// js-yaml is pulled in lazily so it only downloads when a YAML action runs.
const loadYamlModule = async () => {
  const mod = await import('js-yaml');
  return mod.default || mod;
};

// js-yaml v4 resolves anchors/aliases but leaves "<<" merge keys as literal
// keys. Expand them per YAML 1.1 merge semantics: explicit keys win, and for
// a sequence of merge sources, earlier sources take precedence.
const expandYamlMerges = (value) => {
  if (Array.isArray(value)) return value.map(expandYamlMerges);
  if (!value || typeof value !== 'object') return value;

  const result = {};
  Object.entries(value).forEach(([key, entry]) => {
    if (key !== '<<') result[key] = expandYamlMerges(entry);
  });

  if (typeof value['<<'] !== 'undefined') {
    const sources = Array.isArray(value['<<']) ? value['<<'] : [value['<<']];
    sources.forEach((source) => {
      const expanded = expandYamlMerges(source);
      if (expanded && typeof expanded === 'object' && !Array.isArray(expanded)) {
        Object.keys(expanded).forEach((key) => {
          if (!(key in result)) result[key] = expanded[key];
        });
      }
    });
  }

  return result;
};

const yamlToJson = async (yamlText) => {
  const yaml = await loadYamlModule();
  return expandYamlMerges(yaml.load(yamlText));
};

const jsonToYaml = async (data) => {
  const yaml = await loadYamlModule();
  return yaml.dump(data, { indent: 2, lineWidth: 120, noRefs: true }).replace(/\n$/, '');
};

module.exports = {
  tokenizePath,
  deepSortKeys,
  flattenObject,
  unflattenObject,
  parseCsvRows,
  formatCsvCell,
  inferCsvValueType,
  csvToJson,
  jsonToCsv,
  parseJsonWithDetails,
  escapeJsonPointer,
  createJsonPatch,
  yamlToJson,
  jsonToYaml
};
