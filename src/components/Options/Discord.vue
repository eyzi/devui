<template>
	<div class="main">
		<div>
			<input type="checkbox" :checked="isActive" @change="toggleActive" />
			<span>{{ label }}</span>
		</div>
		<div v-if="isActive">
			{{ label }} OPTION
			<input
				class="purple-focus"
				v-model="option.id"
				placeholder="App Id"
				@change="save"
			/>
		</div>
	</div>
</template>

<script>
import { mapActions } from 'vuex'
export default {
	props: [
		'app'
	],
	data: ()=>({
		label: 'DISCORD'
	}),
	mounted() {
		if (!this.app.options[this.label])
			this.$set(this.app.options, this.label, {})

		if (typeof this.option.active === 'undefined')
			this.$set(this.app.options[this.label], 'active', false)
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
		}
	}
}
</script>

<style lang="scss" scoped>
.main {
	margin: 0.5em 1em;
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