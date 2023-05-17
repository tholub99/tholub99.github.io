layout (location = 0) in vec3 a_Position;
#ifdef HAS_NORMALS
layout(location = 1) in vec3 a_Normal;
#endif
#ifdef HAS_UVS
layout(location = 2) in vec2 a_TexCoord0;
#endif
#ifdef HAS_TANGENTS
layout(location = 3) in vec4 a_Tangent;
#endif

out vec2 TexCoords;
out vec3 fPos;

out vec4 shadowCoord;
out float camDepth;

#ifdef HAS_NORMALS
out vec3 Normal;
#endif

#ifdef HAS_TANGENTS
out vec4 Tangent;
#endif

uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;
uniform mat4 lightViewMatrix;

void main()
{
    fPos = vec3(modelMatrix * vec4(a_Position, 1.0));
    shadowCoord = projectionMatrix * lightViewMatrix * modelMatrix * vec4(a_Position, 1.0);
    camDepth = -(lightViewMatrix * modelMatrix * vec4(a_Position, 1.0)).z;

#ifdef HAS_UVS
    TexCoords = a_TexCoord0;
#else
    TexCoords = vec2(0.0, 0.0);
#endif

#ifdef HAS_NORMALS
	Normal =  mat3(modelMatrix) * a_Normal; 
#endif

    gl_Position = projectionMatrix * viewMatrix * vec4(fPos, 1.0);
}