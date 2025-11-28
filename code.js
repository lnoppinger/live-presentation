document.addEventListener("render", e => {

document.querySelectorAll("main > code").forEach(code => {
    let codeBlock = code.parentElement.querySelector(".code-block")
    let codeTab = document.createElement("span")
    codeTab.innerText = code.dataset.file

    if(codeBlock == null) {
        maxHeight = 0
        maxWidth  = 0

        code.dataset.shown = "true"
        code.setAttribute("style", "border-radius: 0 10px 10px 10px")
        codeTab.dataset.shown = "true"

        codeBlock = document.createElement("div")
        codeBlock.classList.add("code-block", "ignore-key-down")
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
        codeBlock.firstElementChild.append(codeTab.cloneNode(true))
        codeBlock.append(codeTab)
    }
    codeBlock.append(code)
    code.innerText = code.innerText.trim()
    code.setAttribute("contenteditable", true)
})

document.querySelectorAll("main .code-block").forEach(codeBlock => {
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
        if(elem == null) elem = document.querySelector("main code[data-shown]")

        let sel = window.getSelection()
        if(sel.rangeCount < 1) return
        let range = sel.getRangeAt(0)

        let id = elem.dataset.id
        let startOffset = range.startOffset
        let endOffset   = range.endOffset
        let startElemIndex, endElemIndex
        elem.childNodes.forEach((node, i) => {
            if(range.startContainer == node) startElemIndex = i
            if(range.endContainer   == node) endElemIndex   = i
        })

        document.querySelector(`#html [data-id='${elem.dataset.id}']`).innerHTML = elem.innerHTML
        config.section.syncTabs(1)
        sel.removeAllRanges()
        
        let elemNew = document.querySelector(`main code[data-id='${id}']`)
        let newRange = document.createRange()
        newRange.setStart(startElemIndex == null ? elemNew : elemNew.childNodes[startElemIndex], startOffset)
        newRange.setEnd(  endElemIndex   == null ? elemNew : elemNew.childNodes[endElemIndex  ], endOffset  )
        sel.addRange(newRange)
    }))
})})

if(config.code.java == null) config.code.java = (files) => {}
if(config.code.sql  == null) config.code.sql  = (files) => {}