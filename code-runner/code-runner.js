#!/usr/bin/env node
const WebSocket = require("ws")
const os = require("os")
const path = require("path")
const fs = require("fs")
const pty = require("node-pty")

const wss = new WebSocket.Server({
    port: 8765,
    host: "localhost"
})

let shellCmd = "/bin/bash"
if (os.platform() === "win32") shellCmd = "cmd.exe"

const ptyProcess = pty.spawn(shellCmd, [], {
    name: 'xterm-color',
    cols: 80,
    rows: 30,
    cwd: __dirname,
    env: process.env
})
ptyProcess.on("data", data => {
    wss.clients.forEach(ws => {
        if (ws.readyState === WebSocket.OPEN) ws.send(data.replace(/\n/g, "\r\n"))
    })
})

wss.on("connection", ws => {
    ws.on("message", msg => {
        let data
        try {
            data = JSON.parse(msg)
        } catch {
            return
        }

        if(data.cmd == null) data.cmd = ""

        if(process.platform == 'win32') {
            data.cmd = data.cmd.replace(/\n/g, "\r").replace(/clear\r/g, "cls\r")
        } else {
            data.cmd = data.cmd.replace(/\r/g, "\n")
        }

        if (data.cols != null && data.rows != null) {
            ptyProcess.resize(data.cols, data.rows)
        }

        if(data.files == null) data.files = []
        for (const file of data.files) {
            const filepath = path.join(__dirname, file.name || "noname.txt")
            fs.writeFileSync(filepath, file.code || "", "utf8")
        }

        ptyProcess.write(data.cmd)
    })
})

console.log(`Shell WebSocket server running on ws://localhost:${wss.options.port}`)
