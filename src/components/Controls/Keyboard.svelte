<script>
	import { userGrid } from '@sudoku/stores/grid';
	import { cursor } from '@sudoku/stores/cursor';
	import { notes } from '@sudoku/stores/notes';
	import { candidates } from '@sudoku/stores/candidates';
	import { history } from '@sudoku/stores/history';
	import { keyboardDisabled } from '@sudoku/stores/keyboard';
	import { backtrack } from '@sudoku/stores/backtrack';  // 添加这一行

	function handleKeyButton(num) {
		if (!$keyboardDisabled) {
			const position = $cursor;
			const oldValue = $userGrid[position.y][position.x];
			const oldCandidates = $candidates[position.x + ',' + position.y];

			// 首先记录历史，再更新状态
			const moveData = {
				position: {...position}, 
				oldValue,
				newValue: num,
				oldCandidates: oldCandidates ? {...oldCandidates} : null,
				newCandidates: null,
				timestamp: Date.now()
			};

			if ($notes) {
				if (num === 0) {
					moveData.newValue = oldValue;
					moveData.newCandidates = null;
					history.recordMove(moveData);
					candidates.clear(position);
				} else {
					const newCandidates = candidates.add(position, num);
					moveData.newValue = oldValue;
					moveData.newCandidates = {...newCandidates};
					history.recordMove(moveData);
				}
			} else {
				if (oldCandidates) {
					candidates.clear(position);
				}
				history.recordMove(moveData);
				userGrid.set(position, num);
			}
		}
	}

	function handleKey(e) {
		switch (e.key || e.keyCode) {
			case 'ArrowUp':
			case 38:
			case 'w':
			case 87:
				cursor.move(0, -1);
				break;

			case 'ArrowDown':
			case 40:
			case 's':
			case 83:
				cursor.move(0, 1);
				break;

			case 'ArrowLeft':
			case 37:
			case 'a':
			case 65:
				cursor.move(-1);
				break;

			case 'ArrowRight':
			case 39:
			case 'd':
			case 68:
				cursor.move(1);
				break;

			case 'Backspace':
			case 8:
			case 'Delete':
			case 46:
				handleKeyButton(0);
				break;

			default:
				if (e.key && e.key * 1 >= 0 && e.key * 1 < 10) {
					handleKeyButton(e.key * 1);
				} else if (e.keyCode - 48 >= 0 && e.keyCode - 48 < 10) {
					handleKeyButton(e.keyCode - 48);
				}
				break;
		}
	}
</script>

<svelte:window on:keydown={handleKey} /><!--on:beforeunload|preventDefault={e => e.returnValue = ''} />-->

<div class="keyboard-grid">

	{#each Array(10) as _, keyNum}
		{#if keyNum === 9}
			<button class="btn btn-key" disabled={$keyboardDisabled} title="Erase Field" on:click={() => handleKeyButton(0)}>
				<svg class="icon-outline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
				</svg>
			</button>
		{:else}
			<button class="btn btn-key" disabled={$keyboardDisabled} title="Insert {keyNum + 1}" on:click={() => handleKeyButton(keyNum + 1)}>
				{keyNum + 1}
			</button>
		{/if}
	{/each}

</div>

<style>
	.keyboard-grid {
		@apply grid grid-rows-2 grid-cols-5 gap-3;
	}


	.btn-key {
		@apply py-4 px-0;
	}
</style>