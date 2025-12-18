window.isDrawing = false
window.preventScrollEndC = false
shared.main.addEventListener("resize", e => {
    shared.main.dispatchEvent(new Event("scrollend"))
})

window.drawCanvas = (canvas, oldWidth=-1, oldHeight=-1) => {
    if(oldWidth  < 0) oldWidth  = canvas.width
    if(oldHeight < 0) oldHeight = canvas.height

    let ctx = canvas.getContext("2d")
    let img = new Image()
    img.onload = function () {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(img, 0, 0, oldWidth, oldHeight)
        document.querySelector(`#html-body [data-id='${canvas.dataset.id}']`).innerHTML = canvas.toDataURL()
    }
    img.src = document.querySelector(`#html-body [data-id='${canvas.dataset.id}']`).innerHTML
}

shared.main.addEventListener("scrollend", e => {
    let canvas = document.querySelector("main:not([data-view=p]) canvas[data-flex]")
    if(canvas == null) return

    let oldWidth = canvas.width
    let calcWidth = Math.floor(Number(getComputedStyle(canvas).getPropertyValue("width").replace("px", "")))
    if(oldWidth < calcWidth) {
        canvas.width = calcWidth
        document.querySelector(`#html-body [data-id='${canvas.dataset.id}']`).width = calcWidth
    }

    let oldHeight = canvas.height
    let calcHeight = shared.main.scrollTop + 0.96*shared.main.clientHeight - canvas.offsetTop
    if(oldHeight < calcHeight) {
        canvas.height = calcHeight
        document.querySelector(`#html-body [data-id='${canvas.dataset.id}']`).height = calcHeight
    }

    if(oldHeight < calcHeight || oldWidth < calcWidth) {
        drawCanvas(canvas, oldWidth, oldHeight)
        canvas.innerHTML = canvas.toDataURL()
    }
})

shared.main.addEventListener("render", e => {
if(document.querySelector("main canvas") == null) return

let colorsBar = document.createElement("div")
colorsBar.id = "colors-bar"
colorsBar.classList.add("no-print")
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
        ctx.lineCap = "round"
        ctx.lineJoin = "round"
        
        ctx.lineWidth = shared.lineWidth
        ctx.globalCompositeOperation = "source-over"
        if(document.querySelector("main .color[data-selected]").classList.contains("eraser")) {
            ctx.lineWidth = shared.lineWidth + config.eraseWidthOffset
            ctx.globalCompositeOperation = "destination-out"
        }

        ctx.strokeStyle = getComputedStyle(document.querySelector("main .color[data-selected]")).getPropertyValue("background-color")
        let rect = canvas.getBoundingClientRect()
        let zoom = Number(getComputedStyle(shared.main).getPropertyValue("zoom"))
        ctx.moveTo( (e.clientX - rect.left)/zoom, (e.clientY - rect.top)/zoom )
        ctx.lineTo( (e.clientX - rect.left)/zoom, (e.clientY - rect.top)/zoom )
        ctx.stroke()

        setTimeout(() => {
            if(preventCanvasUpdate) return
            preventCanvasUpdate = true
            canvas.innerHTML = canvas.toDataURL()
            setTimeout(() => preventCanvasUpdate = false, 20)
        })
    })

    let preventCanvasUpdate = false
    canvas.addEventListener("pointermove", e => {
        if (!isDrawing) return
        let rect = canvas.getBoundingClientRect()
        let zoom = Number(getComputedStyle(shared.main).getPropertyValue("zoom"))
        ctx.lineTo( (e.clientX - rect.left)/zoom, (e.clientY - rect.top)/zoom )
        ctx.stroke()

        setTimeout(() => {
            if(preventCanvasUpdate) return
            preventCanvasUpdate = true
            canvas.innerHTML = canvas.toDataURL()
            setTimeout(() => preventCanvasUpdate = false, 20)
        })
    })

    canvas.addEventListener("pointerup"   , e => {
        isDrawing = false
        canvas.innerHTML = canvas.toDataURL()
        document.querySelector(`#html-body [data-id='${canvas.dataset.id}']`).innerHTML = canvas.toDataURL()
    })
    canvas.addEventListener("pointerleave", e => {
        isDrawing = false
        canvas.innerHTML = canvas.toDataURL()
        document.querySelector(`#html-body [data-id='${canvas.dataset.id}']`).innerHTML = canvas.toDataURL()
    })
    
    drawCanvas(canvas)
})

})