<template>
	<Page class="page">
	   <ActionBar class="action-bar">
            <NavigationButton ios:visibility="collapsed" icon="res://menu" @tap="onDrawerButtonTap"></NavigationButton>
            <ActionItem icon="res://navigation/menu" 
                android:visibility="collapsed" 
                @tap="onDrawerButtonTap"
                ios.position="left">
            </ActionItem>
            <Label class="action-bar-title" text="Логін"></Label>
        </ActionBar>
		<FlexboxLayout class="page">
			<StackLayout class="form">
				<Image class="logo" src="~/components/img/logo.png" />

				<StackLayout class="input-field" marginBottom="25">
					<TextField v-model="loginTXT" class="input" hint="Login" returnKeyType="next" @returnPress="focusPassword" fontSize="18" />
					<StackLayout class="hr-light" />
				</StackLayout>

				<StackLayout class="input-field" marginBottom="25">
					<TextField v-model="password" ref="password" class="input" hint="Password" secure="true" :returnKeyType="isLoggingIn ? 'done' : 'next'"
					 @returnPress="focusConfirmPassword" fontSize="18" />
					<StackLayout class="hr-light" />
				</StackLayout>

				<StackLayout v-show="!isLoggingIn" class="input-field">
					<TextField ref="confirmPassword" class="input" hint="Confirm password" secure="true" v-model="user.confirmPassword" returnKeyType="done"
					 fontSize="18" />
					<StackLayout class="hr-light" />
				</StackLayout>

				<Button :text="isLoggingIn ? 'Логін' : 'Реєстрація'" @tap="login" class="btn btn-primary m-t-20" />
				<Label v-show="isLoggingIn" text="Забули ваш пароль?" class="login-label" @tap="forgotPassword" />
			</StackLayout>

			<Label class="login-label sign-up-label" @tap="toggleForm">
	          <FormattedString>
	            <Span :text="isLoggingIn ? 'Немає акаунту? ' : 'Назад до Логіну'" />
	            <Span :text="isLoggingIn ? 'Реєстрація' : ''" class="bold" />
	          </FormattedString>
	        </Label>
		</FlexboxLayout>
	</Page>
</template>
<script>
    import * as utils from "~/shared/utils";
    import * as  base64 from "base-64";
    import * as utf8 from "utf8";
    import SelectedPageService from "../shared/selected-page-service"; 
    import Home from "@/components/Home"; 
    const userService = {
    register(user) {
            return Promise.resolve(user);
        },
    //    login(user) {
    //        return Promise.resolve(user);
    //    },
        resetPassword(email) {
            return Promise.resolve(email);
        }
    };

// A stub for the main page of your app. In a real app you’d put this page in its own .vue file.
const HomePage = {template: `
<Page>
	<Label class="m-20" textWrap="true" text="Ви успішно пройшли автентифікацію. Тут ви створюєте основні функції програми."></Label>
</Page>`};
export default {
    data() {
        return {
            Home,
            loginTXT: '',
            password: '',
            
            isLoggingIn: true,
            user: {
                email: "driver@gmail.com",
                password: "1234",
                confirmPassword: "1234"
            }
        };
    },
    mounted() {
        SelectedPageService.getInstance().updateSelectedPage("Login");
    },
    methods: {
        onDrawerButtonTap() {
            utils.showDrawer();
        }, 
        toggleForm() {
            this.isLoggingIn = !this.isLoggingIn;
        },

        submit() {
            if (!this.user.email || !this.user.password) {
                this.alert( "Введіть електронну адресу та пароль." );
                return;
            }
            if (this.isLoggingIn) {
                this.login();
            } else {
                this.register();
            }
        },
//        login() {
//            userService
//                .login(this.user)
//                .then(() => {
//                    this.$navigateTo(HomePage);
//                })
//                .catch(() => {
//                    this.alert("На жаль, ми не змогли знайти ваш акаунт.");
//                });
//        },

        async login() {
            let str = this.loginTXT + ':' + this.password;
            let bytes = utf8.encode(str);
            let formData = base64.encode(bytes);            
            console.log(formData+'===formdata FROM LOGIN AND PASS===');
            try {
                await this.$store.dispatch('addNote', formData);/*{ text: formData }*/
                console.log('<--TAP LOGIN-->');
                this.$navigateTo(Home);
            } catch (e) {console.log('помилка в блоці відправки хешу')};    
        }, 
        
        register() {
            if (this.user.password != this.user.confirmPassword) {
                this.alert("Ваші паролі не збігаються.");
                return;
            }

            userService
                .register(this.user)
                .then(() => {
                    this.alert("Ваш рахунок успішно створено.");
                    this.isLoggingIn = true;
                })
                .catch(() => {
                    this.alert( "На жаль, нам не вдалося створити ваш обліковий запис." );
                });
        },

        forgotPassword() {
            prompt({
                title: "Forgot Password",
                message:
                    "Введіть адресу електронної пошти, яку ви використовували для реєстрації в VXroad, щоб скинути пароль.",
                inputType: "email",
                defaultText: "",
                okButtonText: "Ok",
                cancelButtonText: "Cancel"
            }).then(data => {
                if (data.result) {
                    userService
                        .resetPassword(data.text.trim())
                        .then(() => {
                            this.alert(
                                "Ваш пароль було успішно скинуто. Будь ласка, перевірте свій електронний лист, щоб отримати інструкції щодо вибору нового пароля."
                            );
                        })
                        .catch(() => {
                            this.alert(
                                "На жаль, сталася помилка скидання пароля."
                            );
                        });
                }
            });
        },

        focusPassword() {
            this.$refs.password.nativeView.focus();
        },
        focusConfirmPassword() {
            if (!this.isLoggingIn) {
                this.$refs.confirmPassword.nativeView.focus();
            }
        },

        alert(message) {
            return alert({
                title: "VXroad",
                okButtonText: "OK",
                message: message
            });
        }
    }
};
</script>
<style scoped>
    page {}
	.page {align-items: center;
		flex-direction: column;}
	.form {margin-left: 30;
		margin-right: 30;
		flex-grow: 2;
		vertical-align: middle;}
	.logo {margin-bottom: 12;
		height: 90;
		font-weight: bold;}
	.header {horizontal-align: center;
		font-size: 25;
		font-weight: 600;
		margin-bottom: 70;
		text-align: center;
		color: #D51A1A;}
	.input-field {margin-bottom: 15;/*25*/}
	.input {font-size: 18;
		placeholder-color: #A8A8A8;}
	.input-field .input {font-size: 54;}
	.btn-primary {height: 50;
		margin: 30 5 15 5;
		background-color: #D51A1A;
		border-radius: 5;
		font-size: 20;
		font-weight: 600;}
	.login-label {horizontal-align: center;
		color: #A8A8A8;
		font-size: 16;}
	.sign-up-label {margin-bottom: 20;}
	.bold {color: #000000;}
</style>
