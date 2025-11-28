if(config.section.query.has("page") && !isNaN(config.section.query.get("page")))
    config.section.page = Number(config.section.query.get("page"))

config.section.broadcast.onmessage = e => {
    let data = JSON.parse(e.data)
    let changed = false

    if(data.page != config.section.page) {
        config.section.page = data.page
        changed = true
    }
    if(data.lineWidth != config.canvas.lineWidth) {
        config.canvas.lineWidth = data.lineWidth
    }
    if(data.html != document.querySelector("#html").innerHTML) {
        document.querySelector("#html").innerHTML = data.html
        changed = true
    }

    if(changed && e.data.rebuild) {
        window.dispatchEvent(new Event("DOMContentLoaded"))
        return
    }
    if(changed) document.dispatchEvent( new Event("renderstart") )
}
config.section.syncTabs = (change=0) => { // 1: reload; 2: rebuild
    config.section.broadcast.postMessage(JSON.stringify({
        page: config.section.page,
        lineWidth: config.canvas.lineWidth,
        html: document.querySelector("#html").innerHTML,
        rebuild: change > 2
    }))

    if(change > 1) {
        window.dispatchEvent(new Event("DOMContentLoaded"))
        return
    }
    if(change > 0) document.dispatchEvent( new Event("renderstart") )
}

document.addEventListener("keydown", e => {
    if(e.target == document || e.target.closest(".ignore-key-down") != null || e.target.classList.contains(".ignore-key-down") || e.altKey || e.ctrlKey || e.shiftKey) return
    e.preventDefault()

    if(["Backspace", "ArrowLeft", "ArrowUp"].includes(e.key) || (e.key == "Enter" && e.shiftKey)) {
        config.section.page--
        if(config.section.page < 0) config.section.page = 0
        config.section.syncTabs(1)
    }
    if([" ", "ArrowRight", "ArrowDown", "Enter"].includes(e.key)) {
        config.section.page++
        let sections = document.querySelectorAll("#html section")
        if(config.section.page > sections.length) config.section.page = sections.length
        config.section.syncTabs(1)
    }

    if(e.key == "+" || e.key == "*") {
        config.canvas.lineWidth += config.canvas.lineWidthStepSize
        config.section.syncTabs()
    }
    if(e.key == "-" || e.key == "_") {
        config.canvas.lineWidth -= config.canvas.lineWidthStepSize
        if(config.canvas.lineWidth < 0) config.canvas.lineWidth = 1
        config.section.syncTabs()
    }

    if(e.key.toLowerCase() == "a") {
        document.querySelector("#html").insertBefore(
            document.createElement("section"),
            document.querySelector(`#html section:nth-child(${config.section.page+1})`)
        )
        config.section.page++
        config.section.syncTabs(2)
    }
    if(e.key.toLowerCase() == "d") {
        let newSection = document.createElement("section")
        let canvas = document.createElement("canvas")
        canvas.dataset.flex = true
        newSection.appendChild(canvas)

        document.querySelector("#html").insertBefore(
            newSection,
            document.querySelector(`#html section:nth-child(${config.section.page+1})`)
        )
        config.section.page++
        config.section.syncTabs(2)
    }

    if(e.key.toLowerCase() == "e" && config.section.page > 0) {
        let section = document.querySelector(`#html section:nth-child(${config.section.page})`).cloneNode(true)
        section.querySelectorAll("*").forEach(elem => delete elem.dataset.id)

        let h1 = document.createElement("h1")
        h1.innerText = "Edit slide HTML"
        let p = document.createElement("p")
        p.innerText = "Press Q to save and exit"

        let pre = document.createElement("pre")
        pre.classList.add("ignore-key-down", "edit")
        pre.innerText = section.innerHTML.trim().replace(/\n\s{8}|<br>/g, "\n")
        pre.contentEditable = true

        document.querySelector("main").innerHTML = h1.outerHTML + p.outerHTML + pre.outerHTML
        document.querySelector("main").dataset.view = "e"
    }

    if(e.key.toLowerCase() == "h") {
        let pre = document.createElement("pre")
        pre.innerHTML = "Space    -> next page<br>Backspace-> previous page<br>A        -> add page<br>\
D        -> add page with canvas<br>E        -> edit page<br>H        -> display help (current view)<br>\
M        -> duplicate tab<br>N        -> show notes<br>P        -> print<br>Q        -> return to current page\
<br>R        -> trigger rerender<br>S        -> download html<br>Ctrl +   -> zoom in<br>Ctrl -   -> zoom out"
        document.querySelector("main").innerHTML = pre.outerHTML
    }

    if(e.key.toLowerCase() == "m") {
        window.open(window.location.href, "_blank")
    }

    if(e.key.toLowerCase() == "n") {
        document.querySelector("main").dataset.view = "n"
    }

    if(e.key.toLowerCase() == "p") {
        document.querySelector("main").innerHTML = document.querySelector("#html").innerHTML
        window.print()
        document.dispatchEvent(new Event("renderstart"))
    }

    if(["esc", "q"].includes(e.key.toLowerCase()) && document.querySelector("main").dataset.view == "e") {
        let data = document.querySelector("main pre").innerHTML.replace(/<br>|<div>|<\/div>/g, "\n").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
        document.querySelector(`#html section:nth-child(${config.section.page})`).innerHTML = data
        document.querySelector("main").dataset.view = "q"
        config.section.syncTabs(2)
    }
    if(["esc", "q"].includes(e.key.toLowerCase()) && document.querySelector("main").dataset.view != "e") {
        document.querySelector("main").dataset.view = "q"
        document.dispatchEvent(new Event("renderstart"))
    }

    if(e.key.toLowerCase() == "r") {
        document.dispatchEvent(new Event("renderstart"))
    }

    if(e.key.toLowerCase() == "s") {
        let text = `<!DOCTYPE html><html lang="${document.documentElement.lang}"><head>`
        text += document.getElementById("html-head").innerHTML
        text += "</head><body>"
        text += document.getElementById("html").innerHTML
        text += "</body></html>"

        let blob = new Blob([text], { type: "text/html" })
        const a = document.createElement("a")
        a.href = URL.createObjectURL(blob)
        a.download = document.head.querySelector("title").textContent.trim() + ".html"
        document.body.appendChild(a)
        a.click()
        document.dispatchEvent(new Event("renderstart"))
    }
})

document.addEventListener("renderstart", e =>{
    config.section.query.set("page", config.section.page)
    history.replaceState(null, "", location.origin + location.pathname + "?" + config.section.query.toString())

    if(config.section.page == 0) {
        document.body.dispatchEvent(new KeyboardEvent("keydown", {
            key: "h",
            bubbles: true
        }))
        return
    }

    document.querySelector("main").innerHTML = document.querySelector(`#html section:nth-child(${config.section.page})`).innerHTML

    document.dispatchEvent(new Event("render"))
    document.dispatchEvent(new Event("renderend"))
})