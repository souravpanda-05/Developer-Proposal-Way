/* =========================================================
   NEON HEART PARTICLE PROPOSAL
   MAIN JAVASCRIPT
========================================================= */


/* =========================================================
   DOM ELEMENTS
========================================================= */
const replayBtn = document.getElementById("replayBtn");

const canvas = document.getElementById("particleCanvas");
const ctx = canvas.getContext("2d");

const introScreen = document.getElementById("introScreen");
const heartScreen = document.getElementById("heartScreen");
const proposalScreen = document.getElementById("proposalScreen");
const finalScreen = document.getElementById("finalScreen");

const startBtn = document.getElementById("startBtn");
const continueBtn = document.getElementById("continueBtn");
const yesBtn = document.getElementById("yesBtn");
const noBtn = document.getElementById("noBtn");

const musicBtn = document.getElementById("musicBtn");
const proposalMusic = document.getElementById("proposalMusic");


/* =========================================================
   PARTICLE STATE
   IMPORTANT:
   These MUST be declared before resizeCanvas()
========================================================= */

let particles = [];
let explosionParticles = [];

let currentMode = "free";

let heartFormationStarted = false;
let heartFormationComplete = false;

let heartFormationTime = 0;

let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;

let animationTime = 0;


/* =========================================================
   CANVAS
========================================================= */

let width = window.innerWidth;
let height = window.innerHeight;

let dpr =
    Math.min(
        window.devicePixelRatio || 1,
        2
    );


function resizeCanvas() {

    width = window.innerWidth;
    height = window.innerHeight;

    dpr =
        Math.min(
            window.devicePixelRatio || 1,
            2
        );


    canvas.width =
        width * dpr;

    canvas.height =
        height * dpr;


    canvas.style.width =
        `${width}px`;

    canvas.style.height =
        `${height}px`;


    ctx.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0
    );


    /*
        Only regenerate heart targets
        when particles already exist.
    */

    if (particles.length > 0) {

        generateHeartTargets();
    }
}


window.addEventListener(
    "resize",
    resizeCanvas
);


/*
    Canvas can safely initialize now
    because particles already exists.
*/

resizeCanvas();


/* =========================================================
   PARTICLE COUNT
========================================================= */

function getParticleCount() {

    if (width <= 420) {
        return 170;
    }

    if (width <= 768) {
        return 220;
    }

    return 330;
}


/* =========================================================
   PARTICLE CLASS
========================================================= */

class Particle {

    constructor(index) {

        this.index = index;

        this.x = Math.random() * width;
        this.y = Math.random() * height;

        this.startX = this.x;
        this.startY = this.y;

        this.targetX = this.x;
        this.targetY = this.y;

        this.size =
            Math.random() * 1.8 + 0.7;

        this.baseSize = this.size;

        this.speedX =
            (Math.random() - 0.5) * 1.2;

        this.speedY =
            (Math.random() - 0.5) * 1.2;

        this.opacity =
            Math.random() * 0.55 + 0.35;

        this.phase =
            Math.random() * Math.PI * 2;

        this.phaseSpeed =
            Math.random() * 0.02 + 0.008;

        this.heartProgress = 0;

        this.isHeartParticle = false;

        this.heartOffset =
            Math.random() * Math.PI * 2;
    }


    /* -----------------------------------------------------
       FREE PARTICLE MOVEMENT
    ----------------------------------------------------- */

    updateFree() {

        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x < -10) {
            this.x = width + 10;
        }

        if (this.x > width + 10) {
            this.x = -10;
        }

        if (this.y < -10) {
            this.y = height + 10;
        }

        if (this.y > height + 10) {
            this.y = -10;
        }

        this.phase += this.phaseSpeed;
    }


    /* -----------------------------------------------------
       HEART FORMATION
    ----------------------------------------------------- */

    updateHeart() {

        this.heartProgress += 0.012;

        if (this.heartProgress > 1) {
            this.heartProgress = 1;
        }

        /*
            Smooth ease-out movement.
        */

        const ease =
            1 - Math.pow(1 - this.heartProgress, 4);

        const pulse =
            heartFormationComplete
                ? 1 + Math.sin(
                    animationTime * 0.002 +
                    this.heartOffset
                ) * 0.025
                : 1;

        const centerX = width / 2;
        const centerY = height / 2 - 35;

        const finalX =
            centerX +
            (this.targetX - centerX) * pulse;

        const finalY =
            centerY +
            (this.targetY - centerY) * pulse;

        this.x +=
            (finalX - this.x) * (0.035 + ease * 0.025);

        this.y +=
            (finalY - this.y) * (0.035 + ease * 0.025);

        this.phase += this.phaseSpeed;
    }


    /* -----------------------------------------------------
       MAIN UPDATE
    ----------------------------------------------------- */

    update() {

        if (currentMode === "heart") {

            this.updateHeart();

        } else {

            this.updateFree();

        }
    }


    /* -----------------------------------------------------
       DRAW
    ----------------------------------------------------- */

    draw() {

        const pulse =
            1 +
            Math.sin(
                animationTime * 0.003 +
                this.phase
            ) * 0.18;

        const size =
            this.baseSize * pulse;

        let color;
        let glow;

        if (currentMode === "heart") {

            color = `rgba(
                255,
                ${75 + Math.floor(
                    Math.sin(this.phase) * 25
                )},
                145,
                ${this.opacity + 0.15}
            )`;

            glow = "#ff2d75";

        } else {

            color = `rgba(
                190,
                120,
                255,
                ${this.opacity}
            )`;

            glow = "#9b5cff";
        }


        ctx.save();

        ctx.beginPath();

        ctx.arc(
            this.x,
            this.y,
            size,
            0,
            Math.PI * 2
        );

        ctx.fillStyle = color;

        ctx.shadowBlur =
            currentMode === "heart"
                ? 14
                : 8;

        ctx.shadowColor = glow;

        ctx.fill();

        ctx.restore();
    }
}


/* =========================================================
   HEART TARGET GENERATION
========================================================= */

function generateHeartTargets() {

    if (!particles.length) {
        return;
    }

    const centerX = width / 2;
    const centerY = height / 2 - 35;

    /*
        Scale heart according to viewport.
    */

    let scale;

    if (width <= 420) {

        scale =
            Math.min(width, height) * 0.0145;

    } else if (width <= 768) {

        scale =
            Math.min(width, height) * 0.017;

    } else {

        scale =
            Math.min(width, height) * 0.020;
    }


    particles.forEach((particle, index) => {

        /*
            Parametric heart equation:

            x = 16 sin³(t)

            y =
            13 cos(t)
            - 5 cos(2t)
            - 2 cos(3t)
            - cos(4t)
        */

        const t =
            (index / particles.length) *
            Math.PI * 2;


        let heartX =
            16 *
            Math.pow(Math.sin(t), 3);

        let heartY =
            13 * Math.cos(t)
            - 5 * Math.cos(2 * t)
            - 2 * Math.cos(3 * t)
            - Math.cos(4 * t);


        /*
            Fill the heart instead of creating
            only an outline.
        */

        const fill =
            0.35 +
            Math.sqrt(Math.random()) * 0.65;


        heartX *= fill;
        heartY *= fill;


        /*
            Small organic particle variation.
        */

        const jitter =
            Math.random() * 1.8 - 0.9;


        particle.targetX =
            centerX +
            heartX * scale +
            jitter;

        particle.targetY =
            centerY -
            heartY * scale +
            jitter;


        particle.isHeartParticle = true;
    });
}


/* =========================================================
   CREATE PARTICLES
========================================================= */

function createParticles() {

    particles = [];

    const count = getParticleCount();

    for (let i = 0; i < count; i++) {

        particles.push(
            new Particle(i)
        );
    }

    generateHeartTargets();
}

createParticles();


/* =========================================================
   HEART GLOW
========================================================= */

function drawHeartGlow() {

    if (currentMode !== "heart") {
        return;
    }

    const centerX = width / 2;
    const centerY = height / 2 - 35;

    const pulse =
        1 +
        Math.sin(animationTime * 0.002) *
        0.05;

    const radius =
        Math.min(width, height) *
        0.20 *
        pulse;

    const gradient =
        ctx.createRadialGradient(
            centerX,
            centerY,
            0,
            centerX,
            centerY,
            radius
        );

    gradient.addColorStop(
        0,
        "rgba(255,45,117,0.15)"
    );

    gradient.addColorStop(
        0.45,
        "rgba(255,45,117,0.07)"
    );

    gradient.addColorStop(
        1,
        "rgba(255,45,117,0)"
    );

    ctx.save();

    ctx.fillStyle = gradient;

    ctx.beginPath();

    ctx.arc(
        centerX,
        centerY,
        radius,
        0,
        Math.PI * 2
    );

    ctx.fill();

    ctx.restore();
}


/* =========================================================
   PARTICLE CONNECTIONS
========================================================= */

function connectHeartParticles() {

    if (currentMode !== "heart") {
        return;
    }

    const maxDistance = 55;

    ctx.save();

    for (let i = 0; i < particles.length; i++) {

        const p1 = particles[i];

        for (
            let j = i + 1;
            j < particles.length;
            j++
        ) {

            const p2 = particles[j];

            const dx =
                p1.x - p2.x;

            const dy =
                p1.y - p2.y;

            const distance =
                Math.sqrt(
                    dx * dx +
                    dy * dy
                );

            if (distance < maxDistance) {

                const opacity =
                    (1 - distance / maxDistance)
                    * 0.12;

                ctx.beginPath();

                ctx.moveTo(
                    p1.x,
                    p1.y
                );

                ctx.lineTo(
                    p2.x,
                    p2.y
                );

                ctx.strokeStyle =
                    `rgba(255,45,117,${opacity})`;

                ctx.lineWidth = 0.5;

                ctx.stroke();
            }
        }
    }

    ctx.restore();
}


/* =========================================================
   EXPLOSION PARTICLE
========================================================= */

class ExplosionParticle {

    constructor(x, y) {

        this.x = x;
        this.y = y;

        const angle =
            Math.random() *
            Math.PI * 2;

        const speed =
            Math.random() * 9 + 3;

        this.speedX =
            Math.cos(angle) * speed;

        this.speedY =
            Math.sin(angle) * speed;

        this.size =
            Math.random() * 3 + 1;

        this.life = 1;

        this.decay =
            Math.random() * 0.018 + 0.012;

        this.color =
            Math.random() > 0.5
                ? "#ff2d75"
                : "#9b5cff";
    }


    update() {

        this.x += this.speedX;

        this.y += this.speedY;

        this.speedX *= 0.985;

        this.speedY *= 0.985;

        this.life -= this.decay;
    }


    draw() {

        if (this.life <= 0) {
            return;
        }

        ctx.save();

        ctx.globalAlpha = this.life;

        ctx.beginPath();

        ctx.arc(
            this.x,
            this.y,
            this.size,
            0,
            Math.PI * 2
        );

        ctx.fillStyle = this.color;

        ctx.shadowBlur = 18;

        ctx.shadowColor = this.color;

        ctx.fill();

        ctx.restore();
    }
}


/* =========================================================
   HEART EXPLOSION
========================================================= */

function createHeartExplosion() {

    explosionParticles = [];

    const centerX = width / 2;
    const centerY = height / 2;

    const amount =
        width <= 768
            ? 100
            : 180;

    for (let i = 0; i < amount; i++) {

        explosionParticles.push(
            new ExplosionParticle(
                centerX,
                centerY
            )
        );
    }
}


/* =========================================================
   UPDATE EXPLOSION
========================================================= */

function updateExplosion() {

    for (
        let i = explosionParticles.length - 1;
        i >= 0;
        i--
    ) {

        const particle =
            explosionParticles[i];

        particle.update();

        particle.draw();

        if (particle.life <= 0) {

            explosionParticles.splice(
                i,
                1
            );
        }
    }
}


/* =========================================================
   MAIN ANIMATION LOOP
========================================================= */

function animate(timestamp = 0) {

    animationTime = timestamp;

    ctx.clearRect(
        0,
        0,
        width,
        height
    );


    /* Background subtle stars */

    if (currentMode === "free") {

        for (const particle of particles) {

            particle.update();

            particle.draw();
        }

    } else {

        drawHeartGlow();

        connectHeartParticles();

        for (const particle of particles) {

            particle.update();

            particle.draw();
        }
    }


    /* Explosion */

    updateExplosion();


    requestAnimationFrame(animate);
}

requestAnimationFrame(animate);


/* =========================================================
   SCREEN CONTROL
========================================================= */

function showScreen(screenToShow) {

    const screens = [
        introScreen,
        heartScreen,
        proposalScreen,
        finalScreen
    ];

    screens.forEach(screen => {

        if (screen === screenToShow) {

            screen.classList.remove("hidden");

        } else {

            screen.classList.add("hidden");
        }
    });
}


/* =========================================================
   START EXPERIENCE
========================================================= */

startBtn.addEventListener("click", async () => {

    showScreen(heartScreen);

    currentMode = "heart";

    heartFormationStarted = true;

    heartFormationComplete = false;

    heartFormationTime =
        performance.now();


    /*
        Reset particles from random positions.
    */

    particles.forEach(particle => {

        particle.x =
            Math.random() * width;

        particle.y =
            Math.random() * height;

        particle.heartProgress =
            0;
    });


    /*
        Recalculate targets.
    */

    generateHeartTargets();


    /*
        Try to start music.
        Browser may block autoplay.
    */

    try {

        await proposalMusic.play();

        musicBtn.textContent = "♫";

    } catch (error) {

        musicBtn.textContent = "🔇";
    }


    /*
        Allow enough time for the heart
        formation animation to complete.
    */

    setTimeout(() => {

        heartFormationComplete = true;

    }, 3500);
});


/* =========================================================
   CONTINUE TO PROPOSAL
========================================================= */

continueBtn.addEventListener("click", () => {

    showScreen(proposalScreen);

    currentMode = "free";

    heartFormationComplete = false;
});


/* =========================================================
   YES BUTTON
========================================================= */

yesBtn.addEventListener("click", () => {

    /*
        Create particle explosion.
    */

    createHeartExplosion();


    /*
        Immediately hide heart/proposal content.
    */

    currentMode = "free";


    /*
        Small delay makes explosion visible
        before final screen appears.
    */

    setTimeout(() => {

        showScreen(finalScreen);

    }, 700);
});


/* =========================================================
   NO BUTTON — PLAYFUL MOVEMENT
========================================================= */

function moveNoButton() {

    const buttonWidth =
        noBtn.offsetWidth;

    const buttonHeight =
        noBtn.offsetHeight;

    const padding = 25;

    const maxX =
        Math.max(
            padding,
            width - buttonWidth - padding
        );

    const maxY =
        Math.max(
            padding,
            height - buttonHeight - padding
        );

    const randomX =
        Math.random() * maxX;

    const randomY =
        Math.random() * maxY;


    noBtn.style.position = "fixed";

    noBtn.style.left =
        `${randomX}px`;

    noBtn.style.top =
        `${randomY}px`;

    noBtn.style.zIndex = "50";
}


noBtn.addEventListener(
    "mouseenter",
    moveNoButton
);


noBtn.addEventListener(
    "touchstart",
    event => {

        event.preventDefault();

        moveNoButton();
    },
    { passive: false }
);


/* =========================================================
   MUSIC CONTROL
========================================================= */

let musicPlaying = false;

musicBtn.addEventListener("click", async () => {

    if (proposalMusic.paused) {

        try {

            await proposalMusic.play();

            musicPlaying = true;

            musicBtn.textContent = "♫";

        } catch (error) {

            musicPlaying = false;

            musicBtn.textContent = "🔇";
        }

    } else {

        proposalMusic.pause();

        musicPlaying = false;

        musicBtn.textContent = "🔇";
    }
});


/* =========================================================
   MOUSE INTERACTION
========================================================= */

window.addEventListener("mousemove", event => {

    mouseX = event.clientX;

    mouseY = event.clientY;
});


/* =========================================================
   TOUCH INTERACTION
========================================================= */

window.addEventListener(
    "touchmove",
    event => {

        if (!event.touches.length) {
            return;
        }

        mouseX =
            event.touches[0].clientX;

        mouseY =
            event.touches[0].clientY;
    },
    { passive: true }
);


/* =========================================================
   FIRST LOAD
========================================================= */

showScreen(introScreen);

currentMode = "free";

console.log(
    "❤️ Neon Heart Particle Proposal loaded successfully."
);

/* =========================================================
   REPLAY EXPERIENCE
========================================================= */

replayBtn.addEventListener("click", () => {

    // Stop current music
    proposalMusic.pause();
    proposalMusic.currentTime = 0;

    // Reset music button
    musicPlaying = false;
    musicBtn.textContent = "♫";

    // Reset particle state
    currentMode = "free";
    heartFormationStarted = false;
    heartFormationComplete = false;
    heartFormationTime = 0;

    // Clear explosion
    explosionParticles = [];

    // Reset NO button
    noBtn.style.position = "";
    noBtn.style.left = "";
    noBtn.style.top = "";
    noBtn.style.zIndex = "";

    // Recreate particles
    createParticles();

    // Return to first screen
    showScreen(introScreen);

    // Scroll back to top
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
});