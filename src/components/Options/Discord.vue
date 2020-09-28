<template>
	<div class="main">
		<div>
			<input type="checkbox" :checked="isActive" @change="toggleActive" />
			<span>Build for Discord</span>
		</div>
		<div v-if="isActive">
			<hr />
			<div>
				<span class="tip">This only uploads to the master branch for now.</span>
			</div>
			<div>
				<span>You need to be logged into Discord Oauth to upload builds </span>
				<button v-if="loggedIn" @click="discordLogout">Logout</button>
				<button v-else @click="discordLogin">Login</button>
			</div>
			<div>
				<span>App ID: </span>
				<input
					class="purple-focus"
					v-model="option.id"
					placeholder="App Id"
					@change="save"
				/>
				<span class="tip">This is the Client ID of your App</span>
			</div>
			<div>
				<DirectorySelect
					label="Config File"
					:dir="option.configFile"
					:isFolder="false"
					:selectTitle="`Select config file for ${app.name}`"
					@select="selectConfigFile"
					@clear="clearConfigFile"
				/>
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
import DirectorySelect from '@/components/DirectorySelect.vue';
export default {
	components: {
		DirectorySelect
	},
	props: [
		'app'
	],
	data: ()=>({
		label: 'DISCORD',
		loggedIn: true,
		building: null
	}),
	mounted() {
		if (!this.app.options[this.label])
			this.$set(this.app.options, this.label, {})

		if (typeof this.option.active === 'undefined')
			this.$set(this.app.options[this.label], 'active', false)
		
		window.ipcRenderer.on('discordGetLogin', (e, loggedIn) => {
			this.loggedIn = loggedIn
		})
		window.ipcRenderer.send('discordGetLogin')

		window.ipcRenderer.on('discordBuildStarted', (e, data) => {
			if (data.gameId !== this.option.id) return
			this.building = 0
		})
		window.ipcRenderer.on('discordBuildProgress', (e, data) => {
			if (data.gameId !== this.option.id) return
			this.building = data.percent
		})
		window.ipcRenderer.on('discordBuildUploaded', (e, data) => {
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
		discordLogout() {
			window.ipcRenderer.send('discordLogout')
		},
		discordLogin() {
			window.ipcRenderer.send('discordLogin')
		},
		selectConfigFile(dir) {
			this.$set(this.app.options[this.label], 'configFile', dir)
			this.save()
		},
		clearConfigFile() {
			this.$set(this.app.options[this.label], 'configFile', null)
			this.save()
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
.config-file {
	padding: 0.5em 1em;
	background-color: rgb(236, 236, 236);
	border-radius: 0.3em;
}
.tip {
	font-size: 0.8em;
	color: gray;
	margin: 0 0.3em;
}
</style>