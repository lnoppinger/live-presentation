window.broadcast = new BroadcastChannel("live-presenation-" + shared.titleCompact)
broadcast.onmessage = e => {
    if(e.data[0] == "<") return
    let data = JSON.parse(e.data)

    let options = {}
    Object.keys(data).filter(k => !["id", "name", "height", "width"].includes(k)).forEach(k => {
        options[k] = data[k]
    })

    let event
    if(data.name == "resize") {
        event = new Event("resize", options)
        shared.main.style.height = String(data.height) + "px"
        shared.main.style.width  = String(data.width ) + "px"
    } else if(data.name == "keyup") {
        event = new KeyboardEvent("keyup", options)
    } else if(["pointerup", "pointerdown", "pointermove", "pointerleave"].includes(data.name)) {
        event = new PointerEvent(data.name, options)
    } else {
        event = new Event(data.name, options)
    }

    document.querySelector("main" + (data.selector == null ? "" : " > " + data.selector)).dispatchEvent(event)
}

window.observerTimeout
window.observer = new MutationObserver((mutations) => {
    clearTimeout(window.observerTimeout)
    observerTimeout = setTimeout(() => {
        broadcast.postMessage(shared.main.innerHTML)
    }, 200)
})
observer.observe(shared.main, {
    childList: true,
    subtree: true,
    characterData: true
})