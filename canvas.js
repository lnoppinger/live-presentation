config.canvas.currentColor = "eraser"
config.canvas.isDrawing    = false

document.addEventListener("render", e => {
if(document.querySelector("main:not([data-view=overview]) canvas") == null) return

let colorsBar = document.createElement("div")
colorsBar.id = "colors-bar"
document.querySelector("main").appendChild(colorsBar)

config.canvas.colors.forEach(colorCode => {
    let colorElem = document.createElement("span")
    colorElem.style.backgroundColor = colorCode
    colorElem.dataset.color = colorCode
    colorElem.classList.add("color")
    colorsBar.appendChild(colorElem)
})

let eraserElem = document.createElement("span")
eraserElem.classList.add("material-symbols-outlined", "eraser", "color")
eraserElem.innerText = "ink_eraser"
eraserElem.dataset.color = "eraser"
eraserElem.dataset.selected = true
eraserElem.style.backgroundColor = "#ffffff"
colorsBar.appendChild(eraserElem)

document.querySelectorAll("#colors-bar > .color").forEach( elem => elem.addEventListener("click", e => {
    elem.parentElement.querySelectorAll(".color").forEach(c => delete c.dataset.selected)
    config.canvas.currentColor = elem.dataset.color
    elem.dataset.selected = true
}))

document.querySelectorAll("main canvas").forEach(canvas => {
    let ctx = canvas.getContext("2d")
    
    let img = new Image()
    img.onload = function () {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    }
    img.src = canvas.innerHTML
    if(document.querySelector("main").style.zoom == 1) document.dispatchEvent(new Event("scroll"))

    canvas.addEventListener("pointerdown", e => {
        config.canvas.isDrawing = true
        ctx.beginPath()
        ctx.moveTo( e.offsetX, e.offsetY )
        ctx.lineWidth = config.canvas.lineWidth
        if(config.canvas.currentColor == "eraser") ctx.lineWidth += config.canvas.eraseWidthOffset
        ctx.strokeStyle = config.canvas.currentColor == "eraser" ? "#ffffff" : config.canvas.currentColor
        canvas.setPointerCapture(e.pointerId)
    })

    canvas.addEventListener("pointermove", e => {
        if (!config.canvas.isDrawing) return
        ctx.lineTo( e.offsetX, e.offsetY )
        ctx.stroke()
    })

    canvas.addEventListener("pointerup"   , e => {
        config.canvas.isDrawing = false
        canvas.releasePointerCapture(e.pointerId)
        document.querySelector(`#html [data-id='${canvas.dataset.id}']`).innerHTML = canvas.toDataURL()
        config.section.syncTabs(0)
    })
    canvas.addEventListener("pointerleave", e => {
        config.canvas.isDrawing = false
    })
})})

document.addEventListener("scroll", e => {
    let canvas = document.querySelector("main canvas[data-flex]")
    if(canvas == null) return

    let heightCalcMax = document.documentElement.clientHeight*2 - canvas.offsetTop + window.scrollY
    let heightCalcMin = document.documentElement.clientHeight*1.2 - canvas.offsetTop + window.scrollY
    if(canvas.width <= 300 || heightCalcMin > canvas.height ) {
        let ctx = canvas.getContext("2d")
        let oldHeight = canvas.height

        if(canvas.width <= 300) canvas.width = document.documentElement.clientWidth * 0.94
        canvas.height = heightCalcMax
        document.querySelector(`#html [data-id='${canvas.dataset.id}']`).width = canvas.width
        document.querySelector(`#html [data-id='${canvas.dataset.id}']`).height = canvas.height

        let img = new Image()
        img.onload = function () {
            ctx.clearRect(0, 0, canvas.width, oldHeight)
            ctx.drawImage(img, 0, 0, canvas.width, oldHeight)
            document.querySelector(`#html [data-id='${canvas.dataset.id}']`).innerHTML = canvas.toDataURL()
        }
        img.src = document.querySelector(`#html [data-id='${canvas.dataset.id}']`).innerHTML
    }
})