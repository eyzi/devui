<template>
	<div class="main">
		<div class="dir-block">{{ dir || "&lt;No Directory&gt;" }}</div>
		<div class="actions">
			<button class="action-btn" @click="browse">
				<div class="btn-label">Browse</div>
				<div class="btn-shortcut"></div>
			</button>
			<button v-if="dir" class="action-btn" @click="clear">
				<div class="btn-label">Clear</div>
				<div class="btn-shortcut"></div>
			</button>
			<button v-if="dir" class="action-btn" @click="open">
				<div class="btn-label">Open</div>
				<div class="btn-shortcut"></div>
			</button>
		</div>
	</div>
</template>

<script>
export default {
	props: [
		'dir',
		'isFolder',
		'selectTitle'
	],
	methods: {
		browse() {
			let options = {
				title: this.selectTitle,
				isFolder: this.isFolder
			}
			let dir = window.ipcRenderer.sendSync('openDialog', options);
			if (dir) {
				this.$emit('select', dir)
			}
		},
		clear() {
			this.$emit('clear')
		},
		open() {
			window.ipcRenderer.send('openDirectory', {
				dir: this.dir,
				isFolder: this.isFolder
			});
		}
	}
}
</script>

<style lang="scss" scoped>
.main {
	margin: 1em 0.5em;
}
.dir-block {
	background-color: rgb(233, 233, 233);
	border-radius: 0.5em;
	padding: 0.5em 1em;
}
.actions > button {
	margin: 0.2em;
}
</style>