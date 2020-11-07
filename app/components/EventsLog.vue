<template>
    <Page class="page">
        <ActionBar class="action-bar">
            <NavigationButton ios:visibility="collapsed" icon="res://menu" @tap="onDrawerButtonTap"></NavigationButton>
            <ActionItem icon="res://navigation/menu" android:visibility="collapsed" @tap="onDrawerButtonTap" ios.position="left">
            </ActionItem>
            <Label class="action-bar-title" text="Журнал"></Label>
        </ActionBar>
        <GridLayout rows="auto, *" columns="*">
            <record :records="loadRecords" v-on:delete="onDelete" />
        </GridLayout>
    </Page>
</template>
<script>
    import * as utils from "~/shared/utils";
    import {
        mapGetters
    } from 'vuex';
    import SelectedPageService from "../shared/selected-page-service";
    import Record from "./Record.vue";
    export default {
        components: { Record },
        computed: { ...mapGetters(['loadRecords']) },
        mounted() { SelectedPageService.getInstance().updateSelectedPage("EventsLog"); },
        methods: {
            onDrawerButtonTap() {
                utils.showDrawer();
            },
            onDelete: function(time) {
                console.log(time);
                this.$store.dispatch("delete", time);
            }
        }
    };
</script>
<style scoped lang="scss">
    @import '../app-variables';
</style>