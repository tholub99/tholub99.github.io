#version 300 es
layout (location = 0) in vec3 a_Position;

uniform mat4 modelMatrix;
uniform mat4 lightViewMatrix;
uniform mat4 projectionMatrix;

out float camDepth;

void main()
{
    gl_Position = projectionMatrix * lightViewMatrix * modelMatrix * vec4(a_Position, 1.0);
    camDepth = -(lightViewMatrix * modelMatrix *vec4(a_Position, 1.0)).z;
}  