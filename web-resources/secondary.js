let query = new URLSearchParams(location.search)
if(!query.has("title")) alert("Missing title=... in URL.")
let title = query.get("title")

let broadcast = new BroadcastChannel("live-presenation-" + title)
broadcast.onmessage = e => {
    document.body.innerHTML = "<main>" + e.data + "</main>"
}

document.addEventListener("click", e => {
    broadcast.postMessage(JSON.stringify({
        name: "click",
        selector: targetToSelector(e.target)
    }))
})

document.addEventListener("keyup", e => {
    broadcast.postMessage(JSON.stringify({
        name: "keyup",
        selector: targetToSelector(e.target),
        key: e.key,
        ctrlKey: e.ctrlKey,
        altKey: e.altKey,
        shiftKey: e.shiftKey,
        metaKey: e.metaKey
    }))
})

document.addEventListener("scroll", e => {
    broadcast.postMessage(JSON.stringify({
        name: "scroll",
        selector: targetToSelector(e.target)
    }))
})

document.addEventListener("pointerdown", e => {
    broadcast.postMessage(JSON.stringify({
        name: "pointerdown",
        selector: targetToSelector(e.target),
        offsetX: e.offsetX,
        offsetY: e.offsetY,
        pointerId: e.pointerId
    }))
})

document.addEventListener("pointermove", e => {
    broadcast.postMessage(JSON.stringify({
        name: "pointermove",
        selector: targetToSelector(e.target),
        offsetX: e.offsetX,
        offsetY: e.offsetY
    }))
})

document.addEventListener("pointerup", e => {
    broadcast.postMessage(JSON.stringify({
        name: "pointerup",
        selector: targetToSelector(e.target),
        pointerId: e.pointerId
    }))
})

document.addEventListener("pointerleave", e => {
    broadcast.postMessage(JSON.stringify({
        name: "pointerleave",
        selector: targetToSelector(e.target),
        pointerId: e.pointerId
    }))
})

window.addEventListener("resize", e => {
    broadcast.postMessage(JSON.stringify({
        name: "resize",
        height: window.innerHeight,
        width:  window.innerWidth
    }))
})

function targetToSelector(target) {
    if(target.nodeType == 3) target = target.parentElement
    if(["HTML", "BODY", "MAIN"].includes(target.tagName) || target == document || target == window) return null

    let selector = []
    let current = target
    while(current.tagName != "MAIN") {
        let index = Array.from(current.parentElement.children).indexOf(current)
        if(index < 0) return null
        selector.push(index)
        current = current.parentElement
    }
    let selectorString = selector.reverse().map(i => ":nth-child(" + String(i+1) + ")").join(" > ")
    return selectorString
}

window.dispatchEvent(new Event("resize"))
