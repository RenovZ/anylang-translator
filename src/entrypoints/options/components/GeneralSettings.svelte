<script lang="ts">
    import type { ToggleItem } from "../../popup/data";
    import type { V2OptionsConfig } from "../types";

    export let config: V2OptionsConfig;
    export let toggleItems: ToggleItem[];
    export let newSite = "";
    export let loading = false;
    export let saving = false;
    export let isDirty = false;
    export let saveOptions: () => void | Promise<void>;
    export let resetOptions: () => void | Promise<void>;
    export let getProviderModels: (provider: string) => string[];
</script>

<section
    id="general"
    class="scroll-mt-28 rounded-2xl border border-slate-200 bg-slate-50 p-6"
>
    <div class="flex items-start justify-between gap-4">
        <div>
            <h2 class="text-lg font-semibold">基本设置</h2>
            <p class="mt-1 text-sm text-slate-400">
                基本设置正在拆分为独立组件，后续继续完善这一块。
            </p>
        </div>
        <div class="text-right text-xs text-slate-400">
            {#if loading}
                读取中
            {:else if saving}
                保存中
            {:else if isDirty}
                未保存
            {:else}
                已同步
            {/if}
        </div>
    </div>

    <div class="mt-6 grid gap-4 md:grid-cols-2">
        <div class="rounded-xl border border-slate-200 bg-white p-4">
            <div class="text-sm font-medium text-slate-700">目标语言</div>
            <div class="mt-2 text-sm text-slate-500">{config.targetLanguage}</div>
        </div>
        <div class="rounded-xl border border-slate-200 bg-white p-4">
            <div class="text-sm font-medium text-slate-700">翻译服务</div>
            <div class="mt-2 text-sm text-slate-500">{config.provider}</div>
        </div>
    </div>
</section>
