const fs = require('fs');
const path = 'C:/Users/jefffan/Desktop/Omnia/cmdbook-desktop/js/sect.js';
let js = fs.readFileSync(path, 'utf8');

// Add bloodBlade action call before location refresh
js = js.replace(
  "if (this.turn % _randInt(5, 8) === 0 || this.worldLocations.length === 0) this._refreshLocations();",
  "this._bloodBladeAction();\n    if (this.turn % _randInt(5, 8) === 0 || this.worldLocations.length === 0) this._refreshLocations();"
);

fs.writeFileSync(path, js);
console.log('OK');
