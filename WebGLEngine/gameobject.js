class GameObject {
    constructor()
    {
        this.transform = new Transform();
        this.active = true;
        this.empty = true;
    }

    SetModel(model)
    {
        this.model = model;
        this.empty = false;
    }

    RemoveModel()
    {
        this.model = null;
        this.empty = true;
    }

    SetActive(val)
    {
        this.active = val;
    }

    Render(uniformData)
    {
        uniformData.model = mult(uniformData.model, this.transform.modelMatrix);
        if(!this.empty && this.active)
        {
            if(uniformData.isShadowPass)
            {
                this.model.DrawShadows(uniformData);
            }
            else
            {
                this.model.Draw(uniformData);
            }
        }
    }
}