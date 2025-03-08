import './style.css';
import Ship from './app/model/Ship';
import Gameboard from './app/model/Gameboard';
import Player from './app/model/Player';
import { shipsFleetHTMLElement } from './app/utils/gameUIHTMLComponents';
import { displayAfterGameStartMsg, displayEnemyGameWin, displayEnemyShotHit, displayEnemyShotMiss, displayPlayerGameWinMsg, displayPlayerShotHit, displayPlayerShotMiss } from './app/ui/gameMessageBoard';

/* 
    TODO:
        * Split the codebase to different modules
        * Reimplement and clean up weird and messy code I wrote
        * Add a random time function for the enemy move setTimeout
        * Make the computer enemy make smarter plays (Implement)
        * Implement a better play again functionality
        * Try to come up with a better game win scene
*/

const enemyPlayer = new Player('evil123', true);
const gameB = new Gameboard();
const shipFullName = {
    carr: 'Carrier',
    batt: 'Battleship',
    des: 'Destroyer',
    sub: 'Submarine',
    pab: 'Patrol Boat'
};

const playerGameboard = document.querySelector('#player-gameboard');

const activePlayers = {
    player: 'player',
    enemy: 'enemy'
}
let currentPlayerTurn = activePlayers.player;

initPlayerGameboardUI();
function initPlayerGameboardUI(){
    for (let i = 0; i < 10 /*rows*/; i++) {
        for (let j = 0; j < 10 /*columns*/; j++) {
            const playerGameboardSquare = document.createElement('div');
            playerGameboardSquare.classList.add('player-gameboard-square');
            playerGameboardSquare.setAttribute('data-row', i);
            playerGameboardSquare.setAttribute('data-col', j);
            playerGameboard.append(playerGameboardSquare);
        }
    }
}

function createAndInitEnemyGameboardUI(){
    const enemyGameboardWrapper = document.createElement('div');
    enemyGameboardWrapper.id = 'enemy-gameboard-wrapper';
    const enemyGameboardHeader = document.createElement('h2');
    enemyGameboardHeader.innerHTML = `<span>Enemy: ${enemyPlayer.name}</span>`;
    const enemyGameboard = document.createElement('div');
    enemyGameboard.id = 'enemy-gameboard';

    for (let i = 0; i < 10 /*rows*/; i++) {
        for (let j = 0; j < 10 /*columns*/; j++) {
            const enemyGameboardSquare = document.createElement('div');
            enemyGameboardSquare.classList.add('enemy-gameboard-square');
            enemyGameboardSquare.setAttribute('data-row', i);
            enemyGameboardSquare.setAttribute('data-col', j);
            enemyGameboardSquare.addEventListener('click', enemyGameboardSquareEventHandler);
            enemyGameboard.append(enemyGameboardSquare);
        }
    }    
    enemyGameboardWrapper.append(enemyGameboardHeader, enemyGameboard);
    document.querySelector('main').insertAdjacentElement('beforeend', enemyGameboardWrapper);
}

function enemyGameboardSquareEventHandler(e){
    if(currentPlayerTurn === activePlayers.enemy) return;

    if(currentPlayerTurn === activePlayers.player){
        const enemyReceivedAttackStatus = enemyPlayer.gameboard.receiveAttack([e.target.getAttribute('data-row'), e.target.getAttribute('data-col')]);
        if (enemyReceivedAttackStatus === null) {
            document.querySelector('#enemy-gameboard').classList.add('apply-shake');
            setTimeout(()=>{
                document.querySelector('#enemy-gameboard').classList.remove('apply-shake');
            },500);
            return;
        }
        if (enemyReceivedAttackStatus) {
            e.target.classList.add('player-attack-success-hit');
            displayPlayerShotHit();

        } else {
            e.target.classList.add('player-attack-miss');
            displayPlayerShotMiss();
        }
    }
    if(enemyPlayer.gameboard.allShipsSunkCheck()){ //Checking if player wins (Player sunk all Enemy ships)
        document.querySelectorAll('.enemy-gameboard-square').forEach((sqr) => sqr.removeEventListener('click', enemyGameboardSquareEventHandler));
        displayPlayerGameWinMsg();
        document.querySelector('#enemy-gameboard').classList.add('end-game-boards', 'loser-board');
        document.querySelector('#player-gameboard').classList.add('end-game-boards');
        document.querySelector('#player-gameboard-wrapper').classList.add('winner-board-wrapper');
        document.querySelectorAll('.enemy-gameboard-square').forEach((sqr) => sqr.style.cursor = 'default');
        insertCrownsInWinnersName(document.querySelector('#player-gameboard-wrapper h2 span'));
        initPlayAgainButton();
        return;
    }
    currentPlayerTurn = activePlayers.enemy;

    //Enemy Response (Delayed for realistic game experience):
    setTimeout(() => {
        let randomlyGeneratedCoordPair = generateRandomCoordPair();
        let playerReceivedAttackStatus = gameB.receiveAttack(randomlyGeneratedCoordPair);
        while (true) { //Keep generating coordination pairs until it doesnt land on Ship hit or missed hit
            if (playerReceivedAttackStatus !== null) break; 
            randomlyGeneratedCoordPair = generateRandomCoordPair();
            playerReceivedAttackStatus = gameB.receiveAttack(randomlyGeneratedCoordPair);
        }
        if (playerReceivedAttackStatus) {
            const attackedBoardSqr = playerGameboard.querySelector(`[data-row="${randomlyGeneratedCoordPair[0]}"][data-col="${randomlyGeneratedCoordPair[1]}"]`);
            attackedBoardSqr.firstChild.classList.add('enemy-attack-success-hit');
            displayEnemyShotHit();
        } else {
            const attackedBoardSqr = playerGameboard.querySelector(`[data-row="${randomlyGeneratedCoordPair[0]}"][data-col="${randomlyGeneratedCoordPair[1]}"]`);
            attackedBoardSqr.classList.add('enemy-attack-miss');
            displayEnemyShotMiss();
        }
        // console.table(enemyPlayer.gameboard.board);
        currentPlayerTurn = activePlayers.player;

        if(gameB.allShipsSunkCheck()){ //Checking if enemy wins (Enemy sunk all Player ships)
            document.querySelectorAll('.enemy-gameboard-square').forEach((sqr) => sqr.removeEventListener('click', enemyGameboardSquareEventHandler));
            displayEnemyGameWin();
            document.querySelector('#player-gameboard').classList.add('end-game-boards', 'loser-board');
            document.querySelector('#enemy-gameboard').classList.add('end-game-boards');
            document.querySelector('#enemy-gameboard-wrapper').classList.add('winner-board-wrapper');
            document.querySelectorAll('.enemy-gameboard-square').forEach((sqr) => sqr.style.cursor = 'default');
            insertCrownsInWinnersName(document.querySelector('#enemy-gameboard-wrapper h2 span'));
            initPlayAgainButton();
            return;
        }
    }, 2000); //Default: 2000 (should be random value between 2000ms-5000ms)
}

/*                                       */
/* DRAG AND DROP IMPLEMENTATION - START */
/*                                     */
let dragged;
let verticalMode = false;
function onDragStart(event) {
    if(event.target && event.target.classList.contains('draggable-ship')){
        dragged = event.target;
        event.target.style.opacity = .3;
        event.dataTransfer.setData('text/html', dragged.innerHTML);
        event.dataTransfer.effectAllowed = 'move';    
    }
}

function onDragEnd(event) {
    dragged = null;
    event.target.style.opacity = ''; // reset opacity when drag ends 
    document.querySelectorAll('.player-gameboard-square').forEach((sqr) => {
        sqr.classList.remove('drag-ship-valid-bg', 'drag-ship-invalid-bg');
    });    
}

initDraggableShipsListeners();
function initDraggableShipsListeners(){
    const draggableShips = document.querySelectorAll('.draggable-ship');
    draggableShips.forEach((ship) => {
        ship.addEventListener('dragstart', onDragStart);
        ship.addEventListener('dragend', onDragEnd);
    });
}

function onDragOver(event) {
    // Prevent default to allow drop
    event.preventDefault();
}

function onDragLeave(event) {
    event.preventDefault();
    // event.target.style.background = '';
    // event.target.removeAttribute('style');
}

//VISUAL
function onDragEnter(event) {
    event.preventDefault();
    const target = event.target;
    if (target && !target.childNodes.length /*Square Exists and is empty*/) {
        // event.dataTransfer.dropEffect = 'move';
        //Clear board
        document.querySelectorAll('.player-gameboard-square').forEach((sqr) => {
            sqr.classList.remove('drag-ship-valid-bg', 'drag-ship-invalid-bg');
        });   

        let sqrElementArr = [];
        for(let i = 0; i < dragged.getAttribute('data-ship-size'); i++){
            sqrElementArr.push(document.querySelector(verticalMode ? 
            `[data-row="${Number(target.getAttribute('data-row')) + i}"][data-col="${target.getAttribute('data-col')}"]` :
            `[data-row="${target.getAttribute('data-row')}"][data-col="${Number(target.getAttribute('data-col')) + i}"]`
            ));
        }    

        sqrElementArr = sqrElementArr.filter(sqr => sqr); //Clear up arr from nulls
        const checkForbiddenShipZone = sqrElementArr.some(sqr => sqr.getAttribute('data-forbidden-ship-zone') === 'true'); //Checks if any square is considered forbidden zone
        
        const sqrValidCondition = sqrElementArr.length === Number(dragged.getAttribute('data-ship-size')) && !checkForbiddenShipZone;
        sqrElementArr.forEach((sqr) => {
            sqr.classList.add(sqrValidCondition ? 'drag-ship-valid-bg' : 'drag-ship-invalid-bg');
        })
    }
}

function onDrop(event) {
    event.stopPropagation();
    event.stopImmediatePropagation();
    event.preventDefault();
    const target = event.target;
    if (target && !target.childNodes.length && !target.classList.contains('drag-ship-invalid-bg')) {
        const shipPlaceValid = gameB.placeShip(new Ship(dragged.getAttribute('data-ship-id'), shipFullName[dragged.getAttribute('data-ship-id')], Number(dragged.getAttribute('data-ship-size'))), [Number(target.getAttribute('data-row')), Number(target.getAttribute('data-col'))], verticalMode ? 'V' : 'H');
        if(shipPlaceValid){
            dragged.removeAttribute('draggable');
            dragged.classList.remove('draggable-ship');
            dragged.parentNode.removeChild(dragged);

            for(let i = 0; i < dragged.getAttribute('data-ship-size'); i++){
                const elm = dragged.cloneNode(true);
                elm.style.opacity = '';
                elm.textContent = '';
                
                verticalMode ? elm.classList.add('placed-ship-vertical') : elm.classList.add('placed-ship-horizontal');
                i === 0 ? verticalMode ? (elm.style.borderTop = '3px solid #0039ff') : elm.style.borderLeft = '3px solid #0039ff' : null;
                i === dragged.getAttribute('data-ship-size') - 1 ? verticalMode ? elm.style.borderBottom = '3px solid #0039ff' : elm.style.borderRight = '3px solid #0039ff'  : null;
                
                const currBoardSqr = document.querySelector(verticalMode ? 
                    `[data-row="${Number(target.getAttribute('data-row')) + i}"][data-col="${target.getAttribute('data-col')}"]` :
                    `[data-row="${target.getAttribute('data-row')}"][data-col="${Number(target.getAttribute('data-col')) + i}"]`);
                currBoardSqr.appendChild(elm);
                currBoardSqr.classList.add('sqr-no-borders');
            }
            //Marking all forbidden ship zones
            for (let i = 0; i < 10 /*rows*/; i++) {
                for (let j = 0; j < 10 /*columns*/; j++) {
                    if(gameB.board[i][j] === '-'){
                        const currBoardSqr = playerGameboard.querySelector(`[data-row="${i}"][data-col="${j}"]`);
                        currBoardSqr.setAttribute('data-forbidden-ship-zone','true');
                    }
                }
            }
            if(gameB.allShipsPlaced()){
                initStartGameButton();
            }
        }
        console.table(gameB.board);
    }
}

playerGameboard.addEventListener('drop', onDrop);
playerGameboard.addEventListener('dragenter', onDragEnter);
playerGameboard.addEventListener('dragleave', onDragLeave);
playerGameboard.addEventListener('dragover', onDragOver);

const rotateShipVerticalBtn = document.querySelector('#rotate-vertical'); 
rotateShipVerticalBtn.addEventListener('click', () => {
    verticalMode = true;
    rotateShipVerticalBtn.classList.add('rotate-btn-selected');
    rotateShipHorizontalBtn.classList.remove('rotate-btn-selected');
});
const rotateShipHorizontalBtn = document.querySelector('#rotate-horizontal');
rotateShipHorizontalBtn.addEventListener('click', () => {
    verticalMode = false;
    rotateShipHorizontalBtn.classList.add('rotate-btn-selected');
    rotateShipVerticalBtn.classList.remove('rotate-btn-selected');
});

const resetBoardBtn = document.querySelector('#reset-ship-board');
resetBoardBtn.addEventListener('click', () => {
    document.querySelector('#ships-fleet').innerHTML = shipsFleetHTMLElement;
    initDraggableShipsListeners();

    //reset gui board
    playerGameboard.innerHTML = '';
    initPlayerGameboardUI();

    //reset gameboard
    gameB.resetBoard();

    if(document.querySelector('#start-game-btn')){
        document.querySelector('#start-game-btn').remove();
    }
});

/*                                     */
/* DRAG AND DROP IMPLEMENTATION - END */
/*                                   */

function initStartGameButton(){
    const startGameBtn = document.createElement('button');
    startGameBtn.id = 'start-game-btn';
    startGameBtn.textContent = 'Start Game';
    startGameBtn.addEventListener('click', () => {
        document.querySelector('#ships-controls').innerHTML = '<div id="general-loader-container"><span id="general-loader"></span> Enemy Placing Ships... </div>';
        setTimeout(() => {
            placeEnemyShipsRandomly();
            document.querySelector('#general-loader-container').remove();
            createAndInitEnemyGameboardUI();
            document.querySelector('#player-gameboard-wrapper').classList.add('secondStage-player-gameboard-wrapper');
            displayAfterGameStartMsg();
        }, 2000) //7000
    });
    document.querySelector('#ships-controls').appendChild(startGameBtn);
}

function initPlayAgainButton(){
    const playAgainBtn = document.createElement('button');
    playAgainBtn.id = 'play-again-btn';
    playAgainBtn.textContent = 'Play Again?'; 
    playAgainBtn.addEventListener('click', () => { //TODO: Add loading animation like in start game
        document.querySelector('#play-again-btn').id = 'general-loader-container';
        document.querySelector('#general-loader-container').innerHTML = '<span id="general-loader"></span> Restarting game...';
        setTimeout(() => {
            // document.querySelector('#enemy-gameboard-wrapper').remove();
            
            // currentPlayerTurn === activePlayers.player ? 
            // document.querySelectorAll('#player-gameboard-wrapper h2 span svg').forEach((svgElm) => svgElm.remove()) :
            // document.querySelectorAll('#enemy-gameboard-wrapper h2 span svg').forEach((svgElm) => svgElm.remove());
            // document.querySelector('#player-gameboard-wrapper').className = '';
            // document.querySelector('#player-gameboard').className = '';
            // playerGameboard.innerHTML = '';
            // initPlayerGameboardUI();
            // gameB.resetBoard();
    
            // document.querySelector('#ships-controls').innerHTML = shipsControlHTMLElement;
            // initDraggableShipsListeners();

            // //REFACTOR THIS SHIT>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
            // rotateShipVerticalBtn.addEventListener('click', () => {
            //     verticalMode = true;
            //     rotateShipVerticalBtn.classList.add('rotate-btn-selected');
            //     rotateShipHorizontalBtn.classList.remove('rotate-btn-selected');
            // });

            // rotateShipHorizontalBtn.addEventListener('click', () => {
            //     verticalMode = false;
            //     rotateShipHorizontalBtn.classList.add('rotate-btn-selected');
            //     rotateShipVerticalBtn.classList.remove('rotate-btn-selected');
            // });

            // resetBoardBtn.addEventListener('click', () => {
            //     document.querySelector('#ships-fleet').innerHTML = shipsFleetHTMLElement;
            //     initDraggableShipsListeners();
            
            //     //reset gui board
            //     playerGameboard.innerHTML = '';
            //     initPlayerGameboardUI();
            
            //     //reset gameboard
            //     gameB.resetBoard();
            
            //     if(document.querySelector('#start-game-btn')){
            //         document.querySelector('#start-game-btn').remove();
            //     }
            // });
            // //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

            document.querySelector('#general-loader-container').remove();
            window.location.reload(); //Refreshes Web Page
        }, 4000);
    });
    document.querySelector('main').insertAdjacentElement('beforebegin',playAgainBtn);
}

function placeEnemyShipsRandomly(){
    const shipsFleet = [
        new Ship('carr', 'Carrier', 5),
        new Ship('batt', 'Battleship', 4),
        new Ship('des', 'Destroyer', 3),
        new Ship('sub', 'Submarine', 3),
        new Ship('pab', 'Patrol Boat', 2),
    ]
    for (let i = 0; i < 5;) {
        const validShipPlacement = enemyPlayer.gameboard.placeShip(shipsFleet[i], generateRandomCoordPair(), generateRandomDirection());
        if(validShipPlacement){
            i++;
        }
    }
    console.log('Randomly Generated Enemy Board:')
    console.table(enemyPlayer.gameboard.board);
}

function generateRandomCoordPair(){
    return [Math.round((Math.random() * 9)), Math.round((Math.random() * 9))];
    // return [Math.floor((Math.random() * 9) + 1), Math.floor((Math.random() * 9) + 1)];
}

function generateRandomDirection(){
    const directions = [
        'V',
        'H'
    ]
    return directions[Math.round(Math.random())];
}

function insertCrownsInWinnersName(winnerNameElm){
    const crownSVG = `<svg width="30px" height="30px" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" class="iconify iconify--noto" preserveAspectRatio="xMidYMid meet" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M94.52 21.81c2.44-1.18 4.13-3.67 4.13-6.56a7.28 7.28 0 0 0-14.56 0c0 2.93 1.73 5.44 4.22 6.6c-2.88 15.6-7.3 27.21-23.75 29.69c0 0 4.43 22.15 25.15 22.15s22.82-21.93 22.82-21.93c-16.81.86-18.23-20.27-18.01-29.95z" fill="#f19534"></path><path d="M34.74 21.81c-2.44-1.18-4.13-3.67-4.13-6.56a7.28 7.28 0 0 1 14.56 0c0 2.93-1.73 5.44-4.22 6.6c2.88 15.6 7.3 27.21 23.75 29.69c0 0-4.43 22.15-25.15 22.15S16.74 51.77 16.74 51.77c16.8.85 18.22-20.28 18-29.96z" fill="#f19534"></path><path d="M89.43 73.69c.09 0 .18.01.27.01c5.71 0 10-1.67 13.22-4.08l-13.49 4.07z" fill="#ffca28"></path><path d="M119.24 16.86c-3.33-.45-6.51 2.72-7.09 7.06c-.36 2.71.37 5.24 1.78 6.87l-2.4 9.95s-3.67 23.51-22.21 28.15C74.5 72.6 69.13 45.47 67.83 37.09c2.82-1.4 4.77-4.3 4.77-7.67c0-4.73-3.83-8.56-8.56-8.56s-8.56 3.83-8.56 8.56c0 3.39 1.98 6.32 4.85 7.7c-1.03 8.27-5.57 34.5-21.57 31.76c-16.24-2.79-23.33-30.14-24.97-37.58c1.95-1.6 3.04-4.42 2.64-7.45c-.58-4.35-4.02-7.47-7.68-6.98c-3.66.49-6.15 4.41-5.57 8.75c.42 3.16 2.36 5.67 4.79 6.62l12.72 79.03s11.1 8.77 43.35 8.77s43.35-8.77 43.35-8.77l12.75-79.24c2.06-1.08 3.68-3.51 4.08-6.49c.59-4.35-1.64-8.23-4.98-8.68z" fill="#ffca28"></path><ellipse cx="64.44" cy="88.3" rx="9.74" ry="11.61" fill="#26a69a"></ellipse><path d="M64.44 79.56c.38.42.72 1.19 0 2.69s-4.6 3.53-5.31 3.94c-.71.42-1.18.23-1.4.06c-1.05-.84-.65-2.74.03-3.9c1.46-2.51 4.55-5.1 6.68-2.79z" fill="#69f0ae"></path><path d="M63.72 92.63c-1.1.53-4.71 2.14-3.52 4.05c.7 1.13 2.15 1.61 3.48 1.67c1.33.06 2.64-.36 3.82-.97c5.6-2.9 6.05-10.52 4.96-11.1c-1.12-.6-1.88.95-2.46 1.61a20.266 20.266 0 0 1-6.28 4.74z" fill="#00796b"></path><path d="M118.09 78.8c1.56-8.63-4.24-10.79-4.24-10.79s-3.74-.68-5.5 9.03c-1.76 9.7 1.98 10.38 1.98 10.38s6.19.01 7.76-8.62z" fill="#26a69a"></path><path d="M115.51 70.96c1.36 1.82-.25 4.51-2.86 6.3c-.77.53-1.79.33-1.94-.11c-.42-1.26-.24-2.69.32-3.9c1.66-3.63 3.79-3.21 4.48-2.29z" fill="#69f0ae"></path><path d="M9.76 79.06C8.19 70.44 14 68.27 14 68.27s3.74-.68 5.5 9.03c1.76 9.7-1.98 10.38-1.98 10.38s-6.2.01-7.76-8.62z" fill="#26a69a"></path><path d="M15.78 71.2c1.34 1 .79 2.31-.22 3.22c-1.15 1.05-2.03 2.2-3.01 3.39c-.15.18-.32.38-.56.43c-.46.1-.83-.37-.98-.82c-.43-1.26-.35-2.74.29-3.9c1.82-3.31 3.96-2.71 4.48-2.32z" fill="#69f0ae"></path><path d="M99.99 87.16c-.69 3.93-3.84 6.66-7.05 6.1c-3.21-.56-3.65-3.91-2.96-7.84c.69-3.93 2.24-6.94 5.44-6.38c3.21.56 5.26 4.2 4.57 8.12z" fill="#f44336"></path><path d="M30.43 87.16c.69 3.93 3.84 6.66 7.05 6.1s3.65-3.91 2.96-7.84c-.69-3.93-2.24-6.94-5.44-6.38s-5.25 4.2-4.57 8.12z" fill="#f44336"></path><path d="M35.08 84.54c-.73.82-2.51 2.47-3.14 1.21c-.86-1.72.33-4.32 1.69-5.18c1.36-.86 2.47-.18 2.66.59c.23.98-.56 2.64-1.21 3.38z" fill="#ffa8a4"></path><path d="M91.98 87.05c-.99-.15-1.1-3.56 1.56-6.24c1.27-1.28 3.09.24 2.63 2.29c-.44 1.95-2.38 4.23-4.19 3.95z" fill="#ffa8a4"></path><path d="M109.15 98.21c-5.99 3-19.73 10.99-45.1 10.99s-39.11-7.99-45.1-10.99c0 0-2.15 1.15-2.15 2.35v9.21c0 1.23.65 2.36 1.71 2.99c4.68 2.76 18.94 9.28 45.55 9.28s40.87-6.52 45.55-9.28a3.475 3.475 0 0 0 1.71-2.99v-9.21c-.02-1.2-2.17-2.35-2.17-2.35z" fill="#ffca28"></path><path d="M39.6 110.84c2.8.55 3.65.79 3.46 2.35c-.39 3.07-6.76 2.34-10.53 1.35c-7.79-2.05-9.37-4.21-9.37-6.14c0-1.77 1.36-1.98 3.46-1.24c2.51.89 6.39 2.39 12.98 3.68z" fill="#fff59d"></path><path d="M109.15 100.23s-16.57 9.38-45.1 9.38s-45.1-9.38-45.1-9.38" fill="none" stroke="#f19534" stroke-width="4" stroke-linecap="round" stroke-miterlimit="10"></path><path d="M26.97 49.57c5.32-3.8 8.18-10.61 8.43-21.45c.02-.98.3-1.27.83-1.33c.85-.09.99.68.98 1.23c-.24 11.7-1.73 19.01-7.63 23.13c-.29.2-2.36 1.46-3.24.59c-1.05-1.02.29-1.93.63-2.17z" fill="#ffca28"></path><path d="M31.84 15.54c-.17-1.81.25-5.07 5-6.55c1.39-.43 2.25.25 2.41.78c.4 1.32-.76 1.84-1.29 2.01c-3.65 1.18-3.83 3-4.58 4.16s-1.48.15-1.54-.4z" fill="#ffca28"></path><path d="M78.22 47.17c4.81-4.27 8-9.04 10.1-19.9c.19-.96.47-1.22.99-1.2c.85.02.89.81.8 1.35c-1.78 11.58-3.47 14.88-9.4 21.45c-.67.74-2.3 1.41-3.22.64c-.83-.69.13-1.8.73-2.34z" fill="#ffca28"></path><path d="M85.3 15.63c-.17-1.81.25-5.07 5-6.55c1.39-.43 2.25.25 2.41.78c.4 1.32-.76 1.84-1.29 2.01c-3.65 1.18-3.83 3-4.58 4.16c-.74 1.16-1.48.15-1.54-.4z" fill="#ffca28"></path><path d="M31.59 71.62C19.97 66.35 16.55 52.6 14.73 46.63c-.24-.79-.12-1.54.67-1.78s1.26.27 1.51 1.06c1.32 4.33 6.45 18.79 17.04 22.9c.77.3 1.97 1.03 1.32 2.28c-.43.81-1.81 1.38-3.68.53z" fill="#fff59d"></path><path d="M12.68 24.63c-.56-1.16-.79-2.26-3.84-3.53c-.77-.32-1.28-1.03-1.07-1.83s1.01-1.4 2.17-1.2c3.77.65 4.59 4.48 4.75 5.81c.15 1.28-1.44 1.91-2.01.75z" fill="#fff59d"></path><path d="M96.87 71.62c11.62-5.27 15.04-19.02 16.86-24.99c.24-.79.12-1.54-.67-1.78s-1.26.27-1.51 1.06c-1.32 4.33-6.45 18.79-17.04 22.9c-.77.3-1.97 1.03-1.32 2.28c.43.81 1.81 1.38 3.68.53z" fill="#fff59d"></path><path d="M115.78 24.63c.56-1.16.79-2.26 3.84-3.53c.77-.32 1.28-1.03 1.07-1.83s-1.01-1.4-2.17-1.2c-3.77.65-4.59 4.48-4.75 5.81c-.15 1.28 1.45 1.91 2.01.75z" fill="#fff59d"></path><path d="M59.38 29.55c.61-1.25 1.68-2.96 5.17-3.68c1.34-.28 1.73-.86 1.61-1.74c-.24-1.83-2.52-1.7-3.75-1.41c-4.1.96-5.01 4.6-5.18 6.04c-.17 1.37 1.55 2.04 2.15.79z" fill="#fff59d"></path></g></svg>`;
    winnerNameElm.insertAdjacentHTML('beforebegin', crownSVG);
    winnerNameElm.insertAdjacentHTML('afterend', crownSVG);
    // winnerNameElm.style.color = '#FFD700';
}