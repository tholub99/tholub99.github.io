class Shader
{
    constructor(vsPath, fsPath)
    {
        this.shaderProgram = initShaders(gl, vsPath, fsPath);
    }

    Use()
    {
        gl.useProgram(this.shaderProgram);
    }

    GetAttributeLocation(name)
    {
        return gl.getAttribLocation(this.shaderProgram, name);
    }

    SetMat4(name, val)
    {
        gl.uniformMatrix4fv(gl.getUniformLocation(this.shaderProgram, name), false, flatten(val));
    }

    SetMat3(name, val)
    {
        gl.uniformMatrix3fv(gl.getUniformLocation(this.shaderProgram, name), false, flatten(val));
    }

    SetMat2(name, val)
    {
        gl.uniformMatrix2fv(gl.getUniformLocation(this.shaderProgram, name), false, flatten(val));
    }

    SetVec4(name, val)
    {
        gl.uniform4fv(gl.getUniformLocation(this.shaderProgram, name), val);
    }

    SetVec3(name, val)
    {
        gl.uniform3fv(gl.getUniformLocation(this.shaderProgram, name), val);
    }

    SetVec2(name, val)
    {
        gl.uniform2fv(gl.getUniformLocation(this.shaderProgram, name), val);
    }

    SetBool(name, val)
    {
        gl.uniform1i(gl.getUniformLocation(this.shaderProgram, name), val)
    }

    SetInt(name, val)
    {
        gl.uniform1i(gl.getUniformLocation(this.shaderProgram, name), val)
    }

    SetFloat(name, val)
    {
        gl.uniform1f(gl.getUniformLocation(this.shaderProgram, name), val)
    }
}

class ShaderGLTF
{
    constructor(vsPath, fsPath)
    {
        this.LoadShader(vsPath, fsPath);
        this.shaderCompiled = false;
    }

    Use()
    {
        if(this.shaderCompiled)
            gl.useProgram(this.program);
        else
            console.log("Error: Attempt at using uncompiled shader");
    }

    GetAttributeLocation(name)
    {
        return gl.getAttribLocation(this.program, name);
    }

    SetMat4(name, val)
    {
        gl.uniformMatrix4fv(gl.getUniformLocation(this.program, name), false, flatten(val));
    }

    SetMat3(name, val)
    {
        gl.uniformMatrix3fv(gl.getUniformLocation(this.program, name), false, flatten(val));
    }

    SetMat2(name, val)
    {
        gl.uniformMatrix2fv(gl.getUniformLocation(this.program, name), false, flatten(val));
    }

    SetVec4(name, val)
    {
        gl.uniform4fv(gl.getUniformLocation(this.program, name), val);
    }

    SetVec3(name, val)
    {
        gl.uniform3fv(gl.getUniformLocation(this.program, name), val);
    }

    SetVec2(name, val)
    {
        gl.uniform2fv(gl.getUniformLocation(this.program, name), val);
    }

    SetBool(name, val)
    {
        gl.uniform1i(gl.getUniformLocation(this.program, name), val)
    }

    SetInt(name, val)
    {
        gl.uniform1i(gl.getUniformLocation(this.program, name), val)
    }

    SetFloat(name, val)
    {
        gl.uniform1f(gl.getUniformLocation(this.program, name), val)
    }

    LoadShader(vsPath, fsPath)
    {
        this.vShaderSource = loadFileAJAX(vsPath);
        this.fShaderSource = loadFileAJAX(fsPath);
    }

    CompileShader(defines = "#version 300 es\n")
    {
        if(!this.shaderCompiled)
        {
            this.program = gl.createProgram();
            let vShaderCode = defines.concat(this.vShaderSource);
            let fShaderCode = defines.concat("precision mediump float;\n",this.fShaderSource);
            
            let vertexShader = gl.createShader(gl.VERTEX_SHADER);
            gl.shaderSource(vertexShader, vShaderCode);
            gl.compileShader(vertexShader);
            this.CheckCompileErrors(vertexShader, "VERTEX");

            let fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
            gl.shaderSource(fragmentShader, fShaderCode);
            gl.compileShader(fragmentShader);
            this.CheckCompileErrors(fragmentShader, "FRAGMENT");

            gl.attachShader(this.program, vertexShader);
            gl.attachShader(this.program, fragmentShader);
            gl.linkProgram(this.program);
            this.CheckCompileErrors(this.program, "PROGRAM");

            gl.deleteShader(vertexShader);
            gl.deleteShader(fragmentShader);

            this.shaderCompiled = true;
        }
        else
        {
            console.log("Shader already compiled?")
        }
    }

    CheckCompileErrors(shader, type)
    {
        if(type != "PROGRAM")
        {
            if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
            {
                console.log(gl.getShaderInfoLog(shader));
                return false;
            }
        }
        else
        {
            if (!gl.getProgramParameter(shader, gl.LINK_STATUS)) {
                console.log("Could not initialise shaders");
                return null;
            }
        }
    }
}