out vec4 FragColor;

in vec2 TexCoords;
in vec3 fPos;
in vec3 Normal;

in vec4 shadowCoord;
in float camDepth;

#ifdef HAS_TANGENTS 
in vec4 Tangent;
#endif

//material textures
uniform sampler2D baseColorTexture;
uniform sampler2D emissiveTexture;
uniform sampler2D metallicRoughnessTexture;
uniform sampler2D normalTexture;

//depth texture
uniform sampler2D depthMap;
uniform float maxDepth;

// material parameters
uniform vec3 bcFactor;
uniform vec3 eFactor;
uniform float mFactor;
uniform float rFactor;
const float ao = 1.0;

//Directional Light
struct Light {
    vec3 position;
    vec3 color;
    bool enabled;
};
uniform Light light;

uniform vec3 viewPos;

const float PI = 3.14159265359;

float CalculateShadows()
{
    float shadow = 1.0;
    vec3 shadowMapTexCoord = shadowCoord.xyz/shadowCoord.w;//put in range [-1,1]
    shadowMapTexCoord = 0.5*shadowMapTexCoord+0.5; //shift to range [0,1]
    
    //distance between light an nearest occluder
    float nearestDistance = texture(depthMap, shadowMapTexCoord.xy).r;
    float fragDistance = camDepth/maxDepth;

    if(nearestDistance < fragDistance - 0.01) //precision allowance
        shadow *= 0.5;
    
    return shadow;
}

vec3 getNormalFromTexture()
{
    vec3 tangentNormal = texture(normalTexture, TexCoords).xyz * 2.0 - 1.0;

    vec3 Q1  = dFdx(fPos);
    vec3 Q2  = dFdy(fPos);
    vec2 st1 = dFdx(TexCoords);
    vec2 st2 = dFdy(TexCoords);

    vec3 N   = normalize(Normal);
    vec3 T  = normalize(Q1*st2.t - Q2*st1.t);
    vec3 B  = -normalize(cross(N, T));
    mat3 TBN = mat3(T, B, N);

    return normalize(TBN * tangentNormal);
}

float DistributionGGX(vec3 N, vec3 H, float roughnessFactor)
{
    float a = roughnessFactor*roughnessFactor;
    float a2 = a*a;
    float NdotH = max(dot(N, H), 0.0);
    float NdotH2 = NdotH*NdotH;

    float nom   = a2;
    float denom = (NdotH2 * (a2 - 1.0) + 1.0);
    denom = PI * denom * denom;

    return nom / denom;
}

float GeometrySchlickGGX(float NdotV, float roughnessFactor)
{
    float r = (roughnessFactor + 1.0);
    float k = (r*r) / 8.0;

    float nom   = NdotV;
    float denom = NdotV * (1.0 - k) + k;

    return nom / denom;
}

float GeometrySmith(vec3 N, vec3 V, vec3 L, float roughnessFactor)
{
    float NdotV = max(dot(N, V), 0.0);
    float NdotL = max(dot(N, L), 0.0);
    float ggx2 = GeometrySchlickGGX(NdotV, roughnessFactor);
    float ggx1 = GeometrySchlickGGX(NdotL, roughnessFactor);

    return ggx1 * ggx2;
}

vec3 fresnelSchlick(float cosTheta, vec3 F0)
{
    return F0 + (1.0 - F0) * pow(1.0 - cosTheta, 5.0);
}

vec3 fresnelSchlickRoughness(float cosTheta, vec3 F0, float roughnessFactor)
{
    return F0 + (max(vec3(1.0 - roughnessFactor), F0) - F0) * pow(1.0 - cosTheta, 5.0);
}   

void main()
{		
	vec3 baseColorFactor = bcFactor;
#ifdef HAS_BCT
	baseColorFactor = pow(texture(baseColorTexture, TexCoords).rgb, vec3(2.2));
#endif

	float roughnessFactor = rFactor;
	float metallicFactor = mFactor;
#ifdef HAS_MRT
	roughnessFactor = texture(metallicRoughnessTexture, TexCoords).g;
	metallicFactor = texture(metallicRoughnessTexture, TexCoords).b;
#endif

	vec3 emissiveFactor = eFactor;
#ifdef HAS_ET
	emissiveFactor = texture(emissiveTexture, TexCoords).rgb;
#endif
	
    vec3 N = normalize(Normal);
#ifdef HAS_NT
	N = getNormalFromTexture();
#endif

    vec3 V = normalize(viewPos - fPos);
    vec3 R = reflect(-V, N); 
 
    vec3 F0 = vec3(0.04); 
    F0 = mix(F0, baseColorFactor, metallicFactor);

    // reflectance equation
    vec3 Lo = vec3(0.0);

    // calculate per-light radiance
    vec3 L = normalize(light.position - fPos);
    vec3 H = normalize(V + L);
    //float distance = length(lightPositions[i] - fPos);
    //float attenuation = 1.0 / (distance * distance);
    vec3 radiance = light.color;

    //BRDF
    float NDF = DistributionGGX(N, H, roughnessFactor);   
    float G = GeometrySmith(N, V, L, roughnessFactor);    
    vec3 F = fresnelSchlick(max(dot(H, V), 0.0), F0);        
    
    vec3 nominator = NDF * G * F;
    float denominator = 4.0 * max(dot(N, V), 0.0) * max(dot(N, L), 0.0) + 0.001;
    vec3 specular = nominator / denominator;
    
    vec3 ks = F;

    vec3 kd = vec3(1.0) - ks;
    kd *= 1.0 - metallicFactor;	                
        
    float NdotL = max(dot(N, L), 0.0);        

    // add to outgoing radiance Lo
    Lo += (kd * baseColorFactor/ PI + specular) * radiance * NdotL;

    vec3 ambient = vec3(0.03) * baseColorFactor * ao;
    float shadow = CalculateShadows();
    
    vec3 color = (ambient + Lo);

    // HDR tonemapping
    color = color / (color + vec3(1.0));
    // gamma correct
    color = pow(color, vec3(1.0/2.2)); 

    FragColor = vec4(color * shadow, 1.0);//vec4(color , 1.0);
}