<template>
	<div class="main">
		<AppAdder />
		<AppList />
	</div>
</template>

<script>
import AppAdder from '@/components/AppAdder.vue';
import AppList from '@/components/AppList.vue';
export default {
	components: {
		AppAdder,
		AppList
	}
}
</script>

<style lang="scss" scoped>
.main {
	display: flex;
	flex-direction: column;
	align-items: center;
}
</style>