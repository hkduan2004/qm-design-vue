<template>
  <qm-config-provider size="default" locale="zh-cn">
    <router-view />
  </qm-config-provider>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'App',
});
</script>
