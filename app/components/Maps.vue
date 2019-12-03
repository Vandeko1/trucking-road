<template>
    <Page class="page">
        <ActionBar class="action-bar">
            <NavigationButton ios:visibility="collapsed" icon="res://menu" @tap="onDrawerButtonTap"></NavigationButton>
            <ActionItem icon="res://navigation/menu" 
                android:visibility="collapsed" 
                @tap="onDrawerButtonTap"
                ios.position="left">
            </ActionItem>
            <Label class="action-bar-title" text="Карта"></Label>
        </ActionBar>

        <GridLayout class="page-content">
            <Label class="page-icon fa" text.decode="&#xf1ea;"></Label>
            <Label class="page-placeholder" :text="message"></Label>
        </GridLayout>

        <GridLayout>
<!--
                <Mapbox
                    accessToken="pk.eyJ1IjoidmFuZGVrbyIsImEiOiJjazM0ZWE5MDUwMWFlM2htdmNwMzdld3Y4In0.bWWOgAvuh_CGufV6JE19Hw"
                    mapStyle="traffic_day"
                    latitude="37.7397"
                    longitude="-121.4252"
                    hideCompass="true"
                    zoomLevel="12"
                    showUserLocation="false"
                    disableZoom="false"
                    disableRotation="false"
                    disableScroll="false"
                    disableTilt="false"
                    @mapReady="onMapReady($event)">
                </Mapbox>
-->
        </GridLayout>
    </Page>
</template>

<script>
    import * as utils from "~/shared/utils";
    import SelectedPageService from "../shared/selected-page-service";
//  import { MapboxMarker } from "nativescript-mapbox";   
//  Vue.registerElement("Mapbox", () => require("nativescript-mapbox").MapboxView);

    export default {
        mounted() {
            SelectedPageService.getInstance().updateSelectedPage("Maps");
        },
        computed: {
            message() {
                return "<!-- Карти-->";
            }
        },
        methods: {
            onDrawerButtonTap() {
                utils.showDrawer();
            }
//            ,
//            onMapReady(args) {
//                args.map.addMarkers([
//                    {
//                        lat: 37.7397,
//                        lng: -121.4252,
//                        title: "Tracy, CA",
//                        subtitle: "Home of The Polyglot Developer!",
//                        onCalloutTap: () => {
//                            utils.openUrl("https://www.thepolyglotdeveloper.com");
//                        }
//                    }
//                ]);
//            }            
        }
    };
</script>

<style scoped lang="scss">
    // Start custom common variables
    @import '../app-variables';
</style>