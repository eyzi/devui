<template>
	<div class="main">
		<AppBarDisplay v-for="app in apps" :key="app.id" :app="app" />
	</div>
</template>

<script>
import AppBarDisplay from '@/components/App/AppBarDisplay.vue';
import { mapGetters } from 'vuex'
export default {
	components: {
		AppBarDisplay
	},
	computed: {
		...mapGetters('apps', [
			'apps'
		])
	}
}
</script>

<style lang="scss" scoped>
.main {
	width: 100%;
	margin: 0.5em;
}
</style>