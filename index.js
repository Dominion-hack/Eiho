const {
default: makeWASocket,
useMultiFileAuthState,
DisconnectReason,
fetchLatestBaileysVersion,
makeInMemoryStore
} = require("@whiskeysockets/baileys")

const P = require("pino")

const fs = require("fs")

async function startBot() {

const { state, saveCreds } =
await useMultiFileAuthState("./session")

const { version } =
await fetchLatestBaileysVersion()

const sock = makeWASocket({
version,
logger: P({ level: "silent" }),
printQRInTerminal: true,
auth: state
})

sock.ev.on("creds.update", saveCreds)

sock.ev.on("connection.update", async (update) => {

const { connection, lastDisconnect } = update

if (connection === "close") {

const shouldReconnect =
lastDisconnect?.error?.output?.statusCode
!== DisconnectReason.loggedOut

console.log("Connection closed.")

if (shouldReconnect) {
startBot()
}

} else if (connection === "open") {

console.log("BOT CONNECTED ✅")

}
})

sock.ev.on("messages.upsert", async ({ messages }) => {

try {

const m = messages[0]

if (!m.message) return

const from = m.key.remoteJid

const isGroup = from.endsWith("@g.us")

const sender = isGroup
? m.key.participant
: from

const body =
m.message.conversation ||
m.message.extendedTextMessage?.text ||
""

const prefix = "."

const isCmd = body.startsWith(prefix)

if (!isCmd) return

const args = body.slice(prefix.length).trim().split(/ +/)

const command = args.shift().toLowerCase()

const q = args.join(" ")

const Reply = (text) => {
sock.sendMessage(from, {
text
}, { quoted: m })
}

const groupMetadata =
isGroup
? await sock.groupMetadata(from)
: {}

const participants =
isGroup
? groupMetadata.participants
: []

const groupAdmins =
isGroup
? participants
.filter(v => v.admin !== null)
.map(v => v.id)
: []

const isAdmins =
groupAdmins.includes(sender)

const isBotAdmins =
isGroup
? groupAdmins.includes(sock.user.id)
: false

switch(command) {

case "ping": {
Reply("Pong 🏓")
}
break;

case "alive": {
Reply("I am alive and running ⚡")
}
break;

case "menu": {
Reply(`
╭━━〔 DOMINION BOT 〕━━⬣
┃➤ .ping
┃➤ .alive
┃➤ .owner
┃➤ .runtime
┃➤ .uptime
┃➤ .tagall
┃➤ .hidetag
┃➤ .kick
┃➤ .add
┃➤ .promote
┃➤ .demote
┃➤ .delete
┃➤ .quote
┃➤ .joke
┃➤ .react
┃➤ .spam
┃➤ .vv
┃➤ .repo
┃➤ .restart
┃➤ .shutdown
╰━━━━━━━━━━━━━━⬣
`)
}
break;

case "owner": {
Reply("My owner is Dominion 👑")
}
break;

case "runtime": {

const runtime = process.uptime()

const hours = Math.floor(runtime / 3600)

const minutes =
Math.floor((runtime % 3600) / 60)

const seconds =
Math.floor(runtime % 60)

Reply(
`⏰ Runtime:
${hours}h ${minutes}m ${seconds}s`
)

}
break;

case "uptime": {

const uptime = process.uptime()

const hours = Math.floor(uptime / 3600)

const minutes =
Math.floor((uptime % 3600) / 60)

const seconds =
Math.floor(uptime % 60)

Reply(
`⚡ Uptime:
${hours} Hours
${minutes} Minutes
${seconds} Seconds`
)

}
break;

case "tagall": {

if (!isGroup)
return Reply("Group only ❌")

let teks =
"📢 Tagging Everyone\n\n"

let members =
participants.map(v => v.id)

for (let mem of members) {

teks +=
`➤ @${mem.split("@")[0]}\n`

}

sock.sendMessage(from, {
text: teks,
mentions: members
})

}
break;

case "hidetag": {

if (!isGroup)
return Reply("Group only ❌")

sock.sendMessage(from, {
text: q ? q : "Hidden Tag 👻",
mentions: participants.map(a => a.id)
})

}
break;

case "kick": {

if (!isGroup)
return Reply("Group only ❌")

if (!isAdmins)
return Reply("Admin only ❌")

if (!isBotAdmins)
return Reply("Bot must be admin ❌")

let users = m.message.extendedTextMessage
?.contextInfo?.mentionedJid

if (!users)
return Reply("Tag user")

await sock.groupParticipantsUpdate(
from,
users,
"remove"
)

Reply("User kicked ✅")

}
break;

case "add": {

if (!isGroup)
return Reply("Group only ❌")

if (!isAdmins)
return Reply("Admin only ❌")

if (!q)
return Reply("Enter number")

let number =
q.replace(/[^0-9]/g, "") +
"@s.whatsapp.net"

await sock.groupParticipantsUpdate(
from,
[number],
"add"
)

Reply("User added ✅")

}
break;

case "promote": {

if (!isGroup)
return Reply("Group only ❌")

let users = m.message.extendedTextMessage
?.contextInfo?.mentionedJid

await sock.groupParticipantsUpdate(
from,
users,
"promote"
)

Reply("Promoted successfully 👑")

}
break;

case "demote": {

if (!isGroup)
return Reply("Group only ❌")

let users = m.message.extendedTextMessage
?.contextInfo?.mentionedJid

await sock.groupParticipantsUpdate(
from,
users,
"demote"
)

Reply("Demoted successfully 📉")

}
break;

case "delete": {

if (!m.message.extendedTextMessage)
return Reply("Reply to message")

sock.sendMessage(from, {
delete:
m.message.extendedTextMessage.contextInfo.stanzaId
})

}
break;

case "quote": {

const quotes = [
"Never give up 💪",
"Success is coming ⚡",
"Dream big 🌍",
"Code your future 👨‍💻"
]

Reply(
quotes[
Math.floor(Math.random() * quotes.length)
]
)

}
break;

case "joke": {

const jokes = [
"Why do programmers hate nature? Too many bugs 😂",
"What is a computer’s favorite snack? Microchips 😹",
"Why did JavaScript cry? Because it saw undefined 😭"
]

Reply(
jokes[
Math.floor(Math.random() * jokes.length)
]
)

}
break;

case "react": {

if (!m.message.extendedTextMessage)
return Reply("Reply to message")

sock.sendMessage(from, {
react: {
text: "🔥",
key:
m.message.extendedTextMessage.contextInfo
}
})

}
break;

case "spam": {

if (!q)
return Reply("Enter text")

for (let i = 0; i < 5; i++) {
Reply(q)
}

}
break;

case "vv": {

Reply("View once remover activated 👀")

}
break;

case "repo": {

Reply("GitHub Repo:\nhttps://github.com/DominionBot")

}
break;

case "restart": {

Reply("Restarting bot 🔄")

process.exit()

}
break;

case "shutdown": {

Reply("Shutting down bot 🛑")

process.exit()

}
break;

default:
Reply("Unknown command ❌")

}

} catch (err) {

console.log(err)

}

})

}

startBot()