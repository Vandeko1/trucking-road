<template>
    <Page class="page">
        <ActionBar class="action-bar">
            <NavigationButton ios:visibility="collapsed" icon="res://menu" @tap="onDrawerButtonTap"></NavigationButton>
            <ActionItem icon="res://navigation/menu" 
                android:visibility="collapsed" 
                @tap="onDrawerButtonTap"
                ios.position="left">
            </ActionItem>
            <Label class="action-bar-title" text="Нотатки"></Label>
        </ActionBar>

        <GridLayout class="page-content notes" columns="*" rows="120, *, 60" width="100%" height="100%">
<!--
            <Label class="page-icon fa" text.decode="&#xf005;"></Label>
            <Label class="page-placeholder" :text="message"></Label>
            
-->
            <TextField :text="Примітка" hint="Введіть текст..." row="0" col="0"/>
            <button row="2" col="0" class="btn btn-primary" @tap="watchLocation" >Відправити</button>
        </GridLayout>
    </Page>
</template>

<script>
    import * as utils from "~/shared/utils";
    import SelectedPageService from "../shared/selected-page-service";

    export default {
        data() {
            return {
                origin: {
                    latitude: null,
                    longitude: null,
                    time: null,
                    uuid: null,
                    notes: ''
                }
               
            }  
        },
        mounted() {
            SelectedPageService.getInstance().updateSelectedPage("Notes");
        },
        computed: {
            message() {
                return "<!-- Нотатки -->";
            }
        },
        methods: {
            onDrawerButtonTap() {
                utils.showDrawer();
            },
            watchLocation() {
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
            }
        }
    };
</script>

<style scoped lang="scss">
    // Start custom common variables
    @import '../app-variables';
    // End custom common variables

    // Custom styles
</style>
