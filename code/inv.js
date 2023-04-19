//facilitates interactions with localStorage
class Inv {

    constructor() {
        this.initItems();
    }

    initItems() {
        let items = ["log", "ore", "pick", "shovel", "map", "orb", "idol"];
        for (let i = 0; i < items.length; i++) {
            let ct = getItem(items[i])
            if (ct > 0) {
                document.getElementById(items[i]).style.filter = "grayscale(0%)";
                document.getElementById(items[i] + "-ct").innerHTML = ct;
                //document.getElementById(items[i] + "-ct").opacity = "1.0";
            }
        }
    }

    setItem(item, ct) {
        if (ct == 0) {
            localStorage.removeItem(item);
            document.getElementById(item).style.filter = "grayscale(100%)";
            document.getElementById(item + "-ct").innerHTML = ct;
            //document.getElementById(item + "-ct").innerHTML = "?";
        }

        else {
            if (this.getItem(item) === 0 && ct > 0) {
                document.getElementById(item).style.filter = "grayscale(0%)";
                //document.getElementById(item + "-ct").opacity = "1.0";
            }

            localStorage.setItem(item, ct);
            document.getElementById(item + "-ct").innerHTML = ct;
        }
    }

    getItem(item) {
        let ct = localStorage.getItem(item);

        if (ct == null) {
            return 0;
        }
        
        return parseInt(ct);
    }
}