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
        <GridLayout class="page-content notes" columns="*" rows="40, 40, 40, 40, 40, 40, 40, 40, *, 60" width="100%" height="100%">
            <Label class="page-icon fa" text.decode="&#xf005;" row="0" col="0"></Label>
            <Label v-if="origin.locationFailure" text="Помилка!" row="1" col="0"/>
            <TextField v-model="origin.noteText" returnKeyType="send" hint="Введіть текст..." maxLength="45" row="2" col="0"/>
            <Label v-if="origin.location" :text="origin.location.latitude" textWrap="true" row="3" col="0"/>
            <Label v-if="origin.location" :text="origin.location.longitude" textWrap="true" row="4" col="0"/>
            <Label v-if="origin.location" :text="origin.time" textWrap="true" row="5" col="0"/>
            <Label v-if="origin.location" :text="origin.uuid" textWrap="true" row="6" col="0"/>
            <Label v-if="origin.location" :text="origin.noteText" textWrap="true" row="7" col="0"/>
            <TextField :text="hash" row="8" col="0" />
            <TextView text="Multi\nLine\nText" row="9" col="0" />
            <button class="btn btn-primary" @tap="showLocation" row="10" col="0" >Відправити</button>
        </GridLayout>
    </Page>
</template>
<script>
    import * as utils from "~/shared/utils";
    import SelectedPageService from "../shared/selected-page-service";
    import * as Geolocation from "nativescript-geolocation";
    const httpModule = require("tns-core-modules/http");
    export default {
        data() {
            return {
                origin: {
                    locationFailure:false,
                    location: null, 
                    noteText: ''
                }
            }  
        },
        mounted() {
            SelectedPageService.getInstance().updateSelectedPage("Notes");
        },
        computed: {
            hash() {
                return this.$store.getters.hash;
            }
        },
        methods: {
            onDrawerButtonTap() {
                utils.showDrawer();
            },
            showLocation() {
                Geolocation.enableLocationRequest(true)
                .then(() => {
                    Geolocation.isEnabled().then(isLocationEnabled => {
                        
                        if(!isLocationEnabled) {
                            this.origin.locationFailure = true;
                            return;
                        }
                        Geolocation.getCurrentLocation({})
                        .then(result => {
                            this.origin.location = result;
/*************************************************************************************************************************/
                            httpModule.request({
                                url: "http://192.168.1.1:555/services/hs/geomessage",
                                method: "POST",
                                headers: { 
                                    "Content-Type": "application/json", 
                                    "Authorization": "Basic " + this.hash
                                },
                                content: JSON.stringify({
                                    "latitude": this.origin.location.latitude,
                                    "longitude": this.origin.location.longitude,
                                    "noteText": this.origin.noteText
                                })
                            }).then((response) => {
                                /*const result = response.content.toJSON();*/
                                console.log('==Надіслано==');
                            }, (e) => {
                                console.error(error);
                            }); 
/*******************************************************************************************************************************/
                        })
                        .catch(e => {
                            console.log('==Помилка==', e);
                        });
                    });
                });
            }
        }
    };
</script>
