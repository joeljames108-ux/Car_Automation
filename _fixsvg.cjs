const fs = require('fs');
const p = 'src/components/interior/InteriorConfigViewport.tsx';
let c = fs.readFileSync(p, 'utf8');

// Fix cup holder y -> cy bug
c = c.replace(/cx="284" y="255"/g, 'cx="284" cy="255"');
c = c.replace(/cx="316" y="255"/g, 'cx="316" cy="255"');

// Add seat headrests after seat rects
c = c.replace(
  '<line x1="195" y1="175" x2="195" y2="275" stroke="#ffffff15" strokeWidth="1" />',
  '<line x1="195" y1="175" x2="195" y2="275" stroke="#ffffff15" strokeWidth="1" />\n          {/* Left seat headrest */}\n          <rect x="110" y="140" width="90" height="24" rx="10" fill={interiorColor} stroke="#1a202c" strokeWidth="2" style={{ transition: "fill 0.3s ease" }} />'
);

c = c.replace(
  '<line x1="485" y1="175" x2="485" y2="275" stroke="#ffffff15" strokeWidth="1" />',
  '<line x1="485" y1="175" x2="485" y2="275" stroke="#ffffff15" strokeWidth="1" />\n          {/* Right seat headrest */}\n          <rect x="400" y="140" width="90" height="24" rx="10" fill={interiorColor} stroke="#1a202c" strokeWidth="2" style={{ transition: "fill 0.3s ease" }} />'
);

// Add air vents on dashboard (left of cluster and right of screen)
c = c.replace(
  '{/* Gear Shift / Center Console Area */}',
  '{/* Air Vents */}\n          <rect x="105" y="148" width="28" height="8" rx="2" fill="#0f1318" stroke="#334155" strokeWidth="1" />\n          <rect x="380" y="148" width="28" height="8" rx="2" fill="#0f1318" stroke="#334155" strokeWidth="1" />\n          {/* Glove Box */}\n          <rect x="400" y="195" width="80" height="35" rx="4" fill="#151b28" stroke="#2d3748" strokeWidth="1.5" />\n          <line x1="410" y1="210" x2="470" y2="210" stroke="#2d3748" strokeWidth="1" />\n\n          {/* Gear Shift / Center Console Area */}'
);

// Add center armrest between seats
c = c.replace(
  '{/* Cup Holders */}',
  '{/* Center Armrest */}\n          <rect x="225" y="250" width="150" height="16" rx="6" fill="#151b28" stroke="#2d3748" strokeWidth="1" />\n\n          {/* Cup Holders */}'
);

// Add windshield wipers hint at top
c = c.replace(
  '{/* Windshield & Body Line */}',
  '{/* Windshield Wipers Hint */}\n          <line x1="200" y1="72" x2="340" y2="72" stroke="#1a202c" strokeWidth="2" strokeLinecap="round" />\n          <line x1="260" y1="72" x2="400" y2="72" stroke="#1a202c" strokeWidth="2" strokeLinecap="round" />\n\n          {/* Windshield & Body Line */}'
);

fs.writeFileSync(p, c);
console.log('SVG viewport enhanced with headrests, vents, glove box, armrest, wipers');
