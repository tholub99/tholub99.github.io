var canvas;
var gl;
var angle = 0.0;

//Camera Vars
var mouseX;
var mouseY;
var lastX = 0;
var lastY = 0;
var firstMove = true;

var d = new Date();
var deltaTime = 0.0;
var lastFrame = 0.0;

var camera1 = new Camera(vec3(0,75,150), vec3(0,1,0));
var camera2 = new Camera(vec3(0,0,150), vec3(0,0,1));
camera2.MOVE_SPEED = 10;
var cam1Active = true;
var cam2Active = false;

var light = new PBRLight(vec3(-2500, 2500, 2500), vec3(1,1,1));
var lights = [
    light
];
const SHADOW_WIDTH = 8192, SHADOW_HEIGHT = 8192;
const DEPTHMAP_TEX = 0;

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );
    gl = canvas.getContext('webgl2');
    if ( !gl ) { alert( "WebGL 2.0 isn't available" ); }

    document.addEventListener("keydown", handleKeyboardEvent, false);
    document.addEventListener("keyup", handleKeyboardEvent, false);
    canvas.addEventListener("click", HandleClick, false);

    canvas.onclick = function() {
        //canvas.requestPointerLock();
    };

    const ext = gl.getExtension('GMAN_debug_helper');
    if (ext) {
    ext.setConfiguration({
        warnUndefinedUniforms: false,
    });
    }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.6, 0.6, 0.8, 1.0 );
    gl.enable(gl.DEPTH_TEST);

    depthMap = InitShadowMap();
    depthShader = new Shader("./WebGLEngine/Shaders/depthShader.vs", "./WebGLEngine/Shaders/depthShader.fs");

    var gltfShaderData = {};
    gltfShaderData.vPath = "./WebGLEngine/Shaders/gltfShader.vs";
    gltfShaderData.fPath = "./WebGLEngine/Shaders/gltfShader.fs";

    //Models
    raceCarModel = new ModelGLTF("WebGLEngine/models/racecar/racecar.gltf", gltfShaderData);
    f1Model = new ModelGLTF("WebGLEngine/models/f1/f1.gltf", gltfShaderData);
    VanModel = new ModelGLTF("WebGLEngine/models/van/van.gltf", gltfShaderData);

    terrain = new ModelGLTF("WebGLEngine/models/terrain/Terrain.gltf", gltfShaderData);
    scenary = new ModelGLTF("WebGLEngine/models/scenary/Scenary.gltf", gltfShaderData);
    trainModel = new ModelGLTF("WebGLEngine/models/freight-train/freight-train.gltf", gltfShaderData);
    cargoModel = new ModelGLTF("WebGLEngine/models/ship-cargo/ship-cargo.gltf", gltfShaderData);

    //GameObjects
    raceCar = new GameObject();
    raceCar.SetModel(raceCarModel);
    raceCar.transform.SetScale(vec3(0.25, 0.25, 0.25));

    vanCar = new GameObject();
    vanCar.SetModel(VanModel);
    vanCar.transform.SetScale(vec3(0.25, 0.25, 0.25));
    vanCar.transform.SetPosition(vec3(-1350, 0, -1750));

    f1Car = new GameObject();
    f1Car.SetModel(f1Model);
    f1Car.transform.SetScale(vec3(0.25, 0.25, 0.25));
    f1Car.transform.SetPosition(vec3(1350, 0, 1050));

    train = new GameObject();
    train.SetModel(trainModel);
    train.transform.SetScale(vec3(0.25, 0.25, 0.25));
    train.transform.SetPosition(vec3(0, 75, -2625));

    boat = new GameObject();
    boat.SetModel(cargoModel);
    boat.transform.SetScale(vec3(0.25, 0.25, 0.25));
    boat.transform.SetPosition(vec3(0, -25, 2625));

    environment = new GameObject();
    environment.SetModel(terrain);
    environment.transform.SetScale(vec3(0.25, 0.25, 0.25));
    
    enviornmentScenary = new GameObject();
    enviornmentScenary.SetModel(scenary);
    enviornmentScenary.transform.SetScale(vec3(0.25, 0.25, 0.25));
    enviornmentScenary.transform.SetPosition(vec3(-432, 590, 457));


    //Controllers
    vanCarController = new CarController(vanCar, 1, 1.5, 55, 10);
    raceCarController = new CarController(raceCar, 2, 1.5, 45, 15);
    f1CarController = new CarController(f1Car, 4, 1.5, 35, 30);

    carControllers = [
        raceCarController,
        f1CarController,
        vanCarController
    ];
    activeCarController = raceCarController;
    
    render();
};

function render()
{
    setTimeout(function()
    {
        requestAnimationFrame(render);
        processInputs();

        let currentFrame = new Date().getTime();
        deltaTime = (currentFrame - lastFrame) / 1000.0;
        lastFrame = currentFrame;

        var uniformData = {};
        uniformData.model = mat4();
        uniformData.view = lookAt(cam1Active ? camera1.pos : camera2.pos, activeCarController.car.transform.position, WORLD_UP);
        uniformData.projection = cam1Active ? camera1.projectionMatrix : camera2.projectionMatrix;
        uniformData.viewPos = cam1Active ? camera1.pos : camera2.pos;
        uniformData.sceneLights = lights;

        uniformData.lightViewMatrix = lookAt(light.pos, vec3(2000,0,-2000), vec3(0,1,0));//mult(lightProjection, lightView);

        gl.cullFace(gl.FRONT);
        RenderShadows(uniformData);
        gl.cullFace(gl.BACK);

        gl.viewport( 0, 0, canvas.width, canvas.height );
        gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        uniformData.isShadowPass = false;
        uniformData.depthShader = null;
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, depthMap);
        RenderScene(uniformData);
    }, 30);
    
}

function RenderShadows(uniformData)
{
    gl.viewport( 0, 0, SHADOW_WIDTH, SHADOW_HEIGHT );
    gl.bindFramebuffer(gl.FRAMEBUFFER, depthMapFBO);
        gl.bindRenderbuffer(gl.RENDERBUFFER, depthMapRBO);

            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, depthMap);
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, depthMap, 0);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

            uniformData.isShadowPass = true;
            uniformData.depthShader = depthShader;
            RenderScene(uniformData);

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.bindRenderbuffer(gl.RENDERBUFFER, null);
}

function RenderScene(uniformData)
{
    //Component Updates
    carControllers.forEach(controller => {
        controller.Update(deltaTime);
    });

    //Camera Updates
    camera1.pos = add(activeCarController.car.transform.position, add(mult(-150, activeCarController.car.transform.forward), mult(100, activeCarController.car.transform.up)));
    camera2.pos = add(activeCarController.car.transform.position, add(mult(-1, activeCarController.car.transform.forward), mult(500, activeCarController.car.transform.up)));

    uniformData.model = mat4();
    environment.Render(uniformData);

    uniformData.model = mat4();
    enviornmentScenary.Render(uniformData);

    uniformData.model = mat4();
    train.transform.Translate(vec3(-4, 0, 0));
    train.Render(uniformData);
    if(train.transform.position[0] <= -2500)
    {   
        train.transform.SetPosition(vec3(2500, 75, -2625));
    }

    uniformData.model = mat4();
    boat.Render(uniformData);

    uniformData.model = mat4();
    raceCar.Render(uniformData);

    uniformData.model = mat4();
    f1Car.Render(uniformData);

    uniformData.model = mat4();
    vanCar.Render(uniformData);
}

function InitShadowMap()
{
    depthMapFBO = gl.createFramebuffer();
    depthMapFBO.width = SHADOW_WIDTH;
    depthMapFBO.height = SHADOW_HEIGHT;
    gl.bindFramebuffer(gl.FRAMEBUFFER, depthMapFBO);

    depthMapRBO = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, depthMapRBO);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, SHADOW_WIDTH, SHADOW_HEIGHT);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthMapRBO);

    var depthMap = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, depthMap);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, SHADOW_WIDTH, SHADOW_HEIGHT, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT); 

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);

    return depthMap;
}

function ToggleCamera()
{
    cam1Active = !cam1Active;
    cam2Active = !cam2Active;
}

function HandleClick(event)
{
    var mousePos = GetRelativeMousePosition(event);
    let x = 2 * (mousePos.x / canvas.width) - 1;
    let y = 1 - 2 * (mousePos.y / canvas.height);
    let pFront = vec4(x, y, -1, 1);
    let pCam = mult(inverse(cam1Active ? camera1.projectionMatrix : camera2.projectionMatrix), pFront);
    pCam = vec4(pCam[0], pCam[1], -1, 1);
    let pWorld = mult(inverse(lookAt(cam1Active ? camera1.pos : camera2.pos, activeCarController.car.transform.position, WORLD_UP)), pCam);

    let origin = cam1Active ? camera1.pos : camera2.pos;
    let ray = normalize(subtract(vec3(pWorld[0], pWorld[1], pWorld[2]), cam1Active ? camera1.pos : camera2.pos));

    let clickedControllers = [];
    carControllers.filter(e => e != activeCarController).forEach(controller => {
        if(controller.CheckCollision(ray, origin))
        {
            console.log("Car Clicked");
            clickedControllers.push(controller);
        }
    });

    if(clickedControllers.length > 0)
    {
        if(clickedControllers.length > 1)
        {
            let minDistance = Infinity;
            let closestController = null;
            clickedControllers.forEach(controller => {
                if(length(cam1Active ? camera1.pos : camera2.pos, controller.car.transform.position) < minDistance)
                    closestController = controller;
            });
            activeCarController = closestController;
        }
        else
        {
            activeCarController = clickedControllers[0];
        }
    }
}

function GetRelativeMousePosition(event)
{
    var target = event.target;
    var rect = target.getBoundingClientRect();

    return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
    }
}

var inputMap = {};
const keyCodes = {
    Enter: 13,
    Shift: 16,
    Control: 17,
    Alt: 18,
    Escape: 27,
    Space: 32,
    ArrowLeft: 37,
    ArrowUp: 38,
    ArrowRight: 39,
    ArrowDown: 40,
    Digit0: 48,
    Digit1: 49,
    Digit2: 50,
    Digit3: 51,
    Digit4: 52,
    Digit5: 53,
    Digit6: 54,
    Digit7: 55,
    Digit8: 56,
    Digit9: 57,
    Numpad0: 96,
    Numpad1: 97,
    Numpad2: 98,
    Numpad3: 99,
    Numpad4: 100,
    Numpad5: 101,
    Numpad6: 102,
    Numpad7: 103,
    Numpad8: 104,
    Numpad9: 105,
}
function handleKeyboardEvent(event)
{
    inputMap[event.code] = event.type == "keydown";
}

onkeypress = function(event){
    switch(event.key.toLowerCase())
    {
        case " ":
            ToggleCamera();
            break;
    }
}

function processInputs()
{
    if(inputMap.KeyW || inputMap.KeyS)
    {
        if(inputMap.KeyW)
            activeCarController.verticalInput = 1;
        if(inputMap.KeyS)
            activeCarController.verticalInput = -1;
    }
    else
    {
        activeCarController.verticalInput = 0;
    }

    if(inputMap.KeyA || inputMap.KeyD)
    {
        if(inputMap.KeyA)
            activeCarController.horizontalInput = 1;
        if(inputMap.KeyD)
            activeCarController.horizontalInput = -1;
    }
    else
    {
        activeCarController.horizontalInput = 0;
    }
}




