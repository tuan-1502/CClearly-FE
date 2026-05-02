
const fs = require('fs');
const code = fs.readFileSync('c:/FE3W2026/CClearly-FE/src/pages/customer/ProfilePage.jsx', 'utf8');
try {
    new Function(code);
    console.log('Syntax OK');
} catch (e) {
    console.log('Syntax Error:', e.message);
}
