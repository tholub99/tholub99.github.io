#version 300 es
layout (location = 0) in vec3 aPos;

out vec3 TexCoords;

uniform mat4 projectionMatrix;
uniform mat4 cameraMatrix;

void main()
{
    TexCoords = aPos;
    gl_Position = projectionMatrix * mat4(mat3(cameraMatrix)) * vec4(aPos, 1.0);
}  