let config = {
    section: {
        page: 0,
        query: new URLSearchParams(location.search),
        zoomStepSize: 10,
        broadcast: new BroadcastChannel("live-presenation"),
        syncTabs: () => {}
    },
    canvas: {
        lineWidth: 3,
        lineWidthStepSize: 1,
        eraseWidthOffset: 30,
        currentColor: "eraser",
        isDrawing: false,
        colors: [
            "#000000",
            "#ff0000",
            "#00ff00",
            "#0000ff"
        ]
    },
    code: {
        java: null,
        sql: null
    },
    math: {
        throwOnError: false
    }
}
let nextId = 0

window.addEventListener("DOMContentLoaded", async e => {
    if(document.head.querySelector("title") == null) {
        let title = document.createElement("title")
        title.innerText = document.querySelector("h1")?.innerText || "My live presentation"
        document.head.appendChild(title)
    }

    document.body.querySelectorAll("*:not(script, main, #html, #html-head)").forEach(elem => {
        if(elem.dataset.id != null) return
        elem.dataset.id = nextId
        nextId++
    })
    if(document.querySelector("#html") == null) {
        let template1 = document.createElement("div")
        template1.id = "html"
        template1.innerHTML = document.body.innerHTML
        let template2 = document.createElement("div")
        template2.id = "html-head"
        template2.innerHTML = document.head.innerHTML
        let main = document.createElement("main")
        main.dataset.view = "q"
        document.body.append(template1, template2, main)
    }
    document.body.querySelectorAll("*:not(script, main, #html, #html *, #html-head, #html-head *)").forEach(elem => elem.remove())

    let scripts  = [
        "./section.js"
    ]
    let styles = [
        "./section.css"
    ]
    if(document.querySelector("code")) {
        scripts.push("./code.js")
        styles.push("./code.css")
    }
    if(document.querySelector("code[data-lang=java]") && config.code.java != null) {
        // ...
    }
    if(document.querySelector("code[data-lang=sql]") && config.code.sql != null) {
        // ...
    }
    if(document.querySelector("canvas")) {
        scripts.push("./canvas.js")
        styles.push("./canvas.css")
    }
    if(document.querySelector("canvas, code, math")) {
        styles.push("https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined")
    }
    if(document.querySelector("math")) {
        scripts.push("./math.js")
        scripts.push("https://cdn.jsdelivr.net/npm/katex@0.16.25/dist/katex.min.js")
        styles.push("./math.css")
        styles.push("https://cdn.jsdelivr.net/npm/katex@0.16.25/dist/katex.min.css")
    }

    await Promise.all(styles.map( async url => {
        if(document.head.querySelector(`link[href='${url}']`) != null) return
        return new Promise( (resolve, reject) => {
            let link = document.createElement("link")
            link.rel = "stylesheet"
            link.href = url
            link.onload = resolve
            link.onerror = reject
            document.head.appendChild(link)
        })
    }))
    console.log("All stylesheets loaded.")

    await Promise.all(scripts.map( url => {
        if(document.head.querySelector(`script[src='${url}']`) != null) return
        return new Promise( (resolve, reject) => {
            let script = document.createElement("script")
            script.src = url
            script.defer = true
            script.onload = resolve
            script.onerror = reject
            document.head.appendChild(script)
        })
    }))
    console.log("All scripts loaded.")

    document.dispatchEvent(new Event("renderstart"))
})