window.ws = new WebSocket(config.codeRunnerUrl)
window.wsSend = json => {
    try {
        ws.send(JSON.stringify(json))
    } catch(e) {
        wsError
    }
}
window.wsError = (e) =>  {
    console.error(e)
    shared.codeRunnerError = true
}
ws.onerror = wsError

window.terminalElem = document.createElement("div")
terminalElem.id = "terminal"
terminalElem.classList.add("ignore-key")
document.body.appendChild(terminalElem)

window.terminal = null
window.terminalInterval = setInterval(() => {
    if(window.Terminal == null) return

    terminal = new Terminal({
        cursorBlink: true,
        fontSize: 14
    })

    terminal.open(terminalElem)
    terminal.onData(data => wsSend({
        cmd: data
    }))

    ws.onmessage = e  => terminal.write(e.data)
    ws.onerror   = e => {
        wsError(e)
        terminal.write("\r\n\r\n !!! Code-runner connection error !!!\r\n\r\n")
    }
    clearInterval(terminalInterval)
}, 200)

window.codeResize = codeBlock => {
    let maxHeight  = 0
    let maxWidth   = codeBlock.firstElementChild.clientWidth +7

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

    codeBlock.querySelectorAll("code").forEach( code => code.style.height = String(maxHeight-24) + "px")
    codeBlock.style.width  = String(maxWidth      ) + "px"
    codeBlock.style.height = String(maxHeight + 19) + "px"
}

shared.main.addEventListener("resize", e => {
    const newCols = Math.floor( shared.main.clientWidth / 9 )
    const newRows = Math.floor( shared.main.clientHeight / 18 )

    if(window.terminal != null) terminal.resize(newCols, newRows)
    wsSend({
        cols: newCols,
        rows: newRows
    })
})

shared.main.addEventListener("click", e => {
    if(window.lastClickedOn.closest("#terminal") == null &&
        e.target.closest(".run") == null) delete terminalElem.dataset.shown
})

shared.main.addEventListener("render", async e => {
delete document.querySelector("#terminal").dataset.shown

document.querySelectorAll("main > code").forEach(code => {
    let codeBlock = code.parentElement.querySelector(".code-block")
    let codeTab = document.createElement("span")
    codeTab.innerText = code.dataset.file

    if(codeBlock == null) {
        code.dataset.shown = "true"
        code.setAttribute("style", "border-radius: 0 10px 10px 10px")
        codeTab.dataset.shown = "true"

        codeBlock = document.createElement("div")
        codeBlock.classList.add("code-block", "ignore-key")
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
    codeResize(codeBlock)

    codeBlock.querySelectorAll(".tabs > span").forEach( elem => elem.addEventListener("click", e => {
        codeBlock.querySelectorAll("code"      ).forEach(n => delete n.dataset.shown)
        codeBlock.querySelectorAll(".tabs span").forEach(n => delete n.dataset.shown)
        elem.dataset.shown = "true"
        codeBlock.querySelector(`code[data-file='${elem.innerText}']`).dataset.shown = "true"
    }))

    codeBlock.querySelector(".run").addEventListener("click", e => {
        let cmd = ""
        let files = []
        document.querySelectorAll("code[data-global]").forEach(c => {
            files.push({
                name: c.dataset.file,
                code: c.innerHTML.replace(/<br>/g, "\n")
            })
        })
        codeBlock.querySelectorAll("code").forEach(c => {
            if(c.dataset.shown != null) cmd = c.dataset.cmd
            files.push({
                name: c.dataset.file,
                code: c.innerHTML.replace(/<br>/g, "\n")
            })
        })
        wsSend({
            cmd: "\x03\n clear\n" + cmd + "\n",
            files,
        })
        shared.main.dispatchEvent(new Event("resize"))
        terminalElem.dataset.shown = true
    })

    codeBlock.querySelector(".copy").addEventListener("click", e => {
        let text = codeBlock.querySelector("code[data-shown]").innerText
        navigator.clipboard.writeText(text.trim())
        e.target.innerText = "assignment_turned_in"
        setTimeout(() => e.target.innerText = "content_copy", 1000)
    })

    codeBlock.querySelectorAll("code").forEach(elem => elem.addEventListener("keyup", e => {
        document.querySelector(`#html [data-id='${elem.dataset.id}']`).innerHTML = elem.innerHTML
        shared.syncTabs(1)
        codeResize(codeBlock)
    }))
})})