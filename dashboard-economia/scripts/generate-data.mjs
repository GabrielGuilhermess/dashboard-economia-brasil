import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { generateDashboardData } from '../src/server/dashboard-data/generate-dashboard-data.mjs';

const currentFile = fileURLToPath(import.meta.url);
const rootDir = path.resolve(path.dirname(currentFile), '..');
const outputDir = path.join(rootDir, 'public', 'data');

try {
  const files = await generateDashboardData(outputDir);
  console.log(`Generated ${files.length} static data snapshots in ${outputDir}`);
} catch (error) {
  console.error('Failed to generate dashboard data snapshots.');
  console.error(error instanceof Error ? error.stack ?? error.message : error);
  process.exit(1);
}
