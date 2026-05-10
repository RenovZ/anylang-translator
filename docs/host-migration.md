# read-frog → anylang 迁移文档

本文档记录从 `read-frog/src/utils/host` 迁移到当前项目的完整过程，包括：

- 目录映射
- 重命名对照（常量 / 方法）
- 架构适配说明

---

## 目录结构映射

### DOM 层

| read-frog 源文件   | web 目标文件               | 类名           |
| ------------------ | -------------------------- | -------------- |
| `dom/batch-dom.ts` | `src/lib/dom/batch-dom.ts` | `DomBatcher`   |
| `dom/filter.ts`    | `src/lib/dom/filter.ts`    | `DomFilter`    |
| `dom/find.ts`      | `src/lib/dom/find.ts`      | `DomFind`      |
| `dom/node.ts`      | `src/lib/dom/node.ts`      | `DomNode`      |
| `dom/style.ts`     | `src/lib/dom/style.ts`     | `DomStyle`     |
| `dom/traversal.ts` | `src/lib/dom/traversal.ts` | `DomTraversal` |
| _(web-specific)_   | `src/lib/dom/constants.ts` | — 纯常量       |
| _(web-specific)_   | `src/lib/dom/prune.ts`     | `DomPrune`     |

### Translate 层

| read-frog 源文件                         | web 目标文件                                      | 类名                   | 备注                                                |
| ---------------------------------------- | ------------------------------------------------- | ---------------------- | --------------------------------------------------- |
| `translate/auto-translation.ts`          | `src/lib/translate/auto-translation.ts`           | `AutoTranslation`      | 适配 `autoAppliedSites/Langs`                       |
| `translate/execute-translate.ts`         | `src/lib/translate/execute-translate.ts`          | `ExecuteTranslate`     | `api/*` 调用为 TODO stub                            |
| `translate/filter-small-paragraph.ts`    | `src/lib/translate/filter-small-paragraph.ts`     | `FilterSmallParagraph` | 新增 config 字段                                    |
| `translate/node-manipulation.ts`         | 合并至 `src/lib/translate/translate-variants.ts`  | `TranslateVariants`    |                                                     |
| `translate/text-preparation.ts`          | `src/lib/translate/text-preparation.ts`           | `TextPreparation`      |                                                     |
| `translate/translate-text.ts`            | `src/lib/translate/core/translate-text.ts`        | `TranslateText`        | `Sha256Hex` → `hashCode`；`enqueueTranslateRequest` |
| `translate/translate-variants.ts`        | `src/lib/translate/translate-variants.ts`         | `TranslateVariants`    | 含 `translateTextForPage/Title/Input`               |
| `translate/translation-attributes.ts`    | `src/lib/translate/ui/translation-dir.ts`         | `TranslationDir`       |                                                     |
| `translate/webpage-content.ts`           | `src/lib/translate/webpage-content.ts`            | `WebpageContent`       |                                                     |
| `translate/webpage-context.ts`           | `src/lib/translate/webpage-context.ts`            | `WebpageContext`       | `removeDummyNodes` → `domPrune.prune()`             |
| `translate/webpage-summary.ts`           | `src/lib/translate/webpage-summary.ts`            | `WebpageSummary`       |                                                     |
| `translate/core/translation-modes.ts`    | `src/lib/translate/core/translation-modes.ts`     | `TranslationModes`     |                                                     |
| `translate/core/translation-state.ts`    | `src/lib/translate/core/translation-state.ts`     | `TranslationState`     |                                                     |
| `translate/core/translation-walker.ts`   | `src/lib/translate/core/translation-walker.ts`    | `TranslationWalker`    |                                                     |
| `translate/dom/translation-cleanup.ts`   | `src/lib/translate/dom/translation-cleanup.ts`    | `TranslationCleanup`   |                                                     |
| `translate/dom/translation-insertion.ts` | `src/lib/translate/core/translation-insertion.ts` | `TranslationInsertion` | 路径层级调整                                        |
| `translate/dom/translation-wrapper.ts`   | `src/lib/translate/dom/translation-wrapper.ts`    | `TranslationWrapper`   |                                                     |
| `translate/ui/decorate-translation.ts`   | `src/lib/translate/ui/decorate-translation.ts`    | `DecorateTranslation`  |                                                     |
| `translate/ui/spinner.ts`                | `src/lib/translate/ui/spinner.ts`                 | `TranslationSpinner`   |                                                     |
| `translate/ui/style-injector.ts`         | `src/lib/translate/ui/style-injector.ts`          | `StyleInjector`        |                                                     |
| `translate/ui/translation-utils.ts`      | `src/lib/translate/ui/translation-utils.ts`       | `TranslationUtils`     |                                                     |

### 配套新增（web 项目特有）

| 文件                     | 类名       | 说明                                                                                                    |
| ------------------------ | ---------- | ------------------------------------------------------------------------------------------------------- |
| `src/lib/url.ts`         | `UrlUtils` | `matchDomainPattern`                                                                                    |
| `src/types/content.ts`   | —          | 新增 `WebPageContext`、`CachedWebPageContext`、`WebPagePromptContext`                                   |
| `src/types/translate.ts` | —          | 新增 `TranslationNodeStyleConfig`、`InputTranslationLang`                                               |
| `src/types/config.ts`    | —          | `featureQuickTranslateSchema.translate` 新增 `minCharactersPerNode`、`minWordsPerNode`、`skipLanguages` |
| `src/preset/dom.ts`      | —          | 新增 `TRANS_STYLE_ATTR`、`TRANS_STYLE_KEY`                                                              |
| `src/lib/protocol.ts`    | —          | 新增 `enqueueTranslateRequest`、`getSummary`                                                            |

---

## 重命名对照

### DOM 常量

| 原名                                          | 新名                            | 文件                               |
| --------------------------------------------- | ------------------------------- | ---------------------------------- |
| `CUSTOM_DONT_WALK_INTO_ELEMENT_SELECTOR_MAP`  | `SITE_SKIP_SELECTOR_MAP`        | `dom/constants.ts`                 |
| `CUSTOM_FORCE_BLOCK_TRANSLATION_SELECTOR_MAP` | `SITE_FORCE_BLOCK_SELECTOR_MAP` | `dom/constants.ts`                 |
| `DONT_WALK_AND_TRANSLATE_TAGS`                | `SKIP_TAGS`                     | `dom/constants.ts`                 |
| `DONT_WALK_BUT_TRANSLATE_TAGS`                | `OPAQUE_TAGS`                   | `dom/constants.ts`                 |
| `FORCE_INLINE_TRANSLATION_TAGS`               | `FORCE_INLINE_TAGS`             | `dom/constants.ts`                 |
| `MAIN_CONTENT_IGNORE_TAGS`                    | `NOISE_TAGS`                    | `dom/constants.ts`                 |
| `CUSTOM_TRANSLATION_NODE_ATTRIBUTE`           | `TRANS_STYLE_ATTR`              | `preset/dom.ts`                    |
| `CUSTOM_TRANSLATION_NODE_DATASET_KEY`         | `TRANS_STYLE_KEY`               | `preset/dom.ts`                    |
| `WEB_PAGE_CONTENT_CHAR_LIMIT`                 | `CONTENT_LIMIT`                 | `translate/webpage-content.ts`     |
| `MIN_LENGTH_FOR_SKIP_LLM_DETECTION`           | `MIN_SKIP_LEN`                  | `translate/core/translate-text.ts` |
| `MIN_LENGTH_FOR_TARGET_LANG_DETECTION`        | `MIN_LANG_DETECT_LEN`           | `translate/translate-variants.ts`  |

### DOM 方法（`DomFilter`）

| 原名                                           | 新名               | 说明                 |
| ---------------------------------------------- | ------------------ | -------------------- |
| `isDontWalkIntoAndDontTranslateAsChildElement` | `isSkipped`        | 完全跳过（不走不翻） |
| `isDontWalkIntoButTranslateAsChildElement`     | `isOpaque`         | 不走入但作为整体翻译 |
| `isCustomDontWalkIntoElement`                  | `isSiteSkipped`    | 站点自定义跳过       |
| `isCustomForceBlockTranslation`                | `isSiteForceBlock` | 站点自定义强制块级   |
| `isShallowInlineHTMLElement`                   | `isInlineEl`       | 浅层判断：行内元素   |
| `isShallowBlockHTMLElement`                    | `isBlockEl`        | 浅层判断：块级元素   |
| `isShallowInlineTransNode`                     | `isInlineNode`     | 浅层判断：行内节点   |
| `isTranslatedWrapperNode`                      | `isWrapper`        | 是否为译文包裹层     |
| `isTranslatedContentNode`                      | `isTransContent`   | 是否为译文内容节点   |
| `isForceInlineTranslation`                     | `isForceInline`    | 是否强制行内翻译     |
| `isInsideContentContainer`                     | `inMainContent`    | 是否在主内容区域内   |

### DOM 方法（`DomFind`）

| 原名                              | 新名              | 说明                 |
| --------------------------------- | ----------------- | -------------------- |
| `findNearestAncestorBlockNodeAt`  | `blockNodeAt`     | 根据坐标找最近块节点 |
| `findNearestAncestorBlockNodeFor` | `blockNodeFor`    | 根据元素找最近块节点 |
| `unwrapDeepestOnlyHTMLChild`      | `deepSingleChild` | 向下穿透唯一子节点   |

### Translate 方法

| 原名                                  | 新名                  | 文件                            | 说明         |
| ------------------------------------- | --------------------- | ------------------------------- | ------------ |
| `translateNodes`                      | `run`                 | `translation-modes.ts`          | 模式调度入口 |
| `translateNodesBilingualMode`         | `bilingual`           | `translation-modes.ts`          |              |
| `translateNodeTranslationOnlyMode`    | `translationOnly`     | `translation-modes.ts`          |              |
| `removeTranslatedWrapperWithRestore`  | `restoreWrapper`      | `translation-cleanup.ts`        |              |
| `removeShadowHostInTranslatedWrapper` | `cleanWrapper`        | `translation-cleanup.ts`        |              |
| `removeAllTranslatedWrapperNodes`     | `removeAllWrappers`   | `translation-cleanup.ts`        |              |
| `findPreviousTranslatedWrapperInside` | `findWrapper`         | `translation-wrapper.ts`        |              |
| `insertTranslatedNodeIntoWrapper`     | `insertTranslation`   | `translation-insertion.ts`      |              |
| `validateTranslationConfigAndToast`   | `validateConfig`      | `translate-variants.ts`         |              |
| `shouldEnableAutoTranslation`         | `shouldAutoTranslate` | `auto-translation.ts`           |              |
| `shouldFilterSmallParagraph`          | `isSmallParagraph`    | `filter-small-paragraph.ts`     |              |
| `getOrCreateWebPageContext`           | `getContext`          | `webpage-context.ts`            |              |
| `getOrGenerateWebPageSummary`         | `getSummary`          | `webpage-summary.ts` + Protocol |              |
| `truncateWebPageContent`              | `truncate`            | `webpage-content.ts`            |              |
| `shouldSkipByLanguage`                | `shouldSkipLang`      | `translate-text.ts`             |              |
| `normalizePromptContextValue`         | `normalizeVal`        | `translate-text.ts`             |              |
| `normalizeWebPagePromptContext`       | `normalizeCtx`        | `translate-text.ts`             |              |
| `isTextAlreadyInTargetLanguage`       | `isTargetLang`        | `translate-variants.ts`         | private      |
| `getWebPagePromptContext`             | `getPageContext`      | `translate-variants.ts`         | private      |
| `translateTextUsingPageConfig`        | `doTranslatePage`     | `translate-variants.ts`         | private      |
| `resolveInputLang`                    | `resolveLang`         | `translate-variants.ts`         | private      |

---

## 架构适配说明

### 1. 语言码

read-frog 使用 ISO 639-3（如 `eng`、`zho`），web 项目使用 BCP-47（如 `en`、`zh-CN`）。
涉及语言码的函数已按 web 项目的 `LangCode` 类型适配。

### 2. 哈希

read-frog 使用 `Sha256Hex(...args)` 生成多参数 SHA-256 哈希。
web 项目使用 `hashCode(str)` DJB2 变体，调用前先将所有参数 join 为单字符串：

```ts
hashCode(hashComponents.join('|'));
```

### 3. DOM 清洗

read-frog 的 `removeDummyNodes(doc)` 替换为 `domPrune.prune(doc)`，效果等价。

### 4. 翻译 API 路由

read-frog 通过 `executeTranslate` 直接调用各 `translate/api/*` 模块。
web 项目通过 background 消息 `enqueueTranslateRequest` 统一路由，内容脚本不持有 API Key。
`execute-translate.ts` 中的 provider 分支目前为 TODO stub，待 `translate/api/*` 实现后接入。

### 5. Provider 类型判断

read-frog 使用 `isLLMProviderConfig(providerConfig)`。
web 项目以 `providerConfig.type !== 'free'` 代替（free 类型为非 AI provider）。

### 6. 自动翻译配置

| read-frog 字段                                 | web 字段                                               |
| ---------------------------------------------- | ------------------------------------------------------ |
| `config.translate.page.autoTranslatePatterns`  | `config.quickTranslate.autoAppliedSites`               |
| `config.translate.page.autoTranslateLanguages` | `config.quickTranslate.autoAppliedLangs`               |
| `config.translate.page.minCharactersPerNode`   | `config.quickTranslate.translate.minCharactersPerNode` |
| `config.translate.page.minWordsPerNode`        | `config.quickTranslate.translate.minWordsPerNode`      |
| `config.translate.page.skipLanguages`          | `config.quickTranslate.translate.skipLanguages`        |

### 7. 排除的模块

以下 read-frog 模块**未迁移**（按约定）：

- `__tests__/` — 测试文件
- `translate/api/` — 翻译 API 实现（Google、Microsoft、DeepL、OpenAI 等）
