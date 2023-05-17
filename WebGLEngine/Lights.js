class Light {
    constructor(amb, diff, spec, enabled)
    {
        this.ambient = amb;
        this.specular = spec;
        this.diffuse = diff;       

        this.enabled = enabled;
    }


    turnOff()
    {
        this.enabled = false;
    }

    turnOn()
    {
        this.enabled = true;
    }

    toggleEnabled()
    {
        this.enabled = !this.enabled;
    }
}

class PBRLight {
    constructor(pos, color, enabled = true, index = -1)
    {
        this.pos = pos;
        this.color = color;
        this.enabled = enabled;
        this.index = index;
    }

    TurnOff()
    {
        this.enabled = false;
    }

    TurnOn()
    {
        this.enabled = true;
    }

    Toggle()
    {
        this.enabled = !this.enabled;
    }

    AssignUniforms(shader)
    {
        if(this.index == -1)
        {
            shader.SetVec3("light.position", this.pos);
		    shader.SetVec3("light.color", this.color);
            shader.SetBool("light.enabled", this.enabled);
        }
        else
        {
            shader.SetVec3(`lights[${this.index}].position`, this.pos);
		    shader.SetVec3(`lights[${this.index}].color`, this.color);
            shader.SetBool(`lights[${this.index}].enabled`, this.enabled);
        } 
    }
}

class PointLight extends Light
{
    constructor(pos, amb, diff, spec, enabled, index = -1)
    {
        super(amb, diff, spec, enabled);
        this.position = pos;
        this.index = index;
    }

    AssignUniforms(shader)
    {
        if(this.index == -1)
        {
            shader.SetVec3("pointLight.position", this.position);
		    shader.SetVec3("pointLight.ambient", this.ambient);
		    shader.SetVec3("pointLight.diffuse", this.diffuse);
		    shader.SetVec3("pointLight.specular", this.specular);
		    shader.SetFloat("pointLight.constant", 1.0);
		    shader.SetFloat("pointLight.linear", 0.09);
		    shader.SetFloat("pointLight.quadratic", 0.032);
            shader.SetBool("pointLight.enabled", this.enabled);
        }
        else
        {
            shader.SetVec3(`pointLights[${this.index}].position`, this.position);
		    shader.SetVec3(`pointLights[${this.index}].ambient`, this.ambient);
		    shader.SetVec3(`pointLights[${this.index}].diffuse`, this.diffuse);
		    shader.SetVec3(`pointLights[${this.index}].specular`, this.specular);
		    shader.SetFloat(`pointLights[${this.index}].constant`, 1.0);
		    shader.SetFloat(`pointLights[${this.index}].linear`, 0.09);
		    shader.SetFloat(`pointLights[${this.index}].quadratic`, 0.032);
            shader.SetBool(`pointLights[${this.index}].enabled`, this.enabled);
        } 
    }
}

class SpotLight extends Light
{
    constructor(pos, dir, cutoff, amb, diff, spec, enabled, index = -1)
    {
        super(amb, diff, spec, enabled);
        this.position = pos;
        this.direction = dir;
        this.cutoff = cutoff;
        this.index = index;
    }

    AssignUniforms(shader)
    {
        if(this.index == -1)
        {
            shader.SetVec3("spotLight.position", this.position);
            shader.SetVec3("spotLight.direction", this.direction);
		    shader.SetVec3("spotLight.ambient", this.ambient);
		    shader.SetVec3("spotLight.diffuse", this.diffuse);
		    shader.SetVec3("spotLight.specular", this.specular);
		    shader.SetFloat("spotLight.constant", 1.0);
		    shader.SetFloat("spotLight.linear", 0.09);
		    shader.SetFloat("spotLight.quadratic", 0.032);
            shader.SetFloat(`spotLight.cutOff`, this.cutoff);
            shader.SetFloat(`spotLight.outerCutOff`, Math.cos(radians(15.0)));
            shader.SetBool("spotLight.enabled", this.enabled);
        }
        else
        {
            shader.SetVec3(`spotLights[${this.index}].position`, this.position);
            shader.SetVec3(`spotLights[${this.index}].direction`, this.direction);
		    shader.SetVec3(`spotLights[${this.index}].ambient`, this.ambient);
		    shader.SetVec3(`spotLights[${this.index}].diffuse`, this.diffuse);
		    shader.SetVec3(`spotLights[${this.index}].specular`, this.specular);
		    shader.SetFloat(`spotLights[${this.index}].constant`, 1.0);
		    shader.SetFloat(`spotLights[${this.index}].linear`, 0.09);
		    shader.SetFloat(`spotLights[${this.index}].quadratic`, 0.032);
            shader.SetFloat(`spotLights[${this.index}].cutOff`, this.cutoff);
            shader.SetFloat(`spotLights[${this.index}].outerCutOff`, Math.cos(radians(15.0)));
            shader.SetBool(`spotLights[${this.index}].enabled`, this.enabled);
        } 
    }
}

class DirLight extends Light
{
    constructor(dir, amb, diff, spec, enabled)
    {
        super(amb, diff, spec, enabled);
        this.direction = dir;
    }

    AssignUniforms(shader)
    {
        shader.SetVec3("dirLight.direction", this.direction);
		shader.SetVec3("dirLight.ambient", this.ambient);
		shader.SetVec3("dirLight.diffuse", this.diffuse);
		shader.SetVec3("dirLight.specular", this.specular);
        shader.SetBool("dirLight.enabled", this.enabled);
    }
}