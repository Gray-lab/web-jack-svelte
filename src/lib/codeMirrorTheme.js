import { EditorView } from "codemirror"

export let myTheme = EditorView.theme({
    "&": {
      color: "rgb(0, 255, 0)",
      backgroundColor: "rgb(32, 32, 32)"
    },
    ".cm-content": {
      caretColor: "rgb(0, 255, 0)"
    },
    "&.cm-focused .cm-cursor": {
      borderLeftColor: "rgb(20, 20, 20)"
    },
    "&.cm-focused .cm-selectionBackground, ::selection": {
      backgroundColor: "rgb(70, 70, 70)"
    },
    ".cm-gutters": {
      backgroundColor: "rgb(32, 32, 32)",
      color: "#e3e3e3",
      border: "1px solid black"
    }
  }, {dark: true})