<template>
	<div class="status-bar">
		<div class="left">
			<button v-if="updateAvailable">📥</button>
		</div>
		<div class="right">
			<div class="build-option-btn" @click="toggleDiscordLogin">Discord {{ discordLoggedIn ? '✔' : '❌'}}</div>
			<div class="build-option-btn" @click="toggleItchLogin">Itch {{ itchLoggedIn ? '✔' : '❌'}}</div>
			<div class="build-option-btn" @click="toggleSteamLogin">Steam {{ steamLoggedIn ? '✔' : '❌'}}</div>
		</div>
	</div>
</template>

<script>
export default {
	data: ()=>({
		updateAvailable: false,
		discordLoggedIn: false,
		itchLoggedIn: false,
		steamLoggedIn: false
	}),
	mounted() {
		// DISCORD LOGIN
		window.ipcRenderer.on('discordGetLogin', (e, loggedIn) => {
			this.discordLoggedIn = loggedIn
		})
		window.ipcRenderer.send('discordGetLogin')
		
		// ITCH LOGIN
		window.ipcRenderer.on('itchGetLogin', (e, loggedIn) => {
			this.itchLoggedIn = loggedIn
		})
		window.ipcRenderer.send('itchGetLogin')
		
		// STEAM LOGIN
		// window.ipcRenderer.on('steamGetLogin', (e, loggedIn) => {
		// 	this.steamLoggedIn = loggedIn
		// })
		// window.ipcRenderer.send('steamGetLogin')
	},
	methods: {
		toggleDiscordLogin() {
			if (this.discordLoggedIn) {
				window.ipcRenderer.send('discordLogout')
			} else {
				window.ipcRenderer.send('discordLogin')
			}
		},
		toggleItchLogin() {
			if (this.itchLoggedIn) {
				window.ipcRenderer.send('itchLogout')
			} else {
				window.ipcRenderer.send('itchLogin')
			}
		},
		toggleSteamLogin() {
			// if (this.steamLoggedIn) {
				
			// } else {

			// }
		}
	}
}
</script>

<style lang="scss" scoped>
.status-bar {
	position: fixed;
	left: 0;
	bottom: 0;
	width: 100%;
	color: white;
	background-color: rgb(172, 66, 182);
	display: flex;
	flex-direction: row;

	> .left {
		display: flex;
		flex-direction: row;
		justify-content: flex-start;
		flex: 1;
	}

	> .right {
		display: flex;
		flex-direction: row;
		justify-content: flex-end;
		flex: 1;
	}
}

.build-option-btn {
	cursor: pointer;
	padding: 0.2em 0.5em;

	&:hover {
		background-color: rgb(144, 47, 153);
	}
}
</style>