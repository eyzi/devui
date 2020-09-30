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
			<span class="pathsep">/</span>
			<span>{{ app.name || "&lt;Unnamed&gt;" }}</span>
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
				label="App Directory"
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
			<button @click="buildApp">📤 Build</button>
			<button @click="deleteApp">🗑️ Delete</button>
		</div>
		<StatusBar />
	</div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import BuildBus from '@/components/Buses/BuildBus.js'
import DirectorySelect from '@/components/Common/DirectorySelect.vue'
import StatusBar from '@/components/Common/StatusBar.vue'
import OptionItch from '@/components/BuildOptions/Itch.vue'
import OptionDiscord from '@/components/BuildOptions/Discord.vue'
import OptionSteam from '@/components/BuildOptions/Steam.vue'
export default {
	components: {
		DirectorySelect,
		StatusBar,
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
			let confirmDelete = window.ipcRenderer.sendSync('confirmDelete', {...this.app, dialogType: 'warning'});
			if (confirmDelete) {
				this.removeApp(this.app.id)
				this.gotoHome()
			}
		},
		buildApp() {
			BuildBus.$emit('build')
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
	padding: 0.5em 1em 2.5em;
}
.underline-hover {
	border-bottom: 1px solid none;
	cursor: pointer;

	&:hover {
		border-bottom: 1px solid rgb(182, 91, 218);
	}

	&:active,
	&:focus {
		outline: none;
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
.actions {
	button {
		cursor: pointer;
		margin: 0.3em;
		padding: 0.2em 0.5em;
		border: none;
		border-radius: 0.3em;
		background:rgb(223, 180, 240);

		&:hover,
		&:active,
		&:focus {
			background: rgb(182, 130, 202);
			outline: none;
		}
	}
}
.app-name {
	margin: 1.2em;
	text-align: center;

	input {
		font-size: 1.5em;
		text-align: center;
		color: rgb(164, 71, 201);
	}
}
.pathsep {
	display: inline-block;
	margin: 0 0.5em;
}
</style>