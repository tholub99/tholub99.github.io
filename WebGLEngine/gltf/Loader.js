class Loader
{
    LoadBinaryFromFile(path)
    {
        var baseDir = GetBaseDir(path);
        var data = loadFileAJAX(path);
        return data;

    }

    LoadBinaryFromMemory(bytes)
    {
        var size = bytes.size();
    }

    GetBaseDir(path)
    {
        if(path.lastIndexOf("/\\") != -1)
            return path.substring(0, path.lastIndexOf("/\\"));
    }
}