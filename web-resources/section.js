window.query = new URLSearchParams(location.search)
if(query.has("page") && !isNaN(query.get("page"))) page = Number(query.get("page"))

window.broadcast = new BroadcastChannel("live-presenation-" + document.head.title.toLowerCase().replace(/\W/g, ""))
broadcast.onmessage = e => {
    let data = JSON.parse(e.data)
    let changed = false

    if(data.page != page) {
        page = data.page
        changed = true
    }
    if(data.lineWidth != shared.lineWidth) {
        shared.lineWidth = data.lineWidth
    }
    if(data.html != document.querySelector("#html").innerHTML) {
        document.querySelector("#html").innerHTML = data.html
        changed = true
    }
    shared.main.scrollTo({
        left: data.scrollLeft,
        top: data.scrollTop,
        behavior: "smooth"
    })

    if(changed && e.data.rebuild) {
        window.dispatchEvent(new Event("DOMContentLoaded"))
        return
    }
    if(changed) shared.main.dispatchEvent( new Event("renderstart") )
}

shared.syncTabs = (change=0) => { // 1: reload; 2: rebuild
    broadcast.postMessage(JSON.stringify({
        page: page,
        lineWidth: shared.lineWidth,
        html: document.querySelector("#html").innerHTML,
        scrollLeft: shared.main.scrollLeft,
        scrollTop: shared.main.scrollTop,
        rebuild: change > 2
    }))

    if(change > 1) {
        window.dispatchEvent(new Event("DOMContentLoaded"))
        return
    }
    if(change > 0) shared.main.dispatchEvent( new Event("renderstart") )
}

window.lastClickedOn = shared.main
shared.main.addEventListener("click", e => {
    window.lastClickedOn = e.target
})

shared.main.addEventListener("keyup", e => {
    if(window.lastClickedOn.closest(".ignore-key") != null || e.altKey || e.ctrlKey || e.shiftKey) return

    if(["Backspace", "ArrowLeft", "ArrowUp"].includes(e.key) || (e.key == "Enter" && e.shiftKey)) {
        page--
        if(page < 0) page = 0
        shared.syncTabs(1)
    }
    if([" ", "ArrowRight", "ArrowDown", "Enter"].includes(e.key)) {
        page++
        let sections = document.querySelectorAll("#html section")
        if(page > sections.length) page = sections.length
        shared.syncTabs(1)
    }

    if(e.key == "+" || e.key == "*") {
        shared.lineWidth += config.lineWidthStepSize
        shared.syncTabs()
    }
    if(e.key == "-" || e.key == "_") {
        shared.lineWidth -= config.lineWidthStepSize
        if(shared.lineWidth < 0) shared.lineWidth = 1
        shared.syncTabs()
    }

    if(e.key.toLowerCase() == "a") {
        document.querySelector("#html").insertBefore(
            document.createElement("section"),
            document.querySelector(`#html section:nth-child(${page+1})`)
        )
        page++
        shared.syncTabs(1)
    }
    if(e.key.toLowerCase() == "d") {
        let newSection = document.createElement("section")
        let canvas = document.createElement("canvas")
        canvas.dataset.flex = true
        newSection.appendChild(canvas)

        document.querySelector("#html").insertBefore(
            newSection,
            document.querySelector(`#html section:nth-child(${page+1})`)
        )
        page++
        shared.syncTabs(2)
    }

    if(e.key.toLowerCase() == "e" && page > 0) {
        let section = document.querySelector(`#html section:nth-child(${page})`).cloneNode(true)
        section.querySelectorAll("*").forEach(elem => delete elem.dataset.id)

        let h1 = document.createElement("h1")
        h1.innerText = "Edit slide HTML"
        let p = document.createElement("p")
        p.innerText = "Press Q to save and exit"

        let pre = document.createElement("pre")
        pre.classList.add("ignore-key-down", "edit")
        pre.innerText = section.innerHTML.trim().replace(/\n\s{8}|<br>/g, "\n")
        pre.contentEditable = true

        shared.main.innerHTML = h1.outerHTML + p.outerHTML + pre.outerHTML
        shared.main.dataset.view = "e"
    }

    if(e.key.toLowerCase() == "h") {
        shared.main.innerHTML = "<pre>\
Space    -> next page<br>\
Backspace-> previous page<br>\
A        -> add page<br>\
D        -> add page with canvas<br>\
E        -> edit page<br>\
H        -> display help (current view)<br>\
M        -> duplicate tab<br>\
N        -> show notes<br>\
P        -> print<br>\
Q        -> return to current page<br>\
R        -> reload page without data loss<br>\
S        -> download html<br>\
Ctrl +   -> zoom in<br>\
Ctrl -   -> zoom out<br><br>\
Version 1.0.0" +
        (shared.codeRunnerError ? "\n\n!!! Caution: Code tags found and code-runner not reachable. !!!" : "")
        + "</pre>"
    }

    if(e.key.toLowerCase() == "m") {
        window.open(window.location.href, "_blank")
    }

    if(e.key.toLowerCase() == "n") {
        shared.main.dataset.view = "n"
    }

    if(e.key.toLowerCase() == "p") {
        shared.main.innerHTML = document.querySelector("#html").innerHTML
        window.print()
        shared.main.dispatchEvent(new Event("renderstart"))
    }

    if(["esc", "q"].includes(e.key.toLowerCase()) && shared.main.dataset.view == "e") {
        let data = document.querySelector("main pre").innerHTML.replace(/<br>|<div>|<\/div>/g, "\n").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
        document.querySelector(`#html section:nth-child(${page})`).innerHTML = data
        shared.syncTabs(2)
    }
    if(["esc", "q"].includes(e.key.toLowerCase())) {
        shared.main.dataset.view = "q"
        shared.main.dispatchEvent(new Event("renderstart"))
    }

    if(e.key.toLowerCase() == "r") {
        window.dispatchEvent(new Event("DOMContentLoaded"))
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
        a.remove()
        shared.main.dispatchEvent(new Event("renderstart"))
    }
})

shared.main.addEventListener("renderstart", e =>{
    if(window.lastClickedOn.closest(".ignore-key") != null) return
    query.set("page", page)
    history.replaceState(null, "", location.origin + location.pathname + "?" + query.toString())

    if(page == 0) {
        shared.main.dispatchEvent(new KeyboardEvent("keyup", {
            key: "h"
        }))
        return
    }

    shared.main.innerHTML = document.querySelector(`#html section:nth-child(${page})`).innerHTML

    shared.main.dispatchEvent(new Event("render"))
    shared.main.dispatchEvent(new Event("renderend"))
    shared.main.dispatchEvent(new Event("resize"))
})

shared.main.addEventListener("scrollend", e => {
    // shared.syncTabs(0)
})

shared.main.addEventListener("resize", e => {
    shared.main.style.justifyContent = shared.main.scrollHeight > shared.main.clientHeight ? "start" : "center"
    shared.main.style.alignItems     = shared.main.scrollWidth  > shared.main.clientWidth  ? "start" : "center"
})