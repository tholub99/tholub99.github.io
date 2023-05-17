class Object3D 
{
    constructor(pos, scale, rot, amb, diff, spec, sh)
    {
        this.tx = pos[0];
    	this.ty = pos[1];
    	this.tz = pos[2];
    	this.sx = scale[0];
        this.sy = scale[1];
        this.sz = scale[2];
    	this.modelRotationX = rot[0];
    	this.modelRotationY = rot[1];
    	this.modelRotationZ = rot[2];

        this.ambient = amb;
        this.diffuse = diff;
        this.specular = spec;
        this.shininess = sh;

    	this.UpdateModelMatrix();
    }
    
    UpdateModelMatrix()
    {
        let t = translate(this.tx, this.ty, this.tz);		     
	   		     
    	let s = scale(this.sx,this.sy,this.sz);
    	
    	let rx = rotateX(this.modelRotationX);
    	let ry = rotateY(this.modelRotationY);
    	let rz = rotateZ(this.modelRotationZ);
	
	    this.modelMatrix = mult(t,mult(s,mult(rz,mult(ry,rx))));
        this.inverseModel = transpose(inverse(this.modelMatrix));
    }

    GetModelMatrix(){
        return this.modelMatrix;
    }
        
    SetModelMatrix(mm){
        this.modelMatrix = mm;
    }


    Translate(transVec)
    {
        this.tx += transVec[0];
        this.ty += transVec[1];
        this.tx += transVec[2];
        this.UpdateModelMatrix();
    }

    ScaleUniform(scaleVal)
    {
        this.sx = scaleVal;
        this.sy = scaleVal;
        this.sz = scaleVal;
        this.UpdateModelMatrix();
    }

    Scale(scaleVec)
    {
        this.sx = scaleVec[0];
        this.sy = scaleVec[1];
        this.sx = scaleVec[2];
        this.UpdateModelMatrix();
    }

    RotateDeg(rotVec)
    {
        this.modelRotationX = rotVec[0];
        this.modelRotationY = rotVec[1];
        this.modelRotationZ = rotVec[2];
        this.UpdateModelMatrix();
    }

    RotateRad(rotVec)
    {
        this.modelRotationX = degrees(rotVec[0]);
        this.modelRotationY = degrees(rotVec[1]);
        this.modelRotationZ = degrees(rotVec[2]);
        this.UpdateModelMatrix();
    }

    RotateXDeg(degVal)
    {
        this.modelRotationX = degVal;
        this.UpdateModelMatrix();
    }

    RotateXRad(radVal)
    {
        this.modelRotationX = degrees(radVal);
        this.UpdateModelMatrix();
    }

    RotateYDeg(degVal)
    {
        this.modelRotationY = degVal;
        this.UpdateModelMatrix();
    }

    RotateYRad(radVal)
    {
        this.modelRotationY = degrees(radVal);
        this.UpdateModelMatrix();
    }

    RotateZDeg(degVal)
    {
        this.modelRotationZ = degVal;
        this.UpdateModelMatrix();
    }

    RotateZRad(radVal)
    {
        this.modelRotationZ = degrees(radVal);
        this.UpdateModelMatrix();
    }
}