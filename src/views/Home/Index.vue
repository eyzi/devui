<template>
	<div class="main">
		<AppAdder />
		<AppList />
		<StatusBar />
	</div>
</template>

<script>
import AppAdder from '@/components/App/AppAdder.vue'
import AppList from '@/components/App/AppList.vue'
import StatusBar from '@/components/Common/StatusBar.vue'
export default {
	components: {
		AppAdder,
		AppList,
		StatusBar
	}
}
</script>

<style lang="scss" scoped>
.main {
	display: flex;
	flex-direction: column;
	align-items: center;
	padding-bottom: 30px;
}
</style>