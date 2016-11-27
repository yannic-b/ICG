// Render-Objekt mit
function RenderObject(positionBuffer, colorBuffer, modelMatrix)
{
    this.positionBuffer = positionBuffer;
    this.colorBuffer = colorBuffer;
    this.modelMatrix = modelMatrix;
}

/// generiert für eine gegebene Farbe ein einfarbiges Color-Array, das als Color-Buffer verwendet werden kann
function makeCubeUniColorArray(r,g,b,a)
{
    var colorArray = new Float32Array(144);
    
    for (var i = 0; i < colorArray.length; i++)
    {
        switch (i % 4)
        {
                // Rot
            case 0:
                colorArray[i] = r;
                break;
                // Grün
            case 1:
                colorArray[i] = g;
                break;
                // Blau
            case 2:
                colorArray[i] = b;
                break;
                // Alpha
            case 3:
                colorArray[i] = a;
                break;
        }
    }
    return colorArray;
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

// 3D-Objekte, die präsentiert werden
var objectsToRender =
[
 // grüner Boden
 new RenderObject(positions, makeCubeUniColorArray(0, 0.9, 0.1, 1), groundModelMatrix),
 // roter Würfel
 new RenderObject(positions, makeCubeUniColorArray(1.0, 0, 0, 1), cubeModelMatrix)
];
