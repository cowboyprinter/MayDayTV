window.onload = () => {
    const canvas = document.getElementById('tvCanvas');
    const ctx = canvas.getContext('2d');
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    // --- Configuration ---
    const tvBorderWidth = 50;
    const screenRect = {
        x: tvBorderWidth,
        y: tvBorderWidth,
        w: canvasWidth - 2 * tvBorderWidth,
        h: canvasHeight - 2 * tvBorderWidth - 100
    };

    let currentChannel = 0;
    let frameCount = 0;

    // --- Animation State Variables ---
    let newsScrollX = screenRect.w;
    let dandelionSeeds = [];
    let maypoleAngle = 0;
    let weatherElements = { rain: [], lightning: 0, clouds: [] };
    let stars = [];
    let channel2Clouds = [];

    // --- Cloud Helper Function & Variables ---
    const cloudParts = [ { dx: 0, dy: 0, r: 50 }, { dx: -40, dy: 0, r: 35 }, { dx: 40, dy: -5, r: 40 }, { dx: 10, dy: -25, r: 30 }, { dx: -20, dy: 15, r: 25 } ];
    function drawCloud(ctx, cloud, baseX, baseY, color = '#FFFFFF') { ctx.save(); ctx.fillStyle = color; cloudParts.forEach(part => { ctx.beginPath(); const centerX = baseX + cloud.x + part.dx * cloud.scale; const centerY = baseY + cloud.y + part.dy * cloud.scale; const radius = part.r * cloud.scale; ctx.arc(centerX, centerY, radius, 0, Math.PI * 2); ctx.fill(); }); ctx.restore(); }
    function updateCloud(cloud, rectW, cloudWidthEstimate) { cloud.x += cloud.speed; if (cloud.x - cloudWidthEstimate * cloud.scale > rectW) { cloud.x = -cloudWidthEstimate * cloud.scale * 1.5; } }
    const baseCloudWidth = Math.max(...cloudParts.map(p => p.dx + p.r)) - Math.min(...cloudParts.map(p => p.dx - p.r));

    // --- Clover Newscaster Helper Function ---
    function drawCloverNewscaster(ctx, baseX, baseY, size) { const leafRadius = size * 0.4; const centerOffset = size * 0.25; const stemWidth = size * 0.15; const stemHeight = size * 0.5; const eyeRadius = size * 0.08; const pupilRadius = size * 0.04; const paperWidth = size * 0.8; const paperHeight = size * 0.6; ctx.save(); ctx.translate(baseX, baseY); ctx.fillStyle = '#2E8B57'; ctx.fillRect(-stemWidth / 2, 0, stemWidth, stemHeight); const leafPositions = [ { x: -centerOffset, y: -centerOffset }, { x: centerOffset, y: -centerOffset }, { x: -centerOffset, y: centerOffset }, { x: centerOffset, y: centerOffset } ]; ctx.fillStyle = '#3CB371'; leafPositions.forEach(pos => { ctx.beginPath(); ctx.arc(pos.x, pos.y, leafRadius, 0, Math.PI * 2); ctx.fill(); }); const paperX = -paperWidth / 2; const paperY = size * 0.2; ctx.fillStyle = '#FFFFFF'; ctx.fillRect(paperX, paperY, paperWidth, paperHeight); ctx.strokeStyle = '#AAAAAA'; ctx.lineWidth = 1; ctx.strokeRect(paperX, paperY, paperWidth, paperHeight); ctx.strokeStyle = '#CCCCCC'; for (let i = 1; i < 4; i++) { ctx.beginPath(); ctx.moveTo(paperX + 5, paperY + (paperHeight / 4) * i); ctx.lineTo(paperX + paperWidth - 5, paperY + (paperHeight / 4) * i); ctx.stroke(); } const eyeY = -centerOffset * 1.2; const eyeSpacing = size * 0.2; ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.arc(-eyeSpacing, eyeY, eyeRadius, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#000000'; ctx.beginPath(); ctx.arc(-eyeSpacing, eyeY, pupilRadius, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.arc(eyeSpacing, eyeY, eyeRadius, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#000000'; ctx.beginPath(); ctx.arc(eyeSpacing, eyeY, pupilRadius, 0, Math.PI * 2); ctx.fill(); const mouthY = -centerOffset * 0.5; const mouthWidth = size * 0.2; ctx.strokeStyle = '#000000'; ctx.lineWidth = Math.max(1, size * 0.03); ctx.beginPath(); ctx.arc(0, mouthY, mouthWidth, 0.2 * Math.PI, 0.8 * Math.PI); ctx.stroke(); ctx.restore(); }

    // --- Bonfire Helper Function ---
    function drawBonfire(ctx, rect, centerX, baseScreenY, baseWidth, heightFactor, particleCount) { const bottomY = rect.y + baseScreenY; ctx.fillStyle = '#4a2511'; ctx.fillRect(centerX - baseWidth / 2, bottomY, baseWidth, 15); ctx.fillStyle = '#2a1501'; ctx.fillRect(centerX - baseWidth / 2.5, bottomY + 5, baseWidth / 1.25, 10); for (let i = 0; i < particleCount; i++) { const life = Math.random(); const size = (1 - life) * (baseWidth * 0.15) + 2; const particleX = centerX + (Math.random() - 0.5) * baseWidth * (1 - life * 0.5); const particleY = bottomY - life * (rect.h * heightFactor); const opacity = Math.sin(life * Math.PI); if (Math.random() > 0.35) { ctx.fillStyle = `rgba(255, ${100 + Math.random() * 120}, 0, ${opacity * 0.8})`; } else { ctx.fillStyle = `rgba(200 + Math.random()*55, 0, 0, ${opacity * 0.6})`; } ctx.beginPath(); ctx.arc(particleX, particleY, size / 2, 0, Math.PI * 2); ctx.fill(); } }

    // --- Smoke Helper Function ---
    function drawSmoke(ctx, rect) {
        const numWaves = 6; // User tweaked value
        const smokeHeight = rect.h * 0.6;
        const startY = rect.y + rect.h * 0.19; // User tweaked value
        const waveThickness = 120; // User tweaked value

        ctx.save();
        const smokeGradient = ctx.createLinearGradient(rect.x, startY, rect.x, startY + smokeHeight);
        smokeGradient.addColorStop(0, 'rgba(139, 69, 19, 0.0)');   // Transparent SaddleBrown at top
        smokeGradient.addColorStop(0.3, 'rgba(160, 82, 45, 0.3)'); // Semi-transparent Sienna
        smokeGradient.addColorStop(0.7, 'rgba(210, 105, 30, 0.4)');// Semi-transparent Chocolate
        smokeGradient.addColorStop(1, 'rgba(255, 140, 0, 0.1)');  // Faint DarkOrange near bottom
        ctx.fillStyle = smokeGradient;
        ctx.globalAlpha = 0.35;

        for (let i = 0; i < numWaves; i++) {
            const amplitude = (Math.random() * 15 + 10) * (1 + i * 0.2);
            const frequency = (Math.random() * 0.005 + 0.005);
            const speed = frameCount * (0.005 + Math.random() * 0.0003) + i * Math.PI; // User tweaked value
            const baseY = startY + (smokeHeight / numWaves) * i + Math.sin(frameCount * 0.01 + i) * 15; // User tweaked value
            ctx.beginPath();
            let startWaveY = baseY + Math.sin(speed) * amplitude;
            ctx.moveTo(rect.x, startWaveY);
            // User tweaked loop increments
            for (let x = rect.x + 10; x <= rect.x + rect.w; x += 5) { let y = baseY + Math.sin(x * frequency + speed) * amplitude; ctx.lineTo(x, y); }
            let endWaveY = baseY + Math.sin((rect.x + rect.w) * frequency + speed) * amplitude;
            ctx.lineTo(rect.x + rect.w, endWaveY + waveThickness);
             // User tweaked loop increments
            for (let x = rect.x + rect.w; x >= rect.x; x -= 1) { let y = baseY + Math.sin(x * frequency + speed) * amplitude; ctx.lineTo(x, y + waveThickness); }
            ctx.lineTo(rect.x, startWaveY + waveThickness);
            ctx.closePath();
            ctx.fill();
        }
        ctx.restore();
    }

     // --- NEW Law Icons Helper Functions (Copied from previous correct version) ---
     function drawScalesOfJustice(ctx, centerX, centerY, size) {
        const beamWidth = size; const beamHeight = size * 0.08; const standHeight = size * 0.9; const standWidth = size * 0.1; const baseWidth = size * 0.4; const baseHeight = size * 0.1; const armLength = size * 0.5; const panRadiusX = size * 0.25; const panRadiusY = size * 0.15; const chainLength = size * 0.1;
        ctx.save(); ctx.translate(centerX, centerY - standHeight / 2);
        const metalColor = '#DAA520'; const shadowColor = '#B8860B';
        ctx.strokeStyle = shadowColor; ctx.fillStyle = metalColor; ctx.lineWidth = 3;
        ctx.fillRect(-baseWidth / 2, standHeight / 2 - baseHeight, baseWidth, baseHeight); ctx.strokeRect(-baseWidth / 2, standHeight / 2 - baseHeight, baseWidth, baseHeight); // Base
        ctx.fillRect(-standWidth / 2, -standHeight / 2, standWidth, standHeight); ctx.strokeRect(-standWidth / 2, -standHeight / 2, standWidth, standHeight); // Stand
        ctx.beginPath(); ctx.arc(0, -standHeight / 2, beamHeight, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); // Pivot
        ctx.fillRect(-beamWidth / 2, -standHeight / 2 - beamHeight / 2, beamWidth, beamHeight); ctx.strokeRect(-beamWidth / 2, -standHeight / 2 - beamHeight / 2, beamWidth, beamHeight); // Beam
        // Left Pan
        const leftArmX = -beamWidth / 2 * 0.85; const armTopY = -standHeight / 2;
        ctx.beginPath(); ctx.moveTo(leftArmX, armTopY); ctx.lineTo(leftArmX, armTopY + armLength); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(leftArmX - panRadiusX * 0.5, armTopY + armLength); ctx.lineTo(leftArmX, armTopY + armLength - chainLength); ctx.moveTo(leftArmX + panRadiusX * 0.5, armTopY + armLength); ctx.lineTo(leftArmX, armTopY + armLength - chainLength); ctx.stroke();
        ctx.beginPath(); ctx.ellipse(leftArmX, armTopY + armLength, panRadiusX, panRadiusY, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        // Right Pan
        const rightArmX = beamWidth / 2 * 0.85;
        ctx.beginPath(); ctx.moveTo(rightArmX, armTopY); ctx.lineTo(rightArmX, armTopY + armLength); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(rightArmX - panRadiusX * 0.5, armTopY + armLength); ctx.lineTo(rightArmX, armTopY + armLength - chainLength); ctx.moveTo(rightArmX + panRadiusX * 0.5, armTopY + armLength); ctx.lineTo(rightArmX, armTopY + armLength - chainLength); ctx.stroke();
        ctx.beginPath(); ctx.ellipse(rightArmX, armTopY + armLength, panRadiusX, panRadiusY, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.restore();
    }

    function drawBookStack(ctx, centerX, centerY, size) {
        const bookHeight = size * 0.18; const numBooks = 3; const totalStackHeight = bookHeight * numBooks; const baseBookWidth = size;
        ctx.save(); ctx.translate(centerX, centerY + totalStackHeight / 2);
        const colors = ['#8B4513', '#A0522D', '#5F4034']; const pageColor = '#F5F5DC'; const lineWidth = 2;
        for (let i = 0; i < numBooks; i++) {
            const bookWidth = baseBookWidth * (1 - i * 0.1); const bookY = - (i + 1) * bookHeight; const offsetX = (Math.random() - 0.5) * size * 0.05;
            ctx.fillStyle = colors[i % colors.length]; ctx.fillRect(offsetX - bookWidth / 2, bookY, bookWidth, bookHeight); // Cover
            ctx.fillStyle = pageColor; ctx.fillRect(offsetX - bookWidth / 2 + lineWidth * 2, bookY + lineWidth, bookWidth - lineWidth * 4, bookHeight - lineWidth * 2); // Pages
            ctx.strokeStyle = '#333333'; ctx.lineWidth = lineWidth; ctx.strokeRect(offsetX - bookWidth / 2, bookY, bookWidth, bookHeight); // Outline
            ctx.beginPath(); ctx.moveTo(offsetX - bookWidth / 2 + lineWidth * 1.5, bookY); ctx.lineTo(offsetX - bookWidth / 2 + lineWidth * 1.5, bookY + bookHeight); ctx.stroke(); // Spine
        }
        ctx.restore();
    }


    // --- Channel Definitions ---
    const channels = [
        { // Channel 0 - Clover News (User's long text)
            number: 0,
            name: "MAYDAY NEWS NOW",
            init: ()=>{ newsScrollX = screenRect.w + 100; },
            draw: (ctx, rect)=>{
                ctx.fillStyle = '#3d9970'; ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
                const cloverSize = 80; const cloverX = rect.x + cloverSize * 0.8; const cloverY = rect.y + rect.h - cloverSize * 1.3 - 40;
                drawCloverNewscaster(ctx, cloverX, cloverY, cloverSize);
                // User's very long news text
                const newsText = "TRUMP THREATENS WITCHES BUT MAY DAY CELEBRATIONS STILL UNDERWAY, +++ PAGANS BOAST: MORE GODS -  MORE HOLIDAYS +++ LOCAL MAYPOLE RAISING AT NOON,... OR ARE YOU JUST HAPPY TO SEE ME? +++ CLOVER REPORTS HIGH POLLEN COUNT...NO JOGGING ADVISORY TODAY - YOUR NOSE WILL BE RUNNING MORE THAN YOU +++ BELTANE BONFIRE AND OUTDOOR SEX SAFETY TIPS +++ TOP FIVE REASONS TO DATE A PAGAN GIRL: SHE WORSHIPS THE GROUND YOU WALK ON...ORIGINAL WHAT???...BEING INVITED TO CHURCH IS AWESOME...When she says THE HORNED GOD COMES! she MEANS IT!!!...THREE WORDS: beltane, Beltane, BELTANE!...JOKES STOLEN FROM ANGELFIRE.COM +++";
                const tickerHeight = 40; const textY = rect.y + rect.h - 15;
                ctx.fillStyle = 'rgba(0, 0, 0, 0.4)'; ctx.fillRect(rect.x, rect.y + rect.h - tickerHeight, rect.w, tickerHeight);
                ctx.fillStyle = '#FFFFFF'; ctx.font = 'bold 24px sans-serif'; const textWidth = ctx.measureText(newsText).width;
                ctx.save(); ctx.beginPath(); ctx.rect(rect.x, rect.y + rect.h - tickerHeight, rect.w, tickerHeight); ctx.clip(); ctx.fillText(newsText, rect.x + newsScrollX, textY); ctx.restore();
                newsScrollX -= 2; if (newsScrollX < -textWidth) { newsScrollX = rect.w; }
        }},
        { // Channel 1 - Rituals
            number: 1, name: "Ancient Rituals Today", init: ()=>{}, draw: (ctx, rect)=>{
                ctx.fillStyle = '#8a8a8a'; ctx.fillRect(rect.x, rect.y, rect.w, rect.h); ctx.fillStyle = '#6a6a6a';
                for(let i=0;i<50;i++){ctx.fillRect(rect.x+Math.random()*rect.w,rect.y+Math.random()*rect.h,22,2);}
                ctx.fillStyle = '#e0d6b3'; ctx.font = 'italic 54px serif'; ctx.textAlign = 'center';
                ctx.fillText("The Meaning of Beltane Fires", rect.x + rect.w / 2, rect.y + rect.h / 2);
                ctx.font = '24px serif'; ctx.fillText("Exploring ancient pagan traditions...", rect.x + rect.w / 2, rect.y + rect.h / 2 + 40);
                ctx.textAlign = 'left';
        }},
        { // Channel 2 - Kids
            number: 2, name: "Outdoor Playhouse Pals", init: ()=>{
                dandelionSeeds = [];
                for(let i = 0; i < 50; i++) { dandelionSeeds.push({ x: Math.random() * screenRect.w, y: Math.random() * screenRect.h, size: Math.random() * 3 + 1, speedX: Math.random() * 1 - 0.5, speedY: Math.random() * 0.5 + 0.2, opacity: Math.random() * 0.5 + 0.3 }); }
                channel2Clouds = []; const skyHeight = screenRect.h * 0.7; const numClouds = 5;
                for (let i = 0; i < numClouds; i++) { const scale = Math.random() * 0.3 + 0.3; channel2Clouds.push({ x: Math.random() * (screenRect.w + baseCloudWidth * scale) - baseCloudWidth * scale, y: Math.random() * (skyHeight * 0.8) + skyHeight * 0.1, speed: Math.random() * 0.8 + 0.2, scale: scale }); }
                channel2Clouds.sort((a, b) => a.scale - b.scale);
            }, draw: (ctx, rect)=>{
                ctx.fillStyle = '#87CEEB'; ctx.fillRect(rect.x, rect.y, rect.w, rect.h * 0.7);
                ctx.fillStyle = '#90EE90'; ctx.fillRect(rect.x, rect.y + rect.h * 0.7, rect.w, rect.h * 0.3);
                channel2Clouds.forEach(cloud => { updateCloud(cloud, rect.w, baseCloudWidth); drawCloud(ctx, cloud, rect.x, rect.y, '#FFFFFF'); });
                dandelionSeeds.forEach(seed => {
                    ctx.fillStyle = `rgba(255, 255, 255, ${seed.opacity})`; ctx.beginPath(); ctx.arc(rect.x + seed.x, rect.y + seed.y, seed.size, 0, Math.PI * 2); ctx.fill();
                    seed.x += seed.speedX; seed.y += seed.speedY;
                    if (seed.y > rect.h || seed.x < 0 || seed.x > rect.w) { seed.y = -10; seed.x = Math.random() * rect.w; seed.opacity = Math.random() * 0.5 + 0.3; }
                });
        }},
        { // Channel 3 - Movie (User's large text)
            number: 3, name: "Movie: May Queen & Beltane Beast", init: () => {}, draw: (ctx, rect) => {
                ctx.fillStyle = '#1a0500'; ctx.fillRect(rect.x, rect.y, rect.w, rect.h); // BG
                drawSmoke(ctx, rect); // Smoke
                drawBonfire(ctx, rect, rect.x + rect.w / 2, rect.h - 30, 150, 0.65, 50); // Center Bonfire
                drawBonfire(ctx, rect, rect.x + rect.w * 0.25, rect.h - 25, 80, 0.45, 30); // Left Bonfire
                drawBonfire(ctx, rect, rect.x + rect.w * 0.75, rect.h - 35, 110, 0.75, 40); // Right Bonfire
                // User's large title text
                ctx.fillStyle = '#FFD700'; ctx.font = 'bold 60px fantasy'; ctx.textAlign = 'center';
                ctx.shadowColor = 'black'; ctx.shadowBlur = 5;
                ctx.fillText("May Queen & Beltane Beast", rect.x + rect.w / 2, rect.y + 160); // User's Y pos
                ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0;
                ctx.textAlign = 'left';
            }
        },
        { // Channel 4 - Maypole
            number: 4, name: "Maypole Dance Off!", init: ()=>{ maypoleAngle = 0; }, draw: (ctx, rect)=>{
                ctx.fillStyle = '#f0e68c'; ctx.fillRect(rect.x, rect.y, rect.w, rect.h); const poleX = rect.x + rect.w / 2; const poleTopY = rect.y + 50; const poleBottomY = rect.y + rect.h - 50; const poleWidth = 20; ctx.fillStyle = '#8B4513'; ctx.fillRect(poleX - poleWidth / 2, poleTopY, poleWidth, poleBottomY - poleTopY); const ribbonColors = ['#FF69B4', '#00BFFF', '#32CD32', '#FFD700', '#FF4500', '#9370DB']; const numRibbons = 6; const ribbonLength = rect.w * 0.4; const ribbonAmplitude = 30; maypoleAngle += 0.02; for(let i = 0; i < numRibbons; i++) { const angleOffset = (Math.PI * 2 / numRibbons) * i; const currentAngle = maypoleAngle + angleOffset; const endX = poleX + Math.cos(currentAngle) * ribbonLength; const endY = poleTopY + ribbonLength * 0.8; ctx.beginPath(); ctx.moveTo(poleX, poleTopY); const controlX = poleX + Math.cos(currentAngle + Math.PI / 2) * ribbonAmplitude * Math.sin(maypoleAngle * 2); const controlY = poleTopY + (endY - poleTopY) / 2; ctx.quadraticCurveTo(controlX, controlY, endX, endY); ctx.strokeStyle = ribbonColors[i % ribbonColors.length]; ctx.lineWidth = 5; ctx.stroke(); } ctx.lineWidth = 1;
        }},
        { // Channel 5 - Secrets of Law Day (Corrected version with Icons)
            number: 5,
            name: "Secrets of Law Day",
             init: () => {}, // No specific init needed
            draw: (ctx, rect) => {
                // 1. Parchment Background
                ctx.fillStyle = '#f5f5dc'; // Beige
                ctx.fillRect(rect.x, rect.y, rect.w, rect.h);

                 // 2. Simple Ivy Vine Border (Keep the animation)
                ctx.strokeStyle = '#228B22'; // Forest Green
                ctx.lineWidth = 3;
                const vineAmplitude = 10; const vineFrequency = 0.05;
                const wiggle = (pos, offset) => vineAmplitude * Math.sin(pos * vineFrequency + frameCount * 0.05 + offset);
                ctx.beginPath(); ctx.moveTo(rect.x, rect.y + wiggle(rect.x, 0)); for(let x = rect.x; x <= rect.x + rect.w; x+=5) ctx.lineTo(x, rect.y + wiggle(x, 0)); ctx.stroke(); // Top
                ctx.beginPath(); ctx.moveTo(rect.x, rect.y + rect.h + wiggle(rect.x, Math.PI)); for(let x = rect.x; x <= rect.x + rect.w; x+=5) ctx.lineTo(x, rect.y + rect.h + wiggle(x, Math.PI)); ctx.stroke(); // Bottom
                ctx.beginPath(); ctx.moveTo(rect.x + wiggle(rect.y, Math.PI/2), rect.y); for(let y = rect.y; y <= rect.y + rect.h; y+=5) ctx.lineTo(rect.x + wiggle(y, Math.PI/2), y); ctx.stroke(); // Left
                 ctx.beginPath(); ctx.moveTo(rect.x + rect.w + wiggle(rect.y, 3*Math.PI/2), rect.y); for(let y = rect.y; y <= rect.y + rect.h; y+=5) ctx.lineTo(rect.x + rect.w + wiggle(y, 3*Math.PI/2), y); ctx.stroke(); // Right
                 ctx.lineWidth = 1; // Reset

                 // 3. Draw Law Icons
                 const iconSize = Math.min(rect.w, rect.h) * 0.4; // Size relative to screen dimensions
                 const iconCenterX = rect.x + rect.w / 2;
                 const iconCenterY = rect.y + rect.h / 2;
                 const iconSpacing = rect.w * 0.22; // Space between icons

                 drawScalesOfJustice(ctx, iconCenterX - iconSpacing, iconCenterY, iconSize * 0.8); // Scales slightly smaller
                 drawBookStack(ctx, iconCenterX + iconSpacing, iconCenterY + iconSize * 0.1, iconSize * 0.7); // Books slightly smaller and lower

                 // 4. Optional: Add a simple title above icons
                 ctx.fillStyle = '#5a4500'; // Dark brown text
                 ctx.font = 'bold 24px serif';
                 ctx.textAlign = 'center';
                 ctx.fillText("Law Day is NOT May Day. But it is.", iconCenterX, rect.y + 60);
                 ctx.textAlign = 'left'; // Reset alignment
            }
        },
        { // Channel 6 - Shopping
            number: 6, name: "Spring Jubilee Shopping", init: ()=>{}, draw: (ctx, rect)=>{
                ctx.fillStyle = '#FFB6C1'; ctx.fillRect(rect.x, rect.y, rect.w, rect.h); const itemWidth = 100; const itemHeight = 80; const itemY = rect.y + rect.h / 2 - itemHeight / 2; const speed = 1.5; const item1X = rect.x + (frameCount * speed) % (rect.w + itemWidth * 2) - itemWidth * 1.5; if (item1X > rect.x - itemWidth && item1X < rect.x + rect.w) { ctx.fillStyle = '#8B4513'; ctx.fillRect(item1X, itemY + itemHeight * 0.4, itemWidth, itemHeight * 0.6); ctx.fillStyle = '#FF69B4'; ctx.beginPath(); ctx.arc(item1X + itemWidth*0.3, itemY + itemHeight*0.3, itemWidth*0.2, 0, Math.PI*2); ctx.fill(); ctx.fillStyle = '#FFFF00'; ctx.beginPath(); ctx.arc(item1X + itemWidth*0.7, itemY + itemHeight*0.3, itemWidth*0.2, 0, Math.PI*2); ctx.fill(); ctx.fillStyle = '#90EE90'; ctx.beginPath(); ctx.arc(item1X + itemWidth*0.5, itemY + itemHeight*0.5, itemWidth*0.15, 0, Math.PI*2); ctx.fill(); } const item2X = rect.x + (frameCount * speed + rect.w / 2) % (rect.w + itemWidth * 2) - itemWidth * 1.5; if (item2X > rect.x - itemWidth && item2X < rect.x + rect.w) { ctx.fillStyle = '#D2B48C'; ctx.fillRect(item2X + itemWidth/2 - 5, itemY, 10, itemHeight); ctx.strokeStyle = '#FF0000'; ctx.beginPath(); ctx.moveTo(item2X + itemWidth/2, itemY+10); ctx.lineTo(item2X + 10, itemY + itemHeight-10); ctx.stroke(); ctx.strokeStyle = '#0000FF'; ctx.beginPath(); ctx.moveTo(item2X + itemWidth/2, itemY+10); ctx.lineTo(item2X + itemWidth-10, itemY + itemHeight-10); ctx.stroke(); } ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'; ctx.fillRect(rect.x, rect.y + rect.h - 60, rect.w, 40); ctx.fillStyle = '#FFFFFF'; ctx.font = 'bold 24px sans-serif'; ctx.textAlign = 'center'; ctx.fillText("MAY DAY SALE! Flower Baskets $19.99!", rect.x + rect.w / 2, rect.y + rect.h - 30); ctx.textAlign = 'left';
        }},
        { // Channel 7 - Labor Day
            number: 7, name: "Int'l Labor Day Focus", init: ()=>{}, draw: (ctx, rect)=>{
                ctx.fillStyle = '#4682B4'; ctx.fillRect(rect.x, rect.y, rect.w, rect.h); const globeRadius = Math.min(rect.w, rect.h) * 0.2; const globeX = rect.x + rect.w / 2; const globeY = rect.y + rect.h / 2 - 30; ctx.fillStyle = '#5F9EA0'; ctx.beginPath(); ctx.arc(globeX, globeY, globeRadius, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#90EE90'; ctx.beginPath(); ctx.ellipse(globeX - globeRadius * 0.3, globeY - globeRadius * 0.2, globeRadius * 0.4, globeRadius * 0.3, Math.PI / 4, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.ellipse(globeX + globeRadius * 0.4, globeY + globeRadius * 0.3, globeRadius * 0.5, globeRadius * 0.25, -Math.PI / 6, 0, Math.PI * 2); ctx.fill(); const pulseFactor = (Math.sin(frameCount * 0.05) + 1) / 2; ctx.strokeStyle = `rgba(255, 255, 255, ${pulseFactor * 0.8})`; ctx.lineWidth = 3 + pulseFactor * 3; ctx.beginPath(); ctx.arc(globeX, globeY, globeRadius + 10 + pulseFactor * 10, 0, Math.PI * 2); ctx.stroke(); ctx.lineWidth = 1; ctx.fillStyle = '#FFFFFF'; ctx.font = 'bold 26px sans-serif'; ctx.textAlign = 'center'; ctx.fillText("International Workers' Day", rect.x + rect.w / 2, rect.y + 50); ctx.font = '20px sans-serif'; ctx.fillText("A Global Perspective on Labor Rights", rect.x + rect.w / 2, rect.y + rect.h - 40); ctx.textAlign = 'left';
        }},
        { // Channel 8 - Weather
            number: 8, name: "Crazy Spring Weather", init: ()=>{
                weatherElements.rain = []; weatherElements.lightning = 0; weatherElements.clouds = [];
                for (let i = 0; i < 100; i++) { weatherElements.rain.push({ x: Math.random() * screenRect.w, y: Math.random() * screenRect.h, length: Math.random() * 10 + 5, speed: Math.random() * 4 + 2 }); }
                const numClouds = 7;
                for (let i = 0; i < numClouds; i++) { const scale = Math.random() * 0.4 + 0.5; weatherElements.clouds.push({ x: Math.random() * (screenRect.w + baseCloudWidth * scale) - baseCloudWidth * scale, y: Math.random() * (screenRect.h * 0.6), speed: Math.random() * 1.5 + 0.5, scale: scale }); }
                weatherElements.clouds.sort((a, b) => a.scale - b.scale);
            }, draw: (ctx, rect)=>{
                ctx.fillStyle = '#778899'; ctx.fillRect(rect.x, rect.y, rect.w, rect.h); // BG
                weatherElements.clouds.forEach(cloud => { updateCloud(cloud, rect.w, baseCloudWidth); drawCloud(ctx, cloud, rect.x, rect.y, '#d3d3d3'); }); // Clouds
                ctx.strokeStyle = '#ADD8E6'; ctx.lineWidth = 1.5; // Rain
                weatherElements.rain.forEach(drop => { ctx.beginPath(); ctx.moveTo(rect.x + drop.x, rect.y + drop.y); ctx.lineTo(rect.x + drop.x, rect.y + drop.y + drop.length); ctx.stroke(); drop.y += drop.speed; if (drop.y > rect.h) { drop.y = -drop.length; drop.x = Math.random() * rect.w; } }); ctx.lineWidth = 1;
                 if (weatherElements.lightning > 0) { ctx.fillStyle = `rgba(255, 255, 220, ${weatherElements.lightning / 5 * 0.8})`; ctx.fillRect(rect.x, rect.y, rect.w, rect.h); weatherElements.lightning--; } else if (Math.random() < 0.015) { weatherElements.lightning = 5; } // Lightning
        }},
        { // Channel 9 - Celestial (User's name change)
            number: 9, name: "Celestial Spring Watch (..wait for it...)", init: ()=>{
                stars = []; for (let i = 0; i < 150; i++) { stars.push({ x: Math.random() * screenRect.w, y: Math.random() * screenRect.h, size: Math.random() * 1.5 + 0.5, opacity: Math.random() * 0.5 + 0.3, blinkSpeed: Math.random() * 0.05 + 0.01 }); }
            }, draw: (ctx, rect)=>{
                const gradient = ctx.createLinearGradient(rect.x, rect.y, rect.x, rect.y + rect.h); gradient.addColorStop(0, '#000033'); gradient.addColorStop(1, '#1a1a4a'); ctx.fillStyle = gradient; ctx.fillRect(rect.x, rect.y, rect.w, rect.h); // BG
                stars.forEach(star => { const currentOpacity = star.opacity * ( (Math.sin(frameCount * star.blinkSpeed) + 1) / 2 * 0.7 + 0.3 ); ctx.fillStyle = `rgba(255, 255, 255, ${currentOpacity})`; ctx.beginPath(); ctx.arc(rect.x + star.x, rect.y + star.y, star.size, 0, Math.PI * 2); ctx.fill(); }); // Stars
                const moonRadius = 30; const orbitRadius = rect.w * 0.6; const arcSpeed = 0.003; const moonAngle = -Math.PI / 4 + (frameCount * arcSpeed) % (Math.PI * 1.5); const moonX = rect.x + rect.w / 2 + Math.cos(moonAngle) * orbitRadius; const moonY = rect.y + rect.h * 0.7 - Math.sin(moonAngle) * rect.h * 0.6;
                 if (moonX > rect.x && moonX < rect.x + rect.w && moonY > rect.y && moonY < rect.y + rect.h) { ctx.fillStyle = '#f0f0e0'; ctx.beginPath(); ctx.arc(moonX, moonY, moonRadius, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = 'rgba(0,0,0,0.1)'; ctx.beginPath(); ctx.arc(moonX - 10, moonY - 5, 5, 0, Math.PI*2); ctx.fill(); ctx.beginPath(); ctx.arc(moonX + 8, moonY + 8, 8, 0, Math.PI*2); ctx.fill(); } // Moon
        }},
    ];

    // --- Drawing Functions ---
    function drawTvFrame(ctx) { const grad = ctx.createLinearGradient(0, 0, canvasWidth, canvasHeight); grad.addColorStop(0, '#6b4f34'); grad.addColorStop(0.5, '#a07d5c'); grad.addColorStop(1, '#6b4f34'); ctx.fillStyle = grad; ctx.fillRect(0, 0, canvasWidth, canvasHeight); ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'; ctx.fillRect(screenRect.x - 5, screenRect.y - 5, screenRect.w + 10, screenRect.h + 10); ctx.fillStyle = '#050505'; ctx.fillRect(screenRect.x, screenRect.y, screenRect.w, screenRect.h); }
    function drawChannelContent(ctx, channel, rect) { ctx.save(); ctx.beginPath(); ctx.rect(rect.x, rect.y, rect.w, rect.h); ctx.clip(); ctx.fillStyle = '#050505'; ctx.fillRect(rect.x, rect.y, rect.w, rect.h); if (channel && channel.draw) { channel.draw(ctx, rect); } else { /* Error fallback */ ctx.fillStyle = 'red'; ctx.font = '30px sans-serif'; ctx.textAlign = 'center'; ctx.fillText("STATIC / OFFLINE", rect.x + rect.w / 2, rect.y + rect.h / 2); ctx.textAlign = 'left'; } const channelInfoText = `Ch ${channel.number}: ${channel.name}`; ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'; ctx.fillRect(rect.x, rect.y, rect.w, 35); ctx.fillStyle = '#FFFFFF'; ctx.font = 'bold 20px sans-serif'; ctx.textAlign = 'left'; ctx.fillText(channelInfoText, rect.x + 10, rect.y + 25); ctx.restore(); }

    // --- Animation Loop ---
    function gameLoop() { frameCount++; drawTvFrame(ctx); const activeChannel = channels.find(ch => ch.number === currentChannel); if (activeChannel) { drawChannelContent(ctx, activeChannel, screenRect); } else { /* Invalid channel fallback */ drawChannelContent(ctx, { number: '??', name:'INVALID CHANNEL', draw: (ctx, rect) => { ctx.fillStyle = '#333'; ctx.fillRect(rect.x, rect.y, rect.w, rect.h); ctx.fillStyle = 'white'; ctx.font = '30px monospace'; ctx.textAlign = 'center'; for(let i=0; i<rect.h; i+=4){ for(let j=0; j<rect.w; j+=4) if(Math.random()>0.5) ctx.fillRect(rect.x+j, rect.y+i, 2, 2);} ctx.fillStyle = 'red'; ctx.fillText("INVALID CHANNEL", rect.x+rect.w/2, rect.y+rect.h/2); ctx.textAlign='left'; }}, screenRect); } requestAnimationFrame(gameLoop); }

    // --- Interaction ---
    function changeChannel(newChannelNumber) { const num = parseInt(newChannelNumber, 10); if (!isNaN(num) && num >= 0 && num <= 9) { if (currentChannel !== num) { currentChannel = num; console.log("Changing to Channel:", currentChannel); const activeChannel = channels.find(ch => ch.number === currentChannel); if (activeChannel && typeof activeChannel.init === 'function') { activeChannel.init(); } } } }
    window.addEventListener('keydown', (e) => { if (e.key >= '0' && e.key <= '9') { changeChannel(e.key); } });
    const remote = document.getElementById('remote'); remote.addEventListener('click', (e) => { if (e.target && e.target.classList.contains('remote-button')) { const channelNum = e.target.getAttribute('data-channel'); changeChannel(channelNum); } });

    // --- Initialisation ---
    const initialChannel = channels.find(ch => ch.number === currentChannel);
    if (initialChannel && typeof initialChannel.init === 'function') { initialChannel.init(); }
    requestAnimationFrame(gameLoop);
};