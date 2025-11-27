let query = new URLSearchParams(location.search)
let page = 1
if(query.has("page") && !isNaN(query.get("page"))) page = Number(query.get("page"))

document.addEventListener("keydown", e => {
    if(e.target.closest("code") != null || e.altKey || e.ctrlKey || e.shiftKey) return
    e.preventDefault()

    if(e.key == " " || e.key == "ArrowRight" || e.key == "ArrowDown" || (e.key == "Enter" && !e.shiftKey)) {
        page++
        document.dispatchEvent(new Event("render"))
    }
    if(e.key == "Backspace" || e.key == "ArrowLeft" || e.key == "ArrowUp" || (e.key == "Enter" && e.shiftKey)) {
        page--
        document.dispatchEvent(new Event("render"))
    }

    if(e.key == "+" || e.key == "*") {
        config.eraseWidth += 5
        config.lineWidth  += 1
    }
    if(e.key == "-" || e.key == "_") {
        config.eraseWidth -= 5
        config.lineWidth  -= 1
    }

    if(e.key.toLowerCase() == "p") window.print()
})


document.addEventListener("render", e =>{
    let sections = document.querySelectorAll("section")
    if(sections.length < 1) return

    if(page > sections.length) page = sections.length
    if(page < 1              ) page = 1
    query.set("page", page)

    sections.forEach(s => delete s.dataset.shown)
    sections[ page - 1 ].dataset.shown = true

    history.replaceState(null, "", location.origin + location.pathname + "?" + query.toString())
    document.dispatchEvent(new Event("renderend"))
})