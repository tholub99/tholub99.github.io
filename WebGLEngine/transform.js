const WORLD_UP = vec3(0,1,0);
const WORLD_FORWARD = vec3(0,0,1);
const WORLD_RIGHT = vec3(-1,0,0);

class Transform {

    constructor(pos = vec3(), scale = vec3(1,1,1), rot = vec3())
    {
        this.position = pos;
        this.scale = scale;
        this.rotation = rot;

        this.UpdateTransform();
    }

    UpdateTransform()
    {
        let t = translate(this.position[0], this.position[1], this.position[2]);
        let r = mult(rotateZ(this.rotation[2]), mult(rotateY(this.rotation[1]), rotateX(this.rotation[0])));
        let s = scale(this.scale[0], this.scale[1], this.scale[2]);
        
        this.modelMatrix = mult(t, mult(r, s));

        let newForward = mult(r, vec4(WORLD_FORWARD[0], WORLD_FORWARD[1], WORLD_FORWARD[2], 1));
        this.forward = normalize(vec3(newForward[0], newForward[1], newForward[2]));

        let newRight = mult(r, vec4(WORLD_RIGHT[0], WORLD_RIGHT[1], WORLD_RIGHT[2], 1));
        this.right = normalize(vec3(newRight[0], newRight[1], newRight[2]));

        this.up = normalize(cross(this.right, this.forward));
    }

    SetPosition(newPos)
    {
        this.position = newPos;
        this.UpdateTransform();
    }

    SetScale(newScale)
    {
        this.scale = newScale;
        this.UpdateTransform();
    }

    SetRotation(newRot)
    {
        this.rotation = newRot;
        this.UpdateTransform();
    }

    Translate(translation)
    {
        this.position = add(this.position, translation);
        this.UpdateTransform();
    }

    RotateByDeg(eulers)
    {
        this.rotation = add(this.rotation, eulers);
        this.UpdateTransform();
    }

    RotateByRad(eulers)
    {
        this.rotation = add(this.rotation, vec3(degrees(eulers[0]), degrees(eulers[1]), degrees(eulers[2])));
        this.UpdateTransform();
    }

    RotateXByDeg(deg)
    {
        this.rotation[0] += deg;
        this.UpdateTransform();
    }

    RotateXByRad(rad)
    {
        this.rotation[0] += degrees(rad);
        this.UpdateTransform();
    }

    RotateYByDeg(deg)
    {
        this.rotation[1] += deg;
        this.UpdateTransform();
    }

    RotateYByRad(rad)
    {
        this.rotation[1] += degrees(rad);
        this.UpdateTransform();
    }

    RotateZByDeg(deg)
    {
        this.rotation[2] += deg;
        this.UpdateTransform();
    }

    RotateZByRad(rad)
    {
        this.rotation[2] += degrees(rad);
        this.UpdateTransform();
    }

    Scale(factors)
    {
        this.scale[0] = factors[0] * this.scale[0];
        this.scale[1] = factors[1] * this.scale[1];
        this.scale[2] = factors[2] * this.scale[2];
        this.UpdateTransform();
    }

    ScaleUniform(factor)
    {
        this.scale = mult(factor, this.scale);
        this.UpdateTransform();
    }

    ScaleX(factor)
    {
        this.scale[0] = factor * this.scale[0];
        this.UpdateTransform();
    }

    ScaleY(factor)
    {
        this.scale[1] = factor * this.scale[1];
        this.UpdateTransform();
    }

    ScaleZ(factor)
    {
        this.scale[2] = factor * this.scale[2];
        this.UpdateTransform();
    }
}