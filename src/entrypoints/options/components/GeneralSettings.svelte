<script lang="ts">
    import { Avatar, Toggle } from "flowbite-svelte";
    import { ChevronDownOutline } from "flowbite-svelte-icons";

    import avatar from "../../../lib/avatar";
    import {
        providerOptions,
        targetLanguageOptions,
        type ToggleItem,
    } from "../../popup/data";
    import type { V2OptionsConfig } from "../types";

    export let config: V2OptionsConfig;
    export let toggleItems: ToggleItem[];
    export let newSite = "";
    export let saveOptions: () => void | Promise<void>;
    export let resetOptions: () => void | Promise<void>;
    export let getProviderModels: (provider: string) => string[];

    const previewTextEn =
        "Night gathers, and now my watch begins. It shall not end until my death. I shall take no wife, hold no lands, father no children.";
    const previewTextZh =
        "长夜将至，我从今开始守望，至死方休。我将不娶妻、不封地、不生子。我将不戴宝冠，不争荣耀。";

    const styleOptions = [
        { label: "无", className: "" },
        {
            label: "虚线下划线",
            className:
                "underline decoration-dashed decoration-sky-400 underline-offset-4",
        },
        {
            label: "直线下划线",
            className: "underline decoration-sky-500 underline-offset-4",
        },
        {
            label: "虚线边框",
            className: "border border-dashed border-slate-400 px-1 py-0.5",
        },
        { label: "实线边框", className: "border border-slate-400 px-1 py-0.5" },
        { label: "模糊效果（学习模式）", className: "blur-[2px]" },
        { label: "透明效果", className: "opacity-35" },
        {
            label: "点状下划线",
            className:
                "underline decoration-dotted decoration-sky-500 underline-offset-4",
        },
        { label: "分割线", className: "border-l-4 border-primary-400 pl-3" },
        { label: "高亮", className: "bg-yellow-300 px-1" },
    ];

    function updateField(key: keyof V2OptionsConfig, value: string) {
        if (key === "provider") {
            const nextModels = getProviderModels(value);
            config = { ...config, provider: value, model: nextModels[0] ?? "" };
            return;
        }
        config = { ...config, [key]: value };
    }

    function updateBooleanField(
        key: "richTextTranslate" | "italicTranslate" | "customFontEnabled",
        value: boolean,
    ) {
        config = { ...config, [key]: value };
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

    function addRuleItem(
        key:
            | "neverTranslateSites"
            | "alwaysTranslateLanguages"
            | "neverTranslateLanguages",
        value: string,
    ) {
        const next = value.trim();
        if (!next || config[key].includes(next)) return;
        config = { ...config, [key]: [...config[key], next] };
    }

    function getPreviewClass(label: string) {
        return (
            styleOptions.find((option) => option.label === label)?.className ??
            ""
        );
    }
</script>

<section
    id="general"
    class="scroll-mt-28 rounded-2xl bg-white/80 p-8 shadow-md dark:bg-slate-900/80"
>
    <div class="flex items-start justify-between gap-6">
        <h2 class="text-lg font-semibold">基本设置</h2>
        <div class="flex items-center gap-4 text-sm text-primary-600">
            <button type="button" onclick={saveOptions}>清除缓存</button>
            <button type="button" onclick={resetOptions}>重置设置</button>
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
            <div class="font-medium">未登录</div>
        </div>
        <div class="text-sm text-primary-600">登录后可开通会员</div>
    </div>

    <div class="mt-10 space-y-10">
        <div class="grid grid-cols-[1fr_220px] items-start gap-8">
            <div>
                <div class="text-lg font-semibold">目标语言</div>
                <p class="mt-1 text-sm text-slate-400">
                    指定您希望将内容翻译成的语言
                </p>
            </div>
            <select
                value={config.targetLanguage}
                onchange={(event) =>
                    updateField(
                        "targetLanguage",
                        (event.currentTarget as HTMLSelectElement).value,
                    )}
                class="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-primary-400"
            >
                {#each targetLanguageOptions as option}
                    <option value={option}>{option}</option>
                {/each}
            </select>
        </div>

        <div class="grid grid-cols-[1fr_220px] items-start gap-8">
            <div>
                <div class="text-lg font-semibold">翻译服务</div>
                <p class="mt-1 text-sm text-slate-400">选择一项翻译服务</p>
            </div>
            <div class="space-y-3">
                <select
                    value={config.provider}
                    onchange={(event) =>
                        updateField(
                            "provider",
                            (event.currentTarget as HTMLSelectElement).value,
                        )}
                    class="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-primary-400"
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

        <div class="rounded-xl border border-slate-200 bg-white px-4 py-5">
            <div class="flex items-center justify-between">
                <div class="font-medium text-slate-700">
                    展开更多自定义选项 👉
                </div>
                <ChevronDownOutline class="h-5 w-5 text-slate-400" />
            </div>
            <div class="mt-5 grid grid-cols-[1fr_auto] items-start gap-6">
                <div>
                    <div class="font-medium">启用富文本翻译</div>
                    <p class="mt-1 text-sm text-slate-400">
                        开启富文本翻译可保留原文的链接和样式效果
                    </p>
                    <button
                        type="button"
                        class="mt-5 text-sm font-medium text-slate-500 underline"
                    >
                        恢复为默认设置
                    </button>
                </div>
                <Toggle
                    checked={config.richTextTranslate}
                    onchange={(event) =>
                        updateBooleanField(
                            "richTextTranslate",
                            (event.currentTarget as HTMLInputElement).checked,
                        )}
                    size="small"
                    classes={{ span: "me-0 cursor-pointer bg-gray-300" }}
                    aria-label="启用富文本翻译"
                />
            </div>
        </div>

        <div class="grid grid-cols-[1fr_220px] items-start gap-8">
            <div>
                <div class="text-lg font-semibold">界面语言</div>
                <p class="mt-1 text-sm text-slate-400">
                    界面语言设置影响控制面板的显示语言，和翻译的目标语言无关
                </p>
            </div>
            <select
                value={config.uiLanguage}
                onchange={(event) =>
                    updateField(
                        "uiLanguage",
                        (event.currentTarget as HTMLSelectElement).value,
                    )}
                class="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-primary-400"
            >
                <option value="简体中文">简体中文</option>
                <option value="English">English</option>
            </select>
        </div>

        <div class="grid grid-cols-[1fr_220px] items-start gap-8">
            <div>
                <div class="text-lg font-semibold">翻译偏好</div>
                <p class="mt-1 text-sm text-slate-400">
                    选择翻译后的显示方式：双语对照或仅显示译文
                </p>
            </div>
            <select
                value={config.translationPreference}
                onchange={(event) =>
                    updateField(
                        "translationPreference",
                        (event.currentTarget as HTMLSelectElement).value,
                    )}
                class="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-primary-400"
            >
                <option value="双语对照">双语对照</option>
                <option value="仅显示译文">仅显示译文</option>
            </select>
        </div>

        <div class="grid grid-cols-[1fr_220px] items-start gap-8">
            <div>
                <div class="text-lg font-semibold">总是翻译的网站</div>
                <p class="mt-1 text-sm text-slate-400">
                    当网站为下列域名时，会自动翻译为目标语言
                </p>
                <div class="mt-3 text-sm text-primary-600">批量操作</div>
            </div>
            <button
                type="button"
                class="rounded-xl bg-slate-700 px-5 py-3 font-medium text-white"
                onclick={addSite}
            >
                添加
            </button>
        </div>

        <div class="rounded-xl bg-slate-100 p-4">
            <div class="space-y-3">
                {#each config.alwaysTranslateSites as site}
                    <div
                        class="flex items-center justify-between pb-3 last:pb-0"
                    >
                        <span class="font-medium text-slate-600">{site}</span>
                        <div class="flex items-center gap-4 text-primary-600">
                            <button type="button">编辑</button>
                            <button
                                type="button"
                                onclick={() => removeSite(site)}>删除</button
                            >
                        </div>
                    </div>
                {/each}
            </div>
        </div>

        <div class="grid grid-cols-[1fr_220px] items-start gap-8">
            <div>
                <div class="text-lg font-semibold">不自动翻译的网站</div>
                <p class="mt-1 text-sm text-slate-400">
                    当网站为下列域名时，将不会自动进行翻译。此规则优先于语言设置。
                </p>
            </div>
            <button
                type="button"
                class="rounded-xl bg-slate-700 px-5 py-3 font-medium text-white"
                onclick={() =>
                    addRuleItem("neverTranslateSites", "example.com")}
            >
                添加
            </button>
        </div>

        <div class="grid grid-cols-[1fr_220px] items-start gap-8">
            <div>
                <div class="text-lg font-semibold">总是翻译的语言</div>
                <p class="mt-1 text-sm text-slate-400">
                    当页面语言为下列语言时，会自动翻译为目标语言。注意：如果“不自动翻译的网站”与此设置冲突，将优先按照网址规则执行。
                </p>
            </div>
            <select
                class="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-primary-400"
            >
                <option>编辑</option>
                {#each config.alwaysTranslateLanguages as language}
                    <option>{language}</option>
                {/each}
            </select>
        </div>

        <div class="grid grid-cols-[1fr_220px] items-start gap-8">
            <div>
                <div class="text-lg font-semibold">永不翻译的语言</div>
                <p class="mt-1 text-sm text-slate-400">
                    当页面中某一段落的语言为下列语言时，将跳过翻译
                </p>
            </div>
            <select
                class="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-primary-400"
            >
                <option>编辑</option>
                {#each config.neverTranslateLanguages as language}
                    <option>{language}</option>
                {/each}
            </select>
        </div>

        <div class="grid grid-cols-[1fr_220px] items-start gap-8">
            <div>
                <div class="text-lg font-semibold">译文显示样式</div>
                <p class="mt-1 text-sm text-slate-400">
                    区分译文的样式，具体可参考下列示例
                </p>
                <div class="mt-6 space-y-3 text-lg text-slate-700">
                    <p>{previewTextEn}</p>
                    <p class="text-base text-slate-600">{previewTextZh}</p>
                </div>
            </div>
            <div class="space-y-4">
                <select
                    value={config.translationStyle}
                    onchange={(event) =>
                        updateField(
                            "translationStyle",
                            (event.currentTarget as HTMLSelectElement).value,
                        )}
                    class="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-primary-400"
                >
                    {#each styleOptions as option}
                        <option value={option.label}>{option.label}</option>
                    {/each}
                </select>
                <div class="rounded-xl border border-slate-200 bg-white p-4">
                    <button
                        type="button"
                        class="mb-4 flex w-full items-center justify-between text-slate-600"
                    >
                        <span>自定义颜色和大小</span>
                        <span>⌄</span>
                    </button>
                    <div class="space-y-4">
                        <label
                            class="grid grid-cols-[1fr_140px_80px] items-center gap-2"
                        >
                            <span class="text-slate-600">文字颜色</span>
                            <input
                                value={config.textColor}
                                onchange={(event) =>
                                    updateField(
                                        "textColor",
                                        (
                                            event.currentTarget as HTMLInputElement
                                        ).value,
                                    )}
                                class="rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-primary-400"
                            />
                            <input
                                type="color"
                                value={config.textColor}
                                onchange={(event) =>
                                    updateField(
                                        "textColor",
                                        (
                                            event.currentTarget as HTMLInputElement
                                        ).value,
                                    )}
                                class="h-[50px] w-full rounded-xl border border-slate-300 bg-white p-2"
                            />
                        </label>
                        <label
                            class="grid grid-cols-[1fr_200px] items-center gap-4"
                        >
                            <span class="text-slate-600"
                                >字体缩放比例 (%)：</span
                            >
                            <input
                                value={config.fontScale}
                                onchange={(event) =>
                                    updateField(
                                        "fontScale",
                                        (
                                            event.currentTarget as HTMLInputElement
                                        ).value,
                                    )}
                                class="rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-primary-400"
                            />
                        </label>
                        <label
                            class="grid grid-cols-[1fr_200px] items-center gap-4"
                        >
                            <span class="text-slate-600">字体粗细：</span>
                            <input
                                value={config.fontWeight}
                                onchange={(event) =>
                                    updateField(
                                        "fontWeight",
                                        (
                                            event.currentTarget as HTMLInputElement
                                        ).value,
                                    )}
                                class="rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-primary-400"
                            />
                        </label>
                        <div class="flex items-center justify-between">
                            <span class="text-slate-600">设置为斜体</span>
                            <Toggle
                                checked={config.italicTranslate}
                                onchange={(event) =>
                                    updateBooleanField(
                                        "italicTranslate",
                                        (
                                            event.currentTarget as HTMLInputElement
                                        ).checked,
                                    )}
                                size="small"
                                classes={{
                                    span: "me-0 cursor-pointer bg-gray-300",
                                }}
                                aria-label="设置为斜体"
                            />
                        </div>
                        <button
                            type="button"
                            class="text-right text-slate-500 underline"
                            >恢复为默认颜色</button
                        >
                        <button
                            type="button"
                            class="flex w-full items-center justify-between text-slate-600"
                            ><span>设置字体</span><span>⌄</span></button
                        >
                        <label
                            class="flex items-center justify-end gap-2 text-slate-600"
                        >
                            <input
                                type="checkbox"
                                checked={config.customFontEnabled}
                                onchange={(event) =>
                                    updateBooleanField(
                                        "customFontEnabled",
                                        (
                                            event.currentTarget as HTMLInputElement
                                        ).checked,
                                    )}
                            />
                            <span>输入自定义字体</span>
                        </label>
                        <select
                            value={config.customFontFamily}
                            onchange={(event) =>
                                updateField(
                                    "customFontFamily",
                                    (event.currentTarget as HTMLSelectElement)
                                        .value,
                                )}
                            class="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-primary-400"
                        >
                            <option value="无">无</option>
                            <option value="PingFang SC">PingFang SC</option>
                            <option value="Microsoft YaHei"
                                >Microsoft YaHei</option
                            >
                            <option value="Source Han Sans SC"
                                >Source Han Sans SC</option
                            >
                        </select>
                        <button
                            type="button"
                            class="flex w-full items-center justify-between text-slate-600"
                            ><span>预览全部样式</span><span>⌄</span></button
                        >
                    </div>
                </div>
            </div>
        </div>

        <div class="space-y-7">
            {#each styleOptions as option}
                <label class="block">
                    <div class="flex items-start gap-3">
                        <input
                            type="radio"
                            name="translation-style-preview"
                            value={option.label}
                            checked={config.translationStyle === option.label}
                            onchange={() =>
                                updateField("translationStyle", option.label)}
                            class="mt-1 h-5 w-5 accent-primary-500"
                        />
                        <div class="flex-1">
                            <div class="font-medium">{option.label}</div>
                            <p
                                class={`mt-2 text-slate-700 ${getPreviewClass(option.label)} ${config.italicTranslate ? "italic" : ""}`}
                                style={`color:${config.textColor}; font-size:${config.fontScale}%; font-weight:${config.fontWeight}; font-family:${config.customFontFamily === "无" ? "inherit" : config.customFontFamily};`}
                            >
                                {previewTextZh}
                            </p>
                        </div>
                    </div>
                </label>
            {/each}
        </div>

        <div class="grid grid-cols-[1fr_220px] items-start gap-8">
            <div>
                <div class="text-lg font-semibold">
                    当页面语言和目标语言为相近语言时，为译文添加背景色
                </div>
                <p class="mt-1 text-sm text-slate-400">
                    当页面语言和目标语言为相近语言时，通过给译文添加背景色来区分原文，方便对照阅读。
                </p>
            </div>
            <Toggle
                checked={config.richTextTranslate}
                onchange={(event) =>
                    updateBooleanField(
                        "richTextTranslate",
                        (event.currentTarget as HTMLInputElement).checked,
                    )}
                size="small"
                classes={{ span: "me-0 cursor-pointer bg-gray-300" }}
                aria-label="当页面语言和目标语言为相近语言时，为译文添加背景色"
            />
        </div>
    </div>
</section>
