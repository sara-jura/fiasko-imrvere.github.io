const canvas = document.getElementById("game");
const ctx = canvas.getContext('2d');
const card = document.getElementById("card");
const cardScore = document.getElementById("card-score");

// I just want to say this is not representative of the code I usually write, don't judge me 

//Global variables

//SFX not used cause annoying <3
let scoreSFX = new Audio("https://archive.org/download/classiccoin/classiccoin.wav");
let gameOverSFX = new Audio("https://archive.org/download/smb_gameover/smb_gameover.wav");
let jumpSFX = new Audio("https://archive.org/download/jump_20210424/jump.wav");



//Global Functions

let game_width = 900
let game_height = 600
let groundY = 570;
let score;
let scoreText;
let highscore;
let highscoreText;
let player;
let gravity;
let obstacles = [];
let gameSpeed;
let keys = {};

document.addEventListener('keydown', function(evt) {
    keys[evt.code] = true;
});
document.addEventListener('keyup', function(evt) {
    keys[evt.code] = false;
});

function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

//Returns true of colliding
function squaresColliding(player, block) {
    let s1 = player
    let s2 = block
    return !(
        s1.col_x > s2.col_x + s2.col_width || //R1 is to the right of R2
        s1.col_x + s1.col_width < s2.col_x || //R1 to the left of R2
        s1.col_y > s2.col_y + s2.col_height || //R1 is below R2
        s1.col_y + s1.col_height < s2.col_y //R1 is above R2
    )
}


const avaRun = new Image();
avaRun.src = './assets/ava_walk_spritesheet.png'
class Ava {
    constructor(x) {
        this.width = 81
        this.height = 162
        this.x = x;
        this.y = groundY - this.height;
        this.jumpHeight = 10;

        //collision square
        this.col_x = this.x + 35
        this.col_y = this.y + 30
        this.col_width = this.width - 60
        this.col_height = this.height - 30

	//jump in the name of love
        this.dy = 0;
        this.jumpForce = 21;
        this.grounded = false;
        this.originalHeight = this.height;
        this.jumpTimer = 0;
        this.frames = 0
    }
    Animate() {
        if (keys['Space'] || keys['KeyW']) {
            this.Jump();
        } else {
            this.jumpTimer = 0;
        }
        this.y += this.dy;
        this.col_y = this.y + 30
        if (this.y + this.height < groundY) {
            this.dy += gravity;
            this.grounded = false;
        } else {
            this.dy = 0;
            this.grounded = true;
            this.y = groundY - this.height;
            this.col_y = this.y + 30
        }
        this.Draw()
        this.frames++
        this.frames = this.frames % 30
    }
    Draw() {
        //console.log(this.frames)
        ctx.drawImage(avaRun, 0 + (540 * this.frames), 0, 540, 1149, this.x, this.y, this.width, this.height)

    }

    Jump() {
        if (this.grounded && this.jumpTimer == 0) {
            this.jumpTimer = 1;
            this.dy = -this.jumpForce;
        } else if (this.jumpTimer > 0 && this.jumpTimer < 15) {
            this.jumpTimer++;
            this.dy = -this.jumpForce - (this.jumpTimer / 50);
        }
    }


}
const carl = new Image();
carl.src = './assets/carl.png'
class Carl {
    constructor() {
        this.width = 124
        this.height = 202
        this.x = game_width + this.width;
        this.y = groundY - this.height;
        // collision square
        this.col_x = this.x + 15
        this.col_y = this.y + 40
        this.col_width = this.width - 30
        this.col_height = this.height - 40
        this.dx = -gameSpeed;
    }

    Draw() {
        ctx.drawImage(carl, this.x, this.y, this.width, this.height)
    }

    Update() {
        this.x += this.dx;
        this.col_x = this.x + 15
        this.Draw();
        this.dx = -gameSpeed;
    }

}

class Text {
    constructor(t, x, y, a, c, s) {
        this.t = t;
        this.x = x;
        this.y = y;
        this.a = a;
        this.c = c;
        this.s = s;
    }

    Draw() {
        ctx.beginPath();
        ctx.fillStyle = this.c;
        ctx.font = this.s + "px Albert Sans";
        ctx.textAlign = this.a;
        ctx.fillText(this.t, this.x, this.y);
        ctx.closePath();
    }
}

// Game Functions
function SpawnObstacle() {
    let size = RandomIntInRange(20, 70);
    let obstacle = new Carl();


    obstacles.push(obstacle);
}

function RandomIntInRange(min, max) {
    return Math.round(Math.random() * (max - min) + min);
}


function drawBackgroundLine() {
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(900, groundY);
    ctx.lineWidth = 1.9;
    ctx.strokeStyle = "black";
    ctx.stroke();
    ctx.fillRect(0, groundY, 900, 600 - groundY);
}

function Start() {
    canvas.width = 900;
    canvas.height = 600;
    obstacles = [];
    score = 0;
    spawnTimer = initialSpawnTimer;
    ctx.font = "20px sans-serif";

    gameSpeed = 3;
    gravity = 1;

    score = 0;
    highscore = 0;
    if (localStorage.getItem('highscore')) {
        highscore = localStorage.getItem('highscore');
    }

    player = new Ava(50);

    scoreText = new Text("Score: " + score, 25, 25, "left", "#212121", "20");
    highscoreText = new Text("Highscore: " + highscore, canvas.width - 25, 25, "right", "#212121", "20");

    requestAnimationFrame(Update);
}

let initialSpawnTimer = 200;
let spawnTimer = initialSpawnTimer;

function Update() {
    let animationId = requestAnimationFrame(Update);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackgroundLine()
    spawnTimer--;
    if (spawnTimer <= 0) {
        SpawnObstacle();
        spawnTimer = initialSpawnTimer - gameSpeed * 8;

        if (spawnTimer < 60) {
            spawnTimer = 60;
        }
    }
    // Spawn Enemies
    for (let i = 0; i < obstacles.length; i++) {
        let o = obstacles[i];

        if (o.x + o.w < 0) {
            obstacles.splice(i, 1);
        }

        if (
            squaresColliding(player, o)
        ) {
            cardScore.textContent = score--;
            card.style.display = "block";
            cancelAnimationFrame(animationId);
            window.localStorage.setItem('highscore', highscore);
        }

        o.Update();
    }

    player.Animate();

    score++;
    scoreText.t = "Score: " + score;
    scoreText.Draw();

    if (score > highscore) {
        highscore = score;
        highscoreText.t = "Highscore: " + highscore;
    }

    highscoreText.Draw();


    gameSpeed += 0.003;
}
//Restart game
document.getElementById("restartGameBtn").addEventListener("click", restartGame, this);
document.getElementById("tweetBtn").addEventListener("click", tweetScore, this);

function restartGame(button) {
    card.style.display = "none";
    //button.blur();
    Start();
}

function tweetScore(button) {
    let text = `Scored ${highscore} on AvaRun %23SaveWarriorNun %23WarriorNun%0A`
    let link = window.location.href;
    let twitterUrl = "https://twitter.com/intent/tweet/";
    let twitterQuery = `text=${text}&url=${link}`
    window.open(`${twitterUrl}?${twitterQuery}&`, '_blank');
}
Start();
