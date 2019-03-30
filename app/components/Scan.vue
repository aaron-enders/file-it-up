<template>
  <StackLayout>
    <GridLayout
      columns="*, 2*"
      rows="auto, auto, auto"
      background-color="#3c495e"
      style="margin-top:5"
    >
      <Image
        row="0"
        col="0"
        :src="img.src"
        width="75"
      />
      <ListView
        row="0"
        col="1"
        col-span="3"
        for="item in tasks"
      >
        <v-template>
          <StackLayout>
            <Label :text="item.description" />
            <Progress
              :value="item.upload"
              :max-value="item.totalUpload"
            />
            <Label :text="'Lade: ' + item.upload + ' / ' + item.totalUpload" />
            <Label :text="'Status: ' + item.status" />
          </StackLayout>
        </v-template>
      </ListView>
    </gridlayout>
    <Button
      v-if="pdfFile !== ''"
      margin="2"
      text="Abbrechen"
      class="btn btn-primary"
      @tap="cancel()"
    />
  </StackLayout>
</template>

<script>
const bgHttp = require('nativescript-background-http');
const fs = require('file-system');
const platform = require('platform');
const appSettings = require('application-settings');
const httpModule = require('http');
const fileSystemModule = require('tns-core-modules/file-system');

export default {
  props: {
    img: {
      type: Object,
      default() { return {}; },
    },
  },
  data() {
    return {
      tasks: [],
      session: bgHttp.session('image-upload'),
    };
  },
  computed: {
    file() {
      return fs.path.normalize(
        this.img.src.android,
      );
    },
  },
  mounted() {
    this.resize();
  },
  methods: {
    onUploadWithErrorTap(e) {
      this.session = bgHttp.session('image-upload');
      this.resize(true, false);
    },
    onUploadTap(e) {
      this.resize(false, false);
    },
    onUploadMultiTap() {
      this.resize(false, true);
    },
    cancel() {
      this.$emit('cancel');
    },
    resize() {
      const name = this.file.substr(this.file.lastIndexOf('/') + 1);
      const request = {
        url: 'https://img-resize.com/resize',
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'File-Name': name,
          'X-Requested-With': 'XMLHttpRequest',
        },
        description: 'Verarbeite Dokument',
        androidAutoDeleteAfterUpload: true,
        androidNotificationTitle: 'Dokumentverarbeitung',
      };
      const params = [
        { name: 'op', value: 'scale' },
        { name: 'scaledWidth', value: '1000' },
        {
          name: 'input',
          filename: this.file,
          mimeType: 'image/jpeg',
        },
      ];
      const task = this.session.multipartUpload(params, request);

      function onEvent(e) {
        this.$set(this.tasks, this.tasks.indexOf(task), task);
        if (e.eventName === 'responded') {
          this.generatePdf(`https://img-resize.com${JSON.parse(e.data).view}`);
        }
      }
      task.on('progress', onEvent.bind(this));
      task.on('error', onEvent.bind(this));
      task.on('responded', onEvent.bind(this));
      task.on('complete', onEvent.bind(this));
      this.tasks.push(task);
    },
    generatePdf(imageUrl) {
      console.log('generating pdf', imageUrl);
      fetch(`https://api.ocr.space/parse/imageurl?isCreateSearchablePdf=true&language=ger&isSearchablePdfHideTextLayer=true&apikey=b8eaa39a6588957&url=${imageUrl}`)
        .then(response => response.json())
        .then((data) => {
          this.downloadPdf(data.SearchablePDFURL);
        }).catch((e) => {
          console.log(e);
        });
    },
    downloadPdf(pdfUrl) {
      console.log(pdfUrl);
      const folder = fileSystemModule.knownFolders.documents();
      const storageFile = folder.getFile('temporary.pdf');

      httpModule.getFile(pdfUrl).then((resultFile) => {
        const binarySource = resultFile.readSync((err) => {
          console.log(err);
        });
        storageFile.writeSync(binarySource, (err) => {
          console.log(err);
        });
        console.log('STORAGEFILE IS: ', storageFile.path);
        console.log('BINARY IS: ', binarySource);
        this.pdfFile = storageFile;
        this.$emit('downloaded', storageFile);
      }, (e) => {
      });
    },
    onItemLoading(args) {
      const label = args.view.getViewById('imageLabel');
      label.text = `image ${args.index}`;
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
