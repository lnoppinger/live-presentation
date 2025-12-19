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
    resourceBaseUrl: "https://live-presentation.lnoppinger.de/web-resources"
}
let nextId = 0

window.addEventListener("DOMContentLoaded", async e => {
    // reset
    if(document.querySelector("#html-body") != null) {
        document.body.innerHTML = document.querySelector("#html-body").innerHTML
    }
    if(document.querySelector("#html-head") != null) {
        document.head.innerHTML = document.querySelector("#html-head").innerHTML
    }

    if(document.head.querySelector("title") == null) {
        let title = document.createElement("title")
        title.innerText = document.querySelector("h1")?.innerText || "My live presentation"
        document.head.appendChild(title)
    }

    document.querySelectorAll("pre, code").forEach(elem => {
        let decodeTextarea = document.createElement("textarea")
        let deleteEnd = 0
        elem.querySelectorAll("*").forEach(e => {
            delete e.dataset.id
            deleteEnd += e.tagName.length + 3
        })
        decodeTextarea.innerHTML = elem.innerHTML.substring(0, elem.innerHTML.length - deleteEnd)
        decodeTextarea.textContent = decodeTextarea.value
        elem.innerHTML = decodeTextarea.innerHTML
    })

    document.body.querySelectorAll("*").forEach(elem => {
        elem.dataset.id = nextId++
    })
    
    let template1 = document.createElement("div")
    template1.id = "html-body"
    template1.innerHTML = document.body.innerHTML
    let template2 = document.createElement("div")
    template2.id = "html-head"
    template2.innerHTML = document.head.innerHTML
    let main = document.createElement("main")
    main.dataset.view = "q"
    document.body.append(template1, template2, main)
    document.querySelectorAll("body *:not(script, #html-body, #html-head, main, #html-body *, #html-head *)").forEach(e => e.remove())

    shared.lineWidth = config.initialLineWidth
    shared.main = main
    shared.codeRunnerError = true
    shared.titleCompact = document.head.innerText.toLowerCase().replace(/\W/g, "")
    shared.lastClickedOn = main
    shared.nextId = nextId

    let scripts  = [
        "/canvas.js",
        "/code.js",
        "/math.js",
        "/section.js",
        "/sync.js",
        "https://cdn.jsdelivr.net/npm/xterm/lib/xterm.js",
        "https://cdn.jsdelivr.net/npm/katex@0.16.25/dist/katex.min.js"
    ]
    let styles = [
        "/canvas.css",
        "/code.css",
        "/section.css",
        "https://cdn.jsdelivr.net/npm/xterm/css/xterm.css",
        "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined",
        "https://cdn.jsdelivr.net/npm/katex@0.16.25/dist/katex.min.css"
    ]

    await Promise.all(styles.map( async url => {
        return new Promise( (resolve, reject) => {
            let link = document.createElement("link")
            link.rel = "stylesheet"
            link.href = url.charAt(0) == "/" ? config.resourceBaseUrl + url : url
            link.onload = resolve
            link.onerror = () => reject(new Error("Failed to load stylesheet: " + link.href))
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
            script.onerror = () => reject(new Error("Failed to load script: " + script.src))
            document.head.appendChild(script)
        })
    }))
    console.log("All scripts loaded.")

    shared.main.dispatchEvent(new Event("renderstart"))

    document.addEventListener("keyup", e => {
        e.preventDefault()
        if(e.target.closest("main, footer") != null) return
        const ev = new KeyboardEvent("keyup", {
            key: e.key,
            ctrlKey: e.ctrlKey,
            shiftKey: e.shiftKey,
            altKey: e.altKey,
            metaKey: e.metaKey
        })
        shared.main.dispatchEvent(ev)
    })

    window.addEventListener("resize", e => {
        shared.main.dispatchEvent(new Event("resize"))
    })
})

window.onerror = e => {
    alert("Someting went wrong.")
}