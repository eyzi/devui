<template>
	<div class="main">
		<div><strong>Directory</strong></div>
		<div><span>{{ dirDisplay }}</span></div>
		<div class="actions">
			<button v-show="dir" @click="clearAppDirectory">Clear</button>
			<button @click="setAppDirectory">Browse</button>
		</div>
	</div>
</template>

<script>
export default {
	props: [
		'appName',
		'dir'
	],
	computed: {
		dirDisplay() {
			return this.dir ? this.dir : "<No directory>"
		}
	},
	methods: {
		clearAppDirectory() {
			this.$emit("change", null)
		},
		setAppDirectory() {
			let dir = window.ipcRenderer.sendSync('appDirectory', {name: this.appName});
			if (dir) this.$emit("change", dir)
		}
	}
}
</script>

<style lang="scss" scoped>
.main {
	margin: 1em 0.5em;
}

.actions > button {
	margin: 0.2em;
}
</style>