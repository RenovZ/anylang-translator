<script lang="ts">
    import "./app.css";

    type QuickAction = {
        label: string;
        icon: "doc" | "text" | "gift";
    };

    type ToggleRow = {
        label: string;
        description?: string;
        enabled: boolean;
    };

    const quickActions: QuickAction[] = [
        { label: "文档翻译", icon: "doc" },
        { label: "文本翻译", icon: "text" },
        { label: "奖励中心", icon: "gift" }
    ];

    const toggleRows: ToggleRow[] = [
        { label: "总是翻译该网站", enabled: false },
        { label: "鼠标悬停: ＋ Ctrl 翻译/还原该段", enabled: false },
        { label: "划词翻译: 显示小圆点", enabled: true },
        { label: "总是翻译简体中文页面", enabled: false }
    ];

    const navItems = [
        { label: "设置", icon: "gear" },
        { label: "12.6.6", icon: "version" },
        { label: "更多", icon: "more" }
    ] as const;
</script>

<main class="popup-shell">
    <section class="popup-card">
        <header class="flex items-center justify-between gap-3">
            <div class="flex items-center gap-2.5">
                <div class="flex h-8 w-8 items-center justify-center rounded-full bg-[#e9e9eb] text-[15px]">
                    🐺
                </div>
                <span class="text-[15px] font-medium text-[#50535a]">未登录</span>
                <button class="pill pill-dark">
                    <span>⚡</span>
                    <span>升级</span>
                </button>
            </div>

            <button class="pill pill-light">
                <span class="text-[14px]">📱</span>
                <span>下载手机 APP</span>
                <span class="text-[#a6a8ae]">×</span>
            </button>
        </header>

        <section class="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
            <div class="selector-card">
                <div class="flex items-start justify-between gap-2">
                    <div>
                        <p class="truncate text-[16px] font-medium text-[#3d4047]">简体中文（...</p>
                        <p class="mt-1 text-[13px] text-[#90939a]">自动检测</p>
                    </div>
                    <span class="selector-arrow">⌄</span>
                </div>
            </div>

            <div class="flex items-center justify-center text-[22px] text-[#9d9fa6]">→</div>

            <div class="selector-card">
                <div class="flex items-start justify-between gap-2">
                    <div>
                        <p class="truncate text-[16px] font-medium text-[#3d4047]">简体中文</p>
                        <p class="mt-1 text-[13px] text-[#90939a]">目标语言</p>
                    </div>
                    <span class="selector-arrow">⌄</span>
                </div>
            </div>
        </section>

        <section class="panel mt-4">
            <div class="panel-row">
                <div class="flex items-center gap-2 text-[15px] text-[#494c54]">
                    <span class="font-medium">翻译服务：</span>
                    <span class="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#eef1ff] text-[11px]">
                        ✦
                    </span>
                    <span>GLM-4 Flash</span>
                    <span>⚠️</span>
                </div>
                <span class="selector-arrow">⌄</span>
            </div>

            <div class="divider"></div>

            <div class="panel-row">
                <div class="flex items-center gap-2 text-[15px] text-[#656872]">
                    <span>AI 专家：</span>
                    <span class="font-medium text-[#454851]">通用</span>
                </div>
                <span class="selector-arrow">⌄</span>
            </div>

            <div class="divider"></div>

            <div class="panel-row">
                <div class="flex items-center gap-2 text-[15px] text-[#50535a]">
                    <span>启用 AI 精翻</span>
                    <span class="badge-pro">Pro</span>
                    <span class="inline-flex h-4 w-4 items-center justify-center rounded-full border border-[#d6d7db] text-[10px] text-[#a6a8ae]">
                        ?
                    </span>
                </div>
                <button class="switch" aria-label="启用 AI 精翻" type="button">
                    <span></span>
                </button>
            </div>
        </section>

        <section class="mt-4 flex items-center gap-3">
            <button class="icon-action" type="button" aria-label="切换翻译模式">
                <span class="text-[17px] leading-none">🈯</span>
            </button>
            <button class="primary-cta" type="button">翻译（⌥A）</button>
        </section>

        <section class="mt-5 space-y-3">
            {#each toggleRows as row}
                <div class="flex items-center justify-between gap-3">
                    <div class="min-w-0">
                        <p class="truncate text-[15px] text-[#3f424a]">{row.label}</p>
                        {#if row.description}
                            <p class="mt-1 text-[12px] text-[#91949b]">{row.description}</p>
                        {/if}
                    </div>
                    <button
                        class={`switch ${row.enabled ? "switch-on" : ""}`}
                        aria-label={row.label}
                        type="button"
                    >
                        <span></span>
                    </button>
                </div>
            {/each}
        </section>

        <section class="mt-5 grid grid-cols-3 gap-3">
            {#each quickActions as action}
                <button class="quick-card" type="button">
                    <span class={`quick-icon quick-icon-${action.icon}`}>
                        {#if action.icon === "doc"}
                            <span>📄</span>
                        {:else if action.icon === "text"}
                            <span>T</span>
                        {:else}
                            <span>🎁</span>
                        {/if}
                    </span>
                    <span class="mt-1 text-[14px] text-[#555862]">{action.label}</span>
                </button>
            {/each}
        </section>
    </section>

    <footer class="footer-bar">
        {#each navItems as item}
            <button class="footer-item" type="button">
                {#if item.icon === "gear"}
                    <span class="text-[14px]">⚙</span>
                    <span>{item.label}</span>
                {:else if item.icon === "version"}
                    <span class="text-[14px] text-[#b9bcc2]">{item.label}</span>
                {:else}
                    <span class="flex items-center gap-1">
                        <span>{item.label}</span>
                        <span class="text-[12px]">⌄</span>
                    </span>
                {/if}
            </button>
        {/each}
    </footer>
</main>
