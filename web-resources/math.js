shared.main.addEventListener("render", e => {

document.querySelectorAll("main math").forEach(mathElem => {
    let mathBlock = document.createElement("div")
    mathBlock.classList.add("math-block")
    mathElem.before(mathBlock)

    let copy = document.createElement("span")
    copy.innerText = "content_copy"
    copy.classList.add("material-symbols-outlined", "copy")
    mathBlock.appendChild(copy)

    let outElem = document.createElement("span")
    katex.render(mathElem.textContent, outElem, {
        throwOnError: false
    })
    mathElem.dataset.text = mathElem.textContent.replace(/\s+/g, "")
    mathElem.innerHTML = outElem.querySelector("math").innerHTML
    mathBlock.appendChild(mathElem)

    mathBlock.querySelector(".copy").addEventListener("click", e => {
        navigator.clipboard.writeText(mathElem.dataset.text)
        e.target.innerText = "assignment_turned_in"
        setTimeout(() => e.target.innerText = "content_copy", 1000)
    })
})})