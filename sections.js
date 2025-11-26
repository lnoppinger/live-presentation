let query = new URLSearchParams(location.search)
update()

document.body.addEventListener("keydown", e => {
    if((e.key == " " || e.key == "ArrowRight" || e.key == "ArrowDown") && e.target.closest("code") == null) {
        update(1)
    }
    if((e.key == "Backspace" || e.key == "ArrowLeft" || e.key == "ArrowUp") && e.target.closest("code") == null) {
        update(-1)
    }

    if(e.key == "+" || e.key == "*" || e.key == "~") update(0, 10)
    if(e.key == "-" || e.key == "_") update(0, -10)

    if(e.key.toLowerCase() == "p" ) window.print()
})

function update(movePage=0, moveZoom=0) {
    let sections = document.querySelectorAll("section")
    sections.forEach(s => delete s.dataset.shown)

    let page = 1
    if(query.has("page") && !isNaN(query.get("page"))) page = Number(query.get("page"))
    page += movePage

    if(page > sections.length) page = sections.length
    if(page < 1              ) page = 1
    
    sections[ page - 1 ].dataset.shown = true
    query.set("page", page)

    let zoom = 100
    if(query.has("zoom") && !isNaN(query.get("zoom"))) zoom = Number(query.get("zoom"))
    zoom += moveZoom

    if(zoom < 1) zoom = 10

    document.body.style.zoom   = String(zoom) + "%"
    document.body.style.width  = Math.max(window.innerWidth  * 100 / zoom, sections[page -1].offsetWidth + 40) + "px"
    document.body.style.height = Math.max(window.innerHeight * 100 / zoom, sections[page -1].offsetHeight) + "px"
    query.set("zoom", zoom)

    history.replaceState(null, "", location.origin + location.pathname + "?" + query.toString())
}