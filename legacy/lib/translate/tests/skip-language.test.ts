import type { LangCode } from "@/types/lang"
import { beforeEach, describe, expect, it, vi } from "vitest"
import contentManager from "@/lib/content"
import translateText from "../core/translate-text"

vi.mock("@/lib/content", () => ({
  default: {
    detectLangCode: vi.fn(),
  },
}))

const mockedDetect = vi.mocked(contentManager.detectLangCode)

beforeEach(() => {
  mockedDetect.mockReset()
})

describe("shouldSkipLang", () => {
  describe("basic skip logic", () => {
    it("should return true when detected language is in skipLanguages", async () => {
      mockedDetect.mockResolvedValueOnce("jpn")

      const japaneseText = "これは日本語のテストです。日本語で書かれたテキストです。"
      const skipLanguages: LangCode[] = ["jpn"]

      const result = await translateText.shouldSkipLang(
        japaneseText,
        skipLanguages,
        false,
      )

      expect(result).toBe(true)
    })

    it("should return false when detected language is not in skipLanguages", async () => {
      mockedDetect.mockResolvedValueOnce("eng")

      const englishText = "This is a test written in English."
      const skipLanguages: LangCode[] = ["jpn"]

      const result = await translateText.shouldSkipLang(
        englishText,
        skipLanguages,
        false,
      )

      expect(result).toBe(false)
    })

    it("should return false when skipLanguages is empty", async () => {
      mockedDetect.mockResolvedValueOnce("jpn")

      const japaneseText = "これは日本語のテストです。日本語で書かれたテキストです。"
      const skipLanguages: LangCode[] = []

      const result = await translateText.shouldSkipLang(
        japaneseText,
        skipLanguages,
        false,
      )

      expect(result).toBe(false)
    })

    it("should return false when language cannot be detected", async () => {
      mockedDetect.mockResolvedValueOnce(null)

      const undetectableText = "12345 67890 !@#$%"
      const skipLanguages: LangCode[] = ["jpn", "eng"]

      const result = await translateText.shouldSkipLang(
        undetectableText,
        skipLanguages,
        false,
      )

      expect(result).toBe(false)
    })
  })

  describe("with LLM detection enabled", () => {
    it("should use LLM detection when enabled", async () => {
      mockedDetect.mockResolvedValueOnce("jpn")

      const text = "これは日本語のテストです。日本語で書かれたテキストです。"
      const skipLanguages: LangCode[] = ["jpn"]

      const result = await translateText.shouldSkipLang(
        text,
        skipLanguages,
        true,
      )

      expect(mockedDetect).toHaveBeenCalledWith(text, {
        minLength: 10,
        enableLLM: true,
      })
      expect(result).toBe(true)
    })

    it("should return false when detectLangCode returns null", async () => {
      mockedDetect.mockResolvedValueOnce(null)

      const japaneseText = "これは日本語のテストです。日本語で書かれたテキストです。"
      const skipLanguages: LangCode[] = ["jpn"]

      const result = await translateText.shouldSkipLang(
        japaneseText,
        skipLanguages,
        true,
      )

      expect(mockedDetect).toHaveBeenCalled()
      expect(result).toBe(false)
    })

    it("should pass LLM options to detectLangCode", async () => {
      mockedDetect.mockResolvedValueOnce("jpn")

      const japaneseText = "これは日本語のテストです。日本語で書かれたテキストです。"
      const skipLanguages: LangCode[] = ["jpn"]

      await translateText.shouldSkipLang(
        japaneseText,
        skipLanguages,
        true,
      )

      expect(mockedDetect).toHaveBeenCalledWith(japaneseText, {
        minLength: 10,
        enableLLM: true,
      })
    })
  })
})
