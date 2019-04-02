<template>
  <Page class="page">
    <ActionBar
      class="action-bar bg-primary"
      :title="'title'|L"
    >
      <!-- <ActionItem
        ios-system-icon="16"
        ios.position="right"
        :text="view === 'main' ? 'Einstellungen' : 'Zurück'"
        android.position="popup"
        @tap="view === 'main' ? setView('settings') : setView('main')"
      /> -->
      <ActionItem
        v-show="loggedIn"
        ios-system-icon="16"
        ios.position="right"
        :text="'logout'|L"
        android.position="popup"
        @tap="logout()"
      />
    </ActionBar>
    <StackLayout
      v-if="view = 'main'"
    >
      <Label
        v-if="loggedIn && false"
        class="p-20"
        :text="'Angemeldet als '+user.givenName+' '+user.surname"
      />
      <Button
        v-if="!loggedIn"
        :text="loading ? 'Lade...' : 'OneDrive Login'"
        class="btn btn-primary"
        @tap="login()"
      />
      <Photo
        v-show="loggedIn && image === ''"
        :logged-in="loggedIn"
        @selected="selected"
      />
      <Scan
        v-if="image !== '' && !pdfFile"
        :img="image"
        @downloaded="e => downloaded(e)"
        @cancel="cancel()"
      />
      <Upload
        v-if="pdfFile"
        :pdf-file="pdfFile"
        @success="e => uploaded(e)"
      />
    </StackLayout>
  </Page>
</template>

<script>
import Photo from '@/components/Photo.vue';
import Scan from '@/components/Scan.vue';
import Upload from '@/components/Upload.vue';

const appSettings = require('tns-core-modules/application-settings');
const auth_service_1 = require('../auth-service');
const utilsModule = require('tns-core-modules/utils/utils');

export default {
  components: {
    Photo, Scan, Upload,
  },
  data() {
    return {
      view: 'main',
      image: '',
      mstoken: '',
      pdfFile: null,
      pdfUrl: '',
      loggedIn: false,
      loading: false,
      user: {},
      folder: '',
    };
  },
  mounted() {
    alert(this.$localize('app.name'));
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

      action(this.$localize('documentsaved'), this.$localize('next'), [this.$localize('openpdf')])
        .then((result) => {
          console.log(result);
          this.image = '';
          this.pdfFile = null;
          this.pdfUrl = pdfUrl;
          if (result === this.$localize('openpdf')) {
            utilsModule.openUrl(this.pdfUrl);
          }
        });
    },
    downloaded(pdfFile) {
      this.pdfFile = pdfFile;
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
            // alert(this.$localize('loginfailed'));
            this.loggedIn = false;
            this.loading = false;
          } else {
            console.log('LOGGING IN');
            response.json().then((json) => {
              console.log('LOGGED IN');
              this.loggedIn = true;
              this.user = json;
              this.loading = false;
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
