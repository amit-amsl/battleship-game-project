import Gameboard from "./Gameboard";

export default class Player {
    constructor(name, isCPU, gameboard = new Gameboard()){
        this.name = name;
        this.isCPU = isCPU;
        this.gameboard = gameboard;
    }
}