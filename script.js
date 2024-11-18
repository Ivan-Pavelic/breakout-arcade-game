// Zvukovi za različite događaje u igri
const brickHitSound = new Audio("brick-hit.mp3"); // Zvuk koji se reproducira kada loptica udari ciglu
const paddleHitSound = new Audio("paddle-hit.mp3"); // Zvuk koji se reproducira kada loptica pogodi palicu
const wallHitSound = new Audio("wall-hit.mp3"); // Zvuk koji se reproducira kada loptica udari rub canvasa
const winSound = new Audio("win-sound.mp3"); // Zvuk koji se reproducira kada igrač pobijedi
const gameOverSound = new Audio("game-over.mp3"); // Zvuk koji se reproducira kada igrač izgubi

// Početni rezultati
let score = -1; // Trenutni rezultat igrača (započinje s -1 kako bi prvi pogodak postavio na 0)
let highScore = parseInt(localStorage.getItem("highScore")) || 0; // Dohvaća najbolji rezultat iz localStorage-a ili postavlja na 0 ako ne postoji spremljeni rezultat

// Dohvaćanje Canvas elementa i priprema za crtanje
const canvas = document.getElementById('gameCanvas'); // Dohvaća element `<canvas>` iz HTML-a pomoću ID-a
const ctx = canvas.getContext('2d'); // Postavlja 2D kontekst za crtanje na Canvasu

// Postavljanje početne veličine canvasa
canvas.width = document.documentElement.clientWidth; // Širina canvasa jednaka širini prozora preglednika
canvas.height = document.documentElement.clientHeight; // Visina canvasa jednaka visini prozora preglednika

// Ponovno prilagođavanje veličine canvasa prilikom promjene veličine prozora
window.addEventListener("resize", () => {
    canvas.width = document.documentElement.clientWidth; // Ponovno postavlja širinu canvasa
    canvas.height = document.documentElement.clientHeight; // Ponovno postavlja visinu canvasa

    // Preračunavanje dimenzija cigli i centriranje palice
    brickWidth = (canvas.width - (brickColumnCount + 1) * brickPadding) / brickColumnCount; // Ponovno izračunava širinu cigli kako bi odgovarala novoj širini canvasa
    brickOffsetTop = canvas.height / 12; // Dinamički razmak između vrha canvasa i cigli
    paddleX = (canvas.width - paddleWidth) / 2; // Centriranje palice u novim dimenzijama
});

// Postavljanje početne pozadine za Canvas
ctx.fillStyle = 'black'; // Boja pozadine je crna
ctx.fillRect(0, 0, canvas.width, canvas.height); // Crta crni pravokutnik preko cijelog canvasa kako bi ga "očistio"

// Konzolna poruka za potvrdu inicijalizacije igre
console.log("Igra inicijalizirana!"); // Poruka u konzoli preglednika koja potvrđuje uspješno postavljanje igre

// Postavljanje početnih parametara
const paddleWidth = 200; // Širina palice u pikselima
const paddleHeight = 20; // Visina palice u pikselima
const ballRadius = 10;   // Polumjer loptice u pikselima
let brickRowCount = 5;   // Broj redova cigli u igri
const brickColumnCount = 8; // Broj stupaca cigli u igri

// Postavljanje dimenzija cigli
const brickPadding = 5; // Razmak između cigli u pikselima
const brickOffsetTop = 10; // Razmak između vrha canvasa i prvog reda cigli
const brickOffsetLeft = brickPadding; // Razmak između lijevog ruba canvasa i cigli
const brickWidth = (canvas.width - (brickColumnCount + 1) * brickPadding) / brickColumnCount; 
// Širina cigle se dinamički izračunava na temelju širine canvasa, broja stupaca i razmaka između cigli
const brickHeight = 20; // Visina svake cigle u pikselima

// Inicijalizacija pozicije palice i loptice
let paddleX = (canvas.width - paddleWidth) / 2; 
// Početna horizontalna pozicija palice (centrirano na dnu canvasa)
let ballX = paddleX + paddleWidth / 2; 
// Početna horizontalna pozicija loptice (središte palice)
let ballY = canvas.height - paddleHeight - 20; 
// Početna vertikalna pozicija loptice (neposredno iznad palice)

// Generiranje slučajnog kuta za horizontalnu brzinu loptice
const randomAngle = (Math.random() * 2 - 1) * 3; 
// Generira slučajnu vrijednost između -3 i 3 za početnu horizontalnu brzinu
ballSpeedX = randomAngle; // Horizontalna brzina loptice
ballSpeedY = -3; // Vertikalna brzina loptice prema gore (negativna vrijednost znači kretanje prema gore)

// Inicijalizacija cigli
let bricks = []; // Polje za pohranu cigli
for (let row = 0; row < brickRowCount; row++) {
    bricks[row] = []; // Svaki red sadrži polje stupaca cigli
    for (let col = 0; col < brickColumnCount; col++) {
        bricks[row][col] = {
            x: 0, // Početna horizontalna koordinata cigle (postavit će se kasnije)
            y: 0, // Početna vertikalna koordinata cigle (postavit će se kasnije)
            status: 1 // Status cigle; 1 znači da cigla postoji, 0 znači da je uništena
        };
    }
}

// Funkcija za crtanje loptice
function drawBall() {
    ctx.beginPath(); // Početak crtanja novog oblika
    ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2); 
    // Crta kružnicu; ballX i ballY su koordinate središta, a ballRadius je polumjer
    ctx.fillStyle = "red"; // Postavlja boju loptice na crvenu
    ctx.fill(); // Popunjava kružnicu crvenom bojom
    ctx.closePath(); // Zatvara putanju i završava crtanje
}

// Funkcija za crtanje palice
function drawPaddle() {
    ctx.shadowColor = "rgba(0, 0, 0, 1)"; // Postavlja crnu boju za sjenčanje
    ctx.shadowBlur = 10; // Razina zamućenja sjenčanja
    ctx.shadowOffsetX = 4; // Horizontalni pomak sjenčanja
    ctx.shadowOffsetY = 4; // Vertikalni pomak sjenčanja

    // Crtanje pravokutne palice
    ctx.beginPath(); // Početak crtanja novog pravokutnika
    ctx.rect(paddleX, canvas.height - paddleHeight - 10, paddleWidth, paddleHeight); 
    // Crta pravokutnik s pozicijom paddleX, visinom paddleHeight i širinom paddleWidth
    ctx.fillStyle = "red"; // Postavlja boju pravokutnika na crvenu
    ctx.fill(); // Popunjava pravokutnik crvenom bojom

    // Crtanje obruba palice
    ctx.lineWidth = 5; // Postavlja debljinu obruba na 5px
    ctx.strokeStyle = "white"; // Postavlja boju obruba na bijelu
    ctx.stroke(); // Crta obrub oko pravokutnika
    ctx.closePath(); // Zatvara putanju i završava crtanje pravokutnika

    // Resetiranje sjenčanja za buduće crteže
    ctx.shadowColor = "transparent"; 
}

// Funkcija za crtanje rubova igre
function drawBorders() {
    ctx.beginPath(); // Početak crtanja novog oblika
    ctx.rect(0, 0, canvas.width, canvas.height); 
    // Crta pravokutnik koji prekriva cijeli Canvas
    ctx.lineWidth = 5; // Postavlja debljinu okvira na 5px
    ctx.strokeStyle = "white"; // Postavlja boju okvira na bijelu
    ctx.stroke(); // Crta bijeli okvir oko Canvas-a
    ctx.closePath(); // Zatvara putanju i završava crtanje
}

// Boje cigli za svaki red
const brickColors = ["red", "orange", "yellow", "green", "blue"]; 
// Svaka boja odgovara jednom redu cigli; ciklično se koristi ako ima više od 5 redova

// Funkcija za crtanje cigli
function drawBricks() {
    for (let row = 0; row < brickRowCount; row++) { // Prolazi kroz svaki red cigli
        for (let col = 0; col < brickColumnCount; col++) { // Prolazi kroz svaki stupac cigli
            if (bricks[row][col].status === 1) { 
                // Provjerava je li cigla aktivna (status 1 znači da cigla nije uništena)

                // Izračunava poziciju cigle na Canvasu
                let brickX = col * (brickWidth + brickPadding) + brickOffsetLeft; 
                // Horizontalna pozicija cigle, ovisno o stupcu i razmaku između cigli
                let brickY = row * (brickHeight + brickPadding) + brickOffsetTop; 
                // Vertikalna pozicija cigle, ovisno o redu i razmaku između cigli

                // Sprema izračunate koordinate u objekt cigle
                bricks[row][col].x = brickX;
                bricks[row][col].y = brickY;

                // Dodavanje efekta sjenčanja za cigle
                ctx.shadowColor = "rgba(0, 0, 0, 1)"; // Crna boja sjenčanja
                ctx.shadowBlur = 10; // Razina zamućenja sjenčanja
                ctx.shadowOffsetX = 4; // Horizontalni pomak sjenčanja
                ctx.shadowOffsetY = 4; // Vertikalni pomak sjenčanja

                // Crtanje cigle kao pravokutnika
                ctx.beginPath(); // Početak crtanja pravokutnika
                ctx.rect(brickX, brickY, brickWidth, brickHeight); 
                // Dimenzije cigle definirane širinom i visinom

                ctx.fillStyle = brickColors[row % brickColors.length]; 
                // Postavlja boju cigle na temelju njenog reda; koristi modulo operator za ciklično korištenje boja
                ctx.fill(); // Popunjava ciglu odabranom bojom

                // Crtanje obruba cigle
                ctx.lineWidth = 5; // Debljina obruba
                ctx.strokeStyle = "gray"; // Boja obruba
                ctx.stroke(); // Crta obrub cigle

                ctx.closePath(); // Zatvara putanju crtanja

                // Resetiranje sjenčanja nakon crtanja cigle
                ctx.shadowColor = "transparent"; 
            }
        }
    }
}

// Kontrole tipkovnice
let rightPressed = false; // Indikator za pritisnutu tipku "desno"
let leftPressed = false;  // Indikator za pritisnutu tipku "lijevo"

// Slušanje događaja pritiska tipki
document.addEventListener("keydown", keyDownHandler); // Kad tipka bude pritisnuta
document.addEventListener("keyup", keyUpHandler); // Kad tipka bude puštena

// Funkcija za rukovanje pritiskom tipki
function keyDownHandler(e) {
    if (e.key === "Right" || e.key === "ArrowRight") { 
        // Provjerava je li pritisnuta tipka "Right" ili strelica desno
        rightPressed = true; // Postavlja indikator na true
    } else if (e.key === "Left" || e.key === "ArrowLeft") { 
        // Provjerava je li pritisnuta tipka "Left" ili strelica lijevo
        leftPressed = true; // Postavlja indikator na true
    }
}

// Funkcija za rukovanje otpuštanjem tipki
function keyUpHandler(e) {
    if (e.key === "Right" || e.key === "ArrowRight") { 
        // Provjerava je li puštena tipka "Right" ili strelica desno
        rightPressed = false; // Postavlja indikator na false
    } else if (e.key === "Left" || e.key === "ArrowLeft") { 
        // Provjerava je li puštena tipka "Left" ili strelica lijevo
        leftPressed = false; // Postavlja indikator na false
    }
}

// Funkcija za detekciju sudara loptice s ciglama
function collisionDetection() {
    for (let row = 0; row < brickRowCount; row++) { 
        // Iterira kroz svaki red cigli
        for (let col = 0; col < brickColumnCount; col++) { 
            // Iterira kroz svaki stupac cigli
            let brick = bricks[row][col]; // Dohvaća pojedinačnu ciglu iz polja cigli
            if (brick.status === 1) { 
                // Provjerava je li cigla aktivna (status 1 znači da cigla nije uništena)

                // Provjera sudara loptice s ciglom
                if (
                    ballX + ballRadius > brick.x && // Desni rub loptice prolazi preko lijevog ruba cigle
                    ballX - ballRadius < brick.x + brickWidth && // Lijevi rub loptice prolazi preko desnog ruba cigle
                    ballY + ballRadius > brick.y && // Donji rub loptice prolazi preko gornjeg ruba cigle
                    ballY - ballRadius < brick.y + brickHeight // Gornji rub loptice prolazi preko donjeg ruba cigle
                ) {
                    // Detekcija specifične strane cigle koja je pogođena

                    // Horizontalni sudar - Provjerava je li sudar s gornjom ili donjom stranom cigle
                    if (
                        ballX > brick.x && ballX < brick.x + brickWidth 
                        // Loptica se nalazi unutar horizontalnih granica cigle
                    ) {
                        if (ballY - ballRadius < brick.y) { 
                            // Loptica udara gornju stranu cigle
                            ballSpeedY = -Math.abs(ballSpeedY); 
                            // Postavlja vertikalnu brzinu loptice prema gore
                        } else if (ballY + ballRadius > brick.y + brickHeight) {
                            // Loptica udara donju stranu cigle
                            ballSpeedY = Math.abs(ballSpeedY); 
                            // Postavlja vertikalnu brzinu loptice prema dolje
                        }
                    }

                    // Vertikalni sudar - Provjerava je li sudar s lijevom ili desnom stranom cigle
                    if (
                        ballY > brick.y && ballY < brick.y + brickHeight 
                        // Loptica se nalazi unutar vertikalnih granica cigle
                    ) {
                        if (ballX - ballRadius < brick.x) { 
                            // Loptica udara lijevu stranu cigle
                            ballSpeedX = -Math.abs(ballSpeedX); 
                            // Postavlja horizontalnu brzinu loptice ulijevo
                        } else if (ballX + ballRadius > brick.x + brickWidth) {
                            // Loptica udara desnu stranu cigle
                            ballSpeedX = Math.abs(ballSpeedX); 
                            // Postavlja horizontalnu brzinu loptice udesno
                        }
                    }

                    // Postavljanje cigle kao uništene
                    brick.status = 0; // Mijenja status cigle na 0 (cigla više nije aktivna)
                    brickHitSound.play(); // Reproducira zvuk sudara s ciglom

                    // Ažuriranje rezultata
                    score++; // Povećava trenutni rezultat igrača za 1
                    if (score > highScore) { 
                        // Ako trenutni rezultat premaši najbolji rezultat
                        highScore = score; // Postavlja novi high score
                        localStorage.setItem("highScore", highScore); 
                        // Sprema novi high score u `localStorage` za buduće sesije
                    }
                }
            }
        }
    }
}

// Funkcija za resetiranje najboljeg rezultata (high score)
function resetHighScore() {
    localStorage.removeItem("highScore"); 
    // Uklanja spremljeni high score iz `localStorage`, čime se vraća na zadanu vrijednost
    highScore = 0; // Postavlja trenutni high score na 0
    alert("High score resetiran!"); 
    // Prikazuje poruku korisniku da je high score uspješno resetiran
}

// Funkcija za prikaz trenutnog rezultata i najboljeg rezultata
function drawScore() {
    ctx.font = "16px Arial"; 
    // Postavlja font za prikaz rezultata (veličina 16px, font Arial)
    ctx.fillStyle = "white"; 
    // Postavlja boju teksta na bijelu
    ctx.textAlign = "right"; 
    // Poravnava tekst desno
    ctx.fillText(`Score: ${score}`, canvas.width - 10, 20); 
    // Prikazuje trenutni rezultat u gornjem desnom kutu canvasa, 10px od desnog ruba
    ctx.fillText(`High Score: ${highScore}`, canvas.width - 10, 40); 
    // Prikazuje najbolji rezultat odmah ispod trenutnog rezultata
}

// Kada igrač razbije ciglu
score++; // Povećava trenutni rezultat igrača za 1 bod
if (score > highScore) { 
    // Provjerava je li trenutni rezultat veći od dosad najboljeg rezultata
    highScore = score; // Postavlja trenutni rezultat kao novi high score
    localStorage.setItem("highScore", highScore); 
    // Sprema novi high score u `localStorage` kako bi se zadržao između sesija igre
}

// Funkcija za provjeru je li igrač pobijedio
function checkWin() {
    let allBricksBroken = true; 
    // Pretpostavlja da su sve cigle uništene dok se ne dokaže suprotno

    for (let row = 0; row < brickRowCount; row++) { 
        // Prolazi kroz svaki red cigli
        for (let col = 0; col < brickColumnCount; col++) { 
            // Prolazi kroz svaki stupac cigli
            if (bricks[row][col].status === 1) { 
                // Ako postoji cigla s `status` vrijednošću 1, znači da nije uništena
                allBricksBroken = false; 
                // Postavlja zastavicu na false jer nisu sve cigle uništene
                break; // Prekida unutarnju petlju jer više nema potrebe provjeravati dalje
            }
        }
        if (!allBricksBroken) break; // Prekida vanjsku petlju ako su cigle još uvijek prisutne
    }

    if (allBricksBroken) { 
        // Ako su sve cigle uništene
        drawMessage("YOU WIN"); 
        // Prikazuje poruku pobjede na Canvasu
        winSound.play(); 
        // Pusti zvuk pobjede
        cancelAnimationFrame(gameLoopId); 
        // Zaustavlja petlju animacije kako bi se igra završila
    }
}

// Funkcija za prikaz poruke na sredini ekrana
function drawMessage(message) {
    ctx.font = "40px Arial"; 
    // Postavlja font za poruku (veličina 40px, font Arial)
    ctx.fillStyle = "white"; 
    // Postavlja boju teksta na bijelu
    ctx.textAlign = "center"; 
    // Poravnava tekst na sredinu horizontalno
    ctx.fillText(message, canvas.width / 2, canvas.height / 2); 
    // Crta poruku na sredini canvasa (korištenjem pola širine i visine)
}

// Funkcija za ograničavanje brzine loptice
function limitBallSpeed() {
    const maxSpeed = 6; // Maksimalna dozvoljena brzina loptice
    const minSpeed = Math.abs(ballSpeedY); 
    // Minimalna brzina loptice, određena početnom vrijednošću unesenom od strane korisnika

    if (Math.abs(ballSpeedX) > maxSpeed) { 
        // Ako horizontalna brzina premašuje maksimalnu brzinu
        ballSpeedX = (ballSpeedX / Math.abs(ballSpeedX)) * maxSpeed; 
        // Postavlja horizontalnu brzinu na maksimalnu, zadržavajući smjer
    }
    if (Math.abs(ballSpeedY) > maxSpeed) { 
        // Ako vertikalna brzina premašuje maksimalnu brzinu
        ballSpeedY = (ballSpeedY / Math.abs(ballSpeedY)) * maxSpeed; 
        // Postavlja vertikalnu brzinu na maksimalnu, zadržavajući smjer
    } else if (Math.abs(ballSpeedY) < minSpeed) { 
        // Ako je vertikalna brzina manja od minimalne
        ballSpeedY = (ballSpeedY / Math.abs(ballSpeedY)) * minSpeed; 
        // Postavlja vertikalnu brzinu na minimalnu, zadržavajući smjer
    }
}

// Funkcija za inicijalizaciju loptice
function resetBall() {
    ballX = paddleX + paddleWidth / 2; 
    // Postavlja početnu horizontalnu poziciju loptice na središte palice
    ballY = canvas.height - paddleHeight - 20; 
    // Postavlja početnu vertikalnu poziciju neposredno iznad palice

    // Generiranje slučajnog kuta za horizontalnu brzinu
    const randomAngle = Math.random() * 6 - 3; 
    // Generira nasumičnu horizontalnu brzinu između -3 i 3
    ballSpeedX = randomAngle; // Postavlja horizontalnu brzinu loptice

    // Provjera i postavljanje vertikalne brzine loptice
    if (ballSpeedY === undefined || ballSpeedY === 0) { 
        // Ako vertikalna brzina nije definirana ili je jednaka 0
        ballSpeedY = -3; // Postavlja zadanu vertikalnu brzinu prema gore
    } else {
        ballSpeedY = -Math.abs(ballSpeedY); 
        // Osigurava da je vertikalna brzina uvijek negativna (prema gore)
    }
}

// Funkcija za ažuriranje i crtanje svih elemenata na Canvasu
function draw() {
    // Čišćenje Canvas-a
    ctx.clearRect(0, 0, canvas.width, canvas.height); 
    // Briše prethodno nacrtane elemente kako bi se prikazao novi okvir

    // Crtanje svih elemenata igre
    drawBorders(); // Crta rubove canvasa
    drawBall(); // Crta lopticu
    drawPaddle(); // Crta palicu
    drawBricks(); // Crta cigle
    drawScore(); // Prikazuje trenutni rezultat i najbolji rezultat
    checkWin(); // Provjerava je li igrač pobijedio

    // Ažuriranje pozicije palice
    if (rightPressed && paddleX < canvas.width - paddleWidth) { 
        // Ako je pritisnuta tipka za desno i palica nije na desnom rubu canvasa
        paddleX += 5; // Pomakni palicu udesno za 5px
    } else if (leftPressed && paddleX > 0) { 
        // Ako je pritisnuta tipka za lijevo i palica nije na lijevom rubu canvasa
        paddleX -= 5; // Pomakni palicu ulijevo za 5px
    }

    // Ažuriranje pozicije loptice
    ballX += ballSpeedX; // Horizontalni pomak loptice
    ballY += ballSpeedY; // Vertikalni pomak loptice

    // Provjera sudara loptice s rubovima canvasa
    if (ballX + ballRadius > canvas.width || ballX - ballRadius < 0) { 
        // Ako loptica dodirne lijevi ili desni rub canvasa
        ballSpeedX = -ballSpeedX; // Preokreni horizontalni smjer loptice
        wallHitSound.play(); // Pusti zvuk sudara s rubom
    }
    if (ballY - ballRadius < 0) { 
        // Ako loptica dodirne gornji rub canvasa
        ballSpeedY = -ballSpeedY; // Preokreni vertikalni smjer loptice
        wallHitSound.play(); // Pusti zvuk sudara s rubom
    } else if (ballY + ballRadius > canvas.height) { 
        // Ako loptica prijeđe donji rub canvasa (igra završava)
        drawMessage("GAME OVER"); // Prikazuje poruku o kraju igre
        gameOverSound.play(); // Pusti zvuk za kraj igre
        resetBall(); // Resetira lopticu na početne pozicije
        cancelAnimationFrame(gameLoopId); // Zaustavlja petlju animacije
    }

    // Provjera sudara loptice s palicom
    if (
        ballY + ballRadius > canvas.height - paddleHeight - 10 && 
        // Loptica je na istoj visini kao palica
        ballX > paddleX && 
        // Loptica je unutar lijevog ruba palice
        ballX < paddleX + paddleWidth 
        // Loptica je unutar desnog ruba palice
    ) {
        paddleHitSound.play(); // Pusti zvuk sudara s palicom

        // Izračunaj kut odbijanja loptice
        let hitPoint = ballX - (paddleX + paddleWidth / 2); 
        // Udaljenost između centra loptice i centra palice
        let normalizedHitPoint = hitPoint / (paddleWidth / 2); 
        // Normalizacija vrijednosti između -1 i 1
        let maxBounceAngle = Math.PI / 3; 
        // Maksimalni kut odbijanja (60 stupnjeva)
        let bounceAngle = normalizedHitPoint * maxBounceAngle; 
        // Kut odbijanja ovisi o mjestu udara na palici

        // Postavljanje nove brzine loptice
        let ballSpeed = Math.sqrt(ballSpeedX ** 2 + ballSpeedY ** 2); 
        // Izračunava ukupnu brzinu loptice koristeći Pitagorin poučak
        ballSpeedX = ballSpeed * Math.sin(bounceAngle); 
        // Horizontalna brzina ovisi o kutu odbijanja
        ballSpeedY = -ballSpeed * Math.cos(bounceAngle); 
        // Vertikalna brzina je uvijek prema gore (negativna)
    }

    // Ograničenje maksimalne brzine loptice
    limitBallSpeed(); 
    // Osigurava da brzina loptice ostane unutar definirane minimalne i maksimalne vrijednosti

    // Provjera sudara loptice s ciglama
    collisionDetection(); 
    // Provjerava je li loptica pogodila ciglu i ažurira status cigli, bodove i smjer loptice
}

// Glavna petlja igre (animacija)
function gameLoop() {
    draw(); // Poziva funkciju `draw` koja osvježava sve elemente igre na Canvasu
    requestAnimationFrame(gameLoop); 
    // Rekurzivno poziva samu sebe kako bi se igra nastavila prikazivati dok ne bude zaustavljena
    // `requestAnimationFrame` osigurava glatku animaciju koristeći optimizaciju preglednika
}

// Funkcija za početak igre
function startGame() {
    const speedInput = document.getElementById("speed").value; 
    // Dohvaća vrijednost brzine loptice koju je korisnik odabrao iz padajućeg izbornika
    const rowsInput = document.getElementById("rows").value; 
    // Dohvaća broj redova cigli koji je korisnik odabrao iz padajućeg izbornika

    // Validacija korisničkog unosa
    if (!speedInput || !rowsInput || isNaN(speedInput) || isNaN(rowsInput)) { 
        // Provjerava jesu li unosi za brzinu i broj redova cigli valjani brojevi
        alert("Molimo unesite valjane vrijednosti za brzinu i broj redova cigli."); 
        // Prikazuje upozorenje korisniku ako unos nije ispravan
        return; // Prekida funkciju ako je unos nevaljan
    }

    // Postavljanje dinamičkih vrijednosti na temelju korisničkog unosa
    ballSpeedY = -parseFloat(speedInput); 
    // Postavlja vertikalnu brzinu loptice na unesenu vrijednost (negativna za kretanje prema gore)
    brickRowCount = parseInt(rowsInput); 
    // Postavlja broj redova cigli na unesenu vrijednost

    // Sakrivanje izbornika postavki i prikazivanje canvasa
    document.getElementById("settings").style.display = "none"; 
    // Sakriva HTML element s ID-om "settings" (izbornik postavki)
    document.getElementById("gameCanvas").style.display = "block"; 
    // Prikazuje Canvas element s ID-om "gameCanvas" (igra)

    // Ponovna inicijalizacija cigli
    bricks = []; // Prazni postojeće cigle iz polja
    for (let row = 0; row < brickRowCount; row++) { 
        // Stvara nove redove cigli na temelju odabranog broja redova
        bricks[row] = []; // Inicijalizira svaki red kao prazan niz
        for (let col = 0; col < brickColumnCount; col++) { 
            // Stvara nove stupce cigli unutar svakog reda
            bricks[row][col] = { x: 0, y: 0, status: 1 }; 
            // Postavlja početne koordinate cigle (bit će izračunate tijekom crtanja)
            // `status: 1` znači da cigla nije uništena
        }
    }

    resetBall(); // Resetira lopticu na početne pozicije i postavlja novu brzinu
    gameLoop();  // Pokreće glavnu petlju igre (animaciju)
}