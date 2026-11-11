const gameContainer = document.getElementById('game-container');
const fullscreenBtn = document.getElementById('fullscreen-btn');
const startBtn = document.getElementById('start-btn');
const startOverlay = document.getElementById('start-overlay');
const scoreDisplay = document.getElementById('score');
const gameArea = document.querySelector('.game-area');

const keys = ['ArrowLeft', 'ArrowUp', 'ArrowDown', 'ArrowRight'];
const arrowSymbols = { 'ArrowLeft': '←', 'ArrowUp': '↑', 'ArrowDown': '↓', 'ArrowRight': '→' };
const laneIndexes = { 'ArrowLeft': 0, 'ArrowUp': 1, 'ArrowDown': 2, 'ArrowRight': 3 };

let score = 0;
let gameInterval;
let notes = [];
let gameActive = false;
let noteSpeed = 4; // Velocidade em pixels por frame
let spawnRate = 1000; // Tempo em milissegundos entre novas setas

// Mapeamento das posições X das pistas dinamicamente
function getLaneX(key) {
    const targets = document.querySelectorAll('.lane-target');
    const index = laneIndexes[key];
    if (targets[index]) {
        return targets[index].offsetLeft;
    }
    return 0;
}

// Evento de Tela Cheia
fullscreenBtn.addEventListener('click', () => {
    if (!document.fullscreenElement) {
        gameContainer.requestFullscreen().catch(err => {
            alert(`Erro ao tentar ativar tela cheia: ${err.message}`);
        });
    } else {
        document.exitFullscreen();
    }
});

// Iniciar o jogo
startBtn.addEventListener('click', () => {
    startOverlay.style.display = 'none';
    score = 0;
    scoreDisplay.textContent = score;
    notes.forEach(note => note.element.remove());
    notes = [];
    gameActive = true;
    
    // Inicia gerador de notas e o loop de atualização
    gameInterval = setInterval(spawnNote, spawnRate);
    requestAnimationFrame(updateGame);
});

// Criar uma nova nota/seta no fundo da tela
function spawnNote() {
    if (!gameActive) return;

    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    const noteElement = document.createElement('div');
    noteElement.classList.add('falling-note');
    noteElement.setAttribute('data-key', randomKey);
    noteElement.textContent = arrowSymbols[randomKey];
    
    // Alinha na pista horizontal correta
    noteElement.style.left = `${getLaneX(randomKey)}px`;
    noteElement.style.bottom = `-60px`; // Começa escondida abaixo

    gameArea.appendChild(noteElement);

    notes.push({
        element: noteElement,
        key: randomKey,
        bottom: -60
    });
}

// Loop principal de animação (sobe as setas)
function updateGame() {
    if (!gameActive) return;

    // Alvo fixo fica a aproximadamente 40px do topo (altura total - 40px - tamanho da nota)
    const containerHeight = gameArea.clientHeight;
    const targetBottomPosition = containerHeight - 40 - 60; 

    for (let i = notes.length - 1; i >= 0; i--) {
        let note = notes[i];
        note.bottom += noteSpeed;
        note.element.style.bottom = `${note.bottom}px`;

        // Se passar muito do alvo do topo, remove a nota e o jogador perde pontos
        if (note.bottom > containerHeight) {
            note.element.remove();
            notes.splice(i, 1);
            updateScore(-5);
        }
    }

    requestAnimationFrame(updateGame);
}

// Captura do teclado
window.addEventListener('keydown', (e) => {
    if (!gameActive || !keys.includes(e.key)) return;

    // Feedback visual na pista alvo do topo
    const targetNode = document.querySelector(`.lane-target[data-key="${e.key}"]`);
    if (targetNode) targetNode.classList.add('active');

    // Validação de acerto por proximidade
    const containerHeight = gameArea.clientHeight;
    const targetBottomPosition = containerHeight - 40 - 60; 

    // Encontra a nota mais próxima daquela pista digitada
    const exactNoteIndex = notes.findIndex(note => note.key === e.key);

    if (exactNoteIndex !== -1) {
        const note = notes[exactNoteIndex];
        // Distância absoluta entre o centro da nota e o centro do alvo
        const distance = Math.abs(note.bottom - targetBottomPosition);

        if (distance < 35) { // Janela de acerto Perfeito/Bom
            updateScore(10);
            createHitEffect(note.element);
            note.element.remove();
            notes.splice(exactNoteIndex, 1);
        } else if (distance < 70) { // Janela de acerto regular
            updateScore(5);
            note.element.remove();
            notes.splice(exactNoteIndex, 1);
        }
    }
});

// Remove classe visual ao soltar a tecla
window.addEventListener('keyup', (e) => {
    if (keys.includes(e.key)) {
        const targetNode = document.querySelector(`.lane-target[data-key="${e.key}"]`);
        if (targetNode) targetNode.classList.remove('active');
    }
});

function updateScore(points) {
    score += points;
    if (score < 0) score = 0; // Impede pontuação negativa abaixo de zero
    scoreDisplay.textContent = score;
}

// Pequeno efeito visual ao acertar perfeitamente
function createHitEffect(element) {
    // Você pode expandir aqui para criar partículas ou textos de "Perfect!"
}