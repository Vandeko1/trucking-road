<template>
    <Page class="page" xmlns:Gif="nativescript-gif">
        <ActionBar class="action-bar">
            <NavigationButton ios:visibility="collapsed" icon="res://menu" @tap="onDrawerButtonTap"></NavigationButton>
            <ActionItem icon="res://navigation/menu" android:visibility="collapsed" @tap="onDrawerButtonTap" ios.position="left">
            </ActionItem>
            <Label class="action-bar-title" text="Статус"></Label>
        </ActionBar>
        <GridLayout columns="*, *, *" rows="*, *, 60, 60" width="100%" height="100%" class="vals">
            <Image v-show="btnWatch" row="0" col="0" verticalAlignment="top" src="~/components/img/stop.jpg" width="100%" />
            <Gif v-show="btnClearWatch" row="0" col="0" verticalAlignment="top" src="~/components/img/start.jpg" width="100%" />
            <Image row="0" col="2" verticalAlignment="top" :src="showFile" />
            <ListView row="1" colSpan="3" for="item in tasks">
                <v-template>
                    <StackLayout>
                        <Label :text="item.description"></Label>
                        <Label :text="'Надсилання: ' + item.upload + ' / ' + item.totalUpload"></Label>
                        <Label :text="'Статус: ' + item.status"></Label>
                        <Progress :value="item.upload" :maxValue="item.totalUpload"></Progress>
                    </StackLayout>
                </v-template>
            </ListView>
            <StackLayout class="input-field"></StackLayout>
            <Button v-show="btnWatch" row="2" col="0" class="btn btn-primary" @tap="watchLocation">В дорозі</Button>
            <button v-show="btnClearWatch" row="2" col="0" class="btn btn-primary" @tap="clearWatch">Вільний</button>
            <button v-show="btnMessage" row="2" col="1" class="btn btn-primary" @tap="showForm('message')">Відмітка</button>
            <button v-show="btnPhoto" row="2" col="2" class="btn btn-primary" @tap="showForm('photo')">Фото</button>
            <button v-show="btnPhotopanel" row="3" col="0" class="btn btn-primary" @tap="showForm('photopanel')">Заправка</button>
            <button v-show="btnInroad" row="3" col="1" class="btn btn-primary" @tap="showForm('inroad')">{{btnInroadName}}</button>
            <button v-show="btnDetail" row="3" col="2" class="btn btn-primary" @tap="showForm('detail')">Уточнити</button>
        </GridLayout>
    </Page>
</template>
<script>
    import * as utils from "~/shared/utils";
    import { mapGetters } from 'vuex';
    import SelectedPageService from "../shared/selected-page-service";
    import { TNSFancyAlert, TNSFancyAlertButton } from "nativescript-fancyalert";
    const geolocation = require("nativescript-geolocation");
    const camera = require("nativescript-camera");
    const imageSourceModule = require("tns-core-modules/image-source");
    const bgHttp = require("nativescript-background-http");
    const fs = require("tns-core-modules/file-system");
    const platform = require("tns-core-modules/platform");
    const dialogs = require("tns-core-modules/ui/dialogs");
    const { Accuracy } = require("tns-core-modules/ui/enums");
    const httpModule = require("tns-core-modules/http");
    export default {
        data() {
            return {
                input: {
                    latitude: null,
                    longitude: null,
                    noteText: '',
                    mode: '',
                    time: '',
                    hash: '',
                    photo: ''
                },

                uuid: null,
                locationFailure: false,
                isAvailable: camera.isAvailable(),
                tasks: [],
                events: [],
                url: "http://site.com:555/svces/hs/photo",
                file: fs.path.normalize(fs.knownFolders.currentApp().path) + "/components/img/market.jpg",
                session: bgHttp.session("image-upload"),
                counter: 0,
                btnWatch: null,
                btnClearWatch: null,
                btnDetail: null,
                btnMessage: null,
                btnPhoto: null,
                btnPhotopanel: null,
                btnInroad: null,
            };
        },
        mounted() {
            SelectedPageService.getInstance().updateSelectedPage("Home");
            geolocation.enableLocationRequest();
            this.showButtons();
        },
        computed: {
            ...mapGetters(['hash', 'resp']),
            showFile: function() {
                return this.file;
            },
            btnInroadName: function() {
                return (this.resp.status ? 'Виїзд' : 'Приїзд');
            }
        },
        methods: {
            save() {
                this.input.hash = this.hash;
                this.input.photo = this.file;
                this.$store.dispatch("insert", this.input);
            },
            onDrawerButtonTap() {
                utils.showDrawer();
            },
/***********************************************************************************************************************/
            changeStatus() {
                this.$store.dispatch('updateResp');
                this.showButtons();
            },
/***********************************************************************************************************************/
            showButtons() {
                let that = this;
                that.resp.buttons.forEach(function(item, i) {
                    switch (item) {
                        case 'watch':
                            that.btnWatch = true;
                            that.btnСlearWatch = false;
                            break;
                        case 'detail':
                            if (that.resp.status) {
                                that.btnDetail = false;
                            } else if (!that.resp.status) {
                                that.btnDetail = true;
                            }
                            break;
                        case 'message':
                            that.btnMessage = true;
                            break;
                        case 'photo':
                            that.btnPhoto = true;
                            break;
                        case 'photopanel':
                            that.btnPhotopanel = true;
                            break;
                        case 'inroad':
                            that.btnInroad = true;
                            break;
                        default:
                            console.log("Помилка в showButtons")
                    }
                });
                if (that.btnСlearWatch = !that.btnWatch === false) {
                    that.btnСlearWatch = true;
                }
            },
/*************************************************************************************************************************/
            showForm(mode) {
                let that = this;
                if (mode == "message" || mode == "photo") {
                    dialogs.prompt({
                        title: "Відмітка",
                        message: "Введіть Ім'я контрагента",
                        okButtonText: "Надіслати",
                        cancelButtonText: "Відмінити",
                        defaultText: "",
                        inputType: dialogs.inputType.text
                    }).then(result => {
                        if (result.text) {
                            that.input.noteText = result.text;
                            that.input.mode = mode;
                            that.sendMessage(mode);
                        } else {
                            TNSFancyAlert.showInfo(
                                "Спробуйте ще раз",
                                "Ім'я контрагента - обов'язкове",
                                "Ок"
                            );
                        }
                    });
                } else if (mode == "photopanel") {
                    dialogs.action({
                        message: "Рівень палива в баку",
                        cancelButtonText: "Відмінити",
                        actions: ["Povnyi", "Ne povnyi"]
                    }).then(result => {
                        if (result) {
                            that.input.noteText = result;
                            that.input.mode = mode;
                            that.sendMessage(mode);
                        }
                    });
                } else {
                    that.input.noteText = 'inroad';
                    that.input.mode = mode;
                    that.sendMessage(mode);
                }
            },
/*************************************************************************************************************************/
            sendMessage(mode) {
                geolocation.enableLocationRequest(true).then(() => {
                    geolocation.isEnabled().then(isLocationEnabled => {
                        if (!isLocationEnabled) {
                            this.locationFailure = true;
                            return;
                        }
                        let that = this;
                        geolocation.getCurrentLocation({}).then(result => {
                                let date = +new Date();
                                let timeZone = new Date().getTimezoneOffset() * 60000;
                                that.input.time = new Date(date - timeZone).toISOString();
                                that.input.latitude = result.latitude;
                                that.input.longitude = result.longitude;
                                if (mode !== "message") {
                                    that.takePicture();
                                } else {
                                    that.sendHttp();
                                }
                            })
                            .catch(e => {
                                dialogs.alert({
                                    title: "Помилка GPS",
                                    message: "GPS дані не вдалось отримати. Переконайтесь що GPS ввімкнено і спробуйте ще раз",
                                    okButtonText: "ok"
                                }).then(function() {});
                            });
                    });
                });
            },
/*************************************************************************************************************************/
            takePicture: function() {
                if (this.isAvailable) {
                    camera.requestPermissions()
                        .then(() => {
                            let that = this;
                            camera.takePicture()
                                .then(imageAsset => {
                                    const source = new imageSourceModule.ImageSource();
                                    //var image = ImageSourceModule.fromNativeSource(a);
                                    //var base64 = image.toBase64String('png');
                                    source.fromAsset(imageAsset)
                                        .then(imageSource => {
                                            const folder = fs.knownFolders.documents().path;
                                            const fileName = "photo" + that.counter + ".png";
                                            that.counter++;
                                            const path = fs.path.join(folder, fileName);
                                            const saved = imageSource.saveToFile(path, "png");
                                            if (saved) {
                                                that.file = path;
                                                that.startUpload();
                                            }
                                        })
                                        .catch(e => {
                                            console.log("Камера не доступна (imageSource) -> " + e.message);
                                        });
                                }).catch(e => {
                                    console.log("Error(ImageAsset) -> " + e.message);
                                });
                        }).catch(e => {
                            console.log("Error(requestPermissions) -> " + e.message);
                        });
                } else {
                    TNSFancyAlert.showError(
                        "Камера не доступна",
                        "Ваш пристрій не обладнаний камерою, або ви заборонили додатку її використовувати",
                        "Ок"
                    );
                }
            },
/*************************************************************************************************************************/
            startUpload: function() {
                let that = this;
                const name = this.file.substr(this.file.lastIndexOf("/") + 1);
                const description = `Фото №${this.counter} режим-${this.input.mode}`;
                const request = {
                    url: this.url,
                    method: "POST",
                    headers: {
                        "Content-Type": "application/octet-stream",
                        "Authorization": "Basic " + this.hash,
                        "File-Name": name,
                        "latitude": this.input.latitude,
                        "longitude": this.input.longitude,
                        "noteText": this.input.noteText,
                        "mode": this.input.mode,
                        "DateTime": this.input.time
                    },
                    description: description,
                    androidAutoDeleteAfterUpload: true,
                    androidNotificationTitle: "NativeScript HTTP background"
                };
                let task;
                let lastEvent = "";
                task = this.session.uploadFile(this.file, request);
                function onEvent(e) {
                    if (lastEvent !== e.eventName) {
                        lastEvent = e.eventName;
                        if (lastEvent === "complete") {
                            if (that.input.mode === 'inroad') {
                                let result = !that.btnInroad;
                                that.changeStatus();
                            };
                            TNSFancyAlert.showSuccess(
                                "Успіх!",
                                "Дані успішно відправлено",
                                "Ok"
                            );
                        } else if (lastEvent === "error") {
                            this.save();
                            that.changeStatus();
                            TNSFancyAlert.showWarning(
                                "Помилка відправки",
                                "Дані збережено в журнал. Ви зможете відправити їх пізніше.",
                                "Ок"
                            );
                        }
                    } else {
                        return;
                    }
                    this.events.push({
                        eventTitle: e.eventName + " " + e.object.description,
                        eventData: JSON.stringify({
                            error: e.error ? e.error.toString() : e.error,
                            currentBytes: e.currentBytes,
                            totalBytes: e.totalBytes,
                            body: e.data,
                            responseCode: e.responseCode
                        })
                    });
                    this.$set(this.tasks, this.tasks.indexOf(task), task);
                }
                task.on("progress", onEvent.bind(this));
                task.on("error", onEvent.bind(this));
                task.on("responded", onEvent.bind(this));
                task.on("complete", onEvent.bind(this));
                lastEvent = "";
                this.tasks.push(task);
            },
/*************************************************************************************************************************/
            sendHttp() {
                httpModule.request({
                    url: "http://site.com:555/services/hs/geomessage",
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": "Basic " + this.hash
                    },
                    content: JSON.stringify({
                        "latitude": this.input.latitude,
                        "longitude": this.input.longitude,
                        "noteText": this.input.noteText,
                        "mode": this.input.mode,
                        "DateTime": this.input.time
                    })
                }).then((response) => {
                    if (response.statusCode == 200) {
                        TNSFancyAlert.showSuccess(
                            "Надіслано!",
                            "Повідомлення успішно надіслано",
                            "Ok"
                        );
                    } else {
                        TNSFancyAlert.showError(
                            "Помилка надсилання",
                            "Повідомленя не надіслано. Код помилки - " + response.statusCode,
                            "Ок"
                        );
                    }
                }, (e) => {
                    TNSFancyAlert.showError(
                        "Помилка надсилання",
                        "Повідомленя не надіслано. Сервер не відповідає. Перевірте з'єднання",
                        "Ок"
                    );
                });
                this.save();
            },
/*************************************************************************************************************************/
            watchLocation: function() {
                let that = this;
                that.btnWatch = false;
                that.btnClearWatch = true;
                that.watch = geolocation.watchLocation(
                    result => {
                        that.input.latitude = result.latitude;
                        that.input.longitude = result.longitude;
                        let date = +new Date();
                        let timeZone = new Date().getTimezoneOffset() * 60000;
                        that.input.time = new Date(date - timeZone).toISOString();
                        that.uuid = platform.device.uuid;
                        httpModule.request({
                            url: "http://site.com:555/services/hs/geo",
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                "Authorization": "Basic " + that.hash
                            },
                            content: JSON.stringify([{
                                "latitude": that.input.latitude,
                                "longitude": that.input.longitude,
                                "time": that.input.time,
                                "uuid": that.uuid
                            }])
                        }).then((response) => {
                            if (response.statusCode == 200) {
                                dialogs.alert({
                                    title: "Трекінг запущено",
                                    message: "Не забудьте по приїзду зупинити",
                                    okButtonText: "ok"
                                }).then(function() {});
                            } else {
                                TNSFancyAlert.showError(
                                    "Невідома помилка",
                                    "Невідома помилка. Статус-код - " + response.statusCode,
                                    "Ок"
                                );
                            }
                        }, (e) => {
                            TNSFancyAlert.showError(
                                "Помилка з'єднання",
                                "Сервер не відповідає. Перевірте з'єднання",
                                "Ок"
                            );
                        });
                    },
                    error => {
                        TNSFancyAlert.showError(
                            "Помилка GPS",
                            "GPS дані не вдалось отримати. Переконайтесь що GPS ввімкнено і спробуйте ще раз",
                            "Ок"
                        );
                    }, {
                        desiredAccuracy: Accuracy.high,
                        updateDistance: 1,
                        updateTime: 120000,
                        minimumUpdateTime: 120000
                    }
                );
            },
            /*************************************************************************************************************************/
            clearWatch: function() {
                this.btnWatch = true;
                this.btnClearWatch = false;
                geolocation.clearWatch(this.watch);
            }
        }
    };
</script>
<style scoped lang="css">
    .fa { color: $accent-dark; }
    .info { font-size: 20; }
    .fa {
        width: 250;
        color: #7f7f7f;
        font-size: 200;
        text-align: center;
        margin-top: 30;
    }
    Label { text-align: center; }
</style>