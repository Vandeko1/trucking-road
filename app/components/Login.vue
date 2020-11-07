<template>
    <Page class="page">
        <ActionBar class="action-bar">
            <Label class="action-bar-title" text="Логін"></Label>
        </ActionBar>
        <FlexboxLayout class="page">
            <StackLayout class="form">
                <Image class="logo" src="~/components/img/logo.png" />
                <StackLayout class="input-field" marginBottom="25">
                    <TextField v-model="loginTXT" class="input" hint="Login" returnKeyType="Пароль" @returnPress="focusPassword" fontSize="18" />
                    <StackLayout class="hr-light" />
                </StackLayout>
                <StackLayout class="input-field" marginBottom="25">
                    <TextField v-model="password" ref="password" class="input" hint="Password" secure="true" returnKeyType="Готово" fontSize="18" />
                    <StackLayout class="hr-light" />
                </StackLayout>
                <Button text="Логін" @tap="login" class="btn btn-primary m-t-20" />
            </StackLayout>
        </FlexboxLayout>
    </Page>
</template>
<script>
    import { mapGetters } from 'vuex';
    import { TNSFancyAlert, TNSFancyAlertButton } from "nativescript-fancyalert";
    const httpModule = require("tns-core-modules/http");
    import * as utils from "~/shared/utils";
    import * as base64 from "base-64";
    import * as utf8 from "utf8";
    import Home from "@/components/Home";
    export default {
        data() {
            return {
                Home,
                loginTXT: '',
                password: '',
                resp: null
            };
        },
        mounted() {
            this.$store.dispatch("init");
        },
        computed: {
            ...mapGetters(['hash', 'resp'])
        },
        methods: {
            async login() {
                let str = this.loginTXT + ':' + this.password;
                let bytes = utf8.encode(str);
                let formData = base64.encode(bytes);
                await httpModule.request({
                        url: "http://site.com:555/services/hs/empty",
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": "Basic " + formData
                        }
                    })
                    .then((response) => {
                        if (response.statusCode == 200) {
                            return JSON.stringify(response.content);
                        } else {                            
                            TNSFancyAlert.showError(
                                "Помилка доступу",
                                "Введений логін або пароль не вірний.,
                                "Ок"
                            );
                        }
                    }, (e) => {
                        TNSFancyAlert.showError(
                            "Немає відповіді",
                            "Перевірте з'єднання",
                            "Ok"
                        );
                    })
                    .then((r) => {
                        let result = JSON.parse(r);
                        result.status = JSON.parse(result.status);
                        this.$store.dispatch('addHash', formData);
                        this.$store.dispatch('addResp', result);
                        this.$navigateTo(Home);
                    })
                    .catch((err) => {});
            },
            focusPassword() {
                this.$refs.password.nativeView.focus();
            }
        }
    };
</script>
<style scoped>
    .page {
        align-items: center;
        flex-direction: column;
    }
    .form {
        margin-left: 30;
        margin-right: 30;
        flex-grow: 2;
        vertical-align: middle;
    }
    .logo {
        margin-bottom: 12;
        height: 90;
        font-weight: bold;
    }
    .header {
        horizontal-align: center;
        font-size: 25;
        font-weight: 600;
        margin-bottom: 70;
        text-align: center;
        color: #D51A1A;
    }
    .input-field { margin-bottom: 15; }
    .input {
        font-size: 18;
        placeholder-color: #A8A8A8;
    }
    .input-field .input { font-size: 54; }
    .btn-primary {
        height: 50;
        margin: 30 5 15 5;
        background-color: #D51A1A;
        border-radius: 5;
        font-size: 20;
        font-weight: 600;
    }
    .login-label {
        horizontal-align: center;
        color: #A8A8A8;
        font-size: 16;
    }
    .sign-up-label { margin-bottom: 20; }
    .bold { color: #000000; }
</style>