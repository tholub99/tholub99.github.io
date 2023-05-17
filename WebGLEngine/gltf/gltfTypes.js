class Model
{
    name;
    meshes = [];
    nodes = [];
    rootNode;
    materials = [];
}

class Accessor
{
    bufferView;
    byteOffset;
    componentType;
    count;
    type;
    max = [];
    min = [];
}

class Buffer
{
    uri;
    byteLength;
}

class BufferView
{
    buffer;
    offset;
    length;
    target;
}

class Image
{
    uri;
}

class Material
{
    baseColorTexture;
    baseColorFactor;

    metallicRoughnessTexture;
    metallicFactor;
    roughnessFactor;

    emissiveTexture;
    emissiveFactor;

    normalTexture;

    occlussionTexture;
}

class Mesh
{
    elementCount;
    indices;
    positions;
    normals;
    tangents;
    texCoord;
    joints;
    weights;
    material;
}

class Node
{
    name;
    children = [];
    matrix = [];
}

class Scene
{
    nodes = [];
}

class Texture
{
    source;
    sampler;
}

const BufferType = {
    FLOAT: 5126,
    SHORT: 5123
}