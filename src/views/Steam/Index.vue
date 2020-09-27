<template>
	<div class="main">
		<div>
			<span>Username: </span>
			<input v-model="steamInfo.username" placeholder="Username" />
		</div>
		<div>
			<span>Password: </span>
			<input v-model="steamInfo.password" type="password" placeholder="Password" />
		</div>
		<div>
			<span>Steam Guard: </span>
			<input v-model="steamInfo.code" placeholder="Code" />
		</div>
		<div>
			<button @click="send">Send</button>
		</div>
	</div>
</template>

<script>
export default {
	data: ()=>({
		steamInfo: {
			username: '',
			password: '',
			code: '',
			gameId: null,
			buildFile: null
		}
	}),
	mounted() {
		window.ipcRenderer.on('clear', () => {
			this.clear()
		})
		window.ipcRenderer.on('buildFile', (e, buildFile) => {
			this.steamInfo.buildFile = buildFile
		})
		window.ipcRenderer.on('gameId', (e, gameId) => {
			this.steamInfo.gameId = gameId
		})
	},
	methods: {
		clear() {
			this.steamInfo = {
				username: '',
				password: '',
				code: '',
				gameId: null,
				buildFile: null
			}
		},
		send() {
			window.ipcRenderer.send('steamLoginBuild', this.steamInfo)
		}
	}
}
</script>

<style lang="scss" scoped>
.main {
	text-align: center;
	padding: 0.5em 1em;
}
</style>