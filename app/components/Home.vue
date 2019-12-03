<template>
    <Page class="page" xmlns="http://schemas.nativescript.org/tns.xsd"
      xmlns:Gif="nativescript-gif" loaded="pageLoaded">
        <ActionBar class="action-bar">

            <NavigationButton ios:visibility="collapsed" icon="res://menu" @tap="onDrawerButtonTap"></NavigationButton>

            <ActionItem icon="res://navigation/menu" 
                android:visibility="collapsed" 
                @tap="onDrawerButtonTap"
                ios.position="left">
            </ActionItem>
            <Label class="action-bar-title" text="Статус"></Label>
        </ActionBar>


        <GridLayout columns="*, *" rows="*, 40, 40, 40, 60" width="100%" height="100%" class="vals">
            <Image v-show="!status" class="truck" src=" ~/components/img/stop.jpg" colSpan="2" width="100%" height="100%" row="0" col="0" />
<!--        <Image v-show="status" src="~/components/img/start.gif" colSpan="2" width="100%" height="100%" row="0" col="0" /> -->
<!--        <Gif v-show="status" src="~/components/img/start.gif" colSpan="2" width="100%" height="100%" row="0" col="0" ></Gif> -->
            <StackLayout row="1" col="0" colSpan="2" class="hr-dark m-20"></StackLayout>
            <Label :text="'Latitude: ' + origin.latitude" class="text-danger" row="2" col="0" />
            <Label :text="'Longitude: ' + origin.longitude" class="text-danger" row="2" col="1" />
            <Label :text="'time: ' + origin.time" class="text-danger" row="3" col="0" />
            <Label :text="'uuid: ' + origin.uuid" class="text-danger" row="3" col="1" />
            
            <Button row="4" col="0" class="btn btn-primary" @tap="watchLocation">В дорозі</Button>
            <button row="4" col="1" class="btn btn-primary" @tap="clearWatch">Вільний</button>
        </GridLayout>        

    </Page>
</template>

<script>
    import * as utils from "~/shared/utils";
    import SelectedPageService from "../shared/selected-page-service";  
    const geolocation = require("nativescript-geolocation");
    const { Accuracy } = require("tns-core-modules/ui/enums");
    const platformModule = require("tns-core-modules/platform");
    const httpModule = require("tns-core-modules/http");
    const fetchModule = require("fetch");
    const Observable = require("tns-core-modules/data/observable").Observable;
    const Animation = require("tns-core-modules/ui/animation").Animation;
    const nsUuid = require("nativescript-uuid");    
//    const AnimationCurve = require("tns-core-modules/ui/enums").AnimationCurve;
    
    let animationSet = Animation;
    animationSet.cancel = function(){return null;}
    export default {
        mounted() {
            SelectedPageService.getInstance().updateSelectedPage("Home");
            geolocation.enableLocationRequest();
        },
        computed: {
            message() {
                return "<!-- Page content goes here -->";
            }
        },
        data() {
            return {
                origin: {
                    latitude: null,
                    longitude: null,
                    time: null,
                    uuid: null,
                    status: false
                }
               
            };
        },        
        methods: {
            onDrawerButtonTap() {
                utils.showDrawer();
            },
            watchLocation() {
/**********************************SPINING TIRE*********************************************/       

//                let view = this.$refs.tire.nativeView;
//                animationSet = new Animation([{
//                    target: view,
//                    rotate: 360,
//                    duration: 3000,
//                    iterations: Number.POSITIVE_INFINITY                
//                 }]);                
//                animationSet.play().catch((e) => {
//                    console.log("Animation stoppped!");
//                });
                this.watch = geolocation.watchLocation(
                    res => {
/************************************GET DATA***********************************************/
                        let lat = res.latitude;
                        let lng = res.longitude;
                        this.origin.latitude = lat;
                        this.origin.longitude = lng;
//                        let date = new Date();
                        let date = new Date((new Date()).valueOf() + 10796400);
                        this.origin.time = date.toISOString();
                        this.origin.uuid = platformModule.device.uuid;

/**********************************HTTP****************************************************/                        
                        httpModule.request({
                            url: "http://192.168.999",
                            method: "POST",
                            headers: { 
                                "Content-Type": "application/json", 
                                "Authorization": "Basic ABCDEFGHKLLM1234567"
                            },
                            content: JSON.stringify({
                                "latitude": this.origin.latitude,
                                "longitude": this.origin.longitude,
                                "time": this.origin.time,
                                "uuid": this.origin.uuid
                            })
                        }).then((response) => {
                            const result = response.content.toJSON();
                            console.log('Sended!');
                        }, (e) => {
                            console.error(error);
                        });  
                        
                        
                    },
                    error => console.log(error), 
                    {
                        desiredAccuracy: Accuracy.high,
                        updateDistance: 1,
                        updateTime: 120000,
                        minimumUpdateTime: 120000
                    }
                );
                this.status = true;
            },
            clearWatch() {
                geolocation.clearWatch(this.watch);
                this.status = false;
//                animationSet.cancel();
            }        
        }
    };
</script>
<style scoped lang="scss">
    // Start custom common variables
    @import '../app-variables';
    @import '~nativescript-theme-core/css/core.dark.css';
    // End custom common variables

    // Custom styles
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
    .truck {
         margin-top: -150px;   
    }    
</style>