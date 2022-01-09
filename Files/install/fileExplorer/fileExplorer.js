kernel.createNewWindow({
    width: 500,
    height: 400,
    title: "File Explorer",
    canMinimize: true,
    canMaximize: true,
    color: "white",
    script: function(element, content, exit) {
        let path = "";
        function refresh(files = fs.readFolder(path, true)) {
            content.innerHTML = "";
            for (let i = 0; i < files.length; i++) {
                let element = document.createElement("div");
                element.style.animation = "rightToLeft .5s cubic-bezier(0.215, 0.61, 0.355, 1)"
                element.style.width = 100;
                element.style.height = 100;
                element.style.borderRadius = "5px";
                element.style.background = "linear-gradient(#e8e8e8, #ffffff)";
                element.style.margin = 10;
                element.style.float = "left";
                //element.innerHTML = fs.readFolder(path)[i];
                let icon = document.createElement("img");
                icon.src = "./icons/0.svg";
                icon.style = "width:48px;height:48px;position:relative;top:10px;left:calc(50% - 24px);"
                if (files[i].endsWith("/")) {
                    icon.src = "./icons/1.svg";
                };
                if (files[i].endsWith("/") && fs.readFolder(files[i]).length != 0) {
                    icon.src = "./icons/2.svg";
                };
                element.onclick = function() {
                    if (files[i].endsWith("/")) {
                        path = files[i];
                        refresh();
                    }
                }
                element.appendChild(icon);
                let name = fs.readFolder(path)[i];
                if (fs.readFolder(path)[i].endsWith("/")) name = name.slice(0, -1);
                element.innerHTML += `<h1 style="text-align:center; font-size: 15px;">${name}</h1>`
                content.appendChild(element);
            }
        }
        refresh();
    }
})