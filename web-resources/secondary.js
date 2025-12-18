let query = new URLSearchParams(location.search)
if(!query.has("title")) alert("Missing title=... in URL.")
let title = query.get("title")

let broadcast = new BroadcastChannel("live-presenation-" + title)
let preventScroll = false
let terminal

broadcast.onmessage = async e => {
    if(e.data.charAt(0) == "{") return

    console.log("render")
    let tempMain = document.createElement("main")
    document.body.appendChild(tempMain)
    tempMain.outerHTML = e.data

    let main = document.querySelector("main:last-of-type")
    main.style.left = "-99999px"

    main.style.justifyContent = main.scrollHeight > main.clientHeight ? "start" : "center"
    main.style.alignItems     = main.scrollWidth  > main.clientWidth  ? "start" : "center"

    main.style.zoom   = ""
    main.querySelector("#colors-bar").style.zoom = ""
    delete main.dataset.view

    preventScroll = true
    main.scrollTo({
        top:  main.dataset.scrollTop,
        left: main.dataset.scrollLeft,
        behavior: "auto"
    })
    setTimeout(() => preventScroll = false, 1000)

    await Promise.all(Array(...document.querySelectorAll("canvas")).map(canvas => {
        return new Promise(resolve => {
            let ctx = canvas.getContext("2d")
            let img = new Image()
            img.onload = function () {
                ctx.clearRect(0, 0, canvas.width, canvas.height)
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
                resolve()
            }
            img.src = canvas.innerHTML
        })
    }))

    main.addEventListener("scrollend", e => {
        if(preventScroll) return
        broadcast.postMessage(JSON.stringify({
            name: "scrollend",
            top:  main.scrollTop,
            left: main.scrollLeft,
            selector: targetToSelector(e.target)
        }))
    })

    if(terminal != null) terminal.dispose()
    let terminalElem = main.querySelector("#terminal")
    if(terminalElem != null) {
        let cmd = terminalElem.innerText.replace(/\n/g, "\n\r").slice(0, -1)
        terminalElem.innerHTML = ""
        terminal = new Terminal({
            cursorBlink: true,
            fontSize: 14,
            columns: terminalElem.dataset.columns,
            rows: terminalElem.dataset.rows
        })
        terminal.onData(text => broadcast.postMessage(JSON.stringify({
            name: "terminal",
            text
        })))
        terminal.open(terminalElem)
        terminal.write(cmd)
        terminal.focus()
    }

    main.style.left = ""
    for(let elem of document.body.querySelectorAll("main")) {
        if(elem == main) break
        if(elem != null) elem.remove()
    }
}

document.addEventListener("click", e => {
    if(e.target.closest(".copy") != null) {
        e.target = e.target.closest(".copy")
        let text = document.querySelector("code[data-shown]").innerText
        navigator.clipboard.writeText(text.trim())
        e.target.innerText = "assignment_turned_in"
        setTimeout(() => e.target.innerText = "content_copy", 1000)
        return
    }
    if(e.target.closest("math") != null) {
        navigator.clipboard.writeText(e.target.closest("math").dataset.text)
        return
    }
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

document.addEventListener("pointerdown", e => {
    let rect = e.target.getBoundingClientRect()
    broadcast.postMessage(JSON.stringify({
        name: "pointerdown",
        selector: targetToSelector(e.target),
        offsetX: e.clientX - rect.left,
        offsetY: e.clientY - rect.top
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
        selector: targetToSelector(e.target)
    }))
})

document.addEventListener("pointerleave", e => {
    broadcast.postMessage(JSON.stringify({
        name: "pointerleave",
        selector: targetToSelector(e.target)
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

    if(target.closest("#terminal") != null) target = target.closest("#terminal")

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
