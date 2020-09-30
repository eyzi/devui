<template>
	<div class="main">
		<div>
			<input type="checkbox" :checked="isActive" @change="toggleActive" />
			<span>Build for Itch.io</span>
		</div>
		<div class="option-config" v-if="isActive">
			<hr />
			<div>
				<span>You need to be logged into Itch Oauth to upload builds</span>
				<!-- <button v-if="loggedIn" @click="itchLogout">Logout</button>
				<button v-else @click="itchLogin">Login</button> -->
			</div>
			<div>
				<span>App ID: </span>
				<input
					class="purple-focus"
					v-model="option.id"
					placeholder="user/game"
					@change="save"
				/>
				<span class="tip">The format is &lt;your_username&gt;/&lt;your_app_name&gt;</span>
			</div>
			<div class="arch-list">
				<span>Platforms: </span>
				<div class="arch">
					<input type="checkbox" :checked="forWin" @change="toggleArch($event,'win')" />
					<span>Windows</span>
				</div>
				<div class="arch">
					<input type="checkbox" :checked="forOsx" @change="toggleArch($event,'osx')" />
					<span>MacOS</span>
				</div>
				<div class="arch">
					<input type="checkbox" :checked="forLinux" @change="toggleArch($event,'linux')" />
					<span>Linux</span>
				</div>
			</div>
			<div v-if="building" class="building-info">
				<label for="build">Building:</label>
				<progress id="build" :value="building" max="100">{{ building }}%</progress>
			</div>
		</div>
	</div>
</template>

<script>
import { mapActions } from 'vuex'
import BuildBus from '@/components/Buses/BuildBus.js'
export default {
	props: [
		'app'
	],
	data: ()=>({
		label: 'ITCH',
		loggedIn: false,
		building: null
	}),
	mounted() {
		if (!this.app.options[this.label])
			this.$set(this.app.options, this.label, {})

		if (typeof this.option.active === 'undefined')
			this.$set(this.app.options[this.label], 'active', false)

		BuildBus.$on('build', () => {
			this.build()
		})
		
		window.ipcRenderer.on('itchGetLogin', (e, loggedIn) => {
			this.loggedIn = loggedIn
		})
		window.ipcRenderer.send('itchGetLogin')

		window.ipcRenderer.on('itchBuildStarted', (e, data) => {
			if (data.gameId !== this.option.id) return
			this.building = 0
		})
		window.ipcRenderer.on('itchBuildProgress', (e, data) => {
			if (data.gameId !== this.option.id) return
			this.building = data.percent
		})
		window.ipcRenderer.on('itchBuildUploaded', (e, data) => {
			if (data.gameId !== this.option.id) return
			this.building = null
		})
	},
	computed: {
		option() {
			return this.app.options[this.label] || {}
		},
		isActive() {
			return this.app.id ? this.option.active : false
		},
		forWin() {
			return this.option[`arch-win`]
		},
		forOsx() {
			return this.option[`arch-osx`]
		},
		forLinux() {
			return this.option[`arch-linux`]
		}
	},
	methods: {
		...mapActions('apps', [
			'updateApp'
		]),
		save() {
			this.updateApp(this.app)
		},
		toggleActive(e) {
			this.$set(this.app.options[this.label], 'active', e.target.checked)
			this.save()
		},
		build() {
			if (this.option && this.option.active && this.loggedIn) {
				window.ipcRenderer.send('buildItch', this.app)
			}
		},
		toggleArch(e, arch) {
			this.$set(this.app.options[this.label], `arch-${arch}`, e.target.checked)
			this.save()
		},
		itchLogin() {
			window.ipcRenderer.send('itchLogin')
		},
		itchLogout() {
			window.ipcRenderer.send('itchLogout')
		}
	}
}
</script>

<style lang="scss" scoped>
.main {
	margin: 1em 0;
	padding: 0.5em 1em;
	border-radius: 0.3em;
	background-color: rgb(199, 222, 243);
}
.purple-focus {
	border: none;
	border-bottom: 1px solid rgb(224, 224, 224);
	&:active,
	&:focus {
		outline: none;
		border-bottom: 1px solid rgb(182, 91, 218);
	}
}
.arch-list {
	.arch {
		display: inline-block;
		margin: 0.5em 1em;
	}
}
.tip {
	font-size: 0.8em;
	color: gray;
	margin: 0 0.3em;
}
</style>