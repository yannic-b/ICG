var canvas;
var gl;
var num_vertex;

var current_positionX = 0.0;
var current_positionY = 0.0;
var current_rotation = 0;
var velocity = 0.01;
var radius;
var program;

window.onload = function init()
{
	canvas =  document.getElementById("gl-canvas");
	gl = WebGLUtils.setupWebGL(canvas);
	program = initShaders(gl, "vertex-shader", "fragment-shader");

	radius = 0.05;
	drawPacman(radius, 35, 50);
	render();

	requestAnimFrame(drawAndRender);
};


var drawAndRender = function()
{
	rotateAndTranslate();
	render();
	requestAnimFrame(drawAndRender);
};


function degreesToRadians(x)
{
	return x * (Math.PI / 180);
}


function drawPacman(radius, numberOfVertices, angleMouth)
{
	var koordinaten = [0.0, 0.0];
	var colors = [0.023, 0.572, 0.615, 1.0];
	var winkel = 360 / numberOfVertices;

	num_vertex = 1;

	var mundwinkel = angleMouth / 2;


	for (var i = 0; i <= 360; i = i + winkel)
	{
		if ((i >= mundwinkel) && (i <= (360 - mundwinkel)))
		{
			koordinaten.push(Math.cos(degreesToRadians(i)) * radius);
			koordinaten.push(Math.sin(degreesToRadians(i)) * radius);

			colors = colors.concat([0.101, 0.78, 0.835, 1.0]);

			num_vertex += 1;
		}
	}

	var vertices = new Float32Array(koordinaten);
	var colors = new Float32Array(colors);

	// Configure viewport

	gl.viewport(0, 0, canvas.width, canvas.height);
	gl.clearColor(0, 0, 0, 1)

	// Init shader program and bind it

	program = initShaders(gl, "vertex-shader", "fragment-shader");
	gl.useProgram(program);

	var transLoc = gl.getUniformLocation(program, "translation");
	gl.uniform4fv(transLoc, new Float32Array([0.4, 0.7, 0.0, 0.0]));

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
}

function rotateAndTranslate()
{
	var cosB = Math.cos(degreesToRadians(current_rotation));
	var sinB = Math.sin(degreesToRadians(current_rotation));

	var u_CosB = gl.getUniformLocation(program, 'u_CosB');
	var u_SinB = gl.getUniformLocation(program, 'u_SinB');
	gl.uniform1f(u_CosB, cosB);
	gl.uniform1f(u_SinB, sinB);

	var transLoc = gl.getUniformLocation(program, "translation");
	gl.uniform4fv(transLoc, new Float32Array([current_positionX, current_positionY, 0.0, 0.0]));
}

function getYPosition()
{
	var sinA = Math.sin(degreesToRadians(current_rotation));
	return sinA * velocity;
}

function getXPosition()
{
	if ( (current_rotation > 90) || (current_rotation < -90))
	{
		return -1* Math.sqrt((velocity*velocity) - (getYPosition() * getYPosition()));
	}
	else
	{
		return Math.sqrt((velocity*velocity) - (getYPosition() * getYPosition()));
	}
}

function keyLogger(e)
{
	var border = 1 - radius;

	// Kann erhöht werden, damit Pacman sich schneller dreht
	var rotationSteps = 1;

	var showAlert = function()
	{
		alert("Bitte umdrehen!");
	}

	switch(e.keyCode)
	{
		// Bewegung nach vorne/hinten berechnen
		// ⬆️
		case 38:
			var newXPosition = current_positionX + getXPosition();
			var newYPosition = current_positionY + getYPosition();

			if ((newXPosition < border) && (newXPosition > - border) && (newYPosition < border) && (newYPosition > -border ))
			{
				current_positionX = newXPosition;
				current_positionY = newYPosition;
			}
			else
			{
				showAlert();
			}
			break;
		// ⬇️
		case 40:
			var newXPosition = current_positionX - getXPosition();
			var newYPosition = current_positionY - getYPosition();

			if ((newXPosition < border) && (newXPosition > - border) && (newYPosition < border) && (newYPosition > -border ))
			{
				current_positionX = newXPosition;
				current_positionY = newYPosition;
			}
			else
			{
				showAlert();
			}
			break;

		// Rotation berechnen
		// ⬅️
		case 37:
			if (current_rotation < 180)
			{
				current_rotation += rotationSteps;
			}
			else
			{
				current_rotation = -179;
			}
			break;
		// ➡️
		case 39:
			if (current_rotation > -179)
			{
				current_rotation -= rotationSteps;
			}
			else
			{
				current_rotation = 180;
			}
			break;

	}
}

window.addEventListener("keydown", keyLogger);

var render = function()
{
	gl.clear(gl.COLOR_BUFFER_BIT);
	gl.drawArrays(gl.TRIANGLE_FAN, 0, num_vertex);
}
