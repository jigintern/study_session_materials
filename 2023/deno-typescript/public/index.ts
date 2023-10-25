/// <reference lib="dom"/>
import { sum } from "./sum.ts";

const message = await fetch("/welcome-message");
const element = document.querySelector("body");
if (element !== null) {
  element.innerHTML =
    `<h1>${await message.text()}</h1>` + `<p>${sum(123, 456)}</p>`;
}
