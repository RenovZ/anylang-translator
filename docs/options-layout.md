# Options Page — Layout & Height Constraint Chain

## 目标

- `body` 锁死在视口，页面整体不产生滚动（消除 macOS/iOS 的 rubber-band bounce）
- Sidebar 和主内容区各自独立滚动
- Section 内部：标题固定，只有内容列表区域滚动

---

## 约束链

```
<body>                              main.ts
  h-screen overflow-hidden          → 高度恰好等于视口，禁止 body 级滚动
  flex flex-col                     → 子元素纵向排列

  ├── <header>                      Main.svelte
  │     shrink-0                    → 不参与 flex 拉伸，保持自身高度
  │     sticky top-0 z-99           → 吸顶（在 body flex 流中仍有效）
  │
  └── <main>                        Main.svelte
        flex-1 min-h-0              → 占满 header 之外的全部剩余高度
        grid sm:grid-cols-[240px_1fr] → 两列布局

        ├── <aside>                 Main.svelte  [grid 第 1 列]
        │     min-h-0              → 允许 grid 子项被压缩到格子高度内 *
        │     overflow-y-auto      → 超出时独立滚动

        └── <activeNav.component>  Main.svelte  [grid 第 2 列]
              直接渲染，无额外包装
              │
              └── <section>        Section.svelte
                    h-full min-h-0 → 撑满 grid 格子高度，同时允许被压缩 *
                    flex flex-col  → 纵向分为"标题区"和"内容区"

                    ├── <div>  (header)
                    │     shrink-0  → 标题固定，不参与拉伸

                    └── <div>  (content)
                          flex-1 min-h-0   → 占满 section 内剩余高度
                          overflow-y-auto  → 只有这里滚动
```

---

## 关键原则

### `min-h-0` 为何必须显式写

flex / grid 子项的默认值是 `min-height: auto`，含义是"至少和内容一样高"。
这会导致子项撑开父容器而不是被父容器约束，从而让 `overflow-y-auto` 失效。
在每一个需要被"压缩"的节点上加 `min-h-0`，约束才能逐层传递下去。

### `h-full` vs `flex-1`

| 场景                        | 用法                                                                    |
| --------------------------- | ----------------------------------------------------------------------- |
| flex 子项，需要占满剩余空间 | `flex-1 min-h-0`                                                        |
| grid 子项，需要撑满格子高度 | `h-full min-h-0`（grid 默认 `align-items: stretch`，也可省略 `h-full`） |

Section 作为 grid 子项，`h-full` 显式写出更清晰；
Section 内部的 content div 作为 flex 子项，用 `flex-1`。

### sticky header 在 flex 列中是否有效

有效。`sticky` 基于最近的**滚动祖先**定位。body 是 `overflow: hidden`（不产生滚动上下文），
实际的滚动发生在 Section 的 content div 内，因此 header 的 `sticky top-0` 相对于视口吸顶，行为正确。

---

## 涉及文件

| 文件                                     | 关键类名                                                                                |
| ---------------------------------------- | --------------------------------------------------------------------------------------- |
| `src/entrypoints/options/main.ts`        | `h-screen overflow-hidden flex flex-col` (body)                                         |
| `src/entrypoints/options/Main.svelte`    | header: `shrink-0` / main: `flex-1 min-h-0` / aside: `min-h-0 overflow-y-auto`          |
| `src/entrypoints/options/Section.svelte` | section: `h-full min-h-0 flex flex-col` / content div: `flex-1 min-h-0 overflow-y-auto` |

---

## 新增可滚动区域的规则

如果将来有新的页面或组件需要局部滚动，遵循以下步骤：

1. 确保该元素的所有祖先节点都有**明确的高度约束**（`h-screen` / `flex-1` / `h-full`）
2. 在每一个 flex/grid 子项上加 `min-h-0`，直到目标元素
3. 在目标元素上加 `overflow-y-auto`（或 `overflow-auto`）
4. **不需要** JS 计算高度；若发现需要，优先检查某一层是否缺少 `min-h-0`
