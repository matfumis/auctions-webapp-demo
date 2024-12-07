const {createApp} = Vue

const app = createApp({

  data() {
    return {
      authenticated: false,
      userInfo: {},
      signinData: {
        username: '',
        password: ''
      },
      signupData: {
        username: '',
        name: '',
        surname: '',
        password: ''
      },
      showLoginForm: false,
    }
  },

  mounted() {
    this.showUserInfo();
  },

  methods: {

    toggleLoginForm() {
      this.showLoginForm = !this.showLoginForm;
    },

    signup: function () {
      fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(this.signupData)
      }).then(async res => {
        const message = await res.text();
        if (res.ok) {
          alert(message);
          // sarà da nascondere il form di sign up e lasciare solo quello di sign in
        } else {
          alert(message);
        }
      }).catch(err => {
        console.log(err);
      })

    },

    signin: function () {
      fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(this.signinData)
      }).then(async res => {
        const message = await res.text();
        if (res.ok) {
          this.authenticated = true;
          this.toggleLoginForm();
          alert(message);
        } else {
          alert(message);
        }
      }).catch(err => {
        console.log(err);
      })
    },

    signout: function () {
      fetch('/api/signout', {
        method: 'GET'
      }).then(async res => {
        const message = await res.text();
        if (res.ok) {
          this.authenticated = false;
          alert(message);
        } else {
          alert(message);
        }
      }).catch(err => {
        console.log(err);
      })
    },

    async showUserInfo() {
      fetch('/api/whoami', {
          method: 'GET',
          credentials: 'include' // Include i cookie nelle richieste
        }).then(async res => {
          if (res.ok) {
            this.authenticated = true;
            this.userInfo = await res.json();
          }
          else{
            this.authenticated = false;
            this.userInfo = {};
          }
      }).catch(err => {
        console.log(err);
      })
    },

  }
});

app.mount('#app');