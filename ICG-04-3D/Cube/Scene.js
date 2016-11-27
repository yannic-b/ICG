// Deklaration der globalen Variablen

// globales WebGL-Objekt
var gl;

// globales shader-program
var program;

// view- und projection-matrix
var viewMatrixLoc; var viewMatrix;
var projectionMatrixLoc; var projectionMatrix;

// Kamera
var eye; var target; var up;


window.onload = function init()
{
    // WebGL initialisieren
    setupWebGL(document);
    
    // Render-Loop beginnen
	render();
};

function setupWebGL(document)
{
    // canvas aus HTML-Dokument
    var canvas = document.getElementById("gl-canvas");
    // Größe dynamisch an Gerät anpassen
    canvas.width = document.body.clientWidth;
    canvas.height = document.body.clientHeight;
    
    // WebGL initialisieren
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert("WebGL isn't available"); }
    
    // Viewport konfigurieren
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    
    // shader program initilisieren und binden
    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);
    
    // Set view matrix
    viewMatrix = mat4.create();
    viewMatrixLoc = gl.getUniformLocation(program, "viewMatrix");
    
    // Set projection matrix
    projectionMatrix = mat4.create();
    mat4.perspective(projectionMatrix, Math.PI * 0.25, canvas.width / canvas.height, 0.5, 100);
    projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");
    
    // initiale Kameraposition einstellen
    eye = vec3.fromValues(0.0, 1.0, 3.0);
    // Mittelpunkt - Blickrichtung
    target = vec3.fromValues(0.0, 0.0, 0.0);
    // Kameraneigung
    up = vec3.fromValues(0.0, 1.0, 0.0);
}


function drawObject(currentObject, index, originalArray)
{
    // Position
    var positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, currentObject.positionBuffer, gl.STATIC_DRAW);
    
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
    
    // Color
    var colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, currentObject.colorBuffer, gl.STATIC_DRAW);
    
    var vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);
    
    var modelMatrixLoc = gl.getUniformLocation(program, "modelMatrix");
    gl.uniformMatrix4fv(modelMatrixLoc, false, currentObject.modelMatrix);
    
    // Zeichnen ausführen
    gl.drawArrays(gl.TRIANGLES, 0, positions.length/3);
}

function render()
{
    // zuerst die Buffer leeren
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
	// Hier wird die Bewegung ausgeführt
	if (isDown[0])
	{
		moveForward();
	}
	if (isDown[1])
	{
		moveLeft();
	}
	if (isDown[2])
	{
		moveBackwards();
	}
	if (isDown[3])
	{
		moveRight();
	}
    
    // nach Bewegung Blickrichtung der Kamera aktualisieren
	mat4.lookAt(viewMatrix, eye, target, up);
    
    // viewMatrix und projectionMatrix übergeben
    gl.uniformMatrix4fv(viewMatrixLoc, false, viewMatrix);
    gl.uniformMatrix4fv(projectionMatrixLoc, false, projectionMatrix);
    
    // Objekte zeichnen (Definition der Objekte s. RenderObject.js)
    objectsToRender.forEach(drawObject);
    
    // Render-Loop erneut durchführen (im Regelfall 60fps)
	requestAnimFrame(render);
}

// W, A, S, D
var isDown = [false, false, false, false];

function keyDown(e)
{
	switch (e.keyCode)
	{
		// W
		case 87:
		isDown[0] = true;
		break;
		// A
		case 65:
		isDown[1] = true;
		break;
		// S
		case 83:
		isDown[2] = true;
		break;
		// S
		case 68:
		isDown[3] = true;
		break;
	}
}
window.addEventListener("keydown", keyDown);

function keyUp(e)
{
	switch (e.keyCode)
	{
		// W
		case 87:
		isDown[0] = false;
		break;
		// A
		case 65:
		isDown[1] = false;
		break;
		// S
		case 83:
		isDown[2] = false;
		break;
		// D
		case 68:
		isDown[3] = false;
		break;
	}
}
window.addEventListener("keyup", keyUp);

// Kann modifiziert werden, um Bewegungsgeschwindigkeit zu ändern
var speed = 0.05;

//Spezifizierung der Bewegungen:
function moveForward()
{
	var direction = vec3.create();
	vec3.subtract(direction, target, eye);
	direction[1] = 0.0;
	vec3.normalize(direction, direction);
	// doppelt so schnell nach vorne bewegen,
	// wie andere Richtungen - natürlicherer Bewegungsablauf
	vec3.scale(direction, direction, speed*2);
	vec3.add(eye, direction, eye);
	vec3.add(target, direction, target);
	//eye[2] = eye[2] - speed * 2;
	//target[2] = target[2] - speed * 2;
}
function moveLeft()
{
	var direction = vec3.create();
	vec3.subtract(direction, target, eye);
	direction[1] = 0.0;
	vec3.normalize(direction, direction);
	vec3.scale(direction, direction, speed);
	var x = vec3.clone(direction);
	direction[0] = x[2];
	direction[1] = x[1];
	direction[2] = -x[0];
	vec3.add(eye, direction, eye);
	vec3.add(target, direction, target);
	//eye[0] = eye[0] - speed;
	//target[0] = target[0] - speed;
}
function moveBackwards()
{
	var direction = vec3.create();
	vec3.subtract(direction, target, eye);
	vec3.negate(direction, direction);
	direction[1] = 0.0;
	vec3.normalize(direction, direction);
	vec3.scale(direction, direction, speed);
	vec3.add(eye, direction, eye);
	vec3.add(target, direction, target);
	//eye[2] = eye[2] + speed;
	//target[2] = target[2] + speed;
}
function moveRight()
{
	var direction = vec3.create();
	vec3.subtract(direction, target, eye);
	direction[1] = 0.0;
	vec3.normalize(direction, direction);
	vec3.scale(direction, direction, speed);
	var x = vec3.clone(direction);
	direction[0] = -x[2];
	direction[1] = x[1];
	direction[2] = x[0];
	vec3.add(eye, direction, eye);
	vec3.add(target, direction, target);
	//eye[0] = eye[0] + speed;
	//target[0] = target[0] + speed;
}

//Code zuständig für pointerlock und mousemovement:
//WIP
/*
document.addEventListener('pointerlockchange', lockChangeAlert, false);
document.addEventListener('mozpointerlockchange', lockChangeAlert, false);
document.addEventListener('webkitpointerlockchange', lockChangeAlert, false);

canvas.requestPointerLock = canvas.requestPointerLock ||
                            canvas.mozRequestPointerLock ||
														canvas.webkitRequestPointerLock;
//canvas.requestPointerLock();

document.exitPointerLock = document.exitPointerLock ||
                           document.mozExitPointerLock ||
													 document.webkitExitPointerLock;
//canvas.exitPointerLock();

function lockChangeAlert()
{
  if (document.pointerLockElement === canvas ||
      document.mozPointerLockElement === canvas ||
			document.webkitPointerLockElement === canvas) {
    console.log('The pointer lock status is now locked');
    document.addEventListener("mousemove", updateViewingDirection, false);
  } else {
    console.log('The pointer lock status is now unlocked');
    document.removeEventListener("mousemove", updateViewingDirection, false);
  }
}

function updateViewingPosition(e)
{

}
*/
