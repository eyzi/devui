<template>
	<div class="main">
		<div>
			<span class="input-label">Account name </span>
			<input class="input-box" v-model="steamInfo.username" />
		</div>
		<div>
			<span class="input-label">Password </span>
			<input class="input-box" v-model="steamInfo.password" type="password" />
		</div>
		<div>
			<span class="input-label">Steam Guard </span>
			<input class="input-box code" maxlength="5" v-model="steamInfo.code" placeholder="CODE" />
		</div>
		<div>
			<button class="login-btn" @click="send">LOGIN</button>
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
		window.ipcRenderer.on('addInfo', (e, info) => {
			console.log("MORE INFO")
			this.steamInfo = {...this.steamInfo, ...info}
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
	width: 100vw;
	height: 100vh;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	color: rgb(197, 197, 197);
	background-color: rgb(39, 39, 39);

	& > div {
		margin: 0.5em 0;
	}
}
.input-label {
	display: inline-block;
	text-align: right;
	width: 7em;
	margin-right: 1em;
}
.input-box {
	width: 20em;
	padding: 0.4em 0.5em;
	color: rgb(197, 197, 197);
	border: 1px solid rgb(167, 167, 167);
	background-color: rgb(66, 66, 66);

	&:hover,
	&:active,
	&:focus {
		outline: none;
		background-color: rgb(39, 39, 39);
	}

	&.code {
		letter-spacing: 1em;
		text-transform: uppercase;
		text-align: center;
	}
}
.login-btn {
	cursor: pointer;
	padding: 0.3em 2em;
	border: none;
	color: rgb(197, 197, 197);
	background-color: rgb(66, 66, 66);

	&:hover,
	&:active,
	&:focus {
		outline:none;
		background-color: rgb(92, 92, 92);
	}
}
</style>