#version 300 es
precision mediump float;

in float camDepth;

out vec4 fColor;

uniform float maxDepth;

void main()
{
    fColor= vec4(camDepth, camDepth, camDepth,1.0);
    fColor.xyz/=maxDepth; //convert to be in range [0,1]
} 