<script>
    import { candidates } from '@sudoku/stores/candidates';
    import { userGrid, grid } from '@sudoku/stores/grid';
    import { cursor } from '@sudoku/stores/cursor';
    import { hints } from '@sudoku/stores/hints';
    import { notes } from '@sudoku/stores/notes';
    import { settings } from '@sudoku/stores/settings';
    import { keyboardDisabled } from '@sudoku/stores/keyboard';
    import { gamePaused } from '@sudoku/stores/game';
    import { modal } from '@sudoku/stores/modal';
    import { SUDOKU_SIZE } from '@sudoku/constants';
    
    // 导入提示功能模块 
    import { strategies, findNextHint } from '@sudoku/stores/hints';
    // 导入 svelte 的 get 函数
    import { get } from 'svelte/store';

    $: hintsAvailable = $hints > 0;
    
    function handleHint() {
        if (!hintsAvailable) return;

        const userGridData = [...$userGrid];
        let hint;
        
        try {
            // 检查是否有选中格子
            if ($cursor.x !== null && $cursor.y !== null) {
                // 如果选中的格子已有数字，直接寻找下一个可提示的格子
                if (userGridData[$cursor.y][$cursor.x] !== 0) {
                    hint = findNextHint(userGridData, null, null);
                } else {
                    // 获取选中格子的提示
                    hint = findNextHint(userGridData, $cursor.x, $cursor.y);
                }
            } else {
                // 没有选中格子，自动寻找可填入答案的格子
                hint = findNextHint(userGridData, null, null);
            }

            if (!hint) {
                modal.show('confirm', {
                    title: "提示",
                    text: "没有找到可提示的格子。",
                    button: "确定"
                });
                return;
            }
            
            console.log("找到提示:", hint);
            
            // 移动光标到提示的格子
            cursor.set(hint.x, hint.y);
            
            // 如果有确定答案
            if (hint.value !== null && hint.value !== undefined) {
                // 填入答案
                userGrid.set({x: hint.x, y: hint.y}, hint.value);
                
                // 显示策略提示
                modal.show('confirm', {
                    title: strategies[hint.strategy]?.name || "提示",
                    text: hint.explanation,
                    button: "明白了"
                });
            } else {
                // 有多个候选值，显示提示但不自动填入
                if (hint.candidates && hint.candidates.length > 0) {
                    // 构建友好的提示信息
                    let notesTip = "";
                    if (!$notes) {
                        notesTip = "您可以点击右下角的笔记按钮 ✏️，然后输入这些数字来标记候选值。";
                    } else {
                        notesTip = "笔记模式已开启 ✅，您现在可以直接输入这些数字来标记候选值。";
                    }
                    
                    modal.show('confirm', {
                        title: "当前无法确定该格的答案 🤔",
                        text: `在第${hint.y + 1}行第${hint.x + 1}列可填入的候选值有: ${hint.candidates.join(', ')}\n\n${hint.explanation}\n\n${notesTip}`,
                        button: "明白了"
                    });
                } else {
                    modal.show('confirm', {
                        title: "提示",
                        text: "无法为此格子提供候选值。",
                        button: "确定"
                    });
                    return;
                }
            }
            
            // 消耗一个提示次数
            hints.use();
        } catch (error) {
            console.error("提示功能出错:", error);
            modal.show('confirm', {
                title: "提示错误 ⚠️",
                text: `提供提示时发生错误: ${error.message || "请稍后重试"}`,
                button: "确定"
            });
        }
    }
</script>

<div class="action-buttons space-x-3">

    <button class="btn btn-round" disabled={$gamePaused} title="Undo">
        <svg class="icon-outline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
        </svg>
    </button>

    <button class="btn btn-round" disabled={$gamePaused} title="Redo">
        <svg class="icon-outline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 10h-10a8 8 90 00-8 8v2M21 10l-6 6m6-6l-6-6" />
        </svg>
    </button>

    <button class="btn btn-round btn-badge" disabled={$gamePaused || !hintsAvailable} on:click={handleHint} title="提示">
        <svg class="icon-outline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>

        {#if $settings.hintsLimited}
            <span class="badge" class:badge-primary={hintsAvailable}>{$hints}</span>
        {/if}
    </button>

    <button class="btn btn-round btn-badge" on:click={notes.toggle} title="Notes ({$notes ? 'ON' : 'OFF'})">
        <svg class="icon-outline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>

        <span class="badge tracking-tighter" class:badge-primary={$notes}>{$notes ? 'ON' : 'OFF'}</span>
    </button>

</div>


<style>
    .action-buttons {
        @apply flex flex-wrap justify-evenly self-end;
    }

    .btn-badge {
        @apply relative;
    }

    .badge {
        min-height: 20px;
        min-width:  20px;
        @apply p-1 rounded-full leading-none text-center text-xs text-white bg-gray-600 inline-block absolute top-0 left-0;
    }

    .badge-primary {
        @apply bg-primary;
    }
</style>