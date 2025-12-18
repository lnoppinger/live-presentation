shared.main.addEventListener("render", e => {

document.querySelectorAll("main math").forEach(mathElem => {
    let outElem = document.createElement("span")
    katex.render(mathElem.textContent, outElem, {
        throwOnError: false
    })
    mathElem.dataset.text = mathElem.textContent.replace(/\s+/g, "")
    mathElem.innerHTML = outElem.querySelector("math").innerHTML
    mathElem.style.margin = "20px"
    mathElem.style.cursor = "copy"

    mathElem.addEventListener("click", e => {
        navigator.clipboard.writeText(mathElem.dataset.text)
    })
})})