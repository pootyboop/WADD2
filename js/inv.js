//facilitates interactions with localStorage and external HTML elements representing inventory
//should only interact with Player
class Inv {

    constructor() {
        //update inventory from localStorage when the game is opened
        this.initItems();
    }

    initItems() {
        //all items in the game
        let items = ["log", "ore", "pick", "shovel", "map", "orb", "idol"];

        for (let i = 0; i < items.length; i++) {

            //items' default styling displays them as greyed out with a count of 0
            //items you do have will be in colour and display their count
            let ct = getItem(items[i])
            if (ct > 0) {
                //items you don't have will be greyed out
                document.getElementById(items[i]).style.filter = "grayscale(0%)";
                //update the number of items
                document.getElementById(items[i] + "-ct").innerHTML = ct;
            }
        }
    }

    //returns the number of a specified item in the player's inventory
    getItem(item) {
        let ct = localStorage.getItem(item);

        //return 0 if there's nothing under that key (item name) in localStorage
        if (ct == null) {
            return 0;
        }
        
        //parse the value before returning it to facilitate incrementing/decrementing item count with setItem()
        return parseInt(ct);
    }

    //sets the number of a specified item in the player's inventory
    setItem(item, ct) {

        //item count set to 0
        if (ct === 0) {
            //don't need this key anymore. delete it!
            localStorage.removeItem(item);
            //also reset the HTML element to its default styling and update the item count
            document.getElementById(item).style.filter = "grayscale(100%)";
            document.getElementById(item + "-ct").innerHTML = ct;
        }

        else {
            //item count set from 0 to a non-0 value
            if (this.getItem(item) === 0 && ct > 0) {
                //colourise the image to indicate you have the item
                document.getElementById(item).style.filter = "grayscale(0%)";
            }

            //update the item count in localStorage and HTML
            localStorage.setItem(item, ct);
            document.getElementById(item + "-ct").innerHTML = ct;
        }
    }
}