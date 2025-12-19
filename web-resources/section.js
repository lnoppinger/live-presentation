window.page = 0
window.query = new URLSearchParams(location.search)
if(query.has("page") && !isNaN(query.get("page"))) page = Number(query.get("page"))

shared.main.addEventListener("click", e => {
    if(e.target.nodeType == 3) e.target = e.target.parentElement
    if(shared.lastClickedOn.closest(".ignore-key") != null && e.target.closest(".ignore-key") == null) {
        shared.main.querySelectorAll(".ignore-key").forEach(elem => {
            elem.dispatchEvent(new Event("focusout"), {
                bubbles: true
            })
        })
    }
    shared.lastClickedOn = e.target
})

shared.main.addEventListener("keyup", e => {
    if(shared.lastClickedOn.closest(".ignore-key") != null || e.metaKey || e.altKey || e.ctrlKey || e.shiftKey) return

    if(["backspace", "arrowleft", "arrowup", " ", "arrowright", "arrowdown", "enter", "esc", "a", "d", "e", "h", "p", "q", "r", "s"]) {
        shared.main.querySelectorAll(".ignore-key").forEach(elem => {
            elem.dispatchEvent(new Event("focusout"), {
                bubbles: true
            })
        })
    }

    if(["Backspace", "ArrowLeft", "ArrowUp"].includes(e.key) || (e.key == "Enter" && e.shiftKey)) {
        page--
        shared.main.dispatchEvent(new Event("renderstart"))
    }
    if([" ", "ArrowRight", "ArrowDown", "Enter"].includes(e.key)) {
        page++
        shared.main.dispatchEvent(new Event("renderstart"))
    }

    if(e.key == "+" || e.key == "*") {
        shared.lineWidth += config.lineWidthStepSize
    }
    if(e.key == "-" || e.key == "_") {
        shared.lineWidth -= config.lineWidthStepSize
        if(shared.lineWidth < 0) shared.lineWidth = 1
    }

    if(e.key.toLowerCase() == "a") {
        let section = document.createElement("section")
        section.dataset.id = shared.nextId++
        document.querySelector("#html-body").insertBefore(
            section,
            document.querySelector(`#html-body section:nth-child(${page+1})`)
        )
        page++
        shared.main.dispatchEvent(new Event("renderstart"))
    }
    if(e.key.toLowerCase() == "d") {
        let newSection = document.createElement("section")
        newSection.dataset.id = shared.nextId++
        let canvas = document.createElement("canvas")
        canvas.dataset.flex = true
        canvas.dataset.id = shared.nextId++
        newSection.appendChild(canvas)

        document.querySelector("#html-body").insertBefore(
            newSection,
            document.querySelector(`#html-body section:nth-child(${page+1})`)
        )
        page++
        shared.main.dispatchEvent(new Event("renderstart"))
    }

    if(e.key.toLowerCase() == "e" && page > 0) {
        shared.main.innerHTML = "<h1> Edit slide HTML </h1>"

        let section = document.querySelector(`#html-body section:nth-child(${page})`).cloneNode(true)
        section.querySelectorAll("*").forEach(elem => delete elem.dataset.id)

        let decodeTextarea = document.createElement("textarea")
        decodeTextarea.innerHTML = section.innerHTML
        decodeTextarea.value = decodeTextarea.value.replace(/<br>/g, "\n").replace(/\n\s{0,8}/g, "\n")

        let pre = document.createElement("pre")
        pre.classList.add("ignore-key", "edit")
        pre.innerText = decodeTextarea.value
        pre.contentEditable = true
        pre.addEventListener("focusout", e => {
            decodeTextarea = document.createElement("textarea")
            decodeTextarea.innerHTML = pre.innerHTML
            decodeTextarea.value = decodeTextarea.value.replace(/\n/g, "\n        ")
            document.querySelector(`#html-body section:nth-child(${page})`).innerHTML = decodeTextarea.value
            shared.main.dispatchEvent(new Event("renderstart"))
        })
        shared.main.appendChild(pre)
        pre.focus()
    }

    if(e.key.toLowerCase() == "h") {
        shared.main.innerHTML = "<pre>\
Space    -> next page<br>\
Backspace-> previous page<br>\
A        -> add page<br>\
D        -> add page with canvas<br>\
E        -> edit page<br>\
H        -> display help (current view)<br>\
M        -> enable presenter mode<br>\
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
        window.open(config.resourceBaseUrl + "/secondary.html?title=" + shared.titleCompact, "_blank")
        shared.main.dataset.view = "n"
    }

    if(e.key.toLowerCase() == "n") {
        if(shared.main.dataset.view == "n") {
            delete shared.main.dataset.view
        } else {
            shared.main.dataset.view = "n"
        }
        shared.main.dispatchEvent(new Event("resize"))
    }

    if(e.key.toLowerCase() == "p") {
        let view = shared.main.dataset.view
        shared.main.dataset.view = "p"
        shared.main.innerHTML = document.querySelector("#html-body").innerHTML
        shared.main.dispatchEvent(new Event("render"))
        setTimeout(() => {
            window.print()
            view != null ? shared.main.dataset.view = view : delete shared.main.dataset.view
            shared.main.dispatchEvent(new Event("renderstart"))
        }, 500)
    }

    if(["esc", "q", "r"].includes(e.key.toLowerCase())) {
        shared.main.dispatchEvent(new Event("renderstart"))
    }

    if(e.key.toLowerCase() == "s") {
        let text = `<!DOCTYPE html><html lang="${document.documentElement.lang}"><head>`
        text += document.getElementById("html-head").innerHTML
        text += "</head><body>"
        text += document.getElementById("html-body").innerHTML
        text += "</body></html>"

        let blob = new Blob([text], { type: "text/html" })
        const a = document.createElement("a")
        a.href = URL.createObjectURL(blob)
        a.download = document.head.querySelector("title").textContent.trim() + ".html"
        document.body.appendChild(a)
        a.click()
        a.remove()
    }
})

shared.main.addEventListener("renderstart", e =>{
    document.querySelectorAll("body > :is(footer, aside)").forEach(elem => elem.remove())

    let sections = document.querySelectorAll("#html-body section")
    if(page < 0) page = 0
    if(page > sections.length) page = sections.length

    query.set("page", page)
    history.replaceState(null, "", location.origin + location.pathname + "?" + query.toString())
    if(page == 0) {
        shared.main.dispatchEvent(new KeyboardEvent("keyup", {
            key: "h"
        }))
        return
    }

    shared.main.innerHTML = sections[page -1].innerHTML
    shared.main.querySelectorAll("footer, aside").forEach(elem => document.body.appendChild(elem))

    let footer = document.querySelector("body > footer")
    if(footer == null) {
        footer = document.createElement("footer")
        footer.dataset.id = shared.nextId++
        document.body.appendChild(footer)
        sections[page -1].appendChild(footer.cloneNode(true))
    }
    footer.addEventListener("click", e => shared.lastClickedOn = footer)
    footer.contentEditable = true
    footer.classList.add("ignore-key")
    footer.addEventListener("focusout", e => {
        document.querySelector(`#html-body [data-id='${footer.dataset.id}']`).innerText = footer.innerText
    })

    shared.main.dispatchEvent(new Event("render"))
    shared.main.dispatchEvent(new Event("resize"))
    shared.main.dispatchEvent(new Event("renderend"))
})

shared.main.addEventListener("render", e => {
    function outdent(elem, spaceCount=8) {
        elem.childNodes.forEach(child => {
            if(child.nodeType == 3) {
                let regex = new RegExp(`^ {0,${spaceCount}}`)
                let lines = child.textContent.split("\n")
                let shortLines = lines.map(line => line.replace(regex, ""))
                child.textContent = shortLines.join("\n").replace(/^\n/, "")
            } else {
                outdent(child, spaceCount + 4)
            }
        })
    }
    outdent(shared.main)
    document.querySelectorAll("footer, aside").forEach(elem => outdent(elem, 12))
})

shared.main.addEventListener("resize", e => {
    shared.main.style.justifyContent = shared.main.scrollHeight > shared.main.clientHeight ? "start" : "center"
    shared.main.style.alignItems     = shared.main.scrollWidth  > shared.main.clientWidth  ? "start" : "center"

    let mainCss = getComputedStyle(shared.main)
    let height = Number(mainCss.height.replace("px", "")) + window.innerWidth * 0.04
    let width  = Number(mainCss.width .replace("px", "")) + window.innerWidth * 0.04

    let zoomHeight = window.innerHeight / height 
    let zoomWidth  = window.innerWidth  / width 
    if(shared.main.dataset.view == "n") {
        zoomHeight *= 2/3
        zoomWidth  *= 2/3
    }
    shared.main.style.zoom = Math.min(zoomHeight, zoomWidth)

    shared.main.querySelectorAll("footer, aside, #colors-bar").forEach(elem => {
        elem.style.zoom = 3 / 2 / shared.main.style.zoom
    })
})