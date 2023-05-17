class ModelGLTF 
{
    constructor(uri, shaderData)
    {
        this.meshes = [];
        this.buffers = [];
        this.shaderData = shaderData;
        this.baseDir = this.GetBaseDir(uri);

        this.minX = Infinity;
        this.maxX = -Infinity;
        this.minY = Infinity;
        this.maxY = -Infinity;
        this.minZ = Infinity;
        this.maxZ = -Infinity;

        this.LoadModel(uri);
    }
    async LoadModel(uri)
    {
        var response = await fetch(uri);
        this.model = await response.json();

        if(this.model.accessors == undefined || this.model.accessors.length == 0) {
            throw new Error(`GLTF File is missing accessors`);
        }

        await this.PreLoadBuffers();

        this.BindModel();
    }

    Draw(uniformData)
    {
        for(var i = 0; i < this.meshes.length; i++)
        {
            this.meshes[i].Draw(uniformData);
        }
    }

    DrawShadows(uniformData)
    {
        for(var i = 0; i < this.meshes.length; i++)
        {
            this.meshes[i].DrawShadows(uniformData);
        }
    }

    BindModel()
    {
        this.scene = this.model.scenes[this.model.scene == undefined ? 0 : this.model.scene]
        for(var i = 0; i < this.scene.nodes.length; i++)
        {
            this.BindNodes(this.model.nodes[this.scene.nodes[i]], mat4());
        }
        this.CalcBoundingBox();
    }

    BindNodes(node, parentTransform)
    {
        var transform = mat4();
        if(node.matrix != undefined)
        {
            let tMat = node.matrix;
            transform = mat4(
                tMat[0], tMat[4], tMat[8],  tMat[12],
                tMat[1], tMat[5], tMat[9],  tMat[13],
                tMat[2], tMat[6], tMat[10], tMat[14],
                tMat[3], tMat[7], tMat[11], tMat[15]
            );
        }
        else
        {
            var transMat = mat4();
            var rotMat = mat4();
            var scaleMat = mat4();

            if(node.translation != undefined)
            {
                transMat = translate(node.translation[0], node.translation[1], node.translation[2]);
            }

            if(node.rotation != undefined)
            {
                let rotation = this.QuatToEuler(vec4(node.rotation[0], node.rotation[1], node.rotation[2], node.rotation[3]));
                let rx = rotateX(rotation[0]);
                let ry = rotateY(rotation[1]);
                let rz = rotateZ(rotation[2]);

                rotMat = mult(rz, mult(ry, rx));
            }

            if(node.scale != undefined)
            {
                scaleMat = scale(node.scale[0], node.scale[1], node.scale[2]);
            }
            transform = mult(transMat, mult(rotMat, scaleMat));
        }

        transform = mult(parentTransform, transform);

        if((node.mesh >= 0) && (node.mesh < this.model.meshes.length))
        {
            this.meshes.push(this.BindMesh(this.model.meshes[node.mesh], transform));
        }

        if(node.children != undefined)
        {
            for(var i = 0; i < node.children.length; i++)
            {
                this.BindNodes(this.model.nodes[node.children[i]], transform);
            }
        }
    }

    BindMesh(mesh, transform)
    {
        var VAOs = [];
        var materials = [];
        var defines = "#version 300 es\n"

        for(var i = 0; i < mesh.primitives.length; i++)
        {
            let primVAO = gl.createVertexArray();
            gl.bindVertexArray(primVAO);

            let material = {};

            let primitive = mesh.primitives[i];
            let indexAccessor = this.model.accessors[primitive.indices != undefined ? primitive.indices : -1];
            let materialNode = this.model.materials[primitive.material != undefined ? primitive.material : -1];

            if(primitive.indices != undefined)
            {
                this.CreateBuffer(this.model.bufferViews[indexAccessor.bufferView], gl.ELEMENT_ARRAY_BUFFER);
            }


            if(primitive.attributes.POSITION != undefined)
            {
                let accessor = this.model.accessors[primitive.attributes.POSITION];
                this.CheckMinMax(accessor.min, accessor.max);
                this.BindBuffer(accessor, 0, gl.ARRAY_BUFFER);
            }

            if(primitive.attributes.NORMAL != undefined)
            {
                defines = defines.concat("#define HAS_NORMALS\n")
                let accessor = this.model.accessors[primitive.attributes.NORMAL];
                this.BindBuffer(accessor, 1, gl.ARRAY_BUFFER);
            }

            if(primitive.attributes.TEXCOORD_0 != undefined)
            {
                defines = defines.concat("#define HAS_UVS\n")
                let accessor = this.model.accessors[primitive.attributes.TEXCOORD_0];
                this.BindBuffer(accessor, 2, gl.ARRAY_BUFFER);
            }

            if(primitive.attributes.TANGENT != undefined)
            {
                defines = defines.concat("#define HAS_TANGENTS\n")
                let accessor = this.model.accessors[primitive.attributes.TANGENT];
                this.BindBuffer(accessor, 3, gl.ARRAY_BUFFER);
            }

            if(primitive.material != undefined)
            {
                if(materialNode.pbrMetallicRoughness.baseColorTexture != undefined)
                {
                    material.baseColorTexture = this.BindTexture(this.model.textures[materialNode.pbrMetallicRoughness.baseColorTexture.index].source);
                    defines = defines.concat("#define HAS_BCT\n");
                }
                if(materialNode.emissiveTexture != undefined)
                {
                    material.emissiveTexture = this.BindTexture(this.model.textures[materialNode.emissiveTexture.index].source);
                    defines = defines.concat("#define HAS_ET\n");
                }
                if(materialNode.pbrMetallicRoughness.metallicRoughnessTexture != undefined)
                {
                    material.metallicRoughnessTexture = this.BindTexture(this.model.textures[materialNode.pbrMetallicRoughness.metallicRoughnessTexture.index].source);
                    defines = defines.concat("#define HAS_MRT\n");
                }
                if(materialNode.normalTexture != undefined)
                {
                    material.normalTexture = this.BindTexture(this.model.textures[materialNode.normalTexture.index].source);
                    defines = defines.concat("#define HAS_NT\n");
                }
            }

            material.baseColorFactor = materialNode.pbrMetallicRoughness.baseColorFactor != undefined ? 
            vec3(materialNode.pbrMetallicRoughness.baseColorFactor[0], materialNode.pbrMetallicRoughness.baseColorFactor[1], materialNode.pbrMetallicRoughness.baseColorFactor[2]) : 
            vec3(1,1,1);
        
            material.emissiveFactor = 
            materialNode.emissiveFactor != undefined ? 
            vec3(materialNode.emissiveFactor[0], materialNode.emissiveFactor[1], materialNode.emissiveFactor[2]) : 
            vec3(0,0,0);

            material.metallicFactor = materialNode.pbrMetallicRoughness.metallicFactor != undefined ? 
            materialNode.pbrMetallicRoughness.metallicFactor :
            1;

            material.roughnessFactor = materialNode.pbrMetallicRoughness.roughnessFactor != undefined ?
            materialNode.pbrMetallicRoughness.roughnessFactor :
            1;

            materials.push(material);
            VAOs.push(primVAO);
            
        }

        return new MeshGLTF(VAOs, mesh, materials, this.model.accessors, transform, this.shaderData, defines);
    }

    CreateBuffer(bufferView, targetDefault)
    {
        const buffer = this.buffers[bufferView.buffer]
        var target;
        if(bufferView.target != undefined)
            target = bufferView.target;
        else
            target = targetDefault;
        
        //console.log(`buffer view target = ${target}`);

        var vbo = gl.createBuffer();
        gl.bindBuffer(target, vbo);

        
        //console.log(`buffer data size = ${buffer.byteLength}\nbuffer view byte offset = ${bufferView.byteOffset}`);
        let offset = bufferView.byteOffset;
        let length = bufferView.byteLength;
        
        gl.bufferData(target, buffer, gl.STATIC_DRAW, offset, length);

        return vbo;
    }

    BindBuffer(accessor, vaa, targetDefault)
    {
        var bufferView = this.model.bufferViews[accessor.bufferView];
        var vbo = this.CreateBuffer(bufferView, targetDefault);

        let byteStride = 0;
        let size = this.GetSizeFromType(accessor.type);

        gl.enableVertexAttribArray(vaa);
        gl.vertexAttribPointer(vaa, size, accessor.componentType, false, byteStride, accessor.byteOffset);

        return vbo;
    }

    BindTexture(source)
    {
        var texID = gl.createTexture();

        var image = new Image();
        image.texID = texID;
        image.format = gl.RGBA;
        image.type = gl.UNSIGNED_BYTE;
        
        image.onload = function()
        {
            gl.bindTexture(gl.TEXTURE_2D, image.texID);
            gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);

            gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

            gl.texImage2D(gl.TEXTURE_2D, 0, image.format, image.width, image.height, 0, image.format, image.type, image);
            gl.generateMipmap(gl.TEXTURE_2D);
        }

        image.src = this.baseDir + "/" + this.model.images[source].uri;

        return texID;
    }

    GetSizeFromType(type)
    {
        switch(type)
        {
            case "SCALAR":
                return 1;
            case "VEC2":
                return 2;
            case "VEC3":
                return 3;
            case "VEC4":
                return 4;
            case "MAT2":
                return 4;
            case "MAT3":
                return 9;
            case "MAT4":
                return 16;
        }
    }

    async PreLoadBuffers()
    {
        for(var i = 0; i < this.model.buffers.length; i++)
        {
            let data = await this.LoadExternalBuffer(this.model.buffers[i].uri);
            this.buffers.push(data);
        }
    }

    LoadExternalBuffer(uri)
    {
        return new Promise((resolve, reject) =>
        {
            var req = new XMLHttpRequest();
            req.open('GET', this.baseDir + "/" + uri, true);
            req.responseType = 'blob';
            req.onload = function()
            {
                const reader = new FileReader();
                reader.readAsArrayBuffer(req.response);
                reader.onloadend = function(evt) 
                {
                    resolve(new Uint8Array(evt.target.result));
                }
                reader.onerror = reject;
            }
            req.send(null);
        });
    }

    GetBaseDir(path)
    {
        if(path.lastIndexOf("/") != -1)
            return path.substring(0, path.lastIndexOf("/"));
    }

    QuatToEuler(q)
    {
        var euler = vec3();
        
        let sinr_cosp = 2 * (q[3] * q[0] + q[1] * q[2]);
        let cosr_cosp = 1 - 2 * (q[0] * q[0] + q[1] * q[1]);
        euler[0] = Math.atan2(sinr_cosp, cosr_cosp);
        
        let sinp = 2 * (q[3] * q[1] - q[2] * q[0]);
        if(Math.abs(sinp) >= 1)
            euler[1] = (Math.PI / 2) * (sinp / Math.abs(sinp));
        else
            euler[1] = Math.asin(sinp);

        let siny_cosp = 2 * (q[3] * q[2] + q[0] * q[1]);
        let cosy_cosp = 1 - 2 * (q[1] * q[1] + q[2] * q[2]);
        euler[0] = Math.atan2(siny_cosp, cosy_cosp);

        return euler;
    }

    CheckMinMax(minVec, maxVec)
    {
        this.minX = minVec[0] < this.minX ? minVec[0] : this.minX;
        this.maxX = maxVec[0] > this.maxX ? maxVec[0] : this.maxX;

        this.minY = minVec[1] < this.minY ? minVec[1] : this.minY;
        this.maxY = maxVec[1] > this.maxY ? maxVec[1] : this.maxY;

        this.minZ = minVec[2] < this.minZ ? minVec[2] : this.minZ;
        this.maxZ = maxVec[2] > this.maxZ ? maxVec[2] : this.maxZ;    
    }

    CalcBoundingBox()
    {
        this.width = this.maxX - this.minX;
        this.length = this.maxY - this.minY;
        this.height = this.maxZ - this.minZ;
    }
}

class MeshGLTF
{
    constructor(primitiveVAOs, mesh, primitiveMaterials, accessors, transform, shaderData, defines)
    {
        this.primitiveVAOs = primitiveVAOs;
        this.mesh = mesh;
        this.primitiveMaterials = primitiveMaterials;
        this.accessors = accessors;
        this.transform = transform;
        this.shader = new ShaderGLTF(shaderData.vPath, shaderData.fPath);

        this.shader.CompileShader(defines);
    }

    Draw(uniformData)
    {
        this.shader.Use();
        this.SetUniforms(uniformData);

        for(var i = 0; i < this.mesh.primitives.length; i++)
        {
            let vao = this.primitiveVAOs[i];
            gl.bindVertexArray(vao);

            let material = this.primitiveMaterials[i];

            let primitive = this.mesh.primitives[i];
            let indexAccessor = this.accessors[primitive.indices != undefined ? primitive.indices : -1];

            this.shader.SetFloat("mFactor", material.metallicFactor);
            this.shader.SetFloat("rFactor", material.roughnessFactor);
            this.shader.SetVec3("bcFactor", material.baseColorFactor);
            this.shader.SetVec3("eFactor", material.emissiveFactor);

            if(material.baseColorTexture != undefined)
            {
                gl.activeTexture(gl.TEXTURE3);
                this.shader.SetInt("baseColorTexture", 3);
                gl.bindTexture(gl.TEXTURE_2D, material.baseColorTexture);
            }

            if(material.emissiveTexture != undefined)
            {
                gl.activeTexture(gl.TEXTURE4);
                this.shader.SetInt("emissiveTexture", 4);
                gl.bindTexture(gl.TEXTURE_2D, material.emissiveTexture);
            }

            if(material.metallicRoughnessTexture != undefined)
            {
                gl.activeTexture(gl.TEXTURE5);
                this.shader.SetInt("metallicRoughnessTexture", 5);
                gl.bindTexture(gl.TEXTURE_2D, material.metallicRoughnessTexture);
            }

            if(material.normalTexture != undefined)
            {
                gl.activeTexture(gl.TEXTURE6);
                this.shader.SetInt("normalTexture", 6);
                gl.bindTexture(gl.TEXTURE_2D, material.normalTexture);
            }

            if(indexAccessor != undefined)
                gl.drawElements(primitive.mode, indexAccessor.count, indexAccessor.componentType, indexAccessor.byteOffset);

            gl.bindVertexArray(null);
        }
    }

    DrawShadows(uniformData)
    {
        uniformData.depthShader.Use();
        //uniformData.depthShader.SetMat4("lightSpaceMatrix", uniformData.lightSpaceMatrix);

        var model = mult(uniformData.model, this.transform);
        uniformData.depthShader.SetMat4("modelMatrix", model);
        uniformData.depthShader.SetMat4("lightViewMatrix", uniformData.lightViewMatrix);
        uniformData.depthShader.SetMat4("projectionMatrix", uniformData.projection);
        uniformData.depthShader.SetFloat("maxDepth", 10000.0);

        for(var i = 0; i < this.mesh.primitives.length; i++)
        {
            let vao = this.primitiveVAOs[i];
            gl.bindVertexArray(vao);

            let primitive = this.mesh.primitives[i];
            let indexAccessor = this.accessors[primitive.indices != undefined ? primitive.indices : -1];

            if(indexAccessor != undefined)
                gl.drawElements(primitive.mode, indexAccessor.count, indexAccessor.componentType, indexAccessor.byteOffset);

            gl.bindVertexArray(null);
        }
    }

    SetUniforms(uniformData)
    {
        var model = mult(uniformData.model, this.transform);
        this.shader.SetMat4("modelMatrix", model);
        this.shader.SetMat4("viewMatrix", uniformData.view);
        this.shader.SetMat4("projectionMatrix", uniformData.projection);
        this.shader.SetMat4("lightViewMatrix", uniformData.lightViewMatrix);
        this.shader.SetVec3("viewPos", uniformData.viewPos);
        this.shader.SetFloat("maxDepth", 10000.0);

        uniformData.sceneLights.forEach(light => {
            light.AssignUniforms(this.shader);
        });

        this.shader.SetInt("depthMap", 0);
    }
}