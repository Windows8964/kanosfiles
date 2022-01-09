window.fs = {};
let partition = "fs/";
fs.writeFile = function(path, content) {
    if (typeof content != "string") return;
    if (path.startsWith("/")) return "cantstartwithslash";
    let fileName = path.slice(path.length - path.split("/")[path.split("/").length - 1].length);
    if (fs.readFolder(path.slice(0, -fileName.length)) == undefined) {
        return undefined;
    };
    localStorage.setItem(partition + path, content);
    return true;
}
fs.readFile = function(path) {
    if (localStorage.getItem(partition + path) == undefined) return undefined;
    if (path.endsWith("/")) return "mustbefile";
    return localStorage.getItem(partition + path);
}
fs.createFolder = function(path) {
    if (!path.endsWith("/")) path += "/";
    if (path.startsWith("/")) return "cantstartwithslash";
    localStorage.setItem(partition + path, "[]");
}
fs.readFolder = function(path, givePath = false) {
    if (!path.endsWith("/")) path += "/";
    if (path == "/") {
        let files = [];
        for (let key in localStorage) {
            if (key.startsWith(partition)) {
                let a = key.split("/").length + !key.endsWith("/");
                if (a <= 3) files.push(key.slice(partition.length));
            };
        }
        return files;
    }
    let files = [];
    let folderExists = false;
    for (let key in localStorage) {
        let a = key.split("/").length + !key.endsWith("/");
        if (key.startsWith(partition + path) && key != partition + path && a <= (path.split("/").length + 2)) {
            folderExists = true;
            if (givePath) {
                files.push(key.slice(partition.length));
            } else {
                files.push(key.slice((partition + path).length));
            }
        }
        if (partition + path in localStorage) folderExists = true;
    }
    if (!folderExists) return undefined;
    return files;
}