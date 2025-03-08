export default class Gameboard {
    constructor(){ 
        this.board = createBoard(); //10x10 2d array
        this.missedAttacks = []; //coordinates pairs
        this.allShipsSunk = false;
        this.shipsFleet = [];
    }
    
    placeShip(ship, startCoordPair, direction /* Vertical/Horizontal */){ //Returns true and places ship if placement is legal, else returns false and does nothing
        if(this.#outOfBoardPlacement(ship.shipLength, startCoordPair, direction)) return false;
        if(this.#isShipSpotTaken(ship.shipLength, startCoordPair, direction)) return false;
        if(direction === Directions.Vertical){
            for (let i = 0; i < ship.shipLength; i++) {
                (this.board[startCoordPair[0] + i][startCoordPair[1] - 1] === gameBoardSigns.SeaWater) && (this.board[startCoordPair[0] + i][startCoordPair[1] - 1] = gameBoardSigns.shipZone);
                this.board[startCoordPair[0] + i][startCoordPair[1]] = ship.shipID;
                (this.board[startCoordPair[0] + i][startCoordPair[1] + 1] === gameBoardSigns.SeaWater) && (this.board[startCoordPair[0] + i][startCoordPair[1] + 1] = gameBoardSigns.shipZone);
            }
            //Before Start:
            ((startCoordPair[0] - 1 >= 0) && (this.board[startCoordPair[0] - 1][startCoordPair[1] - 1] === gameBoardSigns.SeaWater)) && (this.board[startCoordPair[0] - 1][startCoordPair[1] - 1] = gameBoardSigns.shipZone);
            ((startCoordPair[0] - 1 >= 0) && (this.board[startCoordPair[0] - 1][startCoordPair[1]] === gameBoardSigns.SeaWater)) && (this.board[startCoordPair[0] - 1][startCoordPair[1]] = gameBoardSigns.shipZone);
            ((startCoordPair[0] - 1 >= 0) && (this.board[startCoordPair[0] - 1][startCoordPair[1] + 1] === gameBoardSigns.SeaWater)) && (this.board[startCoordPair[0] - 1][startCoordPair[1] + 1] = gameBoardSigns.shipZone);
            //After End:
            ((startCoordPair[0] + ship.shipLength < BOARD_SIZE) && (this.board[startCoordPair[0] + ship.shipLength][startCoordPair[1] - 1] === gameBoardSigns.SeaWater)) && (this.board[startCoordPair[0] + ship.shipLength][startCoordPair[1] - 1] = gameBoardSigns.shipZone);
            ((startCoordPair[0] + ship.shipLength < BOARD_SIZE) && (this.board[startCoordPair[0] + ship.shipLength][startCoordPair[1]] === gameBoardSigns.SeaWater)) && (this.board[startCoordPair[0] + ship.shipLength][startCoordPair[1]] = gameBoardSigns.shipZone);
            ((startCoordPair[0] + ship.shipLength < BOARD_SIZE) && (this.board[startCoordPair[0] + ship.shipLength][startCoordPair[1] + 1] === gameBoardSigns.SeaWater)) && (this.board[startCoordPair[0] + ship.shipLength][startCoordPair[1] + 1] = gameBoardSigns.shipZone);
        }
        else if(direction === Directions.Horizontal){
            for (let i = 0; i < ship.shipLength; i++) {
                ((startCoordPair[0] - 1 >= 0) && (this.board[startCoordPair[0] - 1][startCoordPair[1] + i] === gameBoardSigns.SeaWater)) && (this.board[startCoordPair[0] - 1][startCoordPair[1] + i] = gameBoardSigns.shipZone);
                this.board[startCoordPair[0]][startCoordPair[1] + i] = ship.shipID;
                ((startCoordPair[0] + 1 < BOARD_SIZE) && (this.board[startCoordPair[0] + 1][startCoordPair[1] + i] === gameBoardSigns.SeaWater)) && (this.board[startCoordPair[0] + 1][startCoordPair[1] + i] = gameBoardSigns.shipZone);
            }
            //Before Start:
            ((startCoordPair[0] - 1 >= 0) && (this.board[startCoordPair[0] - 1][startCoordPair[1] - 1] === gameBoardSigns.SeaWater)) && (this.board[startCoordPair[0] - 1][startCoordPair[1] - 1] = gameBoardSigns.shipZone);
            (this.board[startCoordPair[0]][startCoordPair[1] - 1] === gameBoardSigns.SeaWater) && (this.board[startCoordPair[0]][startCoordPair[1] - 1] = gameBoardSigns.shipZone);
            ((startCoordPair[0] + 1 < BOARD_SIZE) && (this.board[startCoordPair[0] + 1][startCoordPair[1] - 1] === gameBoardSigns.SeaWater)) && (this.board[startCoordPair[0] + 1][startCoordPair[1] - 1] = gameBoardSigns.shipZone);
            //After End:
            ((startCoordPair[0] - 1 >= 0) && (this.board[startCoordPair[0] - 1][startCoordPair[1] + ship.shipLength] === gameBoardSigns.SeaWater)) && (this.board[startCoordPair[0] - 1][startCoordPair[1] + ship.shipLength] = gameBoardSigns.shipZone);
            (this.board[startCoordPair[0]][startCoordPair[1] + ship.shipLength] === gameBoardSigns.SeaWater) && (this.board[startCoordPair[0]][startCoordPair[1] + ship.shipLength] = gameBoardSigns.shipZone);
            ((startCoordPair[0] + 1 < BOARD_SIZE) && (this.board[startCoordPair[0] + 1][startCoordPair[1] + ship.shipLength] === gameBoardSigns.SeaWater)) && (this.board[startCoordPair[0] + 1][startCoordPair[1] + ship.shipLength] = gameBoardSigns.shipZone);
        }
        this.shipsFleet.push(ship);
        return true;
    }

    receiveAttack(coordPair){  //Returns true and receives attack if legal, else returns false and adds coord to missedAttacks
        if(this.board[coordPair[0]][coordPair[1]] === gameBoardSigns.shipHit || this.board[coordPair[0]][coordPair[1]] === gameBoardSigns.missedHit) return null;
        if((this.board[coordPair[0]][coordPair[1]] === gameBoardSigns.SeaWater) || (this.board[coordPair[0]][coordPair[1]] === gameBoardSigns.shipZone)){
            this.missedAttacks.push(coordPair);
            this.board[coordPair[0]][coordPair[1]] = gameBoardSigns.missedHit;
            return false;
        }
        const shipIDfromBoard = this.board[coordPair[0]][coordPair[1]];
        this.board[coordPair[0]][coordPair[1]] = gameBoardSigns.shipHit;
        const attackedShip = this.shipsFleet.find((ship) => ship.shipID === `${shipIDfromBoard}`);
        attackedShip.hit();
        this.allShipsSunkCheck();
        return true;
    }

    allShipsSunkCheck(){
        for(const ship of this.shipsFleet){
            if(!ship.isSunk()){
                return false;
            }
        }
        return true;
    }

    allShipsPlaced(){
        return this.shipsFleet.length === 5;
    }

    resetBoard(){
        this.board = createBoard();
        this.shipsFleet = [];
    }

    #isShipSpotTaken(shipLength, startCoordPair, direction){
        if(direction === Directions.Vertical){
            for (let i = 0; i < shipLength; i++) {
                if(this.board[startCoordPair[0] + i][startCoordPair[1]] !== gameBoardSigns.SeaWater) return true;
            }
        } else if (direction === Directions.Horizontal) {
            for (let i = 0; i < shipLength; i++) {
                if(this.board[startCoordPair[0]][startCoordPair[1] + i] !== gameBoardSigns.SeaWater) return true;
            }
        }
    }

    #outOfBoardPlacement(shipLength, startCoordPair, direction){
        return (((direction === Directions.Vertical) && (startCoordPair[0] + shipLength > BOARD_SIZE) ) || 
        ((direction === Directions.Horizontal) && (startCoordPair[1] + shipLength > BOARD_SIZE)));
    }
}

const BOARD_SIZE = 10;

const Directions = {
    Vertical: 'V',
    Horizontal: 'H',
}

const gameBoardSigns = {
    SeaWater: '≈',
    shipZone: '-',
    missedHit: '_',
    shipHit: 'X'
}

function createBoard(){
    const board = [];
    for (let i = 0; i < BOARD_SIZE /*rows*/; i++) {
        board[i] = [];
        for (let j = 0; j < BOARD_SIZE /*columns*/; j++) {
            board[i].push(gameBoardSigns.SeaWater);
        }
    }
    return board;
}


// const shipsFleet = [
//     new Ship('carr','Carrier',5),
//     new Ship('batt','Battleship',4),
//     new Ship('des','Destroyer',3),
//     new Ship('sub','Submarine',3),
//     new Ship('pab','Patrol Boat',2),
// ]

