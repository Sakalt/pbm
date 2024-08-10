const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let coins = 0;
let gems = 0;  // 新しい通貨: 宝石
let frames = Array.from({ length: 10 }).map(() => null);
let ballPrice = 100;
let ballTextures = ['poland', 'germany', 'france', 'usa', 'china', 'japan', 'russia', 'india', 'brazil', 'canada'];
let ballPowers = { 'poland': 10, 'germany': 20, 'france': 30, 'usa': 40, 'china': 50, 'japan': 60, 'russia': 70, 'india': 80, 'brazil': 90, 'canada': 100 };
let ballSpeed = { 'poland': 1, 'germany': 1.2, 'france': 1.4, 'usa': 1.6, 'china': 1.8, 'japan': 2.0, 'russia': 2.2, 'india': 2.4, 'brazil': 2.6, 'canada': 2.8 };
let isMerging = false;
let fruits = [];  // 果物の配列

function drawFrames() {
    frames.forEach((ball, index) => {
        const frame = document.getElementById(`frame${index}`);
        if (ball) {
            const img = new Image();
            img.src = ball.texture;
            img.onload = () => {
                frame.innerHTML = '';
                frame.appendChild(img);
            };
        } else {
            frame.innerHTML = '';
        }
    });
}

function spawnBall() {
    const texture = ballTextures[Math.floor(Math.random() * ballTextures.length)];
    const image = new Image();
    image.src = `images/${texture}.png`;
    image.onload = () => {
        const power = ballPowers[texture] || 10;
        const speed = ballSpeed[texture] || 1;

        const emptyIndex = frames.indexOf(null);
        if (emptyIndex !== -1) {
            frames[emptyIndex] = {
                x: Math.random() * (canvas.width - 60),
                y: Math.random() * (canvas.height - 60),
                image: image,
                power: power,
                speed: speed,
                texture: `images/${texture}.png`
            };
            drawFrames();
        }
    };
}

function spawnFruit() {
    const size = 30 + Math.random() * 20;
    fruits.push({
        x: Math.random() * (canvas.width - size),
        y: Math.random() * (canvas.height - size),
        size: size,
        hardness: 1,  // 初期固さ
        value: 10  // 初期コイン価値
    });
}

function updateFruitGrowth() {
    fruits.forEach(fruit => {
        fruit.size += 0.1;  // 果物の成長
        fruit.hardness += 0.05;  // 固さの増加
        fruit.value += 1;  // コイン価値の増加
    });
}

function buyBall() {
    if (coins >= ballPrice) {
        coins -= ballPrice;
        ballPrice += 50;
        document.getElementById('coins').innerText = `コイン: ${coins}`;
    }
}

function toggleMergeMode() {
    isMerging = !isMerging;
    document.getElementById('mergeMode').innerText = isMerging ? 'マージモード: ON' : 'マージモード: OFF';
}

function mergeBalls(frameIndex1, frameIndex2) {
    const ball1 = frames[frameIndex1];
    const ball2 = frames[frameIndex2];

    if (ball1 && ball2 && ball1.texture === ball2.texture) {
        const textureIndex = ballTextures.indexOf(ball1.texture.split('/').pop().split('.')[0]);
        const nextIndex = textureIndex + 1;

        if (nextIndex < ballTextures.length) {
            const newTexture = ballTextures[nextIndex];
            const newImage = new Image();
            newImage.src = `images/${newTexture}.png`;

            newImage.onload = () => {
                frames[frameIndex1] = {
                    x: (ball1.x + ball2.x) / 2,
                    y: (ball1.y + ball2.y) / 2,
                    image: newImage,
                    power: ball1.power + ball2.power,
                    speed: ball1.speed + 0.2,
                    texture: `images/${newTexture}.png`
                };
                frames[frameIndex2] = null;
                drawFrames();
            };
        }
    }
}

function crushFruits(ball) {
    fruits.forEach((fruit, index) => {
        const dx = ball.x - fruit.x;
        const dy = ball.y - fruit.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < fruit.size + 30) {
            if (ball.power > fruit.hardness) {
                coins += fruit.value;
                gems += 1;  // 宝石を1個獲得
                fruits.splice(index, 1);  // 果物を削除
                document.getElementById('coins').innerText = `コイン: ${coins}`;
                document.getElementById('gems').innerText = `宝石: ${gems}`;
            }
        }
    });
}

function moveBalls() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    fruits.forEach(fruit => {
        ctx.fillStyle = 'orange';
        ctx.beginPath();
        ctx.arc(fruit.x, fruit.y, fruit.size, 0, 2 * Math.PI);
        ctx.fill();
    });

    frames.forEach((ball) => {
        if (ball) {
            ball.x += ball.speed;
            ball.y += ball.speed;

            // ボールの移動範囲を制限
            if (ball.x + 60 > canvas.width) ball.x = canvas.width - 60;
            if (ball.y + 60 > canvas.height) ball.y = canvas.height - 60;
            if (ball.x < 0) ball.x = 0;
            if (ball.y < 0) ball.y = 0;

            ctx.drawImage(ball.image, ball.x, ball.y, 60, 60);
            crushFruits(ball);
        }
    });
    requestAnimationFrame(moveBalls);
}

function animateBalls() {
    frames.forEach((ball) => {
        if (ball) {
            // ボールのアニメーション処理（例: 回転）
            ctx.save();
            ctx.translate(ball.x + 30, ball.y + 30);
            ctx.rotate(Date.now() / 1000);
            ctx.drawImage(ball.image, -30, -30, 60, 60);
            ctx.restore();
        }
    });
    requestAnimationFrame(animateBalls);
}

function openGemShop() {
    alert('宝石ショップ: ここで特別なアップグレードやアイテムを購入できます！');
}

function upgradeBall(frameIndex) {
    const ball = frames[frameIndex];
    if (ball && coins >= 200) {  // アップグレードの価格
        coins -= 200;
        ball.power += 20;
        ball.speed += 0.5;
        document.getElementById('coins').innerText = `コイン: ${coins}`;
        drawFrames();
    } else {
        alert('コインが不足しています。');
    }
}

function autoCollect() {
    frames.forEach(ball => {
        if (ball) {
            fruits.forEach((fruit, index) => {
                const dx = ball.x - fruit.x;
                const dy = ball.y - fruit.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < fruit.size + 30) {
                    if (ball.power > fruit.hardness) {
                        coins += fruit.value;
                        gems += 1;
                        fruits.splice(index, 1);
                        document.getElementById('coins').innerText = `コイン: ${coins}`;
                        document.getElementById('gems').innerText = `宝石: ${gems}`;
                    }
                }
            });
        }
    });
}

// フレーム要素を動的に生成
function createFrames() {
    const framesContainer = document.getElementById('frames');
    for (let i = 0; i < 10; i++) {
        const frame = document.createElement('div');
        frame.className = 'frame';
        frame.id = `frame${i}`;
        framesContainer.appendChild(frame);
    }
}

document.getElementById('buyBall').addEventListener('click', buyBall);
document.getElementById('toggleMerge').addEventListener('click', toggleMergeMode);
document.getElementById('gemShop').addEventListener('click', openGemShop);
document.getElementById('upgradeBall').addEventListener('click', () => {
    const frameIndex = parseInt(prompt('アップグレードするボールのFrame Indexを入力してください (0-9):'));
    if (!isNaN(frameIndex) && frameIndex >= 0 && frameIndex < 10) {
        upgradeBall(frameIndex);
    } else {
        alert('無効なフレームインデックスです。');
    }
});

setInterval(spawnBall, 5000);
setInterval(spawnFruit, 7000);
setInterval(updateFruitGrowth, 1000);
setInterval(() => {
    coins += 10;
    document.getElementById('coins').innerText = `コイン: ${coins}`;
}, 10000);

moveBalls();
animateBalls();
createFrames(); // フレーム要素を生成
