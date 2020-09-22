<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<style lang="scss">
@font-face {
  font-family: 'Nunito';
  src:  url('./assets/fonts/Nunito/Nunito-Regular.ttf') format('ttf');
  font-weight: normal;
  font-style: normal;
}

#app {
  font-family: Nunito;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  width: 100%;
  min-width: 100vw;
  height: 100%;
  min-height: 100vh;
}
</style>
