/**
 * Created by Acer Benutzer on 25-Apr-16.
 */
var fs = require('fs');

const PREVIEW_BUFFER_SIZE = 4;
const SEARCH_BUFFER_SIZE = 10;

var textIndex = 0;

var search = new Array(SEARCH_BUFFER_SIZE + 1).join(0).split('');

var preview = new Array(PREVIEW_BUFFER_SIZE + 1).join(0).split('');

var text = '';

function Token(offset, size, nextChr) {
    this.size = size;
    this.offset = offset;
    this.nextChr = nextChr;
}

function getTokenFromString(encodedToken) {
    var tokenFields = encodedToken.split(",");

    return new Token(tokenFields[0], tokenFields[1],String.fromCharCode(tokenFields[2]));
}


Token.prototype.toString = function () {
    return this.size + "," + this.offset  +  "," + this.nextChr.charCodeAt(0) + "\n";
};

String.prototype.toToken = function () {
    var tokenFields = this.split(",");
    return new Token(tokenFields[0], tokenFields[1],String.fromCharCode(tokenFields[2]));

};

function getIndicesOf(searchStr, str, caseSensitive) {
    var startIndex = 0, searchStrLen = searchStr.length;
    var index, indices = [];
    if (!caseSensitive) {
        str = str.toLowerCase();
        searchStr = searchStr.toLowerCase();
    }
    while ((index = str.indexOf(searchStr, startIndex)) > -1) {
        indices.push(index);
        startIndex = index + searchStrLen;
    }
    return indices;
}

function initPreviewBuffer() {
    preview = text.substr(0, PREVIEW_BUFFER_SIZE).split("");
    textIndex = PREVIEW_BUFFER_SIZE - 1;
}

function shiftBuffers(token) {
    for (var i = 0; i < token.size + 1; i++) {
        search.shift();
        search.push(preview[0]);
        preview.shift();
        textIndex++;
        preview.push(text.substr(textIndex, 1));
    }
}

function tokenize() {
    if (search.indexOf(preview[0]) === -1) {
        var token = new Token(0,0,preview[0]);
    }
    else{
        var i= 0,
            size = 0,
            str = preview[0],
            occurrences = getIndicesOf(preview[0], search.join(""));
        occurrences.forEach(function (j) {
            var newSize = 0;
            while(preview[i] == search[j] && i < PREVIEW_BUFFER_SIZE - 1){
                j++;
                i++;
                newSize++;
                preview[i] === search[j] ? str += preview[i] : null;
            }
            size = Math.max(size, newSize);
        });

        var offset = (search.join("").indexOf(str) + 1);
        token = new Token(offset, size, preview[i]);
    }

    fs.appendFile("encode.txt", token.toString(), function(err) {
        console.log(token.toString());
    });

    shiftBuffers(token);

    return token;
}

//fs.readFile('deutsch1.txt', 'utf8', function (err, data) {
//    text = data;
//    initPreviewBuffer();
//
//    var tokens = [];
//    while(textIndex < text.length-1){
//        tokens.push(tokenize());
//    }
//});


fs.readFile('encode.txt', 'utf8', function (err, data) {
    var tokens = [];
    data.split("\n").forEach(function (tokenEncoded) {
        tokens.push(tokenEncoded.toToken());
    });
    var output = "";
    tokens.forEach(function (token) {
        console.log(token);
        if(token.size == 0){
            output += token.nextChr;
        } else {
            console.log(output);
            output += output.slice(output.length-1 - token.offset, token.size);
            console.log(output.length-1 - token.offset, token.size, output.slice(output.length-1 - token.offset, token.size));
        }
    });

    console.log(output);
});