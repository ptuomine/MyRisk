var consts = require('./consts.js');

var Continent = function (row, col) {

    var row = row;
    var col = col;

    var cont_width = consts.CONTINENT_WIDTH * consts.REGION_WIDTH;
    var cont_height = consts.CONTINENT_HEIGHT * consts.REGION_HEIGHT;

    var owner = consts.NOPLAYER;

    var regions = [];

    function getContinentElement() {
        var cont = document.createElement("div");
        cont.id = "continent_" + row + "_" + col;
        cont.style.height = cont_height + "px";
        cont.style.width = cont_width + "px";
        cont.style.border = "3px solid #d3d3d3";
        cont.style.color = "blue";
        cont.classList.add("Column");

        return cont;
    }

    function getOldOwner() {

        return owner;
    }

    function getNewOwner() {

        if (regions.every(r => r.getPlayer() == regions[0].getPlayer())) {
            // if all regions have the same occupant then return that one
            owner = regions[0].getPlayer();
            return owner
        }
        return consts.NOPLAYER;;
    }

    this.element = getContinentElement();

    this.getId = function () {
        return row + "_" + col;
    }

    this.addRegion = function (region) {
        this.element.appendChild(region.element);
        regions.push(region);
    }

    this.addNewLine = function () {
        this.element.appendChild(document.createElement("br"));
    }

    this.getColumn = function () {
        return col;
    }

    this.getRow = function () {
        return row;
    }

    this.getContinentPoints = function () {
        return Math.floor(regions.length / 2);
    }

    this.checkContinentOwner = function () {

        var oldOwner = getOldOwner();
        var newOwner = getNewOwner();
        if (oldOwner != consts.NOPLAYER) {
            oldOwner.removeContinent(this);
        }
        if (newOwner != consts.NOPLAYER) {
            newOwner.addContinent(this);
        }

        owner = newOwner;

        return owner;
    }
}

var ContinentFactory = {

    getContinentInstance(row, col) {
        return new Continent(row, col);
    }

}

module.exports = ContinentFactory;