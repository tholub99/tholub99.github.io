class CarController
{
    constructor(gameObject, forwardAcceleration, reverseAcceleration, turnSpeed, maxSpeed)
    {
        this.car = gameObject;
        this.forwardAccel = forwardAcceleration;
        this.reverseAccel = reverseAcceleration;
        this.turnSpeed = turnSpeed;
        this.maxSpeed = maxSpeed;

        this.currentVelocity = 0;
        this.verticalInput = 0;
        this.horizontalInput = 0;

        this.UpdateOBB();
    }

    Update(deltaTime)
    {
        //Forward Reverse Movement
        let acceleration = 0;
        if(this.verticalInput != 0)
        {
            acceleration = this.verticalInput * (this.verticalInput > 0 ? this.forwardAccel : this.reverseAccel);
            if(Math.abs(this.currentVelocity) > 0 && Math.abs(acceleration) / acceleration != Math.abs(this.currentVelocity) / this.currentVelocity)
                acceleration *= 10;
        }
        else if(Math.abs(this.currentVelocity) > 0)
        {
            acceleration = -2 * Math.abs(this.currentVelocity) / this.currentVelocity;
        }
        let newVelocity = this.currentVelocity + acceleration * deltaTime;
        
        if(Math.abs(newVelocity) > this.maxSpeed){
            newVelocity = this.verticalInput * this.maxSpeed;
        }
        this.currentVelocity = newVelocity;

        this.car.transform.Translate(mult(this.currentVelocity, this.car.transform.forward));

        //Turning Movement
        let newRotation = 0;
        if(Math.abs(this.currentVelocity) / this.currentVelocity == this.verticalInput)
        {
            newRotation = this.horizontalInput * this.turnSpeed * deltaTime * this.verticalInput;
        }
        this.car.transform.RotateYByDeg(newRotation);

        this.UpdateOBB();
    }

    UpdateOBB()
    {
        let model = this.car.model;
        this.OBB = {};
        let p1 = mult(this.car.transform.modelMatrix, vec4(model.minX, model.minY, model.minZ, 1.0));
        let p2 = mult(this.car.transform.modelMatrix, vec4(model.maxX, model.maxY, model.maxZ, 1.0));

        this.OBB.p1 = vec3(
            p1[0] < p2[0] ? p1[0] : p2[0],
            p1[1] < p2[1] ? p1[1] : p2[1],
            p1[2] < p2[2] ? p1[2] : p2[2]
        );
        this.OBB.p2 = vec3(
            p1[0] > p2[0] ? p1[0] : p2[0],
            p1[1] > p2[1] ? p1[1] : p2[1],
            p1[2] > p2[2] ? p1[2] : p2[2]
        );

        this.OBB.forward = this.car.transform.forward;
        this.OBB.right = this.car.transform.right;
        this.OBB.up = this.car.transform.up;
    }

    CheckCollision(ray, origin)
    {
        var minV, maxV, minH, maxH, N, nom, denom, a, p;

        //Check Top
        N = this.OBB.up;
        minV = this.OBB.p1[2];
        maxV = this.OBB.p2[2];
        minH = this.OBB.p1[0];
        maxH = this.OBB.p2[0];
        d = dot(mult(-1, this.OBB.p2), N);

        nom = dot(origin, N) + d;
        denom = dot(ray, N);

        if(!denom == 0)
        {
            a = -1 * nom/denom;
            if(!(a < 0))
            {
                p = add(origin, mult(a, ray));
                if(p[2] >= minV && p[2] <= maxV && p[0] >= minH && p[0] <= maxH)
                    return true;
            }
        }

        //Check Left
        N = mult(-1, this.OBB.right);
        minV = this.OBB.p1[1];
        maxV = this.OBB.p2[1];
        minH = this.OBB.p1[2];
        maxH = this.OBB.p2[2];
        d = dot(mult(-1, this.OBB.p1), N);

        nom = dot(origin, N) + d;
        denom = dot(ray, N);

        if(!denom == 0)
        {
            a = -1 * nom/denom;
            if(!(a < 0))
            {
                p = add(origin, mult(a, ray));
                if(p[1] >= minV && p[1] <= maxV && p[2] >= minH && p[2] <= maxH)
                    return true;
            }
        }

        //Check Right
        N = this.OBB.right;
        minV = this.OBB.p1[1];
        maxV = this.OBB.p2[1];
        minH = this.OBB.p1[2];
        maxH = this.OBB.p2[2];
        d = dot(mult(-1, this.OBB.p2), N);

        nom = dot(origin, N) + d;
        denom = dot(ray, N);

        if(!denom == 0)
        {
            a = -1 * nom/denom;
            if(!(a < 0))
            {
                p = add(origin, mult(a, ray));
                if(p[1] >= minV && p[1] <= maxV && p[2] >= minH && p[2] <= maxH)
                    return true;
            }
        }

        //Check Front
        N = this.OBB.forward;
        minV = this.OBB.p1[1];
        maxV = this.OBB.p2[1];
        minH = this.OBB.p1[0];
        maxH = this.OBB.p2[0];
        d = dot(mult(-1, this.OBB.p2), N);

        nom = dot(origin, N) + d;
        denom = dot(ray, N);

        if(!denom == 0)
        {
            a = -1 * nom/denom;
            if(!(a < 0))
            {
                p = add(origin, mult(a, ray));
                if(p[1] >= minV && p[1] <= maxV && p[0] >= minH && p[0] <= maxH)
                    return true;
            }
        }

        //Check Back
        N = mult(-1, this.OBB.forward);
        minV = this.OBB.p1[1];
        maxV = this.OBB.p2[1];
        minH = this.OBB.p1[0];
        maxH = this.OBB.p2[0];
        d = dot(mult(-1, this.OBB.p1), N);

        nom = dot(origin, N) + d;
        denom = dot(ray, N);

        if(!denom == 0)
        {
            a = -1 * nom/denom;
            if(!(a < 0))
            {
                p = add(origin, mult(a, ray));
                if(p[1] >= minV && p[1] <= maxV && p[0] >= minH && p[0] <= maxH)
                    return true;
            }
        }

        return false;
    }
}