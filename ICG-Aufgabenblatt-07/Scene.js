var gl;
var canvas;

var eye;
var target;
var up;

var lastMousePosX = 0;
var lastMousePosY = 0;

var rotationAngleY = 0;
var rotationAngleX = 0;

var objects = [];
var sandTexture;
var sandImage;
var sandNormals;
var sandImageNormals;

var waterTexture;
var waterImage;

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

var RenderObject = function(transform, color, shader, buffer, bufferLength, texture)
{
	this.transform = transform;
	this.color = color;
	this.shader = shader;
	this.buffer = buffer;
	this.bufferLength = bufferLength;
	this.lighting = false;
	this.textured = false;
    
    this.texture = texture;
	
	this.rotationY = 0.01;
	this.rotationX = 0.01;
	this.rotationZ = 0.01;
}

RenderObject.prototype.rotate = function(angle, axis) 
{
	mat4.rotate(this.transform, this.transform, angle, axis);
}

function initTextures() {
    sandTexture = gl.createTexture();
    sandImage = new Image();
    sandImage.onload = function () { handleTextureLoaded(sandImage, sandTexture); }
    sandImage.src = "sand_diffuse.jpg";

    // TODO 1: Erstelle analog zu diffuser Textur eine Normal Map für den Sand.
    sandNormals = gl.createTexture();
    sandImageNormals = new Image();
    sandImageNormals.onload = function () { handleTextureLoaded(sandImageNormals, sandNormals); }
    sandImageNormals.src = "sand_normal.jpg";
    
    
    waterTexture = gl.createTexture();
    waterImage = new Image();
    waterImage.onload = function () { handleTextureLoaded(waterImage, waterTexture); }
    waterImage.src = "water_texture.jpg"
}

function handleTextureLoaded(image, texture) {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.bindTexture(gl.TEXTURE_2D, null);
}

window.onload = function init()
{
	// Get canvas and setup webGL
	
	canvas = document.getElementById("gl-canvas");
	gl = WebGLUtils.setupWebGL(canvas);
	if (!gl) { alert("WebGL isn't available"); }
	
	gl.enable(gl.DEPTH_TEST);
	gl.depthFunc(gl.LESS);

	initTextures();
    
    //pointer lock initialisieren
    setUpPointerLock();

	// Specify position and color of the vertices
	
										// Front
	var islandVertices = new Float32Array([		-0.5, -0.5, 0.5,
										0.5, -0.5, 0.5,
										0.5, 0.5, 0.5,
										
										0.5, 0.5, 0.5,
										-0.5, 0.5 ,0.5,
										-0.5, -0.5, 0.5,
										
										// Right
										0.5, 0.5, 0.5,
										0.5, -0.5, 0.5,
										0.5, -0.5, -0.5,
										
										0.5, -0.5, -0.5,
										0.5, 0.5, -0.5,
										0.5, 0.5, 0.5,
										
										// Back
										-0.5, -0.5, -0.5,
										0.5, -0.5, -0.5,
										0.5, 0.5, -0.5,
										
										0.5, 0.5, -0.5,
										-0.5, 0.5 ,-0.5,
										-0.5, -0.5, -0.5,
										
										// Left
										-0.5, 0.5, 0.5,
										-0.5, -0.5, 0.5,
										-0.5, -0.5, -0.5,
										
										-0.5, -0.5, -0.5,
										-0.5, 0.5, -0.5,
										-0.5, 0.5, 0.5,
										
										// Bottom
										-0.5, -0.5, 0.5,
										0.5, -0.5, 0.5,
										0.5, -0.5, -0.5,
										
										0.5, -0.5, -0.5,
										-0.5, -0.5 , -0.5,
										-0.5, -0.5, 0.5,
										
										// Top
										-0.5, 0.5, 0.5,
										0.5, 0.5, 0.5,
										0.5, 0.5, -0.5,
										
										0.5, 0.5, -0.5,
										-0.5, 0.5 , -0.5,
										-0.5, 0.5, 0.5
										]);
										
	var islandNormals = new Float32Array([
										// Front
										0.0,  0.0,  1.0,
										0.0,  0.0,  1.0,
										0.0,  0.0,  1.0,
										0.0,  0.0,  1.0,
										0.0,  0.0,  1.0,
										0.0,  0.0,  1.0,

										// Right
										1.0,  0.0,  0.0,
										1.0,  0.0,  0.0,
										1.0,  0.0,  0.0,
										1.0,  0.0,  0.0,
										1.0,  0.0,  0.0,
										1.0,  0.0,  0.0,

										// Back
										0.0,  0.0, -1.0,
										0.0,  0.0, -1.0,
										0.0,  0.0, -1.0,
										0.0,  0.0, -1.0,
										0.0,  0.0, -1.0,
										0.0,  0.0, -1.0,

										// Left
										-1.0,  0.0,  0.0,
										-1.0,  0.0,  0.0,
										-1.0,  0.0,  0.0,
										-1.0,  0.0,  0.0,
										-1.0,  0.0,  0.0,
										-1.0,  0.0,  0.0,

										// Bottom
										0.0, -1.0,  0.0,
										0.0, -1.0,  0.0,
										0.0, -1.0,  0.0,
										0.0, -1.0,  0.0,
										0.0, -1.0,  0.0,
										0.0, -1.0,  0.0,

										// Top
										0.0,  1.0,  0.0,
										0.0,  1.0,  0.0,
										0.0,  1.0,  0.0,
										0.0,  1.0,  0.0,
										0.0,  1.0,  0.0,
										0.0,  1.0,  0.0,																													
	]);
    
	var islandTextureCoordinates = new Float32Array([
							// Front
							0.0, 0.0,
							1.0, 0.0,
							1.0, 1.0,
							1.0, 1.0,
							0.0, 1.0,
							0.0, 0.0,							
                            // Right
							0.0, 0.0,
							0.0, 1.0,
							1.0, 1.0,
							1.0, 1.0,
							1.0, 0.0,
							0.0, 0.0,
							// Back
							0.0, 0.0,
							0.0, 1.0,
							1.0, 1.0,
							1.0, 1.0,
							1.0, 0.0,
							0.0, 0.0,							
                            // Left
							0.0, 0.0,
							1.0, 0.0,
							1.0, 1.0,
							1.0, 1.0,
							0.0, 1.0,
							0.0, 0.0,						
                            // Bottom
							0.0, 0.0,
							1.0, 0.0,
							1.0, 1.0,
							1.0, 1.0,
							0.0, 1.0,
							0.0, 0.0,							
                            // Top
							0.0, 0.0,
							1.0, 0.0,
							1.0, 1.0,
							1.0, 1.0,
							0.0, 1.0,
							0.0, 0.0
	]);
										
	var waterVertices = new Float32Array([1, 0, 1,
										  1, 0, -1,
										  -1, 0, -1,
										  
										  -1, 0, -1,
										  -1, 0, 1,
										  1, 0, 1
										 ]);
										 
											// Front
	var palmTreeVertices = new Float32Array([		-0.5, -0.5, 0.5,
										0.5, -0.5, 0.5,
										1, 0.5, 1,
										
										1, 0.5, 1,
										-1, 0.5 ,1,
										-0.5, -0.5, 0.5,
										
										// Right
										1, 0.5, 1,
										0.5, -0.5, 0.5,
										0.5, -0.5, -0.5,
										
										0.5, -0.5, -0.5,
										1, 0.5, -1,
										1, 0.5, 1,
										
										// Back
										-0.5, -0.5, -0.5,
										0.5, -0.5, -0.5,
										1, 0.5, -1,
										
										1, 0.5, -1,
										-1, 0.5 ,-1,
										-0.5, -0.5, -0.5,
										
										// Left
										-1, 0.5, 1,
										-0.5, -0.5, 0.5,
										-0.5, -0.5, -0.5,
										
										-0.5, -0.5, -0.5,
										-1, 0.5, -1,
										-1, 0.5, 1,
										
										// Bottom
										-0.5, -0.5, 0.5,
										0.5, -0.5, 0.5,
										0.5, -0.5, -0.5,
										
										0.5, -0.5, -0.5,
										-0.5, -0.5 , -0.5,
										-0.5, -0.5, 0.5,
										
										// Top
										-1, 0.5, 1,
										1, 0.5, 1,
										1, 0.5, -1,
										
										1, 0.5, -1,
										-1, 0.5 , -1,
										-1, 0.5, 1
										]);
	
	var palmLeafVertices = new Float32Array([0, 0, -0.2,
										  0, 0, 0.2,
										  1, -0.3, 0,
										 ]);

	// Configure viewport

	gl.viewport(0,0,canvas.width,canvas.height);
	gl.clearColor(1.0,1.0,1.0,1.0);

	// Init shader programs

	var defaultProgram = initShaders(gl, "vertex-shader", "fragment-shader");
	var vertexLightingProgram = initShaders(gl, "vertex-shader-lighting", "fragment-shader-lighting");
	
	///// ISLAND OBJECT /////
	
	// Create buffer and copy data into it
	var vertexBufferIsland = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferIsland);
	gl.bufferData(gl.ARRAY_BUFFER, islandVertices, gl.STATIC_DRAW);
	
	var normalBufferIsland = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, normalBufferIsland);
	gl.bufferData(gl.ARRAY_BUFFER, islandNormals, gl.STATIC_DRAW);
    
	var textureCoordinateBufferIsland = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordinateBufferIsland);
	gl.bufferData(gl.ARRAY_BUFFER, islandTextureCoordinates, gl.STATIC_DRAW);
	
	// Create object
	var island = new RenderObject(mat4.create(), vec4.fromValues(1,1,1,1), vertexLightingProgram, vertexBufferIsland, islandVertices.length/3, sandTexture);
	island.normalBuffer = normalBufferIsland;
	island.normalBufferLength = islandNormals.length/3;
	island.lighting = true;
	island.textured = true;
	island.texCoordBuffer = textureCoordinateBufferIsland;
	mat4.translate(island.transform, island.transform, vec3.fromValues(0, 0, 0));
	mat4.scale(island.transform, island.transform, vec3.fromValues(10, 1, 10));
	
	// Push object on the stack
	objects.push(island);
	
	///// WATER OBJECT /////
	
	// Create buffer and copy data into it
	var vertexBufferWater = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferWater);
	gl.bufferData(gl.ARRAY_BUFFER, waterVertices, gl.STATIC_DRAW);
    
    var textureCoordinateBufferWater = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordinateBufferWater);
    gl.bufferData(gl.ARRAY_BUFFER, islandTextureCoordinates, gl.STATIC_DRAW);
	
	// Create object
	var water = new RenderObject(mat4.create(), vec4.fromValues(1,1,1,1), vertexLightingProgram, vertexBufferWater, waterVertices.length/3, waterTexture);
    
    // TODO: Wasser beleuchten
    water.normalBuffer = normalBufferIsland;
    water.normalBufferLength = islandNormals.length/3;
    water.lighting = true;
    water.textured = true;
    water.texCoordBuffer = textureCoordinateBufferWater;
	mat4.translate(water.transform, water.transform, vec3.fromValues(0, 0.25, 0));
	mat4.scale(water.transform, water.transform, vec3.fromValues(50, 1, 50));
	
	// Push object on the stack
	objects.push(water);
	
	///// PALM TREE OBJECTS /////
	
	for (var i = 0; i < 5; i++) 
	{
		// Create buffer and copy data into it
		var vertexBufferPalmTree = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferPalmTree);
		gl.bufferData(gl.ARRAY_BUFFER, palmTreeVertices, gl.STATIC_DRAW);
	
		// Create object
		var palmTree = new RenderObject(mat4.create(), vec4.fromValues(0.58,0.3,0,1), vertexLightingProgram, vertexBufferPalmTree, palmTreeVertices.length/3, waterTexture);
		mat4.scale(palmTree.transform, palmTree.transform, vec3.fromValues(0.2, 0.2, 0.2));
		mat4.translate(palmTree.transform, palmTree.transform, vec3.fromValues(5, 3+i, 5));
	
		// Push object on the stack
		objects.push(palmTree);
	}
	
	///// PALM LEAF OBJECTS /////
	
	for (var i = 0; i < 4; i++) 
	{
		// Create buffer and copy data into it
		var vertexBufferPalmLeaf = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferPalmLeaf);
		gl.bufferData(gl.ARRAY_BUFFER, palmLeafVertices, gl.STATIC_DRAW);
	
		// Create object
		var palmLeaf = new RenderObject(mat4.create(), vec4.fromValues(0,1,0,1), defaultProgram, vertexBufferPalmLeaf, palmLeafVertices.length/3, sandTexture);
		mat4.translate(palmLeaf.transform, palmLeaf.transform, vec3.fromValues(1, 1.6, 1));
		mat4.rotate(palmLeaf.transform, palmLeaf.transform, Math.PI * 0.5 * i, vec3.fromValues(0, 1, 0));
	
		// Push object on the stack
		objects.push(palmLeaf);
	}
    
    // Set view matrix
    viewMatrix = mat4.create();
    viewMatrixLoc = gl.getUniformLocation(program, "viewMatrix");
    
    // Set projection matrix
    projectionMatrix = mat4.create();
    mat4.perspective(projectionMatrix, Math.PI * 0.25, canvas.width / canvas.height, 0.5, 100);
    projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");
    
    cameraPos = gl.getUniformLocation(program, "cameraPos");
    
    lightPosition = vec3.fromValues(1.0, 5.0, 5.0);
    var lightPos = gl.getUniformLocation(program, "lightPosition");
    gl.uniform3fv(lightPos, lightPosition);
    
    // initiale Kameraposition einstellen
    eye = vec3.fromValues(10.0, 2.0, 20.0);
    // Mittelpunkt - Blickrichtung
    target = vec3.fromValues(0.0, 0.0, 0.0);
    // Kameraneigung
    up = vec3.fromValues(0.0, 1.0, 0.0);
	
    
	render();
};

function render()
{	
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    // Hier wird die Bewegung ausgefŸhrt
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
    
    // viewMatrix und projectionMatrix Ÿbergeben
    gl.uniformMatrix4fv(viewMatrixLoc, false, viewMatrix);
    gl.uniformMatrix4fv(projectionMatrixLoc, false, projectionMatrix);
    
    gl.uniform4fv(cameraPos, eye);
	
	objects.forEach(function(object) 
	{
		// Set shader program
		gl.useProgram(object.shader);

		// Set attribute
		var vPosition = gl.getAttribLocation(object.shader, "vPosition");
		gl.bindBuffer(gl.ARRAY_BUFFER, object.buffer);
		gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(vPosition);
		
		// Set lighting
		if (object.lighting == true)
		{
			var vNormal = gl.getAttribLocation(object.shader, "vNormal");
			gl.bindBuffer(gl.ARRAY_BUFFER, object.normalBuffer);
			gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);
			gl.enableVertexAttribArray(vNormal);
			
			// Set object color
			var ambientLightLoc = gl.getUniformLocation(object.shader, "ka");
			gl.uniform4f(ambientLightLoc, 0.4, 0.4, 0.4, 0.5);
			var diffuseLightLoc = gl.getUniformLocation(object.shader, "kd");
			gl.uniform4fv(diffuseLightLoc, object.color);
			var specularLightLoc = gl.getUniformLocation(object.shader, "ks");
			gl.uniform4fv(specularLightLoc, object.color);
			
			// Set light source attributes
			var diffuseLightSourceLoc = gl.getUniformLocation(object.shader, "Id");
			gl.uniform4f(diffuseLightSourceLoc, 0.7, 0.7, 0.7, 1.0);
			var specularLightSourceLoc = gl.getUniformLocation(object.shader, "Is");
			gl.uniform4f(specularLightSourceLoc, 0.8, 0.5, 0.3, 1.0);
			var lightPositionLoc = gl.getUniformLocation(object.shader, "lightPosition");
			gl.uniform3f(lightPositionLoc, 5.0, 5.0, 10.0);
			var ambientLightWorldLoc = gl.getUniformLocation(object.shader, "Ia");
			gl.uniform4f(ambientLightWorldLoc, 0.7, 0.7, 0.7, 1.0);
			
			// Calculate and set normal matrix
			var mvMatrix = mat4.create();
			mat4.multiply(mvMatrix, viewMatrix, object.transform);
			var normalMatrix = mat4.create();
			mat4.transpose(normalMatrix, mvMatrix);
			mat4.invert(normalMatrix, normalMatrix);
			normalMatrixLoc = gl.getUniformLocation(object.shader, "normalMatrix");
			gl.uniformMatrix4fv(normalMatrixLoc, false, normalMatrix);
		}
		else
		{
			var colorLoc = gl.getUniformLocation(object.shader, "objectColor");
			gl.uniform4fv(colorLoc, object.color);
		}
		
	    // Set textures
		if (object.textured == true) {
		    // Put tex coords from the VBO to the shader
		    var vTextureCoord = gl.getAttribLocation(object.shader, "vTexCoord");
		    gl.bindBuffer(gl.ARRAY_BUFFER, object.texCoordBuffer);
		    gl.vertexAttribPointer(vTextureCoord, 2, gl.FLOAT, false, 0, 0);
		    gl.enableVertexAttribArray(vTextureCoord);

		    // Connect diffuse map to the shader
		    gl.activeTexture(gl.TEXTURE0);
		    gl.bindTexture(gl.TEXTURE_2D, object.texture);
		    gl.uniform1i(gl.getUniformLocation(object.shader, "diffuseMap"), 0);
            
		    // TODO 3: Verknüpfe Normal Map analog zu diffuser Map mit Shader.
            if (object.texture == sandTexture) {
                gl.activeTexture(gl.TEXTURE1);
                gl.bindTexture(gl.TEXTURE_2D, sandNormals);
                gl.uniform1i(gl.getUniformLocation(object.shader, "normalMap"), 1);
            }
		}
		
		// Set uniforms
		var projectionMatrixLoc = gl.getUniformLocation(object.shader, "projectionMatrix");
		var viewMatrixLoc = gl.getUniformLocation(object.shader, "viewMatrix");
		var modelMatrixLoc = gl.getUniformLocation(object.shader, "modelMatrix");
		gl.uniformMatrix4fv(projectionMatrixLoc, false, projectionMatrix);
		gl.uniformMatrix4fv(viewMatrixLoc, false, viewMatrix);
		gl.uniformMatrix4fv(modelMatrixLoc, false, object.transform);

		// Draw
		gl.drawArrays(gl.TRIANGLES, 0, object.bufferLength);
	});

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

// Kann modifiziert werden, um Bewegungsgeschwindigkeit zu Šndern
var speed = 0.1;

// Spezifizierung der Bewegungen:
function moveForward()
{
    var direction = vec3.create();
    vec3.subtract(direction, target, eye);
    direction[1] = 0.0;
    vec3.normalize(direction, direction);
    // doppelt so schnell nach vorne bewegen,
    // wie andere Richtungen - natŸrlicherer Bewegungsablauf
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

//Code zustŠndig fŸr pointerlock und mousemovement:
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

