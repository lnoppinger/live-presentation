if(document.querySelector("#colors-bar") == null) {
    let colorsBar = document.createElement("div")
    colorsBar.id = "colors-bar"
    document.body.appendChild(colorsBar)

    config.colors.forEach(colorCode => {
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
}

document.querySelectorAll("canvas").forEach(canvas => {
    if(canvas.nextElementSibling?.tagName == "IMG") return restoreCanvas(canvas)
    let img = document.createElement("img")
    img.classList.add("canvas")
    canvas.after(img)
})

let currentColor = "eraser"
let isDrawing    = false
document.querySelectorAll("#colors-bar > .color").forEach( elem => elem.addEventListener("click", e => {
    elem.parentElement.querySelectorAll(".color").forEach(c => delete c.dataset.selected)
    currentColor = elem.dataset.color
    elem.dataset.selected = true
}))

document.addEventListener("renderend", e => {
    if(document.querySelector("section[data-shown] canvas") == null) {
        delete document.querySelector("#colors-bar").dataset.shown
        return
    }

    document.querySelector("#colors-bar").dataset.shown = true

    document.dispatchEvent(new Event("scroll"))
})

document.addEventListener("scroll", e => {
    let canvas = document.querySelector("section[data-shown] canvas[data-flex]")
    if(canvas == null) return

    let heightCalc = document.documentElement.clientHeight*1.5 - canvas.offsetTop + window.scrollY
    if(canvas.width == 0 || heightCalc > canvas.height) {
        let oldHeight = canvas.height
        saveCanvas(canvas)
        canvas.width  = document.documentElement.clientWidth * 0.96
        canvas.height = heightCalc
        restoreCanvas(canvas, oldHeight)
    }
})

document.querySelectorAll("canvas").forEach(canvas => {
    let ctx = canvas.getContext("2d")

    canvas.addEventListener("pointerdown", e => {
        isDrawing = true
        ctx.beginPath()
        ctx.moveTo( e.offsetX, e.offsetY )
        ctx.lineWidth = currentColor == "eraser" ? config.eraseWidth : config.lineWidth
        ctx.strokeStyle = currentColor == "eraser" ? "#ffffff" : currentColor
        canvas.setPointerCapture(e.pointerId)
    })

    canvas.addEventListener("pointermove", e => {
        if (!isDrawing) return
        ctx.lineTo( e.offsetX, e.offsetY )
        ctx.stroke()
    })

    canvas.addEventListener("pointerup"   , e => {
        isDrawing = false
        canvas.releasePointerCapture(e.pointerId)
        saveCanvas(canvas)
    })
    canvas.addEventListener("pointerleave", e => {
        canvas.dispatchEvent(new PointerEvent("pointerup", {
            pointerId: e.pointerId
        }))
    })
})

function restoreCanvas(canvas, height=-1) {
    if(height < 0) height = canvas.height
    ctx = canvas.getContext("2d")
    let img = new Image()
    img.onload = function () {
        ctx.clearRect(0, 0, canvas.width, height)
        ctx.drawImage(img, 0, 0, canvas.width, height)
    }
    img.src = canvas.nextElementSibling.src
}
function saveCanvas(canvas) {
    canvas.nextElementSibling.src = canvas.toDataURL()
}