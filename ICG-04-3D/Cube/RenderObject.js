// Render-Objekt mit Properties für Rendering
var RenderObject = function(modelMatrix, color, vertexBuffer, indexBuffer, normalBuffer)
{
    this.modelMatrix = modelMatrix;
    this.color = color;
    this.vertexBuffer = vertexBuffer;
    this.indexBuffer = indexBuffer;
    this.numVertices = indexBuffer.numItems;
    this.normalBuffer = normalBuffer;
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

// verrücktes Polygon
var polygonModelMatrix = new Float32Array([0.6, 0, 0, 0,
                                        0, 1, 0, 0.2,
                                        0.1, 0.3, 1, 0,
                                        0, 0, 0.5, 1]);


                                        // Front
var groundPositions = new Float32Array([-0.5, -0.5,  0.5,
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
var cubePositions1 = new Float32Array([0, 0,  0.5,
                                        0.5, 0,  0.5,
                                        0.5,  0.5,  0.5,
                                        
                                        0.5,  0.5,  0.5,
                                        0,  0.5,  0.5,
                                        0, 0,  0.5,
                                        
                                        // Right
                                        0.5,  0.5,  0.5,
                                        0.5, 0,  0.5,
                                        0.5, 0, 0,
                                        
                                        0.5, 0, 0,
                                        0.5,  0.5, 0,
                                        0.5,  0.5,  0.5,
                                        
                                        // Back
                                        0, 0, 0,
                                        0.5, 0, 0,
                                        0.5,  0.5, 0,
                                        
                                        0.5,  0.5, 0,
                                        0,  0.5, 0,
                                        0, 0, 0,
                                        
                                        // Left
                                        0,  0.5,  0.5,
                                        0, 0,  0.5,
                                        0, 0, 0,
                                        
                                        0, 0, 0,
                                        0,  0.5, 0,
                                        0,  0.5,  0.5,
                                        
                                        // Bottom
                                        0, 0,  0.5,
                                        0.5, 0,  0.5,
                                        0.5, 0, 0,
                                        
                                        0.5, 0, 0,
                                        0, 0, 0,
                                        0, 0,  0.5,
                                        
                                        // Top
                                        0,  0.5,  0.5,
                                        0.5,  0.5,  0.5,
                                        0.5,  0.5, 0,
                                        
                                        0.5,  0.5, 0,
                                        0,  0.5, 0,
                                        0,  0.5,  0.5
                                        ]);

// Front
var cubePositions2 = new Float32Array([0.75, 0.75,  0.25,
                                       0.25, 0.75,  0.25,
                                       0.25,  0.25,  0.25,
                                       
                                       0.25,  0.25,  0.25,
                                       0.75,  0.25,  0.25,
                                       0.75, 0.75,  0.25,
                                       
                                       // Right
                                       0.25,  0.25,  0.25,
                                       0.25, 0.75,  0.25,
                                       0.25, 0.75, 0.75,
                                       
                                       0.25, 0.75, 0.75,
                                       0.25,  0.25, 0.75,
                                       0.25,  0.25,  0.25,
                                       
                                       // Back
                                       0.75, 0.75, 0.75,
                                       0.25, 0.75, 0.75,
                                       0.25,  0.25, 0.75,
                                       
                                       0.25,  0.25, 0.75,
                                       0.75,  0.25, 0.75,
                                       0.75, 0.75, 0.75,
                                       
                                       // Left
                                       0.75,  0.25,  0.25,
                                       0.75, 0.75,  0.25,
                                       0.75, 0.75, 0.75,
                                       
                                       0.75, 0.75, 0.75,
                                       0.75,  0.25, 0.75,
                                       0.75,  0.25,  0.25,
                                       
                                       // Bottom
                                       0.75, 0.75,  0.25,
                                       0.25, 0.75,  0.25,
                                       0.25, 0.75, 0.75,
                                       
                                       0.25, 0.75, 0.75,
                                       0.75, 0.75, 0.75,
                                       0.75, 0.75,  0.25,
                                       
                                       // Top
                                       0.75,  0.25,  0.25,
                                       0.25,  0.25,  0.25,
                                       0.25,  0.25, 0.75,
                                       
                                       0.25,  0.25, 0.75,
                                       0.75,  0.25, 0.75,
                                       0.75,  0.75,  0.5
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

//// 3D-Objekte, die präsentiert werden
//var objectsToRender =
//[
// // grüner Boden
// new RenderObject(groundModelMatrix, (0, 0.9, 0.1, 1), groundPositions),
// // roter Würfel
// new RenderObject(cubeModelMatrix, (1.0, 0, 0, 1), cubePositions1),
// // blaue Figur
// new RenderObject(cubeModelMatrix, (0, 0, 1.0, 1), cubePositions1),
//];
