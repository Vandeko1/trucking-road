<template lang="html">
<GridLayout rows="auto, *" class="sidedrawer sidedrawer-left">
            <StackLayout row="0" class="sidedrawer-header">
                <Label class="sidedrawer-header-image fa" text.decode="&#xf2bd;"></Label>
                <Label class="sidedrawer-header-brand" text="User Name"></Label>
                <Label class="footnote" text="username@mail.com"></Label>
            </StackLayout>        
            <ScrollView row="1" class="sidedrawer-content">
                <StackLayout>
                    <GridLayout columns="auto, *" :class="'sidedrawer-list-item' + (selectedPage === 'Home' ? ' selected': '')" @tap="onNavigationItemTap(Home)">
                        <Label col="0" text.decode="&#xf205;" class="fa"></Label>
                        <Label col="1" text="Статус" class="p-r-10"></Label>
                    </GridLayout>

                    <GridLayout columns="auto, *" :class="'sidedrawer-list-item' + (selectedPage === 'EventsLog' ? ' selected': '')" @tap="onNavigationItemTap(EventsLog)">
                        <Label col="0" text.decode="&#xf02d;" class="fa"></Label>
                        <Label col="1" text="Журнал" class="p-r-10"></Label>
                    </GridLayout>

                    <GridLayout columns="auto, *" :class="'sidedrawer-list-item' + (selectedPage === 'Maps' ? ' selected': '')" @tap="onNavigationItemTap(Maps)">
                        <Label col="0" text.decode="&#xf279;" class="fa"></Label>
                        <Label col="1" text="Карта" class="p-r-10"></Label>
                    </GridLayout>

                    <GridLayout columns="auto, *" :class="'sidedrawer-list-item' + (selectedPage === 'Calendar' ? ' selected': '')" @tap="onNavigationItemTap(Calendar)">
                        <Label col="0" text.decode="&#xf073;" class="fa"></Label>
                        <Label col="1" text="Календар" class="p-r-10"></Label>
                    </GridLayout>
                            
                    <StackLayout class="hr-light"></StackLayout>

                    <GridLayout columns="auto, *" :class="'sidedrawer-list-item' + (selectedPage === 'Settings' ? ' selected': '')" @tap="onNavigationItemTap(Settings)">
                        <Label col="0" text.decode="&#xf013;" class="fa"></Label>
                        <Label col="1" text="Налаштування" class="p-r-10"></Label>
                    </GridLayout>
                    
                    <GridLayout columns="auto, *" :class="'sidedrawer-list-item' + (selectedPage === 'login' ? ' selected': '')" @tap="onNavigationItemTap(Login)">
                        <Label col="0" text.decode="&#xf08b;" class="fa"></Label>
                        <Label col="1" text="Вихід" class="p-r-10"></Label>
                    </GridLayout>

                </StackLayout>
            </ScrollView>
        </GridLayout>
</template>
<script>
    import Home from "./Home";
    import Maps from "./Maps";
    import Calendar from "./Calendar";
    import EventsLog from "./EventsLog";
    import Settings from "./Settings";
    import Login from "./Login";
    import * as utils from "~/shared/utils";
    import SelectedPageService from "~/shared/selected-page-service";
    export default {
        mounted() {
            SelectedPageService.getInstance().selectedPage$
                .subscribe((selectedPage) => this.selectedPage = selectedPage);
        },
        data () {
            return {
                Home: Home,
                Maps: Maps,
                Calendar: Calendar,
                EventsLog: EventsLog,
                Settings: Settings,
                Login: Login,
                selectedPage: ""
            };
        },
        components: {
            Home,
            Maps,
            Calendar,
            EventsLog,
            Settings,
            Login
        },
        methods: {
            onNavigationItemTap(component) {
                this.$navigateTo(component, {
                    clearHistory: true
                });
                utils.closeDrawer();
            }
        }
    };
</script>
<style lang="scss">
    // Custom common variables
    @import '../app-variables';
    // Drawer navigation custom styles
    $sidedrawer-header-image-size: 60;
    $sidedrawer-header-image-offset-top: 20;
    $sidedrawer-header-image-offset-bottom: 5;
    $sidedrawer-list-item-offset-left: 15;
    $sidedrawer-list-icon-offset: 10;
    $sidedrawer-list-icon-size: 20;
    .sidedrawer {
        &.sidedrawer-left {
            background-color: $ab-background;
            .sidedrawer-header-image {
                color: $background-dark;
                height: $sidedrawer-header-image-size;
                width: $sidedrawer-header-image-size;
                font-size: $sidedrawer-header-image-size;
                padding: 0;
                margin-bottom: $sidedrawer-header-image-offset-bottom;
                margin-top: $sidedrawer-header-image-offset-top;
            }
            .footnote {
                color: rgba($ab-color, 0.5);
            }
        }
        .sidedrawer-header {
            background-color: $ab-background;

            .sidedrawer-header-brand {
                color: $ab-color;
            }
        }
        .sidedrawer-content {
            background-color: $side-drawer-background;
        }
        .sidedrawer-list-item {
            padding-left: $sidedrawer-list-item-offset-left;
            Label {
                vertical-align: center;
                color: $blue-dark;
            }
            .fa {
                width: $sidedrawer-list-icon-size;
                margin-right: $sidedrawer-list-icon-offset;
            }
            &.selected {
                background-color: $item-active-background;
                Label {
                    color: $item-active-color;
                }
            }
        }
    }
</style>