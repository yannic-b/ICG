// Render-Objekt mit
function RenderObject(positionBuffer, colorBuffer, modelMatrix)
{
    this.positionBuffer = positionBuffer;
    this.colorBuffer = colorBuffer;
    this.modelMatrix = modelMatrix;
}


// Bodenplatte
var groundModelMatrix = new Float32Array([1, 0, 0, 0,
                                          0, 0.001, 0, 0,
                                          0, 0, 1, 0,
                                          0, 0, 0, 0.1]);
// Würfel
var cubeModelMatrix = new Float32Array([1, 0, 0, 0,
                                        0, 1, 0, 0,
                                        0, 0, 1, 0,
                                        0, 0, 0, 1]);


								 // Front
var positions = new Float32Array([-0.5, -0.5,  0.5,
                                0.5, -0.5,  0.5,
                              0.5,  0.5,  0.5,
                              
                              0.5,  0.5,  0.5,
                              -0.5,  0.5,  0.5,
                              -0.5, -0.5,  0.5,
                              
                              // Right
                              0.5,  0.5,  0.5,
                              0.5, -0.5,  0.5,
                              0.5, -0.5, -0.5,
                              
                              0.5, -0.5, -0.5,
                              0.5,  0.5, -0.5,
                              0.5,  0.5,  0.5,
                              
                              // Back
                              -0.5, -0.5, -0.5,
                              0.5, -0.5, -0.5,
                              0.5,  0.5, -0.5,
                              
                              0.5,  0.5, -0.5,
                              -0.5,  0.5, -0.5,
                              -0.5, -0.5, -0.5,
                              
                              // Left
                              -0.5,  0.5,  0.5,
                              -0.5, -0.5,  0.5,
                              -0.5, -0.5, -0.5,
                              
                              -0.5, -0.5, -0.5,
                              -0.5,  0.5, -0.5,
                              -0.5,  0.5,  0.5,
                              
                              // Bottom
                              -0.5, -0.5,  0.5,
                              0.5, -0.5,  0.5,
                              0.5, -0.5, -0.5,
                              
                              0.5, -0.5, -0.5,
                              -0.5, -0.5, -0.5,
                              -0.5, -0.5,  0.5,
                              
                              // Top
                              -0.5,  0.5,  0.5,
                              0.5,  0.5,  0.5,
                              0.5,  0.5, -0.5,
                              
                              0.5,  0.5, -0.5,
                              -0.5,  0.5, -0.5,
                              -0.5,  0.5,  0.5
                              ]);

// Front
var colors = new Float32Array([0, 0, 1, 1,
                           0, 0, 1, 1,
                           0, 0, 1, 1,
                           0, 0, 1, 1,
                           0, 0, 1, 1,
                           0, 0, 1, 1,
                           
                           // Right
                           0, 1, 0, 1,
                           0, 1, 0, 1,
                           0, 1, 0, 1,
                           0, 1, 0, 1,
                           0, 1, 0, 1,
                           0, 1, 0, 1,
                           
                           // Back
                           1, 0, 0, 1,
                           1, 0, 0, 1,
                           1, 0, 0, 1,
                           1, 0, 0, 1,
                           1, 0, 0, 1,
                           1, 0, 0, 1,
                           
                           // Left
                           1, 1, 0, 1,
                           1, 1, 0, 1,
                           1, 1, 0, 1,
                           1, 1, 0, 1,
                           1, 1, 0, 1,
                           1, 1, 0, 1,
                           
                           // Bottom
                           1, 0, 1, 1,
                           1, 0, 1, 1,
                           1, 0, 1, 1,
                           1, 0, 1, 1,
                           1, 0, 1, 1,
                           1, 0, 1, 1,
                           
                           // Top
                           0, 1, 0.2, 1,
                           0, 1, 0.2, 1,
                           0, 1, 0.2, 1,
                           0, 1, 0.2, 1,
                           0, 1, 0.2, 1,
                           0, 1, 0.2, 1
                           ]);

var objectsToRender = [
       new RenderObject(positions, colors, groundModelMatrix),
       new RenderObject(positions, colors, cubeModelMatrix)
];
