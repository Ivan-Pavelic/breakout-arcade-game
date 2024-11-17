// Dohvati canvas i postavi kontekst
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Postavi veličinu canvas-a
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Postavi pozadinsku boju
ctx.fillStyle = 'black';
ctx.fillRect(0, 0, canvas.width, canvas.height);

console.log("Igra inicijalizirana!");
