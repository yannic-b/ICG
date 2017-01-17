// Deklaration der globalen Variablen

// globales WebGL-Objekt
var gl;

// globales shader-program
var program;

// view- und projection-matrix
var viewMatrixLoc; var viewMatrix;
var projectionMatrixLoc; var projectionMatrix;

var lightPosition;

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

var cameraPos;

var groundTexture;
var groundImage;

var vertexPositionAttribute;
var textureCoordAttribute;

var groundVerticesTextureCoordBuffer;

window.onload = function init()
{
    // WebGL initialisieren
    setupWebGL(document);

    // Objekte initilisieren
    initObjects();
    
    // Texturen laden
    initTextures();

    //pointer lock initialisieren
    setUpPointerLock();

    // Render-Loop beginnen
	render();
};

function initTextures() {
    // gl.enable(gl.TEXTURE_2D);
    groundTexture = gl.createTexture();
    groundImage = new Image();
    groundImage.onload = function() { handleTextureLoaded(groundImage, groundTexture); }
    groundImage.src = "sand_diffuse.png";
}

function handleTextureLoaded(image, texture) {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.bindTexture(gl.TEXTURE_2D, null);
}

function initObjects()
{
    // ID, Farbe, Position
    var numberOfBalloons = 100;

    initObject("car-and-tree", 2.0, vec4.fromValues(0.9, 0.2, 0.1, 1), vec3.fromValues(15, -5.4, 0));
    initObject("house", 1.0, vec4.fromValues(0.6, 0.4, 0.2, 1), vec3.fromValues(0, -5, 0));

    
    for (var i = 0; i < numberOfBalloons; i++)
    {
      initObject("balloon", 0.5,
                vec4.fromValues(Math.random(),
                                Math.random(),
                                Math.random(),
                                1),
                vec3.fromValues(Math.random() * 250 - 125,
                                Math.random() * 42 + 5,
                                Math.random() * 250 - 125));
    }
    
    initObject("ground", 1.0, vec4.fromValues(0.2, 0.9, 0.1, 1), vec3.fromValues(0, 4.5, 0));
    
    //initObject("balloon", vec4.fromValues(1.0, 0.1, 0.1, 1), vec3.fromValues(0, 5, 0));
}

function initObject(id, scale, color, pos)
{
    // Create buffer and copy data into it
    var carAndTreeString = document.getElementById(id).innerHTML;
    carAndTreeMesh = new OBJ.Mesh(carAndTreeString);
    OBJ.initMeshBuffers(gl, carAndTreeMesh);

    // Create object
    var carAndTreeObject = new RenderObject(mat4.create(), color, carAndTreeMesh.vertexBuffer, carAndTreeMesh.indexBuffer, carAndTreeMesh.normalBuffer, id);
    mat4.fromScaling(carAndTreeObject.modelMatrix, vec3.fromValues(scale, scale, scale));
    mat4.translate(carAndTreeObject.modelMatrix, carAndTreeObject.modelMatrix, vec3.scale(pos, pos, 1/scale));
    
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

    cameraPos = gl.getUniformLocation(program, "cameraPos");

    lightPosition = vec3.fromValues(19.0, 3.0, 9.0);
    var lightPos = gl.getUniformLocation(program, "lightPosition");
    gl.uniform3fv(lightPos, lightPosition);

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
    
    // Für Untergrund Sand-Textur anwenden
    
    /*
     Leider ist es uns nicht gelungen, eine Textur sichtbar zu machen.
     
     Als Ressourcen haben wir verwendet:
     - diese Anleitung zur Einbindung einer Textur auf einem Würfel
     https://developer.mozilla.org/de/docs/Web/API/WebGL_API/Tutorial/Texture
     n_in_WebGL_verwenden
     - den Quellcode dieser Demo dazu
     http://mdn.github.io/webgl-examples/tutorial/sample6/index.html
     - dieses YouTube-Tutorial
     https://www.youtube.com/watch?v=hpnd11doMgc
     
     (alles sehr empfehlenswert, hat uns jedoch leider noch nicht zum Erfolg geführt)
     
     Entscheidend ist, dass sowohl Fragment- als auch Vertexshader verändert
     werden müssen.
     Es gibt neue varyings, die per JS abgegriffen werden und es gilt
     jeweils eine andere sich daraus ergebende Berechnung für
     gl_FragColor
     und
     gl_Position
     —> die auskommentierte Version ist die, wie es “sein sollte”, damit
     Texturen funktionieren. Auskommentiert ist sie momentan, da dann gar
     nichts mehr gerendert wird.
     
     Der entscheidene Abschnitt im JS-Code ist zum einen natürlich die
     Initialisierung und Belegung der Variablen und Buffer, für die ganzen
     Textur-Koordinaten und zum anderen vor allem der Bereich für
     if (object.id == "ground")
     {
     …
     }
     - wenn man den auskommentiert, ist alles wieder “wie vorher” 😉
     Ich habe versucht, in dem Moment eine Fallunterscheidung einzubauen,
     damit nur für den Boden eine Textur angewandt wird.
     Für den WebGL-Teil in der index.html ist es schwierig, diese Fallunterscheidung fortzuführen,
     da wir hier keine Möglichkeit mehr haben zu übrigens, welche Vertices oder Fragments gerade behandelt werden.
     
     Wir haben versucht, nur den Boden zu rendern, andere
     Modelmatrixes für den Boden zu verwenden (damit die Texturkoordinaten
     besser passen) und wirklich alles mögliche ausprobiert und rumgehackt,
     aber leider ohne Erfolg.
     Das nächste, was wir geschafft haben ist, dass unsere bisherigen Objekte
     alle komplett ohne Farbinfos (also schwarz) gezeichnet wurden… 😀
     */
    if (object.id == "ground")
    {
        /*
        var groundModelMatrix = new Float32Array([1, 0, 0, 0,
                                                  0, 0.001, 0, 0,
                                                  0, 0, 1, 0,
                                                  0, 0, 0, 0.1]);
        
        gl.uniformMatrix4fv(modelMatrixLoc, false, groundModelMatrix);
         */
        
        
        gl.uniformMatrix4fv(modelMatrixLoc, false, object.modelMatrix);
        
        groundVerticesTextureCoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, groundVerticesTextureCoordBuffer);
        
        var textureCoordinates = [
                                  // vorne
                                  0.0,  0.0,
                                  1.0,  0.0,
                                  1.0,  1.0,
                                  0.0,  1.0,
                                  // hinten
                                  0.0,  0.0,
                                  1.0,  0.0,
                                  1.0,  1.0,
                                  0.0,  1.0,
                                  // oben
                                  0.0,  0.0,
                                  1.0,  0.0,
                                  1.0,  1.0,
                                  0.0,  1.0,
                                  // unten
                                  0.0,  0.0,
                                  1.0,  0.0,
                                  1.0,  1.0,
                                  0.0,  1.0,
                                  // rechts
                                  0.0,  0.0,
                                  1.0,  0.0,
                                  1.0,  1.0,
                                  0.0,  1.0,
                                  // links
                                  0.0,  0.0,
                                  1.0,  0.0,
                                  1.0,  1.0,
                                  0.0,  1.0
                                  ];
        
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates),
                      gl.STATIC_DRAW);
        
        vertexPositionAttribute = gl.getAttribLocation(program, "aVertexPosition");
        gl.enableVertexAttribArray(vertexPositionAttribute);
        
        textureCoordAttribute = gl.getAttribLocation(program, "aTextureCoord");
        gl.enableVertexAttribArray(textureCoordAttribute);
        
        gl.bindBuffer(gl.ARRAY_BUFFER, groundVerticesTextureCoordBuffer);
        gl.vertexAttribPointer(textureCoordAttribute, 2, gl.FLOAT, false, 0, 0);
        
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, groundTexture);
        gl.uniform1i(gl.getUniformLocation(program, "uSampler"), 0);
        
        
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
                      new Uint16Array(object.numVertices), gl.STATIC_DRAW);
        
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, object.indexBuffer);
        

        gl.drawElements(gl.TRIANGLES, object.numVertices, gl.UNSIGNED_SHORT, 0);
    }
    else
    {
        // Draw
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, object.indexBuffer);
        gl.drawElements(gl.TRIANGLES, object.numVertices, gl.UNSIGNED_SHORT, 0);
    }
    
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

  gl.uniform4fv(cameraPos, eye);

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
  angleY = -movementX * 0.005;/// (2 * Math.PI);
  rotateHorizontally(angleY);

  //Vertical Movement:
  var movementY = e.movementY ||
      e.mozMovementY ||
      e.webkitMovementY ||
      0;
  angleXZ = -movementY * 0.0005;/// (2 * Math.PI);
  rotateVertically(angleXZ);

  //console.log("mousemove x: "+angleY+" mousemove y: "+angleXZ);

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
  gl.clearColor(0.1, 0.1, 0.9, 0.75);
  //gl.enable(gl.DEPTH_TEST);

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
