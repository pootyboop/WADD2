class Inv {

    constructor() {
    }

    setItem(item, ct) {
        if (ct == 0) {
            localStorage.removeItem(item);
        }

        else {
            localStorage.setItem(item, ct);
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