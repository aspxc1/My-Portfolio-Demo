import assert from "node:assert/strict"
import { test } from "node:test"
import { getMenuKeyAction } from "../src/lib/menuKeyboard.js"

const context = { selectedIndex: 0, count: 4, insideMenu: false, interactive: false, editing: false }

test("fresh-page arrow and Enter keys work without focusing a menu link", () => {
  assert.deepEqual(getMenuKeyAction({ key: "ArrowDown" }, context), { type: "select", index: 1 })
  assert.deepEqual(getMenuKeyAction({ key: "Enter" }, context), { type: "open", index: 0 })
})

test("selection wraps and numbered shortcuts activate only existing options", () => {
  assert.deepEqual(getMenuKeyAction({ key: "ArrowUp" }, context), { type: "select", index: 3 })
  assert.deepEqual(getMenuKeyAction({ key: "4" }, context), { type: "open", index: 3 })
  assert.equal(getMenuKeyAction({ key: "5" }, context), null)
})

test("shortcuts leave links, editable fields and browser shortcuts alone", () => {
  assert.equal(getMenuKeyAction({ key: "Enter" }, { ...context, interactive: true }), null)
  assert.equal(getMenuKeyAction({ key: "ArrowDown" }, { ...context, editing: true }), null)
  assert.equal(getMenuKeyAction({ key: "1", ctrlKey: true }, context), null)
  assert.equal(getMenuKeyAction({ key: "Enter", repeat: true }, context), null)
  assert.equal(getMenuKeyAction({ key: "Home" }, context), null)
  assert.deepEqual(getMenuKeyAction({ key: "Home" }, { ...context, insideMenu: true, selectedIndex: 2 }), { type: "select", index: 0 })
})
