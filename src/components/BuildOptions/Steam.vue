<template>
	<div class="main">
		<div>
			<input type="checkbox" :checked="isActive" @change="toggleActive" />
			<span>Build for Steam</span>
		</div>
		<div v-if="isActive">
			<hr />
			<div>
				<span>App ID: </span>
				<input
					class="purple-focus"
					v-model="option.id"
					placeholder="App Id"
					@change="save"
				/>
			</div>
			<div>
				<DirectorySelect
					label="Build File (.vdf)"
					:dir="option.buildFile"
					:isFolder="false"
					:selectTitle="`Select build file (*.vdf) for ${app.name}`"
					@select="selectBuildFile"
					@clear="clearBuildFile"
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
import BuildBus from '@/components/Buses/BuildBus.js'
import DirectorySelect from '@/components/Common/DirectorySelect.vue'
export default {
	components: {
		DirectorySelect
	},
	props: [
		'app'
	],
	data: ()=>({
		label: 'STEAM',
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
		
		window.ipcRenderer.on('steamBuildStarted', (e, data) => {
			if (data.gameId !== this.option.id) return
			this.building = 0
		})
		window.ipcRenderer.on('steamBuildProgress', (e, data) => {
			if (data.gameId !== this.option.id) return
			this.building = data.percent
		})
		window.ipcRenderer.on('steamBuildUploaded', (e, data) => {
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
		build() {
			if (this.option && this.option.active) {
				window.ipcRenderer.send('buildSteam', this.app)
			}
		},
		selectBuildFile(dir) {
			this.$set(this.app.options[this.label], 'buildFile', dir)
			this.save()
		},
		clearBuildFile() {
			this.$set(this.app.options[this.label], 'buildFile', null)
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
</style>