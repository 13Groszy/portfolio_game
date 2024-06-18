export function setCamScale(k) {
    // resize camera scale based on screen size
    const resizeFactor = k.width() / k.height();
    if (resizeFactor < 1) {
      k.camScale(k.vec2(1));
    } else {
      k.camScale(k.vec2(1.5));
    }
}
export function displayDialogue(text, onDisplayEnd) {
    // render dialogue text
    const dialogueUI = document.querySelector(".textbox-container");
    const dialogue = document.querySelector(".dialogue");
    const canvas = document.querySelector("canvas#game");

    dialogueUI.style.display = "flex";
    let index = 0;
    let currentText = "";
    const intervalRef = setInterval(() => {
      if (index < text.length) {
        currentText += text[index];
        dialogue.innerHTML = currentText;
        index++;
        return;
      }
      clearInterval(intervalRef);
    }, 1);

    function onCloseBtnClick() {
      onDisplayEnd();
      dialogueUI.style.display = "none";
      dialogue.innerHTML = "";
      clearInterval(intervalRef);
      closeBtn.removeEventListener("click", onCloseBtnClick);
      canvas.focus();
    }

    const closeBtn = document.querySelector(".ui-close-btn");

    closeBtn.addEventListener("click", onCloseBtnClick);

    addEventListener("keypress", (key) => {
      if (key.code === "Enter") {
        onCloseBtnClick();
      }
    });
}