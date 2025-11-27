document.querySelectorAll("*:not(.code-block) code").forEach(code => {
    let codeTab = document.createElement("span")
    codeTab.innerText = code.dataset.file

    if(!code.previousElementSibling.classList.contains("code-block")) {
        maxHeight = 0
        maxWidth  = 0

        code.dataset.shown = "true"
        code.setAttribute("style", "border-radius: 0 10px 10px 10px")
        codeTab.dataset.shown = "true"

        let codeBlock = document.createElement("div")
        codeBlock.classList.add("code-block")
        codeBlock.dataset.lang = code.dataset.lang
        code.before(codeBlock)

        let tabs = document.createElement("div")
        tabs.classList.add("tabs")
        codeBlock.appendChild(tabs)

        let run = document.createElement("span")
        run.innerText = "play_circle"
        run.classList.add("material-symbols-outlined", "run")
        run.style.right = "35px"
        codeBlock.appendChild(run)

        let copy = document.createElement("span")
        copy.innerText = "content_copy"
        copy.classList.add("material-symbols-outlined", "copy")
        copy.style.right = "5px"
        codeBlock.appendChild(copy)
    }

    if(!code.dataset.hidden) {
        code.previousElementSibling.firstElementChild.append(codeTab.cloneNode(true))
        code.previousElementSibling.append(codeTab)
    }
    code.previousElementSibling.append(code)
    code.innerText = code.innerText.trim()
    code.setAttribute("contenteditable", true)
})

if(document.querySelector("#code-stdio") == null) {
    let dialog = document.createElement("dialog")
    dialog.id = "code-stdio"
    document.body.appendChild(dialog)

    let p = document.createElement("p")
    p.classList.add("stdio")
    dialog.appendChild(p)
}

document.querySelectorAll(".code-block").forEach(codeBlock => {
    codeBlock.querySelectorAll(".tabs > span").forEach( elem => elem.addEventListener("click", e => {
        codeBlock.querySelectorAll("code"      ).forEach(n => delete n.dataset.shown)
        codeBlock.querySelectorAll(".tabs span").forEach(n => delete n.dataset.shown)
        elem.dataset.shown = "true"
        codeBlock.querySelector(`code[data-file='${elem.innerText}']`).dataset.shown = "true"
    }))

    codeBlock.querySelector(".run").addEventListener("click", e => {
        let files = []
        codeBlock.querySelectorAll("code").forEach(c => {
            files.push({
                name: c.dataset.file,
                code: c.innerText
            })
        })
        document.querySelectorAll("code[data-global]").forEach(c => {
            files.push({
                name: c.dataset.file,
                code: c.innerText
            })
        })
        run(codeBlock.dataset.lang, files)
    })

    codeBlock.querySelector(".copy").addEventListener("click", e => {
        let text = codeBlock.querySelector("code[data-shown]").innerText
        navigator.clipboard.writeText(text.trim())
        e.target.innerText = "assignment_turned_in"
        setTimeout(() => e.target.innerText = "content_copy", 1000)
    })

    codeBlock.querySelectorAll("code").forEach(elem => elem.addEventListener("keyup", e => {
        document.dispatchEvent(new Event("render"))
    }))
})

document.addEventListener("renderend", e => {
    let codeBlock = document.querySelector("section[data-shown] .code-block")
    if(codeBlock == null) return

    let maxHeight  = 0
    let maxWidth   = codeBlock.firstElementChild.clientWidth +10

    codeBlock.querySelectorAll("code").forEach( code => {
        let display = code.style.display
        let height  = code.style.height
        let width   = code.style.width
        code.style.display = "block"
        code.style.height  = "max-content"
        code.style.width   = "max-content"
        if(maxWidth  < code.clientWidth  +14) maxWidth  = code.clientWidth  +14
        if(maxHeight < code.clientHeight +24) maxHeight = code.clientHeight +24
        code.style.display = display
        code.style.height  = height
        code.style.width   = width
    })

    codeBlock.querySelectorAll("code").forEach( code => code.style.height   = String(maxHeight-24) + "px")
    codeBlock.style.width  = String(maxWidth) + "px"
    codeBlock.style.height = String(maxHeight + 19) + "px"
})

async function run(lang, files) {
    lang = lang.toLowerCase()
    if(config.runner[lang] == null) return

    let dialog = document.querySelector("dialog#code-stdio")
    dialog.open = true
    let stdioElem = dialog.querySelector(".stdio")
    await config.runner[lang](files, stdioElem)
    dialog.open = false
}

function runJava(files, stdioElem) {}
function runSql (files, stdioElem) {}