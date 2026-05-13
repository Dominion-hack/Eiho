const express = require("express")
const path = require("path")
const fs = require("fs")

const app = express()

const PORT = 3000

app.use(express.json())
app.use(express.static("public"))

let config = {
menuImage:
"https://files.catbox.moe/jxw6jf.jpg"
}

app.get("/config", (req, res) => {
res.json(config)
})

app.post("/update-image", (req, res) => {

const { url } = req.body

config.menuImage = url

fs.writeFileSync(
"./config.json",
JSON.stringify(config, null, 2)
)

res.json({
status: true,
message: "Menu image updated"
})

})

app.post("/restart", (req, res) => {

res.json({
status: true,
message: "Bot restarting"
})

process.exit()

})

app.listen(PORT, () => {
console.log(`
╔══════════════════════╗
║ DOMINION SERVER ON ⚡
╚══════════════════════╝

Running:
http://localhost:${PORT}
`)
})