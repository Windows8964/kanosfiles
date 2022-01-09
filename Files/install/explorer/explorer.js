const config = JSON.parse(fs.readFile("kanos/config"));
let mixColors = function(colorA, colorB, amount) {
  const [rA, gA, bA] = colorA.match(/\w\w/g).map((c) => parseInt(c, 16));
  const [rB, gB, bB] = colorB.match(/\w\w/g).map((c) => parseInt(c, 16));
  const r = Math.round(rA + (rB - rA) * amount).toString(16).padStart(2, '0');
  const g = Math.round(gA + (gB - gA) * amount).toString(16).padStart(2, '0');
  const b = Math.round(bA + (bB - bA) * amount).toString(16).padStart(2, '0');
  return '#' + r + g + b;
};
setTimeout(function(){
  document.body.style.backgroundImage = `url("./Wallpaper.png")`;
}, 500)
kernel.run("kanos/apps/fileExplorer");
document.body.appendChild((function(taskbar = document.createElement("div")) {
    taskbar.id = "taskbar";
    taskbar.style = `z-index:10;width:calc(100% - ${config.taskbar.border}px);height:${config.taskbar.height}px;position:fixed;background-color:${mixColors("#ffffff", "#000000", 0.9) + (config.window.transparencyEffects ? "80" : "")};backdrop-filter: ${config.window.transparencyEffects ? "blur(10px)" : "none"};top: calc(100% - ${config.taskbar.height + config.taskbar.border / 2}px);left:${config.taskbar.border / 2}px;border-radius:${config.taskbar.height / 6}px;`;
    taskbar.innerHTML = `
  <h1 style="margin-top: calc(${config.taskbar.height / 2}px - 7.5px);font-weight:400;color:white;font-size:12px;text-align:right;margin-right:10px;">5:42 PM</h1>
  `
    return taskbar;
})());