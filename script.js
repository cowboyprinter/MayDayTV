window.onload = () => {
    const canvas = document.getElementById('tvCanvas');
    const ctx = canvas.getContext('2d');

    // --- Globally accessible, size-dependent variables ---
    let canvasWidth = canvas.width; // Will be updated by resizeCanvas
    let canvasHeight = canvas.height; // Will be updated by resizeCanvas
    let tvBorderWidth;
    let screenRect = { x: 0, y: 0, w: 0, h: 0 }; // Placeholder

    // --- Aspect Ratio (Choose one based on your original design) ---
    // Example: If your original fixed size was 800x600
    const desiredAspectRatio = 600 / 800; // Height / Width

    // --- Configuration (Keep constants that aren't pixels) ---
    let currentChannel = 0;
    let frameCount = 0;

    // --- Animation State Variables ---
    // (These generally don't need immediate change, but their parameters might)
    let newsScrollX; // Will be reset relative to screenRect.w in channel init
    let dandelionSeeds = [];
    let maypoleAngle = 0;
    let weatherElements = { rain: [], lightning: 0, clouds: [] };
    let stars = [];
    let channel2Clouds = [];

    // --- Cloud Helper Function & Variables ---
    // (Base shapes remain the same, drawing coords become relative)
    const cloudParts = [ { dx: 0, dy: 0, r: 50 }, { dx: -40, dy: 0, r: 35 }, { dx: 40, dy: -5, r: 40 }, { dx: 10, dy: -25, r: 30 }, { dx: -20, dy: 15, r: 25 } ];
    const baseCloudWidth = Math.max(...cloudParts.map(p => p.dx + p.r)) - Math.min(...cloudParts.map(p => p.dx - p.r));

    function drawCloud(ctx, cloud, baseX, baseY, color = '#FFFFFF') { /* ... keep internal logic ... */ } // No change needed here
    function updateCloud(cloud, rectW, cloudWidthEstimate) { /* ... keep internal logic ... */ } // No change needed here

    // --- Helper Functions (Update sizes to be relative) ---

    function drawCloverNewscaster(ctx, baseX, baseY, size) {
        // Make all internal sizes relative to the 'size' parameter
        const leafRadius = size * 0.4;
        const centerOffset = size * 0.25;
        const stemWidth = size * 0.15;
        const stemHeight = size * 0.5;
        const eyeRadius = size * 0.08;
        const pupilRadius = size * 0.04;
        const paperWidth = size * 0.8;
        const paperHeight = size * 0.6;
        // ... rest of the drawing code using these relative sizes ...
        // Ensure line widths are also scaled or set reasonably (e.g., ctx.lineWidth = Math.max(1, size * 0.01);)
        ctx.save();
        ctx.translate(baseX, baseY);
        ctx.fillStyle = '#2E8B57'; // Stem color
        ctx.fillRect(-stemWidth / 2, 0, stemWidth, stemHeight); // Stem

        // Leaves
        const leafPositions = [
            { x: -centerOffset, y: -centerOffset }, { x: centerOffset, y: -centerOffset },
            { x: -centerOffset, y: centerOffset }, { x: centerOffset, y: centerOffset }
        ];
        ctx.fillStyle = '#3CB371'; // Leaf color
        leafPositions.forEach(pos => {
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, leafRadius, 0, Math.PI * 2);
            ctx.fill();
        });

        // Paper
        const paperX = -paperWidth / 2;
        const paperY = size * 0.2; // Position relative to overall size
        ctx.fillStyle = '#FFFFFF'; // Paper color
        ctx.fillRect(paperX, paperY, paperWidth, paperHeight);
        ctx.strokeStyle = '#AAAAAA'; // Paper outline
        ctx.lineWidth = Math.max(1, size * 0.01); // Scaled line width
        ctx.strokeRect(paperX, paperY, paperWidth, paperHeight);

        // Lines on paper
        ctx.strokeStyle = '#CCCCCC'; // Lighter lines
        for (let i = 1; i < 4; i++) {
            ctx.beginPath();
            ctx.moveTo(paperX + 5, paperY + (paperHeight / 4) * i);
            ctx.lineTo(paperX + paperWidth - 5, paperY + (paperHeight / 4) * i);
            ctx.stroke();
        }

        // Eyes
        const eyeY = -centerOffset * 1.2; // Relative position
        const eyeSpacing = size * 0.2; // Relative spacing
        ctx.fillStyle = '#FFFFFF'; // Eye white
        ctx.beginPath();
        ctx.arc(-eyeSpacing, eyeY, eyeRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000000'; // Pupil
        ctx.beginPath();
        ctx.arc(-eyeSpacing, eyeY, pupilRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#FFFFFF'; // Eye white
        ctx.beginPath();
        ctx.arc(eyeSpacing, eyeY, eyeRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000000'; // Pupil
        ctx.beginPath();
        ctx.arc(eyeSpacing, eyeY, pupilRadius, 0, Math.PI * 2);
        ctx.fill();

        // Mouth
        const mouthY = -centerOffset * 0.5; // Relative position
        const mouthWidth = size * 0.2; // Relative size
        ctx.strokeStyle = '#000000'; // Mouth color
        ctx.lineWidth = Math.max(1, size * 0.03); // Scaled line width
        ctx.beginPath();
        ctx.arc(0, mouthY, mouthWidth, 0.2 * Math.PI, 0.8 * Math.PI); // Simple arc mouth
        ctx.stroke();

        ctx.restore();
    }


    function drawBonfire(ctx, rect, centerX, baseScreenY, baseWidth, heightFactor, particleCount) {
        // baseScreenY, baseWidth, heightFactor should now be calculated relatively
        const bottomY = rect.y + baseScreenY; // baseScreenY is now relative to rect.h
        const logHeight = canvasHeight * 0.025; // Example: relative log height

        // Logs
        ctx.fillStyle = '#4a2511'; // Dark brown
        ctx.fillRect(centerX - baseWidth / 2, bottomY, baseWidth, logHeight);
        ctx.fillStyle = '#2a1501'; // Darker brown detail
        ctx.fillRect(centerX - baseWidth / 2.5, bottomY + logHeight * 0.33, baseWidth / 1.25, logHeight * 0.67);

        // Fire Particles
        for (let i = 0; i < particleCount; i++) {
            const life = Math.random(); // 0 (top) to 1 (bottom)
            const size = (1 - life) * (baseWidth * 0.15) + (canvasWidth * 0.003); // Scale size, ensure min size
            const particleX = centerX + (Math.random() - 0.5) * baseWidth * (1 - life * 0.5);
             // Make heightFactor relative to the screen height usable for fire
            const fireHeight = rect.h * heightFactor;
            const particleY = bottomY - life * fireHeight;
            const opacity = Math.sin(life * Math.PI); // Fade out at top and bottom

            // Color variation
            if (Math.random() > 0.35) { // More orange/yellow
                ctx.fillStyle = `rgba(255, ${100 + Math.random() * 120}, 0, ${opacity * 0.8})`;
            } else { // More red
                ctx.fillStyle = `rgba(${200 + Math.random()*55}, 0, 0, ${opacity * 0.6})`;
            }

            ctx.beginPath();
            ctx.arc(particleX, particleY, Math.max(1, size / 2), 0, Math.PI * 2); // Ensure min radius of 1
            ctx.fill();
        }
    }


    function drawSmoke(ctx, rect) {
        // Adjust parameters based on rect dimensions if needed
        const numWaves = 6;
        const smokeHeight = rect.h * 0.6; // Relative height
        const startY = rect.y + rect.h * 0.19; // Relative start
        const waveThickness = rect.w * 0.15; // Make thickness relative to width
        const amplitudeBase = rect.h * 0.02; // Base amplitude relative to height
        const freqBase = 1 / (rect.w * 0.2); // Frequency related to width

        ctx.save();
        const smokeGradient = ctx.createLinearGradient(rect.x, startY, rect.x, startY + smokeHeight);
        // Gradient stops are fine
        smokeGradient.addColorStop(0, 'rgba(139, 69, 19, 0.0)');   // Transparent SaddleBrown at top
        smokeGradient.addColorStop(0.3, 'rgba(160, 82, 45, 0.3)'); // Semi-transparent Sienna
        smokeGradient.addColorStop(0.7, 'rgba(210, 105, 30, 0.4)');// Semi-transparent Chocolate
        smokeGradient.addColorStop(1, 'rgba(255, 140, 0, 0.1)');  // Faint DarkOrange near bottom
        ctx.fillStyle = smokeGradient;
        ctx.globalAlpha = 0.35; // Keep overall transparency

        for (let i = 0; i < numWaves; i++) {
            const amplitude = (Math.random() * amplitudeBase + amplitudeBase * 0.5) * (1 + i * 0.2); // Scale amplitude
            const frequency = (Math.random() * freqBase * 0.5 + freqBase * 0.5); // Scale frequency
            const speed = frameCount * (0.005 + Math.random() * 0.0003) + i * Math.PI; // Speed likely okay
            const baseY = startY + (smokeHeight / numWaves) * i + Math.sin(frameCount * 0.01 + i) * (rect.h * 0.02); // Scale vertical wiggle

            ctx.beginPath();
            let startWaveY = baseY + Math.sin(speed) * amplitude;
            ctx.moveTo(rect.x, startWaveY);

            // Draw top edge of wave
             // Adjust step for performance/detail based on width? Maybe keep fixed step.
            for (let x = rect.x + 10; x <= rect.x + rect.w; x += 10) {
                let y = baseY + Math.sin(x * frequency + speed) * amplitude;
                ctx.lineTo(x, y);
            }
            let endWaveY = baseY + Math.sin((rect.x + rect.w) * frequency + speed) * amplitude;
             // Ensure lineTo the corner before drawing bottom edge
            ctx.lineTo(rect.x + rect.w, endWaveY);
            // Draw bottom edge (offset by thickness)
            ctx.lineTo(rect.x + rect.w, endWaveY + waveThickness); // Line down on right edge
             // Go backwards for bottom edge
            for (let x = rect.x + rect.w; x >= rect.x + 10; x -= 10) {
                let y = baseY + Math.sin(x * frequency + speed) * amplitude;
                ctx.lineTo(x, y + waveThickness);
            }
             ctx.lineTo(rect.x, startWaveY + waveThickness); // Line back to start's bottom edge
            ctx.closePath(); // Close the shape
            ctx.fill();
        }
        ctx.restore();
    }

    // --- Law Icons (Need to be scaled) ---
    function drawScalesOfJustice(ctx, centerX, centerY, size) {
        // Make all internal sizes relative to the 'size' parameter
        const beamWidth = size;
        const beamHeight = size * 0.08;
        const standHeight = size * 0.9;
        const standWidth = size * 0.1;
        const baseWidth = size * 0.4;
        const baseHeight = size * 0.1;
        const armLength = size * 0.5; // Make relative
        const panRadiusX = size * 0.25; // Make relative
        const panRadiusY = size * 0.15; // Make relative
        const chainLength = size * 0.1; // Make relative

        ctx.save();
        ctx.translate(centerX, centerY - standHeight / 2); // Center pivot point

        const metalColor = '#DAA520'; // GoldenRod
        const shadowColor = '#B8860B'; // DarkGoldenRod
        ctx.strokeStyle = shadowColor;
        ctx.fillStyle = metalColor;
        ctx.lineWidth = Math.max(1, size * 0.015); // Scaled line width

        // Base
        ctx.fillRect(-baseWidth / 2, standHeight / 2 - baseHeight, baseWidth, baseHeight);
        ctx.strokeRect(-baseWidth / 2, standHeight / 2 - baseHeight, baseWidth, baseHeight);

        // Stand
        ctx.fillRect(-standWidth / 2, -standHeight / 2, standWidth, standHeight);
        ctx.strokeRect(-standWidth / 2, -standHeight / 2, standWidth, standHeight);

        // Pivot
        ctx.beginPath();
        ctx.arc(0, -standHeight / 2, beamHeight, 0, Math.PI * 2); // Pivot size based on beam height
        ctx.fill();
        ctx.stroke();

        // Beam
        ctx.fillRect(-beamWidth / 2, -standHeight / 2 - beamHeight / 2, beamWidth, beamHeight);
        ctx.strokeRect(-beamWidth / 2, -standHeight / 2 - beamHeight / 2, beamWidth, beamHeight);

        // Left Pan and Arm
        const leftArmX = -beamWidth / 2 * 0.85; // Position relative to beam
        const armTopY = -standHeight / 2; // Top of the arm at pivot level
        const panTopY = armTopY + armLength; // Where pan hangs from

        ctx.beginPath(); // Arm line
        ctx.moveTo(leftArmX, armTopY);
        ctx.lineTo(leftArmX, panTopY);
        ctx.stroke();

        ctx.beginPath(); // Chains
        ctx.moveTo(leftArmX - panRadiusX * 0.5, panTopY); // Chain anchor left
        ctx.lineTo(leftArmX, panTopY - chainLength);     // Chain to center point above pan
        ctx.moveTo(leftArmX + panRadiusX * 0.5, panTopY); // Chain anchor right
        ctx.lineTo(leftArmX, panTopY - chainLength);     // Chain to center point
        ctx.stroke();

        ctx.beginPath(); // Pan ellipse
        ctx.ellipse(leftArmX, panTopY, panRadiusX, panRadiusY, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Right Pan and Arm (Symmetrical)
        const rightArmX = beamWidth / 2 * 0.85; // Position relative to beam

        ctx.beginPath(); // Arm line
        ctx.moveTo(rightArmX, armTopY);
        ctx.lineTo(rightArmX, panTopY);
        ctx.stroke();

        ctx.beginPath(); // Chains
        ctx.moveTo(rightArmX - panRadiusX * 0.5, panTopY); // Chain anchor left
        ctx.lineTo(rightArmX, panTopY - chainLength);     // Chain to center point
        ctx.moveTo(rightArmX + panRadiusX * 0.5, panTopY); // Chain anchor right
        ctx.lineTo(rightArmX, panTopY - chainLength);     // Chain to center point
        ctx.stroke();

        ctx.beginPath(); // Pan ellipse
        ctx.ellipse(rightArmX, panTopY, panRadiusX, panRadiusY, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.restore();
    }

    function drawBookStack(ctx, centerX, centerY, size) {
        // Make all internal sizes relative to the 'size' parameter
        const bookHeight = size * 0.18; // Relative height
        const numBooks = 3;
        const totalStackHeight = bookHeight * numBooks;
        const baseBookWidth = size; // Base width is the main size driver

        ctx.save();
        // Adjust centerY so the stack sits nicely (bottom aligns roughly with centerY)
        ctx.translate(centerX, centerY + totalStackHeight / 2 - bookHeight / 2);

        const colors = ['#8B4513', '#A0522D', '#5F4034']; // SaddleBrown, Sienna, Dark Brown
        const pageColor = '#F5F5DC'; // Beige
        const lineWidth = Math.max(1, size * 0.01); // Scaled line width

        for (let i = 0; i < numBooks; i++) {
            const bookWidth = baseBookWidth * (1 - i * 0.08); // Books get slightly narrower higher up
            const bookY = - (i + 1) * bookHeight; // Position books upwards
            const offsetX = (Math.random() - 0.5) * size * 0.05 * (i + 1); // More offset higher up

            // Draw Book Cover
            ctx.fillStyle = colors[i % colors.length];
            ctx.fillRect(offsetX - bookWidth / 2, bookY, bookWidth, bookHeight);

            // Draw Pages (inset slightly)
            ctx.fillStyle = pageColor;
            const pageInset = lineWidth * 2;
            ctx.fillRect(
                offsetX - bookWidth / 2 + pageInset,
                bookY + lineWidth, // Inset from top/bottom edge
                bookWidth - pageInset - lineWidth, // Inset from left/right edge (only show front pages)
                bookHeight - lineWidth * 2 // Inset from top/bottom
            );

            // Draw Book Outline
            ctx.strokeStyle = '#333333'; // Dark grey outline
            ctx.lineWidth = lineWidth;
            ctx.strokeRect(offsetX - bookWidth / 2, bookY, bookWidth, bookHeight);

            // Draw Spine Detail (a simple line)
             ctx.beginPath();
             ctx.moveTo(offsetX - bookWidth / 2 + lineWidth * 1.5, bookY);
             ctx.lineTo(offsetX - bookWidth / 2 + lineWidth * 1.5, bookY + bookHeight);
             ctx.stroke();
        }
        ctx.restore();
    }

    // --- Channel Definitions ---
    // Adjust drawing parameters within each channel's draw function to use 'rect'
    const channels = [
        { // Channel 0 - Clover News
            number: 0, name: "This is... MAYDAY NEWS NOW",
            init: ()=>{ newsScrollX = screenRect.w + 100; }, // Init based on current screen width
            draw: (ctx, rect)=>{
                ctx.fillStyle = '#3d9970'; ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
                // Scale clover size and position
                const cloverSize = rect.h * 0.2; // Relative size
                const cloverX = rect.x + cloverSize * 3.3;
                const cloverY = rect.y + rect.h - cloverSize * 1.4; // Adjusted Y position
                drawCloverNewscaster(ctx, cloverX, cloverY, cloverSize);

                const newsText = "TRUMP THREATENS WITCHES BUT MAY DAY CELEBRATIONS STILL UNDERWAY, +++ PAGANS BOAST: MORE GODS -  MORE HOLIDAYS +++ LOCAL MAYPOLE RAISING AT NOON,... OR ARE YOU JUST HAPPY TO SEE ME? +++ CLOVER REPORTS HIGH POLLEN COUNT...NO JOGGING ADVISORY TODAY - YOUR NOSE WILL BE RUNNING MORE THAN YOU +++ BELTANE BONFIRE AND OUTDOOR SEX SAFETY TIPS +++ TOP FIVE REASONS TO DATE A PAGAN GIRL: SHE WORSHIPS THE GROUND YOU WALK ON...ORIGINAL WHAT???...BEING INVITED TO CHURCH IS AWESOME...When she says THE HORNED GOD COMES! she MEANS IT!!!...THREE WORDS: beltane, Beltane, BELTANE!...JOKES STOLEN FROM ANGELFIRE.COM +++";
                const tickerHeight = rect.h * 0.1; // Relative height
                const textY = rect.y + rect.h - tickerHeight * 0.3; // Position within ticker
                const fontSize = Math.max(12, Math.min(24, rect.h * 0.05)); // Dynamic font size
                ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
                ctx.fillRect(rect.x, rect.y + rect.h - tickerHeight, rect.w, tickerHeight);
                ctx.fillStyle = '#FFFFFF';
                ctx.font = `bold ${fontSize}px sans-serif`;
                const textWidth = ctx.measureText(newsText).width; // Measure based on current font
                ctx.save();
                ctx.beginPath();
                ctx.rect(rect.x, rect.y + rect.h - tickerHeight, rect.w, tickerHeight);
                ctx.clip();
                ctx.fillText(newsText, rect.x + newsScrollX, textY);
                ctx.restore();
                newsScrollX -= Math.max(1, rect.w * 0.003); // Scale scroll speed slightly
                if (newsScrollX < -textWidth) { newsScrollX = rect.w; }
            }
        },
        { // Channel 1 - Rituals
            number: 1, name: "Ancient Rituals Today",
            init: ()=>{},
            draw: (ctx, rect)=>{
                ctx.fillStyle = '#8a8a8a'; ctx.fillRect(rect.x, rect.y, rect.w, rect.h); ctx.fillStyle = '#6a6a6a';
                // Add fewer details on smaller screens? Or scale size.
                const detailSize = Math.max(1, canvasWidth * 0.002);
                for(let i=0;i<50;i++){ ctx.fillRect(rect.x+Math.random()*rect.w, rect.y+Math.random()*rect.h, detailSize*11, detailSize); }

                ctx.fillStyle = '#e0d6b3';
                // Scale font size
                const titleFontSize = Math.max(20, Math.min(54, rect.h * 0.1));
                const subFontSize = Math.max(12, Math.min(24, rect.h * 0.05));
                ctx.font = `italic ${titleFontSize}px serif`;
                ctx.textAlign = 'center';
                ctx.fillText("The Meaning of Beltane Fires", rect.x + rect.w / 2, rect.y + rect.h / 2);
                ctx.font = `${subFontSize}px serif`;
                ctx.fillText("Exploring ancient pagan traditions...", rect.x + rect.w / 2, rect.y + rect.h / 2 + titleFontSize * 0.8);
                ctx.textAlign = 'left';
            }
        },
        { // Channel 2 - Kids
             number: 2, name: "Outdoor Playhouse Pals",
             init: ()=>{
                 dandelionSeeds = [];
                 // Fewer seeds on smaller screens? Or just let them be relative
                 const numSeeds = Math.max(20, Math.floor(screenRect.w * screenRect.h * 0.0001)); // Adjust density based on area
                 for(let i = 0; i < numSeeds; i++) {
                     dandelionSeeds.push({
                         x: Math.random() * screenRect.w,
                         y: Math.random() * screenRect.h,
                         size: Math.random() * (canvasWidth * 0.004) + (canvasWidth * 0.001), // Relative size
                         speedX: (Math.random() * 1 - 0.5) * (canvasWidth / 800), // Scale speed maybe?
                         speedY: (Math.random() * 0.5 + 0.2) * (canvasHeight / 600),
                         opacity: Math.random() * 0.5 + 0.3
                     });
                 }
                 channel2Clouds = [];
                 const skyHeight = screenRect.h * 0.7;
                 const numClouds = 5;
                 for (let i = 0; i < numClouds; i++) {
                     const scale = Math.random() * 0.3 + 0.3; // Keep scale relative to base cloud size
                     channel2Clouds.push({
                         x: Math.random() * (screenRect.w + baseCloudWidth * scale) - baseCloudWidth * scale,
                         y: Math.random() * (skyHeight * 0.8) + skyHeight * 0.1, // Position within relative skyHeight
                         speed: (Math.random() * 0.8 + 0.2) * (canvasWidth / 800), // Scale speed
                         scale: scale
                     });
                 }
                 channel2Clouds.sort((a, b) => a.scale - b.scale);
             },
             draw: (ctx, rect)=>{
                 const skyGroundRatio = 0.7;
                 // Sky
                 ctx.fillStyle = '#87CEEB'; // Sky blue
                 ctx.fillRect(rect.x, rect.y, rect.w, rect.h * skyGroundRatio);
                 // Ground
                 ctx.fillStyle = '#90EE90'; // Light green
                 ctx.fillRect(rect.x, rect.y + rect.h * skyGroundRatio, rect.w, rect.h * (1 - skyGroundRatio));

                 // Clouds (drawCloud handles scaling internally via cloud.scale)
                 channel2Clouds.forEach(cloud => {
                     updateCloud(cloud, rect.w, baseCloudWidth); // updateCloud uses rect.w now
                     // Pass relative rect coords for positioning
                     drawCloud(ctx, cloud, rect.x, rect.y, '#FFFFFF');
                 });

                 // Dandelion Seeds
                 dandelionSeeds.forEach(seed => {
                     ctx.fillStyle = `rgba(255, 255, 255, ${seed.opacity})`;
                     ctx.beginPath();
                     // Draw relative to rect origin
                     ctx.arc(rect.x + seed.x, rect.y + seed.y, Math.max(1, seed.size), 0, Math.PI * 2);
                     ctx.fill();

                     // Update position
                     seed.x += seed.speedX;
                     seed.y += seed.speedY;

                     // Reset position if off-screen (relative to rect dimensions)
                     if (seed.y > rect.h || seed.x < -seed.size || seed.x > rect.w + seed.size) {
                         seed.y = -10; // Start above the screen
                         seed.x = Math.random() * rect.w; // Reset x within screen width
                         seed.opacity = Math.random() * 0.5 + 0.3; // Reset opacity
                     }
                 });
             }
         },
         { // Channel 3 - Movie
            number: 3, name: "Movie: May Queen & Beltane Beast",
            init: () => {},
            draw: (ctx, rect) => {
                ctx.fillStyle = '#1a0500'; ctx.fillRect(rect.x, rect.y, rect.w, rect.h); // BG
                drawSmoke(ctx, rect); // Smoke (already made relative)

                 // Bonfires - Calculate parameters relatively
                 const centerBonfireBaseY = rect.h * 0.95; // % from top
                 const centerBonfireW = rect.w * 0.18; // % of width
                 const centerBonfireHFactor = 0.65; // % of height for flames
                 drawBonfire(ctx, rect, rect.x + rect.w / 2, centerBonfireBaseY, centerBonfireW, centerBonfireHFactor, 50);

                 const leftBonfireBaseY = rect.h * 0.93;
                 const leftBonfireW = rect.w * 0.1;
                 const leftBonfireHFactor = 0.45;
                 drawBonfire(ctx, rect, rect.x + rect.w * 0.25, leftBonfireBaseY, leftBonfireW, leftBonfireHFactor, 30);

                 const rightBonfireBaseY = rect.h * 0.96;
                 const rightBonfireW = rect.w * 0.14;
                 const rightBonfireHFactor = 0.75;
                 drawBonfire(ctx, rect, rect.x + rect.w * 0.75, rightBonfireBaseY, rightBonfireW, rightBonfireHFactor, 40);

                // Title Text
                ctx.fillStyle = '#FFD700'; // Gold
                 const titleFontSize = Math.max(20, Math.min(60, rect.w * 0.1)); // Scale font size
                ctx.font = `bold ${titleFontSize}px fantasy`; // Or another suitable font
                ctx.textAlign = 'center';
                ctx.shadowColor = 'black';
                ctx.shadowBlur = Math.max(2, titleFontSize * 0.08); // Scale shadow
                // Position text relative to screen height/width
                ctx.fillText("May Queen & Beltane Beast", rect.x + rect.w / 2, rect.y + rect.h * 0.3); // Position ~30% down
                ctx.shadowColor = 'transparent';
                ctx.shadowBlur = 0;
                ctx.textAlign = 'left'; // Reset alignment
            }
        },
         { // Channel 4 - Maypole
             number: 4, name: "Maypole Dance Off!",
             init: ()=>{ maypoleAngle = 0; },
             draw: (ctx, rect)=>{
                 ctx.fillStyle = '#f0e68c'; // Khaki background
                 ctx.fillRect(rect.x, rect.y, rect.w, rect.h);

                 // Pole dimensions and position relative to screen
                 const poleX = rect.x + rect.w / 2;
                 const poleTopY = rect.y + rect.h * 0.1; // 10% from top
                 const poleBottomY = rect.y + rect.h * 0.9; // 10% from bottom
                 const poleWidth = Math.max(5, rect.w * 0.025); // Relative width, min 5px

                 // Draw Pole
                 ctx.fillStyle = '#8B4513'; // SaddleBrown
                 ctx.fillRect(poleX - poleWidth / 2, poleTopY, poleWidth, poleBottomY - poleTopY);

                 // Ribbons
                 const ribbonColors = ['#FF69B4', '#00BFFF', '#32CD32', '#FFD700', '#FF4500', '#9370DB'];
                 const numRibbons = 6;
                 // Make ribbon length and amplitude relative
                 const ribbonLength = rect.w * 0.4;
                 const ribbonAmplitude = rect.w * 0.05; // Amplitude relative to width for wave effect
                 const ribbonEndY = poleTopY + rect.h * 0.6; // Where ribbons attach at bottom (relative)

                 maypoleAngle += 0.02; // Keep speed constant? Or scale slightly?

                 for(let i = 0; i < numRibbons; i++) {
                     const angleOffset = (Math.PI * 2 / numRibbons) * i;
                     const currentAngle = maypoleAngle + angleOffset;

                     // Calculate ribbon end point based on angle and relative length
                     const endX = poleX + Math.cos(currentAngle) * ribbonLength;
                     //const endY = poleTopY + ribbonLength * 0.8; // Original Y end calculation
                     const endY = ribbonEndY; // Use the calculated relative end Y

                     ctx.beginPath();
                     ctx.moveTo(poleX, poleTopY); // Start at top of pole

                     // Control point for the curve, making the wave effect relative
                     const controlX = poleX + Math.cos(currentAngle + Math.PI / 2) * ribbonAmplitude * Math.sin(maypoleAngle * 2);
                     const controlY = poleTopY + (endY - poleTopY) / 2; // Midpoint Y for control

                     ctx.quadraticCurveTo(controlX, controlY, endX, endY);

                     ctx.strokeStyle = ribbonColors[i % ribbonColors.length];
                     ctx.lineWidth = Math.max(2, rect.w * 0.008); // Scale line width, min 2px
                     ctx.stroke();
                 }
                 ctx.lineWidth = 1; // Reset line width
             }
         },
         { // Channel 5 - Secrets of Law Day
             number: 5, name: "Secrets of Law Day",
             init: () => {},
             draw: (ctx, rect) => {
                 ctx.fillStyle = '#f5f5dc'; ctx.fillRect(rect.x, rect.y, rect.w, rect.h); // Parchment BG

                 // Ivy Border - Scale amplitude and frequency?
                 ctx.strokeStyle = '#228B22'; // Forest Green
                 ctx.lineWidth = Math.max(1, canvasWidth * 0.004); // Scale line width
                 const vineAmplitude = rect.h * 0.015; // Scale amplitude
                 const vineFrequency = 1 / (rect.w * 0.05); // Adjust frequency based on width?
                 const wiggle = (pos, offset) => vineAmplitude * Math.sin(pos * vineFrequency + frameCount * 0.05 + offset);

                 // Draw border lines using wiggle
                 ctx.beginPath(); ctx.moveTo(rect.x, rect.y + wiggle(rect.x, 0)); for(let x = rect.x; x <= rect.x + rect.w; x+=10) ctx.lineTo(x, rect.y + wiggle(x, 0)); ctx.stroke(); // Top
                 ctx.beginPath(); ctx.moveTo(rect.x, rect.y + rect.h + wiggle(rect.x, Math.PI)); for(let x = rect.x; x <= rect.x + rect.w; x+=10) ctx.lineTo(x, rect.y + rect.h + wiggle(x, Math.PI)); ctx.stroke(); // Bottom
                 ctx.beginPath(); ctx.moveTo(rect.x + wiggle(rect.y, Math.PI/2), rect.y); for(let y = rect.y; y <= rect.y + rect.h; y+=10) ctx.lineTo(rect.x + wiggle(y, Math.PI/2), y); ctx.stroke(); // Left
                 ctx.beginPath(); ctx.moveTo(rect.x + rect.w + wiggle(rect.y, 3*Math.PI/2), rect.y); for(let y = rect.y; y <= rect.y + rect.h; y+=10) ctx.lineTo(rect.x + rect.w + wiggle(y, 3*Math.PI/2), y); ctx.stroke(); // Right
                 ctx.lineWidth = 1; // Reset

                 // Law Icons - Scale size and spacing
                 const iconBaseSize = Math.min(rect.w, rect.h) * 0.25; // Base size relative to screen
                 const iconCenterX = rect.x + rect.w / 2;
                 const iconCenterY = rect.y + rect.h / 2;
                 const iconSpacing = rect.w * 0.22; // Relative spacing

                 // Draw scaled icons (functions already accept size)
                 drawScalesOfJustice(ctx, iconCenterX - iconSpacing, iconCenterY, iconBaseSize * 0.9); // Scales slightly smaller
                 drawBookStack(ctx, iconCenterX + iconSpacing, iconCenterY + iconBaseSize * 0.1, iconBaseSize * 0.8); // Books slightly smaller and lower

                 // Title - Scale font size and position
                 ctx.fillStyle = '#5a4500'; // Dark brown text
                 const titleFontSize = Math.max(12, Math.min(24, rect.h * 0.06)); // Scale font
                 ctx.font = `bold ${titleFontSize}px serif`;
                 ctx.textAlign = 'center';
                 // Position title relative to top
                 ctx.fillText("Law Day is NOT May Day. But it is.", iconCenterX, rect.y + rect.h * 0.15);
                 ctx.textAlign = 'left'; // Reset alignment
             }
         },
         { // Channel 6 - Shopping
            number: 6, name: "Spring Jubilee Shopping",
            init: ()=>{},
            draw: (ctx, rect)=>{
                ctx.fillStyle = '#FFB6C1'; ctx.fillRect(rect.x, rect.y, rect.w, rect.h); // Pink BG

                // Scale item dimensions and position
                const itemWidth = rect.w * 0.2; // Relative width
                const itemHeight = rect.h * 0.2; // Relative height
                const itemY = rect.y + rect.h / 2 - itemHeight / 2; // Center vertically
                const speed = rect.w * 0.002; // Scale speed with width

                // Item 1 (Flower Basket)
                const item1X = rect.x + (frameCount * speed) % (rect.w + itemWidth * 2) - itemWidth * 1.5;
                if (item1X > rect.x - itemWidth && item1X < rect.x + rect.w) {
                    // Draw basket base (relative size)
                    ctx.fillStyle = '#8B4513'; // Brown
                    ctx.fillRect(item1X, itemY + itemHeight * 0.4, itemWidth, itemHeight * 0.6);
                    // Draw flowers (relative size and position)
                    ctx.fillStyle = '#FF69B4'; // Pink flower
                    ctx.beginPath(); ctx.arc(item1X + itemWidth*0.3, itemY + itemHeight*0.3, itemWidth*0.2, 0, Math.PI*2); ctx.fill();
                    ctx.fillStyle = '#FFFF00'; // Yellow flower
                    ctx.beginPath(); ctx.arc(item1X + itemWidth*0.7, itemY + itemHeight*0.3, itemWidth*0.2, 0, Math.PI*2); ctx.fill();
                    ctx.fillStyle = '#90EE90'; // Green leaf/center
                    ctx.beginPath(); ctx.arc(item1X + itemWidth*0.5, itemY + itemHeight*0.5, itemWidth*0.15, 0, Math.PI*2); ctx.fill();
                }

                // Item 2 (Mini Maypole?)
                const item2X = rect.x + (frameCount * speed + rect.w / 2) % (rect.w + itemWidth * 2) - itemWidth * 1.5;
                if (item2X > rect.x - itemWidth && item2X < rect.x + rect.w) {
                     // Pole
                    const poleWidth = itemWidth * 0.1;
                    ctx.fillStyle = '#D2B48C'; // Tan
                    ctx.fillRect(item2X + itemWidth/2 - poleWidth/2, itemY, poleWidth, itemHeight);
                    // Ribbons (simplified)
                    ctx.strokeStyle = '#FF0000'; // Red
                     ctx.lineWidth = Math.max(1, itemWidth * 0.03); // Scale line width
                    ctx.beginPath(); ctx.moveTo(item2X + itemWidth/2, itemY + itemHeight*0.1); ctx.lineTo(item2X + itemWidth*0.1, itemY + itemHeight*0.9); ctx.stroke();
                    ctx.strokeStyle = '#0000FF'; // Blue
                    ctx.beginPath(); ctx.moveTo(item2X + itemWidth/2, itemY + itemHeight*0.1); ctx.lineTo(item2X + itemWidth*0.9, itemY + itemHeight*0.9); ctx.stroke();
                    ctx.lineWidth = 1; // Reset
                }

                // Bottom Banner
                const bannerHeight = rect.h * 0.15; // Relative height
                ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
                ctx.fillRect(rect.x, rect.y + rect.h - bannerHeight, rect.w, bannerHeight);
                ctx.fillStyle = '#FFFFFF';
                const fontSize = Math.max(12, Math.min(24, rect.h * 0.06)); // Scale font
                ctx.font = `bold ${fontSize}px sans-serif`;
                ctx.textAlign = 'center';
                // Position text vertically centered in banner
                ctx.fillText("MAY DAY SALE! Flower Baskets $19.99!", rect.x + rect.w / 2, rect.y + rect.h - bannerHeight / 2 + fontSize / 3);
                ctx.textAlign = 'left'; // Reset
            }
        },
        { // Channel 7 - Labor Day
            number: 7, name: "Int'l Labor Day Focus",
            init: ()=>{},
            draw: (ctx, rect)=>{
                ctx.fillStyle = '#4682B4'; ctx.fillRect(rect.x, rect.y, rect.w, rect.h); // SteelBlue BG

                // Globe - Scale size and position
                const globeRadius = Math.min(rect.w, rect.h) * 0.18; // Relative radius
                const globeX = rect.x + rect.w / 2;
                const globeY = rect.y + rect.h / 2 - globeRadius * 0.3; // Adjust vertical position slightly

                // Draw Globe Base (Ocean)
                ctx.fillStyle = '#5F9EA0'; // CadetBlue
                ctx.beginPath(); ctx.arc(globeX, globeY, globeRadius, 0, Math.PI * 2); ctx.fill();

                // Draw Continents (Simplified, relative to globe size)
                ctx.fillStyle = '#90EE90'; // LightGreen
                ctx.beginPath(); ctx.ellipse(globeX - globeRadius * 0.3, globeY - globeRadius * 0.2, globeRadius * 0.4, globeRadius * 0.3, Math.PI / 4, 0, Math.PI * 2); ctx.fill(); // America-ish
                ctx.beginPath(); ctx.ellipse(globeX + globeRadius * 0.4, globeY + globeRadius * 0.3, globeRadius * 0.5, globeRadius * 0.25, -Math.PI / 6, 0, Math.PI * 2); ctx.fill(); // Eurasia/Africa-ish

                // Pulsing Outer Ring
                const pulseFactor = (Math.sin(frameCount * 0.05) + 1) / 2; // 0 to 1
                const pulseRadius = globeRadius + globeRadius * 0.1 + pulseFactor * (globeRadius * 0.15); // Scale pulse range
                ctx.strokeStyle = `rgba(255, 255, 255, ${pulseFactor * 0.8})`; // Fade opacity with pulse
                ctx.lineWidth = Math.max(1, globeRadius * 0.05) + pulseFactor * Math.max(1, globeRadius * 0.05); // Scale line width and pulse thickness
                ctx.beginPath(); ctx.arc(globeX, globeY, pulseRadius, 0, Math.PI * 2); ctx.stroke();
                ctx.lineWidth = 1; // Reset

                // Text - Scale font size and position
                ctx.fillStyle = '#FFFFFF';
                const titleFontSize = Math.max(14, Math.min(26, rect.h * 0.07)); // Scale title font
                const subFontSize = Math.max(10, Math.min(20, rect.h * 0.05)); // Scale subtitle font
                ctx.font = `bold ${titleFontSize}px sans-serif`;
                ctx.textAlign = 'center';
                ctx.fillText("International Workers' Day", rect.x + rect.w / 2, rect.y + rect.h * 0.15); // Position relative top
                ctx.font = `${subFontSize}px sans-serif`;
                ctx.fillText("A Global Perspective on Labor Rights", rect.x + rect.w / 2, rect.y + rect.h * 0.85); // Position relative bottom
                ctx.textAlign = 'left'; // Reset
            }
        },
        { // Channel 8 - Weather
             number: 8, name: "Crazy Spring Weather",
             init: ()=>{
                 weatherElements.rain = [];
                 weatherElements.lightning = 0;
                 weatherElements.clouds = [];
                 // Fewer rain drops on smaller screens? Adjust density.
                 const numDrops = Math.max(50, Math.floor(screenRect.w * screenRect.h * 0.0002));
                 for (let i = 0; i < numDrops; i++) {
                     weatherElements.rain.push({
                         x: Math.random() * screenRect.w,
                         y: Math.random() * screenRect.h,
                         length: Math.random() * (canvasHeight * 0.015) + (canvasHeight * 0.008), // Relative length
                         speed: (Math.random() * 4 + 2) * (canvasHeight / 600) // Scale speed
                     });
                 }
                 const numClouds = 7;
                 for (let i = 0; i < numClouds; i++) {
                     const scale = Math.random() * 0.4 + 0.5; // Cloud scale itself is fine
                     weatherElements.clouds.push({
                         x: Math.random() * (screenRect.w + baseCloudWidth * scale) - baseCloudWidth * scale,
                         y: Math.random() * (screenRect.h * 0.6), // Position relative
                         speed: (Math.random() * 1.5 + 0.5) * (canvasWidth / 800), // Scale speed
                         scale: scale
                     });
                 }
                 weatherElements.clouds.sort((a, b) => a.scale - b.scale);
             },
             draw: (ctx, rect)=>{
                 ctx.fillStyle = '#778899'; ctx.fillRect(rect.x, rect.y, rect.w, rect.h); // LightSlateGray BG

                 // Clouds (Draw darker weather clouds)
                 weatherElements.clouds.forEach(cloud => {
                     updateCloud(cloud, rect.w, baseCloudWidth);
                     drawCloud(ctx, cloud, rect.x, rect.y, '#A9A9A9'); // DarkGray clouds
                 });

                 // Rain - Scale line width?
                 ctx.strokeStyle = '#ADD8E6'; // LightBlue
                 ctx.lineWidth = Math.max(1, canvasWidth * 0.002); // Scaled rain thickness
                 weatherElements.rain.forEach(drop => {
                     ctx.beginPath();
                     ctx.moveTo(rect.x + drop.x, rect.y + drop.y);
                     ctx.lineTo(rect.x + drop.x, rect.y + drop.y + drop.length); // Use relative length
                     ctx.stroke();
                     // Update position
                     drop.y += drop.speed;
                     // Reset rain drop
                     if (drop.y > rect.h) {
                         drop.y = -drop.length; // Start above screen
                         drop.x = Math.random() * rect.w; // Reset x position
                     }
                 });
                 ctx.lineWidth = 1; // Reset

                 // Lightning Flash
                 if (weatherElements.lightning > 0) {
                     // Fade effect based on lightning timer
                     ctx.fillStyle = `rgba(255, 255, 220, ${weatherElements.lightning / 5 * 0.8})`; // LightYellow flash
                     ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
                     weatherElements.lightning--; // Decrease timer
                 } else if (Math.random() < 0.015) { // Random chance to trigger flash
                     weatherElements.lightning = 5; // Set flash duration (frames)
                 }
             }
         },
         { // Channel 9 - Celestial
            number: 9, name: "Celestial Spring Watch",
            init: ()=>{
                stars = [];
                 const numStars = Math.max(50, Math.floor(screenRect.w * screenRect.h * 0.0003)); // Adjust density
                for (let i = 0; i < numStars; i++) {
                    stars.push({
                        x: Math.random() * screenRect.w,
                        y: Math.random() * screenRect.h,
                        size: Math.random() * (canvasWidth * 0.002) + (canvasWidth * 0.0006), // Relative size
                        opacity: Math.random() * 0.5 + 0.3,
                        blinkSpeed: Math.random() * 0.05 + 0.01 // Blink speed likely okay
                    });
                }
            },
            draw: (ctx, rect)=>{
                // Background Gradient
                const gradient = ctx.createLinearGradient(rect.x, rect.y, rect.x, rect.y + rect.h);
                gradient.addColorStop(0, '#000033'); // Dark blue top
                gradient.addColorStop(1, '#1a1a4a'); // Slightly lighter dark blue bottom
                ctx.fillStyle = gradient;
                ctx.fillRect(rect.x, rect.y, rect.w, rect.h);

                // Stars
                stars.forEach(star => {
                    // Twinkle effect
                    const currentOpacity = star.opacity * ( (Math.sin(frameCount * star.blinkSpeed) + 1) / 2 * 0.7 + 0.3 ); // 0.3 to 1.0 * base opacity
                    ctx.fillStyle = `rgba(255, 255, 255, ${currentOpacity})`;
                    ctx.beginPath();
                    // Draw relative to rect origin
                    ctx.arc(rect.x + star.x, rect.y + star.y, Math.max(0.5, star.size), 0, Math.PI * 2); // Ensure min size 0.5px
                    ctx.fill();
                });

                // Moon - Scale size, orbit, position
                const moonRadius = rect.w * 0.05; // Relative radius
                const orbitRadiusX = rect.w * 0.3; // Horizontal orbit radius relative to width
                const orbitRadiusY = rect.h * 0.3; // Vertical orbit radius relative to height
                const arcSpeed = 0.003; // Keep speed constant?

                // Moon path calculation (adjust center and range)
                const moonAngle = -Math.PI / 4 + (frameCount * arcSpeed) % (Math.PI * 1.5); // Keep angle progression
                const moonCenterX = rect.x + rect.w / 2;
                const moonCenterY = rect.y + rect.h * 0.7; // Center orbit lower down
                const moonX = moonCenterX + Math.cos(moonAngle) * orbitRadiusX;
                const moonY = moonCenterY - Math.sin(moonAngle) * orbitRadiusY; // Use Y radius

                // Draw moon only if within screen bounds (already checked by clipping, but good practice)
                //if (moonX > rect.x && moonX < rect.x + rect.w && moonY > rect.y && moonY < rect.y + rect.h) {
                    ctx.fillStyle = '#f0f0e0'; // Moon color (off-white)
                    ctx.beginPath();
                    ctx.arc(moonX, moonY, moonRadius, 0, Math.PI * 2);
                    ctx.fill();
                    // Simple craters (relative size and position)
                    ctx.fillStyle = 'rgba(0,0,0,0.1)'; // Faint dark shadow color
                    ctx.beginPath(); ctx.arc(moonX - moonRadius*0.3, moonY - moonRadius*0.15, moonRadius*0.15, 0, Math.PI*2); ctx.fill();
                    ctx.beginPath(); ctx.arc(moonX + moonRadius*0.25, moonY + moonRadius*0.25, moonRadius*0.25, 0, Math.PI*2); ctx.fill();
                //}
            }
        },
    ];

    // --- Responsive Resize Function ---
    function resizeCanvas() {
        // Get the actual display size of the canvas element
        const displayWidth = canvas.clientWidth;
        // Calculate height based on aspect ratio
        const displayHeight = displayWidth * desiredAspectRatio;

        // Set the drawing surface size to match the display size
        // Check if size actually changed to avoid unnecessary redraws
        if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
            canvas.width = displayWidth;
            canvas.height = displayHeight;

             // --- Recalculate size-dependent layout variables ---
            canvasWidth = canvas.width; // Update global width tracker
            canvasHeight = canvas.height; // Update global height tracker

            // Calculate border based on the smaller dimension to look consistent
            tvBorderWidth = Math.min(canvasWidth, canvasHeight) * 0.08; // e.g., 8% of smaller dimension

            // Calculate screen rectangle based on new border and canvas size
            // Ensure bottom margin is also relative
            const bottomMargin = canvasHeight * 0.12; // e.g., 12% of height for bottom area
            screenRect = {
                x: tvBorderWidth,
                y: tvBorderWidth,
                w: canvasWidth - 2 * tvBorderWidth,
                h: canvasHeight - 2 * tvBorderWidth - bottomMargin
            };

            // IMPORTANT: Re-initialize the current channel if its setup
            // depends heavily on screen size (e.g., particle counts, positions)
            const activeChannel = channels.find(ch => ch.number === currentChannel);
            if (activeChannel && typeof activeChannel.init === 'function') {
                console.log("Re-initializing channel", currentChannel, "after resize.");
                activeChannel.init();
            }

            // Optional: Force a redraw immediately after resize
             // Comment this out if the gameLoop handles redraw adequately
             // drawTvFrame(ctx);
             // if (activeChannel) { drawChannelContent(ctx, activeChannel, screenRect); }

            console.log(`Canvas resized to: ${canvas.width}x${canvas.height}`);
             console.log(`Screen rect: x:${screenRect.x.toFixed(1)}, y:${screenRect.y.toFixed(1)}, w:${screenRect.w.toFixed(1)}, h:${screenRect.h.toFixed(1)}`);
        }
    }

    // --- Drawing Functions (Adapt sizes and fonts) ---
    function drawTvFrame(ctx) {
        // Frame Gradient
        const grad = ctx.createLinearGradient(0, 0, canvasWidth, canvasHeight);
        grad.addColorStop(0, '#6b4f34'); // Dark wood
        grad.addColorStop(0.5, '#a07d5c'); // Lighter wood highlight
        grad.addColorStop(1, '#6b4f34'); // Dark wood
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight); // Fill whole canvas

        // Inner Shadow/Bevel for Screen
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'; // Semi-transparent black
        const shadowOffset = Math.max(1, tvBorderWidth * 0.05); // Scale shadow offset
        ctx.fillRect(screenRect.x - shadowOffset, screenRect.y - shadowOffset, screenRect.w + 2 * shadowOffset, screenRect.h + 2 * shadowOffset);

        // Black Screen Background (Fallback)
        ctx.fillStyle = '#050505'; // Very dark grey/off-black
        ctx.fillRect(screenRect.x, screenRect.y, screenRect.w, screenRect.h);
    }

    function drawChannelContent(ctx, channel, rect) {
        ctx.save();
        // Clip to the screen area
        ctx.beginPath();
        ctx.rect(rect.x, rect.y, rect.w, rect.h);
        ctx.clip();

        // Default background inside clipped area (if channel doesn't draw its own)
        ctx.fillStyle = '#050505';
        ctx.fillRect(rect.x, rect.y, rect.w, rect.h);

        // Draw the actual channel content
        if (channel && channel.draw) {
            try { // Add try-catch for safety during refactoring
                 channel.draw(ctx, rect);
             } catch (error) {
                 console.error(`Error drawing channel ${channel.number}:`, error);
                 // Draw fallback error message ON the screen
                 ctx.fillStyle = 'red';
                 const errorFontSize = Math.max(12, rect.h * 0.1);
                 ctx.font = `${errorFontSize}px sans-serif`;
                 ctx.textAlign = 'center';
                 ctx.fillText("DRAW ERROR", rect.x + rect.w / 2, rect.y + rect.h / 2);
             }
        } else {
            // Fallback for missing channel draw function
            ctx.fillStyle = 'red';
             const errorFontSize = Math.max(12, rect.h * 0.1);
            ctx.font = `${errorFontSize}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.fillText("STATIC / OFFLINE", rect.x + rect.w / 2, rect.y + rect.h / 2);
        }

         // --- Channel Info Overlay ---
         const infoBarHeight = Math.max(20, Math.min(35, rect.h * 0.08)); // Scale height
         const infoFontSize = Math.max(10, Math.min(20, infoBarHeight * 0.6)); // Scale font
         const infoText = `Ch ${channel.number}: ${channel.name}`;

         // Semi-transparent background for info bar
         ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
         ctx.fillRect(rect.x, rect.y, rect.w, infoBarHeight); // Draw bar at the top

         // Text
         ctx.fillStyle = '#FFFFFF';
         ctx.font = `bold ${infoFontSize}px sans-serif`;
         ctx.textAlign = 'left';
         ctx.textBaseline = 'middle'; // Align text vertically better
         ctx.fillText(infoText, rect.x + Math.max(5, rect.w * 0.02), rect.y + infoBarHeight / 2); // Add padding

        ctx.restore(); // Remove clipping mask
    }


    // --- Animation Loop ---
    function gameLoop() {
        frameCount++;
        // It's generally better to resize check *before* drawing
        // resizeCanvas(); // Check if size changed (might be slightly inefficient here)

        // Clear canvas (optional if drawTvFrame covers everything)
        // ctx.clearRect(0, 0, canvasWidth, canvasHeight);

        drawTvFrame(ctx);

        const activeChannel = channels.find(ch => ch.number === currentChannel);

        if (activeChannel) {
            drawChannelContent(ctx, activeChannel, screenRect);
        } else {
            // Draw Invalid Channel screen (make it relative too)
            const invalidChannelData = {
                number: '??', name:'INVALID CHANNEL',
                draw: (ctx, rect) => {
                    ctx.fillStyle = '#333'; ctx.fillRect(rect.x, rect.y, rect.w, rect.h); // Dark grey BG
                    ctx.fillStyle = 'white';
                    // Static effect - adjust density/size based on screen size
                    const staticDotSize = Math.max(1, canvasWidth * 0.003);
                    const staticDensity = 0.5; // Keep density constant?
                    for(let i=0; i < rect.h; i += staticDotSize * 2) {
                        for(let j=0; j < rect.w; j += staticDotSize * 2) {
                            if(Math.random() > staticDensity) {
                                ctx.fillRect(rect.x + j + Math.random()*staticDotSize, rect.y + i + Math.random()*staticDotSize, staticDotSize, staticDotSize);
                            }
                        }
                    }
                     // Text - Scale font
                    const errorFontSize = Math.max(14, rect.h * 0.1);
                    ctx.fillStyle = 'red';
                    ctx.font = `${errorFontSize}px monospace`;
                    ctx.textAlign = 'center';
                    ctx.fillText("INVALID CHANNEL", rect.x + rect.w/2, rect.y + rect.h/2);
                }
            };
            drawChannelContent(ctx, invalidChannelData, screenRect);
        }
         ctx.textAlign = 'left'; // Reset alignment just in case

        requestAnimationFrame(gameLoop);
    }

    // --- Interaction ---
    function changeChannel(newChannelNumber) {
        const num = parseInt(newChannelNumber, 10);
        if (!isNaN(num) && num >= 0 && num <= 9) {
            if (currentChannel !== num) {
                currentChannel = num;
                console.log("Changing to Channel:", currentChannel);
                const activeChannel = channels.find(ch => ch.number === currentChannel);
                // Initialize the new channel (important for resetting animations)
                if (activeChannel && typeof activeChannel.init === 'function') {
                    activeChannel.init();
                }
                // Optional: Redraw immediately on change? Usually gameLoop handles it fast enough.
            }
        }
    }

    window.addEventListener('keydown', (e) => {
        if (e.key >= '0' && e.key <= '9') {
            changeChannel(e.key);
        }
    });

    const remote = document.getElementById('remote');
    if (remote) { // Check if remote exists
        remote.addEventListener('click', (e) => {
             // Use currentTarget to ensure listener is on the remote div
             // Check if the clicked element is a button with the correct class/attribute
            if (e.target && e.target.matches('.remote-button[data-channel]')) {
                const channelNum = e.target.getAttribute('data-channel');
                changeChannel(channelNum);
            }
        });
    } else {
        console.warn("Remote control element not found.");
    }

    // --- Debounce function for resize ---
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // --- Initialisation ---
    // Add resize listener
    window.addEventListener('resize', debounce(resizeCanvas, 150)); // Debounce resize events

    // Initial resize to set dimensions correctly
    resizeCanvas();

    // Initialize the starting channel
    const initialChannel = channels.find(ch => ch.number === currentChannel);
    if (initialChannel && typeof initialChannel.init === 'function') {
        initialChannel.init();
    }

    // Start the animation loop
    requestAnimationFrame(gameLoop);
};