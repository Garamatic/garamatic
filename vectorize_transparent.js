const potrace = require('potrace');
const fs = require('fs');

// Generate the "Detailed" variant with a black trace and transparent background
potrace.trace('./Untitled(1).png', {
    turdSize: 0,
    optTolerance: 0.1,
    alphaMax: 0,
    color: '#000000'
    // Omitting "background" defaults to transparent
}, function(err, svg) {
    if (err) throw err;
    // We'll add fill="currentColor" so it's super easy to style via CSS if used inline
    const cssReadySvg = svg.replace(/fill="#000000"/g, 'fill="currentColor"');
    fs.writeFileSync('./desgoffe_transparent.svg', cssReadySvg);
    console.log('Created desgoffe_transparent.svg');
});
