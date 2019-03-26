<template>
  <Page class="page">
    <ActionBar
      class="action-bar bg-primary"
      title="File It Up"
    >
      <ActionItem
        ios-system-icon="16"
        ios.position="right"
        :text="view === 'main' ? 'Einstellungen' : 'Haupt'"
        android.position="popup"
        @tap="view === 'main' ? setView('settings') : setView('main')"
      />
      <ActionItem
        ios-system-icon="16"
        ios.position="right"
        :text="loggedIn ? 'Abmelden' : 'Anmelden'"
        android.position="popup"
        @tap="loggedIn ? logout() : login()"
      />
    </ActionBar>
    <Settings
      v-if="view === 'settings'"
      @back="view = 'main'"
    />
    <StackLayout
      v-else-if="view = 'main'"
    >
      <StackLayout
        v-if="!loggedIn"
      >
        <Button
          text="Login"
          class="btn btn-primary"
          @tap="login()"
        />
      </StackLayout>
      <StackLayout
        v-if="loggedIn"
        class="p-20"
      >
        <Label
          :text="user.givenName+' '+user.surname"
        />
        <Photo
          v-if="image === ''"
          @selected="selected"
        />
        <Upload
          v-else
          :img="image"
        />
      </StackLayout>
    </StackLayout>
  </Page>
</template>

<script>
import Photo from '@/components/Photo.vue';
import Upload from '@/components/Upload.vue';
import Settings from '@/components/Settings.vue';

const appSettings = require('application-settings');
const auth_service_1 = require('../auth-service');

export default {
  components: {
    Photo, Upload, Settings,
  },
  data() {
    return {
      view: 'main',
      image: '',
      mstoken: '',
      loggedIn: false,
      user: {},
    };
  },
  mounted() {
    this.mstoken = appSettings.getString('mstoken');
    if (this.mstoken !== '') {
      this.getUser();
    }
  },
  methods: {
    setView(view) {
      this.view = view;
    },
    login() {
      auth_service_1.tnsOauthLogin('microsoft').then((token) => {
        appSettings.setString('mstoken', token);
        this.mstoken = appSettings.getString('mstoken');
        this.getUser();
      });
    },
    logout() {
      auth_service_1.tnsOauthLogout();
      appSettings.setString('mstoken', '');
      this.mstoken = '';
      this.loggedIn = false;
    },
    selected(img) {
      this.image = img;
    },
    getUser() {
      const odurl = 'https://graph.microsoft.com/v1.0/me';
      console.log('TOKEN', this.mstoken);
      fetch(odurl, {
        method: 'GET',
        headers: { Authorization: `Bearer ${this.mstoken}` },
      })
        .then((response) => {
          if (response.statusText === 'Unauthorized') {
            this.loggedIn = false;
          } else {
            this.loggedIn = true;
            response.json().then((json) => {
              this.user = json;
            });
          }
        }).catch((e) => {
        });
    },
  },
};
</script>

<style scoped lang="scss">
    // Start custom common variables
    // End custom common variables
    // Custom styles
    .fa {
        color: #000000;
    }

    .info {
        font-size: 20;
    }
</style>
