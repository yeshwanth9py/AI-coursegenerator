const fs = require('fs');
const path = require('path');

function findMissingImports(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            findMissingImports(fullPath);
        } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            const importRegex = /import\s+.*?from\s+['"](\.[^'"]+)['"]/g;
            let match;
            while ((match = importRegex.exec(content)) !== null) {
                const importPath = match[1];
                let resolvedPath = path.join(path.dirname(fullPath), importPath);
                
                let found = false;
                for (const ext of ['', '.js', '.jsx', '.css']) {
                    if (fs.existsSync(resolvedPath + ext)) {
                        found = true;
                        break;
                    }
                }
                if (!found && !importPath.endsWith('.css')) {
                    console.log('Missing: ' + resolvedPath + ' from ' + fullPath);
                    // Create placeholder
                    let compName = path.basename(resolvedPath);
                    if (compName.endsWith('.jsx')) compName = compName.replace('.jsx', '');
                    const placeholder = `export default function ${compName}() { return <div className="p-4 border rounded bg-slate-800 text-white">Placeholder for ${compName}</div>; }`;
                    const outPath = resolvedPath.endsWith('.jsx') ? resolvedPath : resolvedPath + '.jsx';
                    const outDir = path.dirname(outPath);
                    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
                    fs.writeFileSync(outPath, placeholder);
                    console.log('Created placeholder: ' + outPath);
                }
            }
        }
    }
}
findMissingImports('d:\\\\AI course\\\\frontend\\\\src');
