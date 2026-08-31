const fs = require('fs');

let content = fs.readFileSync('server.ts', 'utf8');

// Replace the arrays with empty arrays
content = content.replace(/let factsData = \[[\s\S]*?\];/m, 'let factsData: any[] = [];');
content = content.replace(/let summariesData = \[[\s\S]*?\];/m, 'let summariesData: any[] = [];');
content = content.replace(/let fashionStylesData = \[[\s\S]*?\];/m, 'let fashionStylesData: any[] = [];');
content = content.replace(/let documentsData = \[[\s\S]*?\];/m, 'let documentsData: any[] = [];');

fs.writeFileSync('server.ts', content);
