window.wsSend = json => {
    try {
        ws.send(JSON.stringify(json))
        shared.codeRunnerError = false
    } catch(e) {
        wsError
    }
}
window.wsError = (e) =>  {
    console.error(e)
    shared.codeRunnerError = true
}

window.ws = new WebSocket(config.codeRunnerUrl)
ws.onerror = wsError

window.terminal = {
    resize: () => {}
}

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
    if(shared.main.querySelector("code[data-cmd]") == null || window.terminal == null) return

    const newCols = Math.floor( (shared.main.clientWidth *0.9 - 12) / 8.5  )
    const newRows = Math.floor( shared.main.clientHeight*0.9 / 16 )

    terminal.resize(newCols, newRows)
    wsSend({
        cols: newCols,
        rows: newRows
    })
})

shared.main.addEventListener("render", async e => {

document.querySelectorAll("main code[data-cmd]").forEach(code => {
    let codeBlock = code.parentElement.querySelector(".code-block")
    let codeTab = document.createElement("span")
    codeTab.innerText = code.dataset.file

    if(codeBlock == null && shared.main.dataset.view != "p") {
        code.dataset.shown = "true"
        code.setAttribute("style", "border-radius: 0 10px 10px 10px")
        codeTab.dataset.shown = "true"

        codeBlock = document.createElement("div")
        codeBlock.classList.add("code-block", "ignore-key")
        code.before(codeBlock)

        let tabs = document.createElement("div")
        tabs.classList.add("tabs", "no-print")
        codeBlock.appendChild(tabs)

        let run = document.createElement("span")
        run.innerText = "play_circle"
        run.classList.add("material-symbols-outlined", "run", "no-print")
        run.style.right = "35px"
        codeBlock.appendChild(run)

        let copy = document.createElement("span")
        copy.innerText = "content_copy"
        copy.classList.add("material-symbols-outlined", "copy", "no-print")
        copy.style.right = "5px"
        codeBlock.appendChild(copy)
    }

    if(!code.dataset.hidden && shared.main.dataset.view != "p") {
        codeBlock.firstElementChild.append(codeTab)
        codeBlock.append(code)
        code.setAttribute("contenteditable", true)

    } else if(!code.dataset.hidden){
        code.before(codeTab)
    }
    code.innerText = code.innerText.trim()
})

document.querySelectorAll("main:not([data-view='p']) .code-block").forEach(codeBlock => {
    codeResize(codeBlock)

    codeBlock.querySelectorAll(".tabs > span").forEach( elem => elem.addEventListener("click", e => {
        codeBlock.querySelectorAll("code"      ).forEach(n => delete n.dataset.shown)
        codeBlock.querySelectorAll(".tabs span").forEach(n => delete n.dataset.shown)
        elem.dataset.shown = true
        codeBlock.querySelector(`code[data-file='${elem.innerText}']`).dataset.shown = true
    }))

    codeBlock.querySelector(".run").addEventListener("click", e => {
        if(window.ws.readyState != 1) window.ws = new WebSocket(config.codeRunnerUrl)

        let terminalElem = document.createElement("div")
        terminalElem.id = "terminal"
        terminalElem.classList.add("ignore-key")
        shared.main.appendChild(terminalElem)
        terminalElem.addEventListener("focusout", e => {
            terminalElem.remove()
        })
        terminalElem.focus()

        window.terminal = new Terminal({
            cursorBlink: true,
            fontSize: 14
        })
        terminal.onData(data => wsSend({
            cmd: data
        }))
        terminal.open(terminalElem)

        ws.onmessage = e => terminal != null ? terminal.write(e.data) : null
        ws.onerror   = e => {
            wsError(e)
            terminal.write("\r\n\r\n !!! Code-runner connection error !!!\r\n\r\n")
        }

        let cmd = ""
        let files = []
        document.querySelectorAll("code[data-global]").forEach(c => {
            files.push({
                name: c.dataset.file,
                code: c.innerHTML
            })
        })
        codeBlock.querySelectorAll("code").forEach(c => {
            if(c.dataset.shown != null) cmd = c.dataset.cmd
            files.push({
                name: c.dataset.file,
                code: c.innerHTML
            })
        })
        let decodeTextarea = document.createElement("textarea")
        files = files.map(file => {
            decodeTextarea.innerHTML = file.code
            decodeTextarea.value = decodeTextarea.value.replace(/<br>/g, "\n").replace(/\n\s{0,12}/g, "\n")
            file.code = decodeTextarea.value
            return file
        })
        wsSend({
            cmd: "\x03\n clear\n" + cmd + "\n",
            files,
        })
        shared.main.dispatchEvent(new Event("resize"))
    })

    codeBlock.querySelector(".copy").addEventListener("click", e => {
        let text = codeBlock.querySelector("code[data-shown]").innerText
        navigator.clipboard.writeText(text.trim())
        e.target.innerText = "assignment_turned_in"
        setTimeout(() => e.target.innerText = "content_copy", 1000)
    })

    codeBlock.querySelectorAll("code").forEach(elem => elem.addEventListener("keyup", e => {
        document.querySelector(`#html-body [data-id='${elem.dataset.id}']`).innerHTML = elem.innerHTML
        codeResize(codeBlock)
    }))
})})