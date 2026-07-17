// Action metadata, tab grouping, sample data, and per-page SEO content for the
// JSON tools. The workbench UI (JsonWorkbench.js) is driven entirely by this file.

export const SAMPLE_SNIPPETS = {
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
  text: `Line one with "quotes" and a	tab
Line two with a backslash \\`,
  escapedText: `Line one with \\"quotes\\" and a\\ttab\\nLine two with a backslash \\\\`,
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

// inputKind drives the input label/placeholder and which sample loads.
// outputKind drives the output label and download file extension.
export const ACTIONS = {
  validate: {
    id: 'validate', label: 'Validate', hint: 'Check syntax and show the exact error line', emoji: '✅',
    inputKind: 'json', outputKind: 'json', sampleKey: 'portfolio'
  },
  format: {
    id: 'format', label: 'Format', hint: 'Pretty-print JSON with stable indentation', emoji: '✨',
    inputKind: 'json', outputKind: 'json', sampleKey: 'portfolio'
  },
  minify: {
    id: 'minify', label: 'Minify', hint: 'Strip whitespace for the smallest payload', emoji: '🗜️',
    inputKind: 'json', outputKind: 'json', sampleKey: 'portfolio'
  },
  sort: {
    id: 'sort', label: 'Sort Keys', hint: 'Recursively sort object keys A→Z', emoji: '🧭',
    inputKind: 'json', outputKind: 'json', sampleKey: 'portfolio'
  },
  flatten: {
    id: 'flatten', label: 'Flatten', hint: 'Convert nested JSON to dot/bracket paths', emoji: '📉',
    inputKind: 'json', outputKind: 'json', sampleKey: 'portfolio'
  },
  unflatten: {
    id: 'unflatten', label: 'Unflatten', hint: 'Rebuild nested JSON from flat paths', emoji: '📈',
    inputKind: 'json', outputKind: 'json', sampleKey: 'flat'
  },
  escape: {
    id: 'escape', label: 'Escape String', hint: 'Escape text for use inside a JSON string', emoji: '🔐',
    inputKind: 'text', outputKind: 'text', sampleKey: 'text'
  },
  unescape: {
    id: 'unescape', label: 'Unescape String', hint: 'Decode an escaped JSON string', emoji: '🔓',
    inputKind: 'text', outputKind: 'text', sampleKey: 'escapedText'
  },
  jsonToCsv: {
    id: 'jsonToCsv', label: 'JSON → CSV', hint: 'Convert an array of objects into CSV rows', emoji: '📋',
    inputKind: 'json', outputKind: 'csv', sampleKey: 'portfolio'
  },
  csvToJson: {
    id: 'csvToJson', label: 'CSV → JSON', hint: 'Map CSV rows into typed JSON objects', emoji: '🔁',
    inputKind: 'csv', outputKind: 'json', sampleKey: 'csv'
  },
  jsonToYaml: {
    id: 'jsonToYaml', label: 'JSON → YAML', hint: 'Render JSON as readable YAML', emoji: '🌿',
    inputKind: 'json', outputKind: 'yaml', sampleKey: 'portfolio'
  },
  yamlToJson: {
    id: 'yamlToJson', label: 'YAML → JSON', hint: 'Parse YAML (anchors, multiline) into JSON', emoji: '🧪',
    inputKind: 'yaml', outputKind: 'json', sampleKey: 'yaml'
  },
  jsonPatchDiff: {
    id: 'jsonPatchDiff', label: 'JSON Patch Diff', hint: 'Generate RFC 6902 operations from base → target', emoji: '🩹',
    inputKind: 'json', outputKind: 'json', sampleKey: 'portfolio', needsTarget: true
  }
};

export const INPUT_KIND_META = {
  json: { label: 'JSON Input', placeholder: 'Paste JSON here...' },
  csv: { label: 'CSV Input', placeholder: 'Paste CSV (header row required)...' },
  yaml: { label: 'YAML Input', placeholder: 'Paste YAML here...' },
  text: { label: 'Text Input', placeholder: 'Paste plain text or an escaped JSON string...' }
};

export const OUTPUT_KIND_META = {
  json: { label: 'JSON Output', extension: 'json' },
  csv: { label: 'CSV Output', extension: 'csv' },
  yaml: { label: 'YAML Output', extension: 'yaml' },
  text: { label: 'Text Output', extension: 'txt' }
};

export const TABS = [
  { id: 'formatTab', label: 'Format & Validate', actions: ['format', 'validate', 'minify', 'sort'] },
  { id: 'convertTab', label: 'Convert', actions: ['jsonToCsv', 'csvToJson', 'jsonToYaml', 'yamlToJson'] },
  { id: 'transformTab', label: 'Transform', actions: ['flatten', 'unflatten', 'escape', 'unescape'] },
  { id: 'diffTab', label: 'Diff', actions: ['jsonPatchDiff'] }
];

const SITE_URL = 'https://upaman.com';

// Short blurbs used for "related tools" cross-links between pages.
export const TOOL_LINKS = {
  studio: { path: '/json-tools', title: 'JSON Tools Studio', blurb: 'All tools in one workspace' },
  formatter: { path: '/json-formatter', title: 'JSON Formatter', blurb: 'Pretty-print and sort keys' },
  validator: { path: '/json-validator', title: 'JSON Validator', blurb: 'Find the exact error line' },
  minifier: { path: '/json-minifier', title: 'JSON Minifier', blurb: 'Compress for transport' },
  jsonToCsv: { path: '/json-to-csv', title: 'JSON to CSV', blurb: 'Export objects as rows' },
  csvToJson: { path: '/csv-to-json', title: 'CSV to JSON', blurb: 'Turn spreadsheets into JSON' },
  jsonToYaml: { path: '/json-to-yaml', title: 'JSON to YAML', blurb: 'Config-friendly output' },
  yamlToJson: { path: '/yaml-to-json', title: 'YAML to JSON', blurb: 'Full YAML spec support' },
  diff: { path: '/json-diff', title: 'JSON Diff', blurb: 'RFC 6902 patch generator' }
};

const STUDIO_FAQ = [
  { question: 'Is my JSON data sent to a server?', answer: 'No. Every action — validate, format, convert, diff — runs entirely in your browser with JavaScript. Nothing is uploaded, logged, or stored, so it is safe to paste API payloads, tokens, or private data.' },
  { question: 'What is the difference between Format, Minify, and Validate?', answer: 'Validate checks that your JSON parses and reports the exact line and column of any syntax error. Format (pretty-print) re-indents valid JSON with 2 or 4 spaces for readability. Minify strips all optional whitespace to produce the smallest possible single-line JSON for transport.' },
  { question: 'How do Flatten and Unflatten paths work?', answer: 'Flatten converts nested JSON into a single-level object using dot notation for keys and [index] for array elements — for example user.goals[0].name. Unflatten reverses that, rebuilding the nested object or array structure from those flat path keys.' },
  { question: 'What is a JSON Patch diff?', answer: 'JSON Patch Diff compares your Base JSON against the Target panel and outputs a list of add, remove, and replace operations that transform one into the other. The output follows RFC 6902, so you can apply it with any standard JSON Patch library.' },
  { question: 'Can it convert between JSON, CSV, and YAML?', answer: 'Yes. JSON→CSV flattens an array of objects into rows, CSV→JSON maps a header row into keys and infers primitive types, and JSON↔YAML converts between the two formats. Use "Use output as input" to chain conversions.' },
  { question: 'Is there a size limit?', answer: 'There is no hard limit, but because processing happens on your device, very large payloads (several megabytes) may be slower on low-memory devices. The editor shows the input size in KB as you type.' },
  { question: 'Does it work offline?', answer: 'Once the page has loaded, all transformations run locally, so the tools keep working even without an active network connection.' }
];

export const STUDIO_PAGE = {
  isStudio: true,
  slug: 'json-tools',
  path: '/json-tools',
  eyebrow: 'Developer Tools',
  h1: 'JSON Tools Studio',
  subtitle: 'Format, validate, convert, and diff structured data in one workspace — built for fast API debugging and reliable payload cleanup.',
  metaTitle: 'JSON Formatter, Validator and Transformer | Upaman JSON Tools',
  metaDescription: 'Free JSON formatter and validator with JSON↔CSV, JSON↔YAML, flatten/unflatten, minify, sort keys, and JSON Patch diff. 100% browser-side.',
  keywords: 'json formatter, json validator, json patch diff, json to yaml, yaml to json, json minify, flatten json, json to csv',
  defaultAction: 'format',
  schemaName: 'JSON Tools Studio',
  schemaDescription: 'Browser-based JSON formatter, validator, converter (CSV/YAML), and JSON Patch diff generator.',
  howTo: {
    heading: 'How to use JSON Tools Studio',
    name: 'How to format and validate JSON with Upaman JSON Tools',
    description: 'Format, validate, convert, and diff JSON entirely in your browser.',
    steps: [
      { name: 'Paste your data', text: 'Drop JSON (or CSV/YAML for conversion actions) into the input panel — it validates live as you type.' },
      { name: 'Pick an action', text: 'Choose a tab (Format & Validate, Convert, Transform, or Diff), then select the specific action.' },
      { name: 'Read the result', text: 'The output updates automatically. Syntax errors show the exact line with a one-click jump.' },
      { name: 'Reuse or copy', text: 'Copy or download the output, or use it as the next input to chain multiple transforms.' }
    ]
  },
  article: [
    {
      heading: 'The errors Validate catches most often',
      paragraphs: [
        'JSON is stricter than the JavaScript object syntax it resembles, and nearly every "invalid JSON" moment traces to one of a handful of habits. Trailing commas after the last item are legal in modern JavaScript but not in JSON. Keys must be double-quoted — name: fails where "name": parses. Single-quoted strings, comments, undefined, and NaN are all fine in a JS console and all rejected here, because the JSON specification simply does not include them. When Validate reports a line and column, look one character earlier than the position it names — parsers typically fail on the first character that no longer fits, which sits just after the actual mistake.'
      ]
    },
    {
      heading: 'Chaining transforms is the real workflow',
      paragraphs: [
        'The individual actions are ordinary; the "use output as input" button is what makes this a studio. A CSV export from a spreadsheet becomes structured JSON in one step, flattens to dot-notation paths in a second so you can grep a single field, and un-flattens back after editing. An API response formats for reading, then minifies for pasting into a curl command. And when a deploy changes a config, JSON Patch Diff against the old version produces an RFC 6902 operation list — a precise, machine-applicable statement of what changed, which is often more useful in a pull request or incident note than two full files side by side.',
        'Everything runs locally in your browser, which is not just a privacy nicety — it changes what you can safely paste. Payloads with bearer tokens, personally identifiable data, or internal URLs never leave your machine, so the tool is usable for exactly the debugging sessions where an online formatter would be a policy violation. It also means the page keeps working when your connection does not.'
      ]
    }
  ],
  faq: STUDIO_FAQ,
  related: ['formatter', 'validator', 'minifier', 'jsonToCsv', 'csvToJson', 'jsonToYaml', 'yamlToJson', 'diff']
};

export const TOOL_PAGES = {
  'json-formatter': {
    slug: 'json-formatter',
    path: '/json-formatter',
    eyebrow: 'Developer Tools',
    h1: 'JSON Formatter',
    subtitle: 'Pretty-print JSON with 2 or 4 space indentation, sort keys for stable diffs, and catch syntax errors as you type — all in your browser.',
    metaTitle: 'JSON Formatter — Free Online JSON Beautifier | Upaman',
    metaDescription: 'Free online JSON formatter and beautifier. Pretty-print with 2 or 4 spaces, sort keys recursively, live error checking with line numbers. No upload — runs in your browser.',
    keywords: 'json formatter, json beautifier, pretty print json, format json online, json indent, sort json keys',
    actions: ['format', 'sort', 'minify'],
    defaultAction: 'format',
    schemaName: 'Upaman JSON Formatter',
    schemaDescription: 'Browser-based JSON formatter and beautifier with key sorting and live validation.',
    howTo: {
      heading: 'How to format JSON',
      name: 'How to format and beautify JSON online',
      description: 'Pretty-print JSON with stable indentation in three steps.',
      steps: [
        { name: 'Paste JSON', text: 'Drop your raw or minified JSON into the input editor. It validates live as you type.' },
        { name: 'Choose indentation', text: 'Pick 2 or 4 spaces. Optionally use Sort Keys for alphabetical, diff-stable ordering.' },
        { name: 'Copy the result', text: 'The formatted output appears instantly — copy it, download it, or minify it back.' }
      ]
    },
    article: [
      {
        heading: 'Why pretty-printing matters more than it looks',
        paragraphs: [
          'A minified API response is correct but unreadable — one 40 KB line where a missing field could hide anywhere. Formatting re-serializes the same data with consistent indentation so structure becomes visible: nesting depth reads as horizontal position, siblings align, and a missing brace announces itself. Because the formatter parses and re-emits rather than editing text, the output is guaranteed-valid JSON with exactly the same data; only whitespace changes.'
        ]
      },
      {
        heading: 'Sort keys when files live in version control',
        paragraphs: [
          'JSON objects have no guaranteed key order, so two serializations of identical data can produce a noisy git diff. Recursively sorting keys A→Z makes serialization deterministic: config files, lockfile-style manifests, and API fixtures diff cleanly commit after commit. Sorting only reorders object keys — array order is data, so arrays are left exactly as they are.'
        ]
      }
    ],
    faq: [
      { question: 'Does formatting change my data?', answer: 'No. The formatter parses your JSON and re-serializes it with new whitespace. Values, key names, array order, and structure are byte-for-byte equivalent — only indentation and line breaks change.' },
      { question: 'Should I use 2 or 4 space indentation?', answer: 'Two spaces is the dominant convention in the JavaScript ecosystem (npm, Prettier defaults). Four spaces reads more easily for deeply nested payloads. Both produce identical data — pick what your team already uses.' },
      { question: 'What does Sort Keys do to arrays?', answer: 'Nothing. Array order carries meaning in JSON, so sorting only applies to object keys, recursively at every level. Arrays keep their original element order.' },
      { question: 'Is my JSON uploaded anywhere?', answer: 'No. Formatting runs entirely in your browser with JavaScript. Nothing is sent to a server, so pasting production payloads or data with tokens is safe.' },
      { question: 'Why does my input show an error?', answer: 'The live validator applies strict JSON rules: double-quoted keys, no trailing commas, no comments, no single quotes. The error message names the line and column, and the editor gutter marks the line — click "Go to line" to jump there.' }
    ],
    related: ['validator', 'minifier', 'studio', 'diff']
  },

  'json-validator': {
    slug: 'json-validator',
    path: '/json-validator',
    eyebrow: 'Developer Tools',
    h1: 'JSON Validator',
    subtitle: 'Instant strict JSON syntax checking with the exact error line and column, a marked editor gutter, and one-click jump to the mistake.',
    metaTitle: 'JSON Validator — Check JSON Syntax Online | Upaman',
    metaDescription: 'Free online JSON validator with live checking. See the exact line and column of every syntax error, jump straight to it, and fix trailing commas, quotes, and brace mistakes fast.',
    keywords: 'json validator, validate json online, json syntax checker, json lint, json error line, check json',
    actions: ['validate', 'format'],
    defaultAction: 'validate',
    schemaName: 'Upaman JSON Validator',
    schemaDescription: 'Browser-based strict JSON validator with live error line and column reporting.',
    howTo: {
      heading: 'How to validate JSON',
      name: 'How to validate JSON and find syntax errors',
      description: 'Check JSON syntax and locate errors in three steps.',
      steps: [
        { name: 'Paste JSON', text: 'Drop the suspect JSON into the editor. Validation runs live on every keystroke.' },
        { name: 'Read the error', text: 'Invalid input shows the parser message with line and column; the gutter marks the line in red.' },
        { name: 'Jump and fix', text: 'Click "Go to line" to select the offending line, fix it, and watch the status flip to valid.' }
      ]
    },
    article: [
      {
        heading: 'The five mistakes behind almost every invalid JSON',
        paragraphs: [
          'Strict JSON rejects several things JavaScript happily accepts, and the same five account for most failures: a trailing comma after the last item of an object or array; unquoted or single-quoted keys; single-quoted string values; comments (JSON has none, by design); and literal undefined or NaN, which the spec does not define. If a payload came from copy-pasting a JS object literal out of code, expect at least one of these. The fix is usually mechanical once the validator points at the right line.'
        ]
      },
      {
        heading: 'How to read the line and column the parser reports',
        paragraphs: [
          'Parsers report the first position where the text stopped making sense — which is usually one token after the actual mistake. A missing comma between two properties is reported at the start of the second property; an unclosed string often surfaces at the end of the file. So when the message says line 12, read line 11 and the start of 12 together. The gutter marker and "Go to line" button select the whole reported line to make that scan fast.'
        ]
      }
    ],
    faq: [
      { question: 'What does this validator check?', answer: 'Strict syntax per RFC 8259 — the same rules as JSON.parse in every browser and Node.js. If it passes here, it will parse anywhere. It does not check against a JSON Schema; it validates syntax, not shape.' },
      { question: 'Are trailing commas really invalid?', answer: 'Yes. JavaScript and JSON5 allow them, but strict JSON does not. A trailing comma after the last array element or object property is the single most common validation failure.' },
      { question: 'Why is the reported error position slightly off?', answer: 'Parsers fail at the first character that no longer fits the grammar, which typically sits just after the real mistake. If line 12 column 5 looks fine, check the end of line 11 — a missing comma or quote there is the usual culprit.' },
      { question: 'Can I validate JSON with comments?', answer: 'Not as-is — comments are not part of the JSON specification. Files like tsconfig.json use JSONC, a superset. Strip the comments first, or expect the validator to flag them.' },
      { question: 'Is anything uploaded?', answer: 'No. Validation runs locally in your browser, so payloads containing secrets or personal data never leave your machine.' }
    ],
    related: ['formatter', 'studio', 'minifier', 'diff']
  },

  'json-minifier': {
    slug: 'json-minifier',
    path: '/json-minifier',
    eyebrow: 'Developer Tools',
    h1: 'JSON Minifier',
    subtitle: 'Compress JSON to a single line by stripping every optional space and line break — with a live size readout and one-click un-minify.',
    metaTitle: 'JSON Minifier — Compress JSON Online | Upaman',
    metaDescription: 'Free online JSON minifier. Strip whitespace for the smallest possible payload, see input vs output size in KB, and format back to readable JSON in one click. Browser-only.',
    keywords: 'json minifier, minify json, compress json, json compressor, reduce json size, one line json',
    actions: ['minify', 'format'],
    defaultAction: 'minify',
    schemaName: 'Upaman JSON Minifier',
    schemaDescription: 'Browser-based JSON minifier that strips optional whitespace and reports size savings.',
    howTo: {
      heading: 'How to minify JSON',
      name: 'How to minify and compress JSON online',
      description: 'Compress JSON to its smallest valid form in three steps.',
      steps: [
        { name: 'Paste JSON', text: 'Drop formatted or hand-written JSON into the editor.' },
        { name: 'Minify', text: 'The output collapses to a single line with all optional whitespace removed. The status line shows the size.' },
        { name: 'Copy or revert', text: 'Copy the compact payload, or switch to Format to expand it back to readable form.' }
      ]
    },
    article: [
      {
        heading: 'What minification actually removes',
        paragraphs: [
          'JSON permits whitespace between tokens purely for human readability — indentation, line breaks, spaces after colons and commas. Minification parses the document and re-serializes it with none of that, producing the smallest byte-identical-in-meaning representation. String contents are untouched: spaces inside values are data, not formatting. A typical pretty-printed API fixture shrinks by 25–40%, more when nesting is deep.'
        ]
      },
      {
        heading: 'When minifying matters — and when gzip already did it',
        paragraphs: [
          'Over the wire, most servers gzip or brotli-compress responses, and compression algorithms flatten repeated whitespace almost for free — so minifying rarely changes transfer size much on a compressed connection. Minification earns its keep elsewhere: payloads embedded in a curl command or environment variable, JSON stuffed into a query string or HTTP header, storage systems that bill raw bytes, and log lines where one record per line is a hard requirement. It is about the contexts where the whitespace itself is in the way.'
        ]
      }
    ],
    faq: [
      { question: 'Does minifying lose any data?', answer: 'No. Only whitespace outside of string values is removed. The minified document parses to exactly the same data as the original — formatting it again restores full readability.' },
      { question: 'How much smaller will my JSON get?', answer: 'It depends on indentation depth. A 2-space pretty-printed payload typically shrinks 25–40%. The editor shows input size and the status line reports output size so you can see the exact saving.' },
      { question: 'Should I minify API responses?', answer: 'Usually your web server’s gzip/brotli compression already neutralizes whitespace over the wire. Minify when the raw byte count matters: embedded payloads, headers, query strings, storage quotas, or single-line log formats.' },
      { question: 'Can I undo minification?', answer: 'Yes — switch to the Format action (or use the formatter tool) and the same data expands back with clean indentation. Minification is fully reversible because no data is removed.' },
      { question: 'Is the JSON processed locally?', answer: 'Yes. Minification runs in your browser; nothing is uploaded or stored.' }
    ],
    related: ['formatter', 'validator', 'studio', 'jsonToCsv']
  },

  'json-to-csv': {
    slug: 'json-to-csv',
    path: '/json-to-csv',
    eyebrow: 'Developer Tools',
    h1: 'JSON to CSV Converter',
    subtitle: 'Turn an array of JSON objects into spreadsheet-ready CSV rows — headers derived from your keys, quoting handled per RFC 4180.',
    metaTitle: 'JSON to CSV Converter — Free Online Tool | Upaman',
    metaDescription: 'Convert JSON to CSV online for free. Array of objects becomes rows, keys become headers, quoting and escaping handled automatically. Open the result straight in Excel or Sheets.',
    keywords: 'json to csv, convert json to csv, json to excel, json array to csv, export json csv',
    actions: ['jsonToCsv', 'csvToJson'],
    defaultAction: 'jsonToCsv',
    schemaName: 'Upaman JSON to CSV Converter',
    schemaDescription: 'Browser-based converter that turns JSON arrays of objects into CSV with automatic headers and quoting.',
    howTo: {
      heading: 'How to convert JSON to CSV',
      name: 'How to convert a JSON array to CSV',
      description: 'Export JSON objects as CSV rows in three steps.',
      steps: [
        { name: 'Paste a JSON array', text: 'Input should be an array of objects — the typical shape of an API list response or database export.' },
        { name: 'Convert', text: 'Every distinct key across all objects becomes a column; each object becomes a row. Missing keys yield empty cells.' },
        { name: 'Download', text: 'Copy the CSV or download it as a .csv file and open it directly in Excel or Google Sheets.' }
      ]
    },
    article: [
      {
        heading: 'How the columns are decided',
        paragraphs: [
          'CSV is rectangular and JSON is not, so the converter takes the union of keys across every object in the array — if one record has an email field and another does not, the column still appears and the missing cell is left empty. Column order follows first appearance. Values containing commas, quotes, or line breaks are wrapped in double quotes with internal quotes doubled, per RFC 4180, so the file opens cleanly in Excel, Google Sheets, and standard CSV parsers.'
        ]
      },
      {
        heading: 'What happens to nested objects',
        paragraphs: [
          'A nested object or array inside a record cannot become a flat cell honestly, so it is serialized as a JSON string in that cell — lossless, but not spreadsheet-friendly. When you want real columns like user.address.city, flatten first: run the Flatten action in the studio to convert nesting into dot-notation keys, then convert the flattened records to CSV. Each nested path becomes its own column.'
        ]
      }
    ],
    faq: [
      { question: 'What input shape does the converter expect?', answer: 'An array of objects is ideal — each object becomes a row. A single object becomes a one-row CSV. Arrays of plain values are wrapped in a "value" column.' },
      { question: 'How are nested objects handled?', answer: 'They are embedded as JSON strings inside the cell, which preserves the data. For true one-column-per-field output, flatten the JSON first (dot notation), then convert.' },
      { question: 'Will commas inside values break the CSV?', answer: 'No. Any value containing commas, double quotes, or newlines is quoted and escaped per RFC 4180, the standard Excel and Google Sheets expect.' },
      { question: 'What if objects have different keys?', answer: 'The header row is the union of all keys found in any object. Records missing a key simply get an empty cell in that column.' },
      { question: 'Can I convert back?', answer: 'Yes — the CSV → JSON action on this page reverses the trip, mapping the header row to keys and inferring number, boolean, and null types.' }
    ],
    related: ['csvToJson', 'studio', 'formatter', 'jsonToYaml']
  },

  'csv-to-json': {
    slug: 'csv-to-json',
    path: '/csv-to-json',
    eyebrow: 'Developer Tools',
    h1: 'CSV to JSON Converter',
    subtitle: 'Paste CSV with a header row and get a clean JSON array of objects — quoted fields respected, numbers and booleans typed automatically.',
    metaTitle: 'CSV to JSON Converter — Free Online Tool | Upaman',
    metaDescription: 'Convert CSV to JSON online for free. Header row becomes keys, values are typed as numbers, booleans, and null automatically, quoted fields with commas handled correctly.',
    keywords: 'csv to json, convert csv to json, csv to json array, spreadsheet to json, csv parser online',
    actions: ['csvToJson', 'jsonToCsv'],
    defaultAction: 'csvToJson',
    schemaName: 'Upaman CSV to JSON Converter',
    schemaDescription: 'Browser-based converter that maps CSV rows into a typed JSON array of objects.',
    howTo: {
      heading: 'How to convert CSV to JSON',
      name: 'How to convert CSV to a JSON array',
      description: 'Turn spreadsheet rows into JSON objects in three steps.',
      steps: [
        { name: 'Paste CSV', text: 'Include the header row — it becomes the JSON keys. Export from Excel or Sheets with File → Download → CSV.' },
        { name: 'Convert', text: 'Each data row becomes an object. Numeric strings become numbers, true/false become booleans, null becomes null.' },
        { name: 'Use the JSON', text: 'Copy or download the array, or chain another action — format it, or unflatten dot-notation headers into nested objects.' }
      ]
    },
    article: [
      {
        heading: 'Type inference: helpful, with one honest caveat',
        paragraphs: [
          'CSV stores everything as text, so the converter infers types: "42" becomes the number 42, "true" and "false" become booleans, "null" becomes null, and anything else stays a string. This is almost always what you want — but note that identifier-like values that happen to be numeric, such as ZIP codes with leading zeros ("02139") or long order IDs, will be parsed as numbers and can lose their leading zero. If a column must stay textual, quote the values in the source or post-edit the JSON output.'
        ]
      },
      {
        heading: 'Quoting, commas, and multi-line cells',
        paragraphs: [
          'The parser implements the RFC 4180 rules real spreadsheet exports follow: fields wrapped in double quotes may contain commas and even line breaks, and a doubled quote inside a quoted field is a literal quote character. Empty rows are skipped, and a blank header cell is auto-named column_1, column_2, and so on rather than producing an empty key. If your headers use dot notation — user.name, user.address.city — convert first and then run Unflatten in the studio to rebuild the full nested structure.'
        ]
      }
    ],
    faq: [
      { question: 'Is the header row required?', answer: 'Yes. The first row supplies the JSON keys for every object. Without it there is nothing to name the fields — add a header row before converting.' },
      { question: 'How are numbers and booleans handled?', answer: 'Values that parse as numbers become JSON numbers, true/false become booleans, and null becomes null. Everything else remains a string.' },
      { question: 'My ZIP codes lost their leading zeros — why?', answer: 'Type inference parsed them as numbers. Wrap those values in quotes in the source CSV, or fix the affected fields in the JSON output, to keep them as strings.' },
      { question: 'Can cells contain commas or line breaks?', answer: 'Yes, if the cell is quoted — standard spreadsheet exports do this automatically. The parser follows RFC 4180, including doubled quotes for literal quote characters.' },
      { question: 'Can I get nested JSON out of flat CSV?', answer: 'Use dot-notation headers (user.name, user.city), convert here, then run the Unflatten action in the JSON Tools Studio to rebuild the nesting.' }
    ],
    related: ['jsonToCsv', 'studio', 'validator', 'yamlToJson']
  },

  'json-to-yaml': {
    slug: 'json-to-yaml',
    path: '/json-to-yaml',
    eyebrow: 'Developer Tools',
    h1: 'JSON to YAML Converter',
    subtitle: 'Convert JSON into clean, config-ready YAML — 2-space indentation, sensible quoting, ideal for Kubernetes, CI pipelines, and app config.',
    metaTitle: 'JSON to YAML Converter — Free Online Tool | Upaman',
    metaDescription: 'Convert JSON to YAML online for free. Clean 2-space indentation and correct quoting for Kubernetes manifests, GitHub Actions, and config files. Runs entirely in your browser.',
    keywords: 'json to yaml, convert json to yaml, json to yml, yaml converter, kubernetes yaml',
    actions: ['jsonToYaml', 'yamlToJson'],
    defaultAction: 'jsonToYaml',
    schemaName: 'Upaman JSON to YAML Converter',
    schemaDescription: 'Browser-based converter that renders JSON as clean, valid YAML.',
    howTo: {
      heading: 'How to convert JSON to YAML',
      name: 'How to convert JSON to YAML',
      description: 'Produce config-ready YAML from JSON in three steps.',
      steps: [
        { name: 'Paste JSON', text: 'Any valid JSON document — object, array, or scalar. It validates live as you type.' },
        { name: 'Convert', text: 'The YAML output uses 2-space indentation and quotes strings only where YAML requires it.' },
        { name: 'Drop into config', text: 'Copy or download the .yaml and paste it into your manifest, pipeline, or config file.' }
      ]
    },
    article: [
      {
        heading: 'Every JSON document is already valid YAML — so why convert?',
        paragraphs: [
          'YAML 1.2 is a superset of JSON: you could paste JSON into most YAML parsers unchanged. The point of converting is the idiomatic block style humans actually maintain — indentation instead of braces, dash lists instead of bracketed arrays, unquoted strings where safe. That is the style Kubernetes manifests, GitHub Actions workflows, and docker-compose files are written in, and the style reviewers expect in a pull request touching config.'
        ]
      },
      {
        heading: 'How quoting decisions are made',
        paragraphs: [
          'The converter quotes strings only when leaving them bare would change their meaning: values that look like numbers or booleans ("true", "007"), strings with leading or trailing spaces, YAML-special characters like colons followed by spaces, and reserved words such as null. Everything else stays unquoted for readability. Keys and value data are preserved exactly — converting back to JSON returns the identical document. Note that JSON has no comments, so the output has none either; add comments after conversion if your config needs them.'
        ]
      }
    ],
    faq: [
      { question: 'Will converting change my data?', answer: 'No. The YAML output parses back to exactly the same data as the input JSON. Only the surface syntax changes — converting back with YAML → JSON round-trips identically.' },
      { question: 'Why are some strings quoted and others not?', answer: 'YAML only needs quotes when a bare value would be misread — strings that look like numbers or booleans, contain special characters, or have significant whitespace. The converter quotes exactly those cases.' },
      { question: 'Can I add comments?', answer: 'JSON cannot express comments, so none appear in the output. YAML supports # comments — add them after converting; they will survive future YAML editing but will be dropped if you convert back to JSON.' },
      { question: 'Is the output valid for Kubernetes and CI files?', answer: 'Yes — it is standard block-style YAML with 2-space indentation, the convention used by Kubernetes, GitHub Actions, GitLab CI, and docker-compose.' },
      { question: 'Does my config leave the browser?', answer: 'No. Conversion runs locally, so manifests containing internal URLs or secrets are never uploaded.' }
    ],
    related: ['yamlToJson', 'studio', 'formatter', 'jsonToCsv']
  },

  'yaml-to-json': {
    slug: 'yaml-to-json',
    path: '/yaml-to-json',
    eyebrow: 'Developer Tools',
    h1: 'YAML to JSON Converter',
    subtitle: 'Parse real-world YAML — anchors, aliases, multi-line strings, nested lists — and emit clean JSON with your chosen indentation.',
    metaTitle: 'YAML to JSON Converter — Free Online Tool | Upaman',
    metaDescription: 'Convert YAML to JSON online for free. Full YAML support including anchors, aliases, and multi-line strings. Instant parse errors with line numbers. Browser-only, nothing uploaded.',
    keywords: 'yaml to json, convert yaml to json, yml to json, yaml parser online, yaml converter',
    actions: ['yamlToJson', 'jsonToYaml'],
    defaultAction: 'yamlToJson',
    schemaName: 'Upaman YAML to JSON Converter',
    schemaDescription: 'Browser-based converter that parses full-spec YAML and outputs formatted JSON.',
    howTo: {
      heading: 'How to convert YAML to JSON',
      name: 'How to convert YAML to JSON',
      description: 'Parse YAML into formatted JSON in three steps.',
      steps: [
        { name: 'Paste YAML', text: 'Config files, Kubernetes manifests, CI workflows — full YAML syntax is supported, including anchors and multi-line strings.' },
        { name: 'Convert', text: 'The JSON output is formatted with your chosen indentation. Parse errors report the offending line.' },
        { name: 'Use downstream', text: 'Copy or download the JSON, validate it, or chain it into CSV, flatten, or diff actions in the studio.' }
      ]
    },
    article: [
      {
        heading: 'Full YAML is more than indentation',
        paragraphs: [
          'Real configuration YAML uses features casual converters miss: anchors (&base) and aliases (*base) that reuse blocks, merge keys (<<:) that compose defaults, literal (|) and folded (>) multi-line strings, and explicit tags. This converter uses a complete YAML parser, so those constructs resolve correctly — an alias expands to its anchored value in the JSON output, and a literal block becomes a string with its line breaks preserved as \\n.'
        ]
      },
      {
        heading: 'The gotchas YAML is famous for',
        paragraphs: [
          'YAML’s convenience syntax has sharp edges worth knowing when you inspect the JSON output. Unquoted no, off, and n were booleans in YAML 1.1 — the infamous "Norway problem" where a country code becomes false; modern parsers treat them as strings, but quoted values are always safest. Unquoted version numbers like 3.10 parse as the number 3.1. And tabs are illegal for indentation — a mixed-tabs file fails with a pointer to the offending line. Converting to JSON is actually a good audit: types become explicit, so surprises surface immediately.'
        ]
      }
    ],
    faq: [
      { question: 'Are anchors and aliases supported?', answer: 'Yes. Anchors (&name), aliases (*name), and merge keys (<<:) resolve during parsing, so the JSON output contains the fully expanded data.' },
      { question: 'What happens to comments?', answer: 'JSON has no comment syntax, so YAML # comments are dropped during conversion. The data itself is preserved completely.' },
      { question: 'Why did my value 3.10 become 3.1?', answer: 'Unquoted 3.10 is a number in YAML, and numbers don’t keep trailing zeros. Quote it in the source ("3.10") to keep it a string — the same applies to version numbers and ZIP codes.' },
      { question: 'Can I convert multi-document YAML?', answer: 'Files with --- separators contain multiple documents; the converter parses the first document. Split the file to convert each document separately.' },
      { question: 'My file fails with a tab error — why?', answer: 'YAML forbids tab characters in indentation. Replace tabs with spaces (most editors have a convert-indentation command) and the parse will succeed.' }
    ],
    related: ['jsonToYaml', 'studio', 'validator', 'csvToJson']
  },

  'json-diff': {
    slug: 'json-diff',
    path: '/json-diff',
    eyebrow: 'Developer Tools',
    h1: 'JSON Diff — RFC 6902 Patch Generator',
    subtitle: 'Compare two JSON documents and get a machine-applicable JSON Patch: every add, remove, and replace operation between base and target.',
    metaTitle: 'JSON Diff Online — Compare JSON & Generate RFC 6902 Patch | Upaman',
    metaDescription: 'Compare two JSON documents online and generate an RFC 6902 JSON Patch. See every add, remove, and replace operation between base and target. Free and browser-only.',
    keywords: 'json diff, compare json, json patch, rfc 6902, json compare online, json difference',
    actions: ['jsonPatchDiff'],
    defaultAction: 'jsonPatchDiff',
    schemaName: 'Upaman JSON Diff',
    schemaDescription: 'Browser-based JSON comparison tool that outputs RFC 6902 JSON Patch operations.',
    howTo: {
      heading: 'How to diff two JSON documents',
      name: 'How to compare JSON and generate a patch',
      description: 'Produce an RFC 6902 patch from two JSON documents in three steps.',
      steps: [
        { name: 'Paste base JSON', text: 'The "before" document goes in the Base panel — the old config, the previous API response.' },
        { name: 'Paste target JSON', text: 'The "after" document goes in the Target panel. Both validate live with error line markers.' },
        { name: 'Read the patch', text: 'The output lists add, remove, and replace operations that transform base into target — apply it with any JSON Patch library.' }
      ]
    },
    article: [
      {
        heading: 'Why a patch beats a side-by-side diff',
        paragraphs: [
          'A textual diff of two JSON files is noisy — reordered keys, reindented blocks, and trailing commas all light up even when no data changed. A JSON Patch diff compares the parsed data, so formatting differences vanish and only real changes remain: each one an operation with a precise path like /goals/1/target. The output is also executable — every mainstream language has an RFC 6902 library (fast-json-patch in JavaScript, jsonpatch in Python), so the same document that explains a change in a pull request can apply it in a migration script.'
        ]
      },
      {
        heading: 'How arrays are compared',
        paragraphs: [
          'Array elements are matched by index: element 0 against element 0, and so on, with removals and additions emitted for length differences. That means inserting an item at the front of a list reads as a chain of replaces plus one add — technically correct and fully applicable, just more verbose than a human would write. This generator emits add, remove, and replace; it does not synthesize move or copy operations, which are optional optimizations under the RFC and are never required for a valid patch.'
        ]
      }
    ],
    faq: [
      { question: 'What format is the output?', answer: 'RFC 6902 JSON Patch — an array of operations with op, path, and (for add/replace) value fields. Paths use JSON Pointer syntax (RFC 6901), with / and ~ escaped as ~1 and ~0.' },
      { question: 'How do I apply the patch?', answer: 'Use any RFC 6902 library: fast-json-patch (JavaScript), jsonpatch (Python), JsonPatch in .NET, and equivalents elsewhere. Apply the operations to the base document to reproduce the target.' },
      { question: 'Does key order affect the diff?', answer: 'No. Documents are compared as parsed data, so key order and formatting are ignored. Two differently ordered but equal objects produce an empty patch.' },
      { question: 'Why does inserting one array item produce many operations?', answer: 'Arrays are diffed by index, so a front-insertion shifts every element and reads as replaces plus an add. The patch is still correct and minimal patches are not required by the RFC.' },
      { question: 'Can I diff API responses with secrets in them?', answer: 'Yes — comparison runs entirely in your browser. Neither document is uploaded or stored anywhere.' }
    ],
    related: ['studio', 'validator', 'formatter', 'minifier']
  }
};

export const buildCanonical = (path) => `${SITE_URL}${path}`;
