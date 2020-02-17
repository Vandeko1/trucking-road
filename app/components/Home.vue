<template>
    <Page class="page" xmlns:Gif="nativescript-gif">
        <ActionBar class="action-bar">
            <NavigationButton ios:visibility="collapsed" icon="res://menu" @tap="onDrawerButtonTap"></NavigationButton>
            <ActionItem icon="res://navigation/menu" android:visibility="collapsed" @tap="onDrawerButtonTap" ios.position="left">
            </ActionItem>
            <Label class="action-bar-title" text="Статус"></Label>
        </ActionBar>
        <GridLayout columns="*, *, *" rows="*, *, *, *, 60" width="100%" height="100%" class="vals">
            <Image v-show="!status" row="0" col="0" verticalAlignment="top" src="~/components/img/stop.jpg" width="100%" />
            <Gif v-show="status" row="0" col="0" verticalAlignment="top" src="~/components/img/start.jpg" width="100%" />
            <Image row="0" col="2" verticalAlignment="top" :src="showFile" />
            <ListView row="1" colSpan="3" for="item in tasks">
                <v-template>
                    <StackLayout>
                        <Label :text="item.description"></Label>
                        <Progress :value="item.upload" :maxValue="item.totalUpload"></Progress>
                        <Label :text="'Надсилання: ' + item.upload + ' / ' + item.totalUpload"></Label>
                        <Label :text="'Статус: ' + item.status"></Label>
                    </StackLayout>
                </v-template>
            </ListView>
            <StackLayout class="hr-dark" row="2" colSpan="3"></StackLayout>
            <ListView row="3" colSpan="3" for="item in events">
                <v-template let-item="item">
                    <StackLayout>
                        <Label :text="item.eventTitle"></Label>
                        <Label :text="item.eventData" textWrap="true"></Label>
                    </StackLayout>
                </v-template>
            </ListView>
            <Button v-show="!status" row="4" col="0" class="btn btn-primary" @tap="watchLocation">В дорозі</Button>
            <button v-show="status" row="4" col="0" class="btn btn-primary" @tap="clearWatch">Вільний</button>
            <button row="4" col="1" class="btn btn-primary" @tap="showForm">Відмітка</button>
            <button row="4" col="2" class="btn btn-primary" @tap="takePicture">Фото</button>
        </GridLayout>
    </Page>
</template>
<script>
    import * as utils from "~/shared/utils";
    import SelectedPageService from "../shared/selected-page-service";
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
                latitude: null,
                longitude: null,
                time: null,
                uuid: null,
                locationFailure: false,
                noteText: '',
                status: false,
                isAvailable: camera.isAvailable(),
                
                tasks: [],
                events: [],
                url: "https://setyourserver.com:777/api/photo",
                file: fs.path.normalize(fs.knownFolders.currentApp().path) + "/components/img/market.jpg",
                session: bgHttp.session("image-upload"),
                counter: 0
            };
        },
        mounted() {
            SelectedPageService.getInstance().updateSelectedPage("Home");
            geolocation.enableLocationRequest();
        },
        computed: {
            hash() {
                return this.$store.getters.hash;
            },
            showFile: function () {
              return this.file;
            }
        },
        methods: {
            onDrawerButtonTap() {
                utils.showDrawer();
            },
            showForm() {
                dialogs.prompt({
                    title: "Відмітка",
                    message: "Введіть Ім'я контрагента",
                    okButtonText: "Надіслати",
                    cancelButtonText: "Відмінити",
                    defaultText: "",
                    inputType: dialogs.inputType.text
                }).then(result => {
                    if (result.text) {
                        this.noteText = result.text;
                        this.sendMessage();
                    } else {
                        dialogs.alert({
                            title: "Відміна",
                            message: "Введіть ім'я контрагента",
                            okButtonText: "OK"
                        }).then(() => {
                            showForm();
                        });
                    }
                });
            },
            /*************************************************************************************************************************/
            takePicture: function() {
                if (this.isAvailable) {
                    let that = this;
                    camera.requestPermissions()
                        .then(() => {
                            camera.takePicture()
                                .then(imageAsset => {
                                    const source = new imageSourceModule.ImageSource();
                                    source.fromAsset(imageAsset)
                                        .then((imageSource) => {
                                            const folder = fs.knownFolders.documents().path;
                                            const fileName = "photo.png";
                                            const path = fs.path.join(folder, fileName);
                                            const saved = imageSource.saveToFile(path, "png");
                                            if (saved) {
                                                that.startUpload();
                                            }
                                        })
                                        .catch(e => {
                                            console.log('Камера не доступна');
                                        });
                                }).catch(e => {
                                    console.log("Error -> " + e.message);
                                });

                        }).catch(e => {
                            console.log("Error -> " + e.message);
                        });
                } else {
                    dialogs.alert({
                        title: "Камера не доступна",
                        message: "Ваш пристрій не обладнаний камерою, або ви заборонили додатку її використовувати",
                        okButtonText: "ok"
                    }).then(function() {});
                }

                this.file = fs.knownFolders.documents().path + "/photo.png";
            },
            /*************************************************************************************************************************/
            onUploadTap: function(e) {
                if (this.file === null) return
                this.startUpload();
            },
            startUpload: function() {
                const name = this.file.substr(this.file.lastIndexOf("/") + 1);
                const description = `${name} (${++this.counter})`;
                const request = {
                    url: this.url,
                    method: "POST",
                    headers: {
                        "Content-Type": "application/octet-stream",
                        "Authorization": "Basic " + this.hash,
                        "File-Name": name
                    },
                    description: description,
                    androidAutoDeleteAfterUpload: false,
                    androidNotificationTitle: "NativeScript HTTP background"
                };
                let task;
                let lastEvent = "";
                task = this.session.uploadFile(this.file, request);

                function onEvent(e) {
                    if (lastEvent !== e.eventName+' !=') {
                        lastEvent = e.eventName+' ==';
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
            onItemLoading(args) {
                let label = args.view.getViewById("imageLabel");
                label.text = "фото " + args.index;
            },
            /*************************************************************************************************************************/
            sendMessage() {
                geolocation.enableLocationRequest(true).then(() => {
                    geolocation.isEnabled().then(isLocationEnabled => {
                        if (!isLocationEnabled) {
                            this.locationFailure = true;
                            return;
                        }
                        geolocation.getCurrentLocation({}).then(result => {
                                this.latitude = result.latitude;
                                this.longitude = result.longitude;
                                httpModule.request({
                                    url: "https://setyourserver.com:777/api/geomessage",
                                    method: "POST",
                                    headers: {
                                        "Content-Type": "application/json",
                                        "Authorization": "Basic " + this.hash
                                    },
                                    content: JSON.stringify({
                                        "latitude": this.latitude,
                                        "longitude": this.longitude,
                                        "noteText": this.noteText
                                    })
                                }).then((response) => {
                                    if (response.statusCode == 200) {
                                        dialogs.alert({
                                            title: "Надіслано",
                                            message: "Повідомлення успішно надіслано",
                                            okButtonText: "ok"
                                        }).then(function() {});
                                    } else {
                                        dialogs.alert({
                                            title: "Помилка надсилання",
                                            message: "Повідомленя не надіслано. Код помилки - " + response.statusCode,
                                            okButtonText: "ok"
                                        }).then(function() {});
                                    }
                                }, (e) => {
                                    dialogs.alert({
                                        title: "Помилка надсилання",
                                        message: "Повідомленя не надіслано. Сервер не відповідає. Перевірте з'єднання",
                                        okButtonText: "ok"
                                    }).then(function() {});
                                });
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
            watchLocation: function() {
                this.status = true;
                this.watch = geolocation.watchLocation(
                    result => {
                        this.latitude = result.latitude;
                        this.longitude = result.longitude;
                        let date = +new Date();
                        let timeZone = new Date().getTimezoneOffset() * 60000;
                        this.time = new Date(date - timeZone).toISOString();
                        this.uuid = platform.device.uuid;
                        httpModule.request({
                            url: "https://setyourserver.com:777/api/geo",
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                "Authorization": "Basic " + this.hash
                            },
                            content: JSON.stringify([{
                                "latitude": this.latitude,
                                "longitude": this.longitude,
                                "time": this.time,
                                "uuid": this.uuid
                            }])
                        }).then((response) => {
                            if (response.statusCode == 200) {
                                dialogs.alert({
                                    title: "Надіслано",
                                    message: "Геодані успішно надіслано",
                                    okButtonText: "ok"
                                }).then(function() {});
                            } else {
                                dialogs.alert({
                                    title: "Невідома помилка",
                                    message: "Невідома помилка. Статус-код - " + response.statusCode,
                                    okButtonText: "ok"
                                }).then(function() {});
                            }
                        }, (e) => {
                            dialogs.alert({
                                title: "Помилка з'єднання",
                                message: "Сервер не відповідає. Перевірте з'єднання",
                                okButtonText: "ok"
                            }).then(function() {});
                        });
                    },
                    error => {
                        dialogs.alert({
                            title: "Помилка GPS",
                            message: "GPS дані не вдалось отримати. Переконайтесь що GPS ввімкнено і спробуйте ще раз",
                            okButtonText: "ok"
                        }).then(function() {});
                    }, {
                        desiredAccuracy: Accuracy.high,
                        updateDistance: 1,
                        updateTime: 120000,
                        minimumUpdateTime: 120000
                    }
                );
            },
            clearWatch: function() {
                this.status = false;
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