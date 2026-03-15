<script lang="ts">
    import {
        Avatar,
        GradientButton,
        ButtonGroup,
        Button,
        Dropdown,
        DropdownItem,
        Toggle,
        Tooltip,
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
</script>

<main class="min-w-80 bg-gray-200 dark:bg-gray-950 text-sm">
    <section class="bg-white dark:bg-gray-900 p-4 rounded-b-2xl space-y-4">
        <header class="flex items-center justify-between">
            <div class="flex items-center justify-between gap-2">
                <Avatar
                    class="flex items-center justify-center h-6 w-6"
                    src={avatar.dicebear("RenovZ", { chars: 1 })}
                    size="xs"
                />
                <span class="text-xs">未登录</span>
                <GradientButton
                    color="purpleToBlue"
                    pill
                    class="py-1 px-2 text-xs"
                >
                    <span>⚡</span>
                    <span>升级</span>
                </GradientButton>
            </div>

            <ButtonGroup>
                <Button
                    class="flex items-center gap-1 px-2 py-1 bg-mist-100 hover:bg-mist-200/70 dark:bg-mist-700 hover:dark:bg-mist-600 rounded-xl text-gray-900 dark:text-gray-100"
                >
                    <Tooltip class="text-xs">工具箱</Tooltip>
                    <ToolsOutline class="shrink-0 h-4 w-4" />
                </Button>
                <Button
                    class="flex items-center gap-1 px-2 py-1 bg-mist-100 hover:bg-mist-200/70 dark:bg-mist-700 hover:dark:bg-mist-600 rounded-xl text-gray-900 dark:text-gray-100"
                >
                    <Tooltip class="text-xs">设置</Tooltip>
                    <CogOutline class="shrink-0 h-4 w-4" />
                </Button>
            </ButtonGroup>

            <!-- <Badge dismissable large color="gray" rounded class="text-xs">
                <span>📱</span>
                <span>下载手机 APP</span>
            </Badge> -->
        </header>

        <section class="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
            <Button
                class="bg-mist-100 hover:bg-mist-200/70 dark:bg-mist-700 hover:dark:bg-mist-600 rounded-xl py-2 px-3 text-gray-900 dark:text-gray-100"
            >
                <div class="flex flex-col text-left">
                    <span class="line-clamp-1 font-medium">英语(English)</span>
                    <span class="text-gray-400 text-xs">自动检测</span>
                </div>
                <ChevronDownOutline class="ms-2 h-6 w-6 text-gray-400" />
            </Button>
            <Dropdown
                simple
                class="max-h-96 overflow-y-auto bg-white/80 backdrop-blur-xs dark:bg-gray-700/80"
            >
                <DropdownItem>Dashboard</DropdownItem>
                <DropdownItem>Settings</DropdownItem>
                <DropdownItem>Earnings</DropdownItem>
                <DropdownItem>Separated link</DropdownItem>
            </Dropdown>

            <ArrowRightOutline class="shrink-0 h-6 w-6 text-gray-400" />

            <Button
                class="bg-mist-100 hover:bg-mist-200/70 dark:bg-mist-700 hover:dark:bg-mist-600 rounded-xl py-2 px-3 text-gray-900 dark:text-gray-100"
            >
                <div class="flex flex-col text-left">
                    <span class="line-clamp-1 font-medium">简体中文</span>
                    <span class="text-gray-400 text-xs">目标语言</span>
                </div>
                <ChevronDownOutline class="ms-2 h-6 w-6 text-gray-400" />
            </Button>
            <Dropdown
                simple
                class="max-h-96 overflow-y-auto bg-white/80 backdrop-blur-xs dark:bg-gray-700/80"
            >
                <DropdownItem>Dashboard</DropdownItem>
                <DropdownItem>Settings</DropdownItem>
                <DropdownItem>Earnings</DropdownItem>
                <DropdownItem>Separated link</DropdownItem>
            </Dropdown>
        </section>

        <section class="bg-mist-100 dark:bg-mist-700 rounded-xl">
            <div
                class="py-2 px-3 rounded-t-xl flex items-center gap-2 hover:bg-mist-200/70 hover:dark:bg-mist-600"
            >
                <span class="font-medium">供应商：</span>
                <button
                    type="button"
                    class="flex flex-1 justify-between items-center"
                >
                    <div class="flex flex-col text-left font-medium">
                        Ollama
                    </div>
                    <ChevronDownOutline class="ms-2 h-6 w-6 text-gray-400" />
                </button>
                <Dropdown
                    simple
                    placement="bottom-end"
                    class="max-h-96 overflow-y-auto bg-white/80 backdrop-blur-xs dark:bg-gray-700/80"
                >
                    <DropdownItem>Dashboard</DropdownItem>
                    <DropdownItem>Settings</DropdownItem>
                    <DropdownItem>Earnings</DropdownItem>
                    <DropdownItem>Separated link</DropdownItem>
                </Dropdown>
            </div>

            <div
                class="py-2 px-3 flex items-center gap-2 hover:bg-mist-200/70 hover:dark:bg-mist-600"
            >
                <span class="font-medium">模型：</span>
                <button
                    type="button"
                    class="flex flex-1 justify-between items-center"
                >
                    <div class="flex flex-col text-left font-medium">
                        qwen3.5-2b
                    </div>
                    <ChevronDownOutline class="ms-2 h-6 w-6 text-gray-400" />
                </button>
                <Dropdown
                    simple
                    placement="bottom-end"
                    class="max-h-96 overflow-y-auto bg-white/80 backdrop-blur-xs dark:bg-gray-700/80"
                >
                    <DropdownItem>Dashboard</DropdownItem>
                    <DropdownItem>Settings</DropdownItem>
                    <DropdownItem>Earnings</DropdownItem>
                    <DropdownItem>Separated link</DropdownItem>
                </Dropdown>
            </div>

            <div
                class="py-2 px-3 rounded-b-xl flex justify-between items-center gap-2 hover:bg-mist-200/70 hover:dark:bg-mist-600"
            >
                <span class="font-medium">提示词：</span>
                <button
                    type="button"
                    class="flex flex-1 justify-between items-center"
                >
                    <div class="flex flex-col text-left font-medium">通用</div>
                    <ChevronDownOutline class="ms-2 h-6 w-6 text-gray-400" />
                </button>
                <Dropdown
                    simple
                    placement="bottom-end"
                    class="max-h-96 overflow-y-auto bg-white/80 backdrop-blur-xs dark:bg-gray-700/80"
                >
                    <DropdownItem>Dashboard</DropdownItem>
                    <DropdownItem>Settings</DropdownItem>
                    <DropdownItem>Earnings</DropdownItem>
                    <DropdownItem>Separated link</DropdownItem>
                </Dropdown>
            </div>
        </section>

        <section class="flex items-center gap-3">
            <Button
                pill
                class="p-2! bg-mist-100 hover:bg-mist-200/70 dark:bg-mist-700 hover:dark:bg-mist-600"
            >
                <LanguageOutline class="shrink-0 h-6 w-6 text-primary-500" />
            </Button>
            <Button class="flex-1 rounded-xl text-base">翻译（⌥A）</Button>
        </section>

        <section class="flex flex-col gap-3">
            <div class="flex items-center justify-between gap-3">
                <button
                    type="button"
                    class="min-w-0 flex items-center flex-nowrap"
                >
                    <span class="font-medium line-clamp-1">总是翻译该网站</span>
                    <ChevronDownOutline class="ms-2 h-6 w-6 text-gray-400" />
                </button>
                <Dropdown
                    simple
                    placement="bottom-end"
                    class="max-h-96 overflow-y-auto bg-white/80 backdrop-blur-xs dark:bg-gray-700/80"
                >
                    <DropdownItem>Dashboard</DropdownItem>
                    <DropdownItem>Settings</DropdownItem>
                    <DropdownItem>Earnings</DropdownItem>
                    <DropdownItem>Separated link</DropdownItem>
                </Dropdown>
                <Toggle
                    size="small"
                    spanClass="me-0 cursor-pointer bg-gray-300 dark:bg-gray-500"
                    aria-label="总是翻译该网站"
                />
            </div>
            <div class="flex items-center justify-between gap-3">
                <button
                    type="button"
                    class="min-w-0 flex items-center flex-nowrap"
                >
                    <span class="font-medium mr-2">鼠标悬停:</span>
                    <span class="font-medium line-clamp-1">
                        ＋ Ctrl 翻译/还原该段
                    </span>
                    <ChevronDownOutline class="ms-2 h-6 w-6 text-gray-400" />
                </button>
                <Dropdown
                    simple
                    placement="bottom-end"
                    class="max-h-96 overflow-y-auto bg-white/80 backdrop-blur-xs dark:bg-gray-700/80"
                >
                    <DropdownItem>Dashboard</DropdownItem>
                    <DropdownItem>Settings</DropdownItem>
                    <DropdownItem>Earnings</DropdownItem>
                    <DropdownItem>Separated link</DropdownItem>
                </Dropdown>
                <Toggle
                    size="small"
                    spanClass="me-0 cursor-pointer bg-gray-300 dark:bg-gray-500"
                    aria-label="鼠标悬停: ＋ Ctrl 翻译/还原该段"
                />
            </div>
            <div class="flex items-center justify-between gap-3">
                <button
                    type="button"
                    class="min-w-0 flex items-center flex-nowrap"
                >
                    <span class="font-medium mr-2">划词翻译:</span>
                    <span class="font-medium line-clamp-1">显示小圆点</span>
                    <ChevronDownOutline class="ms-2 h-6 w-6 text-gray-400" />
                </button>
                <Dropdown
                    simple
                    placement="bottom-end"
                    class="max-h-96 overflow-y-auto bg-white/80 backdrop-blur-xs dark:bg-gray-700/80"
                >
                    <DropdownItem>Dashboard</DropdownItem>
                    <DropdownItem>Settings</DropdownItem>
                    <DropdownItem>Earnings</DropdownItem>
                    <DropdownItem>Separated link</DropdownItem>
                </Dropdown>
                <Toggle
                    size="small"
                    spanClass="me-0 cursor-pointer bg-gray-300 dark:bg-gray-500"
                    aria-label="划词翻译: 显示小圆点"
                />
            </div>
            <div class="flex items-center justify-between gap-3">
                <div class="font-medium min-w-0 flex items-center line-clamp-1">
                    总是翻译简体中文页面
                </div>
                <Toggle
                    size="small"
                    spanClass="me-0 cursor-pointer bg-gray-300 dark:bg-gray-500"
                    aria-label="总是翻译简体中文页面"
                />
            </div>
            <div class="flex items-center justify-between gap-3">
                <div class="font-medium min-w-0 flex items-center line-clamp-1">
                    自动开启双语字幕
                </div>
                <Toggle
                    size="small"
                    spanClass="me-0 cursor-pointer bg-gray-300 dark:bg-gray-500"
                    aria-label="自动开启双语字幕"
                />
            </div>
        </section>

        <section class="grid grid-cols-3 gap-3 text-sm">
            <Button
                class="bg-mist-100 hover:bg-mist-200/70 dark:bg-mist-700 hover:dark:bg-mist-600 rounded-xl py-2 text-gray-900 dark:text-gray-100 px-1 gap-1"
            >
                <span>📄</span>
                <span class="font-medium"> 文档翻译 </span>
            </Button>
            <Button
                class="bg-mist-100 hover:bg-mist-200/70 dark:bg-mist-700 hover:dark:bg-mist-600 rounded-xl py-2 text-gray-900 dark:text-gray-100 px-1 gap-1"
            >
                <span>T</span>
                <span class="font-medium"> 文本翻译 </span>
            </Button>
            <Button
                class="bg-mist-100 hover:bg-mist-200/70 dark:bg-mist-700 hover:dark:bg-mist-600 rounded-xl py-2 text-gray-900 dark:text-gray-100 px-1 gap-1"
            >
                <span>⚒️</span>
                <span class="font-medium"> 工具箱 </span>
            </Button>
        </section>
    </section>

    <footer class="p-2 text-sm flex items-center justify-between">
        <div class="flex items-center gap-1">
            <CogOutline class="shrink-0 h-4 w-4" />
            <span>设置</span>
        </div>
        <div class="text-gray-400">1.26.6</div>
        <div>
            <button type="button" class="min-w-0 flex items-center">
                <span class="font-medium"> 更多 </span>
                <ChevronDownOutline class="h-6 w-6 text-gray-400" />
            </button>
            <Dropdown
                simple
                placement="bottom-end"
                class="max-h-96 overflow-y-auto bg-white/80 backdrop-blur-xs dark:bg-gray-700/80"
            >
                <DropdownItem>Dashboard</DropdownItem>
                <DropdownItem>Settings</DropdownItem>
                <DropdownItem>Earnings</DropdownItem>
                <DropdownItem>Separated link</DropdownItem>
            </Dropdown>
        </div>
    </footer>
</main>
