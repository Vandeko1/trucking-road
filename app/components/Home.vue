<template>
    <Page class="page" xmlns:Gif="nativescript-gif">
        <ActionBar class="action-bar">
            <NavigationButton ios:visibility="collapsed" icon="res://menu" @tap="onDrawerButtonTap"></NavigationButton>
            <ActionItem icon="res://navigation/menu" 
                android:visibility="collapsed" 
                @tap="onDrawerButtonTap"
                ios.position="left">
            </ActionItem>
            <Label class="action-bar-title" text="Статус"></Label>
        </ActionBar>
        <GridLayout columns="*, *" rows="*, 60" width="100%" height="100%" class="vals">
            <Image v-show="!status"  row="0" col="0" colSpan="2" verticalAlignment="top" src="~/components/img/stop.jpg" width="100%"/>
            <Gif v-show="status" row="0" col="0" colSpan="2"  verticalAlignment="top" src="~/components/img/start.jpg" width="100%"/>
            <Button v-show="!status" row="1" col="0" class="btn btn-primary" @tap="watchLocation">В дорозі</Button>
            <button v-show="status" row="1" col="0" class="btn btn-primary" @tap="clearWatch">Вільний</button>
            <button row="3" col="1" class="btn btn-primary" @tap="showForm">Відмітка</button>
<!--            <button row="3" col="0" class="btn btn-primary"  @click.prevent="$emit('click')">В дорозі2</button>-->
        </GridLayout>
    </Page>
</template>
<script>
    import * as utils from "~/shared/utils";
    import SelectedPageService from "../shared/selected-page-service";
    const geolocation = require("nativescript-geolocation");
    const dialogs = require("tns-core-modules/ui/dialogs");
    const { Accuracy } = require("tns-core-modules/ui/enums");
    const platformModule = require("tns-core-modules/platform");
    const httpModule = require("tns-core-modules/http");
    const fetchModule = require("fetch");
    const Observable = require("tns-core-modules/data/observable").Observable;
    const Animation = require("tns-core-modules/ui/animation").Animation;
    const webViewModule = require("tns-core-modules/ui/web-view");
    const animationSet = Animation;
    animationSet.cancel = function(){return null;}
    export default {
        mounted() {
            SelectedPageService.getInstance().updateSelectedPage("Home");
            geolocation.enableLocationRequest();
        },
        computed: {
            hash() {
                return this.$store.getters.hash;
            }
        },
        data() {
            return {
                latitude: null,
                longitude: null,
                time: null,
                uuid: null,
                locationFailure:false,
                noteText: '',
                status: false
            };
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
                    this.noteText = result.text;
                    this.sendMessage();
                });
            },
/*************************************************************************************************************************/
            sendMessage(){
                console.log("inside sendMessage");
                geolocation.enableLocationRequest(true).then(() => {console.log("inside Geolocation");
                    geolocation.isEnabled().then(isLocationEnabled => {
                        if(!isLocationEnabled) {
                            this.locationFailure = true;
                            return;
                        }
                        geolocation.getCurrentLocation({}).then(result => {console.log("inside insideCurrentGeolocation");
                            this.latitude = result.latitude;
                            this.longitude = result.longitude;
                            httpModule.request({
                                url: "",
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
                                    }).then(function () {
                                        console.log("Надіслано");
                                    });
                                } else {
                                    dialogs.alert({
                                        title: "Помилка надсилання",
                                        message: "Повідомленя не надіслано. Код помилки - " + response.statusCode,
                                        okButtonText: "ok"
                                    }).then(function () {
                                        console.log("Помилка надсилання");
                                    });
                                }
                            }, (e) => {
                                    dialogs.alert({
                                        title: "Помилка надсилання",
                                        message: "Повідомленя не надіслано. Сервер не відповідає. Перевірте з'єднання",
                                        okButtonText: "ok"
                                    }).then(function () {
                                        console.log("Помилка надсилання");
                                    });
                            });
                        })
                        .catch(e => {
                            dialogs.alert({
                                title: "Помилка GPS",
                                message: "GPS дані не вдалось отримати. Переконайтесь що GPS ввімкнено і спробуйте ще раз",
                                okButtonText: "ok"
                            }).then(function () {
                                console.log("Помилка GPS");
                            });
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
                        let date = new Date((new Date()).valueOf() + 10796400);
                        this.time = date.toISOString();
                        this.uuid = platformModule.device.uuid;                      
                        httpModule.request({
                            url: "",
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
                                }).then(function () {
                                    console.log("Надіслано");
                                });
                            } else {
                                dialogs.alert({
                                    title: "Невідома помилка",
                                    message: "Невідома помилка. Статус-код - "+response.statusCode,
                                    okButtonText: "ok"
                                }).then(function () {
                                    console.log("Помилка доступу");
                                });
                            }                            
                        }, (e) => {
                            dialogs.alert({
                                title: "Помилка з'єднання",
                                message: "Сервер не відповідає. Перевірте з'єднання",
                                okButtonText: "ok"
                            }).then(function () {
                                console.log("Помилка з'єднання");
                            });
                        });
                    },
                    error => {
                        dialogs.alert({
                            title: "Помилка GPS",
                            message: "GPS дані не вдалось отримати. Переконайтесь що GPS ввімкнено і спробуйте ще раз",
                            okButtonText: "ok"
                        }).then(function () {
                            console.log("Помилка GPS");
                        });
                    }, 
                    {
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
    .fa {
        color: $accent-dark;
    }
    .info {
        font-size: 20;
    }
    .fa {
        width: 250;
        color: #7f7f7f;
        font-size: 200;
        text-align: center;
        margin-top: 30;
    }
    Label {
        text-align: center;
    }    
</style>