<template>
  <StackLayout class="p-20">
    <Button
      text="Login"
      class="btn btn-primary btn-active"
      @tap="onLoginTap()"
    />
    <Button
      text="Logout"
      class="btn btn-primary btn-active"
      @tap="onLogoutTap()"
    />
  </StackLayout>
</template>

<script>
const auth_service_1 = require('../auth-service');

export default {
  data() {
    return {};
  },
  methods: {
    onLoginTap() {
      auth_service_1.tnsOauthLogin('microsoft');
    },
    onLogoutTap() {
      auth_service_1.tnsOauthLogout();
    },
  },
};
</script>

<style scoped>
    ActionBar {
        background-color: #53ba82;
        color: #ffffff;
    }
    .message {
        vertical-align: center;
        text-align: center;
        font-size: 20;
        color: #333333;
    }
</style>
