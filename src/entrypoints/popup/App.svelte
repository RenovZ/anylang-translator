<script lang="ts">
    import {
        Avatar,
        GradientButton,
        Button,
        Dropdown,
        DropdownItem,
        Toggle,
    } from "flowbite-svelte";
    import {
        ChevronDownOutline,
        ArrowRightOutline,
        LanguageOutline,
        CogOutline,
        ToolsOutline,
    } from "flowbite-svelte-icons";

    import "../../assets/app.css";
    import avatar from "../../lib/avatar";
    import {
        configRows,
        defaultPopupConfig,
        languageOptions,
        modelOptionsByProvider,
        quickActions,
        sourceLanguageOptions,
        targetLanguageOptions,
        toggles,
        type ConfigRow,
        type ConfigRowKey,
    } from "./data";

    let popupConfig = { ...defaultPopupConfig };
    let toggleItems = toggles.map((item) => ({ ...item }));

    $: popupConfig = {
        ...popupConfig,
        toggles: Object.fromEntries(
            toggleItems.map((item) => [item.key, item.enabled]),
        ),
    };

    function getConfigValue(key: ConfigRowKey) {
        if (key === "provider") return popupConfig.provider;
        if (key === "model") return popupConfig.model;
        return popupConfig.promptPreset;
    }

    function getConfigOptions(row: ConfigRow) {
        if (row.key === "model") {
            return modelOptionsByProvider[popupConfig.provider] ?? row.options;
        }
        return row.options;
    }

    function updateConfig(key: ConfigRowKey, value: string) {
        if (key === "provider") {
            const nextModelOptions = modelOptionsByProvider[value] ?? [];
            popupConfig = {
                ...popupConfig,
                provider: value,
                model: nextModelOptions[0] ?? "",
            };
            return;
        }

        popupConfig = {
            ...popupConfig,
            [key]: value,
        };
    }

    function updateLanguage(kind: "source" | "target", value: string) {
        popupConfig = {
            ...popupConfig,
            ...(kind === "source"
                ? { sourceLanguage: value }
                : { targetLanguage: value }),
        };
    }
</script>

<main class="min-w-80 bg-gray-200 text-sm dark:bg-gray-950">
    <section class="space-y-4 rounded-b-2xl bg-white p-4 dark:bg-gray-900">
        <header class="flex items-center justify-between">
            <div class="flex items-center justify-between gap-2">
                <Avatar
                    class="flex h-6 w-6 items-center justify-center"
                    src={avatar.dicebear("RenovZ", {
                        chars: 1,
                        backgroundType: ["gradientLinear"],
                    })}
                    size="xs"
                />
                <span class="text-xs">未登录</span>
                <GradientButton
                    color="purpleToBlue"
                    pill
                    class="px-2 py-1 text-xs"
                >
                    <span>⚡</span>
                    <span>升级</span>
                </GradientButton>
            </div>
        </header>

        <section class="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
            <Button
                class="rounded-xl bg-mist-100 px-3 py-2 text-gray-900 hover:bg-mist-200/70 dark:bg-mist-700 dark:text-gray-100 hover:dark:bg-mist-600"
            >
                <div class="flex flex-col text-left">
                    <span class="line-clamp-1 font-medium">
                        {popupConfig.sourceLanguage}
                    </span>
                    <span class="text-xs text-gray-400">
                        {languageOptions[0].hint}
                    </span>
                </div>
                <ChevronDownOutline class="ms-2 h-6 w-6 text-gray-400" />
            </Button>
            <Dropdown
                simple
                class="max-h-96 overflow-y-auto bg-white/80 backdrop-blur-xs dark:bg-gray-700/80"
            >
                {#each sourceLanguageOptions as option}
                    <DropdownItem
                        on:click={() => updateLanguage("source", option)}
                    >
                        {option}
                    </DropdownItem>
                {/each}
            </Dropdown>

            <ArrowRightOutline class="h-6 w-6 shrink-0 text-gray-400" />

            <Button
                class="rounded-xl bg-mist-100 px-3 py-2 text-gray-900 hover:bg-mist-200/70 dark:bg-mist-700 dark:text-gray-100 hover:dark:bg-mist-600"
            >
                <div class="flex flex-col text-left">
                    <span class="line-clamp-1 font-medium">
                        {popupConfig.targetLanguage}
                    </span>
                    <span class="text-xs text-gray-400">
                        {languageOptions[1].hint}
                    </span>
                </div>
                <ChevronDownOutline class="ms-2 h-6 w-6 text-gray-400" />
            </Button>
            <Dropdown
                simple
                class="max-h-96 overflow-y-auto bg-white/80 backdrop-blur-xs dark:bg-gray-700/80"
            >
                {#each targetLanguageOptions as option}
                    <DropdownItem
                        on:click={() => updateLanguage("target", option)}
                    >
                        {option}
                    </DropdownItem>
                {/each}
            </Dropdown>
        </section>

        <section class="rounded-xl bg-mist-100 dark:bg-mist-700">
            {#each configRows as row, index}
                <div
                    class:rounded-b-xl={index === configRows.length - 1}
                    class:rounded-t-xl={index === 0}
                    class="grid grid-cols-[88px_1fr] items-center px-3 py-2 hover:bg-mist-200/70 hover:dark:bg-mist-600"
                >
                    <div class="font-medium">{row.label}</div>
                    <button
                        type="button"
                        class="flex flex-1 items-center justify-between"
                    >
                        <div class="flex flex-col text-left font-medium">
                            {getConfigValue(row.key)}
                        </div>
                        <ChevronDownOutline class="h-6 w-6 text-gray-400" />
                    </button>
                    <Dropdown
                        simple
                        placement="bottom-end"
                        class="max-h-96 overflow-y-auto bg-white/80 backdrop-blur-xs dark:bg-gray-700/80"
                    >
                        {#each getConfigOptions(row) as option}
                            <DropdownItem
                                on:click={() => updateConfig(row.key, option)}
                            >
                                {option}
                            </DropdownItem>
                        {/each}
                    </Dropdown>
                </div>
            {/each}
        </section>

        <section class="flex items-center gap-3">
            <Button
                pill
                class="bg-mist-100 p-2! hover:bg-mist-200/70 dark:bg-mist-700 hover:dark:bg-mist-600"
            >
                <LanguageOutline class="h-6 w-6 shrink-0 text-primary-500" />
            </Button>
            <Button class="flex-1 rounded-xl text-base">翻译（⌥A）</Button>
        </section>

        <section class="flex flex-col gap-3">
            {#each toggleItems as item}
                <div class="flex items-center justify-between gap-3">
                    <button
                        type="button"
                        class="flex min-w-0 items-center flex-nowrap"
                    >
                        <span class="line-clamp-1 font-medium"
                            >{item.label}</span
                        >
                        {#if item.hasMenu}
                            <ChevronDownOutline
                                class="ms-2 h-6 w-6 text-gray-400"
                            />
                        {/if}
                    </button>
                    {#if item.options}
                        <Dropdown
                            simple
                            placement="bottom-end"
                            class="max-h-96 overflow-y-auto bg-white/80 backdrop-blur-xs dark:bg-gray-700/80"
                        >
                            {#each item.options as option}
                                <DropdownItem>{option}</DropdownItem>
                            {/each}
                        </Dropdown>
                    {/if}
                    <Toggle
                        bind:checked={item.enabled}
                        size="small"
                        spanClass="me-0 cursor-pointer bg-gray-300 dark:bg-gray-500"
                        aria-label={item.label}
                    />
                </div>
            {/each}
        </section>

        <section class="grid grid-cols-3 gap-3 text-sm">
            {#each quickActions as action}
                <Button
                    class="gap-1 rounded-xl bg-mist-100 px-1 py-2 text-gray-900 hover:bg-mist-200/70 dark:bg-mist-700 dark:text-gray-100 hover:dark:bg-mist-600"
                >
                    <span>{action.icon}</span>
                    <span class="font-medium">{action.label}</span>
                </Button>
            {/each}
        </section>
    </section>

    <footer class="flex items-center justify-between p-2 text-sm">
        <div class="flex items-center gap-1">
            <CogOutline class="h-4 w-4 shrink-0" />
            <span>设置</span>
        </div>
        <div class="text-gray-400">0.0.1</div>
        <div>
            <button type="button" class="flex min-w-0 items-center">
                <span class="font-medium">更多</span>
                <ChevronDownOutline class="h-6 w-6 text-gray-400" />
            </button>
            <Dropdown
                simple
                placement="bottom-end"
                class="max-h-96 overflow-y-auto bg-white/80 backdrop-blur-xs dark:bg-gray-700/80"
            >
                <DropdownItem>清除缓存</DropdownItem>
                <DropdownItem>反馈当前页面翻译问题</DropdownItem>
                <DropdownItem>去商店评价</DropdownItem>
                <DropdownItem>关于我们</DropdownItem>
            </Dropdown>
        </div>
    </footer>
</main>
