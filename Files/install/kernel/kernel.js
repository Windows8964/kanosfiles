document.body.innerHTML += `<div id="windows"></div>`
document.addEventListener('contextmenu', event => event.preventDefault());
let windowAmount = 0;
const config = JSON.parse(fs.readFile("kanos/config"));
const dragElement = function(elmnt, header) {
    var pos1 = 0,
        pos2 = 0,
        pos3 = 0,
        pos4 = 0;
    if (header) {
        /* if present, the header is where you move the DIV from:*/
        header.onmousedown = dragMouseDown;
        header.addEventListener('touchstart', dragTouchDown);
    } else {
        /* otherwise, move the DIV from anywhere inside the DIV:*/
        elmnt.onmousedown = dragMouseDown;
        elmnt.addEventListener('touchstart', dragTouchDown);
    }

    function dragMouseDown(e) {
        elmnt.topLayer();
        e = e || window.event;
        e.preventDefault();
        // get the mouse cursor position at startup:
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.ontouchend = closeDragElement;
        // call a function whenever the cursor moves:
        document.onmousemove = elementDrag;
        document.ontouchmove = elementTouchDrag;
    }

    function dragTouchDown(e) {
        elmnt.topLayer();
        e = e || window.event;
        // get the mouse cursor position at startup:
        pos3 = e.touches[0].clientX;
        pos4 = e.touches[0].clientY;
        document.onmouseup = closeDragElement;
        document.addEventListener('touchend', closeDragElement);
        // call a function whenever the cursor moves:
        document.onmousemove = elementDrag;
        document.addEventListener('touchmove', elementTouchDrag);
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        // calculate the new cursor position:
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        if (elmnt.dataset.maximized == "true") {
            /*elmnt.style.top = elmnt.dataset.previousY;
          elmnt.style.left = elmnt.dataset.previousX;*/
            elmnt.style.width = elmnt.dataset.previousWidth;
            elmnt.style.height = elmnt.dataset.previousHeight;
            elmnt.style.transform = elmnt.dataset.previousTransform;
            Object.assign(elmnt.dataset, {
                maximized: false,
            });
            elmnt.children[2].children[0].src = "assets/window/maximize.png"
            pos3 -= e.clientX - parseInt(elmnt.dataset.previousWidth.replaceAll("px", "")) / 2;
        }
        // set the element's new position:
        if (elmnt.dataset.beingResized == "false") {
            elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
            elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
        };
    }

    function elementTouchDrag(e) {
        e = e || window.event;
        // calculate the new cursor position:
        pos1 = pos3 - e.touches[0].clientX;
        pos2 = pos4 - e.touches[0].clientY;
        pos3 = e.touches[0].clientX;
        pos4 = e.touches[0].clientY;
        // set the element's new position:
        if (elmnt.dataset.beingResized == "false") {
            elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
            elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
        };
    }

    function closeDragElement() {
        if (parseInt(elmnt.style.top.replaceAll("px", "")) < 0 && elmnt.dataset.canMaximize == "true") {
            Object.assign(elmnt.dataset, {
                previousWidth: elmnt.style.width,
                previousHeight: elmnt.style.height,
                previousX: elmnt.style.left,
                previousY: 0,
                maximized: true,
                previousTransform: elmnt.style.transform
            });
            elmnt.style.left = window.innerWidth / 2 - parseInt(elmnt.style.width.replaceAll("px", "")) / 2;
            //elmnt.style.top = window.innerHeight / 2 - parseInt(elmnt.style.height.replaceAll("px", "")) / 2;
            //windowElement.style.width = window.innerWidth;
            setTimeout(function() {
                elmnt.style.transition = "all .2s cubic-bezier(0.165, 0.840, 0.440, 1.000)";
                setTimeout(function() {
                    elmnt.style.transition = "background-color .1s";
                }, 200);
                elmnt.style.transform = "none";
                elmnt.style.top = 0;
                elmnt.style.left = 0;
                elmnt.style.width = window.innerWidth;
                elmnt.style.height = window.innerHeight - 40;
                elmnt.children[2].children[0].src = "assets/window/unmaximize.png";
            }, 10)
        }
        /* stop moving when mouse button is released:*/
        document.onmouseup = null;
        document.removeEventListener('touchend', closeDragElement);
        document.onmousemove = null;
        document.removeEventListener('touchmove', elementTouchDrag);
    }
}
let allWindows;
let windowPos = 0;
window.kernel = {};
window.kernel.createNewWindow = function(options) {
    options.form = options.form || [];
    let end;
    windowAmount++;
    function exit() {
        windowAmount--;
        let pos;
        if (windowElement.style.transform != "") {
            pos = windowElement.style.transform.split("(")[1].substring(windowElement.style.transform.split("(")[1].length - 1, 0).replaceAll(" ", "").split(",");
        } else pos = ["0px", "0px"];
        windowElement.style.transform = "none";
        windowElement.style.left = parseInt(windowElement.style.left.replaceAll("px", "")) + parseInt(pos[0].replaceAll("px", ""));
        windowElement.style.top = parseInt(windowElement.style.top.replaceAll("px", "")) + parseInt(pos[1].replaceAll("px", ""));
        windowElement.style.animation = "windowFadeOut .2s cubic-bezier(0.600, 0.040, 0.980, 0.335)";
        windowElement.style.transition = "opacity .2s, transform .2s ";
        setTimeout(function() {
            windowElement.remove();
        }, 200);
    }
    let windowElement = document.createElement("div");
    windowElement.onclick = function() {
        windowElement.topLayer();
    }
    Object.assign(windowElement.dataset, {
        maximized: false,
    });
    if (config.window.transparencyEffects) windowElement.style = "backdrop-filter: blur(10px);";
    windowElement.style.position = "fixed";

    windowElement.classList.add("window");
    windowElement.style.width = options.width + config.window.borderWidth;
    windowElement.style.height = options.height + config.window.titlebar.height + config.window.borderWidth / 2;
    windowPos++;
    if (windowPos == 8) windowPos = 0;
    windowElement.style.left = windowPos * 100;
    windowElement.style.top = windowPos * 100;
    let titleElement = document.createElement("h1");
    titleElement.innerHTML = options.title;
    titleElement.style = `font-weight:400; margin-top: ${config.window.titlebar.height / 2 - 5};margin-left: 15;font-size:${config.window.titlebar.fsize}px;text-shadow: 0px 1px 1px #FFFFFF;`;
    windowElement.appendChild(titleElement);



    let close = document.createElement("div");
    close.style = `border-top-right-radius: 5px; transition: all .1s; width: ${config.window.titlebar.height * config.window.titlebar.buttonRatio}px; height: ${config.window.titlebar.height}; position:absolute;top:0;left:calc(100% - ${config.window.titlebar.height * config.window.titlebar.buttonRatio}px);`
    close.innerHTML = `<img src="assets/window/close.png" class="windowButtonIcon">`
    close.onmouseover = function(e) {
        close.children[0].style.filter = "invert(100%)";
        close.style.backgroundColor = "#ff4314";
    }
    close.onmouseout = function() {
        close.children[0].style.filter = "drop-shadow(0px 1px 0px #FFFFFF80)";
        close.style.backgroundColor = "transparent";
    }
    close.onclick = function() {
        exit();
        if (end) end();
    }
    windowElement.appendChild(close);

    if (options.canMaximize || options.canMinimize) {
        let maximize = document.createElement("div");
        maximize.style = `transition: all .1s; width: ${config.window.titlebar.height * config.window.titlebar.buttonRatio}px; height: ${config.window.titlebar.height}; position:absolute;top:0;left:calc(100% - ${(config.window.titlebar.height * config.window.titlebar.buttonRatio) * 2}px);`
        maximize.innerHTML = `<img src="assets/window/maximize.png" class="windowButtonIcon">`
        if (options.canMaximize) {
            maximize.onmouseover = function(e) {
                maximize.children[0].style.filter = "invert(100%)";
                maximize.style.backgroundColor = "#148aff";
            }
            maximize.onmouseout = function() {
                maximize.children[0].style.filter = "drop-shadow(0px 1px 0px #FFFFFF80)";
                maximize.style.backgroundColor = "transparent";
            }
            maximize.onclick = function() {
                if (windowElement.dataset.maximized == "true") {
                    windowElement.style.transition = "all .1s cubic-bezier(0.165, 0.840, 0.440, 1.000)";
                    setTimeout(function() {
                        windowElement.style.transition = "background-color .1s";
                    }, 100);
                    windowElement.style.top = windowElement.dataset.previousY;
                    windowElement.style.left = windowElement.dataset.previousX;
                    windowElement.style.width = windowElement.dataset.previousWidth;
                    windowElement.style.height = windowElement.dataset.previousHeight;
                    windowElement.style.transform = windowElement.dataset.previousTransform;
                    Object.assign(windowElement.dataset, {
                        maximized: false,
                    });
                    maximize.children[0].src = "assets/window/maximize.png"
                } else {
                    Object.assign(windowElement.dataset, {
                        previousWidth: windowElement.style.width,
                        previousHeight: windowElement.style.height,
                        previousX: windowElement.style.left,
                        previousY: windowElement.style.top,
                        maximized: true,
                        previousTransform: windowElement.style.transform
                    });
                    windowElement.style.left = window.innerWidth / 2 - parseInt(windowElement.style.width.replaceAll("px", "")) / 2;
                    windowElement.style.top = window.innerHeight / 2 - parseInt(windowElement.style.height.replaceAll("px", "")) / 2;
                    //windowElement.style.width = window.innerWidth;
                    setTimeout(function() {
                        windowElement.style.transition = "all .2s cubic-bezier(0.165, 0.840, 0.440, 1.000)";
                        setTimeout(function() {
                            windowElement.style.transition = "background-color .1s";
                        }, 200);
                        windowElement.style.transform = "none";
                        windowElement.style.top = 0;
                        windowElement.style.left = 0;
                        windowElement.style.width = window.innerWidth;
                        windowElement.style.height = window.innerHeight - 40;
                        maximize.children[0].src = "assets/window/unmaximize.png"
                    }, 10)
                };
            }
        } else {
            maximize.children[0].style.filter = "invert(50%)";
        }
        windowElement.appendChild(maximize);

        let minimize = document.createElement("div");
        minimize.style = `transition: all .1s; width: ${config.window.titlebar.height * config.window.titlebar.buttonRatio}px; height: ${config.window.titlebar.height}; position:absolute;top:0;left:calc(100% - ${(config.window.titlebar.height * config.window.titlebar.buttonRatio) * 3}px);`
        minimize.innerHTML = `<img src="assets/window/minimize.png" class="windowButtonIcon">`
        if (options.canMinimize) {
            minimize.onmouseover = function(e) {
                minimize.children[0].style.filter = "invert(100%)";
                minimize.style.backgroundColor = "#148aff";
            }
            minimize.onmouseout = function() {
                minimize.children[0].style.filter = "drop-shadow(0px 1px 0px #FFFFFF80)";
                minimize.style.backgroundColor = "transparent";
            }
            minimize.onclick = function() {
                windowElement.topLayer();
                setTimeout(function(){
                let minimizeHitbox = document.createElement("div");
                Object.assign(windowElement.dataset, {
                    previousWidth: windowElement.style.width,
                    previousHeight: windowElement.style.height,
                    previousX: windowElement.style.left,
                    previousY: windowElement.style.top,
                    previousTransform: windowElement.style.transform
                });
                minimizeHitbox.classList.add("minimized");
                windowElement.style.pointerEvents = "none";
                windowElement.style.transition = "all .1s linear";
                minimizeHitbox.style.position = "fixed";
                windowElement.style.top = minimizeHitbox.style.top = `calc(100% - ${(config.taskbar.height + 24 + config.taskbar.border / 2) - 20}px)`;
                minimizeHitbox.order = document.getElementsByClassName("minimized").length;
                windowElement.style.left = minimizeHitbox.style.left = (config.taskbar.border / 2 + 10 + (32 * (minimizeHitbox.order))) + "px";
                windowElement.style.zIndex = minimizeHitbox.style.zIndex = "11";
                minimizeHitbox.orderDecrease = function(a) {
                    if (a < minimizeHitbox.order) minimizeHitbox.order--;
                    windowElement.style.left = minimizeHitbox.style.left = (config.taskbar.border / 2 + 10 + (32 * (minimizeHitbox.order))) + "px";
                }
                windowElement.style.width = 500;
                windowElement.style.height = 500;
                minimizeHitbox.style.width = 24;
                minimizeHitbox.style.height = 24;
                //minimizeHitbox.style.backgroundColor = "red";
                minimizeHitbox.onmouseover = function() {
                    windowElement.style.transition = "all .1s ease-out";
                    windowElement.style.transform = `translate(${-(24 *1.1) / 24}px, ${(-(24 *1.1) / 24) - 5}px) scale(${(24 / 500)*1.1})`;
                }
                minimizeHitbox.onmouseout = function() {
                    windowElement.style.transition = "all .1s ease-in";
                    windowElement.style.transform = `scale(${24 / 500})`;
                }
                windowElement.style.transform = `scale(${24 / 500})`;
                windowElement.style.transformOrigin = "left top";
                setTimeout(function() {
                    taskbar.appendChild(windowElement);
                    taskbar.appendChild(minimizeHitbox);
                }, 100)
                minimizeHitbox.onclick = function() {
                    windowElement.style.transition = "all .1s ease-out";
                    setTimeout(function(){
                    windowElement.style.pointerEvents = "initial";
                    let minimizedElements = document.getElementsByClassName("minimized");
                    for (let i = 0; i <minimizedElements.length; i++) {
                        minimizedElements[i].orderDecrease(minimizeHitbox.order);
                    }
                    windowElement.style.zIndex = "initial";
                    windowElement.style.top = windowElement.dataset.previousY;
                    windowElement.style.left = windowElement.dataset.previousX;
                    windowElement.style.width = windowElement.dataset.previousWidth;
                    windowElement.style.height = windowElement.dataset.previousHeight;
                    windowElement.style.transform = windowElement.dataset.previousTransform;
                    Object.assign(windowElement.dataset, {
                        minimized: false,
                    });
                    minimizeHitbox.remove();
                    setTimeout(function() {
                        windowElement.style.transition = "none";
                        windows.appendChild(windowElement);
                        windowElement.topLayer();
                    }, 200);
                    }, 100)
                }
            }, 100);
            }
        } else {
            minimize.children[0].style.filter = "invert(50%)";
        }
        windowElement.appendChild(minimize);
    }
    let content = document.createElement("div");
    content.style = `background-color: ${options.color}; width:calc(100% - ${config.window.borderWidth}px);height:calc(100% - ${config.window.titlebar.height + config.window.borderWidth / 2}px);position:absolute;top:${config.window.titlebar.height}px;left:${config.window.borderWidth / 2}px;border-bottom-left-radius: 4px;border-bottom-right-radius: 4px;`;
    let forms = {};
    for (let i = 0; i < options.form.length; i++) {
        let element = options.form[i];
        let formElement = document.createElement("h1");
        switch (element.type) {
            case "label": {
                content.appendChild((function() {
                    formElement = document.createElement("h1");
                    formElement.innerHTML = element.value;
                    formElement.style = `font-size: ${element.fontSize}px;`;
                    if (element.x != undefined || element.y != undefined) {
                        formElement.style.position = "absolute";
                        formElement.style.left = element.x;
                        formElement.style.top = element.y;
                    }
                    if (element.margin.constructor.name == 'Array') {
                        formElement.style.marginLeft = (element.margin[0] / 2) + "px";
                        formElement.style.marginRight = (element.margin[0] / 2) + "px";
                        formElement.style.marginTop = (element.margin[1] / 2) + "px";
                        formElement.style.marginBottom = (element.margin[1] / 2) + "px";
                    }
                    forms[element.id] = formElement;
                    return formElement;
                })());
            }
            break;
        case "button": {
            content.appendChild((function() {
                formElement = document.createElement("button")
                formElement.innerHTML = element.value;
                formElement.style = `font-size: ${element.fontSize}px;`;
                formElement.style.width = element.width;
                formElement.style.height = element.height;
                if (element.x != undefined || element.y != undefined) {
                    formElement.style.position = "absolute";
                    formElement.style.left = element.x;
                    formElement.style.top = element.y;
                }
                let align = element.align.split("-");
                if (align[0] == "bottom") {
                    formElement.style.position = "absolute";
                    if (element.margin.constructor.name == 'Array') {
                        formElement.style.top = "calc(100% - " + (element.height + element.margin[1]) + "px)";
                    } else formElement.style.top = "calc(100% - " + 0 + "px)";
                };
                if (align[1] == "left") {
                    formElement.style.position = "absolute";
                    if (element.margin.constructor.name == 'Array') {
                        formElement.style.left = (element.margin[1]) + "px";
                    } else formElement.style.left = "0px";
                };
                if (align[0] == "top") {
                    formElement.style.position = "absolute";
                    if (element.margin.constructor.name == 'Array') {
                        formElement.style.top = (element.margin[1]) + "px";
                    } else formElement.style.top = "0px";
                };
                if (align[1] == "right") {
                    formElement.style.position = "absolute";
                    if (element.margin.constructor.name == 'Array') {
                        formElement.style.left = "calc(100% - " + (element.width + element.margin[0]) + "px)";
                    } else formElement.style.left = "calc(100% - " + element.width + "px)";
                };
                /*if (element.margin.constructor.name == 'Array') {
                  h1.style.marginLeft = (element.margin[0] / 2) + "px";
                  h1.style.marginRight = (element.margin[0] / 2) + "px";
                  h1.style.marginTop = (element.margin[1] / 2) + "px";
                  h1.style.marginBottom = (element.margin[1] / 2) + "px";
                }*/
                forms[element.id] = formElement;
                return formElement;
            })());
        }
        break;
        }
    }
    let titlebarhitbox = document.createElement("div");
    titlebarhitbox.style.width = `calc(100% - ${(config.window.titlebar.height * config.window.titlebar.buttonRatio) * ((options.canMaximize || options.canMinimize) ? 3 : 1)}px)`;
    titlebarhitbox.style.height = config.window.titlebar.height + "px";
    titlebarhitbox.style.position = "absolute";
    titlebarhitbox.style.top = "4px";
    titlebarhitbox.style.left = "4px";
    windowElement.appendChild(titlebarhitbox);
    if (options.resizeable) {
        interact(windowElement)
            .resizable({
                edges: {
                    top: true,
                    left: true,
                    bottom: true,
                    right: true
                },
                listeners: {
                    start: function() {
                        Object.assign(windowElement.dataset, {
                            beingResized: true,
                        });
                    },
                    end: function() {
                        Object.assign(windowElement.dataset, {
                            beingResized: false,
                        });
                    },
                    move: function(event) {
                        if (windowElement.dataset.maximized == "true") return;
                        windowElement.topLayer();
                        let {
                            x,
                            y
                        } = event.target.dataset

                        x = (parseFloat(x) || 0) + event.deltaRect.left
                        y = (parseFloat(y) || 0) + event.deltaRect.top

                        Object.assign(event.target.style, {
                            width: `${event.rect.width}px`,
                            height: `${event.rect.height}px`,
                            "-webkit-transform": `translate(${x}px, ${y}px)`
                        })

                        Object.assign(event.target.dataset, {
                            x,
                            y
                        })
                    }
                },
                modifiers: [

                    // minimum size
                    interact.modifiers.restrictSize({
                        min: {
                            width: 200,
                            height: 100
                        }
                    })
                ],
                margin: 4,
            })
    };
    titlebarhitbox.style.touchAction = "none";
    windowElement.style.touchAction = "none";
    dragElement(windowElement, titlebarhitbox);
    Object.assign(windowElement.dataset, {
        beingResized: false,
        canMaximize: options.canMaximize,
        canMinimize: options.canMinimize,
    });
    windowElement.appendChild(content);
    windowElement.style.animation = "windowFadeIn 0.2s cubic-bezier(0.215, 0.61, 0.355, 1)";
    Object.assign(windowElement.dataset, {
        topLayer: false,
    });
    allWindows = document.getElementsByClassName("window");
    windowElement.topLayer = function() {
        if (windowElement.dataset.topLayer == "true") return;
        for (let i = 0; i < allWindows.length; i++) {
            allWindows[i].children[0].classList.add("windowUnselected");
            allWindows[i].children[0].classList.remove("windowSelected");
            allWindows[i].style.backgroundColor = "#ffecb8" + (config.window.transparencyEffects ? "80" : "");
            if (allWindows[i].dataset.topLayer == "true") {
                allWindows[i].style.zIndex = parseInt(allWindows[i].style.zIndex) - 1;
            };
            Object.assign(allWindows[i].dataset, {
                topLayer: false,
            });
        };
        Object.assign(windowElement.dataset, {
            topLayer: true,
        });
        windowElement.style.backgroundColor = config.window.themeColor + (config.window.transparencyEffects ? "cd" : "");
        titleElement.classList.add("windowSelected");
        //windows.appendChild(windowElement);
        windowElement.style.zIndex = document.getElementsByClassName("window").length + 1;
    };
    windowElement.topLayer();
    windowElement.changeTitle = function(a) {
        titleElement.innerText = a;
    };
    if (options.script) {
        end = options.script(windowElement, content, exit, forms);
    };
    windows.appendChild(windowElement);
};
window.kernel.run = function(a) {
    eval(fs.readFile(a));
}
/*createNewWindow({
    title: "Kanos",
    resizeable: false,
    canMinimize: true,
    width: 400,
    height: 150,
    color: "#ffffff",
    form: [{
        type: "label",
        value: "Welcome to kanos!",
        margin: [20, 20],
        fontSize: 20,
        id: "welcomeKanono"
    }, {
        type: "label",
        value: "kanos is a kanono styled \"operating system\".",
        margin: [20, 20],
        fontSize: 10,
        id: "desc"
    }, {
        type: "button",
        value: "OK",
        align: "bottom-right",
        margin: [20, 20],
        height: 20,
        width: 70,
        fontSize: 12,
        id: "buttonOK"
    }],
    script: function(windowElement, title, content, exit, forms) {
        forms.buttonOK.onclick = function() {
            exit();
        }
    }
})
createNewWindow({
    title: "kanonononononononononono",
    resizeable: true,
    canMaximize: true,
    canMinimize: true,
    width: 400,
    height: 150,
    color: "#ffffff",
    form: [],
    script: function(windowElement, title, content, exit, forms) {
        content.innerHTML = `<webview src="https://kanono-release-preview.herokuapp.com" style="border:none;top:0;left:0;position:absolute;width:100%;height:100%;">`
    }
})*/
/*
createNewWindow({
    title: "Oh no",
    resizeable: false,
    width: 400,
    height: 150,
    color: "#ffffff",
    form: [{
        type: "label",
        value: "Theres a virus that is creating windows rapidly",
        margin: [20, 20],
        fontSize: 12,
        id: "welcomeKanono"
    }, {
        type: "button",
        value: "STOP IT!",
        align: "bottom-right",
        margin: [20, 20],
        height: 20,
        width: 70,
        fontSize: 12,
        id: "buttonS"
    }, {
        type: "button",
        value: "Start it",
        align: "bottom-left",
        margin: [20, 20],
        height: 20,
        width: 70,
        fontSize: 12,
        id: "buttonS2"
    }],
    script: function(windowElement, title, content, exit, forms) {
        let interval;
        forms.buttonS2.onclick = function() {
            interval = setInterval(function() {
                createNewWindow({
                    title: "Oh no",
                    resizeable: false,
                    width: 300,
                    height: 100,
                    color: "#ffffff",
                    form: [{
                        type: "label",
                        value: "boom",
                        margin: [20, 20],
                        fontSize: 12,
                        id: "welcomeKanono"
                    }]
                })
            }, 1000)
        };
        forms.buttonS.onclick = function() {
            clearInterval(interval);
        }

        function end() {
            clearInterval(interval);
        }
        return end;
    }
})
/*createNewWindow({width:350,height:250, color: "#ffffff", title: "Calculator", form: [],
  script: function(windowElement, title, content, exit) {
    let input = document.createElement("input");
    input.style.width = "calc(100% - 30px)";
    content.appendChild(input);
    let numbers = ["alert", "(", ")"]
    for (let i = 0; i < numbers.length; i++) {
      let button = document.createElement("button");
      content.appendChild(button);
      button.innerHTML = numbers[i];
      button.onclick = function(){input.value = input.value + button.innerHTML}
    }
    let button = document.createElement("button");
    content.appendChild(button);
    button.innerHTML = "OK";
    button.onclick = function(){input.value = eval(input.value)}
    let button2 = document.createElement("button");
    content.appendChild(button2);
    button2.innerHTML = "reset";
    button2.onclick = function(){input.value = ""}
    function end() {
    };
    return end;
}});
createNewWindow({canMinimize: true,
    canMaximize: true,title:"resizeable window", resizeable:true, form:[], width: 500, height: 500})*/
    /*createNewWindow({
        title: "Kanos Playground",
        color: "#ffffff",
        canMinimize: true,
        resizeable: true,
        form: [],
        width: 400,
        height: 400,
        script: function(a, b, c, d, forms) {
            c.innerHTML = `<h1 style="font-size: 40px; margin: 10px 20px;">KANOS TEXTBOX</h1>
      <h3 style="font-size: 10px; margin: 10px 20px;">Kanos is a web windows-like operating system!</h1>
<h3 style="font-size: 10px; margin: 10px 20px;">Title</h1><input style="font-size: 15px; margin: 10px 20px;" placeholder="Title">
<h3 style="font-size: 10px; margin: 10px 20px;">Text</h1><input style="font-size: 15px; margin: 10px 20px;" placeholder="Text">
<h3 style="font-size: 10px; margin: 10px 20px;">Desc</h1><input style="font-size: 15px; margin: 10px 20px;" placeholder="Description">
<h3 style="font-size: 10px; margin: 10px 20px;">Button Text</h1><input style="font-size: 15px; margin: 10px 20px;" placeholder="Button Text">
<button style="font-size: 12px; width: 70px; height: 20px; position: absolute; top: calc(100% - 40px); left: calc(100% - 90px);">Spawn</button>`
            c.children[10].onclick = function() {
                createNewWindow({
                    title: c.children[3].value,
                    color: "#ffffff",
                    resizeable: false,
                    form: [{
                        type: "label",
                        value: c.children[5].value,
                        margin: [20, 20],
                        fontSize: 20,
                        id: ""
                    }, {
                        type: "label",
                        value: c.children[7].value,
                        margin: [20, 20],
                        fontSize: 10,
                        id: ""
                    }, {
                        type: "button",
                        value: c.children[9].value,
                        align: "bottom-right",
                        margin: [20, 20],
                        height: 20,
                        width: 70,
                        fontSize: 12,
                        id: "button"
                    }],
                    width: 400,
                    height: 200
                });
            }
        }
    })*/