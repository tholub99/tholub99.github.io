class Skybox extends Object3D
{
    vertexPositions = [
        vec3(-1.0,  1.0, -1.0),
        vec3(-1.0, -1.0, -1.0),
        vec3(1.0, -1.0, -1.0),
        vec3(1.0, -1.0, -1.0),
        vec3(1.0,  1.0, -1.0),
        vec3(-1.0,  1.0, -1.0),

        vec3(-1.0, -1.0,  1.0),
        vec3(-1.0, -1.0, -1.0),
        vec3(-1.0,  1.0, -1.0),
        vec3(-1.0,  1.0, -1.0),
        vec3(-1.0,  1.0,  1.0),
        vec3(-1.0, -1.0,  1.0),

        vec3(1.0, -1.0, -1.0),
        vec3(1.0, -1.0,  1.0),
        vec3(1.0,  1.0,  1.0),
        vec3(1.0,  1.0,  1.0),
        vec3(1.0,  1.0, -1.0),
        vec3(1.0, -1.0, -1.0),

        vec3(-1.0, -1.0,  1.0),
        vec3(-1.0,  1.0,  1.0),
        vec3(1.0,  1.0,  1.0),
        vec3(1.0,  1.0,  1.0),
        vec3(1.0, -1.0,  1.0),
        vec3(-1.0, -1.0,  1.0),

        vec3(-1.0,  1.0, -1.0),
        vec3(1.0,  1.0, -1.0),
        vec3(1.0,  1.0,  1.0),
        vec3(1.0,  1.0,  1.0),
        vec3(-1.0,  1.0,  1.0),
        vec3(-1.0,  1.0, -1.0),

        vec3(-1.0, -1.0, -1.0),
        vec3(-1.0, -1.0,  1.0),
        vec3(1.0, -1.0, -1.0),
        vec3(1.0, -1.0, -1.0),
        vec3(-1.0, -1.0,  1.0),
        vec3(1.0, -1.0,  1.0)
    ];

    positionBuffer = -1;
    static texture = -1;

    constructor(facePaths)
    {
        super(vec3(0,0,0), vec3(1,1,1), vec3(0,0,0), vec3(0,0,0), vec3(0,0,0), vec3(0,0,0), vec3(0,0,0), 0.0);
        this.LoadCubemap(facePaths);
        this.InitBuffers();
    }

    InitBuffers()
    {
        //Create Vertex Array Object
        this.vao = gl.createVertexArray();
        gl.bindVertexArray(this.vao);

        this.positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(this.vertexPositions), gl.STATIC_DRAW);

        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0 ,0);
        gl.enableVertexAttribArray(0);
    }

    LoadCubemap(facePaths)
    {
        var IntFaceDict = {
            0: gl.TEXTURE_CUBE_MAP_POSITIVE_X,
            1: gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
            2: gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
            3: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
            4: gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
            5: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z
        };
        Skybox.texture =  gl.createTexture();
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, Skybox.texture);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP,gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP,gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP,gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP,gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP,gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);

        for(var i = 0; i < facePaths.length; i++)
        {
            var image = new Image();
            image.face = IntFaceDict[i];
            image.tex = Skybox.texture;
            image.onload = function()
            {
                gl.activeTexture(gl.TEXTURE1);
                gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.tex);
                gl.texImage2D(this.face, 0, gl.RGB, this.width, this.height, 0, gl.RGB, gl.UNSIGNED_BYTE, this);
            }
            image.src = facePaths[i];
        }
    }

    LoadFace(face, image)
    {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, Skybox.texture);
        gl.texImage2D(face, 0, gl.RGB, image.width, image.height, 0, gl.RGB, gl.UNSIGNED_BYTE, image)
    }

    draw()
    {
        gl.disable(gl.DEPTH_TEST);

        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, Skybox.texture);
        
        gl.bindVertexArray(this.vao);
        gl.drawArrays(gl.TRIANGLES, 0, this.vertexPositions.length);
        gl.bindVertexArray(null);

        gl.enable(gl.DEPTH_TEST);
    }
}