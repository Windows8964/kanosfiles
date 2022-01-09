import interact from 'https://cdn.interactjs.io/v1.10.11/interactjs/index.js';
let log = document.createElement("div");
log.style = "width:100%;height:100%;position:fixed;top:0;left:0;color:white;font-family:Overpass Mono";
function addLog(a, color = "white", size = 15) {
    log.innerHTML += `<p style="color:${color};margin-left:10px;margin-bottom:0;margin-top:0;font-size:${size}px">${a}</p>` + "<br>";
}
addLog("Loading Kanos")
function startSys() {
    log.style.display = "none";
    eval(fs.readFile("kanos/system/kernel"));
    kernel.run("kanos/system/explorer");
}
if (fs.readFile("kanos/reinstallLock") != undefined) {
    addLog("Detected Kanos is not installed", "red", 20)
    setTimeout(function(){
        fs.createFolder("kanos");
        fs.createFolder("kanos/system");
        fs.createFolder("kanos/apps");
        let files = [
        ["install/kernel/kernel.js", "kanos/system/kernel",], 
        ["install/fileExplorer/fileExplorer.js", "kanos/apps/fileExplorer",], 
        ["install/explorer/explorer.js", "kanos/system/explorer"], 
        ["install/reinstallLock", "kanos/reinstallLock"],
        ["install/config.json", "kanos/config"]];
        /*for (let i = 0; i < 3; i++) { 
            files.push(["install/icons/" + i + ".svg", "kanos/assets/icons/" + i])
        }*/
        for (let i = 0; i < files.length; i++) {
            setTimeout(function(){
                addLog("installing " + files[i][0] + " to " + files[i][1], "green")
                fetch("./" + files[i][0]).then(response => response.text()).then(data => {
                    fs.writeFile(files[i][1], data);
                    addLog("installed " + files[i][1], "green");
                    if (i == files.length - 1) {
                        addLog("Starting kanos...", "green", 30);
                        startSys();
                    }
                });
            }, 100 * i);
        }
    }, 500)
} else {
    startSys();
}
document.body.appendChild(log);