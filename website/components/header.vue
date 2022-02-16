<template>
  <div class="headerWrapper">
    <header class="header">
      <div class="container">
        <h1>
          <router-link to="/">
            <slot>
              <img src="../assets/img/logo.png" class="nav-logo" alt="" />
            </slot>
          </router-link>
        </h1>
      </div>
    </header>
  </div>
</template>

<script>
import { defineComponent } from 'vue';

export default defineComponent({
  data() {
    return {};
  },
});
</script>

<style lang="scss" scoped>
.headerWrapper {
  width: 100%;
  position: fixed;
  top: 0px;
  z-index: 9;
}

.header {
  background-color: #fff;
  color: #fff;
  top: 0;
  left: 0;
  width: 100%;
  height: 70px;
  border-bottom: 1px solid #dcdfe6;
  box-sizing: border-box;

  .container {
    height: 100%;
    display: flex;
    align-items: center;
  }

  h1 {
    margin: 0;
    float: left;
    font-size: 32px;
    font-weight: normal;

    a {
      color: #333;
      text-decoration: none;
      display: block;
    }
  }

  .nav-logo {
    width: 160px;
    vertical-align: middle;
  }
}
</style>
