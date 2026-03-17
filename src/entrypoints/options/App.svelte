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
        "基本设置",
        "翻译服务",
        "AI 专家",
        "AI 术语库",
        "视频字幕",
        "输入框翻译",
        "划词翻译",
        "鼠标悬停",
        "悬浮球",
        "快捷键",
        "导入/导出",
        "关于",
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

    $: config = {
        ...config,
        toggles: Object.fromEntries(
            toggleItems.map((item) => [item.key, item.enabled]),
        ),
    };

    $: isDirty = JSON.stringify(config) !== savedSnapshot;

    onMount(async () => {
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
</script>

<main class="min-h-screen bg-slate-100 text-sm text-slate-900">
    <header class="bg-white/80 backdrop-blur-xs shadow sticky top-0 z-10">
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
                    📄文档翻译
                </Button>
                <Button
                    color="light"
                    class="rounded-xl px-4 py-2 border-none shadow-md"
                >
                    T 文本翻译
                </Button>
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
        <aside class="rounded-2xl bg-white p-4 shadow-md sticky top-0 z-10">
            <div class="space-y-1">
                {#each navItems as item, index}
                    <button
                        type="button"
                        class={`flex w-full items-center rounded-2xl px-4 py-3 text-left transition ${
                            index === 0
                                ? "bg-secondary-50 font-semibold text-primary-600"
                                : "text-slate-600 hover:bg-slate-50"
                        }`}
                    >
                        {item}
                    </button>
                {/each}
            </div>
        </aside>

        <section
            class="rounded-[28px] border border-slate-200 bg-white p-8 shadow-[0_10px_28px_rgba(15,23,42,0.06)]"
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

            <div class="mt-10 space-y-10">
                <div class="grid grid-cols-[1fr_220px] items-start gap-8">
                    <div>
                        <div class="text-lg font-semibold">目标语言</div>
                        <p class="mt-1 text-sm text-slate-400">
                            指定默认希望将内容翻译成的语言
                        </p>
                    </div>
                    <select
                        value={config.targetLanguage}
                        onchange={(event) =>
                            updateField(
                                "targetLanguage",
                                (event.currentTarget as HTMLSelectElement)
                                    .value,
                            )}
                        class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-primary-400 focus:bg-white"
                    >
                        {#each targetLanguageOptions as option}
                            <option value={option}>{option}</option>
                        {/each}
                    </select>
                </div>

                <div class="grid grid-cols-[1fr_220px] items-start gap-8">
                    <div>
                        <div class="text-lg font-semibold">翻译服务</div>
                        <p class="mt-1 text-sm text-slate-400">
                            选择一项模型供应商作为默认翻译服务
                        </p>
                    </div>
                    <div class="space-y-3">
                        <select
                            value={config.provider}
                            onchange={(event) =>
                                updateField(
                                    "provider",
                                    (event.currentTarget as HTMLSelectElement)
                                        .value,
                                )}
                            class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-primary-400 focus:bg-white"
                        >
                            {#each providerOptions as option}
                                <option value={option}>{option}</option>
                            {/each}
                        </select>
                        <div class="text-right text-sm text-primary-600">
                            点此测试服务
                        </div>
                    </div>
                </div>

                <div
                    class="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-5"
                >
                    <div class="font-medium text-slate-700">
                        展开更多自定义选项
                    </div>
                    <ChevronDownOutline class="h-5 w-5 text-slate-400" />
                </div>

                <div class="grid grid-cols-[1fr_220px] items-start gap-8">
                    <div>
                        <div class="text-lg font-semibold">界面语言</div>
                        <p class="mt-1 text-sm text-slate-400">
                            控制扩展面板显示的语言，与目标语言无关
                        </p>
                    </div>
                    <select
                        value={config.uiLanguage}
                        onchange={(event) =>
                            updateField(
                                "uiLanguage",
                                (event.currentTarget as HTMLSelectElement)
                                    .value,
                            )}
                        class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-primary-400 focus:bg-white"
                    >
                        <option value="简体中文">简体中文</option>
                        <option value="English">English</option>
                    </select>
                </div>

                <div class="grid grid-cols-[1fr_220px] items-start gap-8">
                    <div>
                        <div class="text-lg font-semibold">默认模型</div>
                        <p class="mt-1 text-sm text-slate-400">
                            当前供应商下的默认模型
                        </p>
                    </div>
                    <select
                        value={config.model}
                        onchange={(event) =>
                            updateField(
                                "model",
                                (event.currentTarget as HTMLSelectElement)
                                    .value,
                            )}
                        class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-primary-400 focus:bg-white"
                    >
                        {#each getProviderModels(config.provider) as option}
                            <option value={option}>{option}</option>
                        {/each}
                    </select>
                </div>

                <div class="grid grid-cols-[1fr_220px] items-start gap-8">
                    <div>
                        <div class="text-lg font-semibold">提示词方案</div>
                        <p class="mt-1 text-sm text-slate-400">
                            选择默认的 AI 专家 / 提示词策略
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
                        class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-primary-400 focus:bg-white"
                    >
                        {#each promptPresetOptions as option}
                            <option value={option}>{option}</option>
                        {/each}
                    </select>
                </div>

                <div class="grid grid-cols-[1fr_220px] items-start gap-8">
                    <div>
                        <div class="text-lg font-semibold">总是翻译的网站</div>
                        <p class="mt-1 text-sm text-slate-400">
                            当网站为下列域名时，会自动翻译为目标语言
                        </p>
                        <div class="mt-3 text-sm text-primary-600">
                            批量操作
                        </div>
                    </div>
                    <div class="space-y-3">
                        <div class="grid grid-cols-[1fr_auto] gap-2">
                            <input
                                bind:value={newSite}
                                type="text"
                                placeholder="example.com"
                                class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-primary-400 focus:bg-white"
                            />
                            <button
                                type="button"
                                class="rounded-2xl bg-slate-700 px-5 py-3 font-medium text-white"
                                onclick={addSite}
                            >
                                添加
                            </button>
                        </div>
                    </div>
                </div>

                <div class="rounded-2xl bg-slate-50 p-4">
                    <div class="space-y-3">
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
                                    >
                                        删除
                                    </button>
                                </div>
                            </div>
                        {/each}
                    </div>
                </div>

                <div class="grid gap-4">
                    {#each toggleItems as item}
                        <div
                            class="grid grid-cols-[1fr_auto] items-start gap-6 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4"
                        >
                            <div>
                                <div class="font-medium">{item.label}</div>
                                {#if item.options}
                                    <select
                                        value={config.toggleModes[item.key]}
                                        onchange={(event) =>
                                            updateToggleMode(
                                                item.key,
                                                (
                                                    event.currentTarget as HTMLSelectElement
                                                ).value,
                                            )}
                                        class="mt-3 w-full max-w-md rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none transition focus:border-primary-400"
                                    >
                                        {#each item.options as option}
                                            <option value={option}>
                                                {option}
                                            </option>
                                        {/each}
                                    </select>
                                {/if}
                            </div>
                            <Toggle
                                bind:checked={item.enabled}
                                size="small"
                                classes={{
                                    span: "me-0 cursor-pointer bg-gray-300",
                                }}
                                aria-label={item.label}
                            />
                        </div>
                    {/each}
                </div>

                <div class="rounded-2xl bg-slate-950 p-5 text-slate-100">
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
                </div>
            </div>
        </section>
    </div>
</main>
