let model = null;

$(document).ready(function() {
    init();
    loadModel();
});

function init() {
    document.getElementById('clear').addEventListener('click', clear);
    document.getElementById('predict').addEventListener('click', recogniseNumber);

    var container = document.getElementById('canvas-container');
    initCanvas(container, 100, 100, '#ffffff');
}

async function loadModel() {
    model = await tf.loadLayersModel('./model/model.json');
    console.log('Model', model);
}

async function predict(tfImage) {
    console.log('Trying to predict')
    if(model) {
        const prediction = model.predict(tfImage).data();
        //argMax
        console.log('Prediction', prediction);
    }
}


function createCanvas(parent, width, height) {
    var canvas = {};
    canvas.node = document.createElement('canvas');
    canvas.node.setAttribute('id', 'canvas');
    canvas.context = canvas.node.getContext('2d');
    canvas.node.width = width || 100;
    canvas.node.height = height || 100;
    parent.appendChild(canvas.node);
    return canvas;
}

function initCanvas(container, width, height, fillColor) {
    var canvas = createCanvas(container, width, height);
    var ctx = canvas.context;
    //define a custom fillCircle method
    ctx.fillCircle = function (x, y, radius, fillColor) {
        this.fillStyle = fillColor;
        this.beginPath();
        this.moveTo(x, y);
        this.arc(x, y, radius, 0, Math.PI * 2, false);
        this.fill();
    };
    ctx.clearTo = function (fillColor) {
        ctx.fillStyle = fillColor;
        ctx.fillRect(0, 0, width, height);
    };
    ctx.clearTo(fillColor || "#ffffff");

    // bind mouse events
    canvas.node.onmousemove = function (e) {
        if (!canvas.isDrawing) {
        return;
        }
        var x = e.pageX - this.offsetLeft;
        var y = e.pageY - this.offsetTop;
        var radius = 3; // or whatever
        var fillColor = '#000000';
        ctx.fillCircle(x, y, radius, fillColor);
    };
    canvas.node.onmousedown = function (e) {
        canvas.isDrawing = true;
    };
    canvas.node.onmouseup = function (e) {
        canvas.isDrawing = false;
    };
}


function clear() {
    console.log('clear canvas');
    var canvas = document.getElementById('canvas');
    var ctx = canvas.getContext('2d');
    ctx.clearTo('#ffffff');
    document.getElementById('prediction').innerHTML = '';
}

function recogniseNumber() {
    var canvas = document.getElementById('canvas');
    var ctx = canvas.getContext('2d');

    // console.log(ctx.getImageData(0,0, 100, 100));
    var imageData = ctx.getImageData(0, 0, 100, 100);
    var tfImage = tf.browser.fromPixels(imageData, 1);

    //Resize to 28X28
    var tfResizedImage = tf.image.resizeBilinear(tfImage, [28,28]);
    //Since white is 255 black is 0 so need to revert the values
    //so that white is 0 and black is 255
    tfResizedImage = tf.cast(tfResizedImage, 'float32');
    tfResizedImage = tf.abs(tfResizedImage.sub(tf.scalar(255)))
        .div(tf.scalar(255)).flatten();
    tfResizedImage = tfResizedImage.reshape([1, 784]);

    //Make another dimention as the model expects
    console.log(tfResizedImage.dataSync());
    predict(tfResizedImage);
}      

