const { ipcRenderer } = require("electron");

window.addEventListener("DOMContentLoaded", () => {
    let userInput = document.querySelector("#userinput");
    let preview = document.querySelector("#preview");
    let save = document.querySelector("#save");
    let load = document.querySelector("#load");

    userInput.addEventListener("input", () => {
        preview.innerHTML = parseMD(userInput.value);
    });

    save.addEventListener("click", () => {
        // save file dialog
        ipcRenderer.send("save", userInput.value);
    });

    load.addEventListener("click", () => {
        // open file
        ipcRenderer.send("load");
    });

    ipcRenderer.on("read", (event, { content }) => {
        // Load Fie contents into app
        userInput.value = content;
        preview.innerHTML = parseMD(content);
    });
});

/**
 * VSCode Intellisense
 *
 * @param {String} markdown
 * @returns
 */
function parseMD(markdown) {
    markdown = markdown
        // Escape HTML
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/\"/g, "&quot;")
        .replace(/\'/g, "&apos;")

        // Replace bold
        .replace(/\*\*(.+)\*\*/g, "<b>$1</b>")
        .replace(/__(.+)__/g, "<b>$1</b>")

        // Replace italic
        .replace(/\*(.+)\*/g, "<i>$1</i>")

        // Replace strikethrough
        .replace(/~~(.+)~~/g, "<s>$1</s>")

        // Replace Images
        .replace(
            /!\[(.+)\]\((https?:\/\/.+\..+)\)/gi,
            "<img src='$2' alt='$1' />"
        )

        // Replace links
        .replace(
            /\[(.+)\]\((https?:\/\/.+\..+\))/gi,
            "<a href='$2' target='_blank'>$1</a>"
        )

        // Replace block quotes
        .replace(/^>(.*)$/gm, "<blockquote>$1</blockquote>")

        // Ordered lists
        .replace(/^\d\.(.*)$/gm, "<ol><li>$1</li></ol>")

        // Unordered lists
        .replace(/^(\*|\-)(.*)$/gm, "<ul><li>$2</li></ul>");

    // Split Markdown in order to make Headers work
    let lines = markdown.split("\n");
        
    for (let i = 0; i < lines.length; i++) {
        // Replace old lines with the processed ones
        lines[i] = lines[i]
            // Replace Headers
            .replace(/^(#{1,6})\s(.+)$/m, (matched, hashes, text) => {
                return `<h${hashes.length}>${text}</h${hashes.length}>`;
            });
    }

    // Fix New Lines not working in the HTML
    let processedMarkdown = lines.join("<br>");

    return processedMarkdown
        // Fix Header Spacing
        .replace(/(<\/h[1-6]>)<br>/gi, "$1")

        // Make blockquotes appear correctly
        .replace(/<\/blockquote>(\n?<br>\n?|\n)<blockquote>/gi, "<br>")

        // Make Ordered lists number correctly
        .replace(/<\/ol>(\n?<br>\n?|\n)<ol>/gi, "<br>")
        
        // Fix unordered lists
        .replace(/<\/ul>(\n?<br>\n?|\n)<ul>/gi, "<br>");
}
