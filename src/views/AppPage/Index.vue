<template>
	<div class="main">
		<div>
			<span
				class="underline-hover"
				tabindex="1"
				@click="gotoHome"
			>
				AppList
			</span>
			<span> &lt; </span>
			<span>{{ app.name || "Unnamed" }}</span>
		</div>
		<div class="app-info">
			<div class="app-name">
				<input
					class="purple-focus"
					v-model="app.name"
					@change="save"
					placeholder="App Name"
				/>
			</div>
			<DirectorySelect
				:dir="app.dir"
				:isFolder="true"
				:selectTitle="`Select Directory for ${app.name}`"
				@select="selectAppDir"
				@clear="clearAppDir"
			/>
			<div class="app-options">
				<OptionItch :app="app" />
				<OptionDiscord :app="app" />
				<OptionSteam :app="app" />
			</div>
		</div>
		<div class="actions">
			<button @click="buildApp">Build</button>
			<button @click="deleteApp">Delete</button>
		</div>
	</div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import DirectorySelect from '@/components/DirectorySelect.vue';
import OptionItch from '@/components/Options/Itch.vue';
import OptionDiscord from '@/components/Options/Discord.vue';
import OptionSteam from '@/components/Options/Steam.vue';
export default {
	components: {
		DirectorySelect,
		OptionItch,
		OptionDiscord,
		OptionSteam
	},
	data: ()=>({
		app: {}
	}),
	computed: {
		...mapGetters('apps', {
			getAppById: 'app'
		})
	},
	beforeMount() {
		if (!this.$route.params.id)
			return this.$router.push({ path: "/" })

		this.app = this.getAppById(this.$route.params.id);
	},
	methods: {
		...mapActions('apps', [
			'updateApp',
			'removeApp'
		]),
		gotoHome() {
			this.$router.push({ path: "/" })
		},
		save() {
			this.updateApp(this.app)
		},
		deleteApp() {
			let confirmDelete = window.ipcRenderer.sendSync('confirmDelete', this.app);
			if (confirmDelete) {
				this.removeApp(this.app.id)
				this.gotoHome()
			}
		},
		buildApp() {
			let oItch = this.app.options['ITCH']
			if (oItch && oItch.active) {
				window.ipcRenderer.send('buildItch', this.app)
			}

			let oDiscord = this.app.options['DISCORD']
			if (oDiscord && oDiscord.active) {
				window.ipcRenderer.send('buildDiscord', this.app)
			}

			let oSteam = this.app.options['STEAM']
			if (oSteam && oSteam.active) {
				window.ipcRenderer.send('buildSteam', this.app)
			}
		},
		selectAppDir(dir) {
			this.$set(this.app, 'dir', dir)
			this.save()
		},
		clearAppDir() {
			this.$set(this.app, 'dir', null)
			this.save()
		}
	}
}
</script>

<style lang="scss" scoped>
.main {
	padding: 0.2em 0.5em;
}
.underline-hover {
	border-bottom: 1px solid none;
	cursor: pointer;

	&:hover {
		border-bottom: 1px solid rgb(182, 91, 218);
	}
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
.actions > button {
	margin: 0.2em;
}
.app-name {
	margin: 0.5em 1em;
}
</style>