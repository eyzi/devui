<template>
	<div class="main">
		<div class="dir-block">{{ appDiv || "&lt;No Directory&gt;" }}</div>
			<div class="actions">
				<button class="action-btn" @click="setAppDirectory">
					<div class="btn-label">Browse</div>
					<div class="btn-shortcut"></div>
				</button>
				<button v-if="appDiv" class="action-btn" @click="clearAppDirectory">
					<div class="btn-label">Clear</div>
					<div class="btn-shortcut"></div>
				</button>
				<button v-if="appDiv" class="action-btn" @click="openDirectory">
					<div class="btn-label">Open</div>
					<div class="btn-shortcut"></div>
				</button>
			</div>
	</div>
</template>

<script>
import { mapActions } from 'vuex'
export default {
	props: [
		'app'
	],
	computed: {
		appDiv() {
			return this.app.dir ? this.app.dir : null;
		}
	},
	methods: {
		...mapActions('apps', [
			'updateApp',
			'removeApp'
		]),
		clearAppDirectory() {
			this.$set(this.app, 'dir', null)
			this.updateApp(this.app)
		},
		setAppDirectory() {
			let dir = window.ipcRenderer.sendSync('appDirectory', {name: this.appName});
			if (dir) {
				this.$set(this.app, 'dir', dir)
				this.updateApp(this.app)
			}
		},
		openDirectory() {
			window.ipcRenderer.send('openDirectory', this.app.dir);
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