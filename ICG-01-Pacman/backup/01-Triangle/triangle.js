var gl;
var num_vertex;

window.onload = function init()
{

	//drawPacman(0.4, 32, 60);
	//render();

	/*var lol = true;

	setInterval(function () {
		if (lol)
		{
			lol = false;
			drawPacman(0.4, 35, 50);
			render();
		}
		else
		{
			lol = true;
			drawPacman(0.405, 35, 10);
			render();
		}
	}, 300);
	*/
	requestAnimFrame(drawAndRender);
};


var drawAndRender = function()
{
	//console.log("Rendered:");
	drawPacman(0.4, 35, 50);
	render();
	//requestAnimFrame(drawAndRender);
};


/**
	radius von 0 - 1.0
	Zeichnet aktuell nur einen Kreis
*/

function degreesToRadians(x)
{
	return x * (Math.PI / 180);
}

var canvas;
var gl;

function drawPacman(radius, numberOfVertices, angleMouth)
{
	// Get canvas and setup WebGL
	canvas =  document.getElementById("gl-canvas");
	//var canvas = document.getElementById("gl-canvas");
	gl = WebGLUtils.setupWebGL(canvas);
	if (!gl) { alert("WebGL isn't available"); }


	// KOORDINATEN BERECHNEN

	var koordinaten = [];
	var colors = [];
	var winkel = 360 / numberOfVertices;

	koordinaten.push(0);
	koordinaten.push(0);
	colors.push(1);
	colors.push(1.0);
	colors.push(1);
	colors.push(1.0);


	num_vertex = 1;

	var mundwinkel = angleMouth / 2;


	for (var i = 0; i <= 360; i=i+winkel)
	{
		if ((i >= mundwinkel)&&(i <= (360 - mundwinkel)))
		{
			koordinaten.push(Math.cos(degreesToRadians(i)) * radius);
			koordinaten.push(Math.sin(degreesToRadians(i)) * radius);

			colors.push(1);
			colors.push(0);
			colors.push(1);
			colors.push(1.0);

			num_vertex += 1;
		}
	}

	var vertices = new Float32Array(koordinaten);
	var colors = new Float32Array(colors);

	// Configure viewport

	gl.viewport(0,0,canvas.width,canvas.height);
	gl.clearColor(1.0,1.0,1.0,1.0);

	// Init shader program and bind it

	var program = initShaders(gl, "vertex-shader", "fragment-shader");
	gl.useProgram(program);

	// Load positions into the GPU and associate shader variables

	var posVBO = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, posVBO);
	gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

	var vPosition = gl.getAttribLocation(program, "vPosition");
	gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vPosition);

	// Load colors into the GPU and associate shader variables

	var colorVBO = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, colorVBO);
	gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);

	var vColor = gl.getAttribLocation(program, "vColor");
	gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vColor);

	// konstater Skalierungsfaktor, der als uniform auf jeden Vertex angewendet werden kann
	//var scalarPosition = gl.getUniformLocation(program, "vScalar");
	//gl.uniform1f(scalarPosition, 2.0);
}




function consoleLogger(e)
{
	console.log(e);
}

window.addEventListener("keypress", consoleLogger);



var render = function()
{
	gl.clear(gl.COLOR_BUFFER_BIT);
	gl.drawArrays(gl.TRIANGLE_FAN, 0, num_vertex);
}
