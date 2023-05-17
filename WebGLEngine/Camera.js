class Camera {
    WORLD_UP = vec3(0,1,0);
	MOVE_SPEED = 3;
	ROATATE_SPEED = 3.0;
	CAMERA_SENSITIVITY = 0.1;

	NEAR_PLANE = 70;
	FAR_PLANE = 3000;

	up;
	front;
	right;

	yaw;
	pitch;

    constructor(pos, up, front = vec3(0.0,0.0,-1.0)){
    	this.pos = pos;
        this.up = up;
		this.front = front;

		this.yaw = -90;
		this.pitch = 0;
    	
    	this.projectionMatrix = perspective(90,1.0,70,10000);

    	this.updateCameraMatrix();
    }
    
    updateCameraMatrix(){
		let newFront = vec3(0,0,0);

		newFront[0] = Math.cos(radians(this.yaw)) * Math.cos(radians(this.pitch));
		newFront[1] = Math.sin(radians(this.pitch));
		newFront[2] = Math.sin(radians(this.yaw)) * Math.cos(radians(this.pitch));

		this.front = normalize(newFront);
		this.right = normalize(cross(this.front, this.WORLD_UP));
		this.up = normalize(cross(this.right, this.front));

		this.cameraMatrix = lookAt(this.pos, add(this.pos,this.front), this.up);
    }

	MoveForward()
	{
		this.pos = add(this.pos, mult(this.MOVE_SPEED, this.front));
		this.updateCameraMatrix();
	}

	MoveBackward()
	{
		this.pos = subtract(this.pos, mult(this.MOVE_SPEED, this.front));
		this.updateCameraMatrix();
	}

	MoveLeft()
	{
		this.pos = subtract(this.pos, mult(this.MOVE_SPEED, this.right));
		this.updateCameraMatrix();
	}

	MoveRight()
	{
		this.pos = add(this.pos, mult(this.MOVE_SPEED, this.right));
		this.updateCameraMatrix();
	}

	MoveUp()
	{
		this.pos = add(this.pos, mult(this.MOVE_SPEED, this.up));
		this.updateCameraMatrix();
	}

	MoveDown()
	{
		this.pos = subtract(this.pos, mult(this.MOVE_SPEED, this.up));
		this.updateCameraMatrix();
	}

	RotateLeft()
	{
		this.yaw -= this.ROATATE_SPEED;
		this.updateCameraMatrix();
	}

	RotateRight()
	{
		this.yaw += this.ROATATE_SPEED;
		this.updateCameraMatrix();
	}

	RotateAboutCenter(deg)
	{
		let x = 2 * Math.sin(radians(deg));
		let y = 2;
		let z = 2 * Math.cos(radians(deg));
		this.pos = vec3(x,y,z);
		this.updateCameraMatrix();
	}

	ProcessMouseMovement(xOffSet, yOffset)
	{
		xOffSet *= this.CAMERA_SENSITIVITY;
		yOffset *= this.CAMERA_SENSITIVITY;

		this.yaw += xOffSet;
		this.pitch -= yOffset;

		if (this.pitch > 89.0)
			this.pitch = 89.0;
		if (this.pitch < -89.0)
			this.pitch = -89.0
		
		this.updateCameraMatrix();
	}
}
