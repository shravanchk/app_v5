import React from 'react';

/**
 * Home navigation now lives in the global sticky Navbar (rendered in _app.js),
 * so the old floating home button is intentionally a no-op. Kept as a component
 * so the many existing imports continue to work without edits.
 */
const HomeButton = () => null;

export default HomeButton;
