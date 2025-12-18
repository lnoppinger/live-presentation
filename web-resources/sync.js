window.broadcast = new BroadcastChannel("live-presenation-" + shared.titleCompact)
broadcast.onmessage = e => {
    if(e.data[0] == "<") return
    let data = JSON.parse(e.data)

    let elem = document.querySelector("main" + (data.selector == null ? "" : " > " + data.selector))
    if(elem == null) elem = document.querySelector("main")

    if(data.name == "resize") {
        shared.main.style.height = String(data.height - data.width*0.04) + "px"
        shared.main.style.width  = String(data.width*0.96) + "px"
        broadcast.postMessage(shared.main.outerHTML)
        elem.dispatchEvent(new Event("resize"))

    } else if(data.name == "scrollend") {
        shared.main.scrollTo({
            left: data.left,
            top:  data.top,
            behaviour: "smooth"
        })

    } else if(data.name == "click") {
        elem.click()

    } else if(data.name == "terminal" && window.terminal != null && window.ws != null) {
        // terminal.write(data.text)
        ws.send(JSON.stringify({cmd: data.text}))

    } else if(data.name == "keyup") {
        elem.dispatchEvent(new KeyboardEvent("keyup", {
            key: data.key,
            altKey: data.altKey,
            ctrlKey: data.ctrlKey,
            metaKey: data.metaKey,
            shiftKey: data.shiftKey,
            bubbles: true
        }))

    } else if(["pointerdown", "pointermove"].includes(data.name)) {
        let rect = elem.getBoundingClientRect()
        let zoom = Number(getComputedStyle(shared.main).getPropertyValue("zoom"))
        elem.dispatchEvent(new PointerEvent(data.name, {
            clientX: rect.left + data.offsetX*zoom,
            clientY: rect.top  + data.offsetY*zoom,
            bubbles: true
        }))
        
    } else if(["pointerup", "pointerleave"].includes(data.name)) {
        elem.dispatchEvent(new PointerEvent(data.name, {
            bubbles: true
        }))
    }
}

window.updateCounter = 0
window.needsUpdate = false
window.preventUpdate = false
window.observer = new MutationObserver((mutations) => {
    if(preventUpdate) {
        needsUpdate = true
        return
    }
    needsUpdate = false
    preventUpdate = true
    broadcast.postMessage(shared.main.outerHTML)
    setTimeout(() => {
        preventUpdate = false
        if(!needsUpdate) return 
        updateCounter++
        shared.main.dataset.update = updateCounter
    }, 10)
})
observer.observe(shared.main, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true
})

shared.main.addEventListener("scroll", e => {
    shared.main.dataset.scrollTop  = shared.main.scrollTop
    shared.main.dataset.scrollLeft = shared.main.scrollLeft
})