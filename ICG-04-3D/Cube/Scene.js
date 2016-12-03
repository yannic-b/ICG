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

// WebGL viewport
var canvas;

var havePointerLock;

// zu rendernde Objekte
var objects = [];
var modelMatrixLoc;
var colorLoc;
var positionLoc;

window.onload = function init()
{
    // WebGL initialisieren
    setupWebGL(document);

    // Objekte initilisieren
    initObjects();

    //pointer lock initialisieren
    setUpPointerLock();

    // Render-Loop beginnen
	render();
};

function initObjects()
{
    // ID, Farbe, Position

    initObject("car-and-tree", vec4.fromValues(0.9, 0.2, 0.1, 1), vec3.fromValues(10, -5, 0));
    initObject("house", vec4.fromValues(0.6, 0.4, 0.2, 1), vec3.fromValues(0, -5, 0));
    initObject("ground", vec4.fromValues(0.2, 0.9, 0.1, 1), vec3.fromValues(0, 0, 0));

    for (var i = 0; i < 100; i++)
    {
      initObject("balloon",
                vec4.fromValues(Math.random(),
                                Math.random(),
                                Math.random(),
                                1),
                vec3.fromValues(Math.random() * 100 - 50,
                                Math.random() * 10 + 5,
                                Math.random() * 100 - 50));
    }
    //initObject("balloon", vec4.fromValues(1.0, 0.1, 0.1, 1), vec3.fromValues(0, 5, 0));
}

function initObject(id, color, pos)
{
    // Create buffer and copy data into it
    var carAndTreeString = document.getElementById(id).innerHTML;
    carAndTreeMesh = new OBJ.Mesh(carAndTreeString);
    OBJ.initMeshBuffers(gl, carAndTreeMesh);

    // Create object
    var carAndTreeObject = new RenderObject(mat4.create(), color, carAndTreeMesh.vertexBuffer, carAndTreeMesh.indexBuffer, carAndTreeMesh.normalBuffer);
    mat4.translate(carAndTreeObject.modelMatrix, carAndTreeObject.modelMatrix, pos);

    // Push object on the stack
    objects.push(carAndTreeObject);

    // Store locations of object-specific uniform and attribute variables
    modelMatrixLoc = gl.getUniformLocation(program, "modelMatrix");
    colorLoc = gl.getUniformLocation(program, "objectColor");
    positionLoc = gl.getAttribLocation(program, "vPosition");
}

function setupWebGL(document)
{
    // canvas aus HTML-Dokument
    canvas = document.getElementById("gl-canvas");
    // Größe dynamisch an Gerät anpassen
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // WebGL initialisieren
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert("WebGL isn't available"); }

    // Viewport konfigurieren
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.1, 0.1, 0.9, 0.75);
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
    eye = vec3.fromValues(10.0, 0.0, 20.0);
    // Mittelpunkt - Blickrichtung
    target = vec3.fromValues(0.0, 0.0, 0.0);
    // Kameraneigung
    up = vec3.fromValues(0.0, 1.0, 0.0);
}


function drawObject(object, index, originalArray)
{
    // Set attributes
    gl.bindBuffer(gl.ARRAY_BUFFER, object.vertexBuffer);
    gl.vertexAttribPointer(positionLoc, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc);

    gl.bindBuffer(gl.ARRAY_BUFFER, object.normalBuffer);
    var normalAttribLocation = gl.getAttribLocation(program, "vertNormal");
    gl.vertexAttribPointer(normalAttribLocation, 3, gl.FLOAT, gl.TRUE, 3 * Float32Array.BYTES_PER_ELEMENT, 0);
    gl.enableVertexAttribArray(normalAttribLocation);

    // Set uniforms
    gl.uniformMatrix4fv(modelMatrixLoc, false, object.modelMatrix);
    gl.uniform4fv(colorLoc, object.color);

    // Draw
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, object.indexBuffer);
    gl.drawElements(gl.TRIANGLES, object.numVertices, gl.UNSIGNED_SHORT, 0);
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

  //console.log("Eye: "+eye+" Target: "+target+" Up: "+up);

  // viewMatrix und projectionMatrix übergeben
  gl.uniformMatrix4fv(viewMatrixLoc, false, viewMatrix);
  gl.uniformMatrix4fv(projectionMatrixLoc, false, projectionMatrix);

  // Objekte zeichnen (Definition der Objekte s. RenderObject.js)
  objects.forEach(drawObject);

  // Render-Loop erneut durchführen (im Regelfall 60fps)
  requestAnimFrame(render);
}

function keyPressed(e)
{
  //wvar infoBox = document.getElementById("infoBox");
  switch (e.keyCode)
  {
    //Enter
    case 13:
      enablePointerLock();
      toggleFullScreen();
      break;
    //Escape
    case 27:
      //Keine Ahnung warum das hier nicht funktioniert...
      infoBox.style.visibility = 'visible';
      break;
    default:
  }

  function enablePointerLock()
  {
    //if (havePointerLock) {
      canvas.requestPointerLock = canvas.requestPointerLock ||
                                  canvas.mozRequestPointerLock ||
                                  canvas.webkitRequestPointerLock;
      canvas.requestPointerLock();
      infoBox.style.visibility = 'hidden';
    //}
  }
}
window.addEventListener("keypress", keyPressed);

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
var speed = 0.1;

// Spezifizierung der Bewegungen:
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
  //vec3.add(up, direction, up);
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
  //vec3.add(up, direction, up);
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
  //vec3.add(up, direction, up);
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
  //vec3.add(up, direction, up);
}

function updateViewingDirection(e)
{
  //Horizontal Movement:
  var movementX = e.movementX ||
      e.mozMovementX ||
      e.webkitMovementX ||
      0;
  angleY = -movementX * 0.0025;/// (2 * Math.PI);
  rotateHorizontally(angleY);

  //Vertical Movement:
  var movementY = e.movementY ||
      e.mozMovementY ||
      e.webkitMovementY ||
      0;
  angleXZ = -movementY * 0.00025;/// (2 * Math.PI);
  rotateVertically(angleXZ);

  console.log("mousemove x: "+angleY+" mousemove y: "+angleXZ);

  mat4.lookAt(viewMatrix, eye, target, up);
}

function rotateHorizontally(angleY)
{
  var direction = vec3.create();
	vec3.subtract(direction, target, eye);
  var q = quat.create();
  quat.setAxisAngle(q, up, angleY);
  vec3.transformQuat(direction, direction, q);
  vec3.add(target, eye, direction);
}

function rotateVertically(angleXZ)
{
  var direction = vec3.create();
	vec3.subtract(direction, target, eye);
  var strafeDirection = vec3.create();
	vec3.cross(strafeDirection, direction, up);
  var upDirection = vec3.create();
	vec3.copy(upDirection, up);
  var q = quat.create();
  quat.setAxisAngle(q, strafeDirection, angleXZ);
  vec3.transformQuat(direction, direction, q);
  vec3.add(target, eye, direction);
}

//resize handler:

window.onresize = function resize()
{
  canvas.width = window.innerWidth - 21;
  canvas.height = window.innerHeight - 21;
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.enable(gl.DEPTH_TEST);

  // Set view matrix
  viewMatrix = mat4.create();
  viewMatrixLoc = gl.getUniformLocation(program, "viewMatrix");

  // Set projection matrix
  projectionMatrix = mat4.create();
  mat4.perspective(projectionMatrix, Math.PI * 0.25, canvas.width / canvas.height, 0.5, 100);
  projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");
}

//Fullscreen:
function toggleFullScreen() {
    if (!document.mozFullScreen && !document.webkitFullScreen) {
      if (canvas.mozRequestFullScreen) {
        canvas.mozRequestFullScreen();
      } else {
        canvas.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
      }
    } else {
      if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else {
        document.webkitCancelFullScreen();
      }
    }
}

//Code zuständig für pointerlock und mousemovement:
function setUpPointerLock()
{
  canvas.addEventListener('pointerlockchange', lockChangeAlert, false);
  canvas.addEventListener('mozpointerlockchange', lockChangeAlert, false);
  canvas.addEventListener('webkitpointerlockchange', lockChangeAlert, false);

  /*
  document.exitPointerLock = document.exitPointerLock ||
                             document.mozExitPointerLock ||
  													 document.webkitExitPointerLock;
  //canvas.exitPointerLock();
  */

  havePointerLock = 'pointerLockElement' in document ||
    'mozPointerLockElement' in document ||
    'webkitPointerLockElement' in document;


  document.addEventListener('pointerlockerror', errorCallback, false);
  document.addEventListener('mozpointerlockerror', errorCallback, false);
  document.addEventListener('webkitpointerlockerror', errorCallback, false);

  document.addEventListener("mousemove", updateViewingDirection, false);
}

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

function errorCallback()
{
  console.log("Error");
}
