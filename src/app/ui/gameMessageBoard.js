const msgBoardStatements = {
    preGameStart: `<strong>Drag</strong> your ships into the board.
    Click the <strong>Start Game</strong> button when you are ready.`,
    afterGameStart: `<strong>Game started!</strong> Your turn to attack.
    <strong>Click</strong> a coordinate on Enemy's board to shoot it.`,
    playerShotMiss: `<strong>You</strong> shot and <strong>Missed</strong>,
    Enemy's turn to attack!`,
    playerShotHit: `<strong>You</strong> shot and <strong>Hit</strong>,
    Enemy's turn to attack!`,
    enemyShotMiss: `<strong>Enemy</strong> shot and <strong>Missed</strong>,
    Your turn to attack!`,
    enemyShotHit: `<strong>Enemy</strong> shot and <strong>Hit</strong>,
    Your turn to attack!`,
    enemyGameWin: `<strong>Oh No</strong>! The enemy successfully <strong>Sank</strong> all your ships!`,
    playerGameWin: `<strong>Congratulations</strong>! You <strong>Sank</strong> all Enemy's ships!`
};

const msgBoardContentElm = document.querySelector('#msg-board-content')

function displayMsg(statement){
    msgBoardContentElm.innerHTML = statement;
}

export function displayPreGameStartMsg(){
    displayMsg(msgBoardStatements.preGameStart);
}

export function displayAfterGameStartMsg(){
    displayMsg(msgBoardStatements.afterGameStart);
}   

export function displayPlayerShotMiss(){
    displayMsg(msgBoardStatements.playerShotMiss);
}

export function displayPlayerShotHit(){
    displayMsg(msgBoardStatements.playerShotHit);
}

export function displayEnemyShotMiss(){
    displayMsg(msgBoardStatements.enemyShotMiss);
}

export function displayEnemyShotHit(){
    displayMsg(msgBoardStatements.enemyShotHit);
}

export function displayEnemyGameWin(){
    displayMsg(msgBoardStatements.enemyGameWin);
}

export function displayPlayerGameWinMsg(){
    displayMsg(msgBoardStatements.playerGameWin);
}