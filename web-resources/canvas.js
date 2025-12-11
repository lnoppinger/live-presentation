window.isDrawing = false
shared.main.addEventListener("resize", e => {
    shared.main.dispatchEvent(new Event("scroll"))
})

window.drawCanvas = (canvas, oldHeight=canvas.height) => {
    let ctx = canvas.getContext("2d")
    let img = new Image()
    img.onload = function () {
        ctx.clearRect(0, 0, canvas.width, oldHeight)
        ctx.drawImage(img, 0, 0, canvas.width, oldHeight)
        document.querySelector(`#html [data-id='${canvas.dataset.id}']`).innerHTML = canvas.toDataURL()
    }
    img.src = document.querySelector(`#html [data-id='${canvas.dataset.id}']`).innerHTML
}

shared.main.addEventListener("scroll", e => {
    let canvas = document.querySelector("main canvas[data-flex]")
    if(canvas == null) return

    let heightCalcMax = shared.main.clientHeight*2   - canvas.offsetTop + shared.main.scrollTop
    let heightCalcMin = shared.main.clientHeight*1.2 - canvas.offsetTop + shared.main.scrollTop
    if(canvas.width <= 300 || heightCalcMin > canvas.height ) {
        let oldHeight = canvas.height

        if(canvas.width <= 300) {
            canvas.width = Math.floor(shared.main.clientWidth * 0.94 - 5)
            document.querySelector(`#html [data-id='${canvas.dataset.id}']`).width = canvas.width
        }
        canvas.height = heightCalcMax
        document.querySelector(`#html [data-id='${canvas.dataset.id}']`).height = canvas.height

        drawCanvas(canvas, oldHeight)
        shared.syncTabs(0)
        shared.main.dispatchEvent(new Event("resize"))
    }
})

shared.main.addEventListener("render", e => {
if(document.querySelector("main:not([data-view=overview]) canvas") == null) return

let colorsBar = document.createElement("div")
colorsBar.id = "colors-bar"
shared.main.appendChild(colorsBar)

config.colors.forEach(colorCode => {
    let colorElem = document.createElement("span")
    colorElem.style.backgroundColor = colorCode
    colorElem.dataset.color = colorCode
    colorElem.classList.add("color")
    colorsBar.appendChild(colorElem)
})

let black = document.createElement("span")
black.classList.add("material-symbols-outlined", "color")
black.style.backgroundColor = "var(--black)"
colorsBar.appendChild(black)

let eraserElem = document.createElement("span")
eraserElem.classList.add("material-symbols-outlined", "eraser", "color")
eraserElem.innerText = "ink_eraser"
eraserElem.dataset.selected = true
eraserElem.style.backgroundColor = "var(--white)"
colorsBar.appendChild(eraserElem)

document.querySelectorAll("#colors-bar > .color").forEach( elem => elem.addEventListener("click", e => {
    elem.parentElement.querySelectorAll(".color").forEach(c => delete c.dataset.selected)
    elem.dataset.selected = true
}))

document.querySelectorAll("main canvas").forEach(canvas => {
    let ctx = canvas.getContext("2d")

    canvas.addEventListener("pointerdown", e => {
        isDrawing = true
        ctx.beginPath()

        let lineWidth = shared.lineWidth
        if(document.querySelector("main .color[data-selected]").classList.contains("eraser")) {
            lineWidth += config.eraseWidthOffset
        }
        ctx.lineWidth = lineWidth
        ctx.strokeStyle = getComputedStyle(document.querySelector("main .color[data-selected]")).getPropertyValue("background-color")
        let zoom = getComputedStyle(shared.main).getPropertyValue("zoom")
        ctx.moveTo( e.offsetX/zoom, e.offsetY/zoom )
        canvas.setPointerCapture(e.pointerId)
    })

    canvas.addEventListener("pointermove", e => {
        if (!isDrawing) return
        let zoom = getComputedStyle(shared.main).getPropertyValue("zoom")
        ctx.lineTo( e.offsetX/zoom, e.offsetY/zoom )
        ctx.stroke()
    })

    canvas.addEventListener("pointerup"   , e => {
        isDrawing = false
        canvas.releasePointerCapture(e.pointerId)
        document.querySelector(`#html [data-id='${canvas.dataset.id}']`).innerHTML = canvas.toDataURL()
        shared.syncTabs(0)
    })
    canvas.addEventListener("pointerleave", e => {
        isDrawing = false
        canvas.releasePointerCapture(e.pointerId)
    })
    
    drawCanvas(canvas)
    document.dispatchEvent(new Event("scroll"))
})

})