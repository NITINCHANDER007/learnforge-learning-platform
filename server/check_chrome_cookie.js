const fs = require('fs');
const path = require('path');
const os = require('os');

const localAppData = process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local');
const cookiePath = path.join(localAppData, 'Google', 'Chrome', 'User Data', 'Default', 'Network', 'Cookies');
const localStatePath = path.join(localAppData, 'Google', 'Chrome', 'User Data', 'Local State');

console.log('Cookie path exists:', fs.existsSync(cookiePath));
console.log('Local State exists:', fs.existsSync(localStatePath));
