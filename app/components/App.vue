<template>
  <Page class="page">
    <ActionBar
      class="action-bar bg-primary"
      :title="view ? 'Dokumente speichern' : 'Einstellungen'"
    >
      <ActionItem
        ios-system-icon="16"
        ios.position="right"
        :text="view === 'main' ? 'Einstellungen' : 'Zurück'"
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
    <Label :text="view" />
    <Settings
      v-if="view === 'settings'"
      @back="view = 'main'"
    />
    <StackLayout
      v-else-if="view = 'main'"
    >
      <Button
        v-if="!loggedIn"
        :text="loading ? 'Lade...' : 'OneDrive Login'"
        class="btn btn-primary"
        @tap="login()"
      />
      <Photo
        v-else-if="image === ''"
        @selected="selected"
      />
      <Upload
        v-if="image !== ''"
        :img="image"
        @success="e => uploaded(e)"
        @cancel="cancel()"
      />
      <Button
        v-show="pdfUrl !== ''"
        text="Gespeichertes PDF öffnen"
        class="btn btn-primary"
        @tap="openPdf()"
      />
    </StackLayout>
  </Page>
</template>

<script>
import Photo from '@/components/Photo.vue';
import Upload from '@/components/Upload.vue';
import Settings from '@/components/Settings.vue';

const appSettings = require('application-settings');
const auth_service_1 = require('../auth-service');
const utilsModule = require('tns-core-modules/utils/utils');

export default {
  components: {
    Photo, Upload, Settings,
  },
  data() {
    return {
      view: 'main',
      image: '',
      mstoken: '',
      pdfUrl: '',
      loggedIn: false,
      loading: false,
      user: {},
    };
  },
  mounted() {
    const mstoken = appSettings.getString('mstoken');

    if (mstoken) {
      this.mstoken = mstoken;
      this.getUser(mstoken);
    }
  },
  methods: {
    setView(view) {
      this.view = view;
    },
    login() {
      auth_service_1.tnsOauthLogin('microsoft').then((token) => {
        console.log('Login complete, token: ', token);
        this.loading = true;
        appSettings.setString('mstoken', token);
        this.mstoken = token;
        this.getUser(token);
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
    uploaded(pdfUrl) {
      console.log('PDFURL: ', pdfUrl);
      this.image = '';
      this.pdfUrl = pdfUrl;
    },
    openPdf() {
      utilsModule.openUrl(this.pdfUrl);
    },
    getUser(mstoken) {
      const odurl = 'https://graph.microsoft.com/v1.0/me';
      console.log('TOKEN', mstoken);
      fetch(odurl, {
        method: 'GET',
        headers: { Authorization: `Bearer ${mstoken}` },
      })
        .then((response) => {
          console.log(response);
          if (response.statusText === 'Unauthorized') {
            console.log('ERROR', response);
            this.loggedIn = false;
            this.loading = false;
          } else {
            console.log('LOGGING IN');
            response.json().then((json) => {
              console.log('LOGGED IN');
              this.loggedIn = true;
              this.user = json;
              this.loading = false;
              if (!appSettings.getString('mainFolderId')) {
                this.view = 'settings';
              }
            });
          }
        }).catch((e) => {
        });
    },
    cancel() {
      this.image = '';
      this.pdfUrl = '';
    },
  },
};
</script>

<style scoped lang="scss">
    ActionBar {
         background-color: #0078d7;
         color: #ffffff;
     }
     ActionItem {
       color: #ffffff;
     }
</style>
