function maxLength(array) {
    return array.slice(0).sort(function (a, b) {
        return b.length - a.length;
    })[0].length;
}
function isDefined(val) {
    return typeof val !== 'undefined';
}

if (!Array.prototype.fill) {
    Array.prototype.fill = function (value) {

        // Steps 1-2.
        if (this == null) {
            throw new TypeError('this is null or not defined');
        }

        var O = Object(this);

        // Steps 3-5.
        var len = O.length >>> 0;

        // Steps 6-7.
        var start = arguments[1];
        var relativeStart = start >> 0;

        // Step 8.
        var k = relativeStart < 0 ?
            Math.max(len + relativeStart, 0) :
            Math.min(relativeStart, len);

        // Steps 9-10.
        var end = arguments[2];
        var relativeEnd = end === undefined ?
            len : end >> 0;

        // Step 11.
        var final = relativeEnd < 0 ?
            Math.max(len + relativeEnd, 0) :
            Math.min(relativeEnd, len);

        // Step 12.
        while (k < final) {
            O[k] = value;
            k++;
        }

        // Step 13.
        return O;
    };
}


var Mmult = {
    /**
     * first factor
     */
    f1:2 /*parseInt(process.argv[2])*/,

    /**
     * second factor
     */
    f2:3 /*parseInt(process.argv[3])*/,
    /**
     * first factor in binary
     */
    f1u: '',

    /**
     * second factor in binary
     */
    f2u: '',

    bandLength: 30,

    /**
     * left part of turing machine band
     */
    band: [],

    /**
     * right part of turing machine band
     */
    right: [],

    verbose: true,

    position: 0,

    fillBand: function () {
        this.f1u = this.dec2unary(this.f1);
        this.f2u = this.dec2unary(this.f2);
        this.band = ["/"].concat(this.f1u.split("").concat(["*"]).concat(this.f2u.split("")).concat(["/"]));
        var filler = new Array(Math.max(0, this.bandLength - this.band.length)).fill(" ");
        this.band = this.band.concat(filler);
    },

    /**
     * returns binary form of integer
     * @param dec
     * @returns {string}
     */
    dec2unary: function (dec) {
        return new Array(dec).fill("x").join("");
    },

    moveRight: function () {
        this.position++;
    },

    moveLeft: function () {
        this.position = Math.max(this.position - 1, 0);
    },

    getBand: function () {
        return this.band;
    },

    read: function () {
        return this.getBand()[this.position]
    },

    write: function (symbol) {
        if(isDefined(this.band[this.position])){
            this.band[this.position] = symbol;
        } else{
            this.band.push(symbol);
            this.position++;
        }
    },

    animationQueue: [],

    animateIt: function (duration) {
        var i = 0,
            queue = this.animationQueue;
        var interval = setInterval(function () {
            if (!queue[i]) {
                clearInterval(interval);
            }
            if (console.clear && i < queue.length -1) {
                console.clear();
            }
            console.log(queue[i]);
            i++;
        }, duration || 2000)
    },

    print: function (force) {
        var band = this.getBand(),
            pos = this.position,
            lines = new Array(4).fill('');
        band.forEach(function (val, key) {
            lines[0] += (key == pos ? ' v ': "  ");
            lines[1] += '--';
            lines[2] += '|' + val;
            lines[3] += '--';

        });
        lines[1] += '-';
        lines[2] += '|';
        lines[3] += '-';
        if(this.verbose === true || force){
            this.animate ? this.animationQueue.push(lines.join("\n")) : console.log(lines.join("\n"));
        }
    },

    /**
     * return result of multiplication in binary
     * @returns {string}
     */
    compute: function () {
        this.band = new Array(this.bandLength);
        this.fillBand();
        this.print(true);
        while(!this.done){
            // for each x found left of multiplier
            this.moveRight();
            this.print();
            if(this.read() == 'x'){
                this.write('.');
                this.print();
                // go to multiplier sign
                this.print();
                while(this.read() !== '*'){
                    this.moveRight();
                    this.print();
                }
                // if multiplication is found
                this.moveRight();
                this.print();
                // for each x
                while(this.read() == 'x'){
                    // found mark as .
                    this.write('.');
                    this.print();
                    // go to a blank after end (/)
                    while(this.read() !== '/'){
                        this.moveRight();
                        this.print();
                    }
                    while(this.band[this.position] !== " "){
                        this.moveRight();
                        this.print();
                    }
                    // and write an X
                    this.write('X');
                    this.print();
                    // go to next occurrence of unar factor and repeat process
                    while(this.read() !== '.'){
                        this.moveLeft();
                        this.print();
                    }
                    this.moveRight();
                    this.print();

                }
                // if there are no more unar factor components
                // end computation
                if(this.band.indexOf('x') === -1){
                    this.done = true;
                }
                // else unmark everything after operand *
                else{
                    this.moveLeft();
                    this.print();
                    while(this.read() !== '*'){
                        this.write('x');
                        this.print();
                        this.moveLeft();
                        this.print();
                    }
                    this.position = 0;
                }
            }
        }
        this.print(true);

    }
};
Mmult.animate = true;
Mmult.compute();
Mmult.animateIt(200);
