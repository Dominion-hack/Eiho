async function pairBot() {

const number =
document.getElementById("number").value

if (!number)
return alert("Enter number")

document.getElementById("result")
.innerHTML = "Generating Pair Code..."

const response = await fetch("/pair", {
method: "POST",
headers: {
"Content-Type": "application/json"
},
body: JSON.stringify({ number })
})

const data = await response.json()

document.getElementById("result")
.innerHTML =
"PAIR CODE: " + data.code

}

function toggleAdmin() {

const panel =
document.getElementById("adminPanel")

panel.style.display =
panel.style.display === "block"
? "none"
: "block"

}

function loginAdmin() {

const password =
document.getElementById("password").value

if (password === "Dominion@14") {

document.getElementById("controls")
.style.display = "block"

alert("ACCESS GRANTED ✅")

} else {

alert("WRONG PASSWORD ❌")

}

}

async function updateImage() {

const url =
document.getElementById("imgurl").value

const response =
await fetch("/update-image", {

method: "POST",

headers: {
"Content-Type": "application/json"
},

body: JSON.stringify({ url })

})

const data = await response.json()

alert(data.message)

}

async function restartBot() {

await fetch("/restart", {
method: "POST"
})

alert("Bot restarting ⚡")

}