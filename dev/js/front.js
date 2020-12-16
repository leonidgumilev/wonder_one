import {MainEventBus} from "./libs/MainEventBus.lib.js";
import {_front} from "./libs/_front.js";

class Front extends _front {
    constructor() {
        super();
        const _ = this;
        MainEventBus.add(_.componentName, 'createOrderSuccess', _.createOrderSuccess.bind(_));
        MainEventBus.add(_.componentName, 'createOrderFail', _.createOrderFail.bind(_));
        MainEventBus.add(_.componentName, 'Switch', _.switchScreen.bind(_));
        MainEventBus.add(_.componentName, 'smallSlideSwitch', _.smallSlideSwitch.bind(_));

        _.activeScreen = 0;
        _.smallSlideAutoSwitch();
    }

    createOrderSuccess(orderData) {
        console.log(orderData);
    }

    createOrderFail(orderData) {
    }

    switchScreen(dataClickAction) {
        let sections = document.querySelectorAll('.slide');
        let lis = document.querySelectorAll('.menu li');
        sections = Array.from(sections);
        let indexOfActive = dataClickAction['item'].dataset.sectionId;//sections.findIndex(section => section.classList.contains('active'));

        function rmClass(section) {
            if (section.classList.contains('active')) {
                section.classList.remove('active');
            }
        }

        sections.forEach(rmClass);
        lis.forEach(rmClass);
        dataClickAction['item'].classList.add('active');
        //indexOfActive = ++indexOfActive % sections.length;

        sections[indexOfActive].classList.add('beforeSwitchIn');
        sections[indexOfActive].classList.add('active');
    }

    smallSlideSwitch(dataClickAction){
        const _ = this;
        let btn = dataClickAction.item;
        let int = btn.getAttribute('data-id')*1;
        let slides = document.querySelectorAll('.slider');
        slides.forEach(function (slide,index){
            if(slide.classList.contains('active')) slide.classList.remove('active')
            if(index === int - 1) {
                slide.classList.add('active')
            }
        })

        let btns = document.querySelectorAll('.dot')
        btns.forEach(function (btn,index){
            if(btn.classList.contains('active')) btn.classList.remove('active');
            if (btn.getAttribute('data-id')*1 === int) btn.classList.add('active')
        })

        _.smallSlideReset();
    }
    smallSlideReset(){
        const _ = this;
        clearInterval(_.smallsliderInterval);
        _.smallSlideAutoSwitch();
    }
    smallSlideAutoSwitch(){
        const _ = this;

        _.smallsliderInterval = setInterval(function (){
            let btn = document.querySelector('.dot.active');
            if(btn.nextElementSibling) btn = btn.nextElementSibling;
            else btn = btn.parentElement.firstElementChild;
            _.smallSlideSwitch({'item':btn})
        },10000)
    }
}

new Front();

$("body").append("<canvas id='particle-canvas'></canvas>");

function normalPool(o) {
    var r = 0;
    do {
        var a = Math.round(normal({mean: o.mean, dev: o.dev}));
        if (a < o.pool.length && a >= 0) return o.pool[a];
        r++
    } while (r < 100)
}

function randomNormal(o) {
    if (o = Object.assign({
        mean: 0,
        dev: 1,
        pool: []
    }, o), Array.isArray(o.pool) && o.pool.length > 0) return normalPool(o);
    var r, a, n, e, l = o.mean, t = o.dev;
    do {
        r = (a = 2 * Math.random() - 1) * a + (n = 2 * Math.random() - 1) * n
    } while (r >= 1);
    return e = a * Math.sqrt(-2 * Math.log(r) / r), t * e + l
}

const NUM_PARTICLES = 4;
const PARTICLE_SIZE = 8; // View heights
const SPEED = 200000; // Milliseconds

let particles = [];

function rand(low, high) {
    return Math.random() * (high - low) + low;
}

function createParticle(canvas) {
    const colour = {
        r: 4,
        g: 2, //randomNormal({mean: 8, dev: 10}),
        b: 4,
        a: rand(0, 0.1),
    };
    return {
        x: -12,
        y: -24,
        diameter: Math.max(0, randomNormal({mean: PARTICLE_SIZE, dev: PARTICLE_SIZE / 2})),
        duration: randomNormal({mean: SPEED, dev: SPEED * 0.1}),
        amplitude: randomNormal({mean: 38, dev: 52}),
        offsetY: randomNormal({mean: 0, dev: 14}),
        arc: Math.PI * 2,
        startTime: performance.now() - rand(0, SPEED),
        colour: `rgba(${colour.r}, ${colour.g}, ${colour.b}, ${colour.a})`,
    }
}

function moveParticle(particle, canvas, time) {
    const progress = ((time - particle.startTime) % particle.duration) / particle.duration;
    return {
        ...particle,
        x: progress,
        y: ((Math.sin(progress * particle.arc) * particle.amplitude) + particle.offsetY),
    };
}

function drawParticle(particle, canvas, ctx) {
    canvas = document.getElementById('particle-canvas');
    const vh = canvas.height / 100;

    ctx.fillStyle = particle.colour;
    ctx.beginPath();
    ctx.ellipse(
        particle.x * canvas.width,
        particle.y * vh + (canvas.height / 2),
        particle.diameter * vh,
        particle.diameter * vh,
        0,
        0,
        2 * Math.PI
    );
    ctx.fill();
}

function draw(time, canvas, ctx) {
    particles.forEach((particle, index) => {
        particles[index] = moveParticle(particle, canvas, time);
    })

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach((particle) => {
        drawParticle(particle, canvas, ctx);
    })

    requestAnimationFrame((time) => draw(time, canvas, ctx));
}

function initializeCanvas() {
    let canvas = document.getElementById('particle-canvas');
    canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    let ctx = canvas.getContext("2d");

    window.addEventListener('resize', () => {
        canvas.width = canvas.offsetWidth * window.devicePixelRatio;
        canvas.height = canvas.offsetHeight * window.devicePixelRatio;
        ctx = canvas.getContext("2d");
    })

    return [canvas, ctx];
}

function startAnimation() {
    const [canvas, ctx] = initializeCanvas();

    // Create a bunch of particles
    for (let i = 0; i < NUM_PARTICLES; i++) {
        particles.push(createParticle(canvas));
    }

    requestAnimationFrame((time) => draw(time, canvas, ctx));
};

(function () {
    if (document.readystate !== 'loading') {
        startAnimation();
    } else {
        document.addEventListener('DOMContentLoaded', () => {
            startAnimation();
        })
    }
}());