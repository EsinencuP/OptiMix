import fs from 'node:fs/promises';
import path from 'node:path';
import postcss from 'postcss';

const root = process.cwd();
const sourcePath = path.join(root, 'src/styles/home.css');
const criticalPath = path.join(root, 'src/styles/home-critical.generated.css');
const deferredPath = path.join(root, 'src/styles/home-deferred.generated.css');
const criticalPrefixes = [
  '.site-header', '.header-inner', '.wordmark', '.primary-nav', '.language-switch',
  '.mobile-languages', '.nav-contact', '.mobile-contact', '.mobile-menu',
  '.mobile-nav-popover', '.hero', '.route-preview', '.route-node', '.button-primary', '.text-link',
  '.motion-fallback', '.editorial-break', '.recognition', '.section-heading', '.relay', '.relay-viewport', '.relay-number',
  '.example-note', '.track-controls',
];

function isCritical(selector) {
  return selector.split(',').some((part) => criticalPrefixes.some((prefix) => part.trim().startsWith(prefix)));
}

function splitNodes(nodes, criticalParent, deferredParent) {
  for (const node of nodes) {
    if (node.type === 'rule') {
      (isCritical(node.selector) ? criticalParent : deferredParent).append(node.clone());
    } else if (node.type === 'atrule' && node.nodes) {
      const criticalAtRule = node.clone({ nodes: [] });
      const deferredAtRule = node.clone({ nodes: [] });
      splitNodes(node.nodes, criticalAtRule, deferredAtRule);
      if (criticalAtRule.nodes?.length) criticalParent.append(criticalAtRule);
      if (deferredAtRule.nodes?.length) deferredParent.append(deferredAtRule);
    } else {
      deferredParent.append(node.clone());
    }
  }
}

async function writeIfChanged(file, value) {
  if (await fs.readFile(file, 'utf8').catch(() => '') !== value) await fs.writeFile(file, value);
}

const source = await fs.readFile(sourcePath, 'utf8');
const parsed = postcss.parse(source, { from: sourcePath });
const critical = postcss.root();
const deferred = postcss.root();
splitNodes(parsed.nodes, critical, deferred);
const header = '/* Generated from home.css by scripts/split-home-css.mjs. Edit the source file. */\n';
await writeIfChanged(criticalPath, header + critical.toString() + '\n');
await writeIfChanged(deferredPath, header + deferred.toString() + '\n');
console.log(`Split home CSS: ${critical.nodes.length} critical and ${deferred.nodes.length} deferred top-level rules.`);
