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
    f1:5 /*parseInt(process.argv[2])*/,

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

    position: 0,

    verbose: false,

    showSteps: false,

    animationQueue: [],


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
        return this.band.slice(0);
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


    animateIt: function (duration) {
        if (this.animate) {
            var i = 0,
                queue = this.animationQueue;
            var interval = setInterval(function () {
                if (!queue[i]) {
                    clearInterval(interval);
                }
                if (console.clear && i < queue.length - 1) {
                    console.clear();
                }
                console.log(queue[i]);
                i++;
            }, duration || 2000)
        }
    },

    printBand: function (force) {
        var pos = this.position,
            lines = new Array(4).fill('');
        this.band.forEach(function (val, key) {
            lines[0] += (key == pos ? ' v ': "  ");
            lines[1] += '--';
            lines[2] += '|' + val;
            lines[3] += '--';

        });
        lines[1] += '-';
        lines[2] += '|';
        lines[3] += '-';
        if(this.verbose === true || force){
            console.log(lines.join("\n"));
        }
        if(this.animate) {
            this.animationQueue.push(lines.join("\n"))
        }
    },

    printStep: function (state, force) {
        if(this.verbose === true || force || this.showSteps === true) {
            var bandL = this.band.slice(0, this.position).join(""),
                bandR = this.band.slice(this.position).join("");
            console.log('|-' + bandL + " " + state + " "  + bandR)
        }
    },

    print: function (state, conf) {
        var configuration = conf || {},
            printBandForce = !!configuration.printBandForce,
            printStepForce = !!configuration.printStepForce;
        this.printStep(state, printStepForce);
        this.printBand(printBandForce);
    },

    /**
     * return result of multiplication in binary
     * @returns {string}
     */
    compute: function () {
        this.band = new Array(this.bandLength);
        this.fillBand();
        this.print('q0', {printBandForce: true});
        while(!this.done){
            // for each x found left of multiplier
            this.moveRight();
            this.print('q1');
            if(this.read() == 'x'){
                this.write('.');
                this.print('q2');
                // go to multiplier sign
                while(this.read() !== '*'){
                    this.moveRight();
                    this.print('q2');
                }
                // if multiplication is found
                this.moveRight();
                this.print('q3');
                // for each x
                while(this.read() == 'x'){
                    // found mark as .
                    this.write('.');
                    this.print('q3');
                    // go to a blank after end (/)
                    while(this.read() !== '/'){
                        this.moveRight();
                        this.print('q4');
                    }
                    while(this.band[this.position] !== " "){
                        this.moveRight();
                        this.print('q5');
                    }
                    // and write an X
                    this.write('X');
                    this.print('q5');
                    // go to next occurrence of unar factor and repeat process
                    while(this.read() !== '.'){
                        this.moveLeft();
                        this.print('q6');
                    }
                    this.moveRight();
                    this.print('q3');

                }
                // if there are no more unar factor components
                // end computation
                if(this.band.indexOf('x') === -1){
                    this.done = true;
                }
                // else unmark everything after operand *
                else{
                    this.moveLeft();
                    this.print('q7');
                    while(this.read() !== '*'){
                        this.write('x');
                        this.print('q7');
                        this.moveLeft();
                        this.print('q7');
                    }
                    this.position = 0;
                }
            }
        }
        this.print('qEnd', {printBandForce: true});

        if(this.animate){
            Mmult.animateIt(200);
        }

    }
};


Mmult.verbose = false;
Mmult.showSteps = false;
Mmult.animate = true;
Mmult.compute();
