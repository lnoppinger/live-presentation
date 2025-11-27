let config = {
    zoomStepSize: 10,
    lineWidth:     1,
    eraseWidth:  30,
    colors: [
        "#000000",
        "#ff0000",
        "#00ff00",
        "#0000ff"
    ],
    runner: {
        java: runJava,
        sql:  runSql
    },
    e: new EventTarget()
}

// defaults bis alle Module geladen sind
function runJava() {}
function runSql () {}

window.addEventListener("DOMContentLoaded", async e => {
    if(document.head.title == null) document.head.title = document.querySelector("h1")?.innerText || "My Presentation"

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
    if(document.querySelector("code[data-lang=java") && config.runner.java.name == "runJava") {
        // ...
    }
    if(document.querySelector("code[data-lang=sql") && config.runner.java.name == "runSql") {
        // ...
    }
    if(document.querySelector("canvas")) {
        scripts.push("./canvas.js")
        styles.push("./canvas.css")
    }
    if(document.querySelector("canvas, code")) {
        styles.push("https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined")
    }
    if(document.querySelector("math")) {
        scripts.push("./math.js")
    }

    await Promise.all(styles.map( async url => {
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

    document.dispatchEvent(new Event("render"))
})