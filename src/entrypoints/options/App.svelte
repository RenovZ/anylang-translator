<script lang="ts">
    import { onMount } from "svelte";
    import { Avatar, Button, GradientButton, Toggle } from "flowbite-svelte";
    import {
        ChevronDownOutline,
        CogOutline,
        WandMagicSparklesSolid,
    } from "flowbite-svelte-icons";
    import { browser } from "wxt/browser";

    import "../../assets/app.css";
    import avatar from "../../lib/avatar";
    import {
        defaultPopupConfig,
        modelOptionsByProvider,
        promptPresetOptions,
        providerOptions,
        targetLanguageOptions,
        toggles,
        type PopupConfig,
    } from "../popup/data";

    type V2OptionsConfig = PopupConfig & {
        toggleModes: Record<string, string>;
        alwaysTranslateSites: string[];
        uiLanguage: string;
    };

    const STORAGE_KEY = "options-config";
    const navItems = [
        { id: "general", label: "基本设置", position: "top" },
        { id: "services", label: "翻译服务", position: "top" },
        { id: "ai", label: "AI 专家", position: "top" },
        { id: "terms", label: "AI 术语库", position: "top" },
        { id: "writing", label: "AI Write", position: "top" },
        { id: "subtitle", label: "视频字幕", position: "top" },
        { id: "manga", label: "漫画/图片", position: "top" },
        { id: "input", label: "输入框翻译", position: "top" },
        { id: "selection-transiation", label: "划词翻译", position: "top" },
        { id: "mouse-hover", label: "鼠标悬停", position: "top" },
        { id: "floating", label: "悬浮球", position: "top" },
        { id: "shortcuts", label: "快捷键", position: "top" },
        { id: "advanced", label: "高级设置", position: "top" },
        { id: "import-export", label: "导入/导出", position: "top" },
        { id: "about", label: "关于", position: "top" },
        {
            id: "pricing",
            link: "https://example.com/pricing",
            label: "价格",
            position: "bottom",
        },
        {
            id: "docs",
            link: "https://example.com/docs",
            label: "使用文档",
            position: "bottom",
        },
        {
            id: "changelog",
            link: "https://example.com/changelog",
            label: "更新日志",
            position: "bottom",
        },
        {
            id: "feedback",
            link: "https://example.com/feedback",
            label: "问题反馈",
            position: "bottom",
        },
        { id: "developer", label: "开发者设置", position: "bottom" },
    ];

    const defaultToggleModes = Object.fromEntries(
        toggles
            .filter((item) => item.options?.length)
            .map((item) => [item.key, item.options![0]]),
    );

    const createDefaultConfig = (): V2OptionsConfig => ({
        ...structuredClone(defaultPopupConfig),
        toggleModes: { ...defaultToggleModes },
        alwaysTranslateSites: [
            "twitter.com",
            "x.com",
            "www.reddit.com",
            "www.kadaza.com",
        ],
        uiLanguage: "简体中文",
    });

    let config = createDefaultConfig();
    let toggleItems = toggles.map((item) => ({ ...item }));
    let newSite = "";
    let savedSnapshot = JSON.stringify(config);
    let saveMessage = "";
    let loading = true;
    let saving = false;
    let activeNavId = navItems[0].id;

    const topNavItems = navItems.filter((item) => item.position === "top");
    const bottomNavItems = navItems.filter(
        (item) => item.position === "bottom",
    );

    $: config = {
        ...config,
        toggles: Object.fromEntries(
            toggleItems.map((item) => [item.key, item.enabled]),
        ),
    };

    $: isDirty = JSON.stringify(config) !== savedSnapshot;

    onMount(() => {
        const sections = navItems
            .map((item) => document.getElementById(item.id))
            .filter(Boolean) as HTMLElement[];

        const observer = new IntersectionObserver(
            (entries) => {
                const visible = entries
                    .filter((entry) => entry.isIntersecting)
                    .sort(
                        (a, b) =>
                            a.boundingClientRect.top - b.boundingClientRect.top,
                    );

                if (visible[0]?.target.id) {
                    activeNavId = visible[0].target.id;
                }
            },
            {
                rootMargin: "-96px 0px -55% 0px",
                threshold: [0.1, 0.25, 0.5],
            },
        );

        sections.forEach((section) => observer.observe(section));

        void (async () => {
            const result = await browser.storage.local.get(STORAGE_KEY);
            const stored = result[STORAGE_KEY] as
                | Partial<V2OptionsConfig>
                | undefined;

            if (stored) {
                config = {
                    ...createDefaultConfig(),
                    ...stored,
                    toggles: {
                        ...defaultPopupConfig.toggles,
                        ...stored.toggles,
                    },
                    toggleModes: {
                        ...defaultToggleModes,
                        ...stored.toggleModes,
                    },
                    alwaysTranslateSites: stored.alwaysTranslateSites?.length
                        ? stored.alwaysTranslateSites
                        : createDefaultConfig().alwaysTranslateSites,
                };
                toggleItems = toggles.map((item) => ({
                    ...item,
                    enabled: config.toggles[item.key] ?? item.enabled,
                }));
            }

            savedSnapshot = JSON.stringify(config);
            loading = false;
        })();

        return () => observer.disconnect();
    });

    function getProviderModels(provider: string) {
        return (
            modelOptionsByProvider[provider] ??
            modelOptionsByProvider[defaultPopupConfig.provider]
        );
    }

    function updateField(
        key:
            | "targetLanguage"
            | "provider"
            | "model"
            | "promptPreset"
            | "uiLanguage",
        value: string,
    ) {
        if (key === "provider") {
            const nextModels = getProviderModels(value);
            config = {
                ...config,
                provider: value,
                model: nextModels[0] ?? "",
            };
            return;
        }

        config = {
            ...config,
            [key]: value,
        };
    }

    function updateToggleMode(key: string, value: string) {
        config = {
            ...config,
            toggleModes: {
                ...config.toggleModes,
                [key]: value,
            },
        };
    }

    async function saveOptions() {
        saving = true;
        await browser.storage.local.set({ [STORAGE_KEY]: config });
        savedSnapshot = JSON.stringify(config);
        saveMessage = "v2 设置已保存";
        saving = false;
    }

    async function resetOptions() {
        config = createDefaultConfig();
        toggleItems = toggles.map((item) => ({ ...item }));
        await saveOptions();
        saveMessage = "已恢复默认设置";
    }

    function addSite() {
        const site = newSite.trim();
        if (!site || config.alwaysTranslateSites.includes(site)) return;
        config = {
            ...config,
            alwaysTranslateSites: [...config.alwaysTranslateSites, site],
        };
        newSite = "";
    }

    function removeSite(site: string) {
        config = {
            ...config,
            alwaysTranslateSites: config.alwaysTranslateSites.filter(
                (item) => item !== site,
            ),
        };
    }

    function goToSection(id: string) {
        activeNavId = id;
        document.getElementById(id)?.scrollIntoView({
            behavior: "smooth",
            block: "start",
        });
    }
</script>

<main
    class="min-h-screen bg-slate-100 dark:bg-slate-950/80 text-sm text-slate-900 dark:text-slate-50"
>
    <header
        class="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xs shadow sticky top-0 z-10"
    >
        <div class="mx-auto flex items-center justify-between px-6 py-4">
            <div class="flex items-center gap-3">
                <div class="rounded-xl bg-primary-500 p-2 text-white shadow-sm">
                    <WandMagicSparklesSolid class="h-5 w-5" />
                </div>
                <div class="flex items-center gap-3">
                    <span class="text-lg font-semibold">沉浸式翻译</span>
                    <span class="text-slate-400">v0.0.1</span>
                </div>
            </div>

            <div class="flex items-center gap-3">
                <Button
                    color="light"
                    class="rounded-xl px-4 py-2 border-none shadow-md"
                >
                    ⚒️ 工具箱
                </Button>
            </div>
        </div>
    </header>

    <div class="mx-auto grid max-w-7xl grid-cols-[240px_1fr] gap-8 px-6 py-8">
        <aside
            class="sticky top-24 z-10 h-[calc(100vh-8rem)] overflow-y-auto rounded-2xl bg-white/80 dark:bg-slate-900/80 p-4 shadow-md flex flex-col justify-between"
        >
            <div class="space-y-1">
                {#each topNavItems as item}
                    <button
                        type="button"
                        onclick={() => goToSection(item.id)}
                        class={`flex w-full items-center rounded-2xl px-4 py-3 text-left transition ${
                            activeNavId === item.id
                                ? "bg-slate-100 dark:bg-slate-600 font-semibold text-primary-600"
                                : "text-slate-600 dark:text-slate-100 hover:bg-slate-50 hover:dark:bg-slate-700"
                        }`}
                    >
                        {item.label}
                    </button>
                {/each}
            </div>

            <div class="space-y-1">
                {#each bottomNavItems as item}
                    <button
                        type="button"
                        onclick={() => goToSection(item.id)}
                        class={`flex w-full items-center rounded-2xl px-4 py-3 text-left transition ${
                            activeNavId === item.id
                                ? "bg-slate-100 dark:bg-slate-600 font-semibold text-primary-600"
                                : "text-slate-600 dark:text-slate-100 hover:bg-slate-50 hover:dark:bg-slate-700"
                        }`}
                    >
                        {item.label}
                    </button>
                {/each}
            </div>
        </aside>

        <section
            class="rounded-2xl bg-white/80 dark:bg-slate-900/80 p-8 shadow-md"
        >
            <div class="flex items-start justify-between gap-6">
                <div>
                    <h1 class="text-2xl font-semibold">基本设置</h1>
                    <p class="mt-2 text-sm text-slate-500">
                        这是 v2：布局改成你给图里的后台设置页形式，配色继续沿用
                        v1。
                    </p>
                </div>
                <div class="flex items-center gap-3 text-primary-600">
                    <button type="button" onclick={saveOptions}>清除缓存</button
                    >
                    <button type="button" onclick={resetOptions}
                        >重置设置</button
                    >
                </div>
            </div>

            <div class="mt-8 flex items-center justify-between">
                <div class="flex items-center gap-4">
                    <Avatar
                        class="h-14 w-14"
                        src={avatar.dicebear("RenovZ", {
                            chars: 1,
                            backgroundType: ["gradientLinear"],
                        })}
                        size="lg"
                    />
                    <div>
                        <div class="font-medium">未登录</div>
                        <div class="text-sm text-slate-400">
                            登录后可开通会员
                        </div>
                    </div>
                </div>
                <GradientButton
                    color="purpleToBlue"
                    class="rounded-xl px-4 py-2"
                    disabled={loading || saving || !isDirty}
                    onclick={saveOptions}
                >
                    {#if saving}保存中...{:else}保存当前设置{/if}
                </GradientButton>
            </div>

            <div class="mt-10 space-y-6">
                <section
                    id="general"
                    class="scroll-mt-28 rounded-2xl border border-slate-200 bg-slate-50 p-6"
                >
                    <div class="mb-4">
                        <h2 class="text-lg font-semibold">基本设置</h2>
                        <p class="mt-1 text-sm text-slate-400">
                            目标语言、界面语言和默认行为入口。
                        </p>
                    </div>
                    <div class="grid gap-4 md:grid-cols-2">
                        <label class="space-y-2">
                            <span class="font-medium">目标语言</span>
                            <select
                                value={config.targetLanguage}
                                onchange={(event) =>
                                    updateField(
                                        "targetLanguage",
                                        (
                                            event.currentTarget as HTMLSelectElement
                                        ).value,
                                    )}
                                class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-primary-400"
                            >
                                {#each targetLanguageOptions as option}
                                    <option value={option}>{option}</option>
                                {/each}
                            </select>
                        </label>
                        <label class="space-y-2">
                            <span class="font-medium">界面语言</span>
                            <select
                                value={config.uiLanguage}
                                onchange={(event) =>
                                    updateField(
                                        "uiLanguage",
                                        (
                                            event.currentTarget as HTMLSelectElement
                                        ).value,
                                    )}
                                class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-primary-400"
                            >
                                <option value="简体中文">简体中文</option>
                                <option value="English">English</option>
                            </select>
                        </label>
                    </div>
                </section>

                <section
                    id="services"
                    class="scroll-mt-28 rounded-2xl border border-slate-200 bg-slate-50 p-6"
                >
                    <div class="mb-4">
                        <h2 class="text-lg font-semibold">翻译服务</h2>
                        <p class="mt-1 text-sm text-slate-400">
                            选择模型供应商和当前默认模型。
                        </p>
                    </div>
                    <div class="grid gap-4 md:grid-cols-2">
                        <label class="space-y-2">
                            <span class="font-medium">供应商</span>
                            <select
                                value={config.provider}
                                onchange={(event) =>
                                    updateField(
                                        "provider",
                                        (
                                            event.currentTarget as HTMLSelectElement
                                        ).value,
                                    )}
                                class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-primary-400"
                            >
                                {#each providerOptions as option}
                                    <option value={option}>{option}</option>
                                {/each}
                            </select>
                        </label>
                        <label class="space-y-2">
                            <span class="font-medium">默认模型</span>
                            <select
                                value={config.model}
                                onchange={(event) =>
                                    updateField(
                                        "model",
                                        (
                                            event.currentTarget as HTMLSelectElement
                                        ).value,
                                    )}
                                class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-primary-400"
                            >
                                {#each getProviderModels(config.provider) as option}
                                    <option value={option}>{option}</option>
                                {/each}
                            </select>
                        </label>
                    </div>
                </section>

                <section
                    id="ai"
                    class="scroll-mt-28 rounded-2xl border border-slate-200 bg-slate-50 p-6"
                >
                    <div class="mb-4">
                        <h2 class="text-lg font-semibold">AI 专家</h2>
                        <p class="mt-1 text-sm text-slate-400">
                            选择默认的提示词方案和 AI 专家模式。
                        </p>
                    </div>
                    <select
                        value={config.promptPreset}
                        onchange={(event) =>
                            updateField(
                                "promptPreset",
                                (event.currentTarget as HTMLSelectElement)
                                    .value,
                            )}
                        class="w-full max-w-sm rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-primary-400"
                    >
                        {#each promptPresetOptions as option}
                            <option value={option}>{option}</option>
                        {/each}
                    </select>
                </section>

                <section
                    id="terms"
                    class="scroll-mt-28 rounded-2xl border border-slate-200 bg-slate-50 p-6"
                >
                    <h2 class="text-lg font-semibold">AI 术语库</h2>
                    <p class="mt-1 text-sm text-slate-400">
                        这里可以放术语表、术语优先级和导入规则。当前先保留为独立卡片，便于后续扩展。
                    </p>
                </section>

                <section
                    id="writing"
                    class="scroll-mt-28 rounded-2xl border border-slate-200 bg-slate-50 p-6"
                >
                    <h2 class="text-lg font-semibold">AI Write</h2>
                    <p class="mt-1 text-sm text-slate-400">
                        写作增强、润色和风格改写入口可以放在这里。
                    </p>
                </section>

                <section
                    id="subtitle"
                    class="scroll-mt-28 rounded-2xl border border-slate-200 bg-slate-50 p-6"
                >
                    <h2 class="text-lg font-semibold">视频字幕</h2>
                    <p class="mt-1 text-sm text-slate-400">
                        自动开启双语字幕等视频场景设置。
                    </p>
                    <div
                        class="mt-4 flex items-center justify-between rounded-xl bg-white px-4 py-3"
                    >
                        <span class="font-medium">自动开启双语字幕</span>
                        <Toggle
                            bind:checked={toggleItems[4].enabled}
                            size="small"
                            classes={{
                                span: "me-0 cursor-pointer bg-gray-300",
                            }}
                            aria-label="自动开启双语字幕"
                        />
                    </div>
                </section>

                <section
                    id="manga"
                    class="scroll-mt-28 rounded-2xl border border-slate-200 bg-slate-50 p-6"
                >
                    <h2 class="text-lg font-semibold">漫画/图片</h2>
                    <p class="mt-1 text-sm text-slate-400">
                        图片识别和漫画翻译相关能力入口。
                    </p>
                </section>

                <section
                    id="input"
                    class="scroll-mt-28 rounded-2xl border border-slate-200 bg-slate-50 p-6"
                >
                    <h2 class="text-lg font-semibold">输入框翻译</h2>
                    <p class="mt-1 text-sm text-slate-400">
                        输入框内翻译和改写相关设置。
                    </p>
                </section>

                <section
                    id="selection-transiation"
                    class="scroll-mt-28 rounded-2xl border border-slate-200 bg-slate-50 p-6"
                >
                    <div class="mb-4">
                        <h2 class="text-lg font-semibold">划词翻译</h2>
                        <p class="mt-1 text-sm text-slate-400">
                            控制划词翻译触发方式。
                        </p>
                    </div>
                    <div class="grid gap-4">
                        <div
                            class="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-[1fr_auto] md:items-center"
                        >
                            <select
                                value={config.toggleModes[toggleItems[2].key]}
                                onchange={(event) =>
                                    updateToggleMode(
                                        toggleItems[2].key,
                                        (
                                            event.currentTarget as HTMLSelectElement
                                        ).value,
                                    )}
                                class="w-full max-w-md rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none transition focus:border-primary-400"
                            >
                                {#each toggleItems[2].options ?? [] as option}
                                    <option value={option}>{option}</option>
                                {/each}
                            </select>
                            <Toggle
                                bind:checked={toggleItems[2].enabled}
                                size="small"
                                classes={{
                                    span: "me-0 cursor-pointer bg-gray-300",
                                }}
                                aria-label={toggleItems[2].label}
                            />
                        </div>
                    </div>
                </section>

                <section
                    id="mouse-hover"
                    class="scroll-mt-28 rounded-2xl border border-slate-200 bg-slate-50 p-6"
                >
                    <div class="mb-4">
                        <h2 class="text-lg font-semibold">鼠标悬停</h2>
                        <p class="mt-1 text-sm text-slate-400">
                            控制悬停翻译触发方式。
                        </p>
                    </div>
                    <div
                        class="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-[1fr_auto] md:items-center"
                    >
                        <select
                            value={config.toggleModes[toggleItems[1].key]}
                            onchange={(event) =>
                                updateToggleMode(
                                    toggleItems[1].key,
                                    (event.currentTarget as HTMLSelectElement)
                                        .value,
                                )}
                            class="w-full max-w-md rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none transition focus:border-primary-400"
                        >
                            {#each toggleItems[1].options ?? [] as option}
                                <option value={option}>{option}</option>
                            {/each}
                        </select>
                        <Toggle
                            bind:checked={toggleItems[1].enabled}
                            size="small"
                            classes={{
                                span: "me-0 cursor-pointer bg-gray-300",
                            }}
                            aria-label={toggleItems[1].label}
                        />
                    </div>
                </section>

                <section
                    id="floating"
                    class="scroll-mt-28 rounded-2xl border border-slate-200 bg-slate-50 p-6"
                >
                    <h2 class="text-lg font-semibold">悬浮球</h2>
                    <p class="mt-1 text-sm text-slate-400">
                        悬浮球显示和交互配置。
                    </p>
                    <div
                        class="mt-4 flex items-center justify-between rounded-xl bg-white px-4 py-3"
                    >
                        <span class="font-medium">总是翻译该网站</span>
                        <Toggle
                            bind:checked={toggleItems[0].enabled}
                            size="small"
                            classes={{
                                span: "me-0 cursor-pointer bg-gray-300",
                            }}
                            aria-label={toggleItems[0].label}
                        />
                    </div>
                </section>

                <section
                    id="shortcuts"
                    class="scroll-mt-28 rounded-2xl border border-slate-200 bg-slate-50 p-6"
                >
                    <h2 class="text-lg font-semibold">快捷键</h2>
                    <p class="mt-1 text-sm text-slate-400">
                        这里可以放快捷键说明和跳转到浏览器快捷键页面。
                    </p>
                </section>

                <section
                    id="advanced"
                    class="scroll-mt-28 rounded-2xl border border-slate-200 bg-slate-50 p-6"
                >
                    <h2 class="text-lg font-semibold">高级设置</h2>
                    <p class="mt-1 text-sm text-slate-400">
                        展开更多自定义选项、高级规则和实验能力。
                    </p>
                    <div
                        class="mt-4 flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-4"
                    >
                        <span class="font-medium text-slate-700"
                            >展开更多自定义选项</span
                        >
                        <ChevronDownOutline class="h-5 w-5 text-slate-400" />
                    </div>
                </section>

                <section
                    id="import-export"
                    class="scroll-mt-28 rounded-2xl border border-slate-200 bg-slate-50 p-6"
                >
                    <h2 class="text-lg font-semibold">导入/导出</h2>
                    <p class="mt-1 text-sm text-slate-400">
                        导出当前配置、导入历史配置。
                    </p>
                </section>

                <section
                    id="about"
                    class="scroll-mt-28 rounded-2xl border border-slate-200 bg-slate-50 p-6"
                >
                    <h2 class="text-lg font-semibold">关于</h2>
                    <p class="mt-1 text-sm text-slate-400">
                        版本信息、版权信息和产品说明。
                    </p>
                </section>

                <section
                    id="pricing"
                    class="scroll-mt-28 rounded-2xl border border-slate-200 bg-slate-50 p-6"
                >
                    <h2 class="text-lg font-semibold">价格</h2>
                    <p class="mt-1 text-sm text-slate-400">
                        会员方案和价格说明。
                    </p>
                </section>

                <section
                    id="docs"
                    class="scroll-mt-28 rounded-2xl border border-slate-200 bg-slate-50 p-6"
                >
                    <h2 class="text-lg font-semibold">使用文档</h2>
                    <p class="mt-1 text-sm text-slate-400">
                        产品说明和使用教程入口。
                    </p>
                </section>

                <section
                    id="changelog"
                    class="scroll-mt-28 rounded-2xl border border-slate-200 bg-slate-50 p-6"
                >
                    <h2 class="text-lg font-semibold">更新日志</h2>
                    <p class="mt-1 text-sm text-slate-400">
                        查看近期版本变更记录。
                    </p>
                </section>

                <section
                    id="feedback"
                    class="scroll-mt-28 rounded-2xl border border-slate-200 bg-slate-50 p-6"
                >
                    <h2 class="text-lg font-semibold">问题反馈</h2>
                    <p class="mt-1 text-sm text-slate-400">
                        反馈当前页面翻译问题和产品建议。
                    </p>
                </section>

                <section
                    id="developer"
                    class="scroll-mt-28 rounded-2xl border border-slate-200 bg-slate-50 p-6"
                >
                    <h2 class="text-lg font-semibold">开发者设置</h2>
                    <p class="mt-1 text-sm text-slate-400">
                        调试模式、日志级别和开发辅助能力。
                    </p>
                </section>

                <section
                    id="always-translate-sites"
                    class="scroll-mt-28 rounded-2xl border border-slate-200 bg-slate-50 p-6"
                >
                    <div class="mb-4">
                        <h2 class="text-lg font-semibold">总是翻译的网站</h2>
                        <p class="mt-1 text-sm text-slate-400">
                            当网站为下列域名时，会自动翻译为目标语言。
                        </p>
                    </div>
                    <div class="grid gap-3 md:grid-cols-[1fr_auto]">
                        <input
                            bind:value={newSite}
                            type="text"
                            placeholder="example.com"
                            class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-primary-400"
                        />
                        <button
                            type="button"
                            class="rounded-2xl bg-slate-700 px-5 py-3 font-medium text-white"
                            onclick={addSite}>添加</button
                        >
                    </div>
                    <div class="mt-4 space-y-3 rounded-2xl bg-white p-4">
                        {#each config.alwaysTranslateSites as site}
                            <div
                                class="flex items-center justify-between border-b border-slate-200 pb-3 last:border-b-0 last:pb-0"
                            >
                                <span class="font-medium text-slate-700"
                                    >{site}</span
                                >
                                <div
                                    class="flex items-center gap-4 text-primary-600"
                                >
                                    <button type="button">编辑</button>
                                    <button
                                        type="button"
                                        onclick={() => removeSite(site)}
                                        >删除</button
                                    >
                                </div>
                            </div>
                        {/each}
                    </div>
                </section>

                <section
                    id="save-status"
                    class="scroll-mt-28 rounded-2xl bg-slate-950 p-5 text-slate-100"
                >
                    <div class="text-sm text-slate-400">状态</div>
                    <div class="mt-2 font-medium">
                        {#if loading}
                            正在读取浏览器本地存储...
                        {:else if saveMessage}
                            {saveMessage}
                        {:else if isDirty}
                            你有尚未保存的改动
                        {:else}
                            当前配置已同步
                        {/if}
                    </div>
                </section>
            </div>
        </section>
    </div>
</main>
