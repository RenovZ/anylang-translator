import { describe, expect, it } from "vitest"
import contentManager from "../content"

describe("getLangDirection", () => {
  it("returns rtl and mapped lang for Arabic", () => {
    expect(contentManager.getLangDirection("arb")).toEqual({ dir: "rtl", lang: "ar" })
  })

  it("returns rtl for Hebrew", () => {
    const result = contentManager.getLangDirection("heb")

    expect(result.dir).toBe("rtl")
    expect(result.lang).toBe("he")
  })

  it("returns ltr and mapped lang for English", () => {
    expect(contentManager.getLangDirection("eng")).toEqual({ dir: "ltr", lang: "en" })
  })
})
