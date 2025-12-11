// let config = {
//     bundle: {
//         resourceUrl: "./web-resources"
//     },
//     section: {
//         page: 0,
//         query: new URLSearchParams(location.search),
//         zoomStepSize: 10,
//         broadcast: new BroadcastChannel("live-presenation"),
//         syncTabs: () => {},
//         helpText: "\
// Space    -> next page<br>\
// Backspace-> previous page<br>\
// A        -> add page<br>\
// D        -> add page with canvas<br>\
// E        -> edit page<br>\
// H        -> display help (current view)<br>\
// M        -> duplicate tab<br>\
// N        -> show notes<br>\
// P        -> print<br>\
// Q        -> return to current page<br>\
// R        -> trigger rerender<br>\
// S        -> download html<br>\
// Ctrl +   -> zoom in<br>\
// Ctrl -   -> zoom out<br><br>\
// Version 1.0.0"
//     },
//     canvas: {
//         lineWidth: 3,
//         lineWidthStepSize: 1,
//         eraseWidthOffset: 30,
//         isDrawing: false,
//         colors: [
//             "#ff0000",
//             "#00ff00",
//             "#0000ff"
//         ]
//     },
//     code: {
//         url: "ws://localhost:8765",
//         wsError: false,
//         ws: null,
//         terminal: null
//     },
//     math: {
//         throwOnError: false
//     }
// }
const shared = {}
const config = {
    initialLineWidth: 3,
    lineWidthStepSize: 1,
    eraseWidthOffset: 30,
    colors: [
        "#ff0000",
        "#00ff00",
        "#0000ff"
    ],
    codeRunnerUrl: "ws://localhost:8765",
    resourceBaseUrl: "./web-resources"
}
let nextId = 0

window.addEventListener("DOMContentLoaded", async e => {
    if(document.querySelector("#html") != null) {
        document.body.innerHTML = document.querySelector("#html").innerHTML
    }
    if(document.querySelector("#html-head") != null) {
        document.head.innerHTML = document.querySelector("#html-head").innerHTML
    }

    if(document.head.querySelector("title") == null) {
        let title = document.createElement("title")
        title.innerText = document.querySelector("h1")?.innerText || "My live presentation"
        document.head.appendChild(title)
    }

    document.body.querySelectorAll("*:not(script, #html, #html-head)").forEach(elem => {
        if(elem.dataset.id != null) return
        elem.dataset.id = nextId
        nextId++
    })
    
    let template1 = document.createElement("div")
    template1.id = "html"
    template1.innerHTML = document.body.innerHTML
    let template2 = document.createElement("div")
    template2.id = "html-head"
    template2.innerHTML = document.head.innerHTML
    let main = document.createElement("main")
    main.dataset.view = "q"
    document.body.append(template1, template2, main)
    document.querySelectorAll("body *:not(script, #html, #html-head, main, #html *, #html-head *)").forEach(e => e.remove())

    shared.syncTabs = () => {}
    shared.lineWidth = config.initialLineWidth
    shared.main = main
    shared.codeRunnerError = true

    let scripts  = [
        "/section.js"
    ]
    let styles = [
        "/section.css"
    ]
    if(document.querySelector("code") != null) {
        scripts.push("/code.js")
        scripts.push("https://cdn.jsdelivr.net/npm/xterm/lib/xterm.js")
        styles.push("/code.css")
        styles.push("https://cdn.jsdelivr.net/npm/xterm/css/xterm.css")
    }
    if(document.querySelector("canvas") != null) {
        scripts.push("/canvas.js")
        styles.push("/canvas.css")
    }
    if(document.querySelector("canvas, code, math") != null) {
        styles.push("https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined")
    }
    if(document.querySelector("math") != null) {
        scripts.push("/math.js")
        scripts.push("https://cdn.jsdelivr.net/npm/katex@0.16.25/dist/katex.min.js")
        styles.push("/math.css")
        styles.push("https://cdn.jsdelivr.net/npm/katex@0.16.25/dist/katex.min.css")
    }

    await Promise.all(styles.map( async url => {
        return new Promise( (resolve, reject) => {
            let link = document.createElement("link")
            link.rel = "stylesheet"
            link.href = url.charAt(0) == "/" ? config.resourceBaseUrl + url : url
            link.onload = resolve
            link.onerror = reject
            document.head.appendChild(link)
        })
    }))
    console.log("All stylesheets loaded.")

    await Promise.all(scripts.map( url => {
        return new Promise( (resolve, reject) => {
            let script = document.createElement("script")
            script.src = url.charAt(0) == "/" ? config.resourceBaseUrl + url : url
            script.defer = true
            script.onload = resolve
            script.onerror = reject
            document.head.appendChild(script)
        })
    }))
    console.log("All scripts loaded.")

    shared.main.dispatchEvent(new Event("renderstart"))
})


// window.addEventListener("resize"   , e => shared.main.dispatchEvent(e))
// window.addEventListener("close"    , e => shared.main.dispatchEvent(e))
// window.addEventListener("scroll"   , e => shared.main.dispatchEvent(e))
// window.addEventListener("scrollend", e => shared.main.dispatchEvent(e))
document.addEventListener("keyup", e => {
    e.preventDefault()
    if(e.target.closest("main") != null) return
    const ev = new KeyboardEvent("keyup", {
        key: e.key,
        ctrlKey: e.ctrlKey,
        shiftKey: e.shiftKey,
        altKey: e.altKey,
        metaKey: e.metaKey
    })
    shared.main.dispatchEvent(ev)
})