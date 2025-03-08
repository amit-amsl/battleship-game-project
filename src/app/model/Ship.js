export default class Ship {
    constructor(shipID, name, shipLength){
        this.shipID = shipID;
        this.name = name;
        this.shipLength = shipLength;
        this.numOfHits = 0;
        this.shipSunk = false;
    }

    hit(){
        this.numOfHits++;
    }

    isSunk(){
        return this.shipSunk = this.shipLength === this.numOfHits ? true : false;
    }

}